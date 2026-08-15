/* ============================================================
   CONFIGURATIE — Restaurant Cuppen
   Dit is het enige bestand dat je normaal gesproken hoeft aan
   te passen: je Firebase-gegevens en de kaart met dranken.
   ============================================================ */

// Naam van het restaurant, wordt boven de site getoond.
const APP_NAME = "Cuppen";

/* ------------------------------------------------------------
   FIREBASE
   Haal deze gegevens op in de Firebase Console:
   Project settings > Je apps > SDK setup and configuration.
   Zorg dat je "Realtime Database" hebt aangemaakt (niet Firestore)
   en dat de databaseURL hieronder klopt.
   ------------------------------------------------------------ */
const firebaseConfig = {
  apiKey: "AIzaSyDIlcs1YlMrcR2_Tzl1sSKTxQd9hWUZr6s",
  authDomain: "keuken-fd524.firebaseapp.com",
  databaseURL: "https://keuken-fd524-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "keuken-fd524",
  storageBucket: "keuken-fd524.firebasestorage.app",
  messagingSenderId: "466482374113",
  appId: "1:466482374113:web:8da1318ddd33ff40a51ea0"
};

/* ------------------------------------------------------------
   MENUKAART
   De dranken die gasten kunnen bestellen.
   - id:    interne code, moet uniek zijn, geen spaties
   - name:  naam zoals gasten die zien
   - emoji: icoon op de kaart
   Voeg hier gerust een regel toe om een nieuwe drank aan te bieden.
   ------------------------------------------------------------ */
const MENU = [
  { id: "cola",  name: "Cola",  emoji: "🥤" },
  { id: "fanta", name: "Fanta", emoji: "🍊" },
  { id: "water", name: "Water", emoji: "💧" },
];
