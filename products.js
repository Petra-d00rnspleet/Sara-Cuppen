/* ============================================================
   MENUKAART — Restaurant Cuppen
   Beheer hier de dranken die gasten kunnen bestellen.

   - id:    interne code, moet uniek zijn, geen spaties
   - name:  naam zoals gasten die zien
   - emoji: icoon op de kaart

   Voeg een regel toe (of verwijder er een) om het aanbod te
   wijzigen — de rest van de site werkt dit automatisch bij.
   Volgorde in deze lijst = volgorde op de bestelpagina.
   ============================================================ */

const MENU = [
  { id: "cola",  name: "Cola",  emoji: "🥤" },
  { id: "fanta", name: "Fanta", emoji: "🍊" },
  { id: "water", name: "Water", emoji: "💧" },
   { id: "koffie", name: "Koffie", emoji: "☕" },
     { id: "appelvlaai", name: "Appelvlaai", emoji: "🍰" },
      { id: "botervlaai", name: "Botervlaai", emoji: "🍰" },
      { id: "aardbeienvlaai", name: "Aardbeienvlaai", emoji: "🍰" },
      { id: "rijstenvlaai", name: "Rijstenvlaai", emoji: "🍰" },
      { id: "kersenvlaai", name: "Kersenvlaai", emoji: "🍰" },
      { id: "thee", name: "Thee", emoji: "☕" },
      { id: "cappuccino", name: "Cappuccino", emoji: "☕" },
      { id: "sparood", name: "Spa Rood", emoji: "💧" },
      { id: "iceteag", name: "Ice Tea Green", emoji: "🥤" },
      { id: "iceteas", name: "Ice Tea Sparkling", emoji: "🥤" },
      { id: "appelsap", name: "Appelsap", emoji: "🍎" },
      { id: "ranja", name: "Ranja", emoji: "🧃" },
      { id: "Radler0.0", name: "Radler 0.0%", emoji: "🍺" },
      { id: "hertogjan", name: "Hertog Jan", emoji: "🍻" },
      { id: "weizener", name: "Weizener", emoji: "🍺" },
   { id: "lindeboom", name: "Lindeboom", emoji: "🍻" },
   { id: "rose", name: "Rosé", emoji: "🍷" },
   { id: "wittewijn", name: "Witte Wijn", emoji: "🥂" },
];
