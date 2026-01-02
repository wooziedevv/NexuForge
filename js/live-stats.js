// js/live-stats.js
// NexuForge Live Stats (simülasyon + günlük artış limiti + register bump)

(function () {
  const BASE_TOTAL = 152783;
  const BASE_ONLINE = 6034;

  // ---- helpers ----
  const fmt = (n) => (Number(n) || 0).toLocaleString("tr-TR");
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const now = () => Date.now();

  // Gün anahtarı (TR saatiyle basit; cihaz saati yeterli)
  function dayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  // Persisted state
  function loadState() {
    try {
      return JSON.parse(localStorage.getItem("nf_live_stats") || "{}");
    } catch {
      return {};
    }
  }
  function saveState(s) {
    localStorage.setItem("nf_live_stats", JSON.stringify(s));
  }

  // Initialize state
  const state = loadState();
  const today = dayKey();

  if (!state.day || state.day !== today) {
    state.day = today;
    state.todayAdded = 0;        // bugün random eklenen kişi sayısı
    state.totalOffset = state.totalOffset || 0; // BASE_TOTAL + offset
  }
  if (typeof state.totalOffset !== "number") state.totalOffset = 0;
  if (typeof state.todayAdded !== "number") state.todayAdded = 0;

  // Online/active start
  if (typeof state.online !== "number") state.online = BASE_ONLINE;
  if (typeof state.active !== "number") state.active = Math.max(120, Math.round(state.online * 0.04));

  saveState(state);

  // DOM nodes (hem index hem auth için)
  const totalEl = document.querySelector("[data-stat='total']");
  const onlineEl = document.querySelector("[data-stat='online']");
  const activeEl = document.querySelector("[data-stat='active']");
  const offlineEl = document.querySelector("[data-stat='offline']");

  function computeTotal() {
    return BASE_TOTAL + state.totalOffset;
  }

  function render() {
    const total = computeTotal();
    const online = clamp(Math.round(state.online), 50, total); // online toplamı geçmesin
    const active = clamp(Math.round(state.active), 0, online);
    const offline = Math.max(0, total - online);

    if (totalEl) totalEl.textContent = fmt(total);
    if (onlineEl) onlineEl.textContent = fmt(online);
    if (activeEl) activeEl.textContent = fmt(active);
    if (offlineEl) offlineEl.textContent = fmt(offline);
  }

  // Random dalgalanma: online & active
  function tickOnline() {
    const total = computeTotal();

    // online random walk: küçük art/azal
    const delta = Math.round((Math.random() - 0.5) * 180); // -90..+90 civarı
    state.online = clamp(state.online + delta, 1200, Math.min(15000, total));

    // active online'ın alt kümesi: 2% - 12% arası
    const ratio = 0.02 + Math.random() * 0.10;
    const targetActive = Math.round(state.online * ratio);

    // active yumuşak geçiş
    state.active = state.active + (targetActive - state.active) * 0.35;

    saveState(state);
    render();
  }

  // Random kayıtlı artışı: asla düşmez, günde max +10
  function maybeTickTotal() {
    if (state.todayAdded >= 10) return;

    // her 35-90 saniyede bir %40 ihtimalle +1
    if (Math.random() < 0.40) {
      state.totalOffset += 1;
      state.todayAdded += 1;
      saveState(state);
      render();
    }
  }

  // Timer planı
  function scheduleOnlineTick() {
    const ms = 2500 + Math.random() * 4500; // 2.5s - 7s
    setTimeout(() => {
      tickOnline();
      scheduleOnlineTick();
    }, ms);
  }

  function scheduleTotalTick() {
    const ms = 35000 + Math.random() * 55000; // 35s - 90s
    setTimeout(() => {
      maybeTickTotal();
      scheduleTotalTick();
    }, ms);
  }

  // External API: register olduğunda +1
  window.NFStats = {
    bumpRegistered: function (n = 1) {
      const add = Math.max(1, Math.round(n));
      state.totalOffset += add;
      // register real olduğu için günlük limite takılmasın (senin isteğin: biri üye olunca artsın)
      saveState(state);
      render();
    }
  };

  // First render + start
  render();
  scheduleOnlineTick();
  scheduleTotalTick();
})();
