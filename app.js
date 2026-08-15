/* ============================================================
   Restaurant Cuppen — Bestelsysteem
   Leest zijn instellingen (firebaseConfig, MENU, APP_NAME) uit config.js.
   Bewaar de volgorde van scripts in index.html: firebase SDK's,
   dan config.js, dan dit bestand.
   ============================================================ */

const CONFIG_IS_PLACEHOLDER = firebaseConfig.apiKey === "JOUW_API_KEY";

let db = null;
let ordersRef = null;
if (!CONFIG_IS_PLACEHOLDER) {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  ordersRef = db.ref('orders');
}

const state = {
  page: 'home',        // 'home' | 'bestellen' | 'keuken'
  selectedDrink: null,
  amount: 1,
  opmerking: '',
  orders: [],           // alle actieve bestellingen (status: nieuw | bereiding)
  connected: false,
};

let kitchenListener = null;

function app(){ return document.getElementById('app'); }

function timeLabel(ts){
  const d = new Date(ts);
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

function showToast(msg, isError){
  const t = document.getElementById('toast');
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

/* ---------------- navigatie ---------------- */

function stopKitchenListener(){
  if(ordersRef && kitchenListener){
    ordersRef.off('value', kitchenListener);
    kitchenListener = null;
  }
}

function goHome(){ stopKitchenListener(); state.page='home'; state.selectedDrink=null; render(); }

function goBestellen(){
  stopKitchenListener();
  state.page = 'bestellen';
  state.selectedDrink = null;
  state.amount = 1;
  state.opmerking = '';
  render();
}

function goKeuken(){
  stopKitchenListener();
  state.page = 'keuken';
  render();
  if(!ordersRef) return;

  kitchenListener = ordersRef.on('value', snapshot => {
    const val = snapshot.val() || {};
    state.orders = Object.keys(val)
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

/* ---------------- bestellen ---------------- */

function selectDrink(id){
  state.selectedDrink = MENU.find(d => d.id === id);
  state.amount = 1;
  state.opmerking = '';
  render();
}

function backToMenu(){ state.selectedDrink = null; render(); }

function changeAmount(delta){
  state.amount = Math.max(1, Math.min(20, state.amount + delta));
  const el = document.getElementById('amountDisplay');
  if(el) el.textContent = state.amount;
}

function onOpmerkingInput(el){ state.opmerking = el.value; }

async function submitOrder(){
  if(!state.selectedDrink) return;
  if(!ordersRef){
    showToast('Firebase is nog niet ingesteld — vul config.js in', true);
    return;
  }
  const btn = document.getElementById('submitBtn');
  if(btn){ btn.disabled = true; btn.textContent = 'Versturen...'; }

  const order = {
    drinkId: state.selectedDrink.id,
    drinkName: state.selectedDrink.name,
    emoji: state.selectedDrink.emoji,
    amount: state.amount,
    opmerking: state.opmerking.trim(),
    status: 'nieuw',
    timestamp: Date.now(),
  };

  try{
    await ordersRef.push(order);
    showToast('Bestelling verzonden naar de keuken');
    state.selectedDrink = null;
    state.amount = 1;
    state.opmerking = '';
    render();
  }catch(e){
    showToast('Kon bestelling niet verzenden, probeer opnieuw', true);
    if(btn){ btn.disabled = false; btn.textContent = 'Bestelling verzenden'; }
  }
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

async function finishOrder(orderId){
  if(!db) return;
  try{
    await db.ref('orders/' + orderId).remove();
  }catch(e){
    showToast('Kon bestelling niet afronden, probeer opnieuw', true);
  }
}

/* ---------------- render: gedeeld ---------------- */

function topbar(){
  return `
    <div class="topbar">
      <div class="brand" onclick="goHome()" role="button" tabindex="0">
        <span class="badge">C</span>
        <div class="brand-text">
          <h1>${APP_NAME}</h1>
          <span class="brand-sub">Restaurant</span>
        </div>
      </div>
      <div class="pill-nav">
        <button class="${state.page==='bestellen'?'active':''}" onclick="goBestellen()">Bestellen</button>
        <button class="${state.page==='keuken'?'active':''}" onclick="goKeuken()">Keuken</button>
      </div>
    </div>`;
}

function configWarning(){
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
        <h2 class="serif">${APP_NAME}</h2>
        <div class="rule"></div>
        <p class="sub">Waar wilt u naartoe?</p>
        <div class="choice-grid">
          <div class="choice-card" onclick="goBestellen()" role="button" tabindex="0">
            <span class="icon">🍽</span>
            <h3>Bestellen</h3>
            <p>Kies een drankje van de kaart, geef een hoeveelheid en eventueel een opmerking door.</p>
            <div class="go">Bekijk de kaart →</div>
          </div>
          <div class="choice-card" onclick="goKeuken()" role="button" tabindex="0">
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

function renderBestellen(){
  if(!state.selectedDrink){
    return `
      ${topbar()}
      <main>
        <div class="order-wrap">
          <div class="heading">
            <div class="eyebrow">De kaart</div>
            <h2 class="serif">Dranken</h2>
          </div>
          <div class="menu-list">
            ${MENU.map(d => `
              <div class="menu-row" onclick="selectDrink('${d.id}')" role="button" tabindex="0">
                <span class="emoji">${d.emoji}</span>
                <span class="name serif">${d.name}</span>
                <span class="leader"></span>
                <span class="arrow">→</span>
              </div>`).join('')}
          </div>
          ${configWarning()}
        </div>
      </main>`;
  }

  const d = state.selectedDrink;
  return `
    ${topbar()}
    <main>
      <div class="order-wrap">
        <div class="detail-card">
          <button class="back-link" onclick="backToMenu()">← Terug naar de kaart</button>
          <div class="detail-top">
            <span class="emoji">${d.emoji}</span>
            <h3 class="serif">${d.name}</h3>
          </div>
          <span class="field-label">Hoeveelheid</span>
          <div class="stepper">
            <button onclick="changeAmount(-1)" aria-label="Minder">−</button>
            <span id="amountDisplay">${state.amount}</span>
            <button onclick="changeAmount(1)" aria-label="Meer">+</button>
          </div>
          <span class="field-label">Opmerking (optioneel)</span>
          <textarea placeholder="bv. extra ijs, geen rietje..." oninput="onOpmerkingInput(this)">${state.opmerking}</textarea>
          <button id="submitBtn" class="submit-btn" onclick="submitOrder()">Bestelling verzenden</button>
        </div>
      </div>
    </main>`;
}

/* ---------------- render: keuken ---------------- */

function ticketHtml(o, kind){
  const btn = kind === 'nieuw'
    ? `<button class="ticket-btn start" onclick="startBereiden('${o.id}')">Start bereiden →</button>`
    : `<button class="ticket-btn finish" onclick="finishOrder('${o.id}')">✓ Bestelling klaar</button>`;
  return `
    <div class="ticket">
      <div class="ticket-num">#${o.id.slice(-5).toUpperCase()}</div>
      <div class="ticket-main">
        <span class="emoji">${o.emoji}</span>
        <h4 class="serif">${o.drinkName}</h4>
        <span class="qty serif">×${o.amount}</span>
      </div>
      ${o.opmerking ? `<div class="ticket-note">"${escapeHtml(o.opmerking)}"</div>` : ''}
      <div class="ticket-time">Besteld om ${timeLabel(o.timestamp)}</div>
      ${btn}
    </div>`;
}

function renderKeuken(){
  const nieuw = state.orders.filter(o => o.status === 'nieuw');
  const bereiding = state.orders.filter(o => o.status === 'bereiding');
  const totaal = state.orders.length;

  return `
    ${topbar()}
    <main>
      <div class="kitchen-wrap">
        <div class="kitchen-head">
          <h2 class="serif">Keuken</h2>
          <span class="live-badge ${state.connected ? '' : 'offline'}">
            <span class="live-dot"></span>${state.connected ? 'LIVE — ' + totaal + ' openstaand' : 'NIET VERBONDEN'}
          </span>
        </div>
        ${CONFIG_IS_PLACEHOLDER ? configWarning() : `
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
          </div>`}
      </div>
    </main>`;
}

/* ---------------- render ---------------- */

function render(){
  if(state.page === 'home') app().innerHTML = renderHome();
  else if(state.page === 'bestellen') app().innerHTML = renderBestellen();
  else if(state.page === 'keuken') app().innerHTML = renderKeuken();
}

render();
