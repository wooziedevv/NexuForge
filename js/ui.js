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

/* ADMIN SEED – Wooziedev111 */
(function seedAdmin() {
  let users = getUsers();
  if (!users.some(u => u.username === "Wooziedev111")) {
    users.push({
      uid: "admin-" + Date.now(),
      username: "Wooziedev111",
      email: "admin@nexuforge.local",
      password: "ati1234.ati",
      role: "admin"
    });
    saveUsers(users);
  }
})();
