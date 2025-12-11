// js/auth.js
import {
  auth,
  db,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  doc,
  getDoc
} from "./firebase-config.js";

// ----------------------------
// REFERENCIAS AL DOM
// ----------------------------
const loginBtn    = document.getElementById("btn-login");
const logoutBtn   = document.getElementById("btn-logout");
const perfilLink  = document.getElementById("btn-perfil");
const adminBtn    = document.getElementById("btn-admin");
const userOptions = document.getElementById("user-options");

const provider = new GoogleAuthProvider();

// ----------------------------
// LOGIN
// ----------------------------
loginBtn?.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error("Error al iniciar sesión:", e);
  }
});

// ----------------------------
// LOGOUT
// ----------------------------
logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Error al cerrar sesión:", e);
  }
});

// ----------------------------
// Verificar si el usuario es ADMIN
// ----------------------------
async function verificarAdmin(uid) {
  try {
    const ref  = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;

    const data = snap.data();
    return data.rol === "admin";
  } catch (e) {
    console.error("Error verificando rol admin:", e);
    return false;
  }
}

// ----------------------------
// Helpers de UI
// ----------------------------
function mostrarNoLogueado() {
  loginBtn?.classList.remove("hidden");
  logoutBtn?.classList.add("hidden");
  perfilLink?.classList.add("hidden");
  adminBtn?.classList.add("hidden");
  userOptions?.classList.add("hidden");
}

function mostrarUsuario(esAdmin) {
  loginBtn?.classList.add("hidden");
  logoutBtn?.classList.remove("hidden");
  perfilLink?.classList.remove("hidden");
  userOptions?.classList.remove("hidden");

  if (esAdmin) {
    adminBtn?.classList.remove("hidden");
  } else {
    adminBtn?.classList.add("hidden");
  }
}

// ----------------------------
// Escuchar cambios de sesión
// ----------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("Usuario NO logueado");
    mostrarNoLogueado();
    return;
  }

  console.log("Usuario ACTIVO:", user.email);
  const esAdmin = await verificarAdmin(user.uid);
  mostrarUsuario(esAdmin);
});
