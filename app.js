/* ============================================================
   Restaurant Cuppen — Bestelsysteem
   Dit bestand hoef je nooit aan te passen. Alle instellingen
   komen uit config.js (naam, Firebase) en products.js (menukaart).
   Bewaar de scriptvolgorde in index.html:
   firebase SDK's -> config.js -> products.js -> dit bestand.

   Status van een bestelling doorloopt:
   nieuw -> bereiding -> klaar -> (verwijderd zodra "bezorgd" is aangevinkt)
   ============================================================ */

const state = {
  page: 'home',          // 'home' | 'bestellen' | 'keuken'
  cart: {},              // { drinkId: aantal }
  orderOpmerking: '',
  showReady: false,      // toont/verbergt "Bereide bestellingen" paneel
  kitchenOrders: [],     // alle actieve bestellingen, voor de keukenpagina
  readyOrders: [],       // bestellingen met status 'klaar', voor de bestelpagina
  connected: false,
};

let kitchenListener = null;
let readyListener = null;
let db = null;
let ordersRef = null;
let CONFIG_IS_PLACEHOLDER = true;
let firebaseInitError = null;

/* ---------------- Firebase koppelen ----------------
   Dit staat in een try/catch zodat een verkeerde of ontbrekende
   config.js de rest van de site niet met zich meesleurt: de
   pagina's blijven altijd zichtbaar, met een duidelijke melding. */
try{
  CONFIG_IS_PLACEHOLDER = (typeof firebaseConfig === 'undefined') || firebaseConfig.apiKey === "AIzaSyDIlcs1YlMrcR2_Tzl1sSKTxQd9hWUZr6s";
  if(!CONFIG_IS_PLACEHOLDER){
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    ordersRef = db.ref('orders');
  }
}catch(e){
  firebaseInitError = e;
  console.error('Firebase kon niet worden gestart:', e);
}

function app(){ return document.getElementById('app'); }

function timeLabel(ts){
  const d = new Date(ts);
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

function showToast(msg, isError){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.className = isError ? 'show error' : 'show';
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(()=>{ t.className = ''; }, 2600);
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function pulseElement(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.remove('pulse');
  void el.offsetWidth; // forceer reflow zodat de animatie opnieuw start
  el.classList.add('pulse');
}

/* ---------------- navigatie ---------------- */

function stopListeners(){
  if(ordersRef && kitchenListener){ ordersRef.off('value', kitchenListener); kitchenListener = null; }
  if(ordersRef && readyListener){ ordersRef.off('value', readyListener); readyListener = null; }
}

function goHome(){
  stopListeners();
  state.page = 'home';
  render();
}

function goBestellen(){
  stopListeners();
  state.page = 'bestellen';
  state.cart = {};
  state.orderOpmerking = '';
  state.showReady = false;
  render();
  if(!ordersRef) return;

  readyListener = ordersRef.on('value', snapshot => {
    const val = snapshot.val() || {};
    state.readyOrders = Object.keys(val)
      .map(key => ({ ...val[key], id: key }))
      .filter(o => o.status === 'klaar')
      .sort((a,b) => a.timestamp - b.timestamp);
    state.connected = true;
    render();
  }, () => {
    state.connected = false;
    render();
  });
}

function goKeuken(){
  stopListeners();
  state.page = 'keuken';
  render();
  if(!ordersRef) return;

  kitchenListener = ordersRef.on('value', snapshot => {
    const val = snapshot.val() || {};
    state.kitchenOrders = Object.keys(val)
      .map(key => ({ ...val[key], id: key }))
      .sort((a,b) => a.timestamp - b.timestamp);
    state.connected = true;
    render();
  }, () => {
    state.connected = false;
    showToast('Kon geen verbinding maken met de database', true);
    render();
  });
}

/* ---------------- bestellen: winkelwagen ---------------- */

function cartCount(){
  return Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
}

function cartItems(){
  return Object.keys(state.cart).map(id => {
    const menuItem = MENU.find(m => m.id === id);
    return { drinkId: id, drinkName: menuItem.name, emoji: menuItem.emoji, amount: state.cart[id] };
  });
}

function addToCart(id, delta){
  const current = state.cart[id] || 0;
  const next = Math.max(0, Math.min(20, current + delta));
  if(next === 0) delete state.cart[id];
  else state.cart[id] = next;
  render();
  if(delta > 0) pulseElement('cartBadge');
}

function removeFromCart(id){
  delete state.cart[id];
  render();
}

function onOpmerkingInput(el){ state.orderOpmerking = el.value; }

function toggleReadyPanel(){
  state.showReady = !state.showReady;
  render();
}

async function submitOrder(){
  if(cartCount() === 0) return;
  if(!ordersRef){
    showToast('Firebase is nog niet ingesteld — controleer config.js', true);
    return;
  }
  const btn = document.getElementById('submitBtn');
  if(btn){ btn.disabled = true; btn.textContent = 'Versturen...'; }

  const order = {
    items: cartItems(),
    opmerking: state.orderOpmerking.trim(),
    status: 'nieuw',
    timestamp: Date.now(),
  };

  try{
    await ordersRef.push(order);
    showToast('Bestelling verzonden naar de keuken');
    state.cart = {};
    state.orderOpmerking = '';
    render();
  }catch(e){
    showToast('Kon bestelling niet verzenden, probeer opnieuw', true);
    if(btn){ btn.disabled = false; btn.textContent = 'Bestelling verzenden'; }
  }
}

/* ---------------- bestellen: bezorgd afvinken ---------------- */

function markDelivered(orderId){
  const el = document.getElementById('ready-' + orderId);
  if(el) el.classList.add('leaving');
  setTimeout(async () => {
    if(!db) return;
    try{
      await db.ref('orders/' + orderId).remove();
    }catch(e){
      showToast('Kon niet als bezorgd markeren, probeer opnieuw', true);
    }
  }, 220);
}

/* ---------------- keuken ---------------- */

async function startBereiden(orderId){
  if(!db) return;
  try{
    await db.ref('orders/' + orderId).update({ status: 'bereiding' });
  }catch(e){
    showToast('Kon bestelling niet bijwerken, probeer opnieuw', true);
  }
}

async function markReady(orderId){
  if(!db) return;
  try{
    await db.ref('orders/' + orderId).update({ status: 'klaar' });
  }catch(e){
    showToast('Kon bestelling niet bijwerken, probeer opnieuw', true);
  }
}

/* ---------------- render: gedeeld ---------------- */

function topbar(){
  return `
    <div class="topbar">
      <div class="brand" onclick="goHome()" role="button" tabindex="0">
        <span class="badge">C</span>
        <div class="brand-text">
          <h1>${escapeHtml(APP_NAME)}</h1>
          <span class="brand-sub">Restaurant</span>
        </div>
      </div>
      <div class="pill-nav">
        <button class="${state.page==='bestellen'?'active':''}" onclick="goBestellen()">Bestellen</button>
        <button class="${state.page==='keuken'?'active':''}" onclick="goKeuken()">Keuken</button>
      </div>
    </div>`;
}

function ornament(){
  return `<div class="ornament"><span class="oline"></span><span class="odiamond"></span><span class="oline right"></span></div>`;
}

function configWarning(){
  if(firebaseInitError){
    return `
      <div class="config-warning">
        <b>Firebase kon niet worden gestart.</b><br>
        Controleer de gegevens in <code>config.js</code>.<br>
        Foutmelding: <code>${escapeHtml(firebaseInitError.message || String(firebaseInitError))}</code>
      </div>`;
  }
  if(!CONFIG_IS_PLACEHOLDER) return '';
  return `
    <div class="config-warning">
      <b>Firebase nog niet gekoppeld.</b><br>
      Vul in <code>config.js</code> je eigen Firebase-projectgegevens in en zorg dat
      <b>Realtime Database</b> is aangemaakt in de Firebase Console, anders werkt bestellen/keuken niet.
    </div>`;
}

/* ---------------- render: home ---------------- */

function renderHome(){
  return `
    ${topbar()}
    <main>
      <div class="home">
        <div class="eyebrow">Welkom bij</div>
        <h2 class="serif">${escapeHtml(APP_NAME)}</h2>
        ${ornament()}
        <p class="sub">Waar wilt u naartoe?</p>
        <div class="choice-grid">
          <div class="choice-card shimmer" onclick="goBestellen()" role="button" tabindex="0">
            <span class="icon">🍽</span>
            <h3>Bestellen</h3>
            <p>Stel je bestelling samen uit meerdere dranken en stuur 'm in één keer naar de keuken.</p>
            <div class="go">Bekijk de kaart →</div>
          </div>
          <div class="choice-card shimmer" onclick="goKeuken()" role="button" tabindex="0">
            <span class="icon">🔔</span>
            <h3>Keuken</h3>
            <p>Bekijk binnenkomende bestellingen live en werk de status bij.</p>
            <div class="go">Open keuken →</div>
          </div>
        </div>
        ${configWarning()}
      </div>
    </main>`;
}

/* ---------------- render: bestellen ---------------- */

function renderReadyPanel(){
  if(!state.showReady) return '';
  const orders = state.readyOrders;
  return `
    <div class="ready-panel">
      ${orders.length === 0
        ? `<div class="ready-empty">Nog geen bestellingen klaar om te bezorgen</div>`
        : orders.map(o => {
            const itemsLabel = o.items.map(it => `${it.amount}× ${it.drinkName}`).join(', ');
            return `
              <div class="ready-card" id="ready-${o.id}">
                <div class="ready-info">
                  <div class="ready-items">${escapeHtml(itemsLabel)}</div>
                  <div class="ready-time">Klaar sinds ${timeLabel(o.timestamp)}${o.opmerking ? ' · "' + escapeHtml(o.opmerking) + '"' : ''}</div>
                </div>
                <button class="deliver-btn" onclick="markDelivered('${o.id}')">✓ Bezorgd</button>
              </div>`;
          }).join('')}
    </div>`;
}

function renderBestellen(){
  const count = cartCount();
  const items = cartItems();

  return `
    ${topbar()}
    <main>
      <div class="order-wrap">
        <div class="heading">
          <div class="eyebrow">De kaart</div>
          <h2 class="serif">Dranken</h2>
        </div>
        ${ornament()}

        <div class="ready-toggle-wrap">
          <div class="ready-toggle ${state.showReady ? 'open' : ''}" onclick="toggleReadyPanel()" role="button" tabindex="0">
            <span>Bereide bestellingen</span>
            <span class="rt-badge" id="readyBadge">${state.readyOrders.length}</span>
            <span class="rt-chevron">⌄</span>
          </div>
        </div>
        ${renderReadyPanel()}

        <div class="menu-list">
          ${MENU.map(d => `
            <div class="menu-row">
              <span class="emoji">${d.emoji}</span>
              <span class="name serif">${escapeHtml(d.name)}</span>
              <span class="leader"></span>
              <div class="row-stepper">
                <button onclick="addToCart('${d.id}', -1)" ${!(state.cart[d.id]) ? 'disabled' : ''} aria-label="Minder">−</button>
                <span class="rs-qty">${state.cart[d.id] || 0}</span>
                <button onclick="addToCart('${d.id}', 1)" aria-label="Meer">+</button>
              </div>
            </div>`).join('')}
        </div>

        ${count > 0 ? `
          <div class="cart-card">
            <h3>Jouw bestelling <span id="cartBadge">(${count})</span></h3>
            <div class="cart-items">
              ${items.map(it => `
                <div class="cart-item">
                  <span class="ci-name">${it.emoji} ${escapeHtml(it.drinkName)}</span>
                  <span class="ci-qty">×${it.amount}</span>
                  <button class="ci-remove" onclick="removeFromCart('${it.drinkId}')" aria-label="Verwijderen">✕</button>
                </div>`).join('')}
            </div>
            <span class="field-label">Opmerking (optioneel)</span>
            <textarea placeholder="bv. extra ijs, geen rietje..." oninput="onOpmerkingInput(this)">${escapeHtml(state.orderOpmerking)}</textarea>
            <button id="submitBtn" class="submit-btn shimmer" onclick="submitOrder()">Bestelling verzenden (${count})</button>
          </div>` : ''}

        ${configWarning()}
      </div>
    </main>`;
}

/* ---------------- render: keuken ---------------- */

function ticketHtml(o, kind){
  const btn = kind === 'nieuw'
    ? `<button class="ticket-btn start shimmer" onclick="startBereiden('${o.id}')">Start bereiden →</button>`
    : `<button class="ticket-btn finish" onclick="markReady('${o.id}')">✓ Klaar</button>`;
  const itemsHtml = (o.items || []).map(it => `
    <div class="ticket-item-row">
      <span class="emoji">${it.emoji}</span>
      <span class="tname">${escapeHtml(it.drinkName)}</span>
      <span class="tqty">×${it.amount}</span>
    </div>`).join('');
  return `
    <div class="ticket">
      <div class="ticket-num">#${o.id.slice(-5).toUpperCase()}</div>
      <div class="ticket-items">${itemsHtml}</div>
      ${o.opmerking ? `<div class="ticket-note">"${escapeHtml(o.opmerking)}"</div>` : ''}
      <div class="ticket-time">Besteld om ${timeLabel(o.timestamp)}</div>
      ${btn}
    </div>`;
}

function renderKeuken(){
  const nieuw = state.kitchenOrders.filter(o => o.status === 'nieuw');
  const bereiding = state.kitchenOrders.filter(o => o.status === 'bereiding');
  const openstaand = nieuw.length + bereiding.length;

  return `
    ${topbar()}
    <main>
      <div class="kitchen-wrap">
        <div class="kitchen-head">
          <h2 class="serif">Keuken</h2>
          <span class="live-badge ${state.connected ? '' : 'offline'}">
            <span class="live-dot"></span>${state.connected ? 'LIVE — ' + openstaand + ' openstaand' : 'NIET VERBONDEN'}
          </span>
        </div>
        ${(CONFIG_IS_PLACEHOLDER || firebaseInitError) ? configWarning() : `
          <div class="board">
            <div>
              <div class="column-head">
                <h3>Nieuw</h3>
                <span class="column-count ${nieuw.length===0?'empty':''}">${nieuw.length}</span>
              </div>
              <div class="ticket-col">
                ${nieuw.length === 0
                  ? `<div class="empty-col">Geen nieuwe bestellingen</div>`
                  : nieuw.map(o => ticketHtml(o, 'nieuw')).join('')}
              </div>
            </div>
            <div>
              <div class="column-head">
                <h3>In bereiding</h3>
                <span class="column-count ${bereiding.length===0?'empty':''}">${bereiding.length}</span>
              </div>
              <div class="ticket-col">
                ${bereiding.length === 0
                  ? `<div class="empty-col">Nog niets in bereiding</div>`
                  : bereiding.map(o => ticketHtml(o, 'bereiding')).join('')}
              </div>
            </div>
          </div>
          <p class="kitchen-hint">
            Zodra een bestelling op "✓ Klaar" wordt gezet, verschijnt hij bij de gast onder "Bereide bestellingen" om af te vinken als bezorgd.
          </p>`}
      </div>
    </main>`;
}

/* ---------------- render ---------------- */

function render(){
  let html = '';
  try{
    if(state.page === 'home') html = renderHome();
    else if(state.page === 'bestellen') html = renderBestellen();
    else if(state.page === 'keuken') html = renderKeuken();
    app().innerHTML = `<div class="page-fade">${html}</div>`;
  }catch(e){
    console.error('Renderfout:', e);
    app().innerHTML = `
      <div class="fatal-error">
        <span class="icon">⚠️</span>
        <h2 class="serif">Er ging iets mis</h2>
        <p>De pagina kon niet worden getekend. Ververs de pagina, en controleer <code>config.js</code> als het probleem blijft terugkomen.</p>
        <p><code>${escapeHtml(e.message || String(e))}</code></p>
      </div>`;
  }
}

/* Vangnet: als er ergens een onverwachte fout optreedt die niet is
   afgevangen, blijft het scherm nooit leeg — er verschijnt altijd
   een duidelijke melding in plaats van een zwart scherm. */
window.addEventListener('error', (event) => {
  if(app() && app().innerHTML.trim() === ''){
    app().innerHTML = `
      <div class="fatal-error">
        <span class="icon">⚠️</span>
        <h2 class="serif">Kon de site niet laden</h2>
        <p>Er trad een scriptfout op. Controleer of alle bestanden (index.html, style.css, config.js, app.js) correct en onbeschadigd zijn geüpload.</p>
        <p><code>${escapeHtml(event.message || 'Onbekende fout')}</code></p>
      </div>`;
  }
});

render();
