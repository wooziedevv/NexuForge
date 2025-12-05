// js/products.js
// Firestore'daki "products" koleksiyonunu okuyup kart olarak gösterir.

(function initProductList() {
  if (!db) {
    console.error("db yok (Firestore).");
    return;
  }

  const grid = document.getElementById("productsGrid");
  const emptyText = document.getElementById("productsEmptyText");

  if (!grid) return;

  // Canlı dinleme: ürün eklenince / silinince anında güncellenir
  db.collection("products")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snap) => {
        if (snap.empty) {
          grid.innerHTML = "";
          if (emptyText) emptyText.style.display = "block";
          return;
        }

        if (emptyText) emptyText.style.display = "none";
        grid.innerHTML = "";

        snap.forEach((doc) => {
          const p = doc.data();
          const id = doc.id;

          const card = document.createElement("article");
          card.className = "product-card";

          const imgUrl =
            p.imageUrl ||
            "https://via.placeholder.com/400x240?text=NexuForge+Product";

          const stockClass =
            p.stock > 0 ? "product-stock" : "product-stock out";
          const stockText = p.stock > 0 ? `Stok: ${p.stock}` : "Tükendi";

          card.innerHTML = `
            <div class="product-image-wrap">
              <img src="${imgUrl}" alt="${p.name || ""}">
            </div>
            <div class="product-body">
              <div class="product-title">${p.name || "İsimsiz Ürün"}</div>
              <div class="product-meta">
                <span class="product-price">${p.price || 0} TL</span>
                <span class="${stockClass}">${stockText}</span>
              </div>
            </div>
          `;

          grid.appendChild(card);
        });
      },
      (err) => {
        console.error("Ürünleri çekerken hata:", err);
        if (emptyText) {
          emptyText.style.display = "block";
          emptyText.textContent =
            "Ürünler yüklenirken hata oluştu: " + (err.message || "");
        }
      }
    );
})();
