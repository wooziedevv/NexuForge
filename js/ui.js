const sidebar = document.getElementById("sidebar");
const hamburger = document.getElementById("hamburger");
const closeSidebar = document.getElementById("closeSidebar");

hamburger.onclick = () => {
    sidebar.classList.add("open");
};

closeSidebar.onclick = () => {
    sidebar.classList.remove("open");
};

/* ADMIN GÖRÜNÜRLÜK */
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const adminBtn = document.getElementById("adminPanelBtn");

if (currentUser && currentUser.username === "Wooziedev111") {
    adminBtn.style.display = "block";
} else {
    adminBtn.style.display = "none";
}
