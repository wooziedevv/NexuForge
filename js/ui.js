// js/ui.js (FINAL - sidebar kayma fix + nav visibility)

(function () {
  "use strict";

  // Esnek seçiciler: id varsa id, yoksa class üzerinden yakalar
  const $ = (sel) => document.querySelector(sel);

  const overlay =
    $("#overlay") || $(".overlay") || document.createElement("div");

  // sidebar: id yoksa .sidebar yakala
  const sidebar =
    $("#sidebar") || document.querySelector("nav.sidebar") || $(".sidebar");

  // toggle: id yoksa .edge-toggle ya da menu ikonu
  const menuToggle =
    $("#menuToggle") ||
    document.querySelector(".edge-toggle") ||
    document.querySelector("[data-menu-toggle]");

  // close: id yoksa sidebar içinden .close-btn ara
  const closeBtn =
    $("#closeSidebar") ||
    (sidebar ? sidebar.querySelector(".close-btn") : null) ||
    document.querySelector("[data-menu-close]");

  const adminLink =
    $("#adminLink") ||
    (sidebar ? sidebar.querySelector(".admin-link") : null);

  // Eğer overlay sayfada yoksa otomatik ekleyelim (bazı sayfalarda unutuluyor)
  function ensureOverlay() {
    if (overlay.id !== "overlay") {
      overlay.id = "overlay";
    }
    if (!document.getElementById("overlay")) {
      document.body.appendChild(overlay);
    }
  }

  // Sidebar'ı her koşulda sağa sabitleyen "hard fix"
  function forceSidebarRight(isOpen) {
    if (!sidebar) return;

    // Inline style basarak tüm çakışmaları ezer
    sidebar.style.position = "fixed";
    sidebar.style.top = "0";
    sidebar.style.bottom = "0";
    sidebar.style.left = "auto";
    sidebar.style.transform = "none";
    sidebar.style.margin = "0";

    // genişlik sabitle (CSS ile uyumlu)
    if (!sidebar.style.width) sidebar.style.width = "300px";

    // açık/kapalı duruma göre right
    sidebar.style.right = isOpen ? "0" : "-320px";
  }

  function openSidebar() {
    if (!sidebar) return;
    ensureOverlay();
    sidebar.classList.add("open");
    overlay.classList.add("show");

    // açarken mutlaka sağa oturt
    forceSidebarRight(true);

    // body scroll kilidi (mobilde iyi durur)
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove("open");
    overlay.classList.remove("show");

    // kapatırken de sağa oturt
    forceSidebarRight(false);

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  function toggleSidebar() {
    if (!sidebar) return;
    const isOpen = sidebar.classList.contains("open");
    isOpen ? closeSidebar() : openSidebar();
  }

  // Admin link + guest/auth link grupları
  function refreshNavVisibility() {
    let user = null;
    try { user = getCurrentUser(); } catch (e) {}

    // admin link
    if (adminLink) {
      const isOwner = user?.username?.toLowerCase() === "wooziedev11";
      const isAdminOrMod = user && (user.role === "admin" || user.role === "mod");
      adminLink.style.display = (isOwner || isAdminOrMod) ? "block" : "none";
    }

    // class ile görünürlük
    document.querySelectorAll(".nav-guest-only")
      .forEach(el => (el.style.display = user ? "none" : "block"));

    document.querySelectorAll(".nav-auth-only")
      .forEach(el => (el.style.display = user ? "block" : "none"));
  }

  function bindEvents() {
    if (menuToggle) menuToggle.addEventListener("click", toggleSidebar);
    if (closeBtn) closeBtn.addEventListener("click", closeSidebar);

    // overlay click
    ensureOverlay();
    overlay.addEventListener("click", closeSidebar);

    // ESC ile kapatma
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSidebar();
    });

    // Resize olunca pozisyonu tekrar zorla
    window.addEventListener("resize", () => {
      if (!sidebar) return;
      forceSidebarRight(sidebar.classList.contains("open"));
    });

    // Storage değişince nav yenile (login/logout)
    window.addEventListener("storage", (e) => {
      if (e.key === "currentUser") refreshNavVisibility();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureOverlay();
    // Sayfa yüklenince sidebar kapalı konumda sağa sabitle
    forceSidebarRight(false);
    refreshNavVisibility();
    bindEvents();
  });
})();
