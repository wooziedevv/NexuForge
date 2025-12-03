const sidebar   = document.getElementById("sidebar");
const overlay   = document.getElementById("overlay");
const menuToggle = document.getElementById("menuToggle");
const closeSidebarBtn = document.getElementById("closeSidebar");
const adminLink = document.getElementById("adminLink");

function openSidebar() {
  if (sidebar) sidebar.classList.add("open");
  if (overlay) overlay.classList.add("active");
}

function closeSidebar() {
  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("active");
}

if (menuToggle) menuToggle.addEventListener("click", openSidebar);
if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", closeSidebar);
if (overlay) overlay.addEventListener("click", closeSidebar);

/* ADMIN GÖRÜNÜRLÜK */
const curUser = getCurrentUser();
if (adminLink) {
  if (curUser && (curUser.role === "admin" || curUser.username === "Wooziedev11")) {
    adminLink.style.display = "block";
  } else {
    adminLink.style.display = "none";
  }
}
/* Basit sağ kenardan sürükleyerek açma (mobil) */

let touchStartX = null;

window.addEventListener("touchstart", (e) => {
  if (!e.touches || e.touches.length === 0) return;
  const x = e.touches[0].clientX;

  // Menü kapalıyken sağ kenardan
  if (!sidebar.classList.contains("open") && x > window.innerWidth - 24) {
    touchStartX = x;
  } else if (sidebar.classList.contains("open")) {
    touchStartX = x;
  } else {
    touchStartX = null;
  }
});

window.addEventListener("touchmove", (e) => {
  if (touchStartX == null || !e.touches || e.touches.length === 0) return;
  const x = e.touches[0].clientX;
  const dx = x - touchStartX;

  // Kapalıyken sola çek -> aç
  if (!sidebar.classList.contains("open")) {
    if (dx < -40) {
      openSidebar();
      touchStartX = null;
    }
  } else {
    // Açıkken sağa çek -> kapat
    if (dx > 40) {
      closeSidebar();
      touchStartX = null;
    }
  }
});
