/* ============================================================
   CONFIGURATIE — Restaurant
   Dit bestand bevat alleen technische instellingen: de naam
   van je zaak en je Firebase-gegevens.

   Wil je de menukaart (dranken) aanpassen? Dat doe je in
   products.js, niet hier.
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
