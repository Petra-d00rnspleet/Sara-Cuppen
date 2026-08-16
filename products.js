/* ============================================================
   MENUKAART — Restaurant Cuppen
   Beheer hier de dranken en gerechten die gasten kunnen bestellen.

   - id:       interne code, moet uniek zijn, geen spaties
   - name:     naam zoals gasten die zien
   - emoji:    icoon op de kaart
   - category: bepaalt onder welk kopje het product staat
               (moet overeenkomen met een id uit CATEGORIES hieronder)

   Voeg een regel toe (of verwijder er een) om het aanbod te
   wijzigen — de rest van de site werkt dit automatisch bij.
   De VOLGORDE van CATEGORIES hieronder bepaalt de volgorde van de
   kopjes op de bestel- en voorraadpagina (nu: Vlaai, Warme Dranken,
   Dranken, Bier & Wijn). Binnen een categorie bepaalt de volgorde
   in MENU de volgorde op de kaart.
   ============================================================ */

const CATEGORIES = [
  { id: "vlaai",       label: "Vlaai" },
  { id: "warme_drank", label: "Warme Dranken" },
  { id: "fris",       label: "Frisdrank" },
  { id: "bier_wijn",   label: "Bier & Wijn" },
];

const MENU = [
  // --- Vlaai ---
  { id: "appelvlaai",     name: "Appelvlaai",        emoji: "🍰", category: "vlaai" },
  { id: "botervlaai",     name: "Botervlaai",        emoji: "🍰", category: "vlaai" },
  { id: "aardbeienvlaai", name: "Aardbeienvlaai",    emoji: "🍰", category: "vlaai" },
  { id: "rijstenvlaai",   name: "Rijstenvlaai",      emoji: "🍰", category: "vlaai" },
  { id: "kersenvlaai",    name: "Kersenvlaai",       emoji: "🍰", category: "vlaai" },

  // --- Warme Dranken ---
  { id: "koffie",         name: "Koffie",            emoji: "☕", category: "warme_drank" },
  { id: "thee",           name: "Thee",              emoji: "☕", category: "warme_drank" },
  { id: "cappuccino",     name: "Cappuccino",        emoji: "☕", category: "warme_drank" },

  // --- Dranken ---
  { id: "cola",           name: "Cola",              emoji: "🥤", category: "drank" },
  { id: "fanta",          name: "Fanta",             emoji: "🍊", category: "drank" },
  { id: "water",          name: "Water",             emoji: "💧", category: "drank" },
  { id: "sparood",        name: "Spa Rood",          emoji: "💧", category: "drank" },
  { id: "iceteag",        name: "Ice Tea Green",     emoji: "🥤", category: "drank" },
  { id: "iceteas",        name: "Ice Tea Sparkling", emoji: "🥤", category: "drank" },
  { id: "appelsap",       name: "Appelsap",          emoji: "🍎", category: "drank" },
  { id: "ranja",          name: "Ranja",             emoji: "🧃", category: "drank" },

  // --- Bier & Wijn ---
  { id: "radler0",        name: "Radler 0.0%",       emoji: "🍺", category: "bier_wijn" },
  { id: "hertogjan",      name: "Hertog Jan",        emoji: "🍻", category: "bier_wijn" },
  { id: "weizener",       name: "Weizener",          emoji: "🍺", category: "bier_wijn" },
  { id: "lindeboom",      name: "Lindeboom",         emoji: "🍻", category: "bier_wijn" },
  { id: "rose",           name: "Rosé",              emoji: "🍷", category: "bier_wijn" },
  { id: "wittewijn",      name: "Witte Wijn",        emoji: "🥂", category: "bier_wijn" },
];
