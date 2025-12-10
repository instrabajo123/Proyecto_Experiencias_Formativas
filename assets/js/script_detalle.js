// /assets/js/script_detalle.js
console.log("script_detalle.js cargado");

const authD = firebase.auth();
const dbD = firebase.firestore();

document.addEventListener("DOMContentLoaded", async () => {
  // Elements: detalle info
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const imgTrabajo = document.getElementById("detalleImg");
  const tituloTrabajo = document.getElementById("detalleTitulo");
  const descTrabajo = document.getElementById("detalleDesc");
  const precioTrabajo = document.getElementById("detallePrecio");
  const autorTrabajo = document.getElementById("detalleAutor");
  const promedioEstrellas = document.getElementById("promedioEstrellas");
  const comentariosLista = document.getElementById("comentariosLista");

  // Elements: rating + comment
  const estrellaInputs = Array.from(document.querySelectorAll(".estrella-input"));
  const comentarioTexto = document.getElementById("comentarioTexto");
  const btnEnviarComentario = document.getElementById("btnEnviarComentario");

  // Elements: comprar
  const btnComprar = document.getElementById("btnComprar");

  // Safety: if no id, stop
  if (!id) {
    tituloTrabajo.textContent = "ID de trabajo no proporcionado";
    return;
  }

  // Load work details
  try {
    const docSnap = await dbD.collection("trabajos").doc(id).get();
    if (!docSnap.exists) {
      tituloTrabajo.textContent = "Trabajo no encontrado";
      return;
    }
    const t = docSnap.data();
    imgTrabajo.src = t.imageUrl || "";
    tituloTrabajo.textContent = t.titulo || "Sin título";
    descTrabajo.textContent = t.descripcion || "";
    precioTrabajo.textContent = "S/ " + (t.precio ?? "0.00");
    autorTrabajo.textContent = t.autor || "Autor desconocido";
  } catch (err) {
    console.error("Error cargando detalle:", err);
  }

  // Load comments + average stars
  async function cargarComentarios() {
    try {
      const snap = await dbD
        .collection("trabajos")
        .doc(id)
        .collection("comentarios")
        .orderBy("fecha", "desc")
        .get();

      comentariosLista.innerHTML = "";
      let suma = 0;
      let count = 0;

      snap.forEach((doc) => {
        const c = doc.data();
        comentariosLista.innerHTML += `
          <div class="comentario">
            <strong>${c.autor || "Anónimo"}</strong> (${c.estrellas || 0}⭐)<br>
            ${c.texto || ""}
          </div>`;
        suma += Number(c.estrellas || 0);
        count++;
      });

      promedioEstrellas.textContent = count ? (suma / count).toFixed(1) : "0";
    } catch (err) {
      console.error("Error cargando comentarios:", err);
    }
  }

  await cargarComentarios();

  // Helper: get selected star
  function obtenerEstrellasSeleccionadas() {
    const checked = estrellaInputs.find((el) => el.checked);
    return checked ? Number(checked.value) : 0;
  }

  // Submit comment
  btnEnviarComentario?.addEventListener("click", async () => {
    const user = authD.currentUser;
    if (!user) {
      alert("Debes iniciar sesión para comentar.");
      return;
    }

    const estrellas = obtenerEstrellasSeleccionadas();
    const texto = (comentarioTexto.value || "").trim();

    if (!estrellas) {
      alert("Selecciona una calificación (★).");
      return;
    }
    if (texto.length < 3) {
      alert("Escribe un comentario (mínimo 3 caracteres).");
      return;
    }

    try {
      await dbD
        .collection("trabajos")
        .doc(id)
        .collection("comentarios")
        .add({
          autorUid: user.uid,
          autor: user.displayName || user.email || "Usuario",
          estrellas,
          texto,
          fecha: firebase.firestore.FieldValue.serverTimestamp(),
        });

      comentarioTexto.value = "";
      estrellaInputs.forEach((el) => (el.checked = false));
      await cargarComentarios();
      alert("Comentario publicado ✔");
    } catch (err) {
      console.error("Error publicando comentario:", err);
      alert("No se pudo publicar el comentario.");
    }
  });

  // Comprar (placeholder)
  btnComprar?.addEventListener("click", async () => {
    const user = authD.currentUser;
    if (!user) {
      alert("Debes iniciar sesión para comprar.");
      return;
    }
    alert("Función de compra en preparación. Aquí se creará el pedido y el flujo de pago.");
    // Futuro:
    // await dbD.collection("pedidos").add({
    //   trabajoId: id,
    //   compradorUid: user.uid,
    //   fecha: firebase.firestore.FieldValue.serverTimestamp(),
    //   estado: "pendiente",
    // });
  });

  // Toggle user dropdown (en caso no esté en script.js por orden de carga)
  const avatarUser = document.getElementById("avatarUser");
  const userDropdown = document.getElementById("userDropdown");
  avatarUser?.addEventListener("click", () => {
    userDropdown?.classList.toggle("hidden");
  });
});