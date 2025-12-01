(function renderProducts() {
  const el = document.getElementById("productList");
  const products = JSON.parse(localStorage.getItem("products") || "[]");

  if (!products.length) {
    el.innerHTML = "<p>Henüz ürün eklenmemiş.</p>";
    return;
  }

  el.innerHTML = "";
  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${p.name}</strong><br>
      <span>${p.price} TL</span>
    `;
    el.appendChild(div);
  });
})();
