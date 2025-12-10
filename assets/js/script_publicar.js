// /assets/js/script_publicar.js
console.log("script_publicar.js cargado");

const authPub = firebase.auth();
const dbPub = firebase.firestore();
const storagePub = firebase.storage();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formPublicar");
  const msg = document.getElementById("mensaje");

  // -----------------------------------------------------------
  // VERIFICAR SESIÓN
  // -----------------------------------------------------------
  authPub.onAuthStateChanged((user) => {
    if (!user && msg) {
      msg.textContent = "Debes iniciar sesión para publicar.";
      msg.style.color = "red";
    }
  });

  // -----------------------------------------------------------
  // SUBMIT FORM PUBLICAR
  // -----------------------------------------------------------
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = authPub.currentUser;
    if (!user) return alert("Debes iniciar sesión.");

    // Campos
    const titulo = document.getElementById("titulo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const precio = Number(document.getElementById("precio").value) || 0;
    const categoria = document.getElementById("categoria")?.value || "";
    const imagenInput = document.getElementById("imagen");
    const imagen = imagenInput.files[0];

    if (!imagen) {
      msg.textContent = "Selecciona una imagen.";
      msg.style.color = "red";
      return;
    }

    msg.textContent = "Subiendo imagen...";
    msg.style.color = "#4f46e5";

    // -----------------------------------------------------------
    // SUBIR IMAGEN A STORAGE
    // -----------------------------------------------------------
    const ref = storagePub.ref().child(`trabajos/${Date.now()}_${imagen.name}`);

    try {
      await ref.put(imagen);
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      msg.textContent = "❌ Error al subir la imagen. Revisa CORS o Storage.";
      msg.style.color = "red";
      return;
    }

    const imageUrl = await ref.getDownloadURL();

    msg.textContent = "Guardando publicación...";

    // -----------------------------------------------------------
    // GUARDAR DOCUMENTO EN FIRESTORE
    // -----------------------------------------------------------
    try {
      await dbPub.collection("trabajos").add({
        titulo,
        descripcion,
        precio,
        categoria,
        imageUrl,
        autor: user.displayName || user.email,
        autorUid: user.uid,
        aprobado: false,
        motivoRechazo: "",
        creado: firebase.firestore.FieldValue.serverTimestamp()
      });

      msg.textContent = "✔ ¡Trabajo enviado para revisión del administrador!";
      msg.style.color = "green";
      form.reset();
    } catch (err) {
      console.error("Error guardando publicación:", err);
      msg.textContent = "❌ Error al guardar la publicación.";
      msg.style.color = "red";
    }
  });
});
