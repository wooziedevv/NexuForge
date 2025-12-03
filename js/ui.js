// js/ui.js

const sidebar         = document.getElementById("sidebar");
const overlay         = document.getElementById("overlay");
const menuToggle      = document.getElementById("menuToggle");
const closeSidebarBtn = document.getElementById("closeSidebar");
const adminLink       = document.getElementById("adminLink");

function openSidebar() {
  if (sidebar) sidebar.classList.add("open");
  if (overlay) overlay.classList.add("active");
}

function closeSidebar() {
  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("active");
}

if (menuToggle)      menuToggle.addEventListener("click", openSidebar);
if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", closeSidebar);
if (overlay)         overlay.addEventListener("click", closeSidebar);

/* Admin link görünürlüğü + menüde login / guest */

let curUser = null;

try {
  curUser = getCurrentUser();
} catch (e) {
  curUser = null;
}

if (adminLink) {
  if (curUser && (curUser.role === "admin" || curUser.username === "Wooziedev11")) {
    adminLink.style.display = "block";
  } else {
    adminLink.style.display = "none";
  }
}

// Menüde giriş yapmış kullanıcı için bazı linkleri gizle / göster
document.addEventListener("DOMContentLoaded", () => {
  const guestLinks = document.querySelectorAll(".nav-guest-only");
  const authLinks  = document.querySelectorAll(".nav-auth-only");

  guestLinks.forEach(a => {
    a.style.display = curUser ? "none" : "block";
  });
  authLinks.forEach(a => {
    a.style.display = curUser ? "block" : "none";
  });
});

/* Sağ kenardan sürükleyerek aç/kapat (mobil) */

let touchStartX = null;

window.addEventListener("touchstart", (e) => {
  if (!sidebar || !e.touches || e.touches.length === 0) return;
  const x = e.touches[0].clientX;

  if (!sidebar.classList.contains("open") && x > window.innerWidth - 24) {
    touchStartX = x;
  } else if (sidebar.classList.contains("open")) {
    touchStartX = x;
  } else {
    touchStartX = null;
  }
});

window.addEventListener("touchmove", (e) => {
  if (touchStartX == null || !sidebar || !e.touches || e.touches.length === 0) return;
  const x = e.touches[0].clientX;
  const dx = x - touchStartX;

  if (!sidebar.classList.contains("open")) {
    if (dx < -40) {
      openSidebar();
      touchStartX = null;
    }
  } else {
    if (dx > 40) {
      closeSidebar();
      touchStartX = null;
    }
  }
});
