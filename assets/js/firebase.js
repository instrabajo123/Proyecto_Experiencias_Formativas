// /assets/js/firebase.js
console.log("🔥 firebase.js cargando...");

// CONFIGURACIÓN OFICIAL DEL PROYECTO
const firebaseConfig = {
  apiKey: "AIzaSyBt3anoqbRnd5GFpY_PhcOCOPMkFEFsYdE",
  authDomain: "galeria-virtual2-e0645.firebaseapp.com",
  projectId: "galeria-virtual2-e0645",
  storageBucket: "galeria-virtual2-e0645.firebasestorage.app",
  messagingSenderId: "318602157355",
  appId: "1:318602157355:web:b2d3fa424e03a4c0aa796e"
};

// PREVENIR DOBLE INICIALIZACIÓN
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("🔥 Firebase inicializado correctamente (auth, db, storage).");
} else {
  console.log("⚠ Firebase ya estaba inicializado, usando instancia existente.");
}

// EXPORTAR INSTANCIAS (opcional pero útil si usas módulos)
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
