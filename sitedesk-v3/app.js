const KEY = "sitedesk.v3";
const TOKEN_KEY = "sitedesk.githubToken";
const OWNER_KEY = "sitedesk.githubOwner";
const REPO_KEY = "sitedesk.githubRepo";
const ZAI = "https://chat.z.ai";
const PUBLIC_ORIGIN = "https://viewyoursite.today";
const DEFAULT_OWNER = "Merci-Chi";
const DEFAULT_REPO = "viewyoursite";
const MAX_IMG = 1600;
const MAX_EXTRA_PHOTOS = 8;
const LEADS_CSV_URLS = [
  "https://raw.githubusercontent.com/Merci-Chi/viewyoursite/main/leads.csv",
  "https://raw.githubusercontent.com/Merci-Chi/viewyoursite/main/lead2.csv",
];
const LEADS_CSV_PATHS = ["leads.csv", "lead2.csv"];

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

const BOARD_COLS = [
  { id: "new", label: "New", statuses: ["new", "assigned_caller"] },
  { id: "calling", label: "Calling", statuses: ["contacted", "brief_ready"] },
  { id: "building", label: "Building", statuses: ["assigned_builder", "building"] },
  { id: "review", label: "Review", statuses: ["review"] },
  { id: "done", label: "Done", statuses: ["done"] },
];
const CALL_OUTCOMES = ["Interested", "Call Back", "Needs More Info", "No Answer", "Not Interested", "Wrong Number"];

const SKIP_DIRS = new Set([
  "assets", "images", "img", "css", "js", "fonts", "static", "dist", "src",
  "vendor", "node_modules", "docs", "dashboard", "site", "scripts", "style",
  "styles", "media", "public", "files", "data", "github",
]);

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const uid = () => crypto.randomUUID();
const now = () => Date.now();
const fmt = (ts) => new Date(ts).toLocaleString();
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[c]));

function fmtShort(ts) {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function toast(msg, kind = "") {
  const wrap = $("#toasts");
  if (!wrap) return;
  const el = document.createElement("div");
  el.className = "toast " + kind;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 5200);
}

function emptyBrief() {
  return {
    businessName: "", contact: "", whatTheySell: "", pagesWanted: "",
    brandColors: "", exampleSites: "", extraNotes: "", ready: false,
  };
}

function emptyChecklist() {
  return { copiedBrief: false, openedZai: false, pastedHtml: false, published: false };
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
    contactName: "",
    siteAge: "",
    mainIssue: "",
    concerns: "",
    foundOn: "",
    tags: [],
    callOutcome: "",
    status: "new",
    assignedCallerId: null,
    assignedBuilderId: null,
    siteUrl: "",
    slug: "",
    html: "",
    pages: {},
    publishQueued: false,
    publishError: "",
    publishedAt: null,
    images: [],
    brief: emptyBrief(),
    pinned: false,
    priority: "normal",
    archived: false,
    checklist: emptyChecklist(),
    createdAt: now(),
    updatedAt: now(),
    ...partial,
  };
}

function hydrateLead(lead) {
  if (!lead.images) lead.images = [];
  if (lead.html == null) lead.html = "";
  if (!lead.pages) lead.pages = {};
  if (lead.publishQueued == null) lead.publishQueued = false;
  if (!lead.brief) lead.brief = emptyBrief();
  if (!lead.checklist) lead.checklist = emptyChecklist();
  if (lead.pinned == null) lead.pinned = false;
  if (!lead.priority) lead.priority = "normal";
  if (lead.archived == null) lead.archived = false;
  if (lead.contactName == null) lead.contactName = "";
  if (lead.siteAge == null) lead.siteAge = "";
  if (lead.mainIssue == null) lead.mainIssue = "";
  if (lead.concerns == null) lead.concerns = "";
  if (lead.foundOn == null) lead.foundOn = "";
  if (!Array.isArray(lead.tags)) lead.tags = [];
  if (lead.callOutcome == null) lead.callOutcome = "";
  for (const im of lead.images) {
    if (!im.label) im.label = im.kind === "logo" ? "Logo" : im.kind === "storefront" ? "Storefront" : "Photo";
    if (!im.filename && im.name) im.filename = kebabCase(im.label) + "." + extFor(im.mime);
  }
  return lead;
}

function load() {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data.messages)) data.messages = [];
      if (!Array.isArray(data.threads)) data.threads = [];
      if (!Array.isArray(data.activity)) data.activity = [];
      if (!data.reads) data.reads = {};
      for (const lead of data.leads || []) hydrateLead(lead);
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
    contactName: "Marcus",
    phone: "555-0101",
    email: "gold@example.com",
    address: "412 W Main St",
    businessType: "Smoke shop",
    foundOn: "leads.csv",
    callOutcome: "Call Back",
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
  const job = {
    id: uid(),
    type: "job",
    userIds: [caller.id, builder.id, admin.id],
    leadId: l2.id,
    title: "Sam Caller ↔ Bee Builder · AJ Landscaping",
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
    threads: [job],
    messages: [
      { id: uid(), threadId: job.id, fromId: caller.id, text: "Logo is coming from the owner tomorrow.", at: t - 86400000 },
    ],
    reads: {},
    activity: [
      { id: uid(), kind: "status", leadId: l1.id, by: caller.id, text: "Gold Rush Smoke Shop → Contacted", at: t - 86400000 * 2 },
      { id: uid(), kind: "chat", leadId: l2.id, by: caller.id, text: "Sam Caller in AJ Landscaping: Logo is coming from the owner tomorrow.", at: t - 86400000 },
    ],
    session: null,
  };
}

let db = load();
let route = parseHash();
let busy = false;
let previewFile = "index.html";
let previewLeadId = null;

function currentUser() {
  return db.users.find((u) => u.id === db.session) || null;
}
function userById(id) {
  return db.users.find((u) => u.id === id);
}
function nameOf(id) {
  return userById(id)?.name || "—";
}
function activeUsers() {
  return db.users.filter((u) => u.active !== false);
}
function callers() {
  return activeUsers().filter((u) => u.role === "caller");
}
function builders() {
  return activeUsers().filter((u) => u.role === "builder");
}
function admins() {
  return activeUsers().filter((u) => u.role === "admin");
}
function activeAdmins() {
  return db.users.filter((u) => u.role === "admin" && u.active !== false);
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

function logActivity(kind, text, extra = {}) {
  db.activity = db.activity || [];
  db.activity.unshift({
    id: uid(),
    kind,
    text,
    by: extra.by || db.session,
    leadId: extra.leadId || null,
    threadId: extra.threadId || null,
    at: now(),
  });
  if (db.activity.length > 100) db.activity = db.activity.slice(0, 100);
}

function setStatus(lead, to, note) {
  const from = lead.status;
  lead.status = to;
  lead.updatedAt = now();
  db.history.unshift({ id: uid(), leadId: lead.id, from, to, by: db.session, note: note || "", at: now() });
  logActivity("status", `${lead.businessName} → ${STATUS_LABEL[to] || to}`, { leadId: lead.id });
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
function canEditLead(lead, user) {
  if (!user || !lead) return false;
  if (user.role === "admin") return true;
  if (user.role === "caller") return lead.assignedCallerId === user.id;
  return false;
}
function bucketOf(status) {
  return BOARD_COLS.find((c) => c.statuses.includes(status)) || BOARD_COLS[0];
}
function websiteHref(url) {
  const u = String(url || "").trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return "https://" + u;
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

function fromSlug(s) {
  return String(s || "")
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim() || s;
}

function kebabCase(s) {
  const k = String(s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return k || "image";
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
    return `GitHub denied access (403). The token needs the classic repo scope on ${owner}/${repo}.`;
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

function uniqueFilename(lead, base, ext, exceptId) {
  const used = new Set(
    (lead.images || [])
      .filter((im) => im.id !== exceptId && im.filename)
      .map((im) => im.filename.toLowerCase())
  );
  let name = `${base}.${ext}`;
  if (!used.has(name.toLowerCase())) return name;
  let n = 2;
  while (used.has(`${base}-${n}.${ext}`.toLowerCase())) n++;
  return `${base}-${n}.${ext}`;
}

function renameImage(lead, imageId, label) {
  const im = (lead.images || []).find((x) => x.id === imageId);
  if (!im) return;
  im.label = String(label || "").trim() || im.kind || "photo";
  im.filename = uniqueFilename(lead, kebabCase(im.label), extFor(im.mime), im.id);
}

function pagesOf(lead) {
  if (lead.pages && Object.keys(lead.pages).length) return { ...lead.pages };
  if ((lead.html || "").trim()) return { "index.html": lead.html };
  return {};
}

function leadHasHtml(lead) {
  return Object.values(pagesOf(lead)).some((p) => String(p || "").trim());
}

function parsePages(text) {
  const src = String(text || "").replace(/^\uFEFF/, "").trim();
  if (!src) return {};
  const re = /=====\s*FILE:\s*([^\n=]+?)\s*=====/gi;
  const matches = [...src.matchAll(re)];
  if (!matches.length) return { "index.html": src };
  const pages = {};
  for (let i = 0; i < matches.length; i++) {
    let name = matches[i][1].trim().replace(/^\/+/, "").split(/[/\\]/).pop();
    if (!name || name.includes("..") || !/^[\w.-]+$/.test(name)) continue;
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : src.length;
    let body = src.slice(start, end).trim();
    body = body.replace(/^```[\w-]*\s*/i, "").replace(/\s*```$/i, "").trim();
    pages[name] = body;
  }
  return Object.keys(pages).length ? pages : { "index.html": src };
}

function serializePages(pages) {
  const keys = Object.keys(pages || {});
  if (!keys.length) return "";
  if (keys.length === 1 && keys[0] === "index.html") return pages["index.html"] || "";
  return keys.map((k) => `===== FILE: ${k} =====\n${pages[k] || ""}`).join("\n\n");
}

function applyPaste(lead, text) {
  lead.pages = parsePages(text);
  lead.html = lead.pages["index.html"] || Object.values(lead.pages)[0] || "";
  if (leadHasHtml(lead)) {
    lead.checklist = lead.checklist || emptyChecklist();
    lead.checklist.pastedHtml = true;
  }
  lead.updatedAt = now();
}

function htmlUsesAnyImage(html, images) {
  const blob = String(html || "");
  return (images || []).some((im) => im.filename && blob.includes(im.filename));
}

function injectGalleryIfNeeded(html, images, usedNone) {
  const files = (images || []).filter((im) => im.filename && im.dataUrl);
  if (!usedNone || !files.length) return html || "";
  let out = html || "";
  const gallery = [
    `<section class="sitedesk-gallery" aria-label="Business photos">`,
    ...files.map((f) => `  <img src="${esc(f.filename)}" alt="${esc(f.label || f.kind || "photo")}">`),
    `</section>`,
  ].join("\n");
  if (/<\/body>/i.test(out)) out = out.replace(/<\/body>/i, `${gallery}\n</body>`);
  else out += `\n${gallery}\n`;
  return out;
}

function rewriteImages(html, images) {
  let out = html || "";
  for (const im of images || []) {
    if (!im.filename || !im.dataUrl) continue;
    const f = im.filename;
    const d = im.dataUrl;
    out = out.split(`src="${f}"`).join(`src="${d}"`);
    out = out.split(`src='${f}'`).join(`src="${d}"`);
    out = out.split(`src="./${f}"`).join(`src="${d}"`);
    out = out.split(`src='./${f}'`).join(`src="${d}"`);
  }
  return out;
}

function previewDoc(lead, pageName) {
  const pages = pagesOf(lead);
  const combined = Object.values(pages).join("\n");
  const anyUsed = htmlUsesAnyImage(combined, lead.images);
  const name = pageName && pages[pageName] ? pageName : (pages["index.html"] ? "index.html" : Object.keys(pages)[0]);
  let html = (name && pages[name]) || lead.html || "";
  if (!name || name === "index.html") html = injectGalleryIfNeeded(html, lead.images, !anyUsed);
  return rewriteImages(html, lead.images);
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
  const pages = pagesOf(lead);
  if (!Object.keys(pages).length) pages["index.html"] = lead.html || "";
  const combined = Object.values(pages).join("\n");
  const anyUsed = htmlUsesAnyImage(combined, lead.images);
  for (const [filename, html] of Object.entries(pages)) {
    const body = filename === "index.html"
      ? injectGalleryIfNeeded(html, lead.images, !anyUsed)
      : (html || "");
    await putContent({
      token,
      path: `${slug}/${filename}`,
      contentB64: utf8ToB64(body),
      message: `Add ${slug}/${filename} from SiteDesk`,
    });
  }
}

function markPublished(lead, user) {
  lead.publishQueued = false;
  lead.publishError = "";
  lead.siteUrl = publicUrl(lead.slug);
  lead.publishedAt = now();
  lead.updatedAt = now();
  lead.checklist = lead.checklist || emptyChecklist();
  lead.checklist.published = true;
  lead.checklist.pastedHtml = true;
  logActivity("publish", `Published ${lead.businessName} → ${lead.siteUrl}`, { leadId: lead.id });
  if (lead.status === "building" || lead.status === "assigned_builder") {
    setStatus(lead, "review", "Published to GitHub Pages");
  } else if (user?.role === "admin" && lead.status === "review") {
    /* stay in review so caller can sign off */
  }
}

async function publishLead(lead, user) {
  const ta = $("#html-paste");
  if (ta) applyPaste(lead, ta.value);
  persist();
  if (!leadHasHtml(lead)) {
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
  const queued = db.leads.filter((l) => l.publishQueued && leadHasHtml(l) && !l.archived);
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

function labelFromFile(file) {
  const stem = String(file.name || "photo").replace(/\.[^.]+$/, "");
  const cleaned = stem.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned || "Photo";
}

async function addLeadImage(lead, file, kind) {
  const packed = await compressImage(file);
  const biz = lead.brief?.businessName || lead.businessName || "";
  let label;
  if (kind === "logo") label = biz ? `${biz} logo` : "Logo";
  else if (kind === "storefront") label = biz ? `${biz} storefront` : "Storefront";
  else label = labelFromFile(file);
  lead.images = lead.images || [];
  if (kind === "logo" || kind === "storefront") {
    lead.images = lead.images.filter((im) => im.kind !== kind);
  } else if (lead.images.filter((im) => im.kind === "photo").length >= MAX_EXTRA_PHOTOS) {
    throw new Error(`Max ${MAX_EXTRA_PHOTOS} extra photos`);
  }
  const id = uid();
  const filename = uniqueFilename(lead, kebabCase(label), extFor(packed.mime), id);
  lead.images.push({
    id,
    kind,
    label,
    filename,
    mime: packed.mime,
    dataUrl: packed.dataUrl,
  });
  lead.updatedAt = now();
}


function parseCsv(text) {
  const src = String(text).replace(/^\uFEFF/, "");
  const firstLine = (src.split(/\r?\n/).find((l) => l.trim()) || "");
  const tabs = (firstLine.match(/\t/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  const delim = tabs > commas ? "\t" : ",";
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];
    if (inQuotes) {
      if (c === '"' && n === '"') { cur += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === delim) { row.push(cur); cur = ""; }
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
      if (h === "#" || h === "") return;
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
    if (String(r[0]).trim().startsWith("#") && hasHeader === false) continue;
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
    if (!name || /^\d+$/.test(name) || name.toLowerCase() === "name") continue;
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

function pickStr(obj, keys) {
  for (const k of keys) {
    if (obj[k] != null && String(obj[k]).trim()) return String(obj[k]).trim();
  }
  return "";
}

function normalizeImported(raw) {
  const o = raw || {};
  const hasCompanyKey = o.companyName || o.company || o.businessName || o.Company || o.Name;
  const businessName = pickStr(o, ["businessName", "companyName", "company", "Company", "Name", "name"]);
  let contactName = pickStr(o, ["contactName", "contact", "Contact Name", "Name"]);
  if (hasCompanyKey && o.name && o.companyName) contactName = String(o.name).trim();
  if (hasCompanyKey && o.Name && (o.companyName || o.company)) contactName = String(o.Name).trim();
  return {
    businessName,
    contactName: contactName === businessName ? pickStr(o, ["contactName", "contact"]) : contactName,
    phone: pickStr(o, ["phone", "phoneNumber", "Phone"]),
    email: pickStr(o, ["email", "Email"]),
    website: pickStr(o, ["website", "Website"]),
    siteAge: pickStr(o, ["siteAge", "site_age", "Site Age"]),
    mainIssue: pickStr(o, ["mainIssue", "main_issue", "Main Issue", "issue"]),
    concerns: pickStr(o, ["concerns", "objections", "Concerns"]),
    notes: pickStr(o, ["notes", "Notes"]),
    foundOn: pickStr(o, ["foundOn", "source", "Found On"]),
    address: pickStr(o, ["address", "Address"]),
    hours: pickStr(o, ["hours", "Hours"]),
    businessType: pickStr(o, ["businessType", "type", "Business Type"]),
    rating: pickStr(o, ["rating", "Rating"]),
  };
}

function parseJsonLeads(text) {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : (data.leads || data.data || []);
  if (!Array.isArray(arr)) throw new Error("JSON must be an array of leads, or { leads: [] }.");
  return arr.map(normalizeImported);
}

function parseAnyLeads(text) {
  const t = String(text || "").trim();
  if (!t) return [];
  if (t.startsWith("[") || t.startsWith("{")) return parseJsonLeads(t);
  return parseImport(t).map((row) => normalizeImported(row));
}

function ingestItems(items, assignCallerId, user, note) {
  const existing = new Set(db.leads.map((l) => leadKey(l.businessName, l.phone)));
  let added = 0;
  let skipped = 0;
  for (const raw of items) {
    const item = normalizeImported(raw);
    if (!item.businessName) item.businessName = item.contactName || item.phone || "";
    const k = leadKey(item.businessName, item.phone);
    if ((item.businessName || item.phone) && existing.has(k)) { skipped++; continue; }
    if (item.businessName || item.phone) existing.add(k);
    const lead = makeLead({
      ...item,
      assignedCallerId: assignCallerId || null,
      status: assignCallerId ? "assigned_caller" : "new",
    });
    if (!lead.businessName) lead.businessName = "Untitled lead";
    db.leads.unshift(lead);
    db.history.unshift({
      id: uid(), leadId: lead.id, from: "", to: lead.status, by: user.id, note: note || "Bulk import", at: now(),
    });
    added++;
  }
  if (added) logActivity("import", `Imported ${added} lead(s)` + (skipped ? `, skipped ${skipped}` : ""));
  persist();
  return { added, skipped };
}

function importLeads(text, assignCallerId, user) {
  return ingestItems(parseAnyLeads(text), assignCallerId, user);
}

function deleteLead(lead, user) {
  db.leads = db.leads.filter((l) => l.id !== lead.id);
  db.notes = db.notes.filter((n) => n.leadId !== lead.id);
  db.history = db.history.filter((h) => h.leadId !== lead.id);
  const gone = (db.threads || []).filter((t) => t.type === "job" && t.leadId === lead.id).map((t) => t.id);
  db.threads = (db.threads || []).filter((t) => !gone.includes(t.id));
  db.messages = (db.messages || []).filter((m) => !gone.includes(m.threadId));
  logActivity("status", `Deleted ${lead.businessName || "lead"}`, { by: user.id });
  persist();
}

async function fetchGithubFileText(path, token) {
  const { owner, repo } = githubRepo();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = { ...githubHeaders(token), Accept: "application/vnd.github.raw+json" };
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(githubMessage(res.status, await res.text()));
  return res.text();
}

async function fetchViewyoursiteCsvs() {
  const texts = [];
  for (const url of LEADS_CSV_URLS) {
    try {
      const res = await fetch(url);
      if (res.ok) texts.push(await res.text());
    } catch { /* try next / fallback */ }
  }
  if (texts.length) return texts;
  const token = getToken();
  if (!token) {
    throw new Error("Could not fetch leads.csv. Add a GitHub token in Settings and try again.");
  }
  for (const path of LEADS_CSV_PATHS) {
    try {
      texts.push(await fetchGithubFileText(path, token));
    } catch { /* optional file */ }
  }
  if (!texts.length) throw new Error("Could not read leads.csv or lead2.csv from GitHub.");
  return texts;
}

async function importFromViewyoursite(assignCallerId, user) {
  busy = true;
  render();
  try {
    const texts = await fetchViewyoursiteCsvs();
    let added = 0;
    let skipped = 0;
    for (const text of texts) {
      const r = importLeads(text, assignCallerId, user);
      added += r.added;
      skipped += r.skipped;
    }
    toast(`Added ${added} lead(s) from viewyoursite` + (skipped ? `, skipped ${skipped} duplicate(s)` : ""), added ? "ok" : "warn");
  } catch (err) {
    toast(err.message || String(err), "bad");
  } finally {
    busy = false;
    render();
  }
}

function skipClientDir(name) {
  const n = String(name || "").toLowerCase();
  if (!n || n.startsWith(".")) return true;
  if (n.startsWith("sitedesk")) return true;
  return SKIP_DIRS.has(n);
}

async function listClientIndexFolders(token) {
  const { owner, repo } = githubRepo();
  const headers = githubHeaders(token);
  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`, { headers });
  if (!treeRes.ok) throw new Error(githubMessage(treeRes.status, await treeRes.text()));
  const data = await treeRes.json();
  if (!data.truncated) {
    return [...new Set((data.tree || [])
      .filter((t) => t.type === "blob" && /^[^/]+\/index\.html$/i.test(t.path))
      .map((t) => t.path.split("/")[0]))]
      .filter((n) => !skipClientDir(n));
  }
  const root = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/`, { headers });
  if (!root.ok) throw new Error(githubMessage(root.status, await root.text()));
  const items = await root.json();
  const dirs = (Array.isArray(items) ? items : []).filter((x) => x.type === "dir" && !skipClientDir(x.name));
  const found = [];
  for (const dir of dirs) {
    const check = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(dir.name)}/index.html`, { headers });
    if (check.ok || check.status === 200) found.push(dir.name);
  }
  return found;
}

async function importLiveSites(user) {
  const token = getToken();
  if (!token) {
    toast("Add a GitHub token in Settings first.", "bad");
    return;
  }
  busy = true;
  render();
  try {
    const folders = await listClientIndexFolders(token);
    const existingSlugs = new Set(db.leads.map((l) => (l.slug || "").toLowerCase()).filter(Boolean));
    const existingNames = new Set(db.leads.map((l) => (l.businessName || "").trim().toLowerCase()));
    let added = 0;
    let skipped = 0;
    for (const folder of folders) {
      const name = fromSlug(folder);
      if (existingSlugs.has(folder.toLowerCase()) || existingNames.has(name.toLowerCase())) {
        skipped++;
        continue;
      }
      const lead = makeLead({
        businessName: name,
        slug: folder,
        siteUrl: publicUrl(folder),
        status: "done",
        publishedAt: now(),
        checklist: { copiedBrief: false, openedZai: false, pastedHtml: true, published: true },
      });
      db.leads.unshift(lead);
      db.history.unshift({
        id: uid(), leadId: lead.id, from: "", to: "done", by: user.id, note: "Imported live site", at: now(),
      });
      existingSlugs.add(folder.toLowerCase());
      existingNames.add(name.toLowerCase());
      added++;
    }
    logActivity("import", `Imported ${added} live site(s) from GitHub` + (skipped ? ` · skipped ${skipped}` : ""));
    persist();
    toast(`Added ${added} live site(s)` + (skipped ? `, skipped ${skipped}` : ""), added ? "ok" : "warn");
  } catch (err) {
    toast(err.message || String(err), "bad");
  } finally {
    busy = false;
    render();
  }
}

function ensureJobThread(lead) {
  if (!lead?.assignedCallerId || !lead?.assignedBuilderId) return null;
  const adminIds = activeAdmins().map((u) => u.id);
  const userIds = [...new Set([lead.assignedCallerId, lead.assignedBuilderId, ...adminIds])];
  const title = `${nameOf(lead.assignedCallerId)} ↔ ${nameOf(lead.assignedBuilderId)} · ${lead.businessName}`;
  let t = (db.threads || []).find((th) => th.type === "job" && th.leadId === lead.id);
  if (t) {
    t.userIds = userIds;
    t.title = title;
    return t;
  }
  t = { id: uid(), type: "job", userIds, leadId: lead.id, title };
  db.threads.push(t);
  logActivity("pair", `Connected pair on ${lead.businessName}`, { leadId: lead.id, threadId: t.id });
  return t;
}

function syncJobThreadAdmins() {
  for (const lead of db.leads) {
    if (lead.assignedCallerId && lead.assignedBuilderId) ensureJobThread(lead);
  }
}

function findDm(a, b) {
  const k = [a, b].sort().join("|");
  return (db.threads || []).find((t) => {
    if (t.type !== "dm" || !t.userIds || t.userIds.length !== 2) return false;
    return [...t.userIds].sort().join("|") === k;
  });
}

function connectPeople(a, b) {
  if (!a || !b || a === b) {
    toast("Pick two different people.", "warn");
    return null;
  }
  let t = findDm(a, b);
  if (t) return t;
  t = { id: uid(), type: "dm", userIds: [a, b], title: `${nameOf(a)} · ${nameOf(b)}` };
  db.threads.push(t);
  logActivity("pair", `Connected ${nameOf(a)} and ${nameOf(b)}`, { threadId: t.id });
  persist();
  return t;
}

function canSeeThread(thread, user) {
  if (!user || !thread) return false;
  if (user.role === "admin") return true;
  return (thread.userIds || []).includes(user.id);
}

function visibleThreads(user) {
  return (db.threads || []).filter((t) => canSeeThread(t, user));
}

function lastMessage(threadId) {
  return db.messages.filter((m) => m.threadId === threadId).sort((a, b) => b.at - a.at)[0];
}

function threadTitle(thread, user) {
  if (thread.type === "job") return thread.title || "Job";
  const other = (thread.userIds || []).find((id) => id !== user.id);
  if (other) return nameOf(other);
  return (thread.userIds || []).map(nameOf).join(" & ") || thread.title || "Chat";
}

function unreadThread(user, threadId) {
  const last = db.reads[user.id]?.threads?.[threadId] || 0;
  return db.messages.filter((m) => m.threadId === threadId && m.at > last && m.fromId !== user.id).length;
}

function unreadTotal(user) {
  return visibleThreads(user).reduce((n, t) => n + unreadThread(user, t.id), 0);
}

function markThreadRead(user, threadId) {
  if (!db.reads[user.id]) db.reads[user.id] = { threads: {} };
  if (!db.reads[user.id].threads) db.reads[user.id].threads = {};
  db.reads[user.id].threads[threadId] = now();
  persist();
}

function postMessage(user, threadId, text) {
  const t = String(text || "").trim();
  if (!t) return;
  db.messages.push({ id: uid(), threadId, fromId: user.id, text: t, at: now() });
  const thread = db.threads.find((x) => x.id === threadId);
  const label = thread ? threadTitle(thread, user) : "Messages";
  logActivity("chat", `${user.name} in ${label}: ${t.slice(0, 80)}`, { threadId, leadId: thread?.leadId || null });
  persist();
}

function visibleLeads(user, opts = {}) {
  const archived = !!opts.archived;
  return db.leads
    .filter((l) => canSee(l, user) && !!l.archived === archived)
    .sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
      if ((a.priority === "high") !== (b.priority === "high")) return a.priority === "high" ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
}

function duplicateLead(lead, user) {
  const copy = makeLead({
    businessName: (lead.businessName || "Lead") + " (copy)",
    phone: lead.phone,
    email: lead.email,
    address: lead.address,
    rating: lead.rating,
    businessType: lead.businessType,
    hours: lead.hours,
    website: lead.website,
    notes: lead.notes,
    contactName: lead.contactName,
    siteAge: lead.siteAge,
    mainIssue: lead.mainIssue,
    concerns: lead.concerns,
    foundOn: lead.foundOn,
    tags: [...(lead.tags || [])],
    callOutcome: "",
    status: "new",
    assignedCallerId: user.role === "caller" ? user.id : null,
    brief: { ...(lead.brief || emptyBrief()), ready: false },
    images: (lead.images || []).map((im) => ({ ...im, id: uid() })),
  });
  if (user.role === "caller") copy.status = "assigned_caller";
  db.leads.unshift(copy);
  db.history.unshift({ id: uid(), leadId: copy.id, from: "", to: copy.status, by: user.id, note: "Duplicated", at: now() });
  logActivity("status", `Duplicated ${lead.businessName}`, { leadId: copy.id });
  persist();
  return copy;
}

function archiveLead(lead, on) {
  lead.archived = !!on;
  lead.updatedAt = now();
  logActivity("status", `${on ? "Archived" : "Restored"} ${lead.businessName}`, { leadId: lead.id });
  persist();
}

function canDeleteUser(target, actor) {
  if (!target || !actor) return false;
  if (target.id === actor.id) return false;
  if (target.role === "admin" && activeAdmins().filter((u) => u.id !== target.id).length < 1) return false;
  return true;
}

function canDeactivateUser(target, actor) {
  if (!target || !actor) return false;
  if (target.id === actor.id) return false;
  if (target.role === "admin" && target.active !== false && activeAdmins().length <= 1) return false;
  return true;
}

function zaiInstructions(lead) {
  const b = lead?.brief || emptyBrief();
  const images = (lead.images || []).filter((im) => im.filename);
  const notes = db.notes.filter((n) => n.leadId === lead.id).map((n) => "- " + n.text).join("\n") || "(none)";
  const extraPages = String(b.pagesWanted || "").trim();
  const imgBlock = images.length
    ? images.map((im) => (
      `FILENAME: ${im.filename}\nUSE FOR: ${im.label || im.kind}\nEXAMPLE: <img src="${im.filename}" alt="${im.label || im.kind}">`
    )).join("\n\n")
    : "No photos were provided. Do not use any photographic <img>. If a section needs a visual, use a tasteful CSS/typography block — never a fake photo.";

  return `You are building a REAL multi-page local business website, NOT a one-page stub.

You work for a production desk. Follow every rule. Do not improvise marketing fiction.

REQUIRED PAGES — output each as a SEPARATE file:
- index.html — full homepage: hero, about teaser, services, gallery, hours, map/contact, footer
- about.html
- services.html
- gallery.html
- contact.html
${extraPages ? `Also add any extra pages listed here: ${extraPages}` : "If the brief lists more pages, add those too."}

OUTPUT FORMAT (mandatory). Do not wrap files in markdown code fences. Do not output a single combined document. Use these banners and raw HTML only:

===== FILE: index.html =====
(full html document)

===== FILE: about.html =====
(full html document)

===== FILE: services.html =====
(full html document)

===== FILE: gallery.html =====
(full html document)

===== FILE: contact.html =====
(full html document)

SHARED NAV
Every page has the same nav. Links are relative files sitting in the same folder: about.html, services.html, gallery.html, contact.html, index.html. Never use /about or /about.html as a root path.

HARD IMAGE RULES
The only images allowed are these files, which will sit in the SAME folder as the HTML after publish. Use relative src exactly equal to the filename, e.g. <img src="gold-rush-storefront.jpg" alt="Storefront">.

Do NOT generate, invent, draw, placeholder, unsplash, pexels, lorem, picsum, SVG fake photos, CSS dummy faces, or AI images. Do not use images from the internet.

If a section needs a photo and we did not provide one, use a tasteful CSS/typography block, not a fake photo.

IMAGES WE HAVE:
${imgBlock}

BUSINESS FACTS — use these. Do not invent awards, fake reviews, fake team members, fake prices, or extra locations.

Business name: ${b.businessName || lead.businessName}
Contact name: ${lead.contactName || b.contact || ""}
Contact: ${b.contact || `${lead.phone || ""} ${lead.email || ""}`.trim()}
Phone: ${lead.phone || ""}
Email: ${lead.email || ""}
Address: ${lead.address || ""}
Hours: ${lead.hours || ""}
Type: ${lead.businessType || ""}
Existing website: ${lead.website || "none"}
Site age: ${lead.siteAge || ""}
Main issue: ${lead.mainIssue || ""}
Concerns / objections: ${lead.concerns || ""}
Found on: ${lead.foundOn || ""}
Last call outcome: ${lead.callOutcome || ""}
Rating (optional, do not invent reviews): ${lead.rating || ""}

What they sell:
${b.whatTheySell || "(see type)"}

Pages wanted:
${b.pagesWanted || "Home, About, Services, Gallery, Contact"}

Brand / colors:
${b.brandColors || "(choose a distinctive palette that fits the business — not generic purple AI template)"}

Example sites:
${b.exampleSites || "(none)"}

Extra notes (constraints):
${b.extraNotes || "(none)"}

Call notes (constraints):
${notes}

Accessible, mobile-first, distinctive. Shared footer with real phone, address, and hours on every page.
Public URL after publish: ${PUBLIC_ORIGIN}/{Slug}/  where Slug is PascalCase of the business name.
`;
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
  const n = unreadTotal(user);
  const msg = `Messages${n ? ` <span class="badge">${n}</span>` : ""}`;
  if (user.role === "admin") {
    return [
      ["/board", "Board"],
      ["/leads", "Leads"],
      ["/archive", "Archive"],
      ["/messages", msg],
      ["/users", "Team"],
      ["/settings", "Settings"],
    ];
  }
  if (user.role === "caller") {
    return [
      ["/board", "My leads"],
      ["/leads", "All mine"],
      ["/archive", "Archive"],
      ["/messages", msg],
    ];
  }
  return [
    ["/jobs", "My jobs"],
    ["/messages", msg],
  ];
}

function shell(user, inner) {
  const items = navItems(user)
    .map(([href, label]) => `<a href="#${href}" class="${route.name === href.slice(1) ? "active" : ""}">${label}</a>`)
    .join("");
  const mainClass = route.name === "messages" ? "main msg-main" : "main";
  return `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand"><b>SiteDesk</b><span class="muted">v3 · ${esc(user.role)}</span></div>
        <nav class="nav">${items}</nav>
        <div class="side-foot">
          <div class="who">${esc(user.name)}<div class="muted">${esc(user.email)}</div></div>
          <button class="btn ghost tiny" id="logout">Log out</button>
        </div>
      </aside>
      <main class="${mainClass}">${inner}</main>
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
  if (route.name === "messages") return messagesPage(user);
  if (route.name === "lead" && route.id) return leadPage(user, route.id);
  if (route.name === "leads") return leadsPage(user);
  if (route.name === "archive") return archivePage(user);
  if (route.name === "jobs") return jobsPage(user);
  return boardPage(user);
}


function boardPage(user) {
  const leads = visibleLeads(user);
  const queued = user.role === "admin" ? db.leads.filter((l) => l.publishQueued && !l.archived).length : 0;
  const feed = (db.activity || []).slice(0, 20);
  const cols = BOARD_COLS.map((col) => ({
    ...col,
    items: leads.filter((l) => col.statuses.includes(l.status)),
  }));
  return `
    <div class="top">
      <div>
        <h1 class="display">${user.role === "admin" ? "Lead board" : "My leads"}</h1>
        <p class="muted">Scan the pipeline. Click a card for the full lead.</p>
      </div>
      ${user.role !== "builder" ? `<button class="btn primary" data-open-new>Add new lead</button>` : ""}
    </div>
    ${queued ? `<div class="banner">${queued} site(s) queued — add a GitHub token in Settings, then publish them.</div>` : ""}
    <div class="board">
      ${cols.map((col) => `
        <section class="col">
          <header class="col-h">
            <span>${esc(col.label)}</span>
            <span class="pill">${col.items.length}</span>
          </header>
          ${col.items.map((l) => `
            <button type="button" class="kanban-card" data-open-lead="${l.id}">
              <b>${esc(l.businessName || "Untitled lead")}</b>
              <div class="muted">${esc(l.contactName || "No contact name")}</div>
              <div class="muted">${esc(l.phone || "")}${l.callOutcome ? " · " + esc(l.callOutcome) : ""}</div>
              <div class="lead-flags" style="margin-top:8px">
                ${l.pinned ? `<span class="pill hot">Pinned</span>` : ""}
                ${l.priority === "high" ? `<span class="pill warn">High</span>` : ""}
                ${l.siteUrl ? `<span class="pill ok">Live</span>` : ""}
                ${l.publishQueued ? `<span class="pill warn">Queued</span>` : ""}
              </div>
            </button>`).join("") || `<p class="empty" style="padding:12px">None</p>`}
        </section>`).join("")}
    </div>
    <div class="card" style="margin-top:16px">
      <h3 class="display">Activity</h3>
      ${feed.length ? `<ul class="activity">${feed.map((a) => `
        <li>
          <div>${esc(a.text)}</div>
          <div class="when muted">${esc(nameOf(a.by))} · ${fmtShort(a.at)}</div>
        </li>`).join("")}</ul>` : `<p class="muted">No activity yet.</p>`}
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
        ${user.role === "admin" ? `<button class="btn" data-open-import>Import</button>` : ""}
        ${user.role !== "builder" ? `<button class="btn primary" data-open-new>New lead</button>` : ""}
      </div>
    </div>
    <div class="card" id="lead-table-wrap">${leadTable(leads, user, "No leads yet.")}</div>`;
}

function archivePage(user) {
  const leads = visibleLeads(user, { archived: true });
  return `
    <div class="top">
      <div>
        <h1 class="display">Archive</h1>
        <p class="muted">Soft-deleted leads. Restore them anytime.</p>
      </div>
    </div>
    <div class="card">${leadTable(leads, user, "Archive is empty.", true)}</div>`;
}

function jobsPage(user) {
  const jobs = visibleLeads(user);
  return `
    <div class="top">
      <div>
        <h1 class="display">Build jobs</h1>
        <p class="muted">Copy instructions, build in z.ai (new tab), paste HTML, preview, publish.</p>
      </div>
    </div>
    <div class="card">${leadTable(jobs, user, "No jobs assigned yet.")}</div>`;
}

function leadTable(leads, user, empty, archivedView) {
  if (!leads.length) return `<div class="empty">${empty}</div>`;
  return `
    <table class="table">
      <thead><tr><th>Business</th><th>Status</th><th>Caller</th><th>Builder</th><th>Updated</th></tr></thead>
      <tbody>
        ${leads.map((l) => {
          const job = (db.threads || []).find((t) => t.type === "job" && t.leadId === l.id);
          const unread = job ? unreadThread(user, job.id) : 0;
          return `
          <tr class="clickable" data-open-lead="${l.id}">
            <td>
              ${unread ? `<span class="dot" title="Unread messages"></span>` : ""}
              ${l.pinned ? `<span class="pill hot">Pinned</span> ` : ""}
              <b>${esc(l.businessName)}</b>
              <div class="muted">${esc(l.phone)}${l.address ? " · " + esc(l.address) : ""}</div>
            </td>
            <td>
              <span class="pill ${pillClass(l.status)}">${STATUS_LABEL[l.status] || l.status}</span>
              ${l.priority === "high" ? `<span class="pill warn">High</span>` : ""}
              ${l.publishQueued ? `<span class="pill warn">Queued</span>` : ""}
              ${l.siteUrl ? `<span class="pill ok">Live</span>` : ""}
            </td>
            <td>${esc(nameOf(l.assignedCallerId))}</td>
            <td>${esc(nameOf(l.assignedBuilderId))}</td>
            <td class="muted">${fmtShort(l.updatedAt)}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>`;
}

function leadField(lead, key, label, canEdit, kind) {
  const val = key === "tags" ? (lead.tags || []).join(", ") : (lead[key] || "");
  if (!canEdit) {
    return `<p><span class="muted">${label}</span><br>${esc(val) || "—"}</p>`;
  }
  if (kind === "textarea") {
    return `<label class="field"><span>${label}</span><textarea data-lead-field="${key}">${esc(val)}</textarea></label>`;
  }
  return `<label class="field"><span>${label}</span><input data-lead-field="${key}" value="${esc(val)}"/></label>`;
}

function leadPage(user, id) {
  const lead = db.leads.find((l) => l.id === id);
  if (!lead || !canSee(lead, user)) return `<p>Lead not found.</p>`;
  if (previewLeadId !== lead.id) {
    previewFile = "index.html";
    previewLeadId = lead.id;
  }
  const notes = db.notes.filter((n) => n.leadId === lead.id).sort((a, b) => b.createdAt - a.createdAt);
  const hist = db.history.filter((h) => h.leadId === lead.id);
  const b = lead.brief || emptyBrief();
  const showBuilder = canBuild(user);
  const edit = canEditLead(lead, user);
  const tel = String(lead.phone || "").replace(/[^\d+]/g, "");
  const web = websiteHref(lead.website);
  const job = (db.threads || []).find((t) => t.type === "job" && t.leadId === lead.id);
  const canUpload = edit;
  const prompt = zaiInstructions(lead);
  const company = lead.businessName || "Untitled lead";
  const contact = lead.contactName || "No contact name";
  return `
    <div class="top">
      <div>
        <p class="muted"><a href="#/${lead.archived ? "archive" : (user.role === "builder" ? "jobs" : "board")}">Back to board</a></p>
        <h1 class="display" id="lead-company-title">${esc(company)}</h1>
        <p class="contact-line" id="lead-contact-title">${esc(contact)}</p>
        <p class="lead-flags">
          <span class="pill ${pillClass(lead.status)}">${esc(bucketOf(lead.status).label)} · ${STATUS_LABEL[lead.status] || lead.status}</span>
          ${lead.pinned ? `<span class="pill hot">Pinned</span>` : ""}
          ${lead.priority === "high" ? `<span class="pill warn">High</span>` : ""}
          ${lead.archived ? `<span class="pill">Archived</span>` : ""}
          ${lead.callOutcome ? `<span class="pill warn">${esc(lead.callOutcome)}</span>` : `<span class="pill">Not called yet</span>`}
          ${lead.publishQueued ? `<span class="pill warn">Publish queued</span>` : ""}
        </p>
        <div class="callbar">
          ${tel ? `<a class="btn tiny" href="tel:${esc(tel)}">Call ${esc(lead.phone)}</a>` : `<span class="btn tiny" style="opacity:.5">No phone</span>`}
          ${lead.email ? `<a class="btn tiny" href="mailto:${esc(lead.email)}">${esc(lead.email)}</a>` : ""}
          ${web ? `<a class="btn tiny" href="${esc(web)}" target="_blank" rel="noopener">Website</a>` : ""}
        </div>
      </div>
      <div class="row">
        ${edit ? `
          <button class="btn tiny" data-toggle-pin>${lead.pinned ? "Unpin" : "Pin"}</button>
          <button class="btn tiny" data-toggle-priority>${lead.priority === "high" ? "Clear priority" : "High priority"}</button>
          <button class="btn tiny" data-duplicate>Duplicate</button>
          <button class="btn tiny" data-toggle-archive>${lead.archived ? "Restore" : "Archive"}</button>
        ` : ""}
        ${user.role === "admin" ? `<button class="btn tiny danger" data-delete-lead>Delete lead</button>` : ""}
        ${actionsFor(lead, user)}
      </div>
    </div>
    ${lead.publishQueued && !getToken() ? `<div class="banner">Admin must add a GitHub token in Settings to go live. HTML is saved on this device.</div>` : ""}
    ${lead.publishError ? `<div class="banner bad">${esc(lead.publishError)}</div>` : ""}
    <div class="split">
      <div>
        <div class="card">
          <h3 class="display">Lead information</h3>
          <p class="muted">Click a field and tab away to save. Blank is allowed.</p>
          ${leadField(lead, "businessName", "Company name", edit)}
          ${leadField(lead, "contactName", "Contact name", edit)}
          ${leadField(lead, "phone", "Phone", edit)}
          ${leadField(lead, "email", "Email", edit)}
          ${leadField(lead, "address", "Address", edit)}
          ${leadField(lead, "website", "Website", edit)}
          ${leadField(lead, "hours", "Hours", edit)}
          ${leadField(lead, "businessType", "Business type", edit)}
          ${leadField(lead, "siteAge", "Site age", edit)}
          ${leadField(lead, "mainIssue", "Main issue", edit, "textarea")}
          ${leadField(lead, "concerns", "Concerns / objections", edit, "textarea")}
          ${leadField(lead, "foundOn", "Found on (source)", edit)}
          ${leadField(lead, "tags", "Tags (comma separated)", edit)}
        </div>
        <div class="card" style="margin-top:12px">
          <h3 class="display">Last call outcome</h3>
          <p class="muted">The most recent result from this lead.</p>
          <div class="chips">
            ${CALL_OUTCOMES.map((o) => `
              <button type="button" class="chip ${lead.callOutcome === o ? "on" : ""}" data-outcome="${esc(o)}" ${edit ? "" : "disabled"}>${esc(o)}</button>`).join("")}
          </div>
        </div>
        <div class="card" style="margin-top:12px">
          <h3 class="display">Pair</h3>
          ${user.role === "admin" ? assignForm(lead) : `<p class="muted">Caller ${esc(nameOf(lead.assignedCallerId))} · Builder ${esc(nameOf(lead.assignedBuilderId))}</p>`}
          ${job ? `<p style="margin-top:10px"><a class="btn tiny" href="#/messages/${job.id}">Open job thread</a></p>` : ""}
        </div>
        <div class="card" style="margin-top:12px">
          <h3 class="display">Photos</h3>
          <p class="muted">Rename the label after upload. The filename under each thumb is what z.ai will be told. Bytes are never sent to z.ai.</p>
          ${canUpload ? `<div class="row" style="margin-bottom:10px">
            <label class="btn tiny">Logo<input type="file" accept="image/*" hidden data-img-kind="logo"/></label>
            <label class="btn tiny">Storefront<input type="file" accept="image/*" hidden data-img-kind="storefront"/></label>
            <label class="btn tiny">Extra photos<input type="file" accept="image/*" multiple hidden data-img-kind="photo"/></label>
          </div>` : ""}
          ${photoGrid(lead, canUpload)}
        </div>
        <div class="card" style="margin-top:12px">
          <h3 class="display">Brief</h3>
          ${user.role === "builder" ? briefRead(b) : briefForm(b)}
          <div class="row" style="margin-top:8px">
            <button class="btn" data-copy-brief type="button">Copy instructions for z.ai</button>
            <a class="btn primary" href="${ZAI}" target="_blank" rel="noopener" data-open-zai>Open z.ai</a>
          </div>
          <p class="help" style="margin-top:8px">z.ai does not embed (X-Frame-Options). Read the prompt, copy it, build in a tab, then paste FILE blocks on the right.</p>
          <pre class="prompt-box">${esc(prompt)}</pre>
        </div>
        <div class="card" style="margin-top:12px">
          <h3 class="display">Call log</h3>
          <form id="note-form">
            <textarea name="text" placeholder="What happened on the call?" required></textarea>
            <div class="row" style="margin-top:8px"><button class="btn primary" type="submit">Add note</button></div>
          </form>
          <div class="notes" style="margin-top:12px">
            ${notes.map((n) => `<div class="note"><b>${esc(nameOf(n.authorId))}</b> <span class="muted">${fmt(n.createdAt)}</span><div>${esc(n.text)}</div></div>`).join("") || `<p class="muted">No notes yet.</p>`}
          </div>
        </div>
      </div>
      <div>
        ${showBuilder ? builderWorkspace(lead) : callerPreview(lead)}
        ${showBuilder ? checklistCard(lead) : ""}
        <div class="card" style="margin-top:12px">
          <h3 class="display">Live site</h3>
          ${lead.siteUrl
            ? `<a class="live-link" href="${esc(lead.siteUrl)}" target="_blank" rel="noopener">${esc(lead.siteUrl)}</a>
               <p class="muted">No login required to view.</p>`
            : `<p class="muted">Not published yet. ${lead.publishQueued ? "Queued for admin." : "Builder pastes HTML and hits Save / Publish."}</p>`}
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

function checklistCard(lead) {
  const c = lead.checklist || emptyChecklist();
  const row = (key, label) => `
    <label class="${c[key] ? "on" : ""}">
      <input type="checkbox" data-check="${key}" ${c[key] ? "checked" : ""}/>
      ${label}
    </label>`;
  return `
    <div class="card" style="margin-top:12px">
      <h3 class="display">Builder checklist</h3>
      <div class="checklist">
        ${row("copiedBrief", "Copied instructions for z.ai")}
        ${row("openedZai", "Opened z.ai")}
        ${row("pastedHtml", "Pasted HTML")}
        ${row("published", "Published")}
      </div>
    </div>`;
}

function photoGrid(lead, canEdit) {
  const imgs = lead.images || [];
  if (!imgs.length) return `<p class="muted">No photos yet.</p>`;
  return `<div class="photos">${imgs.map((im) => `
    <div class="photo-card">
      <div class="photo">
        <img src="${im.dataUrl}" alt="${esc(im.label || im.kind)}" data-lightbox="${im.id}"/>
        <span class="cap">${esc(im.kind)}</span>
        ${canEdit ? `<button type="button" class="x" data-del-img="${im.id}" aria-label="Remove">×</button>` : ""}
      </div>
      <div class="meta">
        ${canEdit
          ? `<label class="field tight"><span>Label</span>
              <input data-img-label="${im.id}" value="${esc(im.label || "")}"/></label>`
          : `<div>${esc(im.label || im.kind)}</div>`}
      </div>
      <div class="fn" title="Filename z.ai will be told">${esc(im.filename || "")}</div>
    </div>`).join("")}</div>`;
}

function builderWorkspace(lead) {
  const pages = pagesOf(lead);
  const files = Object.keys(pages);
  const paste = serializePages(pages);
  const current = files.includes(previewFile) ? previewFile : (files[0] || "index.html");
  return `
    <div class="card">
      <h3 class="display">Builder workspace</h3>
      <p class="muted">Paste z.ai output. Multi-file uses ===== FILE: name ===== banners. Preview is local (srcdoc); image filenames rewrite to data URLs. Save / Publish writes a public folder on GitHub Pages.</p>
      <label class="field"><span>HTML / FILE blocks</span>
        <textarea class="code" id="html-paste" spellcheck="false" placeholder="===== FILE: index.html =====">${esc(paste)}</textarea>
      </label>
      <div class="row" style="margin-bottom:12px">
        <button class="btn" type="button" data-save-html>Save draft</button>
        <button class="btn primary" type="button" data-publish ${busy ? "disabled" : ""}>${busy ? "Publishing…" : "Save / Publish"}</button>
      </div>
      ${files.length > 1 ? `<div class="page-tabs">${files.map((f) => `
        <button type="button" data-preview-page="${esc(f)}" class="${f === current ? "on" : ""}">${esc(f)}</button>`).join("")}</div>` : ""}
      <p class="muted" style="margin:0 0 8px">Live preview</p>
      <div class="preview-wrap">
        <iframe id="preview-frame" title="Preview" sandbox="allow-scripts allow-forms allow-modals"></iframe>
      </div>
    </div>`;
}

function callerPreview(lead) {
  if (!leadHasHtml(lead)) {
    return `<div class="card"><h3 class="display">Site preview</h3><p class="muted">Builder has not pasted HTML yet.</p></div>`;
  }
  const pages = pagesOf(lead);
  const files = Object.keys(pages);
  const current = files.includes(previewFile) ? previewFile : (files[0] || "index.html");
  return `
    <div class="card">
      <h3 class="display">Site preview</h3>
      ${files.length > 1 ? `<div class="page-tabs">${files.map((f) => `
        <button type="button" data-preview-page="${esc(f)}" class="${f === current ? "on" : ""}">${esc(f)}</button>`).join("")}</div>` : ""}
      <div class="preview-wrap">
        <iframe id="preview-frame" title="Preview" sandbox="allow-scripts allow-forms allow-modals"></iframe>
      </div>
    </div>`;
}

function assignForm(lead) {
  return `
    <form id="assign-form" class="pair-box">
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
      <div class="row">
        <button class="btn" type="submit">Save assignment</button>
        <button class="btn primary" type="button" data-connect-pair>Connect this pair</button>
      </div>
      <p class="help">Connect this pair assigns both and opens their private job thread in Messages.</p>
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
  return bits.join("") || "";
}

function messagesPage(user) {
  const threads = visibleThreads(user).sort((a, b) => {
    const am = lastMessage(a.id)?.at || 0;
    const bm = lastMessage(b.id)?.at || 0;
    return bm - am;
  });
  const current = threads.find((t) => t.id === route.id) || null;
  if (current) markThreadRead(user, current.id);
  const mobileClass = current ? "thread-only" : "list-only";
  const people = activeUsers();
  const msgs = current
    ? db.messages.filter((m) => m.threadId === current.id).sort((a, b) => a.at - b.at)
    : [];
  const lastRead = current ? (db.reads[user.id]?.threads?.[current.id] || 0) : 0;

  const list = threads.length
    ? threads.map((t) => {
      const last = lastMessage(t.id);
      const unread = unreadThread(user, t.id);
      return `
        <a class="thread-item ${current?.id === t.id ? "active" : ""} ${unread ? "unread" : ""}" href="#/messages/${t.id}">
          <b>${esc(threadTitle(t, user))}${unread ? `<span class="unread-dot"></span>` : ""}</b>
          <span class="when">${last ? fmtShort(last.at) : ""}</span>
          <span class="preview">${last ? esc(last.text) : "No messages yet"}</span>
        </a>`;
    }).join("")
    : `<div class="empty">${user.role === "admin" ? "Connect two people to start a thread" : "No conversations yet. Admin will connect you with a teammate."}</div>`;

  let pane;
  if (!current) {
    pane = `<div class="msg-empty"><div><b>Messages</b>${user.role === "admin" ? "Connect two people to start a thread." : "Pick a conversation, or wait for admin to connect you."}</div></div>`;
  } else {
    pane = `
      <div class="thread-head">
        <a class="btn tiny ghost" href="#/messages">←</a>
        <div>
          <h2 class="display">${esc(threadTitle(current, user))}</h2>
          <div class="muted" style="font-size:.8rem">${current.type === "job" ? "Job thread" : "Private"} · ${(current.userIds || []).map(nameOf).map(esc).join(", ")}</div>
        </div>
      </div>
      <div class="msg-log" id="msg-log">
        ${msgs.map((m) => `
          <div class="bubble ${m.fromId === user.id ? "me" : ""} ${m.at > lastRead && m.fromId !== user.id ? "unread" : ""}">
            <div class="meta">${esc(nameOf(m.fromId))} · ${fmtShort(m.at)}</div>
            <div>${esc(m.text)}</div>
          </div>`).join("") || `<p class="muted">No messages yet.</p>`}
      </div>
      <form class="compose-bar" id="compose-form">
        <textarea name="text" rows="1" placeholder="Message…" required></textarea>
        <button class="btn primary" type="submit">Send</button>
      </form>`;
  }

  return `
    <div class="top">
      <div>
        <h1 class="display">Messages</h1>
        <p class="muted">Private threads only. There is no shared inbox.</p>
      </div>
    </div>
    ${user.role === "admin" ? `
      <div class="card connect-bar">
        <form id="connect-form">
          <select name="a">
            <option value="">Person</option>
            ${people.map((u) => `<option value="${u.id}">${esc(u.name)} · ${esc(u.role)}</option>`).join("")}
          </select>
          <span class="muted">and</span>
          <select name="b">
            <option value="">Person</option>
            ${people.map((u) => `<option value="${u.id}">${esc(u.name)} · ${esc(u.role)}</option>`).join("")}
          </select>
          <button class="btn primary" type="submit">Connect</button>
        </form>
        <p class="help" style="margin:8px 0 0">Creates a private 1:1 thread only those two can see. Admins can always open any thread.</p>
      </div>` : ""}
    <div class="messenger ${mobileClass}">
      <div class="thread-list">${list}</div>
      <div class="thread-pane">${pane}</div>
    </div>`;
}

function usersPage() {
  const nAdmin = db.users.filter((u) => u.role === "admin").length;
  const nCaller = db.users.filter((u) => u.role === "caller").length;
  const nBuilder = db.users.filter((u) => u.role === "builder").length;
  const rows = db.users.map((u) => `
    <tr>
      <td><b>${esc(u.name)}</b></td>
      <td class="muted">${esc(u.email)}</td>
      <td><span class="pill">${esc(u.role)}</span></td>
      <td>${u.active === false ? `<span class="pill bad">Inactive</span>` : `<span class="pill ok">Active</span>`}</td>
      <td>
        <div class="team-actions">
          <button class="btn tiny" data-edit-user="${u.id}">Edit</button>
          <button class="btn tiny" data-toggle-user="${u.id}">${u.active === false ? "Activate" : "Deactivate"}</button>
          <button class="btn tiny danger" data-delete-user="${u.id}">Delete</button>
        </div>
      </td>
    </tr>`).join("");
  return `
    <div class="top">
      <div>
        <h1 class="display">Team</h1>
        <p class="muted">People who can sign in. Connect two of them under Messages — there is no shared inbox.</p>
      </div>
      <button class="btn primary" data-open-user>New person</button>
    </div>
    <div class="team-legend">
      <span class="pill">${nAdmin} admin</span>
      <span class="pill">${nCaller} caller</span>
      <span class="pill">${nBuilder} builder</span>
    </div>
    <div class="card">
      <table class="table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="help" style="margin-top:12px">Edit name, email, role, or password. You cannot delete yourself or the last remaining admin. Deactivated people cannot sign in.</p>`;
}

function settingsPage() {
  const token = getToken();
  const { owner, repo } = githubRepo();
  const queued = db.leads.filter((l) => l.publishQueued && !l.archived);
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
          <input name="token" type="password" autocomplete="off" placeholder="${token ? "Token saved on this device — paste to replace" : "ghp_…"}"/>
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

function bindPage(user) {
  $$("[data-open-lead]").forEach((el) => {
    el.addEventListener("click", () => go("/lead/" + el.dataset.openLead));
  });
  $("[data-open-new]")?.addEventListener("click", () => openAddLead(user, "single"));
  $("[data-open-import]")?.addEventListener("click", () => openAddLead(user, "import"));
  $("[data-open-user]")?.addEventListener("click", () => openNewUser());

  $("#lead-search")?.addEventListener("input", (e) => {
    const q = String(e.target.value || "").trim().toLowerCase();
    const leads = visibleLeads(user).filter((l) => {
      if (!q) return true;
      return [l.businessName, l.contactName, l.phone, l.email, l.address, l.businessType, l.foundOn]
        .join(" ").toLowerCase().includes(q);
    });
    const wrap = $("#lead-table-wrap");
    if (!wrap) return;
    wrap.innerHTML = leadTable(leads, user, "No matches.");
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
      if (lead.assignedCallerId && lead.assignedBuilderId) ensureJobThread(lead);
      persist();
      render();
    });
  });

  $("[data-copy-brief]")?.addEventListener("click", async () => {
    const lead = db.leads.find((l) => l.id === route.id);
    const text = zaiInstructions(lead);
    try {
      await navigator.clipboard.writeText(text);
      $("[data-copy-brief]").textContent = "Copied";
      lead.checklist = lead.checklist || emptyChecklist();
      lead.checklist.copiedBrief = true;
      persist();
      toast("Instructions copied. Open z.ai in a tab.", "ok");
    } catch {
      prompt("Copy these instructions", text);
    }
  });

  $("[data-open-zai]")?.addEventListener("click", () => {
    const lead = db.leads.find((l) => l.id === route.id);
    if (!lead) return;
    lead.checklist = lead.checklist || emptyChecklist();
    lead.checklist.openedZai = true;
    persist();
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
    lead.assignedCallerId = callerId || null;
    lead.assignedBuilderId = builderId || null;
    if (callerId && lead.status === "new") setStatus(lead, "assigned_caller", "Assigned caller");
    if (callerId && builderId) ensureJobThread(lead);
    persist();
    render();
  });

  $("[data-connect-pair]")?.addEventListener("click", () => {
    const form = $("#assign-form");
    const lead = db.leads.find((l) => l.id === route.id);
    if (!form || !lead) return;
    const fd = new FormData(form);
    const callerId = fd.get("caller") || null;
    const builderId = fd.get("builder") || null;
    if (!callerId || !builderId) {
      toast("Pick a caller and a builder.", "warn");
      return;
    }
    lead.assignedCallerId = callerId;
    lead.assignedBuilderId = builderId;
    if (lead.status === "new") setStatus(lead, "assigned_caller", "Assigned caller");
    const thread = ensureJobThread(lead);
    persist();
    toast("Pair connected.", "ok");
    go("/messages/" + thread.id);
  });

  $$("[data-lead-field]").forEach((el) => {
    el.addEventListener("change", () => {
      const lead = db.leads.find((l) => l.id === route.id);
      if (!lead || !canEditLead(lead, user)) return;
      const key = el.dataset.leadField;
      const val = el.value;
      if (key === "tags") lead.tags = String(val).split(",").map((x) => x.trim()).filter(Boolean);
      else lead[key] = val;
      lead.updatedAt = now();
      persist();
      if (key === "businessName") {
        const h = $("#lead-company-title");
        if (h) h.textContent = val.trim() || "Untitled lead";
      }
      if (key === "contactName") {
        const t = $("#lead-contact-title");
        if (t) t.textContent = val.trim() || "No contact name";
      }
    });
  });

  $$("[data-outcome]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lead = db.leads.find((l) => l.id === route.id);
      if (!lead || !canEditLead(lead, user)) return;
      lead.callOutcome = btn.dataset.outcome;
      lead.updatedAt = now();
      logActivity("status", `${lead.businessName}: ${lead.callOutcome}`, { leadId: lead.id });
      persist();
      render();
    });
  });

  $("[data-toggle-pin]")?.addEventListener("click", () => {
    const lead = db.leads.find((l) => l.id === route.id);
    if (!lead || !canEditLead(lead, user)) return;
    lead.pinned = !lead.pinned;
    persist();
    render();
  });
  $("[data-toggle-priority]")?.addEventListener("click", () => {
    const lead = db.leads.find((l) => l.id === route.id);
    if (!lead || !canEditLead(lead, user)) return;
    lead.priority = lead.priority === "high" ? "normal" : "high";
    persist();
    render();
  });
  $("[data-duplicate]")?.addEventListener("click", () => {
    const lead = db.leads.find((l) => l.id === route.id);
    if (!lead) return;
    const copy = duplicateLead(lead, user);
    go("/lead/" + copy.id);
  });
  $("[data-toggle-archive]")?.addEventListener("click", () => {
    const lead = db.leads.find((l) => l.id === route.id);
    if (!lead || !canEditLead(lead, user)) return;
    archiveLead(lead, !lead.archived);
    render();
  });
  $("[data-delete-lead]")?.addEventListener("click", () => {
    const lead = db.leads.find((l) => l.id === route.id);
    if (!lead || user.role !== "admin") return;
    if (!confirm(`Delete ${lead.businessName || "this lead"}? This cannot be undone.`)) return;
    deleteLead(lead, user);
    toast("Lead deleted", "ok");
    go("/board");
  });

  $$("[data-check]").forEach((box) => {
    box.addEventListener("change", () => {
      const lead = db.leads.find((l) => l.id === route.id);
      if (!lead) return;
      lead.checklist = lead.checklist || emptyChecklist();
      lead.checklist[box.dataset.check] = box.checked;
      persist();
      render();
    });
  });

  const lead = db.leads.find((l) => l.id === route.id);
  const frame = $("#preview-frame");
  if (frame && lead) frame.srcdoc = previewDoc(lead, previewFile);

  $$("[data-preview-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!lead) return;
      previewFile = btn.dataset.previewPage;
      previewLeadId = lead.id;
      $$("[data-preview-page]").forEach((b) => b.classList.toggle("on", b === btn));
      if (frame) frame.srcdoc = previewDoc(lead, previewFile);
    });
  });

  const ta = $("#html-paste");
  if (ta && lead) {
    ta.addEventListener("input", () => {
      applyPaste(lead, ta.value);
      persist();
      if (frame) frame.srcdoc = previewDoc(lead, previewFile);
    });
  }

  $("[data-save-html]")?.addEventListener("click", () => {
    if (!lead) return;
    if (ta) applyPaste(lead, ta.value);
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
      persist();
      render();
    });
  });

  $$("[data-img-label]").forEach((input) => {
    input.addEventListener("change", () => {
      if (!lead) return;
      renameImage(lead, input.dataset.imgLabel, input.value);
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
      if (!u || !canDeactivateUser(u, user)) {
        toast(u?.id === user.id ? "You cannot deactivate yourself." : "Cannot deactivate the last admin.", "warn");
        return;
      }
      u.active = u.active === false;
      if (u.active !== false) syncJobThreadAdmins();
      persist();
      render();
    });
  });

  $$("[data-edit-user]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const u = db.users.find((x) => x.id === btn.dataset.editUser);
      if (u) openEditUser(u, user);
    });
  });

  $$("[data-delete-user]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const u = db.users.find((x) => x.id === btn.dataset.deleteUser);
      if (!u || !canDeleteUser(u, user)) {
        toast(u?.id === user.id ? "You cannot delete yourself." : "Cannot delete the last remaining admin.", "warn");
        return;
      }
      if (!confirm(`Delete ${u.name}? They will no longer be able to sign in.`)) return;
      db.users = db.users.filter((x) => x.id !== u.id);
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

  $("#connect-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const a = fd.get("a");
    const b = fd.get("b");
    const t = connectPeople(a, b);
    if (t) go("/messages/" + t.id);
  });

  $("#compose-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!route.id) return;
    const thread = db.threads.find((t) => t.id === route.id);
    if (!thread || !canSeeThread(thread, user)) return;
    const text = String(new FormData(e.target).get("text") || "").trim();
    if (!text) return;
    postMessage(user, thread.id, text);
    render();
  });

  const log = $("#msg-log");
  if (log) log.scrollTop = log.scrollHeight;
}

function modal(html, wide) {
  const wrap = document.createElement("div");
  wrap.className = "modal-back";
  wrap.innerHTML = `<div class="card modal${wide ? " wide" : ""}">${html}</div>`;
  wrap.addEventListener("click", (e) => { if (e.target === wrap) wrap.remove(); });
  document.body.appendChild(wrap);
  return wrap;
}

function openAddLead(user, tab) {
  const start = tab === "import" ? "import" : "single";
  const wrap = modal(`
    <h3 class="display">Add leads</h3>
    <p class="help">Every field is optional. Blank fields stay empty.</p>
    <div class="tabs">
      <button type="button" class="btn tiny ${start === "single" ? "primary" : ""}" data-tab="single">Single lead</button>
      <button type="button" class="btn tiny ${start === "import" ? "primary" : ""}" data-tab="import">Import multiple</button>
    </div>
    <div class="tab-panel ${start === "single" ? "on" : ""}" data-panel="single">
      <form id="new-lead">
        <label class="field"><span>Company name</span><input name="businessName"/></label>
        <label class="field"><span>Phone</span><input name="phone"/></label>
        <label class="field"><span>Email</span><input name="email" type="email"/></label>
        <label class="field"><span>Contact name</span><input name="contactName"/></label>
        <label class="field"><span>Website</span><input name="website"/></label>
        <label class="field"><span>Site age</span><input name="siteAge"/></label>
        <label class="field"><span>Main issue</span><textarea name="mainIssue"></textarea></label>
        <label class="field"><span>Concerns / objections</span><textarea name="concerns"></textarea></label>
        <label class="field"><span>Notes</span><textarea name="notes"></textarea></label>
        <label class="field"><span>Found on (source)</span><input name="foundOn" placeholder="leads.csv, walk-in, referral…"/></label>
        ${user.role === "admin" ? `<label class="field"><span>Assign caller</span>
          <select name="caller"><option value="">Later</option>${callers().map((u) => `<option value="${u.id}">${esc(u.name)}</option>`).join("")}</select>
        </label>` : ""}
        <div class="row">
          <button class="btn primary" type="submit">Add lead</button>
          <button class="btn ghost" type="button" data-close>Cancel</button>
        </div>
      </form>
    </div>
    <div class="tab-panel ${start === "import" ? "on" : ""}" data-panel="import">
      ${user.role === "admin" ? `
      <div class="row" style="margin-bottom:12px">
        <button class="btn primary" type="button" id="fetch-csv">Import from viewyoursite leads.csv</button>
        <button class="btn" type="button" id="fetch-live">Import live sites from GitHub</button>
      </div>
      <p class="help">Fetches leads.csv + lead2.csv (Name, Address, Phone, Rating, Business Type, Hours, Website). Live sites become Done with a public URL. Dedupes by name + phone.</p>
      ` : ""}
      <form id="import-form">
        <label class="field"><span>Paste CSV or JSON</span>
          <textarea name="text" class="code" placeholder='# Name, Address, Phone, Rating, Business Type, Hours, Website
or [{"companyName":"…","phone":"…"}]'></textarea>
        </label>
        <label class="field"><span>Or upload file</span>
          <input type="file" id="csv-file" accept=".csv,.json,text/csv,text/plain,application/json"/>
        </label>
        ${user.role === "admin" ? `<label class="field"><span>Assign all to caller (optional)</span>
          <select name="caller">
            <option value="">Unassigned</option>
            ${callers().map((u) => `<option value="${u.id}">${esc(u.name)}</option>`).join("")}
          </select>
        </label>` : ""}
        <div class="row">
          <button class="btn primary" type="submit">Import leads</button>
          <button class="btn ghost" type="button" data-close>Cancel</button>
        </div>
      </form>
    </div>`, true);

  const showTab = (name) => {
    $$("[data-tab]", wrap).forEach((b) => b.classList.toggle("primary", b.dataset.tab === name));
    $$("[data-panel]", wrap).forEach((p) => p.classList.toggle("on", p.dataset.panel === name));
  };
  $$("[data-tab]", wrap).forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));
  $$("[data-close]", wrap).forEach((b) => b.addEventListener("click", () => wrap.remove()));

  $("#new-lead", wrap)?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const lead = makeLead({
      businessName: String(fd.get("businessName") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      contactName: String(fd.get("contactName") || "").trim(),
      website: String(fd.get("website") || "").trim(),
      siteAge: String(fd.get("siteAge") || "").trim(),
      mainIssue: String(fd.get("mainIssue") || "").trim(),
      concerns: String(fd.get("concerns") || "").trim(),
      notes: String(fd.get("notes") || "").trim(),
      foundOn: String(fd.get("foundOn") || "").trim(),
    });
    if (!lead.businessName) lead.businessName = lead.contactName || "Untitled lead";
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

  $("#csv-file", wrap)?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    $("textarea[name=text]", wrap).value = await file.text();
  });

  $("#import-form", wrap)?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const text = String(fd.get("text") || "");
    const callerId = user.role === "admin" ? (fd.get("caller") || null) : (user.role === "caller" ? user.id : null);
    try {
      const { added, skipped } = importLeads(text, callerId, user);
      wrap.remove();
      toast(`Added ${added} lead(s)` + (skipped ? `, skipped ${skipped} duplicate(s)` : ""), added ? "ok" : "warn");
      render();
    } catch (err) {
      toast(err.message || String(err), "bad");
    }
  });

  $("#fetch-csv", wrap)?.addEventListener("click", async () => {
    const callerId = $("select[name=caller]", wrap)?.value || null;
    wrap.remove();
    await importFromViewyoursite(callerId, user);
  });
  $("#fetch-live", wrap)?.addEventListener("click", async () => {
    wrap.remove();
    await importLiveSites(user);
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
    if (fd.get("role") === "admin") syncJobThreadAdmins();
    persist();
    wrap.remove();
    render();
  });
}

function openEditUser(target, actor) {
  const wrap = modal(`
    <h3 class="display">Edit ${esc(target.name)}</h3>
    <form id="edit-user">
      <label class="field"><span>Name</span><input name="name" value="${esc(target.name)}" required/></label>
      <label class="field"><span>Email</span><input name="email" type="email" value="${esc(target.email)}" required/></label>
      <label class="field"><span>Password</span><input name="password" placeholder="Leave blank to keep current"/></label>
      <label class="field"><span>Role</span>
        <select name="role">
          <option value="caller" ${target.role === "caller" ? "selected" : ""}>Caller</option>
          <option value="builder" ${target.role === "builder" ? "selected" : ""}>Builder</option>
          <option value="admin" ${target.role === "admin" ? "selected" : ""}>Admin</option>
        </select>
      </label>
      <div class="row">
        <button class="btn primary" type="submit">Save</button>
        <button class="btn ghost" type="button" data-close>Cancel</button>
      </div>
    </form>`);
  $("[data-close]", wrap).addEventListener("click", () => wrap.remove());
  $("#edit-user", wrap).addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = String(fd.get("email")).trim().toLowerCase();
    if (db.users.some((u) => u.email === email && u.id !== target.id)) {
      toast("That email already exists.", "bad");
      return;
    }
    const role = fd.get("role");
    if (target.role === "admin" && role !== "admin" && activeAdmins().filter((u) => u.id !== target.id).length < 1) {
      toast("Cannot demote the last remaining admin.", "warn");
      return;
    }
    target.name = fd.get("name");
    target.email = email;
    target.role = role;
    const pw = String(fd.get("password") || "");
    if (pw) target.password = pw;
    syncJobThreadAdmins();
    persist();
    wrap.remove();
    render();
  });
}

render();
