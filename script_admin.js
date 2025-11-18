const firebaseConfig = {
  apiKey: "AIzaSyBt3anoqbRnd5GFpY_PhcOCOPMkFEFsYdE",
  authDomain: "galeria-virtual2-e0645.firebaseapp.com",
  projectId: "galeria-virtual2-e0645",
  storageBucket: "galeria-virtual2-e0645.appspot.com",
  messagingSenderId: "318602157355",
  appId: "1:318602157355:web:b2d3fa424e03a4c0aa796e"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// --- Restringir acceso solo al ADMIN ---
const ADMIN_UID = "jZQuR3Z5aEg2WlvKc15aDnXqOsF2";

auth.onAuthStateChanged(user => {
  if (!user) {
    alert("Debes iniciar sesión.");
    location.href = "index.html";
  } else if (user.uid !== ADMIN_UID) {
    alert("No tienes permisos de administrador.");
    location.href = "index.html";
  } else {
    console.log("🔐 Acceso de administrador concedido.");
    cargarTrabajosAdmin();
  }
});

// --- Cargar trabajos (incluye aprobados y no aprobados) ---
async function cargarTrabajosAdmin() {
  const contenedor = document.getElementById("admin-galeria");
  contenedor.innerHTML = "<p>Cargando...</p>";

  const snapshot = await db.collection("trabajos").orderBy("fecha", "desc").get();

  contenedor.innerHTML = "";

  snapshot.forEach(doc => {
    const t = doc.data();
    const id = doc.id;

    const card = document.createElement("div");
    card.className = "admin-card";

    card.innerHTML = `
      <img src="${t.imageUrl}">
      <h3>${t.titulo}</h3>
      <p>${t.descripcion}</p>
      <p><strong>Autor:</strong> ${t.autor}</p>
      <p><strong>Precio:</strong> S/ ${t.precio}</p>
      <p><strong>Estado:</strong> ${t.aprobado ? "Aprobado" : "Pendiente"}</p>

      <button class="approve-btn" data-id="${id}">Aprobar</button>
      <button class="delete-btn" data-id="${id}">Eliminar</button>
    `;

    contenedor.appendChild(card);
  });

  document.querySelectorAll(".approve-btn").forEach(btn => {
    btn.onclick = () => aprobarTrabajo(btn.dataset.id);
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = () => eliminarTrabajo(btn.dataset.id);
  });
}

// --- Aprobar trabajo ---
async function aprobarTrabajo(id) {
  await db.collection("trabajos").doc(id).update({
    aprobado: true
  });
  alert("Trabajo aprobado.");
  location.reload();
}

// --- Eliminar trabajo ---
async function eliminarTrabajo(id) {
  if (confirm("¿Seguro que quieres eliminar este trabajo?")) {
    await db.collection("trabajos").doc(id).delete();
    alert("Trabajo eliminado.");
    location.reload();
  }
}

// --- Logout ---
document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut();
  location.href = "index.html";
});