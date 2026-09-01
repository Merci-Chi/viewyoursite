/* Messages — Amazon Message Center–style 1:1 messenger */
(function () {
  "use strict";

  const KEY = "messages.v1";
  const SESSION_KEY = "messages.v1.session";
  const TOKEN_KEY = "messages.githubToken";
  const DATA_PATH = "messages/db.json";
  const GH_OWNER = "Merci-Chi";
  const GH_REPO = "viewyoursite";
  const GH_BRANCH = "main";
  const POLL_MS = 5000;

  var db = emptyDb();
  var session = null;
  var fileSha = null;
  var pushing = false;
  var pollTimer = null;
  var readsDirty = false;

  var ui = {
    view: "login",
    mobile: "list",
    threadId: null,
    search: "",
    draft: "",
    pendingImage: null,
    loginEmail: "",
    loginPass: "",
    peopleName: "",
    peopleEmail: "",
    peoplePass: "",
    error: "",
    notice: "",
    busy: false,
    sending: false,
    tokenSaved: false
  };

  function load() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (raw) session = JSON.parse(raw);
    } catch (err) {
      session = null;
    }
    try {
      var cached = localStorage.getItem(KEY);
      if (cached) db = normalize(JSON.parse(cached));
    } catch (err) {
      /* keep empty */
    }
  }

  function emptyDb() {
    return { users: [], threads: [], messages: [], reads: {}, rev: 0 };
  }

  function normalize(d) {
    d = d && typeof d === "object" ? d : {};
    return {
      users: Array.isArray(d.users) ? d.users : [],
      threads: Array.isArray(d.threads) ? d.threads : [],
      messages: Array.isArray(d.messages) ? d.messages : [],
      reads: d.reads && typeof d.reads === "object" && !Array.isArray(d.reads) ? d.reads : {},
      rev: typeof d.rev === "number" ? d.rev : 0
    };
  }

  function uid(prefix) {
    return (prefix || "id") + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function safeSrc(s) {
    if (!s || typeof s !== "string") return "";
    if (s.indexOf("data:image/") === 0 || s.indexOf("https://") === 0) return s;
    return "";
  }

  function currentUser() {
    if (!session || !session.userId) return null;
    return (db.users || []).find(function (u) { return u.id === session.userId && u.active !== false; }) || null;
  }

  function isAdmin(user) {
    if (!user) return false;
    return user.role === "admin" || user.head === true;
  }

  function initials(name) {
    var parts = String(name || "?").trim().split(/\s+/).slice(0, 2);
    return parts.map(function (p) { return p.charAt(0).toUpperCase(); }).join("") || "?";
  }

  function fmtTime(ts) {
    var d = new Date(ts);
    if (isNaN(d.getTime())) return "";
    var now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
    var yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    if (d.toDateString() === yest.toDateString()) return "Yesterday";
    if (d.getFullYear() === now.getFullYear()) {
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  }

  function fmtClock(ts) {
    var d = new Date(ts);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function otherMember(thread, meId) {
    var members = (thread && thread.members) || [];
    var oid = members.find(function (id) { return id !== meId; }) || members[0];
    return (db.users || []).find(function (u) { return u.id === oid; }) || { id: oid, name: "Unknown", email: "" };
  }

  function threadMessages(threadId) {
    return (db.messages || []).filter(function (m) { return m.threadId === threadId; })
      .sort(function (a, b) { return (a.createdAt || 0) - (b.createdAt || 0); });
  }

  function lastMessage(threadId) {
    var list = threadMessages(threadId);
    return list.length ? list[list.length - 1] : null;
  }

  function isUnread(thread, me) {
    var last = lastMessage(thread.id);
    if (!last || last.from === me.id) return false;
    var rec = ((db.reads || {})[me.id] || {})[thread.id] || 0;
    return (last.createdAt || 0) > rec;
  }

  function findDm(a, b) {
    return (db.threads || []).find(function (t) {
      var m = t.members || [];
      return m.length === 2 && m.indexOf(a) !== -1 && m.indexOf(b) !== -1;
    }) || null;
  }

  function myThreads(me) {
    return (db.threads || []).filter(function (t) {
      return (t.members || []).indexOf(me.id) !== -1;
    }).sort(function (a, b) {
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  }

  function cacheLocal() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (err) { /* quota */ }
  }

  function saveSession(user) {
    session = { userId: user.id, email: user.email };
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (err) { /* ignore */ }
  }

  function clearSession() {
    session = null;
    try { localStorage.removeItem(SESSION_KEY); } catch (err) { /* ignore */ }
  }

  function sha256Hex(text) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
      var bytes = new Uint8Array(buf);
      var hex = "";
      for (var i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
      return hex;
    });
  }

  function utf8ToB64(str) {
    var bytes = new TextEncoder().encode(str);
    var chunk = 0x8000;
    var parts = [];
    for (var i = 0; i < bytes.length; i += chunk) {
      parts.push(String.fromCharCode.apply(null, bytes.subarray(i, i + chunk)));
    }
    return btoa(parts.join(""));
  }

  function ghHeaders(token) {
    return {
      Accept: "application/vnd.github+json",
      Authorization: "token " + token,
      "X-GitHub-Api-Version": "2022-11-28"
    };
  }

  function getToken() {
    try { return (localStorage.getItem(TOKEN_KEY) || "").trim(); } catch (err) { return ""; }
  }

  function setToken(value) {
    try {
      if (value) localStorage.setItem(TOKEN_KEY, value);
      else localStorage.removeItem(TOKEN_KEY);
    } catch (err) { /* ignore */ }
  }

  function fetchDb() {
    var ts = Date.now();
    var urls = [
      "db.json?v=" + ts,
      "https://raw.githubusercontent.com/" + GH_OWNER + "/" + GH_REPO + "/main/" + DATA_PATH + "?t=" + ts
    ];
    var i = 0;
    function next() {
      if (i >= urls.length) return Promise.resolve(null);
      var url = urls[i++];
      return fetch(url, { cache: "no-store" }).then(function (res) {
        if (!res.ok) return next();
        return res.json().then(function (data) {
          if (data && typeof data === "object") return normalize(data);
          return next();
        });
      }).catch(function () { return next(); });
    }
    return next();
  }

  function mergeById(a, b) {
    var map = {};
    (a || []).concat(b || []).forEach(function (item) {
      if (!item || !item.id) return;
      var prev = map[item.id];
      if (!prev) {
        map[item.id] = item;
        return;
      }
      var pa = prev.updatedAt || prev.createdAt || 0;
      var pb = item.updatedAt || item.createdAt || 0;
      map[item.id] = pb >= pa ? item : prev;
    });
    return Object.keys(map).map(function (k) { return map[k]; });
  }

  function mergeReads(a, b) {
    var out = {};
    [a || {}, b || {}].forEach(function (src) {
      Object.keys(src).forEach(function (uidKey) {
        out[uidKey] = out[uidKey] || {};
        var rec = src[uidKey] || {};
        Object.keys(rec).forEach(function (tid) {
          var n = typeof rec[tid] === "number" ? rec[tid] : Date.parse(rec[tid]) || 0;
          out[uidKey][tid] = Math.max(out[uidKey][tid] || 0, n);
        });
      });
    });
    return out;
  }

  function mergeDb(local, remote) {
    return {
      users: mergeById(local.users, remote.users),
      threads: mergeById(local.threads, remote.threads),
      messages: mergeById(local.messages, remote.messages),
      reads: mergeReads(local.reads, remote.reads),
      rev: Math.max(local.rev || 0, remote.rev || 0)
    };
  }

  function pullAndApply() {
    return fetchDb().then(function (remote) {
      if (remote) {
        db = mergeDb(db || emptyDb(), remote);
        cacheLocal();
      }
      return db;
    });
  }

  function fetchSha() {
    var token = getToken();
    if (!token) return Promise.resolve(null);
    var url = "https://api.github.com/repos/" + GH_OWNER + "/" + GH_REPO +
      "/contents/" + DATA_PATH + "?ref=" + GH_BRANCH;
    return fetch(url, { headers: ghHeaders(token), cache: "no-store" }).then(function (res) {
      if (!res.ok) return null;
      return res.json().then(function (body) {
        fileSha = body && body.sha ? body.sha : null;
        return fileSha;
      });
    }).catch(function () { return null; });
  }

  function pushDb(message) {
    var token = getToken();
    cacheLocal();
    if (!token) {
      ui.notice = "Saved on this device. Add a GitHub token in People to sync.";
      return Promise.resolve({ ok: false, reason: "no-token" });
    }
    pushing = true;
    var attempt = 0;
    function once() {
      attempt += 1;
      var json = JSON.stringify(db, null, 2);
      var content = utf8ToB64(json);
      var body = {
        message: message || "messages: update db.json",
        content: content,
        branch: GH_BRANCH
      };
      return fetchSha().then(function (sha) {
        if (sha) body.sha = sha;
        return fetch("https://api.github.com/repos/" + GH_OWNER + "/" + GH_REPO + "/contents/" + DATA_PATH, {
          method: "PUT",
          headers: Object.assign({ "Content-Type": "application/json" }, ghHeaders(token)),
          body: JSON.stringify(body)
        });
      }).then(function (res) {
        if (res.ok) {
          return res.json().then(function (out) {
            fileSha = out && out.content && out.content.sha ? out.content.sha : fileSha;
            ui.notice = "Synced.";
            readsDirty = false;
            return { ok: true };
          });
        }
        if ((res.status === 409 || res.status === 422) && attempt < 3) {
          return fetchDb().then(function (remote) {
            if (remote) db = mergeDb(db, remote);
            db.rev = (db.rev || 0) + 1;
            return once();
          });
        }
        return res.text().then(function (t) {
          ui.notice = "Could not sync (" + res.status + "). Saved on this device.";
          return { ok: false, reason: t };
        });
      });
    }
    return once().catch(function () {
      ui.notice = "Could not sync. Saved on this device.";
      return { ok: false, reason: "network" };
    }).then(function (result) {
      pushing = false;
      return result;
    });
  }

  function persist(reason) {
    db.rev = (db.rev || 0) + 1;
    cacheLocal();
    readsDirty = false;
    return pushDb("messages: " + (reason || "update db.json"));
  }

  function markRead(threadId) {
    var me = currentUser();
    if (!me || !threadId) return;
    db.reads = db.reads || {};
    db.reads[me.id] = db.reads[me.id] || {};
    db.reads[me.id][threadId] = Date.now();
    readsDirty = true;
  }

  function extFromName(name, dataUrl) {
    var m = String(name || "").match(/\.([a-z0-9]+)$/i);
    if (m) return m[1].toLowerCase().replace("jpeg", "jpg");
    if (dataUrl && dataUrl.indexOf("image/png") !== -1) return "png";
    if (dataUrl && dataUrl.indexOf("image/webp") !== -1) return "webp";
    if (dataUrl && dataUrl.indexOf("image/gif") !== -1) return "gif";
    return "jpg";
  }

  function uploadChatImage(threadId, image) {
    var token = getToken();
    if (!token || !image || !image.dataUrl) return Promise.resolve(null);
    var comma = image.dataUrl.indexOf(",");
    if (comma < 0) return Promise.resolve(null);
    var b64 = image.dataUrl.slice(comma + 1);
    if (!b64) return Promise.resolve(null);
    var filename = Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + extFromName(image.name, image.dataUrl);
    var path = "messages/chat/" + threadId + "/" + filename;
    var url = "https://api.github.com/repos/" + GH_OWNER + "/" + GH_REPO + "/contents/" + path;
    return fetch(url, {
      method: "PUT",
      headers: Object.assign({ "Content-Type": "application/json" }, ghHeaders(token)),
      body: JSON.stringify({
        message: "messages: chat image " + filename,
        content: b64,
        branch: GH_BRANCH
      })
    }).then(function (res) {
      if (!res.ok) return null;
      return {
        path: path,
        url: "https://raw.githubusercontent.com/" + GH_OWNER + "/" + GH_REPO + "/" + GH_BRANCH + "/" + path
      };
    }).catch(function () { return null; });
  }

  function passwordsMatch(stored, typed, hashed) {
    if (!stored) return false;
    if (stored === typed) return true;
    if (stored.toLowerCase() === hashed) return true;
    return false;
  }

  function login() {
    var email = (ui.loginEmail || "").trim().toLowerCase();
    var password = ui.loginPass || "";
    if (!email || !password) {
      ui.error = "Enter email and password.";
      render();
      return Promise.resolve();
    }
    ui.busy = true;
    ui.error = "";
    render();
    return pullAndApply().then(function () {
      return sha256Hex(password);
    }).then(function (hashed) {
      var user = (db.users || []).find(function (u) {
        return (u.email || "").toLowerCase() === email && u.active !== false;
      });
      if (!user || !passwordsMatch(user.password, password, hashed)) {
        ui.error = "That email or password is not right.";
        ui.busy = false;
        render();
        return;
      }
      saveSession(user);
      ui.view = "inbox";
      ui.mobile = "list";
      ui.threadId = null;
      ui.loginPass = "";
      ui.busy = false;
      ui.error = "";
      render();
    }).catch(function () {
      ui.error = "Could not load the message database.";
      ui.busy = false;
      render();
    });
  }

  function logout() {
    clearSession();
    ui.view = "login";
    ui.threadId = null;
    ui.draft = "";
    ui.pendingImage = null;
    ui.error = "";
    render();
  }

  function openThread(threadId) {
    ui.threadId = threadId;
    ui.view = "inbox";
    ui.mobile = "thread";
    markRead(threadId);
    render();
    scrollThreadBottom(true);
  }

  function openDm(userId) {
    var me = currentUser();
    if (!me || userId === me.id) return Promise.resolve();
    var th = findDm(me.id, userId);
    var created = false;
    if (!th) {
      th = {
        id: uid("th"),
        members: [me.id, userId],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      db.threads.push(th);
      created = true;
    }
    ui.threadId = th.id;
    ui.view = "inbox";
    ui.mobile = "thread";
    markRead(th.id);
    render();
    scrollThreadBottom(true);
    if (created) return persist("create thread");
    return Promise.resolve();
  }

  function addPerson() {
    var me = currentUser();
    if (!isAdmin(me)) return Promise.resolve();
    var name = (ui.peopleName || "").trim();
    var email = (ui.peopleEmail || "").trim().toLowerCase();
    var password = ui.peoplePass || "";
    if (!name || !email || !password) {
      ui.error = "Name, email, and password are required.";
      render();
      return Promise.resolve();
    }
    var exists = (db.users || []).some(function (u) {
      return (u.email || "").toLowerCase() === email;
    });
    if (exists) {
      ui.error = "That email is already in use.";
      render();
      return Promise.resolve();
    }
    ui.busy = true;
    ui.error = "";
    render();
    return sha256Hex(password).then(function (hashed) {
      db.users.push({
        id: uid("u"),
        name: name,
        email: email,
        password: hashed,
        role: "user",
        head: false,
        active: true
      });
      ui.peopleName = "";
      ui.peopleEmail = "";
      ui.peoplePass = "";
      ui.busy = false;
      ui.notice = "Person added.";
      render();
      return persist("add person");
    }).then(function () {
      ui.busy = false;
      render();
    }).catch(function () {
      ui.busy = false;
      ui.error = "Could not add person.";
      render();
    });
  }

  function postMessage() {
    var me = currentUser();
    var th = (db.threads || []).find(function (t) { return t.id === ui.threadId; });
    var text = (ui.draft || "").trim();
    var image = ui.pendingImage;
    if (!me || !th) return Promise.resolve();
    if (!text && !image) return Promise.resolve();
    if (ui.sending) return Promise.resolve();
    ui.sending = true;
    var msg = {
      id: uid("m"),
      threadId: th.id,
      from: me.id,
      text: text,
      createdAt: Date.now()
    };
    if (image) {
      msg.image = image.dataUrl;
      msg.imageName = image.name || "";
    }
    db.messages.push(msg);
    th.updatedAt = msg.createdAt;
    markRead(th.id);
    ui.draft = "";
    ui.pendingImage = null;
    render();
    scrollThreadBottom(true);
    var upload = image ? uploadChatImage(th.id, image).then(function (uploaded) {
      if (uploaded) {
        msg.imagePath = uploaded.path;
        msg.imageUrl = uploaded.url;
      }
    }).catch(function () { /* send still goes through */ }) : Promise.resolve();
    return upload.then(function () {
      return persist("send message");
    }).then(function () {
      ui.sending = false;
      render();
      scrollThreadBottom(false);
    }).catch(function () {
      ui.sending = false;
      render();
    });
  }

  function scrollThreadBottom(force) {
    setTimeout(function () {
      var el = document.getElementById("bubbles");
      if (!el) return;
      if (force || el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
        el.scrollTop = el.scrollHeight;
      }
    }, 0);
  }

  function filteredThreads(me) {
    var q = (ui.search || "").trim().toLowerCase();
    return myThreads(me).filter(function (th) {
      if (!q) return true;
      var other = otherMember(th, me.id);
      var last = lastMessage(th.id);
      var snip = last ? (last.text || (last.image ? "Photo" : "")) : "";
      return (other.name || "").toLowerCase().indexOf(q) !== -1 ||
        (other.email || "").toLowerCase().indexOf(q) !== -1 ||
        snip.toLowerCase().indexOf(q) !== -1;
    });
  }

  function renderLogin() {
    return (
      '<div class="login-page">' +
        '<div class="login-head"><div class="wordmark">Messages</div></div>' +
        '<div class="login-body"><form class="login-card" data-act="login" action="#">' +
          "<h1>Sign in</h1>" +
          '<p class="sub">Buyer–Seller Messages</p>' +
          (ui.error ? '<p class="err">' + esc(ui.error) + "</p>" : "") +
          '<div class="field"><label for="login-email">Email</label>' +
            '<input id="login-email" name="email" type="email" autocomplete="username" value="' + esc(ui.loginEmail) + '" required></div>' +
          '<div class="field"><label for="login-pass">Password</label>' +
            '<input id="login-pass" name="password" type="password" autocomplete="current-password" required></div>' +
          '<button class="btn btn-primary" type="submit"' + (ui.busy ? " disabled" : "") + ">" +
            (ui.busy ? "Signing in…" : "Sign in") + "</button>" +
        "</form></div></div>"
    );
  }

  function renderConvos(me) {
    var list = filteredThreads(me);
    if (!list.length) {
      return '<div class="empty-list">No messages yet.' +
        (isAdmin(me) ? "<br>Add a person to start a conversation." : "") + "</div>";
    }
    return list.map(function (th) {
      var other = otherMember(th, me.id);
      var last = lastMessage(th.id);
      var snip = last ? (last.text || (last.image ? "Photo" : "")) : "No messages yet";
      var unread = isUnread(th, me);
      return (
        '<button type="button" class="convo' + (ui.threadId === th.id ? " is-on" : "") +
          '" data-act="open-thread" data-id="' + esc(th.id) + '">' +
          '<div class="avatar">' + esc(initials(other.name)) + "</div>" +
          '<div class="convo-body"><div class="convo-top">' +
            '<span class="convo-name">' + esc(other.name || "Unknown") + "</span>" +
            '<span class="convo-time">' + esc(last ? fmtTime(last.createdAt) : "") + "</span>" +
          '</div><div class="convo-snips">' +
            '<span class="convo-snip">' + esc(snip) + "</span>" +
            (unread ? '<span class="dot" title="Unread"></span>' : "") +
          "</div></div></button>"
      );
    }).join("");
  }

  function renderBubbles(me, thread) {
    var msgs = threadMessages(thread.id);
    if (!msgs.length) {
      return '<div class="empty-thread"><p>No messages yet. Say hello.</p></div>';
    }
    var html = "";
    var lastDay = "";
    msgs.forEach(function (m) {
      var day = new Date(m.createdAt).toDateString();
      if (day !== lastDay) {
        html += '<div class="daychip">' + esc(fmtTime(m.createdAt).indexOf(":") === -1 ? fmtTime(m.createdAt) : "Today") + "</div>";
        lastDay = day;
      }
      var mine = m.from === me.id;
      var src = safeSrc(m.image || m.imageUrl || "");
      html += '<div class="row ' + (mine ? "mine" : "theirs") + '"><div class="bubble">';
      if (src) html += '<img alt="" src="' + esc(src) + '">';
      html += '<div class="msg-text">' + esc(m.text || "") + "</div>";
      html += '<div class="meta">' + esc(fmtClock(m.createdAt)) + "</div>";
      html += "</div></div>";
    });
    return html;
  }

  function renderThread(me) {
    var th = (db.threads || []).find(function (t) { return t.id === ui.threadId; });
    if (!th) {
      return (
        '<section class="thread-pane">' +
          '<div class="empty-thread">' +
            "<h2>Your messages</h2>" +
            "<p>Select a conversation from the left, or add a person to start a 1:1 message.</p>" +
          "</div></section>"
      );
    }
    var other = otherMember(th, me.id);
    var preview = "";
    if (ui.pendingImage) {
      preview = '<div class="preview"><img alt="" src="' + esc(safeSrc(ui.pendingImage.dataUrl)) + '">' +
        "<span>" + esc(ui.pendingImage.name || "Photo") + "</span>" +
        '<button type="button" class="btn-link" data-act="clear-photo">Remove</button></div>';
    }
    return (
      '<section class="thread-pane">' +
        '<div class="thread-hd">' +
          '<button type="button" class="back" data-act="back" aria-label="Back">‹</button>' +
          '<div class="thread-title">' + esc(other.name || "Conversation") + "</div>" +
          (other.email ? '<div class="thread-sub">' + esc(other.email) + "</div>" : "") +
        "</div>" +
        '<div class="bubbles" id="bubbles">' + renderBubbles(me, th) + "</div>" +
        '<form class="compose" data-act="send" action="#">' +
          preview +
          '<div class="compose-row">' +
            '<button type="button" class="photo-btn" data-act="photo">Photo</button>' +
            '<textarea id="compose-text" rows="1" placeholder="Type a message" aria-label="Message">' +
              esc(ui.draft) + "</textarea>" +
            '<button type="submit" class="send-btn"' + (ui.sending ? " disabled" : "") + ">Send</button>" +
          "</div>" +
          '<input class="hidden-file" id="photo-input" type="file" accept="image/*">' +
        "</form></section>"
    );
  }

  function renderPeople(me) {
    var others = (db.users || []).filter(function (u) { return u.id !== me.id && u.active !== false; });
    var peopleList = others.length ? others.map(function (u) {
      return (
        '<button type="button" class="person" data-act="open-dm" data-id="' + esc(u.id) + '">' +
          '<div class="avatar">' + esc(initials(u.name)) + "</div>" +
          '<div class="person-meta"><div class="nm">' + esc(u.name) + "</div>" +
          '<div class="em">' + esc(u.email) + "</div></div></button>"
      );
    }).join("") : '<p class="empty-list">No one else yet. Add a person to message them.</p>';
    var tokenVal = getToken();
    return (
      '<section class="people-pane">' +
        '<div class="people-hd">' +
          '<button type="button" class="back always" data-act="back" aria-label="Back to inbox">‹ <span class="back-label">Inbox</span></button>' +
          '<div class="thread-title">People</div>' +
        "</div>" +
        '<div class="people-body">' +
          '<div class="card"><h3>Directory</h3>' +
            '<p class="token-note">Click a person to open a 1:1 conversation.</p>' +
            peopleList +
          "</div>" +
          '<div class="card"><h3>Add person</h3>' +
            (ui.error ? '<p class="err">' + esc(ui.error) + "</p>" : "") +
            (ui.notice ? '<p class="ok">' + esc(ui.notice) + "</p>" : "") +
            '<form data-act="add-person" action="#">' +
              '<div class="field"><label for="p-name">Name</label>' +
                '<input id="p-name" value="' + esc(ui.peopleName) + '" autocomplete="name"></div>' +
              '<div class="field"><label for="p-email">Email</label>' +
                '<input id="p-email" type="email" value="' + esc(ui.peopleEmail) + '" autocomplete="off"></div>' +
              '<div class="field"><label for="p-pass">Password</label>' +
                '<input id="p-pass" type="password" value="' + esc(ui.peoplePass) + '" autocomplete="new-password"></div>' +
              '<button class="btn btn-primary" type="submit"' + (ui.busy ? " disabled" : "") + ">Add person</button>" +
            "</form>" +
            '<h3 style="margin-top:22px">GitHub token</h3>' +
            '<p class="token-note">Classic PAT, repo scope. Stored only in this browser — never written to files.</p>' +
            '<form class="token-row" data-act="save-token" action="#" style="margin-top:8px">' +
              '<input id="p-token" type="password" autocomplete="off" placeholder="' +
                (tokenVal ? "Token saved on this device" : "ghp_…") + '" value="">' +
              '<button class="btn btn-ghost" type="submit">Save</button>' +
            "</form>" +
            (tokenVal ? '<p class="ok token-note">Token on this device.</p>' : '<p class="token-note">No token — changes stay on this device until you add one.</p>') +
          "</div>" +
        "</div></section>"
    );
  }

  function renderInbox(me) {
    var mode = ui.view === "people" ? "people" : (ui.mobile === "thread" && ui.threadId ? "thread" : "list");
    var foot = isAdmin(me)
      ? '<div class="list-foot"><button type="button" class="btn btn-primary" data-act="open-people">People</button></div>'
      : "";
    return (
      '<div class="app-frame mode-' + mode + '">' +
        '<header class="topbar">' +
          '<div class="wordmark">Messages</div>' +
          '<div class="topbar-right"><span class="acct">' + esc(me.name) + '</span>' +
            '<button type="button" class="logout" data-act="logout">Log out</button></div>' +
        "</header>" +
        '<div class="shell">' +
          '<aside class="list-pane">' +
            '<div class="search"><input id="search-box" type="search" placeholder="Search messages" value="' +
              esc(ui.search) + '" aria-label="Search messages"></div>' +
            '<div class="convos">' + renderConvos(me) + "</div>" +
            foot +
          "</aside>" +
          (ui.view === "people" ? renderPeople(me) : renderThread(me)) +
        "</div></div>"
    );
  }

  function render() {
    try {
      var root = document.getElementById("app");
      if (!root) return;
      var me = currentUser();
      var keepBubbles = null;
      var bubbles = document.getElementById("bubbles");
      if (bubbles) {
        keepBubbles = {
          top: bubbles.scrollTop,
          near: bubbles.scrollHeight - bubbles.scrollTop - bubbles.clientHeight < 80
        };
      }
      var active = document.activeElement;
      var activeId = active && active.id;
      var selStart = active && typeof active.selectionStart === "number" ? active.selectionStart : null;
      var selEnd = active && typeof active.selectionEnd === "number" ? active.selectionEnd : null;

      if (!me) root.innerHTML = renderLogin();
      else root.innerHTML = renderInbox(me);

      if (keepBubbles) {
        var b2 = document.getElementById("bubbles");
        if (b2) b2.scrollTop = keepBubbles.near ? b2.scrollHeight : keepBubbles.top;
      }
      if (activeId) {
        var el = document.getElementById(activeId);
        if (el && typeof el.focus === "function") {
          el.focus();
          if (selStart != null && typeof el.setSelectionRange === "function") {
            try { el.setSelectionRange(selStart, selEnd); } catch (err) { /* not a text field */ }
          }
        }
      }
    } catch (err) {
      var app = document.getElementById("app");
      if (app) app.innerHTML = '<div class="boot-err">Could not render Messages.</div>';
      console.error(err);
    }
  }

  function readLoginFields() {
    var email = document.getElementById("login-email");
    var pass = document.getElementById("login-pass");
    if (email) ui.loginEmail = email.value;
    if (pass) ui.loginPass = pass.value;
  }

  function readPeopleFields() {
    var n = document.getElementById("p-name");
    var e = document.getElementById("p-email");
    var p = document.getElementById("p-pass");
    if (n) ui.peopleName = n.value;
    if (e) ui.peopleEmail = e.value;
    if (p) ui.peoplePass = p.value;
  }

  function onClick(e) {
    var t = e.target.closest("[data-act]");
    if (!t) return;
    var act = t.getAttribute("data-act");
    if (act === "logout") { e.preventDefault(); logout(); }
    else if (act === "back") {
      e.preventDefault();
      ui.view = "inbox";
      ui.mobile = "list";
      ui.threadId = ui.threadId;
      ui.error = "";
      render();
    } else if (act === "open-thread") {
      e.preventDefault();
      openThread(t.getAttribute("data-id"));
    } else if (act === "open-dm") {
      e.preventDefault();
      openDm(t.getAttribute("data-id"));
    } else if (act === "open-people") {
      e.preventDefault();
      ui.view = "people";
      ui.mobile = "list";
      ui.error = "";
      ui.notice = "";
      render();
    } else if (act === "photo") {
      e.preventDefault();
      var inp = document.getElementById("photo-input");
      if (inp) inp.click();
    } else if (act === "clear-photo") {
      e.preventDefault();
      ui.pendingImage = null;
      render();
    }
  }

  function onSubmit(e) {
    var form = e.target.closest("form");
    if (!form) return;
    e.preventDefault();
    var act = form.getAttribute("data-act");
    if (act === "login") {
      readLoginFields();
      login();
    } else if (act === "send") {
      var ta = document.getElementById("compose-text");
      if (ta) ui.draft = ta.value;
      postMessage();
    } else if (act === "add-person") {
      readPeopleFields();
      addPerson();
    } else if (act === "save-token") {
      var input = document.getElementById("p-token");
      var val = input ? input.value.trim() : "";
      if (val) setToken(val);
      ui.notice = val ? "Token saved on this device." : "Paste a token to save.";
      ui.tokenSaved = !!val;
      render();
    }
  }

  function onKeydown(e) {
    if (e.target && e.target.id === "compose-text") {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        ui.draft = e.target.value;
        postMessage();
      }
    }
  }

  function onInput(e) {
    if (e.target.id === "search-box") {
      ui.search = e.target.value;
      var convos = document.querySelector(".convos");
      var me = currentUser();
      if (convos && me) convos.innerHTML = renderConvos(me);
    } else if (e.target.id === "compose-text") {
      ui.draft = e.target.value;
      e.target.style.height = "auto";
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    } else if (e.target.id === "login-email") {
      ui.loginEmail = e.target.value;
    } else if (e.target.id === "p-name") {
      ui.peopleName = e.target.value;
    } else if (e.target.id === "p-email") {
      ui.peopleEmail = e.target.value;
    } else if (e.target.id === "p-pass") {
      ui.peoplePass = e.target.value;
    }
  }

  function onChange(e) {
    if (e.target.id !== "photo-input") return;
    var file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.type && file.type.indexOf("image/") !== 0) return;
    var reader = new FileReader();
    reader.onload = function () {
      ui.pendingImage = { dataUrl: String(reader.result || ""), name: file.name, type: file.type };
      render();
    };
    reader.readAsDataURL(file);
  }

  function poll() {
    if (document.hidden) return;
    if (!currentUser()) return;
    if (pushing) return;
    fetchDb().then(function (remote) {
      if (!remote) return;
      var merged = mergeDb(db, remote);
      var before = JSON.stringify({
        users: db.users, threads: db.threads, messages: db.messages, rev: db.rev
      });
      var after = JSON.stringify({
        users: merged.users, threads: merged.threads, messages: merged.messages, rev: merged.rev
      });
      if (before === after) return;
      var localReads = db.reads;
      db = merged;
      if (readsDirty) db.reads = mergeReads(localReads, db.reads);
      cacheLocal();
      render();
    }).catch(function () { /* next tick */ });
  }

  function startPoll() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(poll, POLL_MS);
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) poll();
    });
  }

  function bind() {
    var app = document.getElementById("app");
    app.addEventListener("click", onClick);
    app.addEventListener("submit", onSubmit);
    app.addEventListener("keydown", onKeydown);
    app.addEventListener("input", onInput);
    app.addEventListener("change", onChange);
  }

  function boot() {
    try {
      load();
      bind();
      var start = Promise.resolve();
      if (session && session.userId) {
        start = pullAndApply().then(function () {
          var me = currentUser();
          if (!me) {
            clearSession();
            ui.view = "login";
          } else {
            ui.view = "inbox";
          }
        }).catch(function () {
          if (!currentUser()) {
            clearSession();
            ui.view = "login";
          }
        });
      }
      return start.then(function () {
        render();
        startPoll();
      });
    } catch (err) {
      var app = document.getElementById("app");
      if (app) app.innerHTML = '<div class="boot-err">Could not start Messages.</div>';
      console.error(err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      try { boot(); } catch (err) {
        var app = document.getElementById("app");
        if (app) app.innerHTML = '<div class="boot-err">Could not start Messages.</div>';
      }
    });
  } else {
    try { boot(); } catch (err) {
      var app = document.getElementById("app");
      if (app) app.innerHTML = '<div class="boot-err">Could not start Messages.</div>';
    }
  }
})();
