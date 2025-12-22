// js/auth-firebase.js

var auth = null;

// Küfür filtresi (kayıt için)
var bannedWords = [
  "amk","aq","piç","orospu","sikerim","göt","yarak",
  "sürtük","pedofil","sapık","sapkın"
];

(function initFirebaseAuth() {
  if (typeof firebase === "undefined") {
    console.error("Firebase global yok (auth-firebase).");
    return;
  }

  try {
    if (!firebase.apps || firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
  } catch (e) {}

  auth = firebase.auth();
})();

/* Firebase user + Firestore user → local cache */
function toLocalUser(uid, email, data) {
  return {
    uid,
    email,
    username: data.username,
    role: data.role || "user",
    profile: data.profile || {},
    friends: data.friends || [],
    friendRequests: data.friendRequests || [],
    badges: data.badges || []
  };
}

/* ========== KAYIT ========== */
async function registerUser() {
  const username = regUsername.value.trim();
  const email    = regEmail.value.trim().toLowerCase();
  const password = regPassword.value;

  if (!username || !email || !password) {
    return registerInfo.textContent = "Tüm alanları doldurun.";
  }

  if (bannedWords.some(w => username.toLowerCase().includes(w))) {
    return registerInfo.textContent = "Bu kullanıcı adı uygun değil.";
  }

  try {
    const usersRef = firebase.firestore().collection("users");

    const taken = await usersRef
      .where("usernameLower", "==", username.toLowerCase())
      .get();

    if (!taken.empty) {
      return registerInfo.textContent = "Bu kullanıcı adı alınmış.";
    }

    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const uid = cred.user.uid;

    const isOwner = username.toLowerCase() === "wooziedev11";

    const userData = {
      username,
      usernameLower: username.toLowerCase(),
      email,
      role: isOwner ? "admin" : "user",
      profile: {},
      friends: [],
      friendRequests: [],
      badges: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await usersRef.doc(uid).set(userData);
    saveCurrentUser(toLocalUser(uid, email, userData));

    registerInfo.textContent = "Kayıt başarılı.";
  } catch (err) {
    registerInfo.textContent = "Hata: " + err.message;
  }
}

/* ========== GİRİŞ ========== */
async function loginUser() {
  const email = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value;

  if (!email || !password) {
    return loginInfo.textContent = "E-posta ve şifre zorunlu.";
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);
    loginInfo.textContent = "Giriş başarılı.";
    setTimeout(() => location.href = "index.html", 600);
  } catch (err) {
    loginInfo.textContent = "Hata: " + err.message;
  }
}

/* ========== OTURUM TAKİBİ ========== */
auth.onAuthStateChanged(async (fbUser) => {
  if (!fbUser) {
    saveCurrentUser(null);
    return;
  }

  const snap = await firebase.firestore()
    .collection("users")
    .doc(fbUser.uid)
    .get();

  if (!snap.exists) return;

  saveCurrentUser(
    toLocalUser(fbUser.uid, fbUser.email, snap.data())
  );
});
