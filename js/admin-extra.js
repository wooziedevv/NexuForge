// js/admin-extra.js
// Admin panelde Scrim ekleme + Bildirim gönderme (Firestore)

(function(){
  if (typeof firebase === "undefined" || typeof db === "undefined" || !db) return;

  const currentUser = getCurrentUser();

  function isOwnerOrAdmin(){
    const u = getCurrentUser();
    if (!u) return false;
    const isOwner = u.username?.toLowerCase() === "wooziedev11";
    return isOwner || u.role === "admin" || u.role === "mod";
  }

  // Scrim ekle
  const scrimForm = document.getElementById("scrimForm");
  const scrimInfo = document.getElementById("scrimFormInfo");

  if (scrimForm){
    scrimForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!isOwnerOrAdmin()) return alert("Bu işlem için yetkin yok.");

      const name = document.getElementById("eventName").value.trim();
      const date = document.getElementById("eventDate").value.trim();
      if (!name) return alert("Etkinlik adı girin.");

      try{
        await db.collection("scrims").add({
          name,
          date: date || "",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdBy: currentUser ? currentUser.uid : null
        });

        scrimForm.reset();
        if (scrimInfo){
          scrimInfo.textContent = "Etkinlik eklendi.";
          scrimInfo.style.color = "#4ade80";
        }
      }catch(err){
        console.error("Scrim ekleme hata:", err);
        if (scrimInfo){
          scrimInfo.textContent = "Hata: " + (err.message || "bilinmeyen");
          scrimInfo.style.color = "#f87171";
        }
      }
    });
  }

  // Bildirim gönder
  const notifForm = document.getElementById("notifForm");
  const notifInfo = document.getElementById("notifFormInfo");

  if (notifForm){
    notifForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const u = getCurrentUser();
      const isOwner = u?.username?.toLowerCase() === "wooziedev11";
      if (!isOwner && (!u || u.role !== "admin")) {
        return alert("Bildirim göndermek için admin olmalısın.");
      }

      const to = document.getElementById("notifTo").value.trim();
      const title = document.getElementById("notifTitle").value.trim();
      const text = document.getElementById("notifText").value.trim();

      if (!to) return alert("Hedef girin (everyone veya uid).");
      if (!title || !text) return alert("Başlık ve mesaj zorunlu.");

      try{
        await db.collection("notifications").add({
          to: to,
          from: u ? (u.username || "system") : "system",
          title,
          text,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        notifForm.reset();
        if (notifInfo){
          notifInfo.textContent = "Bildirim gönderildi.";
          notifInfo.style.color = "#4ade80";
        }
      }catch(err){
        console.error("Notif gönderme hata:", err);
        if (notifInfo){
          notifInfo.textContent = "Hata: " + (err.message || "bilinmeyen");
          notifInfo.style.color = "#f87171";
        }
      }
    });
  }
})();
