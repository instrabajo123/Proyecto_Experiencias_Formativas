import {
  auth,
  storage,
  db,
  onAuthStateChanged,
  ref,
  uploadBytes,
  getDownloadURL
} from "./firebase-config.js";

import { crearPublicacion } from "./firestore.js";

const form = document.getElementById("form-publicar");
const mensaje = document.getElementById("mensaje-publicar");

let usuarioActual = null;

// Detectar usuario logueado
onAuthStateChanged(auth, (user) => {
  usuarioActual = user;
});

// Enviar formulario
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!usuarioActual) {
    mensaje.textContent = "Debes iniciar sesión para publicar.";
    mensaje.style.color = "red";
    return;
  }

  const titulo = document.getElementById("titulo").value;
  const descripcion = document.getElementById("descripcion").value;
  const precio = Number(document.getElementById("precio").value);
  const imagenFile = document.getElementById("imagen").files[0];

  mensaje.textContent = "Subiendo imagen...";
  mensaje.style.color = "black";

  try {
    // SUBIR IMAGEN A STORAGE
    const imageRef = ref(storage, `trabajos/${Date.now()}-${imagenFile.name}`);
    await uploadBytes(imageRef, imagenFile);
    const imageUrl = await getDownloadURL(imageRef);

    mensaje.textContent = "Guardando publicación...";

    // GUARDAR DOCUMENTO EN FIRESTORE
    await crearPublicacion(
      usuarioActual.uid,
      titulo,
      descripcion,
      precio,
      imageUrl
    );

    mensaje.textContent = "Publicado con éxito. Espera la aprobación del administrador.";
    mensaje.style.color = "green";

    form.reset();

  } catch (err) {
    console.error(err);
    mensaje.textContent = "Error al publicar.";
    mensaje.style.color = "red";
  }
});
