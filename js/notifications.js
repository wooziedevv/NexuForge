// js/notifications-firebase.js
// Bildirimleri Firestore'dan çeker (to: everyone veya uid). Realtime.

(function () {
  if (typeof firebase === "undefined") {
    console.error("Firebase global yok (notifications-firebase).");
    return;
  }
  if (typeof db === "undefined" || !db) {
    console.error("Firestore (db) yok (notifications-firebase).");
    return;
  }

  const auth = firebase.auth();
  const el = document.getElementById("notifList");
  if (!el) return;

  let uid = null;

  const byId = new Map();
  let unsubEveryone = null;
  let unsubMine = null;

  function escapeHtml(str){
    return (str || "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
    }[c]));
  }

  function render(){
    const arr = Array.from(byId.values())
      .sort((a,b) => (b.createdAtMs||0) - (a.createdAtMs||0));

    if (!arr.length){
      el.innerHTML = "<p>Henüz bildirim yok.</p>";
      return;
    }

    el.innerHTML = "";
    arr.forEach(n => {
      const div = document.createElement("div");
      div.className = "card";

      const d = n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAtMs || Date.now());

      div.innerHTML = `
        <strong>${escapeHtml(n.title || "Bildirim")}</strong><br>
        <small>${d.toLocaleString()} • ${escapeHtml(n.from || "system")}</small><br>
        <span>${escapeHtml(n.text || "")}</span>
      `;
      el.appendChild(div);
    });
  }

  function attachListenerTo(query, keyPrefix){
    return query.onSnapshot((snap) => {
      snap.docChanges().forEach((ch) => {
        const id = keyPrefix + "_" + ch.doc.id;

        if (ch.type === "removed"){
          byId.delete(id);
        } else {
          const data = ch.doc.data() || {};
          const createdAt = data.createdAt || null;
          const createdAtMs =
            data.time ||
            (createdAt?.toMillis ? createdAt.toMillis() : 0) ||
            0;

          byId.set(id, { id, ...data, createdAt, createdAtMs });
        }
      });

      render();
    }, (err) => {
      console.error("Bildirim dinleme hata:", err);
      el.innerHTML = "<p>Bildirimler yüklenirken hata oluştu.</p>";
    });
  }

  function resubscribe(){
    byId.clear();

    if (unsubEveryone) { unsubEveryone(); unsubEveryone = null; }
    if (unsubMine) { unsubMine(); unsubMine = null; }

    unsubEveryone = attachListenerTo(
      db.collection("notifications")
        .where("to","==","everyone")
        .orderBy("createdAt","desc")
        .limit(50),
      "all"
    );

    if (uid){
      unsubMine = attachListenerTo(
        db.collection("notifications")
          .where("to","==",uid)
          .orderBy("createdAt","desc")
          .limit(50),
        "me"
      );
    }
  }

  auth.onAuthStateChanged((fbUser) => {
    uid = fbUser ? fbUser.uid : null;
    resubscribe();
  });

  render();
})();
