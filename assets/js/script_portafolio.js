// /assets/js/script_portafolio.js
console.log("script_portafolio.js cargado");

const authP = firebase.auth();
const dbP = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("portafolio-container");
  const loadingBox = document.getElementById("portafolio-loading");

  // -------------------------------------------------------
  // VER DETALLES DESDE PORTAFOLIO
  // -------------------------------------------------------
  window.verTrabajo = function(id) {
    window.location.href = `/views/detalle_trabajo.html?id=${id}`;
  };

  // -------------------------------------------------------
  // CARGAR TRABAJOS DEL USUARIO
  // -------------------------------------------------------
  async function cargarMisTrabajos(uid) {
    if (!contenedor) return;

    loadingBox.style.display = "flex";

    try {
      const snap = await dbP
        .collection("trabajos")
        .where("autorUid", "==", uid)
        .orderBy("creado", "desc")
        .get();

      contenedor.innerHTML = "";

      if (snap.empty) {
        contenedor.innerHTML = `
          <p style="padding:16px; color:#666;">
            Todavía no tienes trabajos publicados.
          </p>`;
        return;
      }

      snap.forEach(doc => {
        const t = doc.data();

        let estado = "Pendiente";
        let color = "#eab308";

        if (t.aprobado === true) {
          estado = "Aprobado";
          color = "#22c55e";
        } else if (t.motivoRechazo && t.motivoRechazo.length > 3) {
          estado = "Rechazado";
          color = "#ef4444";
        }

        contenedor.innerHTML += `
          <div class="card">
            <img src="${t.imageUrl || ""}" alt="${t.titulo}">
            <div class="contenido">
              <h3>${t.titulo}</h3>
              <p>${t.descripcion}</p>

              <div class="meta">
                <span style="color:${color}; font-weight:600;">
                  ${estado}
                </span>
                <span class="precio">S/ ${t.precio || "0.00"}</span>
              </div>

              <button class="btn-detalles" onclick="verTrabajo('${doc.id}')">
                Ver detalles
              </button>
            </div>
          </div>
        `;
      });

    } catch (err) {
      console.error("Error portafolio:", err);
      contenedor.innerHTML = "<p style='padding:16px;color:#c00'>No se pudo cargar tu portafolio.</p>";
    }

    loadingBox.style.display = "none";
  }

  // -------------------------------------------------------
  // DETECTAR SESIÓN
  // -------------------------------------------------------
  authP.onAuthStateChanged(async user => {
    if (!user) {
      contenedor.innerHTML = `
        <p style="padding:16px; color:red;">
          Debes iniciar sesión para ver tu portafolio.
        </p>`;
      return;
    }

    cargarMisTrabajos(user.uid);
  });
});
