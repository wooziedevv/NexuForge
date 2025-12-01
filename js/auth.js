const bannedWords = ["amk","aq","piç","orospu","sikerim","göt","yarak","sürtük","pedofil","sapık","sapkın"];

function registerUser() {
  const username = document.getElementById("regUsername").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const password = document.getElementById("regPassword").value;

  if (!username || !email || !password) {
    return alert("Tüm alanları doldurun.");
  }

  const low = username.toLowerCase();
  if (bannedWords.some(w => low.includes(w))) {
    return alert("Kullanıcı adı uygun değil.");
  }

  let users = getUsers();
  if (users.some(u => u.email === email)) {
    return alert("Bu e-posta zaten kayıtlı.");
  }
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return alert("Bu kullanıcı adı alınmış.");
  }

  const newUser = {
    uid: "u" + Date.now(),
    username,
    email,
    password,
    role: "user"
  };

  users.push(newUser);
  saveUsers(users);
  alert("Kayıt başarılı. Giriş yapabilirsiniz.");
}

function loginUser() {
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;
  const info = document.getElementById("loginInfo");

  let users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    info.textContent = "E-posta veya şifre hatalı.";
    return;
  }

  saveCurrentUser(user);
  info.textContent = `Giriş başarılı: ${user.username}`;
  setTimeout(() => {
    location.href = "index.html";
  }, 600);
}
