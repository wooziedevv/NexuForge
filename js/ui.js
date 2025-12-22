// js/ui.js

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuToggle = document.getElementById("menuToggle");
const closeSidebarBtn = document.getElementById("closeSidebar");
const adminLink = document.getElementById("adminLink");

function openSidebar() {
  sidebar?.classList.add("open");
  overlay?.classList.add("show");
}

function closeSidebar() {
  sidebar?.classList.remove("open");
  overlay?.classList.remove("show");
}

menuToggle?.addEventListener("click", openSidebar);
closeSidebarBtn?.addEventListener("click", closeSidebar);
overlay?.addEventListener("click", closeSidebar);

/* ========== NAV GÖRÜNÜRLÜK ========== */

function refreshNav() {
  const user = getCurrentUser();

  if (adminLink) {
    const isOwner = user?.username?.toLowerCase() === "wooziedev11";
    const isAdmin = user?.role === "admin" || user?.role === "mod";
    adminLink.style.display = (isOwner || isAdmin) ? "block" : "none";
  }

  document.querySelectorAll(".nav-guest-only")
    .forEach(el => el.style.display = user ? "none" : "block");

  document.querySelectorAll(".nav-auth-only")
    .forEach(el => el.style.display = user ? "block" : "none");
}

document.addEventListener("DOMContentLoaded", refreshNav);
window.addEventListener("storage", e => {
  if (e.key === "currentUser") refreshNav();
});
