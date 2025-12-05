// js/auth-firebase.js

// Global auth değişkeni (var = TDZ hatası yok)
var auth = null;

// Firebase başlat + auth hazırla
(function initFirebaseAuth() {
  if (typeof firebase === "undefined") {
    console.error("Firebase global bulunamadı");
    return;
  }

  try {
    if (!firebase.apps || firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
  } catch (e) {
    if (!e || e.code !== "app/duplicate-app") {
      console.error("Firebase init hatası:", e);
    }
  }

  auth = firebase.auth();

  // Oturum değişince çalışır
  auth.onAuthStateChanged(function (fbUser) {
    var infoEl = document.getElementById("loginInfo");

    if (!fbUser) {
      saveCurrentUser(null);
      if (infoEl) {
        infoEl.textContent = "Giriş yapılmamış.";
        infoEl.style.color = "#9ca3af";
      }
      return;
    }

    var users = getUsers();
    var u = users.find(function (x) { return x.uid === fbUser.uid; });

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

    var localUser = {
      uid: fbUser.uid,
      username: u.username,
      email: fbUser.email,
      password: null,
      role: u.role || "user",
      profile: u.profile || {},
      friends: u.friends || [],
      friendRequests: u.friendRequests || [],
      badges: u.badges || []
    };

    saveCurrentUser(localUser);

    if (infoEl) {
      infoEl.textContent =
        "Şu an giriş yapan: " + localUser.username + " (" + localUser.email + ")";
      infoEl.style.color = "#e5e5e5";
    }
  });
})();

/* ============ KAYIT ============ */
function registerUser() {
  var usernameEl = document.getElementById("regUsername");
  var emailEl    = document.getElementById("regEmail");
  var passEl     = document.getElementById("regPassword");
  var infoEl     = document.getElementById("registerInfo");

  var username = usernameEl.value.trim();
  var email    = emailEl.value.trim().toLowerCase();
  var password = passEl.value;

  if (!auth) {
    alert("Auth hazır değil (Firebase yüklenemedi)");
    return;
  }

  if (!username || !email || !password) {
    infoEl.textContent = "Tüm alanları doldurun.";
    infoEl.style.color = "#f87171";
    return;
  }

  var low = username.toLowerCase();
  if (typeof bannedWords !== "undefined" &&
      bannedWords.some(function (w) { return low.includes(w); })) {
    infoEl.textContent = "Bu kullanıcı adı uygun değil.";
    infoEl.style.color = "#f87171";
    return;
  }

  infoEl.textContent = "Kayıt yapılıyor...";
  infoEl.style.color = "#e5e5e5";

  auth.createUserWithEmailAndPassword(email, password)
    .then(function (cred) {
      var fbUser = cred.user;

      var users = getUsers();
      users.push({
        uid: fbUser.uid,
        username: username,
        email: fbUser.email,
        password: null,
        role: "user",
        profile: {},
        friends: [],
        friendRequests: [],
        badges: []
      });
      saveUsers(users);

      var localUser = {
        uid: fbUser.uid,
        username: username,
        email: fbUser.email,
        password: null,
        role: "user",
        profile: {},
        friends: [],
        friendRequests: [],
        badges: []
      };
      saveCurrentUser(localUser);

      infoEl.textContent = "Kayıt başarılı! Oturum açtınız.";
      infoEl.style.color = "#4ade80";

      usernameEl.value = "";
      emailEl.value = "";
      passEl.value = "";
    })
    .catch(function (err) {
      console.error("REGISTER ERROR:", err);
      infoEl.textContent = "Hata: " + (err.message || "Kayıt başarısız.");
      infoEl.style.color = "#f87171";
      // burada err.code olmayabiliyor, o yüzden message gösterelim
      alert("Kayıt hatası: " + (err.message || err.code || "Bilinmeyen hata"));
    });
}

/* ============ GİRİŞ ============ */
function loginUser() {
  var emailEl = document.getElementById("loginEmail");
  var passEl  = document.getElementById("loginPassword");
  var infoEl  = document.getElementById("loginInfo");

  var email    = emailEl.value.trim().toLowerCase();
  var password = passEl.value;

  if (!auth) {
    alert("Auth hazır değil (Firebase yüklenemedi)");
    return;
  }

  if (!email || !password) {
    infoEl.textContent = "E-posta ve şifre zorunlu.";
    infoEl.style.color = "#f87171";
    return;
  }

  infoEl.textContent = "Giriş yapılıyor...";
  infoEl.style.color = "#e5e5e5";

  auth.signInWithEmailAndPassword(email, password)
    .then(function (cred) {
      var fbUser = cred.user;

      var users = getUsers();
      var u = users.find(function (x) { return x.uid === fbUser.uid; });

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

      var localUser = {
        uid: fbUser.uid,
        username: u.username,
        email: fbUser.email,
        password: null,
        role: u.role || "user",
        profile: u.profile || {},
        friends: u.friends || [],
        friendRequests: u.friendRequests || [],
        badges: u.badges || []
      };
      saveCurrentUser(localUser);

      infoEl.textContent = "Giriş başarılı: " + localUser.username;
      infoEl.style.color = "#4ade80";

      setTimeout(function () {
        window.location.href = "index.html";
      }, 700);
    })
    .catch(function (err) {
      console.error("LOGIN ERROR:", err);
      infoEl.textContent = "Hata: " + (err.message || "Giriş başarısız.");
      infoEl.style.color = "#f87171";
      alert("Giriş hatası: " + (err.message || err.code || "Bilinmeyen hata"));
    });
}
