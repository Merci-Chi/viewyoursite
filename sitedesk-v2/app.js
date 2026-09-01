const KEY = "sitedesk.v2";
const TOKEN_KEY = "sitedesk.githubToken";
const OWNER_KEY = "sitedesk.githubOwner";
const REPO_KEY = "sitedesk.githubRepo";
const ZAI = "https://chat.z.ai";
const PUBLIC_ORIGIN = "https://viewyoursite.today";
const DEFAULT_OWNER = "Merci-Chi";
const DEFAULT_REPO = "viewyoursite";
const MAX_IMG = 1600;
const MAX_EXTRA_PHOTOS = 8;

const STATUS_LABEL = {
  new: "New",
  assigned_caller: "Assigned to caller",
  contacted: "Contacted",
  brief_ready: "Brief ready",
  assigned_builder: "Assigned to builder",
  building: "Building",
  review: "Review",
  done: "Done",
};
const STATUS_ORDER = Object.keys(STATUS_LABEL);

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const uid = () => crypto.randomUUID();
const now = () => Date.now();
const fmt = (ts) => new Date(ts).toLocaleString();
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[c]));

function toast(msg, kind = "") {
  const wrap = $("#toasts");
  if (!wrap) return;
  const el = document.createElement("div");
  el.className = "toast " + kind;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 5200);
}

function load() {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data.messages)) data.messages = [];
      if (!data.reads) data.reads = {};
      for (const lead of data.leads || []) {
        if (!lead.images) lead.images = [];
        if (lead.html == null) lead.html = "";
        if (lead.publishQueued == null) lead.publishQueued = false;
      }
      return data;
    } catch {
      /* fall through to seed */
    }
  }
  const data = seed();
  save(data);
  return data;
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function persist() {
  try {
    save(db);
    return true;
  } catch {
    toast("Storage is full. Remove photos or publish queued sites.", "bad");
    return false;
  }
}

function seed() {
  const admin = { id: uid(), name: "Admin", email: "admin@sitedesk.local", password: "admin123", role: "admin", active: true };
  const caller = { id: uid(), name: "Sam Caller", email: "caller@sitedesk.local", password: "caller123", role: "caller", active: true };
  const builder = { id: uid(), name: "Bee Builder", email: "builder@sitedesk.local", password: "builder123", role: "builder", active: true };
  const t = now();
  const l1 = makeLead({
    businessName: "Gold Rush Smoke Shop",
    phone: "555-0101",
    email: "gold@example.com",
    address: "412 W Main St",
    businessType: "Smoke shop",
    assignedCallerId: caller.id,
    status: "contacted",
    createdAt: t - 86400000 * 3,
  });
  const l2 = makeLead({
    businessName: "AJ Landscaping",
    phone: "555-0102",
    email: "aj@example.com",
    assignedCallerId: caller.id,
    assignedBuilderId: builder.id,
    status: "building",
    createdAt: t - 86400000 * 6,
  });
  const l3 = makeLead({
    businessName: "Premier Tax",
    phone: "555-0103",
    email: "tax@example.com",
    status: "new",
    createdAt: t - 3600000,
  });
  l2.brief = {
    businessName: "AJ Landscaping",
    contact: "AJ · 555-0102",
    whatTheySell: "Residential landscaping, xeriscape, weekly maintenance",
    pagesWanted: "Home, Services, Gallery, Quote form",
    brandColors: "Forest green, sand, off-white",
    exampleSites: "clean landscaper sites, not clipart",
    extraNotes: "Need Spanish toggle later",
    ready: true,
  };
  return {
    users: [admin, caller, builder],
    leads: [l1, l2, l3],
    notes: [
      { id: uid(), leadId: l1.id, authorId: caller.id, text: "Owner wants a menu + hours first. Call back Thursday.", createdAt: t - 86000000 },
      { id: uid(), leadId: l2.id, authorId: caller.id, text: "They already have a logo. Send that to builder.", createdAt: t - 86400000 * 2 },
    ],
    history: [
      { id: uid(), leadId: l1.id, from: "new", to: "assigned_caller", by: admin.id, note: "Assigned Sam", at: t - 86400000 * 3 },
      { id: uid(), leadId: l1.id, from: "assigned_caller", to: "contacted", by: caller.id, note: "Reached owner", at: t - 86400000 * 2 },
      { id: uid(), leadId: l2.id, from: "brief_ready", to: "assigned_builder", by: caller.id, note: "Sent to Bee", at: t - 86400000 * 4 },
      { id: uid(), leadId: l2.id, from: "assigned_builder", to: "building", by: builder.id, note: "Started in z.ai", at: t - 86400000 * 3 },
    ],
    messages: [
      { id: uid(), leadId: l2.id, fromId: caller.id, text: "Logo is coming from the owner tomorrow.", at: t - 86400000 },
      { id: uid(), leadId: null, fromId: admin.id, text: "Ship Gold Rush as soon as the menu photos land.", at: t - 3600000 },
    ],
    reads: {},
    session: null,
  };
}

function makeLead(partial) {
  return {
    id: uid(),
    businessName: "",
    phone: "",
    email: "",
    address: "",
    rating: "",
    businessType: "",
    hours: "",
    website: "",
    notes: "",
    status: "new",
    assignedCallerId: null,
    assignedBuilderId: null,
    siteUrl: "",
    slug: "",
    html: "",
    publishQueued: false,
    publishError: "",
    publishedAt: null,
    images: [],
    brief: emptyBrief(),
    createdAt: now(),
    updatedAt: now(),
    ...partial,
  };
}

function emptyBrief() {
  return {
    businessName: "", contact: "", whatTheySell: "", pagesWanted: "",
    brandColors: "", exampleSites: "", extraNotes: "", ready: false,
  };
}

let db = load();
let route = parseHash();
let busy = false;

function currentUser() {
  return db.users.find((u) => u.id === db.session) || null;
}
function userById(id) {
  return db.users.find((u) => u.id === id);
}
function nameOf(id) {
  return userById(id)?.name || "—";
}
function callers() {
  return db.users.filter((u) => u.role === "caller" && u.active !== false);
}
function builders() {
  return db.users.filter((u) => u.role === "builder" && u.active !== false);
}

function parseHash() {
  const h = (location.hash || "#/login").replace(/^#/, "");
  const parts = h.split("/").filter(Boolean);
  return { name: parts[0] || "login", id: parts[1] || null };
}

window.addEventListener("hashchange", () => {
  route = parseHash();
  render();
});

function go(path) {
  location.hash = path;
}

function setStatus(lead, to, note) {
  const from = lead.status;
  lead.status = to;
  lead.updatedAt = now();
  db.history.unshift({ id: uid(), leadId: lead.id, from, to, by: db.session, note: note || "", at: now() });
}

function canSee(lead, user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role === "caller") return lead.assignedCallerId === user.id;
  if (user.role === "builder") return lead.assignedBuilderId === user.id;
  return false;
}

function canBuild(user) {
  return user && (user.role === "admin" || user.role === "builder");
}

function pillClass(status) {
  if (status === "done") return "ok";
  if (status === "review" || status === "brief_ready") return "warn";
  if (status === "building" || status === "assigned_builder") return "hot";
  return "";
}

function getToken() {
  return (localStorage.getItem(TOKEN_KEY) || "").trim();
}
function githubRepo() {
  return {
    owner: (localStorage.getItem(OWNER_KEY) || "").trim() || DEFAULT_OWNER,
    repo: (localStorage.getItem(REPO_KEY) || "").trim() || DEFAULT_REPO,
  };
}
function publicUrl(slug) {
  return `${PUBLIC_ORIGIN}/${slug}/`;
}

function toSlug(name) {
  const s = String(name || "")
    .normalize("NFKD")
    .replace(/['’]/g, "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")
    .replace(/[^A-Za-z0-9]/g, "");
  return s || "Site";
}

function utf8ToB64(str) {
  const bytes = new TextEncoder().encode(str);
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function dataUrlToB64(dataUrl) {
  const i = String(dataUrl).indexOf(",");
  return i >= 0 ? String(dataUrl).slice(i + 1) : String(dataUrl);
}

function extFor(mime) {
  const m = String(mime || "").toLowerCase();
  if (m.includes("png")) return "png";
  if (m.includes("webp")) return "webp";
  if (m.includes("gif")) return "gif";
  return "jpg";
}

function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function githubMessage(status, text) {
  let extra = text || "";
  try {
    const j = JSON.parse(text);
    extra = j.message || extra;
  } catch { /* keep */ }
  if (status === 401) {
    return "GitHub token is invalid or expired (401). Admin: paste a new classic personal access token (repo scope) in Settings.";
  }
  if (status === 403) {
    const { owner, repo } = githubRepo();
    return `GitHub denied access (403). The token needs Contents: Read and write on ${owner}/${repo}.`;
  }
  if (status === 409) {
    return "GitHub conflict (409). The file changed during publish. Try again.";
  }
  return `GitHub API error (${status}): ${extra || "unknown"}`;
}

async function putContent({ token, path, contentB64, message }) {
  const { owner, repo } = githubRepo();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = githubHeaders(token);
  let sha;
  const get = await fetch(url, { headers });
  if (get.status === 401 || get.status === 403) {
    throw new Error(githubMessage(get.status, await get.text()));
  }
  if (get.ok) {
    const data = await get.json();
    sha = data.sha;
  } else if (get.status !== 404) {
    throw new Error(githubMessage(get.status, await get.text()));
  }
  const body = { message, content: contentB64, branch: "main" };
  if (sha) body.sha = sha;
  const send = () => fetch(url, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let put = await send();
  if (put.status === 409) {
    const again = await fetch(url, { headers });
    if (again.ok) {
      body.sha = (await again.json()).sha;
      put = await send();
    }
  }
  if (!put.ok) throw new Error(githubMessage(put.status, await put.text()));
  return put.json();
}

function withPublishedAssets(html, images) {
  const files = (images || []).filter((im) => im.filename && im.dataUrl);
  let out = html || "";
  if (!files.length) return out;
  const comment = `<!-- sitedesk-assets: ${files.map((f) => f.filename).join(", ")} -->\n`;
  const referenced = files.every((f) => out.includes(f.filename));
  if (!referenced) {
    const gallery = [
      `<section class="sitedesk-gallery" aria-label="Business photos">`,
      ...files.map((f) => `  <img src="${esc(f.filename)}" alt="${esc(f.kind || "photo")}">`),
      `</section>`,
    ].join("\n");
    if (/<\/body>/i.test(out)) out = out.replace(/<\/body>/i, `${gallery}\n</body>`);
    else out += `\n${gallery}\n`;
  }
  return comment + out;
}

function previewDoc(lead) {
  let html = withPublishedAssets(lead.html || "", lead.images);
  for (const im of lead.images || []) {
    if (!im.filename || !im.dataUrl) continue;
    html = html.split(`src="${im.filename}"`).join(`src="${im.dataUrl}"`);
    html = html.split(`src='${im.filename}'`).join(`src="${im.dataUrl}"`);
  }
  return html;
}

async function githubPublish(lead, token) {
  const slug = lead.slug || toSlug(lead.brief?.businessName || lead.businessName);
  lead.slug = slug;
  for (const im of lead.images || []) {
    if (!im.dataUrl || !im.filename) continue;
    await putContent({
      token,
      path: `${slug}/${im.filename}`,
      contentB64: dataUrlToB64(im.dataUrl),
      message: `Add ${slug}/${im.filename} from SiteDesk`,
    });
  }
  const html = withPublishedAssets(lead.html, lead.images);
  await putContent({
    token,
    path: `${slug}/index.html`,
    contentB64: utf8ToB64(html),
    message: `Add ${slug} site from SiteDesk`,
  });
}

function markPublished(lead, user) {
  lead.publishQueued = false;
  lead.publishError = "";
  lead.siteUrl = publicUrl(lead.slug);
  lead.publishedAt = now();
  lead.updatedAt = now();
  if (lead.status === "building" || lead.status === "assigned_builder") {
    setStatus(lead, "review", "Published to GitHub Pages");
  } else if (user?.role === "admin" && lead.status === "review") {
    /* stay in review so caller can sign off */
  }
}

async function publishLead(lead, user) {
  const ta = $("#html-paste");
  if (ta) lead.html = ta.value;
  persist();
  if (!(lead.html || "").trim()) {
    toast("Paste the HTML from z.ai first.", "bad");
    return;
  }
  lead.slug = toSlug(lead.brief?.businessName || lead.businessName);
  const token = getToken();
  if (!token) {
    lead.publishQueued = true;
    lead.publishError = "";
    persist();
    toast("HTML saved locally. Admin must add a GitHub token in Settings to go live.", "warn");
    render();
    return;
  }
  busy = true;
  render();
  try {
    await githubPublish(lead, token);
    markPublished(lead, user);
    persist();
    toast("Live at " + lead.siteUrl, "ok");
  } catch (err) {
    lead.publishQueued = true;
    lead.publishError = err.message || String(err);
    persist();
    toast(lead.publishError, "bad");
  } finally {
    busy = false;
    render();
  }
}

async function publishQueuedAll(user) {
  const token = getToken();
  if (!token) {
    toast("Add a GitHub token first.", "bad");
    return;
  }
  const queued = db.leads.filter((l) => l.publishQueued && (l.html || "").trim());
  if (!queued.length) {
    toast("No queued sites.", "warn");
    return;
  }
  busy = true;
  render();
  let ok = 0;
  let fail = 0;
  for (const lead of queued) {
    try {
      lead.slug = lead.slug || toSlug(lead.businessName);
      await githubPublish(lead, token);
      markPublished(lead, user);
      ok++;
    } catch (err) {
      lead.publishError = err.message || String(err);
      fail++;
    }
    persist();
  }
  busy = false;
  render();
  toast(`Published ${ok} site(s)` + (fail ? `, ${fail} failed` : ""), fail ? "warn" : "ok");
}

function compressImage(file, maxW = MAX_IMG) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Not an image"));
      return;
    }
    const img = new Image();
    const obj = URL.createObjectURL(file);
    img.onload = () => {
      try {
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > maxW) {
          h = Math.round(h * (maxW / w));
          w = maxW;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const keepPng = /png/i.test(file.type);
        const mime = keepPng ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mime, 0.82);
        URL.revokeObjectURL(obj);
        resolve({ dataUrl, mime, width: w, height: h });
      } catch (err) {
        URL.revokeObjectURL(obj);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(obj);
      reject(new Error("Could not read image"));
    };
    img.src = obj;
  });
}

function nextPhotoName(lead, mime) {
  const n = (lead.images || []).filter((im) => im.kind === "photo").length + 1;
  return `photo-${n}.${extFor(mime)}`;
}

async function addLeadImage(lead, file, kind) {
  const packed = await compressImage(file);
  let filename;
  if (kind === "logo") filename = `logo.${extFor(packed.mime)}`;
  else if (kind === "storefront") filename = `storefront.${extFor(packed.mime)}`;
  else filename = nextPhotoName(lead, packed.mime);
  lead.images = lead.images || [];
  if (kind === "logo" || kind === "storefront") {
    lead.images = lead.images.filter((im) => im.kind !== kind);
  } else if (lead.images.filter((im) => im.kind === "photo").length >= MAX_EXTRA_PHOTOS) {
    throw new Error(`Max ${MAX_EXTRA_PHOTOS} extra photos`);
  }
  lead.images.push({
    id: uid(),
    kind,
    name: file.name,
    mime: packed.mime,
    filename,
    dataUrl: packed.dataUrl,
  });
  lead.updatedAt = now();
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;
  const src = String(text).replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];
    if (inQuotes) {
      if (c === '"' && n === '"') { cur += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n") {
      row.push(cur); cur = "";
      if (row.some((x) => String(x).trim())) rows.push(row);
      row = [];
    } else if (c !== "\r") cur += c;
  }
  if (cur.length || row.length) {
    row.push(cur);
    if (row.some((x) => String(x).trim())) rows.push(row);
  }
  return rows;
}

function parseImport(text) {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const first = rows[0].map((c, i) => {
    let v = String(c || "").trim();
    if (i === 0) v = v.replace(/^#\s*/, "");
    return v.toLowerCase();
  });
  const hasHeader = first.some((c) => c === "name" || c === "business" || c === "business name");
  const col = { name: 0 };
  let start = 0;
  if (hasHeader) {
    first.forEach((h, i) => {
      if (h === "name" || h === "business" || h === "business name") col.name = i;
      else if (h.includes("address")) col.address = i;
      else if (h.includes("phone")) col.phone = i;
      else if (h.includes("rating")) col.rating = i;
      else if (h.includes("type")) col.type = i;
      else if (h.includes("hour")) col.hours = i;
      else if (h.includes("web")) col.website = i;
      else if (h.includes("email")) col.email = i;
    });
    start = 1;
  }
  const out = [];
  for (let i = start; i < rows.length; i++) {
    const r = rows[i];
    if (!r.length) continue;
    if (String(r[0]).trim().startsWith("#")) continue;
    let name = String(r[col.name] ?? "").trim();
    let phone = col.phone != null ? String(r[col.phone] ?? "").trim() : "";
    if (!hasHeader) {
      name = String(r[0] ?? "").trim();
      phone = "";
      if (r.length === 1) {
        const line = name;
        const m = line.match(/^(.*?)[,|\t]\s*([+\d().\-\s]{7,})$/);
        if (m) { name = m[1].trim(); phone = m[2].trim(); }
      } else {
        for (const cell of r.slice(1)) {
          if (String(cell).replace(/\D/g, "").length >= 7) {
            phone = String(cell).trim();
            break;
          }
        }
      }
    }
    if (!name) continue;
    out.push({
      businessName: name,
      address: col.address != null ? String(r[col.address] ?? "").trim() : "",
      phone,
      rating: col.rating != null ? String(r[col.rating] ?? "").trim() : "",
      businessType: col.type != null ? String(r[col.type] ?? "").trim() : "",
      hours: col.hours != null ? String(r[col.hours] ?? "").trim() : "",
      website: col.website != null ? String(r[col.website] ?? "").trim() : "",
      email: col.email != null ? String(r[col.email] ?? "").trim() : "",
    });
  }
  return out;
}

function leadKey(name, phone) {
  return String(name || "").trim().toLowerCase() + "|" + String(phone || "").replace(/\D/g, "");
}

function importLeads(text, assignCallerId, user) {
  const items = parseImport(text);
  const existing = new Set(db.leads.map((l) => leadKey(l.businessName, l.phone)));
  let added = 0;
  let skipped = 0;
  for (const item of items) {
    const k = leadKey(item.businessName, item.phone);
    if (existing.has(k)) { skipped++; continue; }
    existing.add(k);
    const lead = makeLead({
      ...item,
      assignedCallerId: assignCallerId || null,
      status: assignCallerId ? "assigned_caller" : "new",
    });
    db.leads.unshift(lead);
    db.history.unshift({
      id: uid(), leadId: lead.id, from: "", to: lead.status, by: user.id, note: "Bulk import", at: now(),
    });
    added++;
  }
  persist();
  return { added, skipped };
}

function unreadTeam(user) {
  const last = db.reads[user.id]?.team || 0;
  return db.messages.filter((m) => m.leadId == null && m.at > last && m.fromId !== user.id).length;
}

function unreadLead(user, leadId) {
  const last = db.reads[user.id]?.leads?.[leadId] || 0;
  return db.messages.filter((m) => m.leadId === leadId && m.at > last && m.fromId !== user.id).length;
}

function markRead(user, leadId) {
  if (!db.reads[user.id]) db.reads[user.id] = { team: 0, leads: {} };
  if (leadId == null) db.reads[user.id].team = now();
  else {
    if (!db.reads[user.id].leads) db.reads[user.id].leads = {};
    db.reads[user.id].leads[leadId] = now();
  }
  persist();
}

function threadMessages(leadId) {
  return db.messages
    .filter((m) => (leadId == null ? m.leadId == null : m.leadId === leadId))
    .sort((a, b) => b.at - a.at);
}

function postMessage(user, leadId, text) {
  const t = String(text || "").trim();
  if (!t) return;
  db.messages.unshift({ id: uid(), leadId, fromId: user.id, text: t, at: now() });
  persist();
}


function homeFor(user) {
  if (user.role === "builder") return "/jobs";
  return "/board";
}

function render() {
  const root = $("#app");
  const user = currentUser();
  if (!user && route.name !== "login") {
    go("/login");
    return;
  }
  if (user && route.name === "login") {
    go(homeFor(user));
    return;
  }
  if (!user) {
    root.innerHTML = loginView();
    bindLogin();
    return;
  }
  root.innerHTML = (busy ? `<div class="busy-bar"></div>` : "") + shell(user, page(user));
  bindShell(user);
}

function loginView() {
  return `
    <div class="login">
      <form class="card login-card" id="login-form">
        <h1 class="display">SiteDesk</h1>
        <p class="muted">Internal production desk. Admin, caller, builder.</p>
        <label class="field"><span>Email</span><input name="email" type="email" required autocomplete="username"/></label>
        <label class="field"><span>Password</span><input name="password" type="password" required autocomplete="current-password"/></label>
        <div class="row"><button class="btn primary" type="submit">Sign in</button></div>
        <p class="hint">Demo: admin@sitedesk.local / admin123 · caller@sitedesk.local / caller123 · builder@sitedesk.local / builder123</p>
        <p id="login-err" class="hint bad-text"></p>
      </form>
    </div>`;
}

function bindLogin() {
  $("#login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = String(fd.get("email")).trim().toLowerCase();
    const password = String(fd.get("password"));
    const u = db.users.find((x) => x.email === email && x.password === password && x.active !== false);
    if (!u) {
      $("#login-err").textContent = "Wrong email or password.";
      return;
    }
    db.session = u.id;
    persist();
    go(homeFor(u));
  });
}

function navItems(user) {
  const teamBadge = unreadTeam(user);
  const chatLabel = `Team chat${teamBadge ? ` <span class="badge">${teamBadge}</span>` : ""}`;
  if (user.role === "admin") {
    return [
      ["/board", "Board"],
      ["/leads", "Leads"],
      ["/chat", chatLabel],
      ["/users", "Team"],
      ["/settings", "Settings"],
    ];
  }
  if (user.role === "caller") {
    return [
      ["/board", "My leads"],
      ["/leads", "All mine"],
      ["/chat", chatLabel],
    ];
  }
  return [
    ["/jobs", "My jobs"],
    ["/chat", chatLabel],
  ];
}

function shell(user, inner) {
  const items = navItems(user)
    .map(([href, label]) => `<a href="#${href}" class="${route.name === href.slice(1) ? "active" : ""}">${label}</a>`)
    .join("");
  return `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand"><b>SiteDesk</b><span class="muted">${esc(user.role)}</span></div>
        <nav class="nav">${items}</nav>
        <div class="side-foot">
          <div class="who">${esc(user.name)}<div class="muted">${esc(user.email)}</div></div>
          <button class="btn ghost tiny" id="logout">Log out</button>
        </div>
      </aside>
      <main class="main">${inner}</main>
    </div>`;
}

function bindShell(user) {
  $("#logout")?.addEventListener("click", () => {
    db.session = null;
    persist();
    go("/login");
  });
  bindPage(user);
}

function page(user) {
  if (route.name === "users" && user.role === "admin") return usersPage();
  if (route.name === "settings" && user.role === "admin") return settingsPage();
  if (route.name === "chat") return teamChatPage(user);
  if (route.name === "lead" && route.id) return leadPage(user, route.id);
  if (route.name === "leads") return leadsPage(user);
  if (route.name === "jobs") return jobsPage(user);
  return boardPage(user);
}

function visibleLeads(user) {
  return db.leads.filter((l) => canSee(l, user)).sort((a, b) => b.updatedAt - a.updatedAt);
}

function boardPage(user) {
  const leads = visibleLeads(user);
  const counts = STATUS_ORDER.map((s) => ({
    s,
    n: leads.filter((l) => l.status === s).length,
  }));
  const recent = leads.slice(0, 10);
  const queued = user.role === "admin" ? db.leads.filter((l) => l.publishQueued).length : 0;
  return `
    <div class="top">
      <div>
        <h1 class="display">${user.role === "admin" ? "Board" : "My leads"}</h1>
        <p class="muted">Leads in, brief out, HTML published to a public folder.</p>
      </div>
      ${user.role !== "builder" ? `<button class="btn primary" data-open-new>New lead</button>` : ""}
    </div>
    ${queued ? `<div class="banner">${queued} site(s) queued — add a GitHub token in Settings, then publish them.</div>` : ""}
    <div class="grid stats">
      ${counts.map((c) => `<div class="card stat"><div class="n">${c.n}</div><div class="l">${STATUS_LABEL[c.s]}</div></div>`).join("")}
    </div>
    <div class="card" style="margin-top:16px">
      ${leadTable(recent, user, "Nothing here yet.")}
    </div>`;
}

function leadsPage(user) {
  const leads = visibleLeads(user);
  return `
    <div class="top">
      <div>
        <h1 class="display">Leads</h1>
        <p class="muted">${leads.length} visible to you</p>
      </div>
      <div class="row">
        <input class="search" id="lead-search" placeholder="Search name or phone" />
        ${user.role === "admin" ? `<button class="btn" data-open-import>Import CSV</button>` : ""}
        ${user.role !== "builder" ? `<button class="btn primary" data-open-new>New lead</button>` : ""}
      </div>
    </div>
    <div class="card" id="lead-table-wrap">${leadTable(leads, user, "No leads yet.")}</div>`;
}

function jobsPage(user) {
  const jobs = visibleLeads(user);
  return `
    <div class="top">
      <div>
        <h1 class="display">Build jobs</h1>
        <p class="muted">Copy the brief, build in z.ai (new tab), paste HTML, preview, publish.</p>
      </div>
    </div>
    <div class="card">${leadTable(jobs, user, "No jobs assigned yet.")}</div>`;
}

function leadTable(leads, user, empty) {
  if (!leads.length) return `<div class="empty">${empty}</div>`;
  return `
    <table class="table">
      <thead><tr><th>Business</th><th>Status</th><th>Caller</th><th>Builder</th><th>Updated</th></tr></thead>
      <tbody>
        ${leads.map((l) => {
          const unread = unreadLead(user, l.id);
          return `
          <tr class="clickable" data-open-lead="${l.id}">
            <td>
              ${unread ? `<span class="dot" title="Unread chat"></span>` : ""}
              <b>${esc(l.businessName)}</b>
              <div class="muted">${esc(l.phone)}${l.address ? " · " + esc(l.address) : ""}</div>
            </td>
            <td>
              <span class="pill ${pillClass(l.status)}">${STATUS_LABEL[l.status] || l.status}</span>
              ${l.publishQueued ? `<span class="pill warn">Queued</span>` : ""}
              ${l.siteUrl ? `<span class="pill ok">Live</span>` : ""}
            </td>
            <td>${esc(nameOf(l.assignedCallerId))}</td>
            <td>${esc(nameOf(l.assignedBuilderId))}</td>
            <td class="muted">${fmt(l.updatedAt)}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>`;
}

function leadPage(user, id) {
  const lead = db.leads.find((l) => l.id === id);
  if (!lead || !canSee(lead, user)) return `<p>Lead not found.</p>`;
  markRead(user, lead.id);
  const notes = db.notes.filter((n) => n.leadId === lead.id).sort((a, b) => b.createdAt - a.createdAt);
  const hist = db.history.filter((h) => h.leadId === lead.id);
  const b = lead.brief || emptyBrief();
  const showBuilder = canBuild(user);
  const tel = String(lead.phone || "").replace(/[^\d+]/g, "");
  return `
    <div class="top">
      <div>
        <p class="muted"><a href="#/${user.role === "builder" ? "jobs" : "leads"}">Back</a></p>
        <h1 class="display">${esc(lead.businessName)}</h1>
        <p>
          <span class="pill ${pillClass(lead.status)}">${STATUS_LABEL[lead.status] || lead.status}</span>
          ${lead.publishQueued ? `<span class="pill warn">Publish queued</span>` : ""}
        </p>
      </div>
      <div class="row">${actionsFor(lead, user)}</div>
    </div>
    ${lead.publishQueued && !getToken() ? `<div class="banner">Admin must add a GitHub token in Settings to go live. HTML is saved on this device.</div>` : ""}
    ${lead.publishError ? `<div class="banner bad">${esc(lead.publishError)}</div>` : ""}
    <div class="split">
      <div>
        <div class="card">
          <h3 class="display">Lead</h3>
          <p>
            ${tel ? `<a href="tel:${esc(tel)}">${esc(lead.phone)}</a>` : esc(lead.phone) || "no phone"}
            · ${esc(lead.email) || "no email"}
          </p>
          ${lead.address ? `<p class="muted">${esc(lead.address)}</p>` : ""}
          ${lead.businessType || lead.hours ? `<p class="muted">${esc(lead.businessType)}${lead.hours ? " · " + esc(lead.hours) : ""}</p>` : ""}
          ${lead.notes ? `<p class="muted">${esc(lead.notes)}</p>` : ""}
          ${user.role === "admin" ? assignForm(lead) : `<p class="muted">Caller ${esc(nameOf(lead.assignedCallerId))} · Builder ${esc(nameOf(lead.assignedBuilderId))}</p>`}
        </div>
        <div class="card" style="margin-top:12px">
          <h3 class="display">Photos</h3>
          <p class="muted">Logo, storefront, extras. Compressed to ~1600px. Published as files next to index.html.</p>
          <div class="row" style="margin-bottom:10px">
            <label class="btn tiny">Logo<input type="file" accept="image/*" hidden data-img-kind="logo"/></label>
            <label class="btn tiny">Storefront<input type="file" accept="image/*" hidden data-img-kind="storefront"/></label>
            <label class="btn tiny">Extra photos<input type="file" accept="image/*" multiple hidden data-img-kind="photo"/></label>
          </div>
          ${photoGrid(lead)}
        </div>
        <div class="card" style="margin-top:12px">
          <h3 class="display">Brief</h3>
          ${user.role === "builder" ? briefRead(b) : briefForm(b)}
          <div class="row" style="margin-top:8px">
            <button class="btn" data-copy-brief type="button">Copy brief for z.ai</button>
            <a class="btn primary" href="${ZAI}" target="_blank" rel="noopener">Open z.ai</a>
          </div>
          <p class="help" style="margin-top:8px">z.ai does not embed (X-Frame-Options). Open it in a tab, then paste HTML on the right.</p>
        </div>
        <div class="card" style="margin-top:12px">
          <h3 class="display">Call notes</h3>
          <form id="note-form">
            <textarea name="text" placeholder="What did the owner say?" required></textarea>
            <div class="row" style="margin-top:8px"><button class="btn primary" type="submit">Add note</button></div>
          </form>
          <div class="notes" style="margin-top:12px">
            ${notes.map((n) => `<div class="note"><b>${esc(nameOf(n.authorId))}</b> <span class="muted">${fmt(n.createdAt)}</span><div>${esc(n.text)}</div></div>`).join("") || `<p class="muted">No notes yet.</p>`}
          </div>
        </div>
      </div>
      <div>
        ${showBuilder ? builderWorkspace(lead) : callerPreview(lead)}
        <div class="card" style="margin-top:12px">
          <h3 class="display">Live site</h3>
          ${lead.siteUrl
            ? `<a class="live-link" href="${esc(lead.siteUrl)}" target="_blank" rel="noopener">${esc(lead.siteUrl)}</a>
               <p class="muted">No login required to view.</p>`
            : `<p class="muted">Not published yet. ${lead.publishQueued ? "Queued for admin." : "Builder pastes HTML and hits Save / Publish."}</p>`}
        </div>
        <div class="card chat-card" style="margin-top:12px">
          <h3 class="display">Lead chat</h3>
          ${chatPanel(user, lead.id)}
        </div>
        <div class="card" style="margin-top:12px">
          <h3 class="display">History</h3>
          <ul class="history">
            ${hist.map((h) => `<li>${fmt(h.at)} — ${esc(nameOf(h.by))} · ${STATUS_LABEL[h.from] || h.from || "—"} → ${STATUS_LABEL[h.to] || h.to} ${h.note ? "· " + esc(h.note) : ""}</li>`).join("") || "<li>No history</li>"}
          </ul>
        </div>
      </div>
    </div>`;
}

function photoGrid(lead) {
  const imgs = lead.images || [];
  if (!imgs.length) return `<p class="muted">No photos yet.</p>`;
  return `<div class="photos">${imgs.map((im) => `
    <div class="photo">
      <img src="${im.dataUrl}" alt="${esc(im.kind)}" data-lightbox="${im.id}"/>
      <span class="cap">${esc(im.kind)}</span>
      <button type="button" class="x" data-del-img="${im.id}" aria-label="Remove">×</button>
    </div>`).join("")}</div>`;
}

function builderWorkspace(lead) {
  return `
    <div class="card">
      <h3 class="display">Builder workspace</h3>
      <p class="muted">Paste the finished HTML from z.ai. Preview is local (srcdoc). Save / Publish writes a public folder on GitHub Pages.</p>
      <label class="field"><span>HTML</span>
        <textarea class="code" id="html-paste" spellcheck="false" placeholder="<!DOCTYPE html>">${esc(lead.html || "")}</textarea>
      </label>
      <div class="row" style="margin-bottom:12px">
        <button class="btn" type="button" data-save-html>Save draft</button>
        <button class="btn primary" type="button" data-publish ${busy ? "disabled" : ""}>${busy ? "Publishing…" : "Save / Publish"}</button>
      </div>
      <p class="muted" style="margin:0 0 8px">Live preview</p>
      <div class="preview-wrap">
        <iframe id="preview-frame" title="Preview" sandbox="allow-scripts allow-forms allow-modals"></iframe>
      </div>
    </div>`;
}

function callerPreview(lead) {
  if (!(lead.html || "").trim()) {
    return `<div class="card"><h3 class="display">Site preview</h3><p class="muted">Builder has not pasted HTML yet.</p></div>`;
  }
  return `
    <div class="card">
      <h3 class="display">Site preview</h3>
      <div class="preview-wrap">
        <iframe id="preview-frame" title="Preview" sandbox="allow-scripts allow-forms allow-modals"></iframe>
      </div>
    </div>`;
}

function chatPanel(user, leadId) {
  const msgs = threadMessages(leadId);
  const last = leadId == null ? (db.reads[user.id]?.team || 0) : (db.reads[user.id]?.leads?.[leadId] || 0);
  return `
    <form class="chat-compose" data-chat-form="${leadId == null ? "team" : leadId}">
      <textarea name="text" rows="2" placeholder="${leadId == null ? "Message the team…" : "Message this lead…"}" required></textarea>
      <button class="btn primary" type="submit">Send</button>
    </form>
    <div class="chat-log">
      ${msgs.map((m) => `
        <div class="bubble ${m.fromId === user.id ? "me" : ""} ${m.at > last && m.fromId !== user.id ? "unread" : ""}">
          <div class="meta">${esc(nameOf(m.fromId))} · ${fmt(m.at)}</div>
          <div>${esc(m.text)}</div>
        </div>`).join("") || `<p class="muted">No messages yet. Latest shows at the top.</p>`}
    </div>`;
}

function teamChatPage(user) {
  markRead(user, null);
  return `
    <div class="top">
      <div>
        <h1 class="display">Team inbox</h1>
        <p class="muted">Everyone logged in can post. Admin can reach the whole crew.</p>
      </div>
    </div>
    <div class="card chat-card chat-page">
      ${chatPanel(user, null)}
    </div>`;
}

function assignForm(lead) {
  return `
    <form id="assign-form" class="grid" style="margin-top:12px">
      <label class="field"><span>Caller</span>
        <select name="caller">
          <option value="">Unassigned</option>
          ${callers().map((u) => `<option value="${u.id}" ${u.id === lead.assignedCallerId ? "selected" : ""}>${esc(u.name)}</option>`).join("")}
        </select>
      </label>
      <label class="field"><span>Builder</span>
        <select name="builder">
          <option value="">Unassigned</option>
          ${builders().map((u) => `<option value="${u.id}" ${u.id === lead.assignedBuilderId ? "selected" : ""}>${esc(u.name)}</option>`).join("")}
        </select>
      </label>
      <button class="btn" type="submit">Save assignment</button>
    </form>`;
}

function briefForm(b) {
  return `
    <form id="brief-form">
      <label class="field"><span>Business name</span><input name="businessName" value="${esc(b.businessName)}"/></label>
      <label class="field"><span>Contact</span><input name="contact" value="${esc(b.contact)}"/></label>
      <label class="field"><span>What they sell</span><textarea name="whatTheySell">${esc(b.whatTheySell)}</textarea></label>
      <label class="field"><span>Pages wanted</span><textarea name="pagesWanted">${esc(b.pagesWanted)}</textarea></label>
      <label class="field"><span>Brand / colors</span><input name="brandColors" value="${esc(b.brandColors)}"/></label>
      <label class="field"><span>Example sites</span><textarea name="exampleSites">${esc(b.exampleSites)}</textarea></label>
      <label class="field"><span>Extra notes</span><textarea name="extraNotes">${esc(b.extraNotes)}</textarea></label>
      <button class="btn primary" type="submit">Save brief</button>
    </form>`;
}

function briefRead(b) {
  const row = (k, l) => `<p><span class="muted">${l}</span><br>${esc(b[k]) || "—"}</p>`;
  return `
    ${row("businessName", "Business")}
    ${row("contact", "Contact")}
    ${row("whatTheySell", "What they sell")}
    ${row("pagesWanted", "Pages")}
    ${row("brandColors", "Brand")}
    ${row("exampleSites", "Examples")}
    ${row("extraNotes", "Notes")}`;
}

function actionsFor(lead, user) {
  const btn = (label, action, cls = "") =>
    `<button class="btn ${cls}" data-status-action="${action}">${label}</button>`;
  const bits = [];
  if (user.role === "caller" || user.role === "admin") {
    if (lead.status === "assigned_caller" || lead.status === "new") bits.push(btn("Mark contacted", "contacted"));
    if (["contacted", "assigned_caller"].includes(lead.status)) bits.push(btn("Brief ready", "brief_ready", "primary"));
    if (lead.status === "brief_ready" && lead.assignedBuilderId) bits.push(btn("Send to builder", "assigned_builder", "primary"));
    if (lead.status === "review") bits.push(btn("Request changes", "building"), btn("Mark done", "done", "primary"));
  }
  if (user.role === "builder" || user.role === "admin") {
    if (lead.status === "assigned_builder") bits.push(btn("Start building", "building", "primary"));
    if (lead.status === "building") bits.push(btn("Send to review", "review", "primary"));
  }
  return bits.join("") || `<span class="muted">No actions right now</span>`;
}

function usersPage() {
  const rows = db.users.map((u) => `
    <tr>
      <td><b>${esc(u.name)}</b><div class="muted">${esc(u.email)}</div></td>
      <td>${esc(u.role)}</td>
      <td>${u.active === false ? "Off" : "Active"}</td>
      <td><button class="btn tiny" data-toggle-user="${u.id}">${u.active === false ? "Activate" : "Deactivate"}</button></td>
    </tr>`).join("");
  return `
    <div class="top">
      <div>
        <h1 class="display">Team</h1>
        <p class="muted">Only admin, callers, and builders log in.</p>
      </div>
      <button class="btn primary" data-open-user>New person</button>
    </div>
    <div class="card">
      <table class="table">
        <thead><tr><th>Person</th><th>Role</th><th>Status</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function settingsPage() {
  const token = getToken();
  const { owner, repo } = githubRepo();
  const queued = db.leads.filter((l) => l.publishQueued);
  const tail = token.length > 4 ? "…" + token.slice(-4) : "";
  return `
    <div class="top">
      <div>
        <h1 class="display">Admin settings</h1>
        <p class="muted">GitHub token lives only in this browser. Never commit it.</p>
      </div>
    </div>
    <div class="card">
      <h3 class="display">GitHub publish</h3>
      <p class="help">Create a <b>classic</b> personal access token with the <b>repo</b> scope. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic). Paste it here. Builders do not need GitHub.</p>
      <form id="token-form">
        <label class="field"><span>Personal access token</span>
          <input name="token" type="password" autocomplete="off" placeholder="${token ? "Token saved on this device — paste to replace" : "github_pat_…"}"/>
        </label>
        ${token ? `<p class="token-set muted">Saved on this device ${esc(tail)}</p>` : `<p class="warn-text">No token on this device. Publish will queue locally.</p>`}
        <label class="field"><span>Owner (optional)</span>
          <input name="owner" value="${esc(owner)}" placeholder="${DEFAULT_OWNER}"/>
        </label>
        <label class="field"><span>Repo (optional)</span>
          <input name="repo" value="${esc(repo)}" placeholder="${DEFAULT_REPO}"/>
        </label>
        <div class="row">
          <button class="btn primary" type="submit">Save settings</button>
          <button class="btn danger" type="button" id="clear-token">Clear token</button>
        </div>
      </form>
    </div>
    <div class="card" style="margin-top:12px">
      <h3 class="display">Queued sites</h3>
      <p class="muted">${queued.length} waiting to go live. Public URL pattern: ${PUBLIC_ORIGIN}/{slug}/</p>
      ${queued.length ? `
        <table class="table">
          <thead><tr><th>Business</th><th>Slug</th><th>Error</th></tr></thead>
          <tbody>
            ${queued.map((l) => `<tr>
              <td><a href="#/lead/${l.id}">${esc(l.businessName)}</a></td>
              <td class="muted">${esc(l.slug || toSlug(l.businessName))}</td>
              <td class="bad-text">${esc(l.publishError || "")}</td>
            </tr>`).join("")}
          </tbody>
        </table>
        <div class="row" style="margin-top:12px">
          <button class="btn primary" type="button" id="publish-queued" ${busy || !token ? "disabled" : ""}>Publish queued sites</button>
        </div>
        ${!token ? `<p class="warn-text">Add a token above first.</p>` : ""}
      ` : `<p class="muted">Nothing queued.</p>`}
    </div>`;
}


function briefText(lead) {
  const b = lead?.brief || emptyBrief();
  const assets = (lead.images || []).map((im) => im.filename).filter(Boolean);
  return `Build a complete, production-ready website in z.ai for this client.
Return a single HTML file I can paste into SiteDesk and publish.

Business: ${b.businessName || lead.businessName}
Contact: ${b.contact || (lead.phone + " " + lead.email)}
Phone: ${lead.phone}
Email: ${lead.email}
Address: ${lead.address || ""}
Hours: ${lead.hours || ""}
Type: ${lead.businessType || ""}
Existing website: ${lead.website || "none"}

What they sell:
${b.whatTheySell}

Pages wanted:
${b.pagesWanted}

Brand / colors:
${b.brandColors}

Example sites:
${b.exampleSites}

Extra notes:
${b.extraNotes}

Call notes:
${db.notes.filter((n) => n.leadId === lead.id).map((n) => "- " + n.text).join("\n") || "(none)"}

Photos (will be uploaded into the same folder as index.html — use relative paths):
${assets.map((f) => "- " + f).join("\n") || "(none uploaded yet; a gallery will be injected if missing)"}

Public URL after publish: ${PUBLIC_ORIGIN}/{Slug}/  where Slug is PascalCase of the business name.
`;
}

function bindPage(user) {
  $$("[data-open-lead]").forEach((tr) => {
    tr.addEventListener("click", () => go("/lead/" + tr.dataset.openLead));
  });
  $("[data-open-new]")?.addEventListener("click", () => openNewLead(user));
  $("[data-open-user]")?.addEventListener("click", () => openNewUser());
  $("[data-open-import]")?.addEventListener("click", () => openImport(user));

  $("#lead-search")?.addEventListener("input", (e) => {
    const q = String(e.target.value || "").trim().toLowerCase();
    const leads = visibleLeads(user).filter((l) => {
      if (!q) return true;
      return [l.businessName, l.phone, l.email, l.address, l.businessType]
        .join(" ").toLowerCase().includes(q);
    });
    $("#lead-table-wrap").innerHTML = leadTable(leads, user, "No matches.");
    $$("[data-open-lead]").forEach((tr) => {
      tr.addEventListener("click", () => go("/lead/" + tr.dataset.openLead));
    });
  });

  $$("[data-status-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lead = db.leads.find((l) => l.id === route.id);
      if (!lead) return;
      const to = btn.dataset.statusAction;
      if (to === "assigned_builder" && !lead.assignedBuilderId) {
        toast("Assign a builder first.", "warn");
        return;
      }
      if (to === "assigned_caller" && !lead.assignedCallerId) {
        toast("Assign a caller first.", "warn");
        return;
      }
      setStatus(lead, to, "");
      persist();
      render();
    });
  });

  $("[data-copy-brief]")?.addEventListener("click", async () => {
    const lead = db.leads.find((l) => l.id === route.id);
    const text = briefText(lead);
    try {
      await navigator.clipboard.writeText(text);
      $("[data-copy-brief]").textContent = "Copied";
      toast("Brief copied. Open z.ai in a tab.", "ok");
    } catch {
      prompt("Copy this brief", text);
    }
  });

  $("#note-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = String(new FormData(e.target).get("text") || "").trim();
    if (!text) return;
    db.notes.unshift({ id: uid(), leadId: route.id, authorId: user.id, text, createdAt: now() });
    persist();
    render();
  });

  $("#brief-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const lead = db.leads.find((l) => l.id === route.id);
    const fd = new FormData(e.target);
    lead.brief = {
      businessName: fd.get("businessName"),
      contact: fd.get("contact"),
      whatTheySell: fd.get("whatTheySell"),
      pagesWanted: fd.get("pagesWanted"),
      brandColors: fd.get("brandColors"),
      exampleSites: fd.get("exampleSites"),
      extraNotes: fd.get("extraNotes"),
      ready: true,
    };
    if (!lead.brief.businessName) lead.brief.businessName = lead.businessName;
    lead.updatedAt = now();
    persist();
    toast("Brief saved", "ok");
    render();
  });

  $("#assign-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const lead = db.leads.find((l) => l.id === route.id);
    const fd = new FormData(e.target);
    const callerId = fd.get("caller") || null;
    const builderId = fd.get("builder") || null;
    lead.assignedCallerId = callerId;
    lead.assignedBuilderId = builderId;
    if (callerId && lead.status === "new") setStatus(lead, "assigned_caller", "Assigned caller");
    persist();
    render();
  });

  $$("[data-chat-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const raw = form.dataset.chatForm;
      const leadId = raw === "team" ? null : raw;
      const text = String(new FormData(form).get("text") || "").trim();
      if (!text) return;
      postMessage(user, leadId, text);
      render();
    });
  });

  const lead = db.leads.find((l) => l.id === route.id);
  const frame = $("#preview-frame");
  if (frame && lead) frame.srcdoc = previewDoc(lead);

  const ta = $("#html-paste");
  if (ta && lead) {
    ta.addEventListener("input", () => {
      lead.html = ta.value;
      persist();
      if (frame) frame.srcdoc = previewDoc(lead);
    });
  }

  $("[data-save-html]")?.addEventListener("click", () => {
    if (!lead) return;
    if (ta) lead.html = ta.value;
    lead.updatedAt = now();
    persist();
    toast("HTML saved on this device", "ok");
  });

  $("[data-publish]")?.addEventListener("click", () => {
    if (!lead) return;
    publishLead(lead, user);
  });

  $$("[data-img-kind]").forEach((input) => {
    input.addEventListener("change", async () => {
      const kind = input.dataset.imgKind;
      const files = [...(input.files || [])];
      input.value = "";
      if (!lead || !files.length) return;
      try {
        for (const file of files) {
          await addLeadImage(lead, file, kind);
          if (!persist()) {
            lead.images.pop();
            toast("Storage is full. Photo not saved.", "bad");
            break;
          }
        }
        render();
      } catch (err) {
        toast(err.message || "Could not add image", "bad");
      }
    });
  });

  $$("[data-del-img]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!lead) return;
      lead.images = (lead.images || []).filter((im) => im.id !== btn.dataset.delImg);
      const photos = lead.images.filter((im) => im.kind === "photo");
      photos.forEach((im, i) => {
        const ext = (im.filename || "").split(".").pop() || "jpg";
        im.filename = `photo-${i + 1}.${ext}`;
      });
      persist();
      render();
    });
  });

  $$("[data-lightbox]").forEach((img) => {
    img.addEventListener("click", () => {
      const wrap = document.createElement("div");
      wrap.className = "lightbox";
      wrap.innerHTML = `<img src="${img.src}" alt=""/>`;
      wrap.addEventListener("click", () => wrap.remove());
      document.body.appendChild(wrap);
    });
  });

  $$("[data-toggle-user]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const u = db.users.find((x) => x.id === btn.dataset.toggleUser);
      if (!u || u.id === user.id) {
        toast("You cannot deactivate yourself.", "warn");
        return;
      }
      u.active = u.active === false;
      persist();
      render();
    });
  });

  $("#token-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const token = String(fd.get("token") || "").trim();
    const owner = String(fd.get("owner") || "").trim();
    const repo = String(fd.get("repo") || "").trim();
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (owner) localStorage.setItem(OWNER_KEY, owner);
    else localStorage.removeItem(OWNER_KEY);
    if (repo) localStorage.setItem(REPO_KEY, repo);
    else localStorage.removeItem(REPO_KEY);
    toast("Settings saved on this device", "ok");
    render();
  });

  $("#clear-token")?.addEventListener("click", () => {
    localStorage.removeItem(TOKEN_KEY);
    toast("Token cleared from this device", "ok");
    render();
  });

  $("#publish-queued")?.addEventListener("click", () => publishQueuedAll(user));
}

function modal(html, wide) {
  const wrap = document.createElement("div");
  wrap.className = "modal-back";
  wrap.innerHTML = `<div class="card modal${wide ? " wide" : ""}">${html}</div>`;
  wrap.addEventListener("click", (e) => { if (e.target === wrap) wrap.remove(); });
  document.body.appendChild(wrap);
  return wrap;
}

function openNewLead(user) {
  const wrap = modal(`
    <h3 class="display">New lead</h3>
    <form id="new-lead">
      <label class="field"><span>Business name</span><input name="businessName" required/></label>
      <label class="field"><span>Phone</span><input name="phone"/></label>
      <label class="field"><span>Email</span><input name="email" type="email"/></label>
      <label class="field"><span>Address</span><input name="address"/></label>
      <label class="field"><span>Notes</span><textarea name="notes"></textarea></label>
      ${user.role === "admin" ? `<label class="field"><span>Assign caller</span>
        <select name="caller"><option value="">Later</option>${callers().map((u) => `<option value="${u.id}">${esc(u.name)}</option>`).join("")}</select>
      </label>` : ""}
      <div class="row">
        <button class="btn primary" type="submit">Add</button>
        <button class="btn ghost" type="button" data-close>Cancel</button>
      </div>
    </form>`);
  $("[data-close]", wrap).addEventListener("click", () => wrap.remove());
  $("#new-lead", wrap).addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const lead = makeLead({
      businessName: fd.get("businessName"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      address: fd.get("address"),
      notes: fd.get("notes"),
    });
    if (user.role === "caller") {
      lead.assignedCallerId = user.id;
      lead.status = "assigned_caller";
    } else {
      const c = fd.get("caller");
      if (c) {
        lead.assignedCallerId = c;
        lead.status = "assigned_caller";
      }
    }
    db.leads.unshift(lead);
    db.history.unshift({ id: uid(), leadId: lead.id, from: "", to: lead.status, by: user.id, note: "Created", at: now() });
    persist();
    wrap.remove();
    go("/lead/" + lead.id);
  });
}

function openNewUser() {
  const wrap = modal(`
    <h3 class="display">New person</h3>
    <form id="new-user">
      <label class="field"><span>Name</span><input name="name" required/></label>
      <label class="field"><span>Email</span><input name="email" type="email" required/></label>
      <label class="field"><span>Password</span><input name="password" required/></label>
      <label class="field"><span>Role</span>
        <select name="role">
          <option value="caller">Caller</option>
          <option value="builder">Builder</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <div class="row">
        <button class="btn primary" type="submit">Create</button>
        <button class="btn ghost" type="button" data-close>Cancel</button>
      </div>
    </form>`);
  $("[data-close]", wrap).addEventListener("click", () => wrap.remove());
  $("#new-user", wrap).addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = String(fd.get("email")).trim().toLowerCase();
    if (db.users.some((u) => u.email === email)) {
      toast("That email already exists.", "bad");
      return;
    }
    db.users.push({
      id: uid(),
      name: fd.get("name"),
      email,
      password: fd.get("password"),
      role: fd.get("role"),
      active: true,
    });
    persist();
    wrap.remove();
    render();
  });
}

function openImport(user) {
  const wrap = modal(`
    <h3 class="display">Import leads</h3>
    <p class="help">CSV header (may start with #): Name, Address, Phone, Rating, Business Type, Hours, Website. Or one business name per line.</p>
    <form id="import-form">
      <label class="field"><span>CSV or list</span>
        <textarea name="text" class="code" placeholder="# Name, Address, Phone, Rating, Business Type, Hours, Website"></textarea>
      </label>
      <label class="field"><span>Or upload file</span>
        <input type="file" id="csv-file" accept=".csv,text/csv,text/plain"/>
      </label>
      <label class="field"><span>Assign all to caller (optional)</span>
        <select name="caller">
          <option value="">Unassigned</option>
          ${callers().map((u) => `<option value="${u.id}">${esc(u.name)}</option>`).join("")}
        </select>
      </label>
      <div class="row">
        <button class="btn primary" type="submit">Import</button>
        <button class="btn ghost" type="button" data-close>Cancel</button>
      </div>
    </form>`, true);
  $("[data-close]", wrap).addEventListener("click", () => wrap.remove());
  $("#csv-file", wrap).addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    $("textarea[name=text]", wrap).value = text;
  });
  $("#import-form", wrap).addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const text = String(fd.get("text") || "");
    const callerId = fd.get("caller") || null;
    const { added, skipped } = importLeads(text, callerId, user);
    wrap.remove();
    toast(`Added ${added} lead(s)` + (skipped ? `, skipped ${skipped} duplicate(s)` : ""), added ? "ok" : "warn");
    render();
  });
}

render();
