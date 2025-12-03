// js/dm.js

const dmCurrentUser = getCurrentUser();
if (!dmCurrentUser) {
  alert("Sohbet için giriş yapmanız gerekiyor.");
}

let selectedFriendUid = null;

const chatBox   = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");

function renderFriendRequests() {
  const box = document.getElementById("friendRequestsBox");
  if (!dmCurrentUser) {
    box.innerHTML = "<p class='small-text'>Giriş gerekli.</p>";
    return;
  }
  const users = getUsers();
  const me = users.find(u => u.uid === dmCurrentUser.uid);
  if (!me) return;
  const reqs = me.friendRequests || [];

  if (!reqs.length) {
    box.innerHTML = "<p class='small-text'>Bekleyen istek yok.</p>";
    return;
  }

  box.innerHTML = "";
  reqs.forEach(uid => {
    const u = users.find(x => x.uid === uid);
    if (!u) return;
    const div = document.createElement("div");
    div.className = "dm-user-item";
    div.innerHTML = `
      <span>${u.username}</span>
      <span>
        <button data-uid="${u.uid}" data-action="accept" style="font-size:11px;">Kabul</button>
        <button data-uid="${u.uid}" data-action="reject" style="font-size:11px;">Red</button>
      </span>
    `;
    box.appendChild(div);
  });

  box.querySelectorAll("button[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const uid = btn.getAttribute("data-uid");
      const action = btn.getAttribute("data-action");
      handleFriendRequest(uid, action);
    });
  });
}

function handleFriendRequest(uid, action) {
  const users = getUsers();
  const meIdx = users.findIndex(u => u.uid === dmCurrentUser.uid);
  const otherIdx = users.findIndex(u => u.uid === uid);
  if (meIdx === -1 || otherIdx === -1) return;

  const me = users[meIdx];
  const other = users[otherIdx];

  me.friendRequests = me.friendRequests || [];
  me.friends = me.friends || [];
  other.friends = other.friends || [];

  me.friendRequests = me.friendRequests.filter(x => x !== uid);

  if (action === "accept") {
    if (!me.friends.includes(uid)) me.friends.push(uid);
    if (!other.friends.includes(me.uid)) other.friends.push(me.uid);
  }

  users[meIdx] = me;
  users[otherIdx] = other;
  saveUsers(users);
  saveCurrentUser(me);
  renderFriendRequests();
  renderFriends();
}

/* Arkadaş listesi */

function renderFriends() {
  const box = document.getElementById("friendsBox");
  if (!dmCurrentUser) {
    box.innerHTML = "<p class='small-text'>Giriş gerekli.</p>";
    return;
  }
  const users = getUsers();
  const me = users.find(u => u.uid === dmCurrentUser.uid);
  if (!me) return;
  const friends = me.friends || [];

  if (!friends.length) {
    box.innerHTML = "<p class='small-text'>Henüz arkadaş eklemediniz.</p>";
    return;
  }

  box.innerHTML = "";
  friends.forEach(uid => {
    const u = users.find(x => x.uid === uid);
    if (!u) return;
    const div = document.createElement("div");
    div.className = "dm-user-item";
    if (uid === selectedFriendUid) div.classList.add("active");

    div.innerHTML = `
      <span>${u.username}</span>
      <span style="font-size:11px;color:#9ca3af;">DM</span>
    `;
    div.addEventListener("click", () => {
      selectedFriendUid = uid;
      renderFriends();
      openDMWith(u);
    });
    box.appendChild(div);
  });
}

/* Kullanıcı Arama / Arkadaş Ekle */

function searchUsersForFriend() {
  const q = document.getElementById("userSearchInput").value.trim().toLowerCase();
  const box = document.getElementById("searchResultsBox");
  if (!q) {
    box.innerHTML = "";
    return;
  }
  const users = getUsers().filter(u => 
    u.username.toLowerCase().includes(q) && u.uid !== dmCurrentUser.uid
  );

  if (!users.length) {
    box.innerHTML = "<p class='small-text'>Kullanıcı bulunamadı.</p>";
    return;
  }

  const me = getUsers().find(u => u.uid === dmCurrentUser.uid);

  box.innerHTML = "";
  users.forEach(u => {
    const isFriend  = me.friends && me.friends.includes(u.uid);
    const hasReq    = me.friendRequests && me.friendRequests.includes(u.uid);
    const sentReq   = (u.friendRequests || []).includes(me.uid);

    let status = "";
    if (isFriend) status = "<span style='font-size:11px;color:#4ade80;'>Arkadaş</span>";
    else if (sentReq) status = "<span style='font-size:11px;color:#facc15;'>İstek gönderildi</span>";
    else if (hasReq) status = "<span style='font-size:11px;color:#22d3ee;'>Sana istek gönderdi</span>";

    const div = document.createElement("div");
    div.className = "dm-user-item";
    div.innerHTML = `
      <span>${u.username}</span>
      <span>
        ${status || `<button data-uid="${u.uid}" style="font-size:11px;">Ekle</button>`}
      </span>
    `;
    box.appendChild(div);
  });

  box.querySelectorAll("button[data-uid]").forEach(btn => {
    btn.addEventListener("click", () => {
      const uid = btn.getAttribute("data-uid");
      sendFriendRequest(uid);
    });
  });
}

function sendFriendRequest(uid) {
  const users = getUsers();
  const meIdx = users.findIndex(u => u.uid === dmCurrentUser.uid);
  const otherIdx = users.findIndex(u => u.uid === uid);
  if (meIdx === -1 || otherIdx === -1) return;
  const me = users[meIdx];
  const other = users[otherIdx];

  other.friendRequests = other.friendRequests || [];
  if (!other.friendRequests.includes(me.uid)) {
    other.friendRequests.push(me.uid);
    users[otherIdx] = other;
    saveUsers(users);
    alert("Arkadaş isteği gönderildi.");
  } else {
    alert("Zaten bekleyen isteğiniz var.");
  }
}

/* DM MESAJLAR */

function openDMWith(userObj) {
  document.getElementById("dmTargetName").textContent = userObj.username;

  const badges = [];
  if (userObj.role === "admin") badges.push("Admin");
  if (userObj.role === "mod") badges.push("Mod");
  if (userObj.badges && userObj.badges.includes("verified-blue")) badges.push("Mavi Tik");
  if (userObj.badges && userObj.badges.includes("verified-gold")) badges.push("Sarı Tik");
  document.getElementById("dmTargetBadges").textContent = badges.join(" • ");

  loadChatMessages();
}

function loadChatMessages() {
  chatBox.innerHTML = "";
  if (!selectedFriendUid || !dmCurrentUser) {
    chatBox.innerHTML = "<p class='small-text'>Sohbet için soldan bir arkadaş seçin.</p>";
    return;
  }
  const dms = getDms();
  const key = dmKey(dmCurrentUser.uid, selectedFriendUid);
  const msgs = dms[key] || [];

  msgs.forEach(m => {
    const div = document.createElement("div");
    div.className = "chat-message";
    if (m.fromUid === dmCurrentUser.uid) div.classList.add("self");

    const timeStr = new Date(m.time).toLocaleTimeString();
    div.innerHTML = `
      <div class="meta">${m.fromName} • ${timeStr}</div>
      <div>${m.text}</div>
    `;
    chatBox.appendChild(div);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendChat() {
  if (!dmCurrentUser) return alert("Giriş yapmalısınız.");
  if (!selectedFriendUid) return alert("Sohbet için bir arkadaş seçin.");
  const text = chatInput.value.trim();
  if (!text) return;

  const dms = getDms();
  const key = dmKey(dmCurrentUser.uid, selectedFriendUid);
  if (!dms[key]) dms[key] = [];
  dms[key].push({
    fromUid: dmCurrentUser.uid,
    fromName: dmCurrentUser.username,
    toUid: selectedFriendUid,
    text,
    time: Date.now()
  });
  saveDms(dms);
  chatInput.value = "";
  loadChatMessages();
}

// ENTER ile gönder
if (chatInput) {
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  });
}

/* İlk yükleme */

renderFriendRequests();
renderFriends();
loadChatMessages();
