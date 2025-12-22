// js/settings-firebase.js
// Ayarlar: profil güvenlik alanları (Firestore) + şifre değiştir (Firebase Auth) + çıkış

(function () {
  if (typeof firebase === "undefined") {
    console.error("Firebase global yok (settings-firebase).");
    return;
  }
  if (typeof db === "undefined" || !db) {
    console.error("Firestore (db) yok (settings-firebase).");
    return;
  }

  const auth = firebase.auth();

  const settingsInfo = document.getElementById("settingsInfo");
  const setUsername = document.getElementById("setUsername");
  const setEmail = document.getElementById("setEmail");
  const setRoles = document.getElementById("setRoles");

  const phoneInput = document.getElementById("phoneInput");
  const notifEmail = document.getElementById("notifEmail");
  const notifSite  = document.getElementById("notifSite");
  const notifSound = document.getElementById("notifSound");

  let me = null;

  function rolesText(u){
    const roles = [];
    if (!u) return "Standart kullanıcı";
    if (u.role === "admin") roles.push("Admin");
    if (u.role === "mod") roles.push("Mod");
    if (u.badges?.includes("verified-blue")) roles.push("Doğrulanmış (Mavi Tik)");
    if (u.badges?.includes("verified-gold")) roles.push("Sarı Tik");
    return roles.join(", ") || "Standart kullanıcı";
  }

  function render(){
    if (!settingsInfo) return;

    if (!me){
      settingsInfo.textContent = "Ayarları görmek için giriş yapmanız gerekiyor.";
      settingsInfo.style.color = "#f87171";
      return;
    }

    settingsInfo.textContent = "Hesabı düzenliyorsunuz: " + (me.username || "");
    settingsInfo.style.color = "#e5e5e5";

    if (setUsername) setUsername.textContent = me.username || "";
    if (setEmail) setEmail.textContent = me.email || "";
    if (setRoles) setRoles.textContent = rolesText(me);

    const p = me.profile || {};
    if (phoneInput) phoneInput.value = p.phone || "";
    if (notifEmail) notifEmail.checked = !!p.notifEmail;
    if (notifSite)  notifSite.checked  = !!p.notifSite;
    if (notifSound) notifSound.checked = !!p.notifSound;
  }

  async function saveSecurity(){
    if (!me) return alert("Giriş yapmalısınız.");

    const updates = {
      profile: {
        ...(me.profile || {}),
        phone: (phoneInput?.value || "").trim(),
        notifEmail: !!notifEmail?.checked,
        notifSite:  !!notifSite?.checked,
        notifSound: !!notifSound?.checked
      }
    };

    try{
      await db.collection("users").doc(me.uid).set(updates, { merge: true });
      alert("Güvenlik ayarları kaydedildi.");
    }catch(err){
      console.error("saveSecurity hata:", err);
      alert("Kaydedilemedi: " + (err.message || "bilinmeyen"));
    }
  }

  async function changePassword(){
    const fbUser = auth.currentUser;
    if (!fbUser) return alert("Giriş yapmalısınız.");

    const oldPwd = document.getElementById("oldPwd").value;
    const newPwd = document.getElementById("newPwd").value;
    const newPwd2= document.getElementById("newPwd2").value;

    if (!oldPwd || !newPwd || !newPwd2) return alert("Tüm şifre alanlarını doldurun.");
    if (newPwd !== newPwd2) return alert("Yeni şifreler eşleşmiyor.");
    if (newPwd.length < 6) return alert("Yeni şifre en az 6 karakter olmalı.");

    try{
      const cred = firebase.auth.EmailAuthProvider.credential(fbUser.email, oldPwd);
      await fbUser.reauthenticateWithCredential(cred);
      await fbUser.updatePassword(newPwd);

      alert("Şifre güncellendi.");

      document.getElementById("oldPwd").value = "";
      document.getElementById("newPwd").value = "";
      document.getElementById("newPwd2").value = "";
    }catch(err){
      console.error("changePassword hata:", err);
      alert("Şifre güncellenemedi: " + (err.message || "bilinmeyen"));
    }
  }

  async function logoutConfirm(){
    if (!confirm("Çıkış yapmak istediğinize emin misiniz?")) return;

    try { await auth.signOut(); } catch(e){}
    try { saveCurrentUser(null); } catch(e){}
    window.location.href = "auth.html";
  }

  // HTML'deki onclick'ler için global
  window.saveSecurity = saveSecurity;
  window.changePassword = changePassword;
  window.logoutConfirm = logoutConfirm;

  auth.onAuthStateChanged((fbUser) => {
    if (!fbUser){
      me = null;
      render();
      return;
    }

    db.collection("users").doc(fbUser.uid).onSnapshot((snap) => {
      if (!snap.exists) return;
      me = { uid: snap.id, ...(snap.data()||{}) };

      // local cache (menü vs için)
      try {
        saveCurrentUser({
          uid: me.uid,
          email: me.email,
          username: me.username,
          role: me.role || "user",
          profile: me.profile || {},
          friends: me.friends || [],
          friendRequests: me.friendRequests || [],
          badges: me.badges || []
        });
      } catch(e){}

      render();
    });
  });

})();
