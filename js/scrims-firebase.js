// js/scrims-firebase.js
// Scrim/Event listesini Firestore'dan render eder.

(function () {
  if (typeof db === "undefined" || !db) {
    console.error("Firestore (db) yok (scrims-firebase).");
    return;
  }

  const el = document.getElementById("scrimList");
  if (!el) return;

  function escapeHtml(str){
    return (str || "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
    }[c]));
  }

  db.collection("scrims")
    .orderBy("createdAt", "desc")
    .limit(100)
    .onSnapshot((snap) => {
      if (snap.empty) {
        el.innerHTML = "<p>Henüz etkinlik eklenmemiş.</p>";
        return;
      }

      el.innerHTML = "";
      snap.forEach((doc) => {
        const s = doc.data() || {};
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
          <strong>${escapeHtml(s.name || "Etkinlik")}</strong><br>
          <small>${escapeHtml(s.date || "")}</small>
        `;
        el.appendChild(div);
      });
    }, (err) => {
      console.error("Scrims hata:", err);
      el.innerHTML = "<p>Etkinlikler yüklenirken hata oluştu.</p>";
    });
})();
