// js/auth-firebase.js

// Firebase'i başlat
if (typeof firebase !== "undefined") {
  if (!firebase.apps || firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }
}
const auth = firebase.auth();

// Firebase -> bizim kullandığımız user formatı
function toLocalUser(firebaseUser, extraProfile = {}) {
  if (!firebaseUser) return null;
  const email = firebaseUser.email || "";
  const usernameFromMail = email.split("@")[0] || "kullanici";

  return {
    uid: firebaseUser.uid,
    username: extraProfile.username || usernameFromMail,
    email,
    password: null,
    role: extraProfile.role || "user",
    profile: extraProfile.profile || {},
    friends: extraProfile.friends || [],
    friendRequests: extraProfile.friendRequests || [],
    badges: extraProfile.badges || []
  };
}

async function registerUser() {
  const usernameEl = document.getElementById("regUsername");
  const emailEl    = document.getElementById("regEmail");
  const passEl     = document.getElementById("regPassword");
  const infoEl     = document.getElementById("registerInfo");

  const username = usernameEl.value.trim();
  const email    = emailEl.value.trim().toLowerCase();
  const password = passEl.value;

  if (!username || !email || !password) {
    infoEl.textContent = "Tüm alanları doldurun.";
    infoEl.style.color = "#f87171";
    return;
  }

  infoEl.textContent = "Kayıt yapılıyor...";
  infoEl.style.color = "#e5e5e5";

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const fbUser = cred.user;

    let users = getUsers();
    users.push({
      uid: fbUser.uid,
      username,
      email: fbUser.email,
      password: null,
      role: "user",
      profile: {},
      friends: [],
      friendRequests: [],
      badges: []
    });
    saveUsers(users);

    const localUser = toLocalUser(fbUser, users.find(u => u.uid === fbUser.uid));
    saveCurrentUser(localUser);

    infoEl.textContent = "Kayıt başarılı! Oturum açtınız.";
    infoEl.style.color = "#4ade80";

    usernameEl.value = "";
    emailEl.value = "";
    passEl.value = "";
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    infoEl.textContent = "Hata: " + (err.message || "Kayıt başarısız.");
    infoEl.style.color = "#f87171";
    alert("Kayıt hatası: " + err.code); // hata kodunu da görebil
  }
}

async function loginUser() {
  const emailEl = document.getElementById("loginEmail");
  const passEl  = document.getElementById("loginPassword");
  const infoEl  = document.getElementById("loginInfo");

  const email    = emailEl.value.trim().toLowerCase();
  const password = passEl.value;

  if (!email || !password) {
    infoEl.textContent = "E-posta ve şifre zorunlu.";
    infoEl.style.color = "#f87171";
    return;
  }

  infoEl.textContent = "Giriş yapılıyor...";
  infoEl.style.color = "#e5e5e5";

  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    const fbUser = cred.user;

    let users = getUsers();
    let u = users.find(x => x.uid === fbUser.uid);
    if (!u) {
      u = {
        uid: fbUser.uid,
        username: (fbUser.email || "").split("@")[0],
        email: fbUser.email,
        password: null,
        role: "user",
        profile: {},
        friends: [],
        friendRequests: [],
        badges: []
      };
      users.push(u);
      saveUsers(users);
    }

    const localUser = toLocalUser(fbUser, u);
    saveCurrentUser(localUser);

    infoEl.textContent = "Giriş başarılı: " + localUser.username;
    infoEl.style.color = "#4ade80";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 700);
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    infoEl.textContent = "Hata: " + (err.message || "Giriş başarısız.");
    infoEl.style.color = "#f87171";
    alert("Giriş hatası: " + err.code);
  }
}

// Oturum takibi
auth.onAuthStateChanged((fbUser) => {
  const infoEl = document.getElementById("loginInfo");

  if (!fbUser) {
    saveCurrentUser(null);
    if (infoEl) {
      infoEl.textContent = "Giriş yapılmamış.";
      infoEl.style.color = "#9ca3af";
    }
    return;
  }

  let users = getUsers();
  let u = users.find(x => x.uid === fbUser.uid);
  if (!u) {
    u = {
      uid: fbUser.uid,
      username: (fbUser.email || "").split("@")[0],
      email: fbUser.email,
      password: null,
      role: "user",
      profile: {},
      friends: [],
      friendRequests: [],
      badges: []
    };
    users.push(u);
    saveUsers(users);
  }

  const localUser = toLocalUser(fbUser, u);
  saveCurrentUser(localUser);

  if (infoEl) {
    infoEl.textContent = "Şu an giriş yapan: " + localUser.username + " (" + localUser.email + ")";
    infoEl.style.color = "#e5e5e5";
  }
});
