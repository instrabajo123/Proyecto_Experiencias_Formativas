// /assets/js/script_publicar.js
console.log("script_publicar.js cargado");
const auth = window.auth;
const db = window.db;
const storage = window.storage;

const form = document.getElementById('Publicar');
const mensaje = document.getElementById('mensaje');

auth.onAuthStateChanged(user => {
  if (!user) {
    alert("Debes iniciar sesión con Google para publicar.");
    window.location.href = "/views/index.html";
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const titulo = document.getElementById('titulo').value.trim();
  const descripcion = document.getElementById('descripcion').value.trim();
  const precio = parseFloat(document.getElementById('precio').value);
  const file = document.getElementById('imagen').files[0];

  if (!titulo || !descripcion || !precio || !file) {
    mensaje.textContent = "Completa todos los campos.";
    return;
  }

  try {
    mensaje.textContent = "Subiendo imagen...";
    const uid = auth.currentUser.uid;
    const storageRef = storage.ref(`trabajos/${uid}/${Date.now()}_${file.name}`);
    await storageRef.put(file);
    const imageUrl = await storageRef.getDownloadURL();

    mensaje.textContent = "Guardando publicación...";
    await db.collection('trabajos').add({
      titulo, descripcion, precio,
      imageUrl,
      autor: auth.currentUser.displayName || "Anónimo",
      autorId: auth.currentUser.uid,
      aprobado: false,
      fecha: firebase.firestore.FieldValue.serverTimestamp()
    });

    mensaje.textContent = "Trabajo enviado para revisión. (Pendiente de aprobación)";
    form.reset();
  } catch (err) {
    console.error("Error publicar:", err);
    mensaje.textContent = "Error al publicar. Revisa la consola.";
  }
});