// --- Inicializar Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyBt3anoqbRnd5GFpY_PhcOCOPMkFEFsYdE",
  authDomain: "galeria-virtual2-e0645.firebaseapp.com",
  projectId: "galeria-virtual2-e0645",
  storageBucket: "galeria-virtual2-e0645.appspot.com",
  messagingSenderId: "318602157355",
  appId: "1:318602157355:web:b2d3fa424e03a4c0aa796e"
};
firebase.initializeApp(firebaseConfig);

// Referencias
const auth = firebase.auth();
const db = firebase.firestore();

console.log("✅ Firebase inicializado correctamente (galería).");

// --- Cargar trabajos ---
const galeriaContainer = document.getElementById("galeria-container");

async function cargarTrabajos() {
  galeriaContainer.innerHTML = "<p>Cargando trabajos...</p>";

  try {
    const snapshot = await db.collection("trabajos").orderBy("fecha", "desc").get();
    galeriaContainer.innerHTML = ""; // Limpiar contenedor

    if (snapshot.empty) {
      galeriaContainer.innerHTML = "<p>No hay trabajos publicados aún.</p>";
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement("div");
      card.classList.add("tarjeta");

      card.innerHTML = `
        <img src="${data.imageUrl}" alt="${data.titulo}">
        <h3>${data.titulo}</h3>
        <p>${data.descripcion}</p>
        <p><strong>Precio: S/ ${data.precio.toFixed(2)}</strong></p>
        <p class="autor">Autor: ${data.autor || "Anónimo"}</p>
      `;

      galeriaContainer.appendChild(card);
    });
  } catch (error) {
    console.error("❌ Error al cargar trabajos:", error);
    galeriaContainer.innerHTML = "<p>Error al cargar los trabajos.</p>";
  }
}

cargarTrabajos();

// --- Cerrar sesión ---
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
});