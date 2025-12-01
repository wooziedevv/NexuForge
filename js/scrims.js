(function renderScrims() {
  const el = document.getElementById("scrimList");
  const scrims = JSON.parse(localStorage.getItem("scrims") || "[]");

  if (!scrims.length) {
    el.innerHTML = "<p>Henüz etkinlik eklenmemiş.</p>";
    return;
  }

  el.innerHTML = "";
  scrims.forEach(s => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${s.name}</strong><br>
      <small>${s.date}</small>
    `;
    el.appendChild(div);
  });
})();
