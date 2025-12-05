// js/utils.js
// LocalStorage yardımcıları (currentUser, DM, bildirim vs.)

/* ========== Genel helper ========== */

function safeParse(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}

/* ========== Kullanıcı cache (local) ========== */
/* NOT: Asıl kullanıcılar Firebase Auth + Firestore'da.
   Buradaki "users" daha çok eski DM / ayar sistemine yönelik local cache.
   Şu an core işimiz için sadece currentUser önemli. */

function getUsers() {
  return safeParse("users", []);
}

function saveUsers(arr) {
  localStorage.setItem("users", JSON.stringify(arr || []));
}

/* currentUser:
   auth-firebase.js, Firebase'den gelen kullanıcıyı buraya yazar.
*/

function getCurrentUser() {
  return safeParse("currentUser", null);
}

function saveCurrentUser(user) {
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("currentUser");
  }
}

/* İsteğe bağlı: local user listesini normalize et (alanlar eksikse doldur) */

function normalizeUsers() {
  const users = getUsers().map((u) => {
    if (!u.role) u.role = "user";
    if (!u.profile) u.profile = {};
    if (!u.friends) u.friends = [];
    if (!u.friendRequests) u.friendRequests = [];
    if (!u.badges) u.badges = [];
    return u;
  });

  saveUsers(users);

  // currentUser da bu listeden güncellensin
  const cur = getCurrentUser();
  if (cur) {
    const fresh = users.find((u) => u.uid === cur.uid);
    if (fresh) saveCurrentUser(fresh);
  }
}

/* ========== DM local store (ileride Firestore'a taşınabilir) ========== */

function getDms() {
  return safeParse("dms", {}); // { dmKey: [ {fromUid,toUid,text,time} ] }
}

function saveDms(dms) {
  localStorage.setItem("dms", JSON.stringify(dms || {}));
}

/* ========== Bildirim store (local) ========== */
/* Şu an için admin panelden / js'den üretilebilir; ileride Firestore'a da taşıyabiliriz. */

function getNotificationsStore() {
  return safeParse("notifications", []); // {id,to,from,title,text,time}
}

function saveNotificationsStore(arr) {
  localStorage.setItem("notifications", JSON.stringify(arr || []));
}
