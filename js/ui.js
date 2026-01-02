// js/ui.js (FINAL - kesin sidebar fix)

(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);

  // Esnek yakalama (bazı sayfalarda id farklı olabiliyor)
  let sidebar = $("#sidebar") || document.querySelector("nav.sidebar") || $(".sidebar");
  let overlay = $("#overlay") || $(".overlay");
  const menuToggle = $("#menuToggle") || $(".edge-toggle") || document.querySelector("[data-menu-toggle]");
  const adminLink = $("#adminLink") || (sidebar ? sidebar.querySelector(".admin-link") : null);

  function ensureOverlay() {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "overlay";
      document.body.appendChild(overlay);
    }
    if (!overlay.id) overlay.id = "overlay";
  }

  function moveToBody() {
    // Sidebar body altında değilse body altına taşı (ANA FIX)
    if (sidebar && sidebar.parentElement !== document.body) {
      document.body.appendChild(sidebar);
    }
    // Overlay body altında değilse body altına taşı
    if (overlay && overlay.parentElement !== document.body) {
      document.body.appendChild(overlay);
    }
  }

  function forceLayers() {
    // Header varsa z-index’i sabitle
    const header = document.querySelector(".header");
    if (header) header.style.zIndex = "800";

    if (overlay) {
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.zIndex = "900";
    }

    if (sidebar) {
      sidebar.style.position = "fixed";
      sidebar.style.top = "0";
      sidebar.style.bottom = "0";
      sidebar.style.left = "auto";
      sidebar.style.right = sidebar.classList.contains("open") ? "0" : "-320px";
      sidebar.style.transform = "none";
      sidebar.style.margin = "0";
      sidebar.style.width = "300px";
      sidebar.style.zIndex = "1000";
    }
  }

  function openSidebar() {
    if (!sidebar) return;
    ensureOverlay();
    moveToBody();
    sidebar.classList.add("open");
    overlay.classList.add("show");
    forceLayers();
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("show");
    forceLayers();
  }

  function toggleSidebar() {
    if (!sidebar) return;
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
  }

  function refreshNavVisibility() {
    let user = null;
    try { user = getCurrentUser(); } catch (e) {}

    if (adminLink) {
      const isOwner = user?.username?.toLowerCase() === "wooziedev11";
      const isAdminOrMod = user && (user.role === "admin" || user.role === "mod");
      adminLink.style.display = (isOwner || isAdminOrMod) ? "block" : "none";
    }

    document.querySelectorAll(".nav-guest-only").forEach(el => el.style.display = user ? "none" : "block");
    document.querySelectorAll(".nav-auth-only").forEach(el => el.style.display = user ? "block" : "none");
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureOverlay();
    sidebar = $("#sidebar") || document.querySelector("nav.sidebar") || $(".sidebar"); // tekrar yakala
    moveToBody();
    forceLayers();
    refreshNavVisibility();

    // eventler
    if (menuToggle) menuToggle.addEventListener("click", toggleSidebar);

    // close butonu (sayfaya göre değişebilir)
    const closeBtn = $("#closeSidebar") || (sidebar ? sidebar.querySelector(".close-btn") : null);
    if (closeBtn) closeBtn.addEventListener("click", closeSidebar);

    overlay.addEventListener("click", closeSidebar);

    window.addEventListener("resize", forceLayers);
    window.addEventListener("storage", (e) => {
      if (e.key === "currentUser") refreshNavVisibility();
    });
  });
})();
