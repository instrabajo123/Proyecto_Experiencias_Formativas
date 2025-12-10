console.log("script_user.js cargado");

const authUser = firebase.auth();
const dbUser = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const avatarUser = document.getElementById("avatarUser");
  const userDropdown = document.getElementById("userDropdown");
  const userMenuWrapper = document.getElementById("userMenuWrapper");
  const panelAdminBtn = document.getElementById("panelAdminBtn");

  // ------------------------------------------
  // AVATAR
  // ------------------------------------------
  function aplicarAvatar(nombre, email) {
    if (!avatarUser) return;

    const inicial = nombre?.charAt(0).toUpperCase()
                  || email?.charAt(0).toUpperCase()
                  || "U";

    avatarUser.textContent = inicial;

    const colores = [
      "#4F46E5","#10B981","#6366F1","#F97316",
      "#EC4899","#06B6D4","#84CC16","#F59E0B","#3B82F6"
    ];

    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }

    avatarUser.style.backgroundColor = colores[Math.abs(hash) % colores.length];
    avatarUser.style.display = "flex";
  }

  // ------------------------------------------
  // EVENTOS
  // ------------------------------------------
  avatarUser?.addEventListener("click", () => {
    userDropdown?.classList.toggle("hidden");
  });

  logoutBtn?.addEventListener("click", () => {
    authUser.signOut();
  });

  loginBtn?.addEventListener("click", async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await authUser.signInWithPopup(provider);
    } catch (e) {
      console.error(e);
    }
  });

  // ------------------------------------------
  // DETECTAR SESIÓN
  // ------------------------------------------
  authUser.onAuthStateChanged(async user => {
    if (!user) {
      loginBtn && (loginBtn.style.display = "block");
      userMenuWrapper && (userMenuWrapper.style.display = "none");
      return;
    }

    loginBtn && (loginBtn.style.display = "none");
    userMenuWrapper && (userMenuWrapper.style.display = "flex");

    aplicarAvatar(user.displayName, user.email);

    // OBTENER ROL
    const uDoc = await dbUser.collection("users").doc(user.uid).get();
    const rol = uDoc.exists ? uDoc.data().rol : "usuario";

    if (panelAdminBtn) {
      panelAdminBtn.classList.toggle("hidden", rol !== "admin");
    }
  });

});
