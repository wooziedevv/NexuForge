// js/ui.js
// Sağdan açılan menü, overlay ve admin link kontrolü

const sidebar         = document.getElementById("sidebar");
const overlay         = document.getElementById("overlay");
const menuToggle      = document.getElementById("menuToggle");
const closeSidebarBtn = document.getElementById("closeSidebar");
const adminLink       = document.getElementById("adminLink");

function openSidebar() {
  if (sidebar) sidebar.classList.add("open");
  if (overlay) overlay.classList.add("show"); // CSS'te .show var
}

function closeSidebar() {
  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("show");
}

// Tıklama ile aç/kapat
if (menuToggle) {
  menuToggle.addEventListener("click", openSidebar);
}
if (closeSidebarBtn) {
  closeSidebarBtn.addEventListener("click", closeSidebar);
}
if (overlay) {
  overlay.addEventListener("click", closeSidebar);
}

/* ========== Admin link görünürlük ========== */

let curUser = null;
try {
  // utils.js içindeki getCurrentUser
  curUser = getCurrentUser();
} catch (e) {
  curUser = null;
}

if (adminLink) {
  const isOwner =
    curUser &&
    curUser.username &&
    curUser.username.toLowerCase() === "wooziedev11";

  const isAdminOrMod =
    curUser && (curUser.role === "admin" || curUser.role === "mod");

  if (isOwner || isAdminOrMod) {
    adminLink.style.display = "block";
  } else {
    adminLink.style.display = "none";
  }
}

/* Menüde giriş yapmış / misafir linkleri
   (İstersen ileride <a class="nav-auth-only"> gibi kullanırsın) */

document.addEventListener("DOMContentLoaded", () => {
  const guestLinks = document.querySelectorAll(".nav-guest-only");
  const authLinks  = document.querySelectorAll(".nav-auth-only");

  guestLinks.forEach((a) => {
    a.style.display = curUser ? "none" : "block";
  });
  authLinks.forEach((a) => {
    a.style.display = curUser ? "block" : "none";
  });
});

/* ========== Mobil sağdan sürükleyerek aç/kapat ========== */

let touchStartX = null;

window.addEventListener("touchstart", (e) => {
  if (!sidebar || !e.touches || e.touches.length === 0) return;
  const x = e.touches[0].clientX;

  // Menü kapalıyken ekranın sağ 24px'inden başlarsa "açma gesture"
  if (!sidebar.classList.contains("open") && x > window.innerWidth - 24) {
    touchStartX = x;
  }
  // Menü açıkken herhangi bir yerden sürüklemeyi takip edebiliriz
  else if (sidebar.classList.contains("open")) {
    touchStartX = x;
  } else {
    touchStartX = null;
  }
});

window.addEventListener("touchmove", (e) => {
  if (!sidebar || touchStartX === null || !e.touches || e.touches.length === 0) {
    return;
  }
  const x = e.touches[0].clientX;
  const dx = x - touchStartX;

  // Menü kapalı: sola doğru yeterince çekerse aç
  if (!sidebar.classList.contains("open")) {
    if (dx < -40) {
      openSidebar();
      touchStartX = null;
    }
  } else {
    // Menü açık: sağa doğru yeterince çekerse kapat
    if (dx > 40) {
      closeSidebar();
      touchStartX = null;
    }
  }
});
