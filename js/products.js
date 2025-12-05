// js/products.js
// Firestore'dan "products" koleksiyonunu çekip ürün kartlarına çevirir.

(function () {
  if (typeof db === "undefined" || !db) {
    console.error("Firestore (db) yok, products.js çalışmıyor.");
    return;
  }

  const listEl = document.getElementById("productList");
  const infoEl = document.getElementById("productsInfo");

  if (!listEl) {
    console.warn("productList elementi bulunamadı (id='productList').");
    return;
  }

  // İlk mesaj
  if (infoEl) {
    infoEl.textContent = "Ürünler yükleniyor...";
  }

  // Firestore'dan canlı dinleme
  db.collection("products")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snap) => {
        if (snap.empty) {
          listEl.innerHTML = "";
          if (infoEl) {
            infoEl.textContent = "Henüz hiç ürün eklenmemiş.";
          }
          return;
        }

        listEl.innerHTML = "";
        if (infoEl) {
          infoEl.textContent = "";
        }

        snap.forEach((doc) => {
          const p = doc.data() || {};
          const name = p.name || "İsimsiz ürün";
          const price = typeof p.price === "number" ? p.price : 0;
          const stock = typeof p.stock === "number" ? p.stock : 0;
          const img =
            p.imageUrl ||
            "https://via.placeholder.com/400x240?text=NexuForge";

          const stockClass =
            stock > 0 ? "product-stock" : "product-stock out";
          const stockText = stock > 0 ? `Stok: ${stock}` : "Tükendi";

          const card = document.createElement("article");
          card.className = "product-card";

          card.innerHTML = `
            <img src="${img}" alt="${name}">
            <div class="product-body">
              <div class="product-title">${name}</div>
              <div class="product-price">${price} TL</div>
              <div class="${stockClass}">${stockText}</div>
            </div>
          `;

          listEl.appendChild(card);
        });
      },
      (err) => {
        console.error("Ürünleri çekerken hata:", err);
        listEl.innerHTML = "";
        if (infoEl) {
          infoEl.textContent =
            "Ürünler yüklenirken hata oluştu: " +
            (err.message || "bilinmeyen hata");
          infoEl.style.color = "#f87171";
        }
      }
    );
})();
