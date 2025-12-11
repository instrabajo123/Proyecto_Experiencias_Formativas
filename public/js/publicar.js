// /js/publicar.js
// ----------------------------------------------------------------------
// Lógica para el formulario de publicación
// Sube la imagen → crea publicación → muestra estado al usuario
// ----------------------------------------------------------------------


import { auth, onAuthStateChanged } from './firebase-config.js';
import { subirImagen } from './storage.js';
import { crearPublicacion } from './firestore.js';


//--------------------------------------------------------------
// Referencias del DOM
//--------------------------------------------------------------
const form = document.getElementById('form-publicar');
const inputTitulo = document.getElementById('titulo');
const inputDescripcion = document.getElementById('descripcion');
const inputPrecio = document.getElementById('precio');
const inputImagen = document.getElementById('imagen');
const mensaje = document.getElementById('mensaje');


let usuarioActual = null;


//--------------------------------------------------------------
// Detectar usuario logueado
//--------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
if (!user) {
mensaje.textContent = "Debes iniciar sesión para publicar.";
mensaje.classList.add('error');
form.style.display = 'none';
return;
}


usuarioActual = user;
});


//--------------------------------------------------------------
// Enviar formulario
//--------------------------------------------------------------
form.addEventListener('submit', async (e) => {
e.preventDefault();


if (!usuarioActual) return;


const titulo = inputTitulo.value.trim();
const descripcion = inputDescripcion.value.trim();
const precio = parseFloat(inputPrecio.value);
const archivo = inputImagen.files[0];


if (!archivo) {
mensaje.textContent = "Debes seleccionar una imagen.";
mensaje.classList.add('error');
return;
}


try {
mensaje.textContent = "Subiendo imagen...";
mensaje.classList.remove('error');
mensaje.classList.add('info');


// Subir imagen al Storage
const imagenURL = await subirImagen(archivo, usuarioActual.uid);


mensaje.textContent = "Guardando publicación...";


// Crear publicación en Firestore
await crearPublicacion(usuarioActual.uid, titulo, descripcion, precio, imagenURL);


mensaje.textContent = "¡Publicación enviada! Un administrador debe aprobarla.";
mensaje.classList.remove('info');
mensaje.classList.add('success');


form.reset();


} catch (err) {
console.error(err);
mensaje.textContent = "Ocurrió un error al publicar.";
mensaje.classList.add('error');
}
});