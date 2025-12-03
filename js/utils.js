// js/utils.js

function safeParse(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}

/* KULLANICILAR */

function getUsers() {
  return safeParse("users", []);
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
  return safeParse("currentUser", null);
}

function saveCurrentUser(user) {
  if (user) localStorage.setItem("currentUser", JSON.stringify(user));
  else localStorage.removeItem("currentUser");
}

function findUserByUsername(username) {
  const users = getUsers();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

function normalizeUsers() {
  const users = getUsers().map(u => {
    if (!u.role) u.role = "user";
    if (!u.profile) u.profile = {};
    if (!u.friends) u.friends = [];
    if (!u.friendRequests) u.friendRequests = [];
    if (!u.badges) u.badges = [];
    return u;
  });
  saveUsers(users);

  const cur = getCurrentUser();
  if (cur) {
    const fresh = users.find(u => u.uid === cur.uid);
    if (fresh) saveCurrentUser(fresh);
  }
}

/* DM / MESAJLAR */

function dmKey(uid1, uid2) {
  return uid1 < uid2 ? uid1 + "_" + uid2 : uid2 + "_" + uid1;
}

function getDms() {
  return safeParse("dms", {}); // { dmKey: [ {fromUid,toUid,text,time} ] }
}

function saveDms(dms) {
  localStorage.setItem("dms", JSON.stringify(dms));
}

/* BİLDİRİMLER */

function getNotificationsStore() {
  return safeParse("notifications", []); // {id,to,from,title,text,time}
}

function saveNotificationsStore(arr) {
  localStorage.setItem("notifications", JSON.stringify(arr));
}

/* ADMIN SEED – Wooziedev11 */

(function seedAdmin() {
  normalizeUsers();
  let users = getUsers();

  let adminUser = users.find(
    u =>
      u.email === "admin@nexuforge.local" ||
      u.username === "Wooziedev111" ||
      u.username === "Wooziedev11"
  );

  if (adminUser) {
    adminUser.username = "Wooziedev11";
    adminUser.email = "admin@nexuforge.local";
    adminUser.password = "ati1234.ati";
    adminUser.role = "admin";
  } else {
    adminUser = {
      uid: "admin-1",
      username: "Wooziedev11",
      email: "admin@nexuforge.local",
      password: "ati1234.ati",
      role: "admin",
      profile: {},
      friends: [],
      friendRequests: [],
      badges: ["verified-gold"]
    };
    users.push(adminUser);
  }

  saveUsers(users);
})();
