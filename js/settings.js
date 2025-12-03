// js/settings.js

const settingsInfo = document.getElementById("settingsInfo");
const current = getCurrentUser();

if (!current) {
  settingsInfo.textContent = "Ayarları görmek için giriş yapmanız gerekiyor.";
  settingsInfo.style.color = "#f87171";
} else {
  settingsInfo.textContent = "Hesabı düzenliyorsunuz: " + current.username;
  document.getElementById("setUsername").textContent = current.username;
  document.getElementById("setEmail").textContent = current.email;

  // roller / rozet göster
  const rolesText = [];
  if (current.role === "admin") rolesText.push("Admin");
  if (current.role === "mod") rolesText.push("Mod");
  if (current.badges && current.badges.includes("verified-blue")) rolesText.push("Doğrulanmış (Mavi Tik)");
  if (current.badges && current.badges.includes("verified-gold")) rolesText.push("Sarı Tik");
  document.getElementById("setRoles").textContent = rolesText.join(", ") || "Standart kullanıcı";

  // güvenlik alanları
  const profile = current.profile || {};
  document.getElementById("phoneInput").value = profile.phone || "";
  document.getElementById("notifEmail").checked = !!profile.notifEmail;
  document.getElementById("notifSite").checked = !!profile.notifSite;
  document.getElementById("notifSound").checked = !!profile.notifSound;
}

function changePassword() {
  if (!current) return alert("Giriş yapmalısınız.");
  const oldPwd = document.getElementById("oldPwd").value;
  const newPwd = document.getElementById("newPwd").value;
  const newPwd2 = document.getElementById("newPwd2").value;

  if (!oldPwd || !newPwd || !newPwd2) return alert("Tüm şifre alanlarını doldurun.");
  if (oldPwd !== current.password) return alert("Eski şifre yanlış.");
  if (newPwd !== newPwd2) return alert("Yeni şifreler eşleşmiyor.");
  if (newPwd.length < 4) return alert("Yeni şifre çok kısa.");

  const users = getUsers();
  const idx = users.findIndex(u => u.uid === current.uid);
  if (idx === -1) return alert("Kullanıcı bulunamadı.");

  users[idx].password = newPwd;
  saveUsers(users);
  saveCurrentUser(users[idx]);
  alert("Şifre güncellendi.");
  document.getElementById("oldPwd").value = "";
  document.getElementById("newPwd").value = "";
  document.getElementById("newPwd2").value = "";
}

function saveSecurity() {
  if (!current) return alert("Giriş yapmalısınız.");
  const phone      = document.getElementById("phoneInput").value.trim();
  const notifEmail = document.getElementById("notifEmail").checked;
  const notifSite  = document.getElementById("notifSite").checked;
  const notifSound = document.getElementById("notifSound").checked;

  const users = getUsers();
  const idx = users.findIndex(u => u.uid === current.uid);
  if (idx === -1) return alert("Kullanıcı bulunamadı.");

  if (!users[idx].profile) users[idx].profile = {};
  users[idx].profile.phone      = phone;
  users[idx].profile.notifEmail = notifEmail;
  users[idx].profile.notifSite  = notifSite;
  users[idx].profile.notifSound = notifSound;

  saveUsers(users);
  saveCurrentUser(users[idx]);
  alert("Güvenlik ayarları kaydedildi.");
}

function logoutConfirm() {
  if (confirm("Çıkış yapmak istediğinize emin misiniz?")) {
    saveCurrentUser(null);
    window.location.href = "auth.html";
  }
}
