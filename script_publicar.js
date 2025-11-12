// --- Inicializar Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyBt3anoqbRnd5GFpY_PhcOCOPMkFEFsYdE",
  authDomain: "galeria-virtual2-e0645.firebaseapp.com",
  projectId: "galeria-virtual2-e0645",
  storageBucket: "galeria-virtual2-e0645.firebasestorage.app", 
  messagingSenderId: "318602157355",
  appId: "1:318602157355:web:b2d3fa424e03a4c0aa796e"
};
firebase.initializeApp(firebaseConfig);

// Referencias
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log("✅ Firebase inicializado correctamente.");

// --- Detectar sesión ---
auth.onAuthStateChanged((user) => {
  if (!user) {
    alert("Debes iniciar sesión primero para publicar un trabajo.");
    window.location.href = "index.html";
  } else {
    console.log("👤 Usuario activo:", user.displayName);
  }
});

// --- Manejar formulario ---
const form = document.getElementById('Publicar');
if (!form) {
  console.error("❌ No se encontró el formulario con id='uploadForm'.");
} else {
  console.log("✅ Formulario detectado correctamente.");

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("📤 Intentando publicar...");

    const user = auth.currentUser;
    if (!user) {
      alert("Debes iniciar sesión para publicar un trabajo.");
      return;
    }

    const titulo = document.getElementById('titulo').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const file = document.getElementById('imagen').files[0];

    if (!titulo || !descripcion || !precio || !file) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      console.log("🖼️ Subiendo imagen...");
      const storageRef = storage.ref(`trabajos/${user.uid}/${file.name}`);
      await storageRef.put(file);
      const imageUrl = await storageRef.getDownloadURL();
      console.log("✅ Imagen subida correctamente:", imageUrl);

      console.log("🗂️ Guardando datos en Firestore...");
      await db.collection('trabajos').add({
        titulo,
        descripcion,
        precio,
        imageUrl,
        autor: user.displayName,
        autorId: user.uid,
        aprobado: true,
        fecha: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert("✅ Trabajo publicado correctamente.");
        form.reset();

         // Redirigir automáticamente a la galería agrega un pequeño retraso de 1 segundo para que el usuario vea el mensaje antes de ser redirigido.
         setTimeout(() => {
           window.location.href = "galeria.html";
         }, 1000);

    } catch (error) {
      console.error("❌ Error al publicar:", error);
      alert("Error al publicar el trabajo.");
    } finally {
      publicando = false; //reestablece el estado
    }
  });
}