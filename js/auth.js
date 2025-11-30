/* Kullanıcı Listesi */
if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
}

/* Kayıt */
function registerUser() {
    let username = document.getElementById("reg_username").value.trim();
    let email = document.getElementById("reg_email").value.trim();
    let password = document.getElementById("reg_password").value;

    let users = JSON.parse(localStorage.getItem("users"));

    if (users.find(u => u.email === email)) {
        alert("Bu e-mail zaten kullanılıyor.");
        return;
    }

    users.push({
        username,
        email,
        password,
        uid: "u" + Date.now()
    });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Kayıt başarılı!");
}

/* Giriş */
function loginUser() {
    let email = document.getElementById("login_email").value.trim();
    let password = document.getElementById("login_password").value;

    let users = JSON.parse(localStorage.getItem("users"));

    let user = users.find(u => u.email === email && u.password === password);

    if (!user) return alert("Hatalı giriş!");

    localStorage.setItem("currentUser", JSON.stringify(user));

    alert("Giriş başarılı!");
    window.location = "index.html";
}
