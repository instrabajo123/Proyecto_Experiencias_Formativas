// js/detalle.js
import {
  db,
  auth,
  onAuthStateChanged,
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc
} from "./firebase-config.js";

const params = new URLSearchParams(window.location.search);
const trabajoID = params.get("id");

const imgEl          = document.getElementById("detalle-imagen");
const tituloEl       = document.getElementById("detalle-titulo");
const descEl         = document.getElementById("detalle-descripcion");
const autorEl        = document.getElementById("detalle-autor");
const precioEl       = document.getElementById("detalle-precio");
const promedioGlobal = document.getElementById("promedio-global");

const ratingStarsEl     = document.getElementById("rating-stars");
const comentarioInputEl = document.getElementById("comentario-input");
const btnComentar       = document.getElementById("btn-comentar");
const comentariosListEl = document.getElementById("comentarios-list");

let usuarioActual = null;
let trabajoData   = null;

// ----------------------
// Cargar datos del trabajo
// ----------------------
async function cargarTrabajo() {
  if (!trabajoID) {
    alert("No se encontró el trabajo.");
    window.location.href = "/public/index.html";
    return;
  }

  const ref  = doc(db, "trabajos", trabajoID);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("El trabajo no existe.");
    window.location.href = "/public/index.html";
    return;
  }

  trabajoData = snap.data();

  imgEl.src        = trabajoData.imageUrl || "./img/no-image.png";
  tituloEl.textContent = trabajoData.titulo || "Sin título";
  descEl.textContent   = trabajoData.descripcion || "";
  autorEl.textContent  = trabajoData.autor || "Desconocido";
  precioEl.textContent = trabajoData.precio ? `S/ ${trabajoData.precio}` : "S/ 0.00";

  await cargarPromedio();
  await cargarComentarios();
  await cargarValorDelUsuario();
}

// ----------------------
// Mostrar estrellas del usuario
// ----------------------
function renderStars(valor = 0) {
  ratingStarsEl.innerHTML = "";
  ratingStarsEl.dataset.valor = valor;

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.textContent = i <= valor ? "★" : "☆";
    star.classList.add("star");

    star.addEventListener("click", () => {
      if (!usuarioActual) {
        alert("Debes iniciar sesión para valorar.");
        return;
      }
      if (trabajoData?.autorUid && usuarioActual.uid === trabajoData.autorUid) {
        alert("No puedes valorar tu propio trabajo.");
        return;
      }
      ratingStarsEl.dataset.valor = i;
      renderStars(i);
    });

    ratingStarsEl.appendChild(star);
  }
}

// ----------------------
// Cargar valoración del usuario
// ----------------------
async function cargarValorDelUsuario() {
  if (!usuarioActual) {
    renderStars(0);
    return;
  }

  const ref  = doc(db, "trabajos", trabajoID, "valoraciones", usuarioActual.uid);
  const snap = await getDoc(ref);

  const valor = snap.exists() ? snap.data().puntuacion : 0;
  renderStars(valor);
}

// ----------------------
// Guardar comentario + valoración
// ----------------------
btnComentar?.addEventListener("click", async () => {
  if (!usuarioActual) {
    alert("Debes iniciar sesión para comentar.");
    return;
  }
  if (trabajoData?.autorUid && usuarioActual.uid === trabajoData.autorUid) {
    alert("No puedes comentar tu propio trabajo.");
    return;
  }

  const puntuacion = Number(ratingStarsEl.dataset.valor || 0);
  const comentario = comentarioInputEl.value.trim();

  if (puntuacion === 0) {
    alert("Debes colocar una valoración (estrellas).");
    return;
  }

  const ref = doc(db, "trabajos", trabajoID, "valoraciones", usuarioActual.uid);

  await setDoc(ref, {
    puntuacion,
    comentario,
    fecha: new Date(),
    uid: usuarioActual.uid,
    autor: usuarioActual.displayName || usuarioActual.email
  });

  comentarioInputEl.value = "";
  await recalcularPromedio();
  await cargarComentarios();
  alert("Comentario y valoración guardados.");
});

// ----------------------
// Cargar comentarios
// ----------------------
async function cargarComentarios() {
  comentariosListEl.innerHTML = "";

  const ref  = collection(db, "trabajos", trabajoID, "valoraciones");
  const snap = await getDocs(ref);

  snap.forEach((d) => {
    const data = d.data();
    const div  = document.createElement("div");
    div.classList.add("comentario");

    const estrellas = "★".repeat(data.puntuacion) + "☆".repeat(5 - data.puntuacion);

    div.innerHTML = `
      <strong>${data.autor}</strong>
      <div class="coment-stars">${estrellas}</div>
      <p>${data.comentario || ""}</p>
    `;

    comentariosListEl.appendChild(div);
  });
}

// ----------------------
// Recalcular promedio global
// ----------------------
async function recalcularPromedio() {
  const ref  = collection(db, "trabajos", trabajoID, "valoraciones");
  const snap = await getDocs(ref);

  let suma  = 0;
  let count = 0;

  snap.forEach((d) => {
    suma  += d.data().puntuacion;
    count += 1;
  });

  const promedio = count > 0 ? suma / count : 0;

  await updateDoc(doc(db, "trabajos", trabajoID), {
    promedioValoracion: promedio,
    totalValoraciones: count
  });

  await cargarPromedio();
}

// ----------------------
// Cargar promedio global desde el doc
// ----------------------
async function cargarPromedio() {
  const ref  = doc(db, "trabajos", trabajoID);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data     = snap.data();
  const promedio = data.promedioValoracion || 0;

  const full = Math.floor(promedio);
  let stars  = "★".repeat(full);
  if (promedio - full >= 0.5) stars += "☆";
  stars = stars.padEnd(5, "☆");

  promedioGlobal.innerHTML = `
    <span class="star-prom">${stars}</span> (${promedio.toFixed(1)})
  `;
}

// ----------------------
// Detectar sesión
// ----------------------
onAuthStateChanged(auth, (user) => {
  usuarioActual = user || null;
  cargarTrabajo();
});
