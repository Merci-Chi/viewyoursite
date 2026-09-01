const KEY = "sitedesk.v5";
const TOKEN_KEY = "sitedesk.githubToken";
const SESSION_KEY = "sitedesk.v5.session";
const NAV_PIN_KEY = "sitedesk.v5.navPinned";
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
  "sitedesk", "sitedesk-v2", "sitedesk-v3", "sitedesk-v4", "sitedesk-v5", "sitedesk-data",
]);

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

function navIcon(name) {
  const p = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  const paths = {
    board: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="12" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="12" width="7" height="7" rx="1.5"/><rect x="12" y="12" width="7" height="7" rx="1.5"/>',
    leads: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none"/>',
    archive: '<path d="M4 7h16l-1 12H5L4 7z"/><path d="M3 4h18v3H3z"/><path d="M10 11h4"/>',
    messages: '<path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M4 18c0-3 2.2-5 5-5s5 2 5 5"/><circle cx="16" cy="8" r="2.2"/><path d="M16 13c2.2.3 4 2 4 5"/>',
    settings: '<circle cx="11" cy="11" r="3"/><path d="M11 3.5v2M11 16.5v2M3.5 11h2M16.5 11h2M5.6 5.6l1.4 1.4M15 15l1.4 1.4M5.6 16.4l1.4-1.4M15 7l1.4-1.4"/>',
    jobs: '<rect x="4" y="7" width="14" height="12" rx="2"/><path d="M8 7V6a3 3 0 0 1 6 0v1"/>',
    menu: '<path d="M4 7h14M4 12h14M4 17h14"/>',
  };
  return `<svg ${p}>${paths[name] || paths.board}</svg>`;
}

function initialsOf(text) {
  const parts = String(text || "").trim().split(/\s+/).filter(Boolean);
  const a = (parts[0] || "?").charAt(0);
  const b = (parts[1] || "").charAt(0) || (parts[0] || "").charAt(1) || "";
  return (a + b).toUpperCase();
}

function phonePreviewHtml() {
  return `
    <div class="phone-preview">
      <div class="phone-frame">
        <div class="phone-island" aria-hidden="true"></div>
        <div class="phone-screen">
          <iframe id="preview-frame" title="Preview" sandbox="allow-scripts allow-forms allow-modals"></iframe>
        </div>
        <div class="phone-home" aria-hidden="true"></div>
      </div>
    </div>`;
}

function navPinned() {
  return localStorage.getItem(NAV_PIN_KEY) === "1";
}

function navLink(href, label, icon) {
  const active = route.name === href.slice(1);
  const plain = String(label).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return `<a href="#${href}" class="nav-item ${active ? "active" : ""}" title="${esc(plain)}">
      <span class="nav-ico">${navIcon(icon)}</span>
      <span class="nav-label">${label}</span>
    </a>`;
}

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
    whatTheySell: "", brandColors: "", exampleSites: "", extraNotes: "",
    siteShape: "", pages: [], ready: false,
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
    buildMode: "zai",
    diy: { pages: [] },
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
  lead.brief = hydrateBrief(lead.brief);
  if (!lead.checklist) lead.checklist = emptyChecklist();
  if (!lead.buildMode) lead.buildMode = "zai";
  if (!lead.diy || !Array.isArray(lead.diy.pages)) lead.diy = { pages: [] };
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
  if (!lead.contactSnap) lead.contactSnap = { phone: "", email: "", hours: "" };
  for (const im of lead.images) {
    if (!im.label) im.label = im.kind === "logo" ? "Logo" : im.kind === "storefront" ? "Storefront" : "Photo";
    if (!im.filename && im.name) im.filename = kebabCase(im.label) + "." + extFor(im.mime);
    if (im.pageId == null) im.pageId = "";
  }
  return lead;
}

function seed() {
  const admin = { id: uid(), name: "Admin", email: "admin@sitedesk.local", password: "admin123", role: "admin", active: true };
  const builder = { id: uid(), name: "Bee Builder", email: "builder@sitedesk.local", password: "builder123", role: "builder", active: true };
  const caller = { id: uid(), name: "Sam Caller", email: "caller@sitedesk.local", password: "caller123", role: "caller", active: true, defaultBuilderId: builder.id };
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
    whatTheySell: "Residential landscaping, xeriscape, weekly maintenance",
    brandColors: "Forest green, sand, off-white",
    exampleSites: "clean landscaper sites, not clipart",
    extraNotes: "Need Spanish toggle later",
    siteShape: "multi",
    pages: [
      { id: uid(), name: "Home", note: "Hero and how to reach them" },
      { id: uid(), name: "Services", note: "What they sell — no prices" },
      { id: uid(), name: "Quote", note: "Simple form" },
    ],
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
let diyPageId = null;
let selectedBlockId = null;

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
  return { name: parts[0] || "login", id: parts[1] || null, tab: parts[2] || null };
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

const DATA_PATH = "sitedesk-data/state.json";

function emptyDesk() {
  return {
    users: [], leads: [], notes: [], history: [], threads: [], messages: [],
    reads: {}, activity: [], session: null, rev: 0,
  };
}

function photoPath(leadId, filename) {
  return `sitedesk-data/photos/${leadId}/${filename}`;
}

function photoSrc(im, lead) {
  if (im?.dataUrl) return im.dataUrl;
  const t = im?.updatedAt || db.rev || Date.now();
  if (im?.path) return `${PUBLIC_ORIGIN}/${im.path}?v=${t}`;
  if (lead && im?.filename) return `${PUBLIC_ORIGIN}/${photoPath(lead.id, im.filename)}?v=${t}`;
  return "";
}

function stripLead(lead) {
  const copy = { ...lead };
  copy.images = (lead.images || []).map((im) => ({
    id: im.id,
    kind: im.kind,
    label: im.label,
    filename: im.filename,
    mime: im.mime,
    pageId: im.pageId || "",
    path: im.path || (im.filename ? photoPath(lead.id, im.filename) : ""),
  }));
  return copy;
}

function stripDesk(data) {
  return {
    rev: data.rev || now(),
    updatedAt: now(),
    users: (data.users || []).map((u) => ({
      id: u.id, name: u.name, email: u.email, password: u.password,
      role: u.role, active: u.active !== false, defaultBuilderId: u.defaultBuilderId || null,
    })),
    leads: (data.leads || []).map(stripLead),
    notes: data.notes || [],
    history: data.history || [],
    threads: data.threads || [],
    messages: data.messages || [],
    reads: data.reads || {},
    activity: data.activity || [],
  };
}

function applyDesk(remote) {
  const next = emptyDesk();
  next.rev = remote.rev || 0;
  next.users = remote.users || [];
  next.leads = (remote.leads || []).map(hydrateLead);
  next.notes = remote.notes || [];
  next.history = remote.history || [];
  next.threads = remote.threads || [];
  next.messages = remote.messages || [];
  next.reads = remote.reads || {};
  next.activity = remote.activity || [];
  return next;
}

function rememberDataUrls() {
  const m = new Map();
  for (const l of db.leads || []) {
    for (const im of l.images || []) {
      if (im.dataUrl && im.filename) m.set(`${l.id}/${im.filename}`, im.dataUrl);
    }
  }
  return m;
}

function restoreDataUrls(m) {
  for (const l of db.leads || []) {
    for (const im of l.images || []) {
      const d = m.get(`${l.id}/${im.filename}`);
      if (d) im.dataUrl = d;
    }
  }
}

function cacheLocal() {
  try {
    const session = db.session || "";
    if (session) localStorage.setItem(SESSION_KEY, session);
    else localStorage.removeItem(SESSION_KEY);
    localStorage.setItem(KEY, JSON.stringify(stripDesk(db)));
    return true;
  } catch {
    try {
      localStorage.setItem(KEY, JSON.stringify({ rev: db.rev, users: db.users, leads: [], notes: [], history: [], threads: db.threads, messages: db.messages, reads: db.reads, activity: [] }));
    } catch { /* ignore */ }
    return false;
  }
}

function load() {
  const session = localStorage.getItem(SESSION_KEY) || null;
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try {
      const data = JSON.parse(raw);
      const desk = applyDesk(data);
      desk.session = session || data.session || null;
      return desk;
    } catch { /* seed */ }
  }
  const data = seed();
  data.session = session;
  return data;
}

function save() {
  cacheLocal();
}

let persistTimer = null;
let pushing = false;
let pendingPush = false;
let pollTimer = null;
let cloudRev = 0;
let cloudReady = false;

function persist() {
  db.rev = now();
  const ok = cacheLocal();
  if (!ok) toast("This phone could not cache the desk. Connect the business token so GitHub holds it.", "warn");
  schedulePush();
  return true;
}

function schedulePush() {
  if (!getToken() || !cloudReady) return;
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    pushCloud().catch((err) => toast(err.message || String(err), "bad"));
  }, 700);
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(text || "")));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function looksHashed(pw) {
  return /^[a-f0-9]{64}$/i.test(String(pw || ""));
}

async function getFile(path) {
  const token = getToken();
  const { owner, repo } = githubRepo();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = githubHeaders(token);
  const get = await fetch(url, { headers });
  if (get.status === 404) return { notFound: true };
  if (!get.ok) throw new Error(githubMessage(get.status, await get.text()));
  const data = await get.json();
  const b64 = String(data.content || "").replace(/\n/g, "");
  let text = "";
  try { text = b64ToUtf8(b64); } catch { text = atob(b64); }
  return { sha: data.sha, text, b64, notFound: false };
}

function b64ToUtf8(b64) {
  const bin = atob(String(b64 || "").replace(/\n/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function publicStateUrls() {
  const { owner, repo } = githubRepo();
  const t = Date.now();
  return [
    `${PUBLIC_ORIGIN}/sitedesk-data/state.json?v=${t}`,
    `https://raw.githubusercontent.com/${owner}/${repo}/main/sitedesk-data/state.json?v=${t}`,
  ];
}

async function fetchPublicState() {
  for (const url of publicStateUrls()) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch { /* next */ }
  }
  return null;
}

async function pushCloud() {
  const token = getToken();
  if (!token) return;
  if (pushing) { pendingPush = true; return; }
  pushing = true;
  try {
    const state = stripDesk(db);
    state.rev = db.rev || now();
    for (const u of state.users) {
      if (u.password && !looksHashed(u.password)) {
        u.password = await sha256Hex(u.password);
      }
    }
    for (const u of db.users) {
      const s = state.users.find((x) => x.id === u.id);
      if (s) u.password = s.password;
    }
    await putContent({
      token,
      path: DATA_PATH,
      contentB64: utf8ToB64(JSON.stringify(state)),
      message: "SiteDesk desk state",
    });
    cloudRev = state.rev;
    db.rev = state.rev;
    cacheLocal();
  } finally {
    pushing = false;
    if (pendingPush) {
      pendingPush = false;
      schedulePush();
    }
  }
}

async function pullCloud(opts = {}) {
  const token = getToken();
  let remote = null;
  if (token) {
    try {
      const got = await getFile(DATA_PATH);
      if (got.notFound) {
        cloudReady = true;
        await pushCloud();
        return;
      }
      remote = JSON.parse(got.text);
    } catch (err) {
      if (!opts.quiet) toast(err.message || String(err), "warn");
    }
  }
  if (!remote) {
    try { remote = await fetchPublicState(); } catch { remote = null; }
  }
  if (!remote || !remote.users) return;
  const incoming = remote.rev || remote.updatedAt || 0;
  if (opts.quiet && incoming && cloudRev && incoming <= cloudRev) return;
  if (opts.quiet && incoming && db.rev && incoming < db.rev && getToken()) return;
  const urls = rememberDataUrls();
  const session = db.session;
  const next = applyDesk(remote);
  next.session = session;
  db = next;
  restoreDataUrls(urls);
  cloudRev = incoming;
  db.rev = incoming;
  cloudReady = true;
  cacheLocal();
  render();
}

function startPoll() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(() => {
    if (document.hidden) return;
    pullCloud({ quiet: true }).catch(() => {});
  }, 5000);
  window.addEventListener("focus", () => pullCloud({ quiet: true }).catch(() => {}));
}

async function boot() {
  await pullCloud();
  if (getToken() && !cloudReady) {
    /* Contents API failed and public JSON missing — do not overwrite the repo. */
  } else if (!getToken()) {
    cloudReady = true;
  }
  startPoll();
}

async function imageBytesB64(lead, im) {
  if (im.dataUrl) return dataUrlToB64(im.dataUrl);
  const path = im.path || photoPath(lead.id, im.filename);
  const token = getToken();
  if (token) {
    const got = await getFile(path);
    if (!got.notFound && got.b64) return got.b64;
  }
  const url = `${PUBLIC_ORIGIN}/${path}?v=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Could not read photo " + im.filename);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
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
  return Object.entries(pagesOf(lead)).some(([k, p]) => /\.html?$/i.test(k) && String(p || "").trim());
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
  const files = (images || []).filter((im) => im.filename && (im.pageId || im.dataUrl));
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

function rewriteImages(html, images, lead) {
  let out = html || "";
  for (const im of images || []) {
    if (!im.filename) continue;
    const d = photoSrc(im, lead);
    if (!d) continue;
    const f = im.filename;
    out = out.split(`src="${f}"`).join(`src="${d}"`);
    out = out.split(`src='${f}'`).join(`src="${d}"`);
    out = out.split(`src="./${f}"`).join(`src="${d}"`);
    out = out.split(`src='./${f}'`).join(`src="${d}"`);
  }
  return out;
}

function previewDoc(lead, pageName) {
  if (lead.buildMode === "diy") {
    syncDiyFromBrief(lead);
    serializeDiy(lead);
    const pages = lead.diy.pages || [];
    const p = pages.find((x) => x.filename === pageName) || pages.find((x) => x.id === diyPageId) || pages[0];
    if (!p) return "";
    return rewriteImages(renderDiyPage(lead, p, true), lead.images, lead);
  }
  const pages = pagesOf(lead);
  const htmlFiles = Object.keys(pages).filter((k) => /\.html?$/i.test(k));
  const name = pageName && pages[pageName] ? pageName : (pages["index.html"] ? "index.html" : htmlFiles[0]);
  let html = (name && pages[name]) || lead.html || "";
  if (pages["styles.css"] && html && /href=["']styles\.css["']/.test(html)) {
    html = html.replace(/<link[^>]+href=["']styles\.css["'][^>]*>/i, `<style>${pages["styles.css"]}</style>`);
  }
  return rewriteImages(html, lead.images, lead);
}


async function githubPublish(lead, token) {
  const slug = lead.slug || toSlug(lead.businessName);
  lead.slug = slug;
  for (const im of lead.images || []) {
    if (!im.filename) continue;
    const contentB64 = await imageBytesB64(lead, im);
    await putContent({
      token,
      path: `${slug}/${im.filename}`,
      contentB64,
      message: `Add ${slug}/${im.filename} from SiteDesk`,
    });
  }
  const pages = pagesOf(lead);
  if (!Object.keys(pages).length) pages["index.html"] = lead.html || "";
  if (lead.phone || lead.email || lead.hours) pages["contact.json"] = contactJsonFor(lead);
  for (const [filename, html] of Object.entries(pages)) {
    await putContent({
      token,
      path: `${slug}/${filename}`,
      contentB64: utf8ToB64(html || ""),
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
  snapshotContact(lead);
  logActivity("publish", `Published ${lead.businessName} → ${lead.siteUrl}`, { leadId: lead.id });
  if (lead.status === "building" || lead.status === "assigned_builder") {
    setStatus(lead, "review", "Published to GitHub Pages");
  } else if (user?.role === "admin" && lead.status === "review") {
    /* stay in review so caller can sign off */
  }
}

async function publishLead(lead, user) {
  if (lead.buildMode === "diy") serializeDiy(lead);
  else {
    const ta = $("#html-paste");
    if (ta) applyPaste(lead, ta.value);
  }
  persist();
  if (!leadHasHtml(lead)) {
    toast("Nothing to publish. Paste z.ai HTML or build pages here.", "bad");
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
  const path = photoPath(lead.id, filename);
  lead.images.push({
    id,
    kind,
    label,
    filename,
    mime: packed.mime,
    dataUrl: packed.dataUrl,
    path,
    pageId: "",
  });
  lead.updatedAt = now();
  const token = getToken();
  if (token) {
    await putContent({
      token,
      path,
      contentB64: dataUrlToB64(packed.dataUrl),
      message: `SiteDesk photo ${path}`,
    });
  }
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
    applyDefaultPair(lead);
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

function hydrateBrief(raw) {
  const b = { ...emptyBrief(), ...(raw || {}) };
  if (!Array.isArray(b.pages)) {
    const parsed = String(b.pagesWanted || "").split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
    b.pages = parsed.map((name) => ({ id: uid(), name, note: "" }));
  }
  b.pages = b.pages.map((p) => ({
    id: p.id || uid(),
    name: String(p.name || "").trim(),
    note: String(p.note || ""),
  })).filter((p) => p.name);
  if (b.siteShape !== "one" && b.siteShape !== "multi") b.siteShape = "";
  delete b.businessName;
  delete b.contact;
  return b;
}

function pageFilename(name) {
  const n = String(name || "").trim();
  if (!n || /^home$/i.test(n) || /^index(\.html)?$/i.test(n)) return "index.html";
  return kebabCase(n) + ".html";
}

function briefPages(lead) {
  const b = lead.brief || emptyBrief();
  const used = new Set();
  const out = [];
  for (const p of b.pages || []) {
    const name = String(p.name || "").trim();
    if (!name) continue;
    let filename = pageFilename(name);
    if (used.has(filename)) {
      const base = filename.replace(/\.html$/, "");
      let n = 2;
      while (used.has(`${base}-${n}.html`)) n++;
      filename = `${base}-${n}.html`;
    }
    used.add(filename);
    out.push({ id: p.id, name, note: p.note || "", filename });
  }
  return out;
}

function listedFiles(lead) {
  const b = lead.brief || emptyBrief();
  if (b.siteShape !== "multi") return ["index.html"];
  const files = briefPages(lead).map((p) => p.filename);
  return files.length ? files : ["index.html"];
}

function filledLine(label, value) {
  const v = String(value || "").trim();
  return v ? `${label}: ${v}` : "";
}

function callNotesText(lead) {
  const notes = db.notes
    .filter((n) => n.leadId === lead.id)
    .map((n) => String(n.text || "").trim())
    .filter(Boolean);
  return notes.length ? notes.map((t) => "- " + t).join("\n") : "";
}

function fmtImgRule(im) {
  const label = im.label || im.kind || "photo";
  return `FILENAME: ${im.filename}\nUSE FOR: ${label}\n<img src="${im.filename}" alt="${label}">`;
}

function imagePromptBlock(lead) {
  const images = (lead.images || []).filter((im) => im.filename);
  if (!images.length) {
    return "No photos were provided. Do not include photo sections or any <img> tags. Do not generate or invent images.";
  }
  const pages = briefPages(lead);
  const byPage = new Map();
  const any = [];
  const unassigned = [];
  for (const im of images) {
    if (im.pageId === "all") any.push(im);
    else if (im.pageId && pages.some((p) => p.id === im.pageId)) {
      if (!byPage.has(im.pageId)) byPage.set(im.pageId, []);
      byPage.get(im.pageId).push(im);
    } else unassigned.push(im);
  }
  const bits = ["Use only these files. Exact src as written. Do not generate or invent images."];
  for (const p of pages) {
    const list = byPage.get(p.id) || [];
    if (!list.length) continue;
    bits.push(`PAGE ${p.filename}\n` + list.map(fmtImgRule).join("\n\n"));
  }
  if (any.length) bits.push("ANY / ALL PAGES\n" + any.map(fmtImgRule).join("\n\n"));
  if (unassigned.length) {
    bits.push("UNASSIGNED (do not invent a gallery to use these; leave unused unless a listed page truly needs one)\n" + unassigned.map(fmtImgRule).join("\n\n"));
  }
  bits.push("If a page has no photos listed above, do not add a photo section or gallery on that page.");
  return bits.join("\n\n");
}

function builderPageDefs(lead) {
  const b = lead.brief || emptyBrief();
  if (b.siteShape === "multi") {
    const pages = briefPages(lead);
    if (pages.length) return pages;
  }
  return [{ id: "home-fallback", name: "Home", note: "", filename: "index.html" }];
}

function syncDiyFromBrief(lead) {
  const wanted = builderPageDefs(lead);
  const existing = lead.diy?.pages || [];
  const byId = new Map(existing.map((p) => [p.id, p]));
  const byName = new Map(existing.map((p) => [String(p.name || "").toLowerCase(), p]));
  const pages = wanted.map((w) => {
    const prev = (w.id && byId.get(w.id)) || byName.get(w.name.toLowerCase());
    if (prev) {
      return {
        ...prev,
        id: w.id === "home-fallback" ? prev.id : (w.id || prev.id),
        name: w.name,
        filename: w.filename,
        blocks: Array.isArray(prev.blocks) ? prev.blocks : [],
      };
    }
    return {
      id: w.id === "home-fallback" ? uid() : (w.id || uid()),
      name: w.name,
      filename: w.filename,
      blocks: [],
    };
  });
  lead.diy = { pages };
  return pages;
}

function addBriefPage(lead, name) {
  const n = String(name || "").trim();
  if (!n) return null;
  lead.brief = hydrateBrief(lead.brief);
  if (lead.brief.pages.some((p) => p.name.toLowerCase() === n.toLowerCase())) return null;
  const page = { id: uid(), name: n, note: "" };
  lead.brief.pages.push(page);
  lead.brief.siteShape = "multi";
  lead.updatedAt = now();
  syncDiyFromBrief(lead);
  return page;
}

function removeBriefPage(lead, pageId) {
  lead.brief = hydrateBrief(lead.brief);
  lead.brief.pages = lead.brief.pages.filter((p) => p.id !== pageId);
  for (const im of lead.images || []) {
    if (im.pageId === pageId) im.pageId = "";
  }
  lead.updatedAt = now();
  syncDiyFromBrief(lead);
}

function contactFacts(lead) {
  const rows = [];
  if (String(lead.phone || "").trim()) rows.push({ label: "Phone", value: lead.phone, href: "tel:" + String(lead.phone).replace(/[^\d+]/g, "") });
  if (String(lead.email || "").trim()) rows.push({ label: "Email", value: lead.email, href: "mailto:" + lead.email });
  if (String(lead.address || "").trim()) rows.push({ label: "Address", value: lead.address });
  if (String(lead.hours || "").trim()) rows.push({ label: "Hours", value: lead.hours });
  return rows;
}

function diyCss(lead) {
  const name = lead.businessName || "Site";
  return `/* ${name} */\n:root { color-scheme: light; }\n*{box-sizing:border-box}html,body{margin:0}body{font-family:"IBM Plex Sans",system-ui,sans-serif;color:#1a1914;background:#f7f3ea;line-height:1.5}a{color:inherit}.wrap{max-width:980px;margin:0 auto;padding:0 20px}header.site{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;padding:18px 0;border-bottom:1px solid #ddd6c4}header.site .brand{font-family:Georgia,serif;font-size:1.35rem;text-decoration:none}nav a{margin-left:14px;text-decoration:none;opacity:.75}nav a.on{opacity:1;border-bottom:2px solid #1a1914}.hero{padding:56px 0 32px}.hero h1{font-family:Georgia,serif;font-size:clamp(2rem,5vw,3.2rem);margin:0 0 12px;letter-spacing:-.03em}.hero p{font-size:1.15rem;color:#5c574c;margin:0;max-width:36em}.prose{padding:12px 0 28px;max-width:40em;white-space:pre-wrap}.shot{margin:16px 0 28px}.shot img,.gallery img{max-width:100%;height:auto;display:block;border-radius:8px}.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;padding:12px 0 28px}.contact{padding:12px 0 32px}.contact h2{font-family:Georgia,serif}footer.site{border-top:1px solid #ddd6c4;padding:24px 0 40px;color:#5c574c;font-size:.95rem}\n`;
}

function renderBlockHtml(block, lead) {
  switch (block.type) {
    case "hero": {
      const t = String(block.title || "").trim();
      const s = String(block.subtitle || "").trim();
      if (!t && !s) return "";
      return `<section class="hero">${t ? `<h1>${esc(t)}</h1>` : ""}${s ? `<p>${esc(s)}</p>` : ""}</section>`;
    }
    case "text": {
      const t = String(block.text || "").trim();
      if (!t) return "";
      return `<section class="prose">${esc(t).replace(/\n/g, "<br>")}</section>`;
    }
    case "image": {
      const im = (lead.images || []).find((x) => x.id === block.imageId);
      if (!im?.filename) return "";
      return `<figure class="shot"><img src="${esc(im.filename)}" alt="${esc(im.label || im.kind || "")}"></figure>`;
    }
    case "gallery": {
      const ids = block.imageIds || [];
      const imgs = (lead.images || []).filter((im) => ids.includes(im.id) && im.filename);
      if (!imgs.length) return "";
      return `<section class="gallery">${imgs.map((im) => `<img src="${esc(im.filename)}" alt="${esc(im.label || "")}">`).join("")}</section>`;
    }
    case "contact": {
      const rows = contactFacts(lead);
      if (!rows.length) return "";
      return `<section class="contact"><h2>Contact</h2>${rows.map((r) => (
        r.href ? `<p>${esc(r.label)}: <a href="${esc(r.href)}">${esc(r.value)}</a></p>` : `<p>${esc(r.label)}: ${esc(r.value)}</p>`
      )).join("")}</section>`;
    }
    case "html":
      return block.html || "";
    default:
      return "";
  }
}

function renderDiyPage(lead, page, inlineCss) {
  if (!page) return "";
  const pages = lead.diy?.pages || [page];
  const title = lead.businessName || page.name;
  const nav = pages.map((p) => {
    const on = p.id === page.id ? ' class="on"' : "";
    return `<a href="${p.filename}"${on}>${esc(p.name)}</a>`;
  }).join("");
  const main = (page.blocks || []).map((b) => renderBlockHtml(b, lead)).filter(Boolean).join("\n");
  const css = inlineCss ? `<style>${diyCss(lead)}</style>` : `<link rel="stylesheet" href="styles.css"/>`;
  const footerBits = contactFacts(lead).map((r) => esc(r.value));
  const footer = footerBits.length ? `<footer class="site"><div class="wrap">${footerBits.join(" · ")}</div></footer>` : "";
  const homeHref = (pages.find((p) => p.filename === "index.html") || pages[0] || page).filename;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(title)}${page.name && page.name !== title ? " · " + esc(page.name) : ""}</title>
${css}
</head>
<body>
<header class="site"><div class="wrap">
  <a class="brand" href="${homeHref}">${esc(lead.businessName || page.name)}</a>
  <nav>${nav}</nav>
</div></header>
<main class="wrap">
${main}
</main>
${footer}
</body>
</html>`;
}

function serializeDiy(lead) {
  syncDiyFromBrief(lead);
  const out = {};
  out["styles.css"] = diyCss(lead);
  for (const p of lead.diy.pages) out[p.filename] = renderDiyPage(lead, p, false);
  lead.pages = out;
  lead.html = out["index.html"] || Object.values(out).find((v) => /<html/i.test(String(v))) || "";
}

function zaiInstructions(lead) {
  const b = lead.brief || emptyBrief();
  const files = listedFiles(lead);
  const multi = b.siteShape === "multi" && briefPages(lead).length > 0;
  const shape = multi
    ? `SITE SHAPE: MULTI PAGE: these files only: ${files.join(", ")}\nOutput a separate HTML file for each listed filename. Shared relative nav. Do not add pages that are not listed.`
    : `SITE SHAPE: ONE PAGE: only index.html\nThis is ONE index.html covering only the sections implied by the facts below. Do not invent extra pages.`;

  const pageNotes = briefPages(lead)
    .map((p) => filledLine(`Page ${p.filename} (${p.name})`, p.note))
    .filter(Boolean);

  const facts = [
    filledLine("Business name", lead.businessName),
    filledLine("Contact", lead.contactName),
    filledLine("Phone", lead.phone),
    filledLine("Email", lead.email),
    filledLine("Address", lead.address),
    filledLine("Hours", lead.hours),
    filledLine("Website", lead.website),
    filledLine("What they sell", b.whatTheySell),
    filledLine("Brand name / colors", b.brandColors),
    filledLine("Example sites", b.exampleSites),
    filledLine("Notes", b.extraNotes),
    ...pageNotes,
  ].filter(Boolean);

  const notes = callNotesText(lead);
  if (notes) facts.push("Call notes:\n" + notes);

  const fileList = files.join(", ");
  return `Build a real local-business website. Follow every rule. Do not invent.

1. ${shape}

2. FACTS WE HAVE (use only these; if a fact is missing, leave it out of the site rather than guessing):
${facts.join("\n") || "No facts recorded yet. Do not invent a business story."}

3. IMAGES
${imagePromptBlock(lead)}

4. Do not invent awards, reviews, extra locations, prices, services, or pages we did not list.

5. If a fact is missing, omit it from the site. Never pad with placeholder copy. Never write "none" or "TBD".

6. Output ===== FILE: name ===== blocks only for: ${fileList}
Raw HTML only. No markdown fences. Relative links between these files.
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
  if (user && route.name === "sites") {
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
        <p class="muted">Internal production desk. Same board on every phone.</p>
        <label class="field"><span>Email</span><input name="email" type="email" required autocomplete="username"/></label>
        <label class="field"><span>Password</span><input name="password" type="password" required autocomplete="current-password"/></label>
        <div class="row"><button class="btn primary" type="submit">Sign in</button></div>
        <p class="hint">Paste the business GitHub token in Settings so jobs are shared. First device: admin@sitedesk.local / admin123 — then add real people under Team.</p>
        <p id="login-err" class="hint bad-text"></p>
      </form>
    </div>`;
}

function bindLogin() {
  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = String(fd.get("email")).trim().toLowerCase();
    const password = String(fd.get("password"));
    const hashed = looksHashed(password) ? password : await sha256Hex(password);
    const u = db.users.find((x) => x.email === email && x.active !== false && (x.password === password || x.password === hashed));
    if (!u) {
      $("#login-err").textContent = "Wrong email or password.";
      return;
    }
    db.session = u.id;
    persist();
    go(homeFor(u));
  });
}

function applyDefaultPair(lead) {
  if (!lead || !lead.assignedCallerId || lead.assignedBuilderId) return;
  const bid = userById(lead.assignedCallerId)?.defaultBuilderId;
  if (bid && builders().some((b) => b.id === bid)) lead.assignedBuilderId = bid;
}

function ownerMessage(lead) {
  return `Your site is live: ${lead.siteUrl}`;
}

function qrUrl(url) {
  return "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encodeURIComponent(url || "");
}

function shareCard(lead) {
  if (!lead.siteUrl) {
    return `
    <div class="overview-block">
      <p class="section-label">Live site</p>
      <p class="muted">Not published yet. ${lead.publishQueued ? "Queued for admin." : "Paste HTML or build it here, then Save / Publish."}</p>
    </div>`;
  }
  const msg = ownerMessage(lead);
  const mail = lead.email
    ? `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent("Your site is live")}&body=${encodeURIComponent(msg)}`
    : "";
  const smsPhone = String(lead.phone || "").replace(/[^\d+]/g, "");
  const sms = smsPhone ? `sms:${encodeURIComponent(smsPhone)}?body=${encodeURIComponent(msg)}` : "";
  return `
    <div class="overview-block share-card">
      <p class="section-label">Send to owner</p>
      <a class="live-link" href="${esc(lead.siteUrl)}" target="_blank" rel="noopener">${esc(lead.siteUrl)}</a>
      <div class="row" style="margin-top:10px">
        <button class="btn tiny" type="button" data-copy-url="${esc(lead.siteUrl)}">Copy link</button>
        ${mail ? `<a class="btn tiny" href="${esc(mail)}">Email owner</a>` : `<span class="muted">No email on this lead</span>`}
        ${sms ? `<a class="btn tiny" href="${esc(sms)}">Text owner</a>` : `<span class="muted">No phone on this lead</span>`}
        <button class="btn tiny" type="button" data-tiny-edit="${lead.id}">Tiny edit</button>
      </div>
      <img class="qr" src="${esc(qrUrl(lead.siteUrl))}" width="180" height="180" alt="QR code for live site"/>
      <p class="help">Scan to open the live site. Email and text open this device’s apps — SiteDesk does not send SMS for you.</p>
    </div>`;
}

function snapshotContact(lead) {
  lead.contactSnap = {
    phone: String(lead.phone || ""),
    email: String(lead.email || ""),
    hours: String(lead.hours || ""),
  };
}

function replaceContactInPages(pages, fromVal, toVal) {
  const from = String(fromVal || "");
  const to = String(toVal || "");
  if (!from || from === to) return 0;
  let n = 0;
  for (const k of Object.keys(pages || {})) {
    if (!/\.html?$/i.test(k)) continue;
    const src = String(pages[k] || "");
    if (!src.includes(from)) continue;
    pages[k] = src.split(from).join(to);
    n++;
  }
  return n;
}

function contactJsonFor(lead) {
  return JSON.stringify({
    businessName: lead.businessName || "",
    phone: lead.phone || "",
    email: lead.email || "",
    hours: lead.hours || "",
  }, null, 2);
}

async function ensurePagesForTiny(lead, token) {
  if (leadHasHtml(lead)) return true;
  if (!token || !lead.slug) return false;
  try {
    const html = await fetchGithubFileText(`${lead.slug}/index.html`, token);
    lead.pages = lead.pages || {};
    lead.pages["index.html"] = html;
    lead.html = html;
    return true;
  } catch {
    return false;
  }
}

async function tinySaveLead(lead, { phone, email, hours, file, imageId }, user) {
  const snap = lead.contactSnap || { phone: lead.phone || "", email: lead.email || "", hours: lead.hours || "" };
  const token = getToken();
  await ensurePagesForTiny(lead, token);
  const pages = pagesOf(lead);
  let hits = 0;
  hits += replaceContactInPages(pages, snap.phone, phone);
  hits += replaceContactInPages(pages, snap.email, email);
  hits += replaceContactInPages(pages, snap.hours, hours);
  lead.phone = phone;
  lead.email = email;
  lead.hours = hours;
  snapshotContact(lead);
  lead.pages = pages;
  lead.pages["contact.json"] = contactJsonFor(lead);
  if (lead.pages["index.html"]) lead.html = lead.pages["index.html"];
  let replacedName = "";
  if (file && imageId) {
    const im = (lead.images || []).find((x) => x.id === imageId);
    if (im) {
      const packed = await compressImage(file);
      im.dataUrl = packed.dataUrl;
      im.mime = packed.mime;
      replacedName = im.filename;
    }
  }
  lead.updatedAt = now();
  persist();
  if (!token) {
    toast("Saved locally" + (hits ? ` · rewrote ${hits} page(s)` : " · no matching phone/hours/email in HTML") + ". Add a GitHub token to push.", "warn");
    return;
  }
  busy = true;
  render();
  try {
    for (const [filename, body] of Object.entries(lead.pages)) {
      if (!String(body || "").trim()) continue;
      await putContent({
        token,
        path: `${lead.slug}/${filename}`,
        contentB64: utf8ToB64(body),
        message: `Tiny edit ${lead.slug}/${filename} from SiteDesk`,
      });
    }
    if (replacedName) {
      const im = (lead.images || []).find((x) => x.filename === replacedName);
      if (im?.dataUrl) {
        const deskPath = im.path || photoPath(lead.id, im.filename);
        im.path = deskPath;
        const b64 = dataUrlToB64(im.dataUrl);
        await putContent({
          token,
          path: `${lead.slug}/${replacedName}`,
          contentB64: b64,
          message: `Replace ${lead.slug}/${replacedName} from SiteDesk`,
        });
        await putContent({
          token,
          path: deskPath,
          contentB64: b64,
          message: `Replace desk photo ${deskPath}`,
        });
      }
    }
    lead.publishedAt = now();
    persist();
    toast("Tiny edit live at " + lead.siteUrl + (hits ? ` · rewrote ${hits} page(s)` : " · contact.json written"), "ok");
  } catch (err) {
    toast(err.message || String(err), "bad");
  } finally {
    busy = false;
    render();
  }
}

function openTinyEdit(lead, user) {
  const imgs = lead.images || [];
  const wrap = modal(`
    <h3 class="display">Tiny edit · ${esc(lead.businessName || "Site")}</h3>
    <p class="help">Hours, phone, email, or replace one photo. Does not rewrite the whole site. If the old phone/hours/email text is in the HTML, it is replaced. contact.json is always written beside the pages.</p>
    <form id="tiny-form">
      <label class="field"><span>Phone</span><input name="phone" value="${esc(lead.phone || "")}"/></label>
      <label class="field"><span>Email</span><input name="email" value="${esc(lead.email || "")}"/></label>
      <label class="field"><span>Hours</span><input name="hours" value="${esc(lead.hours || "")}"/></label>
      <label class="field"><span>Replace one photo</span>
        <select name="imageId">
          <option value="">Leave photos as-is</option>
          ${imgs.map((im) => `<option value="${im.id}">${esc(im.label || im.kind)} · ${esc(im.filename)}</option>`).join("")}
        </select>
      </label>
      <label class="field"><span>New image (optional)</span>
        <input type="file" name="file" accept="image/*" capture="environment"/>
      </label>
      <div class="row">
        <button class="btn primary" type="submit">Save tiny edit</button>
        <button class="btn ghost" type="button" data-close>Cancel</button>
      </div>
    </form>`, true);
  $("[data-close]", wrap).addEventListener("click", () => wrap.remove());
  $("#tiny-form", wrap).addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    wrap.remove();
    await tinySaveLead(lead, {
      phone: String(fd.get("phone") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      hours: String(fd.get("hours") || "").trim(),
      imageId: String(fd.get("imageId") || ""),
      file: e.target.file?.files?.[0] || null,
    }, user);
  });
}

let githubSiteCache = { at: 0, folders: [] };

function publishedLeads(user) {
  return db.leads.filter((l) => canSee(l, user) && !l.archived && (l.siteUrl || l.publishedAt || (l.slug && leadHasHtml(l))));
}

function sitesPage(user) {
  const local = publishedLeads(user);
  const bySlug = new Map(local.map((l) => [(l.slug || toSlug(l.businessName)).toLowerCase(), l]));
  const remote = (githubSiteCache.folders || []).filter((f) => !bySlug.has(String(f).toLowerCase()));
  const token = getToken();
  const rows = local.map((l) => {
    const job = (db.threads || []).find((t) => t.type === "job" && t.leadId === l.id);
    const slug = l.slug || toSlug(l.businessName);
    const url = l.siteUrl || publicUrl(slug);
    return `
      <tr>
        <td><b>${esc(l.businessName || slug)}</b><div class="muted">${esc(slug)}</div></td>
        <td><a href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a></td>
        <td class="muted">${l.publishedAt ? fmt(l.publishedAt) : "—"}</td>
        <td>
          <div class="team-actions">
            <a class="btn tiny" href="${esc(url)}" target="_blank" rel="noopener">Open live</a>
            ${job ? `<a class="btn tiny" href="#/messages/${job.id}">Open job</a>` : `<a class="btn tiny" href="#/lead/${l.id}">Open job</a>`}
            ${canBuild(user) ? `<button class="btn tiny" type="button" data-republish="${l.id}">Republish</button>
            <button class="btn tiny" type="button" data-tiny-edit="${l.id}">Tiny edit</button>` : ""}
          </div>
        </td>
      </tr>`;
  }).join("");
  const remoteRows = remote.map((folder) => `
      <tr>
        <td><b>${esc(fromSlug(folder))}</b><div class="muted">${esc(folder)} · GitHub folder</div></td>
        <td><a href="${esc(publicUrl(folder))}" target="_blank" rel="noopener">${esc(publicUrl(folder))}</a></td>
        <td class="muted">On GitHub</td>
        <td><a class="btn tiny" href="${esc(publicUrl(folder))}" target="_blank" rel="noopener">Open live</a></td>
      </tr>`).join("");
  return `
    <div class="top">
      <div>
        <h1 class="display">Sites</h1>
        <p class="muted">Manage layer: live folders. Open, republish, or tiny-edit without a rebuild.</p>
      </div>
      ${token ? `<button class="btn" type="button" id="refresh-sites">Refresh from GitHub</button>` : ""}
    </div>
    <div class="card">
      <table class="table">
        <thead><tr><th>Site</th><th>Live URL</th><th>Last published</th><th></th></tr></thead>
        <tbody>${rows || ""}${remoteRows || ""}</tbody>
      </table>
      ${!rows && !remoteRows ? `<div class="empty">No published sites yet.</div>` : ""}
    </div>
    ${!token && user.role === "admin" ? `<p class="help" style="margin-top:12px">Add a classic PAT in Settings to list live GitHub folders and push tiny edits.</p>` : ""}`;
}

async function refreshGithubSites(user) {
  const token = getToken();
  if (!token) {
    toast("Add a GitHub token in Settings first.", "bad");
    return;
  }
  busy = true;
  render();
  try {
    githubSiteCache.folders = await listClientIndexFolders(token);
    githubSiteCache.at = now();
    toast(`Found ${githubSiteCache.folders.length} folder(s) on GitHub`, "ok");
  } catch (err) {
    toast(err.message || String(err), "bad");
  } finally {
    busy = false;
    render();
  }
}

function navItems(user) {
  const n = unreadTotal(user);
  const msg = `Messages${n ? ` <span class="badge">${n}</span>` : ""}`;
  if (user.role === "admin") {
    return [
      ["/board", "Board", "board"],
      ["/leads", "Leads", "leads"],
      ["/archive", "Archive", "archive"],
      ["/messages", msg, "messages"],
      ["/users", "Team", "users"],
      ["/settings", "Settings", "settings"],
    ];
  }
  if (user.role === "caller") {
    return [
      ["/board", "My leads", "board"],
      ["/leads", "All mine", "leads"],
      ["/archive", "Archive", "archive"],
      ["/messages", msg, "messages"],
      ["/settings", "Settings", "settings"],
    ];
  }
  return [
    ["/jobs", "My jobs", "jobs"],
    ["/messages", msg, "messages"],
    ["/settings", "Settings", "settings"],
  ];
}

function shell(user, inner) {
  const items = navItems(user).map(([href, label, icon]) => navLink(href, label, icon)).join("");
  const mainClass = route.name === "messages" ? "main msg-main" : "main";
  const pinned = navPinned();
  const threadOpen = route.name === "messages" && route.id;
  const shellClass = [
    "app-shell",
    pinned ? "nav-pinned" : "",
    threadOpen ? "thread-open" : "",
  ].filter(Boolean).join(" ");
  return `
    <div class="${shellClass}">
      <aside class="sidebar" id="sidebar">
        <div class="brand">
          <span class="brand-mark">SD</span>
          <span class="brand-text"><b>SiteDesk</b><span class="muted">v5 · ${esc(user.role)}</span></span>
        </div>
        <nav class="nav">${items}</nav>
        <div class="side-foot">
          <div class="who">${esc(user.name)}<div class="muted">${esc(user.email)}</div></div>
          <div class="pin-row">
            <button class="btn ghost tiny" id="nav-pin" type="button" aria-pressed="${pinned ? "true" : "false"}">${pinned ? "Unpin" : "Pin"}</button>
            <button class="btn ghost tiny" id="logout" type="button">Log out</button>
          </div>
        </div>
      </aside>
      <header class="phone-head">
        <button class="icon-btn" id="nav-open" type="button" aria-label="Menu">${navIcon("menu")}</button>
        <b class="display">SiteDesk</b>
        <button class="btn ghost tiny" id="logout-phone" type="button">Log out</button>
      </header>
      <main class="${mainClass}">
          ${getToken() ? "" : `<div class="banner">Connect the business token in Settings — this app will not store jobs only on this phone.</div>`}
          ${inner}
        </main>
      <nav class="bottom-nav" aria-label="Primary">${items}</nav>
      <div class="drawer-back" id="drawer-back"></div>
      <aside class="nav-drawer" id="nav-drawer">
        <div class="who" style="padding:6px 8px 10px">${esc(user.name)}<div class="muted">${esc(user.email)} · ${esc(user.role)}</div></div>
        <nav class="nav">${items}</nav>
        <button class="btn ghost" id="logout-drawer" type="button">Log out</button>
      </aside>
    </div>`;
}

function bindShell(user) {
  const logout = () => {
    db.session = null;
    persist();
    go("/login");
  };
  $("#logout")?.addEventListener("click", logout);
  $("#logout-phone")?.addEventListener("click", logout);
  $("#logout-drawer")?.addEventListener("click", logout);
  $("#nav-pin")?.addEventListener("click", () => {
    localStorage.setItem(NAV_PIN_KEY, navPinned() ? "0" : "1");
    render();
  });
  $(".brand-mark")?.addEventListener("click", () => {
    const shell = $(".app-shell");
    if (!shell || navPinned()) return;
    shell.classList.toggle("nav-open");
  });
  const drawer = $("#nav-drawer");
  const back = $("#drawer-back");
  const openDrawer = () => {
    if (drawer) drawer.classList.add("open");
    if (back) back.classList.add("open");
  };
  const closeDrawer = () => {
    if (drawer) drawer.classList.remove("open");
    if (back) back.classList.remove("open");
  };
  $("#nav-open")?.addEventListener("click", openDrawer);
  back?.addEventListener("click", closeDrawer);
  bindPage(user);
}

function page(user) {
  if (route.name === "users" && user.role === "admin") return usersPage();
  if (route.name === "settings") return settingsPage(user);
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
      <div class="row">
        <input class="search" id="board-search" placeholder="Search name or phone" />
        ${user.role !== "builder" ? `<button class="btn primary" data-open-new>Add new lead</button>` : ""}
      </div>
    </div>
    ${queued ? `<div class="banner">${queued} site(s) queued — add a GitHub token in Settings, then publish them.</div>` : ""}
    <div id="board-wrap">
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
        <p class="muted">Copy the prompt, build in z.ai, or build it here, then publish.</p>
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

function briefStarted(lead) {
  const b = lead.brief || emptyBrief();
  return !!(
    String(b.whatTheySell || "").trim()
    || String(b.brandColors || "").trim()
    || String(b.exampleSites || "").trim()
    || String(b.extraNotes || "").trim()
    || b.siteShape
    || (b.pages || []).length
  );
}

function jobPath(lead) {
  const live = !!(lead.siteUrl || lead.publishedAt);
  const built = leadHasHtml(lead);
  const briefed = briefStarted(lead);
  const called = !!(lead.callOutcome) || ["contacted", "brief_ready", "assigned_builder", "building", "review", "done"].includes(lead.status);
  if (!called) return { step: "call", next: "Next: make the call and log the outcome." };
  if (!briefed) return { step: "brief", next: "Next: fill pages from the call." };
  if (!built && !live) return { step: "build", next: "Next: build in z.ai or here, then publish." };
  if (!live) return { step: "build", next: "Next: publish." };
  return { step: "live", next: "Next: send to owner." };
}

function stepperHtml(lead, tab) {
  const path = jobPath(lead);
  const current = ["call", "brief", "build", "live", "manage"].includes(tab) ? tab : path.step;
  const steps = [
    ["call", "Call", `#/lead/${lead.id}/call`],
    ["brief", "Brief", `#/lead/${lead.id}/brief`],
    ["build", "Build", `#/lead/${lead.id}/build`],
    ["live", "Live", `#/lead/${lead.id}/live`],
    ["manage", "Manage", `#/lead/${lead.id}/manage`],
  ];
  const next = tab === "live" && path.step === "live"
    ? "Next: send to owner."
    : (tab === "manage" ? "Next: open, republish, or tiny-edit this live site." : path.next);
  return `
    <nav class="stepper" aria-label="Job path">
      ${steps.map(([id, label, href], i) => `
        ${i ? `<span class="step-sep" aria-hidden="true">→</span>` : ""}
        <a href="${href}" class="${current === id ? "on" : ""}">${label}</a>`).join("")}
    </nav>
    <p class="next-line">${esc(next)}</p>`;
}

function liveTab(lead, user) {
  if (!lead.siteUrl) {
    return `
      <p class="muted">Not live yet.</p>
      <p class="next-line">Next: publish on Build.</p>
      <a class="btn primary" href="#/lead/${lead.id}/build">Go to Build</a>`;
  }
  return shareCard(lead);
}

function manageTab(lead, user) {
  const slug = lead.slug || toSlug(lead.businessName);
  const url = lead.siteUrl || (lead.publishedAt ? publicUrl(slug) : "");
  if (!url && !leadHasHtml(lead)) {
    return `
      <p class="muted">Nothing live yet.</p>
      <p class="next-line">Next: publish on Build.</p>
      <a class="btn primary" href="#/lead/${lead.id}/build">Go to Build</a>`;
  }
  return `
    <div class="overview-block">
      <p class="section-label">This site</p>
      ${url ? `<a class="live-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a>` : `<p class="muted">Draft saved. Not published.</p>`}
      <div class="row" style="margin-top:12px">
        ${url ? `<a class="btn primary" href="${esc(url)}" target="_blank" rel="noopener">Open live</a>` : ""}
        ${canBuild(user) ? `<button class="btn" type="button" data-republish="${lead.id}">Republish</button>
        <button class="btn" type="button" data-tiny-edit="${lead.id}">Tiny edit</button>` : ""}
      </div>
      <p class="help" style="margin-top:12px">Manage this job’s live folder. Tiny-edit hours, phone, email, or one photo without a rebuild.</p>
    </div>`;
}

function overviewTab(lead, user, edit) {
  const notes = db.notes.filter((n) => n.leadId === lead.id).sort((a, b) => b.createdAt - a.createdAt);
  const job = (db.threads || []).find((t) => t.type === "job" && t.leadId === lead.id);
  return `
    <div class="call-split">
      <div>
        <p class="section-label">Lead</p>
        ${leadField(lead, "businessName", "Company name", edit)}
        ${leadField(lead, "contactName", "Contact name", edit)}
        ${leadField(lead, "phone", "Phone", edit)}
        ${leadField(lead, "email", "Email", edit)}
        ${leadField(lead, "website", "Website", edit)}
        ${leadField(lead, "foundOn", "Found on", edit)}
        ${leadField(lead, "address", "Address", edit)}
        ${leadField(lead, "hours", "Hours", edit)}
      </div>
      <div>
        <p class="section-label">Call</p>
        <div class="chips" style="margin-bottom:16px">
          ${CALL_OUTCOMES.map((o) => `
            <button type="button" class="chip ${lead.callOutcome === o ? "on" : ""}" data-outcome="${esc(o)}" ${edit ? "" : "disabled"}>${esc(o)}</button>`).join("")}
        </div>
        <form id="note-form">
          <textarea name="text" placeholder="What happened on the call?" required></textarea>
          <div class="row" style="margin-top:8px"><button class="btn primary" type="submit">Add note</button></div>
        </form>
        <div class="notes" style="margin-top:12px">
          ${notes.map((n) => `<div class="note"><b>${esc(nameOf(n.authorId))}</b> <span class="muted">${fmt(n.createdAt)}</span><div>${esc(n.text)}</div></div>`).join("") || `<p class="muted">No notes yet.</p>`}
        </div>
        <p class="section-label" style="margin-top:28px">Assignment</p>
        ${user.role === "admin" ? assignForm(lead) : `<p class="muted">Caller ${esc(nameOf(lead.assignedCallerId))} · Builder ${esc(nameOf(lead.assignedBuilderId))}</p>`}
        ${job ? `<p style="margin-top:10px"><a class="btn tiny" href="#/messages/${job.id}">Job thread</a></p>` : ""}
      </div>
    </div>`;
}

function briefTab(lead, user, canUpload) {
  const b = lead.brief || emptyBrief();
  const builder = user.role === "builder";
  const prompt = zaiInstructions(lead);
  const pages = briefPages(lead);
  const q = (title, hint, inner) => `
    <div class="q">
      <p class="ask">${title}</p>
      ${hint ? `<p class="hint">${hint}</p>` : ""}
      ${inner}
    </div>`;
  const area = (key, ph) => builder
    ? `<p>${esc(b[key]) || "—"}</p>`
    : `<textarea data-brief-field="${key}" placeholder="${ph}">${esc(b[key] || "")}</textarea>`;
  return `
    ${q("What do they sell / services?", "Only write what they actually said. Leave blank if it did not come up.", area("whatTheySell", "What they sell"))}
    ${q("Brand name they use + colors they want?", "Skip if they did not say.", area("brandColors", "Brand / colors"))}
    ${q("Example sites they like?", "URLs or names they mentioned. Leave blank if none.", area("exampleSites", "Example sites"))}
    ${q("Extra notes / how they want it to feel?", "Tone, constraints, anything else from the call.", area("extraNotes", "Notes"))}
    ${q("Site shape", "One page unless they named more than one.", `
      <div class="seg">
        <button type="button" data-site-shape="one" class="${b.siteShape === "one" ? "on" : ""}" ${builder ? "disabled" : ""}>One page</button>
        <button type="button" data-site-shape="multi" class="${b.siteShape === "multi" ? "on" : ""}" ${builder ? "disabled" : ""}>Multi page</button>
      </div>`)}
    ${b.siteShape === "multi" ? q("Which pages?", "Add the pages they named. Home, Menu, Hours — whatever they said. Do not add extras.", `
      <div class="page-chip-row">
        ${pages.map((p) => `<span class="page-chip"><b>${esc(p.name)}</b>${builder ? "" : `<button type="button" class="xchip" data-del-page="${p.id}" aria-label="Remove">×</button>`}</span>`).join("") || `<span class="muted">None yet.</span>`}
      </div>
      ${builder ? "" : `<form class="page-add" id="add-page-form" style="margin-top:10px">
        <input name="name" placeholder="Page name they said" autocomplete="off"/>
        <button class="btn tiny" type="submit">Add</button>
      </form>`}
      <div class="page-notes">
        ${pages.map((p) => `
          <div class="page-note">
            <h4>${esc(p.name)} <span class="muted">${esc(p.filename)}</span></h4>
            <p class="hint">Optional: what goes on this page. Assign photos below to this page.</p>
            ${builder
              ? `<p>${esc(p.note) || "—"}</p>`
              : `<textarea data-page-note="${p.id}" placeholder="What they want on this page">${esc(p.note)}</textarea>`}
            <div class="page-thumbs">
              ${(lead.images || []).filter((im) => im.pageId === p.id).map((im) => `<img src="${photoSrc(im, lead)}" alt="${esc(im.label || "")}">`).join("") || `<span class="muted">No photos assigned to this page.</span>`}
            </div>
          </div>`).join("")}
      </div>`) : ""}
    ${q("Photos", "Rename the label. Assign each photo to a page, or any/all. Bytes are never sent to z.ai.", `
      ${canUpload ? `<div class="row" style="margin-bottom:10px">
        <label class="btn tiny">Logo<input type="file" accept="image/*" capture="environment" hidden data-img-kind="logo"/></label>
        <label class="btn tiny">Storefront<input type="file" accept="image/*" capture="environment" hidden data-img-kind="storefront"/></label>
        <label class="btn tiny">Extra photos<input type="file" accept="image/*" capture="environment" multiple hidden data-img-kind="photo"/></label>
      </div>` : ""}
      ${photoGrid(lead, canUpload)}`)}
    <div class="prompt-head">
      <p class="section-label" style="margin:0">z.ai prompt</p>
      <div class="row">
        <button class="btn" data-copy-brief type="button">Copy</button>
        <a class="btn" href="${ZAI}" target="_blank" rel="noopener" data-open-zai>Open z.ai</a>
      </div>
    </div>
    <pre class="prompt-box" id="zai-prompt">${esc(prompt)}</pre>`;
}

function photoSelect(lead, blk) {
  const imgs = lead.images || [];
  if (!imgs.length) return `<p class="muted">Upload named photos on the Brief tab first.</p>`;
  return `<select data-blk-field="imageId" data-blk="${blk.id}">
    <option value="">This lead’s photos</option>
    ${imgs.map((im) => `<option value="${im.id}" ${blk.imageId === im.id ? "selected" : ""}>${esc(im.label || im.kind)} · ${esc(im.filename)}</option>`).join("")}
  </select>`;
}

function gallerySelect(lead, page, blk) {
  const imgs = lead.images || [];
  if (!imgs.length) return `<p class="muted">Upload named photos on the Brief tab first.</p>`;
  const ids = new Set(blk.imageIds || []);
  const assigned = imgs.filter((im) => im.pageId === page.id || im.pageId === "all");
  const rest = imgs.filter((im) => !assigned.includes(im));
  const row = (im) => `<label class="row" style="margin:4px 0"><input type="checkbox" data-gal-img="${im.id}" data-blk="${blk.id}" ${ids.has(im.id) ? "checked" : ""}/> ${esc(im.label || im.kind)} <span class="muted">${esc(im.filename)}</span></label>`;
  return `${assigned.map(row).join("")}${rest.map(row).join("")}`;
}

function contactPreview(lead) {
  const rows = contactFacts(lead);
  return rows.length
    ? `<p>${rows.map((r) => esc(r.value)).join("<br>")}</p>`
    : `<p class="muted">No phone, email, address, or hours on the lead — this block will be omitted.</p>`;
}

function diyBlock(lead, page, blk) {
  const on = selectedBlockId === blk.id;
  let body = "";
  if (blk.type === "hero") {
    body = on
      ? `<label class="field tight"><span>Title</span><input data-blk-field="title" data-blk="${blk.id}" value="${esc(blk.title || "")}"/></label>
         <label class="field tight"><span>Subtitle</span><input data-blk-field="subtitle" data-blk="${blk.id}" value="${esc(blk.subtitle || "")}"/></label>`
      : `<h1>${esc(blk.title || "Hero")}</h1>${blk.subtitle ? `<p>${esc(blk.subtitle)}</p>` : ""}`;
  } else if (blk.type === "text") {
    body = on
      ? `<textarea data-blk-field="text" data-blk="${blk.id}">${esc(blk.text || "")}</textarea>`
      : `<p>${esc(blk.text || "Text")}</p>`;
  } else if (blk.type === "image") {
    const im = (lead.images || []).find((x) => x.id === blk.imageId);
    body = on ? photoSelect(lead, blk) : (im ? `<img src="${photoSrc(im, lead)}" alt="${esc(im.label || "")}">` : `<p class="muted">Pick a photo from this lead</p>`);
  } else if (blk.type === "gallery") {
    const ids = blk.imageIds || [];
    const imgs = (lead.images || []).filter((im) => ids.includes(im.id));
    body = on
      ? gallerySelect(lead, page, blk)
      : (imgs.length ? `<div class="row">${imgs.map((im) => `<img src="${photoSrc(im, lead)}" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:6px">`).join("")}</div>` : `<p class="muted">Pick photos from this lead</p>`);
  } else if (blk.type === "contact") {
    body = contactPreview(lead);
  } else if (blk.type === "html") {
    body = on
      ? `<textarea class="code" data-blk-field="html" data-blk="${blk.id}">${esc(blk.html || "")}</textarea>`
      : `<p class="muted">Custom HTML</p>`;
  }
  return `
    <div class="blk ${on ? "on" : ""}" data-sel-block="${blk.id}">
      <div class="blk-tools">
        <button type="button" data-blk-up="${blk.id}">Up</button>
        <button type="button" data-blk-down="${blk.id}">Down</button>
        <button type="button" data-blk-del="${blk.id}">Delete</button>
      </div>
      ${body}
    </div>`;
}

function diyWorkspace(lead) {
  const pages = syncDiyFromBrief(lead);
  const sel = pages.find((p) => p.id === diyPageId) || pages[0];
  if (sel) diyPageId = sel.id;
  const labels = { hero: "Hero", text: "Text", image: "Image", gallery: "Gallery", contact: "Contact", html: "Custom HTML" };
  return `
    <div class="diy">
      <div class="diy-col">
        <h4>Pages</h4>
        <div class="diy-pages">
          ${pages.map((p) => `<button type="button" class="diy-page ${sel && p.id === sel.id ? "on" : ""}" data-diy-page="${p.id}"><b>${esc(p.name)}</b><small>${esc(p.filename)}</small></button>`).join("")}
        </div>
        <form id="diy-add-page" class="page-add" style="margin-top:10px">
          <input name="name" placeholder="Add page" autocomplete="off"/>
          <button class="btn tiny" type="submit">Add</button>
        </form>
        ${sel ? `<div class="row" style="margin-top:8px">
          <button class="btn tiny" type="button" data-diy-rename>Rename</button>
          ${pages.length > 1 ? `<button class="btn tiny danger" type="button" data-diy-del-page>Delete</button>` : ""}
        </div>` : ""}
      </div>
      <div class="diy-col">
        <h4>Canvas${sel ? " · " + esc(sel.name) : ""}</h4>
        <div class="canvas">
          ${sel ? ((sel.blocks || []).map((blk) => diyBlock(lead, sel, blk)).join("") || `<p class="muted">Add a block to start this page.</p>`) : ""}
          <div class="add-blocks">
            ${Object.entries(labels).map(([t, lab]) => `<button type="button" class="btn tiny" data-add-block="${t}">${lab}</button>`).join("")}
          </div>
        </div>
      </div>
      <div class="diy-col diy-preview">
        <h4>Live preview</h4>
        ${pages.length > 1 ? `<div class="page-tabs">${pages.map((p) => `
          <button type="button" data-preview-page="${esc(p.filename)}" class="${sel && p.filename === sel.filename ? "on" : ""}">${esc(p.filename)}</button>`).join("")}</div>` : ""}
        ${phonePreviewHtml()}
      </div>
    </div>`;
}

function buildTab(lead, user) {
  const showBuilder = canBuild(user);
  const mode = lead.buildMode === "diy" ? "diy" : "zai";
  if (!showBuilder) {
    return callerPreview(lead);
  }
  return `
    <div class="mode-row">
      <div class="seg">
        <button type="button" data-build-mode="zai" class="${mode === "zai" ? "on" : ""}">Use z.ai</button>
        <button type="button" data-build-mode="diy" class="${mode === "diy" ? "on" : ""}">Build it here</button>
      </div>
      <div class="row">
        ${mode === "zai" ? `<a class="btn" href="${ZAI}" target="_blank" rel="noopener" data-open-zai>Open z.ai</a>` : ""}
        <button class="btn" type="button" data-save-html>Save draft</button>
        <button class="btn primary" type="button" data-publish ${busy ? "disabled" : ""}>${busy ? "Publishing…" : "Save / Publish"}</button>
      </div>
    </div>
    ${mode === "diy" ? diyWorkspace(lead) : builderWorkspace(lead)}`;
}

function leadMessagesTab(lead, user) {
  const job = (db.threads || []).find((t) => t.type === "job" && t.leadId === lead.id);
  if (!job) {
    return `
      <p class="muted">No job thread yet. Assign a caller and a builder, then connect the pair.</p>
      ${user.role === "admin" ? assignForm(lead) : `<p class="muted">Caller ${esc(nameOf(lead.assignedCallerId))} · Builder ${esc(nameOf(lead.assignedBuilderId))}</p>`}`;
  }
  markThreadRead(user, job.id);
  const msgs = db.messages.filter((m) => m.threadId === job.id).sort((a, b) => a.at - b.at);
  const lastRead = db.reads[user.id]?.threads?.[job.id] || 0;
  return `
    <div class="thread-embed">
      <div class="thread-head">
        <div>
          <h2 class="display">${esc(threadTitle(job, user))}</h2>
          <div class="muted" style="font-size:.8rem">Job thread · ${(job.userIds || []).map(nameOf).map(esc).join(", ")}</div>
        </div>
        <a class="btn tiny" href="#/messages/${job.id}">Open in Messages</a>
      </div>
      <div class="msg-log" id="msg-log">
        ${msgs.map((m) => `
          <div class="bubble ${m.fromId === user.id ? "me" : ""} ${m.at > lastRead && m.fromId !== user.id ? "unread" : ""}">
            <div class="meta">${esc(nameOf(m.fromId))} · ${fmtShort(m.at)}</div>
            <div>${esc(m.text)}</div>
          </div>`).join("") || `<p class="muted">No messages yet.</p>`}
      </div>
      <form class="compose-bar" id="compose-form" data-thread="${job.id}">
        <textarea name="text" rows="1" placeholder="Message…" required></textarea>
        <button class="btn primary" type="submit">Send</button>
      </form>
    </div>`;
}

function leadPage(user, id) {
  const lead = db.leads.find((l) => l.id === id);
  if (!lead || !canSee(lead, user)) return `<p>Lead not found.</p>`;
  lead.brief = hydrateBrief(lead.brief);
  if (previewLeadId !== lead.id) {
    previewFile = "index.html";
    previewLeadId = lead.id;
    diyPageId = null;
    selectedBlockId = null;
  }
  const path = jobPath(lead);
  let tab = route.tab || path.step;
  if (tab === "overview") tab = "call";
  if (!["call", "brief", "build", "live", "manage", "messages"].includes(tab)) tab = path.step;
  const edit = canEditLead(lead, user);
  const tel = String(lead.phone || "").replace(/[^\d+]/g, "");
  const web = websiteHref(lead.website);
  const company = lead.businessName || "Untitled lead";
  const contact = lead.contactName || "No contact name";
  const canUpload = edit;
  const job = (db.threads || []).find((t) => t.type === "job" && t.leadId === lead.id);
  return `
    <div class="lead-head">
    <div class="top">
      <div>
        <p class="muted"><a href="#/${lead.archived ? "archive" : (user.role === "builder" ? "jobs" : "board")}">Board</a></p>
        <h1 class="display" id="lead-company-title">${esc(company)}</h1>
        <p class="contact-line" id="lead-contact-title">${esc(contact)}</p>
        <p class="lead-flags">
          <span class="pill ${pillClass(lead.status)}">${esc(bucketOf(lead.status).label)}</span>
          ${lead.callOutcome ? `<span class="pill warn">${esc(lead.callOutcome)}</span>` : ""}
          ${lead.siteUrl ? `<span class="pill ok">Live</span>` : ""}
          ${lead.publishQueued ? `<span class="pill warn">Queued</span>` : ""}
        </p>
        <div class="callbar">
          ${tel ? `<a class="btn tiny" href="tel:${esc(tel)}">Call ${esc(lead.phone)}</a>` : ""}
          ${lead.email ? `<a class="btn tiny" href="mailto:${esc(lead.email)}">Email</a>` : ""}
          ${web ? `<a class="btn tiny" href="${esc(web)}" target="_blank" rel="noopener">Website</a>` : ""}
          ${job ? `<a class="btn tiny" href="#/messages/${job.id}">Thread</a>` : ""}
        </div>
      </div>
      <div class="row">
        ${edit ? `
          <button class="btn tiny" data-toggle-pin>${lead.pinned ? "Unpin" : "Pin"}</button>
          <button class="btn tiny" data-toggle-archive>${lead.archived ? "Restore" : "Archive"}</button>
        ` : ""}
        ${user.role === "admin" ? `<button class="btn tiny danger" data-delete-lead>Delete</button>` : ""}
        ${actionsFor(lead, user)}
      </div>
    </div>
    </div>
    ${lead.publishQueued && !getToken() ? `<div class="banner">Admin must add a GitHub token in Settings to go live. HTML is saved on this device.</div>` : ""}
    ${lead.publishError ? `<div class="banner bad">${esc(lead.publishError)}</div>` : ""}
    ${stepperHtml(lead, tab)}
    <div class="lead-surface">
      ${tab === "call" ? overviewTab(lead, user, edit) : ""}
      ${tab === "brief" ? briefTab(lead, user, canUpload) : ""}
      ${tab === "build" ? buildTab(lead, user) : ""}
      ${tab === "live" ? liveTab(lead, user) : ""}
      ${tab === "manage" ? manageTab(lead, user) : ""}
      ${tab === "messages" ? leadMessagesTab(lead, user) : ""}
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
  const pages = briefPages(lead);
  return `<div class="photos">${imgs.map((im) => `
    <div class="photo-card">
      <div class="photo">
        <img src="${photoSrc(im, lead)}" alt="${esc(im.label || im.kind)}" data-lightbox="${im.id}"/>
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
      ${canEdit ? `<select data-img-page="${im.id}">
        <option value="" ${!im.pageId ? "selected" : ""}>Unassigned</option>
        <option value="all" ${im.pageId === "all" ? "selected" : ""}>Any / all pages</option>
        ${pages.map((p) => `<option value="${p.id}" ${im.pageId === p.id ? "selected" : ""}>${esc(p.name)}</option>`).join("")}
      </select>` : (im.pageId === "all" ? `<p class="fn">Any / all pages</p>` : im.pageId ? `<p class="fn">${esc((pages.find((p) => p.id === im.pageId) || {}).name || "")}</p>` : "")}
    </div>`).join("")}</div>`;
}


function builderWorkspace(lead) {
  const pages = pagesOf(lead);
  const files = Object.keys(pages).filter((k) => /\.html?$/i.test(k));
  const htmlPages = Object.fromEntries(Object.entries(pages).filter(([k]) => /\.html?$/i.test(k)));
  const paste = serializePages(htmlPages);
  const current = files.includes(previewFile) ? previewFile : (files[0] || "index.html");
  return `
    <div>
      <p class="muted">Paste z.ai output. Multi-file uses ===== FILE: name ===== banners. Preview is local; image filenames rewrite to data URLs.</p>
      <label class="field"><span>HTML / FILE blocks</span>
        <textarea class="code" id="html-paste" spellcheck="false" placeholder="===== FILE: index.html =====">${esc(paste)}</textarea>
      </label>
      ${files.length > 1 ? `<div class="page-tabs">${files.map((f) => `
        <button type="button" data-preview-page="${esc(f)}" class="${f === current ? "on" : ""}">${esc(f)}</button>`).join("")}</div>` : ""}
      <p class="muted" style="margin:0 0 8px">Live preview</p>
      ${phonePreviewHtml()}
    </div>`;
}


function callerPreview(lead) {
  if (!leadHasHtml(lead)) {
    return `<div class="card"><h3 class="display">Site preview</h3><p class="muted">Builder has not pasted HTML yet.</p></div>`;
  }
  const pages = pagesOf(lead);
  const files = Object.keys(pages).filter((k) => /\.html?$/i.test(k));
  const current = files.includes(previewFile) ? previewFile : (files[0] || "index.html");
  return `
    <div class="card">
      <h3 class="display">Site preview</h3>
      ${files.length > 1 ? `<div class="page-tabs">${files.map((f) => `
        <button type="button" data-preview-page="${esc(f)}" class="${f === current ? "on" : ""}">${esc(f)}</button>`).join("")}</div>` : ""}
      ${phonePreviewHtml()}
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

function briefForm() { return ""; }
function briefRead() { return ""; }

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
          <span class="avatar">${esc(initialsOf(threadTitle(t, user)))}</span>
          <b>${esc(threadTitle(t, user))}${unread ? `<span class="unread-dot"></span>` : ""}</b>
          <span class="when">${last ? fmtShort(last.at) : ""}</span>
          <span class="preview">${last ? esc(last.text) : "No messages yet"}</span>
        </a>`;
    }).join("")
    : `<div class="empty">${user.role === "admin" ? "Connect two people to start a thread." : "No conversations yet."}</div>`;

  let pane;
  if (!current) {
    pane = `<div class="msg-empty"><div><b>Quiet for now</b><p>${user.role === "admin" ? "Connect two people to start a private thread." : "Pick a conversation, or wait for admin to connect you."}</p></div></div>`;
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
        <p class="muted">Private 1:1 threads. No shared inbox.</p>
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
    <p class="help" style="margin-top:12px">Edit name, email, role, or password. You cannot delete yourself or the last remaining admin. Deactivated people cannot sign in.</p>
    <div class="card" style="margin-top:16px">
      <h3 class="display">Default pairs</h3>
      <p class="help">New leads assigned to a caller get this builder. Connect this pair on a lead still works.</p>
      ${callers().map((c) => `
        <label class="field"><span>${esc(c.name)} → default builder</span>
          <select data-default-builder="${c.id}">
            <option value="">None</option>
            ${builders().map((b) => `<option value="${b.id}" ${c.defaultBuilderId === b.id ? "selected" : ""}>${esc(b.name)}</option>`).join("")}
          </select>
        </label>`).join("") || `<p class="muted">No callers yet.</p>`}
    </div>`;
}

function settingsPage(user) {
  const token = getToken();
  const { owner, repo } = githubRepo();
  const queued = db.leads.filter((l) => l.publishQueued && !l.archived);
  const tail = token.length > 4 ? "…" + token.slice(-4) : "";
  return `
    <div class="top">
      <div>
        <h1 class="display">Settings</h1>
        <p class="muted">One business GitHub token. Never commit it. Everyone on the desk pastes the same token once.</p>
      </div>
    </div>
    <div class="card">
      <h3 class="display">Business token</h3>
      <p class="help">Classic PAT, <b>repo</b> scope. Publishes live folders and the shared desk file <code>sitedesk-data/state.json</code>. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic).</p>
      <form id="token-form">
        <label class="field"><span>Personal access token</span>
          <input name="token" type="password" autocomplete="off" placeholder="${token ? "Token saved on this device — paste to replace" : "ghp_…"}"/>
        </label>
        ${token ? `<p class="token-set muted">On this device ${esc(tail)}</p>` : `<p class="warn-text">No token on this device. Jobs will not be shared.</p>`}
        ${user && user.role === "admin" ? `
        <label class="field"><span>Owner (optional)</span>
          <input name="owner" value="${esc(owner)}" placeholder="${DEFAULT_OWNER}"/>
        </label>
        <label class="field"><span>Repo (optional)</span>
          <input name="repo" value="${esc(repo)}" placeholder="${DEFAULT_REPO}"/>
        </label>` : ""}
        <div class="row">
          <button class="btn primary" type="submit">Save token</button>
          <button class="btn danger" type="button" id="clear-token">Clear token</button>
        </div>
      </form>
    </div>
    ${user && user.role === "admin" ? `<div class="card" style="margin-top:12px">
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
    </div>` : ""}`;
}

function bindPage(user) {
  $$("[data-open-lead]").forEach((el) => {
    el.addEventListener("click", () => go("/lead/" + el.dataset.openLead));
  });
  $("[data-open-new]")?.addEventListener("click", () => openAddLead(user, "single"));
  $("[data-open-import]")?.addEventListener("click", () => openAddLead(user, "import"));
  $("[data-open-user]")?.addEventListener("click", () => openNewUser());

  const matchLead = (l, q) => {
    if (!q) return true;
    return [l.businessName, l.contactName, l.phone, l.email, l.address, l.businessType, l.foundOn]
      .join(" ").toLowerCase().includes(q);
  };
  $("#lead-search")?.addEventListener("input", (e) => {
    const q = String(e.target.value || "").trim().toLowerCase();
    const leads = visibleLeads(user).filter((l) => matchLead(l, q));
    const wrap = $("#lead-table-wrap");
    if (!wrap) return;
    wrap.innerHTML = leadTable(leads, user, "No matches.");
    $$("[data-open-lead]").forEach((tr) => {
      tr.addEventListener("click", () => go("/lead/" + tr.dataset.openLead));
    });
  });
  $("#board-search")?.addEventListener("input", (e) => {
    const q = String(e.target.value || "").trim().toLowerCase();
    const wrap = $("#board-wrap");
    if (!wrap) return;
    const leads = visibleLeads(user).filter((l) => matchLead(l, q));
    const cols = BOARD_COLS.map((col) => ({
      ...col,
      items: leads.filter((l) => col.statuses.includes(l.status)),
    }));
    wrap.innerHTML = `<div class="board">${cols.map((col) => `
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
          </button>`).join("") || `<p class="empty" style="padding:12px">None</p>`}
      </section>`).join("")}</div>`;
    $$("[data-open-lead]").forEach((el) => {
      el.addEventListener("click", () => go("/lead/" + el.dataset.openLead));
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


  $("#assign-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const lead = db.leads.find((l) => l.id === route.id);
    const fd = new FormData(e.target);
    const callerId = fd.get("caller") || null;
    const builderId = fd.get("builder") || null;
    lead.assignedCallerId = callerId || null;
    lead.assignedBuilderId = builderId || null;
    if (callerId && !builderId) applyDefaultPair(lead);
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
      const dp = lead.diy?.pages?.find((x) => x.filename === previewFile);
      if (dp) diyPageId = dp.id;
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
    if (lead.buildMode === "diy") serializeDiy(lead);
    else if (ta) applyPaste(lead, ta.value);
    lead.updatedAt = now();
    persist();
    toast("Saved on this device", "ok");
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
    if (e.target.owner) {
      if (owner) localStorage.setItem(OWNER_KEY, owner);
      else localStorage.removeItem(OWNER_KEY);
    }
    if (e.target.repo) {
      if (repo) localStorage.setItem(REPO_KEY, repo);
      else localStorage.removeItem(REPO_KEY);
    }
    toast("Token saved on this device", "ok");
    render();
    pullCloud().catch((err) => toast(err.message || String(err), "bad"));
  });

  $("#clear-token")?.addEventListener("click", () => {
    localStorage.removeItem(TOKEN_KEY);
    toast("Token cleared from this device", "ok");
    render();
  });

  $("#publish-queued")?.addEventListener("click", () => publishQueuedAll(user));


  $$("[data-copy-url]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copyUrl);
        toast("Link copied", "ok");
      } catch {
        prompt("Copy this link", btn.dataset.copyUrl);
      }
    });
  });
  $$("[data-tiny-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const L = db.leads.find((l) => l.id === btn.dataset.tinyEdit);
      if (L) openTinyEdit(L, user);
    });
  });
  $$("[data-republish]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const L = db.leads.find((l) => l.id === btn.dataset.republish);
      if (L) publishLead(L, user);
    });
  });
  $$("[data-default-builder]").forEach((sel) => {
    sel.addEventListener("change", () => {
      const u = db.users.find((x) => x.id === sel.dataset.defaultBuilder);
      if (!u) return;
      u.defaultBuilderId = sel.value || null;
      persist();
      toast("Default pair saved", "ok");
    });
  });
  $("#refresh-sites")?.addEventListener("click", () => refreshGithubSites(user));
  if (route.name === "sites" && getToken() && !githubSiteCache.at && !busy) {
    refreshGithubSites(user);
  }

  $("#connect-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const a = fd.get("a");
    const b = fd.get("b");
    const t = connectPeople(a, b);
    if (t) go("/messages/" + t.id);
  });

  $$("[data-brief-field]").forEach((el) => {
    el.addEventListener("change", () => {
      const L = db.leads.find((l) => l.id === route.id);
      if (!L || !canEditLead(L, user)) return;
      L.brief = hydrateBrief(L.brief);
      L.brief[el.dataset.briefField] = el.value;
      L.updatedAt = now();
      persist();
      const box = $("#zai-prompt");
      if (box) box.textContent = zaiInstructions(L);
    });
  });
  $$("[data-site-shape]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const L = db.leads.find((l) => l.id === route.id);
      if (!L || !canEditLead(L, user)) return;
      L.brief = hydrateBrief(L.brief);
      L.brief.siteShape = btn.dataset.siteShape;
      L.updatedAt = now();
      persist();
      render();
    });
  });
  $("#add-page-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const L = db.leads.find((l) => l.id === route.id);
    if (!L || !canEditLead(L, user)) return;
    addBriefPage(L, new FormData(e.target).get("name"));
    persist();
    render();
  });
  $$("[data-del-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const L = db.leads.find((l) => l.id === route.id);
      if (!L || !canEditLead(L, user)) return;
      removeBriefPage(L, btn.dataset.delPage);
      persist();
      render();
    });
  });
  $$("[data-page-note]").forEach((el) => {
    el.addEventListener("change", () => {
      const L = db.leads.find((l) => l.id === route.id);
      if (!L || !canEditLead(L, user)) return;
      L.brief = hydrateBrief(L.brief);
      const p = L.brief.pages.find((x) => x.id === el.dataset.pageNote);
      if (p) p.note = el.value;
      L.updatedAt = now();
      persist();
      const box = $("#zai-prompt");
      if (box) box.textContent = zaiInstructions(L);
    });
  });
  $$("[data-img-page]").forEach((sel) => {
    sel.addEventListener("change", () => {
      const L = db.leads.find((l) => l.id === route.id);
      if (!L) return;
      const im = (L.images || []).find((x) => x.id === sel.dataset.imgPage);
      if (im) im.pageId = sel.value;
      persist();
      render();
    });
  });
  $$("[data-build-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const L = db.leads.find((l) => l.id === route.id);
      if (!L) return;
      L.buildMode = btn.dataset.buildMode;
      if (L.buildMode === "diy") serializeDiy(L);
      persist();
      render();
    });
  });
  $$("[data-diy-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      diyPageId = btn.dataset.diyPage;
      selectedBlockId = null;
      const L = db.leads.find((l) => l.id === route.id);
      const p = L?.diy?.pages?.find((x) => x.id === diyPageId);
      if (p) previewFile = p.filename;
      render();
    });
  });
  $("#diy-add-page")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const L = db.leads.find((l) => l.id === route.id);
    if (!L) return;
    const page = addBriefPage(L, new FormData(e.target).get("name"));
    if (page) diyPageId = page.id;
    persist();
    render();
  });
  $("[data-diy-rename]")?.addEventListener("click", () => {
    const L = db.leads.find((l) => l.id === route.id);
    if (!L) return;
    syncDiyFromBrief(L);
    const p = (L.diy.pages || []).find((x) => x.id === diyPageId);
    const next = prompt("Page name", p?.name || "");
    if (!next || !String(next).trim()) return;
    L.brief = hydrateBrief(L.brief);
    let bp = L.brief.pages.find((x) => x.id === diyPageId);
    if (!bp && p) bp = L.brief.pages.find((x) => x.name === p.name);
    if (bp) {
      bp.name = String(next).trim();
      L.brief.siteShape = "multi";
    } else addBriefPage(L, next);
    persist();
    render();
  });
  $("[data-diy-del-page]")?.addEventListener("click", () => {
    const L = db.leads.find((l) => l.id === route.id);
    if (!L || !diyPageId) return;
    removeBriefPage(L, diyPageId);
    diyPageId = null;
    persist();
    render();
  });
  $$("[data-add-block]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const L = db.leads.find((l) => l.id === route.id);
      if (!L) return;
      syncDiyFromBrief(L);
      const page = L.diy.pages.find((p) => p.id === diyPageId) || L.diy.pages[0];
      if (!page) return;
      const type = btn.dataset.addBlock;
      const blk = { id: uid(), type };
      if (type === "hero") {
        blk.title = L.businessName || "";
        blk.subtitle = String(L.brief?.whatTheySell || "").trim();
      }
      if (type === "text") blk.text = "";
      if (type === "image") {
        const prefer = (L.images || []).find((im) => im.pageId === page.id) || (L.images || []).find((im) => im.pageId === "all");
        blk.imageId = prefer?.id || "";
      }
      if (type === "gallery") {
        blk.imageIds = (L.images || []).filter((im) => im.pageId === page.id).map((im) => im.id);
      }
      if (type === "html") blk.html = "";
      page.blocks = page.blocks || [];
      page.blocks.push(blk);
      selectedBlockId = blk.id;
      serializeDiy(L);
      persist();
      render();
    });
  });
  $$("[data-sel-block]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.closest(".blk-tools") || e.target.closest("input, textarea, select, button, label")) return;
      selectedBlockId = el.dataset.selBlock;
      render();
    });
  });
  $$("[data-blk-field]").forEach((el) => {
    const apply = () => {
      const L = db.leads.find((l) => l.id === route.id);
      if (!L) return;
      for (const page of L.diy?.pages || []) {
        const blk = (page.blocks || []).find((b) => b.id === el.dataset.blk);
        if (blk) { blk[el.dataset.blkField] = el.value; break; }
      }
      serializeDiy(L);
      persist();
      const fr = $("#preview-frame");
      if (fr) fr.srcdoc = previewDoc(L, previewFile);
    };
    el.addEventListener("change", apply);
    el.addEventListener("input", apply);
  });
  $$("[data-gal-img]").forEach((box) => {
    box.addEventListener("change", () => {
      const L = db.leads.find((l) => l.id === route.id);
      if (!L) return;
      for (const page of L.diy?.pages || []) {
        const blk = (page.blocks || []).find((b) => b.id === box.dataset.blk);
        if (blk) {
          const ids = new Set(blk.imageIds || []);
          if (box.checked) ids.add(box.dataset.galImg);
          else ids.delete(box.dataset.galImg);
          blk.imageIds = [...ids];
          break;
        }
      }
      serializeDiy(L);
      persist();
      const fr = $("#preview-frame");
      if (fr) fr.srcdoc = previewDoc(L, previewFile);
    });
  });
  function moveBlock(L, id, dir) {
    for (const page of L.diy?.pages || []) {
      const arr = page.blocks || [];
      const i = arr.findIndex((b) => b.id === id);
      if (i < 0) continue;
      const j = i + dir;
      if (j < 0 || j >= arr.length) return;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return;
    }
  }
  $$("[data-blk-up]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const L = db.leads.find((l) => l.id === route.id);
      if (!L) return;
      moveBlock(L, btn.dataset.blkUp, -1);
      serializeDiy(L);
      persist();
      render();
    });
  });
  $$("[data-blk-down]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const L = db.leads.find((l) => l.id === route.id);
      if (!L) return;
      moveBlock(L, btn.dataset.blkDown, 1);
      serializeDiy(L);
      persist();
      render();
    });
  });
  $$("[data-blk-del]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const L = db.leads.find((l) => l.id === route.id);
      if (!L) return;
      for (const page of L.diy?.pages || []) {
        page.blocks = (page.blocks || []).filter((b) => b.id !== btn.dataset.blkDel);
      }
      selectedBlockId = null;
      serializeDiy(L);
      persist();
      render();
    });
  });


  $("#compose-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!route.id) return;
    const threadId = e.target.dataset.thread || route.id;
    const thread = db.threads.find((t) => t.id === threadId);
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
    applyDefaultPair(lead);
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
      defaultBuilderId: null,
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

try {
  render();
  boot();
} catch (err) {
  const root = document.getElementById("app");
  if (root) {
    root.innerHTML = `<div class="login"><div class="card login-card"><h1 class="display">SiteDesk</h1><p class="bad-text">${String(err && err.message || err)}</p></div></div>`;
  }
  console.error(err);
}
