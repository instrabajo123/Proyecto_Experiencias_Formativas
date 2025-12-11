//--------------------------------------------------------------
// IMPORTAR TODO DESDE firebase-config.js
//--------------------------------------------------------------
import {
  auth,
  db,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "./firebase-config.js";

import { obtenerTrabajos } from "./firestore.js";

// Crear proveedor de Google
const googleProvider = new GoogleAuthProvider();

//--------------------------------------------------------------
// REFERENCIAS AL DOM
//--------------------------------------------------------------
const btnLogin = document.getElementById("btn-login");
const btnLogout = document.getElementById("btn-logout");
const galleryContainer = document.getElementById("gallery");

//--------------------------------------------------------------
// Mostrar/Ocultar botones según estado del usuario
//--------------------------------------------------------------
function updateUI(user) {
  const userOptions = document.getElementById("user-options");

  if (user) {
    btnLogin?.classList.add("hidden");
    userOptions?.classList.remove("hidden");
  } else {
    btnLogin?.classList.remove("hidden");
    userOptions?.classList.add("hidden");
  }
}

//--------------------------------------------------------------
// LOGIN con Google
//--------------------------------------------------------------
btnLogin?.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
  }
});

//--------------------------------------------------------------
// CERRAR SESIÓN
//--------------------------------------------------------------
btnLogout?.addEventListener("click", async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});

//--------------------------------------------------------------
// Cargar publicaciones con el NUEVO DISEÑO DE CARDS
//--------------------------------------------------------------
async function cargarTrabajos() {
  try {
    const trabajos = await obtenerTrabajos();

    galleryContainer.innerHTML = "";

    trabajos.forEach((t) => {
      if (t.aprobado !== true) return;

      const card = document.createElement("div");
      card.classList.add("gallery-card");

      const rating = t.ratingAvg ? t.ratingAvg.toFixed(1) : "0.0";

      card.innerHTML = `
        <img src="${t.imageUrl || ""}" alt="Trabajo">
        
        <div class="card-body">
          <h3>${t.titulo || "Sin título"}</h3>
          <p>${t.descripcion || "Sin descripción"}</p>

          <div class="rating-box">⭐ ${rating}</div>
        </div>

        <button class="btn-vermas" data-id="${t.id}">
          Ver más
        </button>
      `;

      galleryContainer.appendChild(card);
    });

    // EVENTOS "VER MÁS"
    document.querySelectorAll(".btn-vermas").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        window.location.href = `/public/detalle.html?id=${id}`;
      });
    });

  } catch (err) {
    console.error("Error cargando trabajos:", err);
  }
}

//--------------------------------------------------------------
// Detectar cambios de usuario
//--------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
  updateUI(user);
});

//--------------------------------------------------------------
// Ejecutar al cargar la página
//--------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  cargarTrabajos();
});
