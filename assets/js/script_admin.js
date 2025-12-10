console.log("script_admin.js cargado");

const authA = firebase.auth();
const dbA = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {

  const lista = document.getElementById("listaPendientes");
  const panel = document.getElementById("panelDetalle");

  const detalleImg = document.getElementById("detalleImg");
  const detalleTitulo = document.getElementById("detalleTitulo");
  const detalleDesc = document.getElementById("detalleDesc");
  const detalleAutor = document.getElementById("detalleAutor");
  const detalleCategoria = document.getElementById("detalleCategoria");
  const detalleMotivo = document.getElementById("detalleMotivo");

  let trabajoID = null;

  // -------------------------
  // VALIDAR ADMIN
  // -------------------------
  authA.onAuthStateChanged(async (user) => {
    if (!user) return (window.location.href = "/views/index.html");

    const u = await dbA.collection("users").doc(user.uid).get();
    if (!u.exists || u.data().rol !== "admin") {
      alert("No tienes permisos.");
      return (window.location.href = "/views/index.html");
    }

    cargarPendientes();
  });

  // -------------------------
  // LISTAR PENDIENTES
  // -------------------------
  async function cargarPendientes() {
    lista.innerHTML = "<p>Cargando...</p>";

    const snap = await dbA
      .collection("trabajos")
      .where("aprobado", "==", false)
      .orderBy("creado", "desc")
      .get();

    lista.innerHTML = "";

    if (snap.empty) {
      lista.innerHTML = "<p style='color:#777'>No hay trabajos pendientes.</p>";
      return;
    }

    snap.forEach((doc) => {
      const t = doc.data();

      lista.innerHTML += `
        <div class="admin-card" onclick="verDetalle('${doc.id}')">
          <img src="${t.imageUrl}">
          <h4>${t.titulo}</h4>
          <p style="padding:0 10px; color:#666">${t.autor}</p>
        </div>
      `;
    });
  }

  // Hacer visible en ventana global
  window.verDetalle = async (id) => {
    trabajoID = id;

    const doc = await dbA.collection("trabajos").doc(id).get();
    const t = doc.data();

    panel.style.display = "block";

    detalleImg.src = t.imageUrl;
    detalleTitulo.textContent = t.titulo;
    detalleDesc.textContent = t.descripcion;
    detalleAutor.textContent = "Autor: " + t.autor;
    detalleCategoria.value = t.categoria || "";
    detalleMotivo.value = "";
  };

  // -------------------------
  // APROBAR
  // -------------------------
  document.getElementById("btnAprobar").addEventListener("click", async () => {
    if (!trabajoID) return alert("Selecciona un trabajo.");

    await dbA.collection("trabajos").doc(trabajoID).update({
      aprobado: true,
      motivoRechazo: "",
      categoria: detalleCategoria.value || ""
    });

    alert("Trabajo aprobado");
    location.reload();
  });

  // -------------------------
  // RECHAZAR
  // -------------------------
  document.getElementById("btnRechazar").addEventListener("click", async () => {
    if (!trabajoID) return alert("Selecciona un trabajo.");
    if (detalleMotivo.value.trim().length < 5)
      return alert("El motivo debe tener al menos 5 caracteres.");

    await dbA.collection("trabajos").doc(trabajoID).update({
      aprobado: false,
      motivoRechazo: detalleMotivo.value
    });

    alert("Trabajo rechazado");
    location.reload();
  });

});
