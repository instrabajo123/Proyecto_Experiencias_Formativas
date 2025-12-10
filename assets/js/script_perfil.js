// /assets/js/script_perfil.js
console.log("script_perfil.js cargado");

const authPerfil = firebase.auth();
const dbPerfil = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
  const perfilInfo = document.getElementById("perfil-info");
  const btnCambiarNombre = document.getElementById("btn-cambiar-nombre");

  authPerfil.onAuthStateChanged(async (user) => {
    if (!user) {
      perfilInfo.innerHTML = "<p style='color:red'>Debes iniciar sesión.</p>";
      return;
    }

    perfilInfo.innerHTML = `
      <p><strong>Nombre:</strong> ${user.displayName || "Sin nombre"}</p>
      <p><strong>Email:</strong> ${user.email}</p>
    `;

    btnCambiarNombre.addEventListener("click", async () => {
      const nuevoNombre = prompt("Escribe tu nuevo nombre:");
      if (!nuevoNombre || nuevoNombre.trim().length < 2) return;

      try {
        await user.updateProfile({ displayName: nuevoNombre.trim() });
        await dbPerfil.collection("users").doc(user.uid).set(
          { nombre: nuevoNombre.trim() },
          { merge: true }
        );
        alert("Nombre actualizado ✔");
        perfilInfo.innerHTML = `
          <p><strong>Nombre:</strong> ${nuevoNombre}</p>
          <p><strong>Email:</strong> ${user.email}</p>
        `;
      } catch (err) {
        console.error("Error cambiando nombre:", err);
        alert("No se pudo cambiar el nombre.");
      }
    });
  });
});