// js/auth-firebase.js

// Global auth
var auth = null;

// Küfür filtresi (burada da dursun, kayıt kontrolü için)
var bannedWords = [
  "amk","aq","piç","orospu","sikerim","göt","yarak",
  "sürtük","pedofil","sapık","sapkın"
];

// Firebase + Auth + Firestore başlat
(function initFirebaseAuth() {
  if (typeof firebase === "undefined") {
    console.error("Firebase global yok (auth-firebase).");
    return;
  }

  try {
    if (!firebase.apps || firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
  } catch (e) {
    if (!e || e.code !== "app/duplicate-app") {
      console.warn("Firebase init (auth) uyarı:", e);
    }
  }

  auth = firebase.auth();
  console.log("Auth hazır.");
})();

// Yardımcı: Firebase user + Firestore userData -> local currentUser formatı
function toLocalUserFromData(uid, email, data) {
  if (!uid || !email || !data) return null;

  return {
    uid: uid,
    email: email,
    username: data.username || (email.split("@")[0] || "kullanici"),
    role: data.role || "user",
    profile: data.profile || {},
    friends: data.friends || [],
    friendRequests: data.friendRequests || [],
    badges: data.badges || []
  };
}

/* ============ KAYIT ============ */
async function registerUser() {
  const usernameEl = document.getElementById("regUsername");
  const emailEl    = document.getElementById("regEmail");
  const passEl     = document.getElementById("regPassword");
  const infoEl     = document.getElementById("registerInfo");

  const username = (usernameEl.value || "").trim();
  const email    = (emailEl.value || "").trim().toLowerCase();
  const password = passEl.value || "";

  if (!auth) {
    alert("Auth hazır değil (Firebase yüklenemedi).");
    return;
  }

  if (!username || !email || !password) {
    infoEl.textContent = "Tüm alanları doldurun.";
    infoEl.style.color = "#f87171";
    return;
  }

  const low = username.toLowerCase();
  if (bannedWords.some(w => low.includes(w))) {
    infoEl.textContent = "Bu kullanıcı adı uygun değil.";
    infoEl.style.color = "#f87171";
    return;
  }

  infoEl.textContent = "Kayıt yapılıyor...";
  infoEl.style.color = "#e5e5e5";

  try {
    const firestore = firebase.firestore();
    const usersRef = firestore.collection("users");

    // Kullanıcı adı benzersiz mi? (usernameLower ile kontrol)
    const usernameLower = username.toLowerCase();
    const usernameSnap = await usersRef
      .where("usernameLower", "==", usernameLower)
      .get();

    if (!usernameSnap.empty) {
      infoEl.textContent = "Bu kullanıcı adı alınmış.";
      infoEl.style.color = "#f87171";
      return;
    }

    // Firebase Auth tarafında kullanıcı oluştur
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const fbUser = cred.user;

    // İlk kayıt sırasında Wooziedev11 ise direkt admin yap
    const isOwner = usernameLower === "wooziedev11";
    const role = isOwner ? "admin" : "user";

    // Firestore'da users/{uid} dokümanı
    await usersRef.doc(fbUser.uid).set({
      username: username,
      usernameLower: usernameLower,
      email: fbUser.email,
      role: role,
      profile: {},
      friends: [],
      friendRequests: [],
      badges: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    const localUser = toLocalUserFromData(fbUser.uid, fbUser.email, {
      username,
      role,
      profile: {},
      friends: [],
      friendRequests: [],
      badges: []
    });

    saveCurrentUser(localUser);

    infoEl.textContent = "Kayıt başarılı! Oturum açtınız.";
    infoEl.style.color = "#4ade80";

    usernameEl.value = "";
    emailEl.value = "";
    passEl.value = "";
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    const msg = err && err.message ? err.message : "Kayıt başarısız.";
    infoEl.textContent = "Hata: " + msg;
    infoEl.style.color = "#f87171";
    alert("Kayıt hatası: " + (err.code || msg));
  }
}

/* ============ GİRİŞ ============ */
async function loginUser() {
  const emailEl = document.getElementById("loginEmail");
  const passEl  = document.getElementById("loginPassword");
  const infoEl  = document.getElementById("loginInfo");

  const email    = (emailEl.value || "").trim().toLowerCase();
  const password = passEl.value || "";

  if (!auth) {
    alert("Auth hazır değil (Firebase yüklenemedi).");
    return;
  }

  if (!email || !password) {
    infoEl.textContent = "E-posta ve şifre zorunlu.";
    infoEl.style.color = "#f87171";
    return;
  }

  infoEl.textContent = "Giriş yapılıyor...";
  infoEl.style.color = "#e5e5e5";

  try {
    await auth.signInWithEmailAndPassword(email, password);
    // onAuthStateChanged içinden localUser set edilecek.
    infoEl.textContent = "Giriş başarılı.";
    infoEl.style.color = "#4ade80";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 700);
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    const msg = err && err.message ? err.message : "Giriş başarısız.";
    infoEl.textContent = "Hata: " + msg;
    infoEl.style.color = "#f87171";
    alert("Giriş hatası: " + (err.code || msg));
  }
}

/* ============ OTURUM TAKİBİ ============ */
if (typeof firebase !== "undefined") {
  auth = firebase.auth();

  auth.onAuthStateChanged(async (fbUser) => {
    const infoEl = document.getElementById("loginInfo");

    if (!fbUser) {
      saveCurrentUser(null);
      if (infoEl) {
        infoEl.textContent = "Giriş yapılmamış.";
        infoEl.style.color = "#9ca3af";
      }
      return;
    }

    try {
      const firestore = firebase.firestore();
      const usersRef = firestore.collection("users");
      const docRef = usersRef.doc(fbUser.uid);
      const snap = await docRef.get();

      let data;

      if (!snap.exists) {
        // İlk kez giriş yapan (veya eski kayıt), kullanıcı dokümanı yoksa oluştur
        const email = fbUser.email || "";
        const usernameFromMail = email.split("@")[0] || "kullanici";
        const usernameLower = usernameFromMail.toLowerCase();

        const isOwner = usernameLower === "wooziedev11";
        const role = isOwner ? "admin" : "user";

        data = {
          username: usernameFromMail,
          usernameLower: usernameLower,
          email: email,
          role: role,
          profile: {},
          friends: [],
          friendRequests: [],
          badges: [],
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await docRef.set(data);
      } else {
        data = snap.data() || {};
        // Eğer rol yoksa ve kullanıcı adı Wooziedev11 ise, otomatik admin'e çek
        const usernameLower = (data.username || "")
          .toString()
          .toLowerCase();
        if (!data.role && usernameLower === "wooziedev11") {
          data.role = "admin";
          await docRef.update({ role: "admin" });
        }
      }

      const localUser = toLocalUserFromData(fbUser.uid, fbUser.email, data);
      saveCurrentUser(localUser);

      if (infoEl) {
        infoEl.textContent =
          "Şu an giriş yapan: " +
          localUser.username +
          " (" +
          localUser.email +
          ") – rol: " +
          localUser.role;
        infoEl.style.color = "#e5e5e5";
      }
    } catch (err) {
      console.error("Auth state -> user doc hatası:", err);
    }
  });
}
