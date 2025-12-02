// /assets/js/script.js
// Frontend principal: usa window.auth, window.db, window.storage
// No volver a redeclarar auth/db/storage en otros archivos.

console.log("script.js cargado");

const auth = window.auth;
const db = window.db;
const storage = window.storage;

const galeria = document.getElementById('galeria-container');
const loader = document.getElementById('galeria-loading');
const loginBtn = document.getElementById('loginBtn');
const adminBtn = document.getElementById('adminBtn');

// ----------------------
// Login / Logout (Google)
// ----------------------
loginBtn.addEventListener('click', () => {
  if (auth.currentUser) {
    // Cerrar sesión
    auth.signOut().then(() => location.reload());
    return;
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(err => {
    console.error("Error en signIn:", err);
    alert("Error al iniciar sesión");
  });
});

// Admin button redirect
adminBtn.addEventListener('click', () => {
  window.location.href = "/views/admin.html";
});

// ----------------------
// Detectar estado y rol
// ----------------------
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    loginBtn.textContent = "Acceder";
    adminBtn.style.display = "none";
    return;
  }

  loginBtn.textContent = "Cerrar sesión";

  try {
    const uDoc = await db.collection('users').doc(user.uid).get();
    const rol = uDoc.exists ? uDoc.data().rol : 'usuario';

    // Si rol === 'admin' mostramos adminBtn
    if (rol === 'admin') {
      adminBtn.style.display = "inline-block";
    } else {
      adminBtn.style.display = "none";
    }
  } catch (err) {
    console.error("Error leyendo rol:", err);
    adminBtn.style.display = "none";
  }
});

// ----------------------
// Render tarjeta helper
// ----------------------
function crearTarjeta(trabajo) {
  // trabajo: objeto con titulo, descripcion, precio, imageUrl, autor
  const container = document.createElement('div');
  container.className = 'card';

  container.innerHTML = `
    <img src="${trabajo.imageUrl}" alt="${escapeHtml(trabajo.titulo)}" loading="lazy" />
    <div class="contenido">
      <h3>${escapeHtml(trabajo.titulo)}</h3>
      <p>${escapeHtml(trabajo.descripcion)}</p>
      <div class="meta">
        <div class="autor">${escapeHtml(trabajo.autor || 'Anónimo')}</div>
        <div class="precio">S/ ${Number(trabajo.precio).toFixed(2)}</div>
      </div>
    </div>
  `;

  return container;
}

// simple escape to avoid breaking HTML (learning comment)
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ----------------------
// Cargar trabajos aprobados
// ----------------------
async function cargarTrabajos() {
  loader.style.display = "flex";
  galeria.innerHTML = "";

  try {
    // Nota: si la consulta indica "The query requires an index", crea el índice en Firebase Console.
    const snapshot = await db.collection('trabajos')
      .where('aprobado', '==', true)
      .orderBy('fecha', 'desc')
      .get();

    if (snapshot.empty) {
      galeria.innerHTML = `<p style="color:var(--muted);padding:18px">No hay trabajos publicados aún.</p>`;
      loader.style.display = "none";
      return;
    }

    snapshot.forEach(doc => {
      const t = doc.data();
      // crear tarjeta con la estructura esperada por el CSS
      const card = crearTarjeta(t);
      galeria.appendChild(card);
    });

  } catch (err) {
    console.error("Error cargar trabajos:", err);
    galeria.innerHTML = `<p style="color:var(--muted);padding:18px">Error al cargar los trabajos. Mira la consola.</p>`;
  } finally {
    loader.style.display = "none";
  }
}

// Ejecutar al inicio
window.addEventListener('load', cargarTrabajos);