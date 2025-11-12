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

// --- Referencias ---
const auth = firebase.auth();
const db = firebase.firestore();
console.log("✅ Firebase inicializado correctamente.");

// --- LOGIN CON GOOGLE ---
document.getElementById('loginBtn').addEventListener('click', () => {
  const user = auth.currentUser;
  if (user) {
    // Si ya está logueado, cerrar sesión
    auth.signOut().then(() => {
      alert("Sesión cerrada.");
      document.getElementById('loginBtn').textContent = "Iniciar Sesión";
    });
  } else {
    // Si no está logueado, iniciar sesión
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(result => {
        const user = result.user;
        alert(`Bienvenido ${user.displayName}`);
        document.getElementById('loginBtn').textContent = "Cerrar Sesión";
      })
      .catch(err => {
        console.error(err);
        alert("Error al iniciar sesión.");
      });
  }
});

// --- Detectar estado de sesión ---
auth.onAuthStateChanged(user => {
  const btn = document.getElementById('loginBtn');
  if (user) {
    btn.textContent = "Cerrar Sesión";
    console.log("👤 Usuario activo:", user.displayName);
  } else {
    btn.textContent = "Iniciar Sesión";
  }
});

// --- Cargar trabajos desde Firestore ---
const galeria = document.getElementById('galeria-container');

async function cargarTrabajos() {
  galeria.innerHTML = "<p>Cargando trabajos...</p>";

  try {
    const snapshot = await db.collection("trabajos").orderBy("fecha", "desc").get();
    galeria.innerHTML = ""; // limpiar contenido

    if (snapshot.empty) {
      galeria.innerHTML = "<p>No hay trabajos publicados aún.</p>";
      return;
    }

    snapshot.forEach(doc => {
      const trabajo = doc.data();

      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <div class="imagen">
          <img src="${trabajo.imageUrl}" alt="${trabajo.titulo}" />
        </div>
        <h3>${trabajo.titulo}</h3>
        <p>Por: ${trabajo.autor}</p>
        <p>${trabajo.descripcion}</p>
        <span class="precio">S/ ${trabajo.precio.toFixed(2)}</span>
        <button>Añadir al Carrito</button>
        
      `;

      galeria.appendChild(card);
    });

    console.log("✅ Trabajos cargados correctamente.");
  } catch (error) {
    console.error("❌ Error al cargar trabajos:", error);
    galeria.innerHTML = "<p>Error al cargar los trabajos.</p>";
  }
}

// Ejecutar la carga al abrir la página
cargarTrabajos();