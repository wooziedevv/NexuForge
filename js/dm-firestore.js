// js/dm-firestore.js
// Discord tarzı: Arkadaş istekleri + arkadaş listesi + 1-1 DM (Firestore, realtime)

(function () {
  if (typeof firebase === "undefined") {
    console.error("Firebase global yok (dm-firestore).");
    return;
  }
  if (typeof db === "undefined" || !db) {
    console.error("Firestore (db) yok (dm-firestore).");
    return;
  }

  const auth = firebase.auth();

  const chatBox   = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const targetNameEl = document.getElementById("dmTargetName");
  const targetBadgesEl = document.getElementById("dmTargetBadges");

  const friendReqBox = document.getElementById("friendRequestsBox");
  const friendsBox   = document.getElementById("friendsBox");
  const searchInput  = document.getElementById("userSearchInput");
  const searchResults= document.getElementById("searchResultsBox");

  let me = null;                 // users/{uid}
  let selectedFriend = null;     // seçili arkadaş objesi
  let unsubMe = null;
  let unsubMsgs = null;

  function dmDocId(uidA, uidB){
    return [String(uidA||""), String(uidB||"")].sort().join("_");
  }

  function badgeText(u){
    const badges = [];
    if (!u) return "";
    if (u.role === "admin") badges.push("Admin");
    if (u.role === "mod") badges.push("Mod");
    if (u.badges?.includes("verified-blue")) badges.push("Mavi Tik");
    if (u.badges?.includes("verified-gold")) badges.push("Sarı Tik");
    return badges.join(" • ");
  }

  function setTarget(u){
    if (!targetNameEl) return;
    if (!u){
      targetNameEl.textContent = "Seçili kişi yok";
      if (targetBadgesEl) targetBadgesEl.textContent = "";
      return;
    }
    targetNameEl.textContent = u.username || "Kullanıcı";
    if (targetBadgesEl) targetBadgesEl.textContent = badgeText(u);
  }

  function renderEmptyChat(msg){
    if (!chatBox) return;
    chatBox.innerHTML = `<p class="small-text">${msg}</p>`;
  }

  async function getUserByUid(uid){
    const snap = await db.collection("users").doc(uid).get();
    if (!snap.exists) return null;
    return { uid: snap.id, ...(snap.data()||{}) };
  }

  async function renderFriendRequests(){
    if (!friendReqBox) return;
    if (!me){
      friendReqBox.innerHTML = "<p class='small-text'>Giriş gerekli.</p>";
      return;
    }

    const reqs = me.friendRequests || [];
    if (!reqs.length){
      friendReqBox.innerHTML = "<p class='small-text'>Bekleyen istek yok.</p>";
      return;
    }

    friendReqBox.innerHTML = "<p class='small-text'>Yükleniyor...</p>";
    const users = await Promise.all(reqs.map(getUserByUid));
    friendReqBox.innerHTML = "";

    users.filter(Boolean).forEach(u => {
      const div = document.createElement("div");
      div.className = "dm-user-item";
      div.innerHTML = `
        <span>${u.username || "(isimsiz)"}</span>
        <span>
          <button data-uid="${u.uid}" data-action="accept" style="font-size:11px;">Kabul</button>
          <button data-uid="${u.uid}" data-action="reject" style="font-size:11px;">Red</button>
        </span>
      `;
      friendReqBox.appendChild(div);
    });

    friendReqBox.querySelectorAll("button[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        handleFriendRequest(
          btn.getAttribute("data-uid"),
          btn.getAttribute("data-action")
        );
      });
    });
  }

  async function handleFriendRequest(fromUid, action){
    if (!me) return;

    const myUid = me.uid;
    const myRef = db.collection("users").doc(myUid);
    const otherRef = db.collection("users").doc(fromUid);

    try{
      await db.runTransaction(async (tx) => {
        const mySnap = await tx.get(myRef);
        const otherSnap = await tx.get(otherRef);
        if (!mySnap.exists || !otherSnap.exists) return;

        const myData = mySnap.data() || {};
        const otherData = otherSnap.data() || {};

        const myReqs = Array.isArray(myData.friendRequests) ? myData.friendRequests : [];
        const myFriends = Array.isArray(myData.friends) ? myData.friends : [];
        const otherFriends = Array.isArray(otherData.friends) ? otherData.friends : [];

        tx.update(myRef, { friendRequests: myReqs.filter(x => x !== fromUid) });

        if (action === "accept"){
          if (!myFriends.includes(fromUid)) myFriends.push(fromUid);
          if (!otherFriends.includes(myUid)) otherFriends.push(myUid);
          tx.update(myRef, { friends: myFriends });
          tx.update(otherRef, { friends: otherFriends });
        }
      });
    }catch(err){
      console.error("Friend request hata:", err);
      alert("İşlem hatası: " + (err.message || "bilinmeyen"));
    }
  }

  async function renderFriends(){
    if (!friendsBox) return;
    if (!me){
      friendsBox.innerHTML = "<p class='small-text'>Giriş gerekli.</p>";
      return;
    }

    const friends = me.friends || [];
    if (!friends.length){
      friendsBox.innerHTML = "<p class='small-text'>Henüz arkadaş eklemediniz.</p>";
      return;
    }

    friendsBox.innerHTML = "<p class='small-text'>Yükleniyor...</p>";
    const users = await Promise.all(friends.map(getUserByUid));
    friendsBox.innerHTML = "";

    users.filter(Boolean).forEach(u => {
      const div = document.createElement("div");
      div.className = "dm-user-item";
      if (selectedFriend?.uid === u.uid) div.classList.add("active");

      div.innerHTML = `
        <span>${u.username || "(isimsiz)"}</span>
        <span style="font-size:11px;color:#9ca3af;">DM</span>
      `;

      div.addEventListener("click", () => openDMWith(u));
      friendsBox.appendChild(div);
    });
  }

  async function searchUsersForFriend(){
    if (!me || !searchResults) return;

    const q = (searchInput?.value || "").trim().toLowerCase();
    if (!q){
      searchResults.innerHTML = "";
      return;
    }

    searchResults.innerHTML = "<p class='small-text'>Aranıyor...</p>";

    try{
      const snap = await db.collection("users")
        .orderBy("usernameLower")
        .startAt(q)
        .endAt(q + "\\uf8ff")
        .limit(20)
        .get();

      const results = [];
      snap.forEach(doc => {
        if (doc.id === me.uid) return;
        results.push({ uid: doc.id, ...(doc.data()||{}) });
      });

      if (!results.length){
        searchResults.innerHTML = "<p class='small-text'>Kullanıcı bulunamadı.</p>";
        return;
      }

      searchResults.innerHTML = "";
      results.forEach(u => {
        const isFriend = (me.friends || []).includes(u.uid);
        const hasReq   = (me.friendRequests || []).includes(u.uid);
        const sentReq  = (u.friendRequests || []).includes(me.uid);

        let status = "";
        if (isFriend) status = "<span style='font-size:11px;color:#4ade80;'>Arkadaş</span>";
        else if (sentReq) status = "<span style='font-size:11px;color:#facc15;'>İstek gönderildi</span>";
        else if (hasReq) status = "<span style='font-size:11px;color:#22d3ee;'>Sana istek gönderdi</span>";

        const div = document.createElement("div");
        div.className = "dm-user-item";
        div.innerHTML = `
          <span>${u.username || "(isimsiz)"}</span>
          <span>${status || `<button data-uid="${u.uid}" style="font-size:11px;">Ekle</button>`}</span>
        `;
        searchResults.appendChild(div);
      });

      searchResults.querySelectorAll("button[data-uid]").forEach(btn => {
        btn.addEventListener("click", () => sendFriendRequest(btn.getAttribute("data-uid")));
      });

    }catch(err){
      console.error("Arama hata:", err);
      searchResults.innerHTML = "<p class='small-text'>Arama hatası.</p>";
    }
  }

  async function sendFriendRequest(targetUid){
    if (!me) return;

    const targetRef = db.collection("users").doc(targetUid);
    try{
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(targetRef);
        if (!snap.exists) throw new Error("Kullanıcı bulunamadı.");
        const data = snap.data() || {};
        const reqs = Array.isArray(data.friendRequests) ? data.friendRequests : [];
        if (!reqs.includes(me.uid)) reqs.push(me.uid);
        tx.update(targetRef, { friendRequests: reqs });
      });
      alert("Arkadaş isteği gönderildi.");
    }catch(err){
      alert("İstek gönderilemedi: " + (err.message || "bilinmeyen"));
    }
  }

  function openDMWith(userObj){
    selectedFriend = userObj;
    setTarget(userObj);
    renderFriends();
    subscribeMessages();
  }

  function subscribeMessages(){
    if (!me || !selectedFriend){
      renderEmptyChat("Sohbet için soldan bir arkadaş seçin.");
      return;
    }

    if (unsubMsgs) { unsubMsgs(); unsubMsgs = null; }

    const docId = dmDocId(me.uid, selectedFriend.uid);
    const dmRef = db.collection("dms").doc(docId);

    dmRef.set({
      participants: [me.uid, selectedFriend.uid],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch(()=>{});

    unsubMsgs = dmRef.collection("messages")
      .orderBy("createdAt","asc")
      .limit(200)
      .onSnapshot((snap) => {
        chatBox.innerHTML = "";
        if (snap.empty){
          renderEmptyChat("Henüz mesaj yok. İlk mesajı sen at 🙂");
          return;
        }

        snap.forEach(doc => {
          const m = doc.data() || {};
          const div = document.createElement("div");
          div.className = "chat-message";
          if (m.fromUid === me.uid) div.classList.add("self");

          const time = m.createdAt?.toDate ? m.createdAt.toDate() : new Date();
          div.innerHTML = `
            <div class="meta">${escapeHtml(m.fromName || "")} • ${time.toLocaleTimeString()}</div>
            <div>${escapeHtml(m.text || "")}</div>
          `;
          chatBox.appendChild(div);
        });

        chatBox.scrollTop = chatBox.scrollHeight;
      });
  }

  async function sendChat(){
    if (!me) return alert("Giriş yapmalısınız.");
    if (!selectedFriend) return alert("Sohbet için bir arkadaş seçin.");

    const text = (chatInput?.value || "").trim();
    if (!text) return;

    const docId = dmDocId(me.uid, selectedFriend.uid);
    const dmRef = db.collection("dms").doc(docId);

    await dmRef.collection("messages").add({
      fromUid: me.uid,
      fromName: me.username || "User",
      toUid: selectedFriend.uid,
      text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    chatInput.value = "";
  }

  function escapeHtml(str){
    return (str || "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
    }[c]));
  }

  // onclick'li HTML için
  window.searchUsersForFriend = searchUsersForFriend;
  window.sendChat = sendChat;

  chatInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  });

  function subscribeMe(uid){
    if (unsubMe) { unsubMe(); unsubMe = null; }
    unsubMe = db.collection("users").doc(uid).onSnapshot((snap) => {
      if (!snap.exists) return;
      me = { uid: snap.id, ...(snap.data()||{}) };

      // local cache (UI menü vs için)
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

      renderFriendRequests();
      renderFriends();
    });
  }

  auth.onAuthStateChanged((fbUser) => {
    if (!fbUser){
      alert("Sohbet için giriş yapmanız gerekiyor.");
      window.location.href = "auth.html";
      return;
    }
    subscribeMe(fbUser.uid);
    setTarget(null);
    renderEmptyChat("Sohbet için soldan bir arkadaş seçin.");
  });

})();
