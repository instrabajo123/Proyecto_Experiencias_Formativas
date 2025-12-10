// /assets/js/script.js
console.log("script.js cargado");

const db = firebase.firestore(); // solo usamos la base de datos aquí

document.addEventListener("DOMContentLoaded", () => {
  const galeria = document.getElementById("galeria-container");
  const loadingBox = document.getElementById("galeria-loading");

  async function cargarTrabajos() {
    if (!galeria) return;
    loadingBox && (loadingBox.style.display = "flex");

    try {
      const snap = await db.collection("trabajos")
        .where("aprobado", "==", true)
        .orderBy("creado","desc")
        .get();

      galeria.innerHTML = "";

      if (snap.empty) {
        galeria.innerHTML = "<p style='padding:20px;color:#777'>No hay trabajos.</p>";
        return;
      }

      snap.forEach(doc => {
        const t = doc.data();
        galeria.innerHTML += `
          <div class="card">
            <img src="${t.imageUrl || ''}">
            <div class="contenido">
              <h3>${t.titulo}</h3>
              <p>${t.descripcion}</p>
              <div class="meta">
                <span class="autor">${t.autor}</span>
                <span class="precio">S/ ${t.precio}</span>
              </div>
              <button class="btn-detalles" onclick="verTrabajo('${doc.id}')">
                Ver detalles
              </button>
            </div>
          </div>
        `;
      });

    } catch (error) {
      console.error("Error cargar trabajos:", error);
      galeria.innerHTML = "<p style='padding:20px;color:#c00'>Error al cargar trabajos.</p>";
    }

    loadingBox && (loadingBox.style.display = "none");
  }

  cargarTrabajos();
});

function verTrabajo(id) {
  window.location.href = `/views/detalle_trabajo.html?id=${id}`;
}