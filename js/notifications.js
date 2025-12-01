(function renderNotifs() {
  const el = document.getElementById("notifList");
  const notifs = JSON.parse(localStorage.getItem("notifs") || "[]");

  if (!notifs.length) {
    el.innerHTML = "<p>Henüz bildirim yok.</p>";
    return;
  }

  el.innerHTML = "";
  notifs.forEach(n => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${n.title}</strong><br>
      <small>${new Date(n.time).toLocaleString()}</small><br>
      <span>${n.text}</span>
    `;
    el.appendChild(div);
  });
})();
