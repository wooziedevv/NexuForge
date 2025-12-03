// js/admin.js

function ensureAdmin() {
  const u = getCurrentUser();
  const statusEl = document.getElementById("adminStatus");
  if (!u || (u.role !== "admin" && u.username !== "Wooziedev11")) {
    statusEl.textContent = "Bu sayfayı sadece adminler görebilir.";
    statusEl.style.color = "#f87171";
    return;
  }
  statusEl.textContent = `Admin: ${u.username}`;
  renderUsers();
  renderAdminProducts();
}

/* Kullanıcılar & roller & rozetler */

function renderUsers() {
  const users = getUsers();
  const box = document.getElementById("userList");
  box.innerHTML = "";

  users.forEach(u => {
    const div = document.createElement("div");
    div.className = "user-card";

    const roles = ["user","mod","admin"];
    const badgesList = [
      { key:"verified-blue", label:"Mavi Tik" },
      { key:"verified-gold", label:"Sarı Tik" },
      { key:"vip", label:"VIP" },
      { key:"booster", label:"Booster" }
    ];
    const themeOptions = [
      "none","neon-green","neon-blue","crimson","violet","gold","cyan",
      "sunset","gold-white","red-white","blue-pink"
    ];

    const roleOptions = roles.map(r => 
      `<option value="${r}" ${u.role===r ? "selected":""}>${r}</option>`
    ).join("");

    const badgeCheckboxes = badgesList.map(b => `
      <label style="font-size:11px;display:inline-flex;align-items:center;gap:2px;margin-right:6px;">
        <input type="checkbox" data-uid="${u.uid}" data-badge="${b.key}" ${u.badges.includes(b.key)?"checked":""}/>
        ${b.label}
      </label>
    `).join("");

    const themeSel = `
      <select data-uid="${u.uid}" data-field="theme">
        ${themeOptions.map(t => {
          const val = t==="none" ? "" : t;
          const label = t==="none" ? "Varsayılan" : t;
          const curTheme = (u.profile && u.profile.theme) || "";
          return `<option value="${val}" ${curTheme===val?"selected":""}>${label}</option>`;
        }).join("")}
      </select>
    `;

    div.innerHTML = `
      <div class="user-main">
        <div class="user-name-row">
          <strong>${u.username}</strong>
          <small style="color:#9ca3af;">${u.email}</small>
        </div>
        <div style="font-size:12px;margin-top:2px;">
          Rol:
          <select data-uid="${u.uid}" data-field="role">
            ${roleOptions}
          </select>
        </div>
        <div style="margin-top:4px;">
          ${badgeCheckboxes}
        </div>
        <div style="margin-top:4px;font-size:12px;">
          Tema: ${themeSel}
        </div>
      </div>
    `;
    box.appendChild(div);
  });

  // Rol değişimi
  box.querySelectorAll("select[data-field='role']").forEach(sel => {
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

  // Tema değişimi
  box.querySelectorAll("select[data-field='theme']").forEach(sel => {
    sel.addEventListener("change", () => {
      const uid = sel.getAttribute("data-uid");
      const users = getUsers();
      const idx = users.findIndex(u => u.uid === uid);
      if (idx !== -1) {
        if (!users[idx].profile) users[idx].profile = {};
        users[idx].profile.theme = sel.value;
        saveUsers(users);
        if (getCurrentUser() && getCurrentUser().uid === uid) {
          saveCurrentUser(users[idx]);
        }
        alert("Tema güncellendi.");
      }
    });
  });

  // Rozet değişimi
  box.querySelectorAll("input[data-badge]").forEach(chk => {
    chk.addEventListener("change", () => {
      const uid = chk.getAttribute("data-uid");
      const badge = chk.getAttribute("data-badge");
      const users = getUsers();
      const idx = users.findIndex(u => u.uid === uid);
      if (idx !== -1) {
        if (!users[idx].badges) users[idx].badges = [];
        if (chk.checked) {
          if (!users[idx].badges.includes(badge)) {
            users[idx].badges.push(badge);
          }
        } else {
          users[idx].badges = users[idx].badges.filter(b => b !== badge);
        }
        saveUsers(users);
        if (getCurrentUser() && getCurrentUser().uid === uid) {
          saveCurrentUser(users[idx]);
        }
      }
    });
  });
}

/* Ürünler */

function adminAddProduct() {
  const name  = document.getElementById("prodName").value.trim();
  const price = Number(document.getElementById("prodPrice").value) || 0;
  const stock = Number(document.getElementById("prodStock").value) || 0;
  const img   = document.getElementById("prodImage").value.trim();
  if (!name) return alert("Ürün adı girin.");

  const products = safeParse("products", []);
  products.push({
    id: "p" + Date.now(),
    name,
    price,
    stock,
    imageUrl: img || "",
    createdAt: Date.now()
  });
  localStorage.setItem("products", JSON.stringify(products));

  document.getElementById("prodName").value = "";
  document.getElementById("prodPrice").value = "";
  document.getElementById("prodStock").value = "";
  document.getElementById("prodImage").value = "";

  renderAdminProducts();
  alert("Ürün eklendi.");
}

function renderAdminProducts() {
  const box = document.getElementById("adminProductList");
  const products = safeParse("products", []);
  box.innerHTML = "";

  if (!products.length) {
    box.innerHTML = "<p class='small-text'>Henüz ürün yok.</p>";
    return;
  }

  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "user-card";
    div.innerHTML = `
      <div>
        <strong>${p.name}</strong><br>
        <small>${p.price} TL • Stok: ${p.stock}</small>
      </div>
      <button data-id="${p.id}" style="border:none;border-radius:999px;padding:4px 8px;cursor:pointer;">Sil</button>
    `;
    box.appendChild(div);
  });

  box.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      let products = safeParse("products", []);
      products = products.filter(p => p.id !== id);
      localStorage.setItem("products", JSON.stringify(products));
      renderAdminProducts();
    });
  });
}

/* Scrim */

function adminAddScrim() {
  const name = document.getElementById("eventName").value.trim();
  const date = document.getElementById("eventDate").value.trim();
  if (!name) return alert("Etkinlik adı girin.");
  const scrims = safeParse("scrims", []);
  scrims.push({ id: "s" + Date.now(), name, date, createdAt: Date.now() });
  localStorage.setItem("scrims", JSON.stringify(scrims));
  document.getElementById("eventName").value = "";
  document.getElementById("eventDate").value = "";
  alert("Etkinlik eklendi.");
}

/* Bildirim */

function adminSendNotification() {
  const cmdEl = document.getElementById("notifCommand");
  const txt = cmdEl.value.trim();
  if (!txt) return alert("Komut / mesaj girin.");

  // format: /m everyone mesaj ; /m KullanıcıAdı mesaj
  if (!txt.startsWith("/m ")) {
    return alert("Komut /m ile başlamalı. Örnek: /m everyone Turnuva başlıyor!");
  }

  const parts = txt.split(" ");
  if (parts.length < 3) return alert("Komut formatı: /m hedef mesaj");

  const targetRaw = parts[1]; // everyone veya kullanıcı adı
  const message = parts.slice(2).join(" ");
  const notifs = getNotificationsStore();
  const from  = getCurrentUser();

  if (targetRaw.toLowerCase() === "everyone") {
    notifs.push({
      id: "n" + Date.now(),
      to: "everyone",
      from: from ? from.username : "system",
      title: "Sistem Mesajı",
      text: message,
      time: Date.now()
    });
  } else {
    const user = findUserByUsername(targetRaw);
    if (!user) return alert("Böyle bir kullanıcı bulunamadı: " + targetRaw);
    notifs.push({
      id: "n" + Date.now(),
      to: user.uid,
      from: from ? from.username : "system",
      title: "Özel Mesaj",
      text: message,
      time: Date.now()
    });
  }

  saveNotificationsStore(notifs);
  cmdEl.value = "";
  alert("Bildirim gönderildi.");
}

ensureAdmin();
