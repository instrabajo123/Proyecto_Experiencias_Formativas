import {
  auth,
  db,
  signOut,
  onAuthStateChanged,
  getDocs,
  collection,
  updateDoc,
  doc,
  getDoc
} from "./firebase-config.js";

const adminList = document.getElementById("admin-list");
const logoutBtn = document.getElementById("btn-logout");
const filterButtons = document.querySelectorAll(".filters button");

let trabajosGlobal = [];

/* -----------------------------------------------
   LOGOUT
----------------------------------------------- */
logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/public/index.html";
});

/* -----------------------------------------------
   VERIFICAR ROL ADMIN
----------------------------------------------- */
async function verificarAdmin(uid) {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() && snap.data().rol === "admin";
  } catch {
    return false;
  }
}

/* -----------------------------------------------
   RENDERIZAR TARJETAS
----------------------------------------------- */
function renderizarTrabajos(lista) {
  adminList.innerHTML = "";

  lista.forEach((t) => {
    const card = document.createElement("div");
    card.classList.add("admin-card");

    const estado = t.aprobado
      ? "Aprobado"
      : t.motivoRechazo
      ? "Rechazado"
      : "Pendiente";

    const mostrarBotones = estado === "Pendiente";

    card.innerHTML = `
      <img src="${t.imageUrl || './img/no-image.png'}">

      <div class="admin-info">
        <h3>${t.titulo || "Sin título"}</h3>
        <p>${t.descripcion || "Sin descripción"}</p>

        <p><strong>Estado:</strong> ${estado}</p>

        ${
          t.motivoRechazo
            ? `<p><strong>Motivo:</strong> ${t.motivoRechazo}</p>`
            : ""
        }
      </div>

      <div class="admin-actions">
        ${
          mostrarBotones
            ? `
            <button class="btn-approve" data-id="${t.id}">Aprobar</button>
            <button class="btn-reject" data-id="${t.id}">Rechazar</button>
            `
            : ""
        }
      </div>
    `;

    adminList.appendChild(card);
  });

  agregarEventosBotones();
}

/* -----------------------------------------------
   APROBAR / RECHAZAR
----------------------------------------------- */
function agregarEventosBotones() {
  document.querySelectorAll(".btn-approve").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      await updateDoc(doc(db, "trabajos", id), {
        aprobado: true,
        motivoRechazo: ""
      });

      cargarTrabajosAdmin();
    });
  });

  document.querySelectorAll(".btn-reject").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      const motivo = prompt("Motivo del rechazo:");
      if (!motivo) return;

      await updateDoc(doc(db, "trabajos", id), {
        aprobado: false,
        motivoRechazo: motivo
      });

      cargarTrabajosAdmin();
    });
  });
}

/* -----------------------------------------------
   CARGAR TRABAJOS
----------------------------------------------- */
async function cargarTrabajosAdmin() {
  const snap = await getDocs(collection(db, "trabajos"));
  trabajosGlobal = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  renderizarTrabajos(trabajosGlobal);
}

/* -----------------------------------------------
   FILTROS
----------------------------------------------- */
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const f = btn.dataset.filter;

    let lista = trabajosGlobal;

    if (f === "aprobados") lista = lista.filter((t) => t.aprobado === true);

    if (f === "pendientes")
      lista = lista.filter((t) => t.aprobado !== true && !t.motivoRechazo);

    if (f === "rechazados")
      lista = lista.filter((t) => Boolean(t.motivoRechazo));

    renderizarTrabajos(lista);
  });
});

/* -----------------------------------------------
   PROTECCIÓN DE ACCESO
----------------------------------------------- */
onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "/public/index.html");

  const esAdmin = await verificarAdmin(user.uid);
  if (!esAdmin) return (window.location.href = "/public/index.html");

  cargarTrabajosAdmin();
});
