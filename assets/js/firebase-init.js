import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, set, update, onDisconnect, remove } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzNX_u-lRxcFXk5Y6LRWCVsn8iCl2iukk",
  authDomain: "particle-c6611.firebaseapp.com",
  databaseURL: "https://particle-c6611-default-rtdb.firebaseio.com",
  projectId: "particle-c6611",
  storageBucket: "particle-c6611.firebasestorage.app",
  messagingSenderId: "999117891763",
  appId: "1:999117891763:web:e9ee3a2419e203685368c6"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Expose to window so non-module scripts (game.js) can access
window.firebaseApp = app;
window.firebaseDb = db;
window.firebaseRef = ref;
window.firebaseSet = set;
window.firebaseUpdate = update;
window.firebaseOnDisconnect = onDisconnect;
window.firebaseRemove = remove;
