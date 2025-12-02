// /assets/js/script_admin.js
console.log("ADMIN MODE — script_admin.js cargado");
const auth = window.auth;
const db = window.db;
const storage = window.storage;

const tabla = document.getElementById("tablaTrabajos");
const panel = document.getElementById("panelDetalle");

// Verificar acceso admin
auth.onAuthStateChanged(async (user) => {
  if (!user) return window.location.href = "/views/index.html";
  const uDoc = await db.collection("users").doc(user.uid).get();
  const rol = uDoc.exists ? uDoc.data().rol : null;
  if (rol !== "admin") return alert("No tienes permiso para acceder.") || (window.location.href = "/views/index.html");
  cargarPendientes();
});

async function cargarPendientes(){
  tabla.innerHTML = "<tr><td>Cargando...</td></tr>";
  const snapshot = await db.collection("trabajos").where("aprobado","==",false).orderBy("fecha","desc").get();
  tabla.innerHTML = "";
  snapshot.forEach(doc => {
    const t = doc.data();
    tabla.innerHTML += `<tr>
      <td><img src="${t.imageUrl}" class="thumbnail"></td>
      <td>${t.titulo}</td>
      <td>${t.autor}</td>
      <td>${t.fecha ? new Date(t.fecha.seconds*1000).toLocaleString() : '-'}</td>
      <td><span class="badge estado-pendiente">Pendiente</span></td>
      <td><button onclick="verDetalle('${doc.id}')">Ver</button></td>
    </tr>`;
  });
}

window.verDetalle = async function(idDoc){
  const doc = await db.collection("trabajos").doc(idDoc).get();
  const t = doc.data();
  panel.classList.remove("hidden");
  panel.innerHTML = `
    <img src="${t.imageUrl}">
    <h3>${t.titulo}</h3>
    <p>${t.descripcion}</p>
    <p><strong>Autor:</strong> ${t.autor}</p>
    <p><strong>Precio:</strong> S/ ${Number(t.precio).toFixed(2)}</p>
    <label>Categoría:</label>
    <select id="categoriaSelect">
      <option>Sin categoría</option>
      <option>Diseño gráfico</option>
      <option>Ilustración</option>
      <option>Fotografía</option>
      <option>Desarrollo web</option>
      <option>Programación</option>
      <option>Multimedia</option>
      <option>Arquitectura</option>
    </select>
    <textarea id="motivoRechazo" placeholder="Si rechazas, indica el motivo..."></textarea>
    <div class="btns">
      <button class="aprobar" onclick="aprobarTrabajo('${idDoc}')">Aprobar</button>
      <button class="rechazar" onclick="rechazarTrabajo('${idDoc}')">Rechazar</button>
    </div>`;
};

window.aprobarTrabajo = async function(idDoc){
  const categoria = document.getElementById("categoriaSelect").value;
  await db.collection("trabajos").doc(idDoc).update({aprobado:true,categoria, motivoRechazo:""});
  alert("Trabajo aprobado");
  cargarPendientes();
  panel.classList.add("hidden");
};

window.rechazarTrabajo = async function(idDoc){
  const motivo = document.getElementById("motivoRechazo").value;
  if(!motivo || motivo.length<5) return alert("Escribe un motivo válido (5+ caracteres).");
  await db.collection("trabajos").doc(idDoc).update({aprobado:false, motivoRechazo:motivo});
  alert("Trabajo rechazado");
  cargarPendientes();
  panel.classList.add("hidden");
};