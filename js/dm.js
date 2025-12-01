const chatBox = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");

function loadChat() {
  const msgs = JSON.parse(localStorage.getItem("globalChat") || "[]");
  chatBox.innerHTML = "";
  msgs.forEach(m => {
    const div = document.createElement("div");
    div.className = "chat-message";
    div.innerHTML = `<strong>${m.user}</strong> <small>${new Date(m.time).toLocaleString()}</small><br>${m.text}`;
    chatBox.appendChild(div);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendChat() {
  const user = getCurrentUser();
  if (!user) return alert("Sohbet için giriş yapmalısınız.");
  const text = chatInput.value.trim();
  if (!text) return;
  const msgs = JSON.parse(localStorage.getItem("globalChat") || "[]");
  msgs.push({
    user: user.username,
    text,
    time: Date.now()
  });
  localStorage.setItem("globalChat", JSON.stringify(msgs));
  chatInput.value = "";
  loadChat();
}

loadChat();
