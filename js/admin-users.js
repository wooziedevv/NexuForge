// js/admin-users.js
// Admin panelde kullanıcı listesini ve rollerini yönetir

(function () {
  if (!db) {
    console.error("db yok (admin-users).");
    return;
  }

  const listEl = document.getElementById("adminUsersList");
  if (!listEl) return;

  const currentUser = getCurrentUser();

  function isAdmin() {
    if (!currentUser) return false;
    if (
      currentUser.username &&
      currentUser.username.toLowerCase() === "wooziedev11"
    ) {
      return true;
    }
    return (currentUser.role || "user") === "admin";
  }

  if (!isAdmin()) {
    listEl.innerHTML =
      "<p class='small-text' style='color:#f87171'>Bu bölümü sadece admin görebilir.</p>";
    return;
  }

  // Kullanıcıları çek (canlı)
  db.collection("users")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snap) => {
        if (snap.empty) {
          listEl.innerHTML =
            "<p class='small-text'>Henüz kullanıcı yok.</p>";
          return;
        }

        listEl.innerHTML = "";

        snap.forEach((doc) => {
          const u = doc.data() || {};
          const uid = doc.id;

          const item = document.createElement("div");
          item.className = "admin-user-item";

          const username = u.username || "(isimsiz)";
          const email = u.email || "";
          const role = u.role || "user";

          item.innerHTML = `
            <div class="admin-user-left">
              <div class="admin-user-name">${username}</div>
              <div class="admin-user-email">${email}</div>
            </div>
            <div class="admin-user-right">
              <select class="role-select" data-uid="${uid}">
                <option value="user">user</option>
                <option value="mod">mod</option>
                <option value="admin">admin</option>
                <option value="verified">verified</option>
              </select>
              <button class="btn btn-small btn-primary" data-uid="${uid}">
                Kaydet
              </button>
            </div>
          `;

          const select = item.querySelector("select.role-select");
          if (select) select.value = role;

          listEl.appendChild(item);
        });

        // Kaydet butonları
        listEl.querySelectorAll("button[data-uid]").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const uid = btn.getAttribute("data-uid");
            const select = listEl.querySelector(
              `select.role-select[data-uid="${uid}"]`
            );
            if (!select) return;
            const newRole = select.value;

            if (!isAdmin()) {
              alert("Sadece admin rol değiştirebilir.");
              return;
            }

            const ok = confirm(
              usernameInfoFromItem(btn.parentElement.parentElement) +
                " kullanıcısına '" +
                newRole +
                "' rolü vermek istediğine emin misin?"
            );
            if (!ok) return;

            try {
              await db.collection("users").doc(uid).update({
                role: newRole
              });
            } catch (err) {
              console.error("Rol güncelleme hatası:", err);
              alert(
                "Rol güncellenirken hata: " +
                  (err.message || "bilinmeyen hata")
              );
            }
          });
        });
      },
      (err) => {
        console.error("Kullanıcı listesini okurken hata:", err);
        listEl.innerHTML =
          "<p class='small-text'>Kullanıcılar yüklenirken hata: " +
          (err.message || "") +
          "</p>";
      }
    );

  // Küçük helper: item içinden username al
  function usernameInfoFromItem(itemEl) {
    try {
      const nameEl = itemEl.querySelector(".admin-user-name");
      return nameEl ? nameEl.textContent.trim() : "Bu";
    } catch (e) {
      return "Bu";
    }
  }
})();
