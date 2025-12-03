// js/products.js

(function renderProducts() {
  const el = document.getElementById("productList");
  const products = safeParse("products", []);

  if (!products.length) {
    el.innerHTML = "<p>Henüz ürün eklenmemiş.</p>";
    return;
  }

  el.innerHTML = "";
  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "product-card";

    const stockClass = p.stock > 0 ? "product-stock" : "product-stock out";
    const stockText  = p.stock > 0 ? `Stok: ${p.stock}` : "Tükendi";

    div.innerHTML = `
      <img src="${p.imageUrl || "https://via.placeholder.com/400x240?text=NexuForge"}" alt="${p.name}">
      <div class="product-body">
        <div class="product-title">${p.name}</div>
        <div class="product-price">${p.price} TL</div>
        <div class="${stockClass}">${stockText}</div>
      </div>
    `;
    el.appendChild(div);
  });
})();
