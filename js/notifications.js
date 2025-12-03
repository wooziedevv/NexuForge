// js/notifications.js

(function renderNotifs() {
  const el = document.getElementById("notifList");
  const notifs = getNotificationsStore();
  const cur = getCurrentUser();

  const visible = notifs.filter(n => {
    if (n.to === "everyone") return true;
    if (!cur) return false;
    return n.to === cur.uid;
  }).sort((a,b) => b.time - a.time);

  if (!visible.length) {
    el.innerHTML = "<p>Henüz bildirim yok.</p>";
    return;
  }

  el.innerHTML = "";
  visible.forEach(n => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${n.title}</strong><br>
      <small>${new Date(n.time).toLocaleString()} • ${n.from || "system"}</small><br>
      <span>${n.text}</span>
    `;
    el.appendChild(div);
  });
})();
