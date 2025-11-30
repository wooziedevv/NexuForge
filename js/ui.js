/* HAMBURGER MENÜ AÇ / KAPAT */
const sidebar = document.getElementById("sidebar");
const hamburger = document.getElementById("hamburger");
const closeSidebarBtn = document.getElementById("closeSidebar");

hamburger.addEventListener("click", () => {
    sidebar.classList.add("open");
});

closeSidebarBtn.addEventListener("click", () => {
    sidebar.classList.remove("open");
});

/* ADMİN GÖRÜNÜRLÜK */
const adminPanelBtn = document.getElementById("adminPanelBtn");

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if(currentUser){
    if(
        currentUser.username === "Wooziedev111" &&
        currentUser.password === "ati1234.ati"
    ){
        adminPanelBtn.style.display = "block";
    }
}
