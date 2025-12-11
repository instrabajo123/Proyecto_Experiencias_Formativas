// Importar funciones de Firebase (versión modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  deleteDoc,
  getDoc,
  updateDoc,        // ← AGREGADO
  setDoc            // ← AGREGADO
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-storage.js";


// CONFIGURACIÓN REAL DE TU PROYECTO
const firebaseConfig = {
  apiKey: "AIzaSyBt3anoqbRnd5GFpY_PhcOCOPMkFEFsYdE",
  authDomain: "galeria-virtual2-e0645.firebaseapp.com",
  projectId: "galeria-virtual2-e0645",
  storageBucket: "galeria-virtual2-e0645.firebasestorage.app",
  messagingSenderId: "318602157355",
  appId: "1:318602157355:web:b2d3fa424e03a4c0aa796e"
};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Exportar todo lo necesario
export {
  // Auth
  auth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,

  // Firestore
  db,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  deleteDoc,
  getDoc,
  updateDoc,      // ← EXPORTADO
  setDoc,         // ← EXPORTADO

  // Storage
  storage,
  ref,
  uploadBytes,
  getDownloadURL
};
