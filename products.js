/* ============================================================
   MENUKAART — Restaurant Cuppen
   Beheer hier de dranken en gerechten die gasten kunnen bestellen.

   - id:       interne code, moet uniek zijn, geen spaties
   - name:     naam zoals gasten die zien
   - emoji:    icoon op de kaart
   - category: bepaalt onder welk kopje het product staat
               (moet overeenkomen met een id uit CATEGORIES hieronder)
   - orderable: optioneel, standaard true. Zet op false voor een
               product dat wel op de voorraadpagina moet staan maar
               niet zelf besteld kan worden (zoals "IJsklontjes"
               hieronder — dat is een ingrediënt, geen drankje).

   Voeg een regel toe (of verwijder er een) om het aanbod te
   wijzigen — de rest van de site werkt dit automatisch bij.
   De VOLGORDE van CATEGORIES hieronder bepaalt de volgorde van de
   kopjes op de bestel- en voorraadpagina. Binnen een categorie
   bepaalt de volgorde in MENU de volgorde op de kaart.

   IJSKLONTJES
   Categorieën met "hasIce: true" krijgen automatisch een keuze
   "met/zonder ijs" per apart drankje in de winkelwagen (nu alleen
   bij "Frisdrank"). Zet het product "ijsklontjes" hieronder op
   uitverkocht via de voorraadpagina om deze keuze overal tijdelijk
   uit te schakelen — gasten bestellen dan gewoon zonder ijskeuze.
   ============================================================ */

const CATEGORIES = [
  { id: "vlaai",       label: "Vlaai" },
  { id: "warme_drank", label: "Warme Dranken" },
  { id: "drank",       label: "Frisdrank", hasIce: true },
  { id: "bier_wijn",   label: "Bier & Wijn" },
  { id: "ijs",         label: "IJs" },
];

const MENU = [
  // --- Vlaai ---
  { id: "appellinzenvlaai",     name: "Appellinzenvlaai",        emoji: "🍰", category: "vlaai" },
  { id: "boterkersenvlaai",     name: "Boterkersenvlaai",        emoji: "🍰", category: "vlaai" },
  { id: "aardbeienvlaai",       name: "Aardbeienvlaai",          emoji: "🍰", category: "vlaai" },
  { id: "rijstenvlaai",         name: "Rijstenvlaai",            emoji: "🍰", category: "vlaai" },
  { id: "abrikozenvlaai",       name: "Abrikozenvlaai",          emoji: "🍰", category: "vlaai" },

  // --- Warme Dranken ---
  { id: "koffie",         name: "Koffie",            emoji: "☕", category: "warme_drank" },
  { id: "thee",           name: "Thee",              emoji: "☕", category: "warme_drank" },

  // --- Dranken (hier geldt de ijskeuze) ---
  { id: "cola",           name: "Cola",              emoji: "🥤", category: "drank" },
  { id: "water",          name: "Water",             emoji: "💧", category: "drank" },
  { id: "crystalclearap", name: "Crystal clear Appel/Peer", emoji: "🍎", category: "drank" },
  { id: "crystalcleara",  name: "Crystal clear Aardbeien", emoji: "🍓", category: "drank" },
  { id: "crystalclearc",  name: "Crystal clear Citroen", emoji: "🍋", category: "drank" },
  { id: "iceteag",        name: "Ice Tea Green",     emoji: "🥤", category: "drank" },
  { id: "iceteas",        name: "Ice Tea Sparkling", emoji: "🥤", category: "drank" },
  { id: "appelsap",       name: "Appelsap",          emoji: "🍎", category: "drank" },
  { id: "ranja",          name: "Ranja",             emoji: "🧃", category: "drank" },

  // --- Bier & Wijn ---
  { id: "radler0",        name: "Radler 0.0%",          emoji: "🍺", category: "bier_wijn" },
  { id: "radlerc",        name: "Radler Citroen",       emoji: "🍺", category: "bier_wijn" },
  { id: "hertogjan",      name: "Hertog Jan",           emoji: "🍻", category: "bier_wijn" },
  { id: "hertogjana",     name: "Hertogjan Alcolvrij",  emoji: "🍺", category: "bier_wijn" },
  { id: "liefmans",       name: "Liefmans",             emoji: "🍻", category: "bier_wijn" },    
  { id: "speciaalbier",   name: "Speciaal Bier",        emoji: "🍻", category: "bier_wijn" },
  { id: "classicwijn",    name: "Classic Wijn",         emoji: "🍾", category: "bier_wijn" },
  { id: "rose",           name: "Rosé",                 emoji: "🍷", category: "bier_wijn" },
  { id: "wittewijn",      name: "Witte Wijn",           emoji: "🥂", category: "bier_wijn" },

  // --- IJs (geen drankje — alleen te beheren via de voorraadpagina) ---
  { id: "ijsklontjes",    name: "IJsklontjes",       emoji: "🧊", category: "ijs", orderable: false },
];
