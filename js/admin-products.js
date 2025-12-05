// js/admin-products.js
// Admin panelde ürün ekleme / listeleme / silme

(function () {
  if (!db) {
    console.error("db yok (admin-products).");
    return;
  }

  const form = document.getElementById("productForm");
  const infoEl = document.getElementById("productFormInfo");
  const listEl = document.getElementById("adminProductsList");
  const adminUserInfo = document.getElementById("adminUserInfo");

  const currentUser = getCurrentUser();
  if (currentUser && adminUserInfo) {
    adminUserInfo.textContent =
      "Giriş yapan: " +
      currentUser.username +
      " (" +
      currentUser.email +
      ") – rol: " +
      (currentUser.role || "user");
  }

  // Basit yetki kontrolü (şimdilik sadece admin / mod)
  function canManageProducts() {
    if (!currentUser) return false;
    const role = currentUser.role || "user";
    return role === "admin" || role === "mod";
  }

  if (!canManageProducts()) {
    if (infoEl) {
      infoEl.style.color = "#f87171";
      infoEl.textContent =
        "Bu sayfayı sadece admin / mod hesapları kullanabilir.";
    }
    if (form) form.querySelector("button[type='submit']").disabled = true;
  }

  // ÜRÜN EKLEME
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!canManageProducts()) return;

      const name = document.getElementById("prodName").value.trim();
      const price = parseFloat(
        document.getElementById("prodPrice").value.trim()
      );
      const stock = parseInt(
        document.getElementById("prodStock").value.trim(),
        10
      );
      const imageUrl = document.getElementById("prodImage").value.trim();

      if (!name || isNaN(price) || isNaN(stock)) {
        infoEl.style.color = "#f87171";
        infoEl.textContent = "İsim, fiyat ve stok zorunlu.";
        return;
      }

      infoEl.style.color = "#e5e5e5";
      infoEl.textContent = "Kaydediliyor...";

      try {
        await db.collection("products").add({
          name,
          price,
          stock,
          imageUrl: imageUrl || null,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdBy: currentUser ? currentUser.uid : null
        });

        infoEl.style.color = "#4ade80";
        infoEl.textContent = "Ürün eklendi.";

        form.reset();
      } catch (err) {
        console.error("Ürün eklerken hata:", err);
        infoEl.style.color = "#f87171";
        infoEl.textContent =
          "Ürün eklenirken hata: " + (err.message || "bilinmeyen");
      }
    });
  }

  // ÜRÜNLERİ LİSTELE (canlı)
  if (listEl) {
    db.collection("products")
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snap) => {
          if (snap.empty) {
            listEl.innerHTML =
              "<p class='small-text'>Henüz ürün yok.</p>";
            return;
          }

          listEl.innerHTML = "";
          snap.forEach((doc) => {
            const p = doc.data();
            const id = doc.id;

            const item = document.createElement("div");
            item.className = "admin-product-item";

            const imgUrl =
              p.imageUrl ||
              "https://via.placeholder.com/80x80?text=NF";

            item.innerHTML = `
              <div class="admin-product-left">
                <img src="${imgUrl}" alt="${p.name || ""}" />
                <div>
                  <div class="admin-product-name">${p.name || "İsimsiz"}</div>
                  <div class="admin-product-meta">
                    ${p.price || 0} TL • Stok: ${p.stock || 0}
                  </div>
                </div>
              </div>
              <div class="admin-product-actions">
                <button data-id="${id}" class="btn btn-danger btn-small">
                  Sil
                </button>
              </div>
            `;

            listEl.appendChild(item);
          });

          // Sil butonları
          listEl.querySelectorAll("button[data-id]").forEach((btn) => {
            btn.addEventListener("click", async () => {
              if (!canManageProducts()) return;
              const id = btn.getAttribute("data-id");
              const ok = confirm("Bu ürünü silmek istediğine emin misin?");
              if (!ok) return;

              try {
                await db.collection("products").doc(id).delete();
              } catch (err) {
                alert(
                  "Silme hatası: " + (err.message || "bilinmeyen hata")
                );
              }
            });
          });
        },
        (err) => {
          console.error("Admin ürün listesini okurken hata:", err);
          listEl.innerHTML =
            "<p class='small-text'>Ürünler yüklenirken hata: " +
            (err.message || "") +
            "</p>";
        }
      );
  }
})();
