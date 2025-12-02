// /assets/js/firebase.js
// Inicializa Firebase y expone auth/db/storage en window para evitar redeclaraciones.
//
// Nota: reemplaza el firebaseConfig por el tuyo si ya no es el mismo.
const firebaseConfig = {
  apiKey: "AIzaSyBt3anoqbRnd5GFpY_PhcOCOPMkFEFsYdE",
  authDomain: "galeria-virtual2-e0645.firebaseapp.com",
  projectId: "galeria-virtual2-e0645",
  storageBucket: "galeria-virtual2-e0645.appspot.com",
  messagingSenderId: "318602157355",
  appId: "1:318602157355:web:b2d3fa424e03a4c0aa796e"
};

// Inicializar
firebase.initializeApp(firebaseConfig);

// Exponer en window para otros scripts
window.auth = firebase.auth();
window.db = firebase.firestore();
window.storage = firebase.storage();

console.log("🔥 Firebase inicializado correctamente (globales: auth, db, storage).");