function ensureAdmin() {
  const u = getCurrentUser();
  if (!u || (u.role !== "admin" && u.username !== "Wooziedev111")) {
    document.getElementById("adminStatus").textContent = "Bu sayfayı sadece adminler görebilir.";
  } else {
    document.getElementById("adminStatus").textContent = `Admin: ${u.username}`;
    renderUsers();
  }
}

function renderUsers() {
  const users = getUsers();
  const box = document.getElementById("userList");
  box.innerHTML = "";
  users.forEach(u => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${u.username}</strong> <small>${u.email}</small><br>
      Rol: <select data-uid="${u.uid}">
        <option value="user" ${u.role === "user" ? "selected" : ""}>User</option>
        <option value="mod" ${u.role === "mod" ? "selected" : ""}>Mod</option>
        <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
      </select>
    `;
    box.appendChild(div);
  });

  box.querySelectorAll("select").forEach(sel => {
    sel.addEventListener("change", () => {
      const uid = sel.getAttribute("data-uid");
      const users = getUsers();
      const idx = users.findIndex(u => u.uid === uid);
      if (idx !== -1) {
        users[idx].role = sel.value;
        saveUsers(users);
        if (getCurrentUser() && getCurrentUser().uid === uid) {
          saveCurrentUser(users[idx]);
        }
        alert("Rol güncellendi.");
      }
    });
  });
}

function adminAddProduct() {
  const name = document.getElementById("prodName").value.trim();
  const price = Number(document.getElementById("prodPrice").value) || 0;
  if (!name) return alert("Ürün adı girin.");
  const products = JSON.parse(localStorage.getItem("products") || "[]");
  products.push({ id: "p" + Date.now(), name, price });
  localStorage.setItem("products", JSON.stringify(products));
  alert("Ürün eklendi (demo).");
}

function adminAddScrim() {
  const name = document.getElementById("eventName").value.trim();
  const date = document.getElementById("eventDate").value.trim();
  if (!name) return alert("Etkinlik adı girin.");
  const scrims = JSON.parse(localStorage.getItem("scrims") || "[]");
  scrims.push({ id: "s" + Date.now(), name, date });
  localStorage.setItem("scrims", JSON.stringify(scrims));
  alert("Etkinlik eklendi (demo).");
}

ensureAdmin();
