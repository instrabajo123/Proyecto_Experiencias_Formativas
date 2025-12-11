import {
  db,
  auth,
  onAuthStateChanged,
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs
} from "./firebase-config.js";

/* ---------------------------------------------------
   REFERENCIAS DEL DOM
--------------------------------------------------- */
const img = document.getElementById("detalle-img");
const titulo = document.getElementById("detalle-titulo");
const desc = document.getElementById("detalle-desc");
const precio = document.getElementById("detalle-precio");
const ratingLabel = document.getElementById("detalle-rating");

const comentariosLista = document.getElementById("comentarios-lista");
const comentariosArea = document.getElementById("comentarios-area");

const estrellas = document.getElementById("rating-stars");
const textoComentario = document.getElementById("comentario-texto");
const btnEnviar = document.getElementById("btn-enviar-comentario");

let trabajoActual = null;
let estrellasSeleccionadas = 0;

/* ---------------------------------------------------
   OBTENER ID DE LA URL
--------------------------------------------------- */
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

/* ---------------------------------------------------
   CARGAR DETALLE DEL TRABAJO
--------------------------------------------------- */
async function cargarDetalle() {
  const ref = doc(db, "trabajos", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Trabajo no encontrado");
    return;
  }

  trabajoActual = snap.data();

  img.src = trabajoActual.imageUrl || "";
  titulo.textContent = trabajoActual.titulo;
  desc.textContent = trabajoActual.descripcion;
  precio.textContent = trabajoActual.precio;

  cargarRatingPromedio();
  cargarComentarios();
}

cargarDetalle();

/* ---------------------------------------------------
   CARGAR COMENTARIOS
--------------------------------------------------- */
async function cargarComentarios() {
  comentariosLista.innerHTML = "";

  const ref = collection(db, "trabajos", id, "comentarios");
  const snap = await getDocs(ref);

  snap.forEach(doc => {
    const c = doc.data();
    const div = document.createElement("div");

    div.innerHTML = `
      <p><strong>${c.usuario}</strong> — ⭐ ${c.rating}</p>
      <p>${c.texto}</p>
      <hr>
    `;

    comentariosLista.appendChild(div);
  });
}

/* ---------------------------------------------------
   CALCULAR RATING PROMEDIO
--------------------------------------------------- */
async function cargarRatingPromedio() {
  const ref = collection(db, "trabajos", id, "comentarios");
  const snap = await getDocs(ref);

  if (snap.empty) {
    ratingLabel.textContent = "Sin valoraciones";
    return;
  }

  let total = 0;
  let count = 0;

  snap.forEach(doc => {
    total += doc.data().rating;
    count++;
  });

  const promedio = (total / count).toFixed(1);
  ratingLabel.textContent = `${promedio} ⭐ (${count})`;
}

/* ---------------------------------------------------
   INTERACCIÓN CON ESTRELLAS (RATING)
--------------------------------------------------- */
estrellas.addEventListener("mousemove", (e) => {
  const rect = estrellas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percent = x / rect.width;
  const rating = Math.ceil(percent * 5);

  estrellas.textContent = "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, 5 - rating);
});

estrellas.addEventListener("mouseleave", () => {
  if (estrellasSeleccionadas === 0) {
    estrellas.textContent = "☆☆☆☆☆";
  } else {
    estrellas.textContent =
      "★★★★★".slice(0, estrellasSeleccionadas) +
      "☆☆☆☆☆".slice(0, 5 - estrellasSeleccionadas);
  }
});

estrellas.addEventListener("click", (e) => {
  const rect = estrellas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  estrellasSeleccionadas = Math.ceil((x / rect.width) * 5);
});

/* ---------------------------------------------------
   GUARDAR COMENTARIO + VALORACIÓN
--------------------------------------------------- */
btnEnviar.addEventListener("click", async () => {
  if (estrellasSeleccionadas === 0) {
    alert("Debes seleccionar una valoración.");
    return;
  }

  if (textoComentario.value.trim() === "") {
    alert("Debes escribir un comentario.");
    return;
  }

  const ref = collection(db, "trabajos", id, "comentarios");

  await addDoc(ref, {
    usuario: auth.currentUser.email,
    texto: textoComentario.value,
    rating: estrellasSeleccionadas,
    fecha: new Date()
  });

  textoComentario.value = "";
  estrellasSeleccionadas = 0;
  estrellas.textContent = "☆☆☆☆☆";

  cargarComentarios();
  cargarRatingPromedio();
});

/* ---------------------------------------------------
   MOSTRAR ÁREA DE COMENTARIOS SOLO SI HAY USUARIO
--------------------------------------------------- */
onAuthStateChanged(auth, (user) => {
  if (user) comentariosArea.classList.remove("hidden");
});

/* ---------------------------------------------------
   BOTÓN COMPRAR → PAGO SIMULADO
--------------------------------------------------- */
document.getElementById("btn-comprar").addEventListener("click", () => {
  window.location.href = `pago.html?id=${id}`;
});
