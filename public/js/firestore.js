// /js/firestore.js

import {
  db,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from "./firebase-config.js";

// --------------------------------------------------------------
// Crear una nueva publicación (BOOLEANO)
// --------------------------------------------------------------
export async function crearPublicacion(uid, titulo, descripcion, precio, imagenURL) {
  try {
    const ref = await addDoc(collection(db, "trabajos"), {
      uid,
      titulo,
      descripcion,
      precio,
      imagenURL,
      estado: false,      // NUEVO TRABAJO: pendiente (false)
      fecha: new Date()
    });

    return ref.id;
  } catch (err) {
    console.error("Error creando publicación:", err);
    throw err;
  }
}

// --------------------------------------------------------------
// Obtener todas las publicaciones
// --------------------------------------------------------------
export async function obtenerTrabajos() {
  const trabajos = [];

  try {
    const snap = await getDocs(collection(db, "trabajos"));

    snap.forEach((d) => trabajos.push({ id: d.id, ...d.data() }));
    return trabajos;

  } catch (err) {
    console.error("Error obteniendo trabajos:", err);
    throw err;
  }
}

// --------------------------------------------------------------
// Obtener publicaciones por usuario
// --------------------------------------------------------------
export async function obtenerTrabajosPorUsuario(uid) {
  const trabajos = [];

  try {
    const q = query(collection(db, "trabajos"), where("uid", "==", uid));
    const snap = await getDocs(q);

    snap.forEach((d) => trabajos.push({ id: d.id, ...d.data() }));
    return trabajos;

  } catch (err) {
    console.error("Error obteniendo trabajos del usuario:", err);
    throw err;
  }
}

// --------------------------------------------------------------
// Obtener una publicación por ID
// --------------------------------------------------------------
export async function obtenerTrabajoPorID(id) {
  try {
    const ref = doc(db, "trabajos", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return { id: snap.id, ...snap.data() };

  } catch (err) {
    console.error("Error obteniendo trabajo por ID:", err);
    throw err;
  }
}

// --------------------------------------------------------------
// Cambiar estado (ADMIN) — BOOLEANO
// --------------------------------------------------------------
export async function actualizarEstadoTrabajo(id, nuevoEstadoBooleano) {
  try {
    const ref = doc(db, "trabajos", id);
    await updateDoc(ref, { estado: nuevoEstadoBooleano });
  } catch (err) {
    console.error("Error actualizando estado:", err);
    throw err;
  }
}

// --------------------------------------------------------------
// Eliminar publicación
// --------------------------------------------------------------
export async function eliminarTrabajo(id) {
  try {
    await deleteDoc(doc(db, "trabajos", id));
  } catch (err) {
    console.error("Error eliminando trabajo:", err);
    throw err;
  }
}
