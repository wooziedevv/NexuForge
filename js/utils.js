function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

/* --- Admin hesabı otomatik oluştur / güncelle --- */

(function seedAdmin() {
  const users = getUsers();

  // Eski veya yeni admin hesabını bul
  let adminUser = users.find(
    u =>
      u.email === "admin@nexuforge.local" ||
      u.username === "Wooziedev111" ||        // eski
      u.username === "Wooziedev11"           // yeni
  );

  if (adminUser) {
    // Varsa bilgilerini güncelle
    adminUser.username = "Wooziedev11";
    adminUser.email    = "admin@nexuforge.local";
    adminUser.password = "ati1234.ati";
    adminUser.role     = "admin";
  } else {
    // Yoksa yeni admin oluştur
    adminUser = {
      uid: "admin-1",
      username: "Wooziedev11",
      email: "admin@nexuforge.local",
      password: "ati1234.ati",
      role: "admin",
      profile: {}
    };
    users.push(adminUser);
  }

  saveUsers(users);
})();
