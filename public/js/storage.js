// /js/storage.js
// ----------------------------------------------------------------------
// Módulo para manejar Firebase Storage.
// Aquí se suben imágenes y se obtiene su URL pública.
// ----------------------------------------------------------------------


import {
storage,
ref,
uploadBytes,
getDownloadURL
} from './firebase-config.js';


// ----------------------------------------------------------------------
// Subir imagen al Storage
// file: archivo File obtenido desde un <input type="file">
// uid: ID del usuario para ordenar carpetas
// ----------------------------------------------------------------------
export async function subirImagen(file, uid) {
try {
if (!file) throw new Error("No se recibió archivo");


// Crear la ruta donde se guardará la imagen
const ruta = `trabajos/${uid}/${Date.now()}_${file.name}`;
const storageRef = ref(storage, ruta);


// Subir archivo
const snapshot = await uploadBytes(storageRef, file);


// Obtener URL pública
const url = await getDownloadURL(snapshot.ref);


return url;
} catch (err) {
console.error("Error subiendo imagen:", err);
throw err;
}
}