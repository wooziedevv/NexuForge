// js/db-init.js
// Tüm sitede kullanacağımız Firestore referansı

var db = null;

(function initFirestore() {
  if (typeof firebase === "undefined") {
    console.error("Firebase global bulunamadı (db-init).");
    return;
  }

  // initializeApp başka bir yerde çağrılmışsa hata vermesin
  try {
    if (!firebase.apps || firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
  } catch (e) {
    if (!e || e.code !== "app/duplicate-app") {
      console.warn("Firebase init (db-init) uyarı:", e);
    }
  }

  try {
    db = firebase.firestore();
    console.log("Firestore hazır.");
  } catch (err) {
    console.error("Firestore başlatılırken hata:", err);
  }
})();
