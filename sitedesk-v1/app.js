
const KEY = "sitedesk.v1";
const ZAI = "https://chat.z.ai";

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
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

function load() {
  const raw = localStorage.getItem(KEY);
  if (raw) return JSON.parse(raw);
  const data = seed();
  save(data);
  return data;
}
function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function seed() {
  const admin = { id: uid(), name: "Admin", email: "admin@sitedesk.local", password: "admin123", role: "admin", active: true };
  const caller = { id: uid(), name: "Sam Caller", email: "caller@sitedesk.local", password: "caller123", role: "caller", active: true };
  const builder = { id: uid(), name: "Bee Builder", email: "builder@sitedesk.local", password: "builder123", role: "builder", active: true };
  const t = now();
  const l1 = makeLead({ businessName: "Gold Rush Smoke Shop", phone: "555-0101", email: "gold@example.com", assignedCallerId: caller.id, status: "contacted", createdAt: t - 86400000 * 3 });
  const l2 = makeLead({ businessName: "AJ Landscaping", phone: "555-0102", email: "aj@example.com", assignedCallerId: caller.id, assignedBuilderId: builder.id, status: "building", createdAt: t - 86400000 * 6 });
  const l3 = makeLead({ businessName: "Premier Tax", phone: "555-0103", email: "tax@example.com", status: "new", createdAt: t - 3600000 });
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
  l2.siteUrl = "";
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
    session: null,
  };
}

function makeLead(partial) {
  return {
    id: uid(),
    businessName: "",
    phone: "",
    email: "",
    notes: "",
    status: "new",
    assignedCallerId: null,
    assignedBuilderId: null,
    siteUrl: "",
    brief: emptyBrief(),
    createdAt: now(),
    updatedAt: now(),
    ...partial,
  };
}
function emptyBrief() {
  return { businessName: "", contact: "", whatTheySell: "", pagesWanted: "", brandColors: "", exampleSites: "", extraNotes: "", ready: false };
}

let db = load();
let route = parseHash();

function currentUser() {
  return db.users.find((u) => u.id === db.session) || null;
}
function userById(id) {
  return db.users.find((u) => u.id === id);
}
function nameOf(id) {
  return userById(id)?.name || "—";
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

function persist() {
  save(db);
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

function pillClass(status) {
  if (status === "done") return "ok";
  if (status === "review" || status === "brief_ready") return "warn";
  if (status === "building" || status === "assigned_builder") return "hot";
  return "";
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
  root.innerHTML = shell(user, page(user));
  bindShell(user);
}

function homeFor(user) {
  if (user.role === "builder") return "/jobs";
  return "/board";
}

function loginView() {
  return `
    <div class="login">
      <form class="card login-card" id="login-form">
        <h1 class="display">SiteDesk</h1>
        <p class="muted">Internal tool. Admin, caller, builder.</p>
        <label class="field"><span>Email</span><input name="email" type="email" required autocomplete="username"/></label>
        <label class="field"><span>Password</span><input name="password" type="password" required autocomplete="current-password"/></label>
        <div class="row"><button class="btn primary" type="submit">Sign in</button></div>
        <p class="hint">Demo: admin@sitedesk.local / admin123 · caller@sitedesk.local / caller123 · builder@sitedesk.local / builder123</p>
        <p id="login-err" class="hint" style="color:var(--bad)"></p>
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
  if (user.role === "admin") {
    return [
      ["/board", "Board"],
      ["/leads", "Leads"],
      ["/users", "Team"],
    ];
  }
  if (user.role === "caller") {
    return [
      ["/board", "My leads"],
      ["/leads", "All mine"],
    ];
  }
  return [["/jobs", "My jobs"]];
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
          <button class="btn ghost" id="logout" style="margin-top:10px">Log out</button>
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
  if (route.name === "users" && user.role === "admin") return usersPage(user);
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
  const recent = leads.slice(0, 8);
  return `
    <div class="top">
      <div>
        <h1 class="display">${user.role === "admin" ? "Board" : "My leads"}</h1>
        <p class="muted">Leads in, brief out, site back.</p>
      </div>
      ${user.role !== "builder" ? `<button class="btn primary" data-open-new>New lead</button>` : ""}
    </div>
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
      ${user.role !== "builder" ? `<button class="btn primary" data-open-new>New lead</button>` : ""}
    </div>
    <div class="card">${leadTable(leads, user, "No leads yet.")}</div>`;
}

function jobsPage(user) {
  const jobs = visibleLeads(user);
  return `
    <div class="top">
      <div>
        <h1 class="display">Build jobs</h1>
        <p class="muted">Briefs from callers. Build in z.ai, paste the URL back.</p>
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
        ${leads.map((l) => `
          <tr class="clickable" data-open-lead="${l.id}">
            <td><b>${esc(l.businessName)}</b><div class="muted">${esc(l.phone)}</div></td>
            <td><span class="pill ${pillClass(l.status)}">${STATUS_LABEL[l.status]}</span></td>
            <td>${esc(nameOf(l.assignedCallerId))}</td>
            <td>${esc(nameOf(l.assignedBuilderId))}</td>
            <td class="muted">${fmt(l.updatedAt)}</td>
          </tr>`).join("")}
      </tbody>
    </table>`;
}

function callers() { return db.users.filter((u) => u.role === "caller" && u.active !== false); }
function builders() { return db.users.filter((u) => u.role === "builder" && u.active !== false); }

function leadPage(user, id) {
  const lead = db.leads.find((l) => l.id === id);
  if (!lead || !canSee(lead, user)) return `<p>Lead not found.</p>`;
  const notes = db.notes.filter((n) => n.leadId === lead.id).sort((a, b) => b.createdAt - a.createdAt);
  const hist = db.history.filter((h) => h.leadId === lead.id);
  const b = lead.brief || emptyBrief();
  const showZai = user.role === "builder" || user.role === "admin";
  return `
    <div class="top">
      <div>
        <p class="muted"><a href="#/${user.role === "builder" ? "jobs" : "leads"}">Back</a></p>
        <h1 class="display">${esc(lead.businessName)}</h1>
        <p><span class="pill ${pillClass(lead.status)}">${STATUS_LABEL[lead.status]}</span></p>
      </div>
      <div class="row">${actionsFor(lead, user)}</div>
    </div>
    <div class="split">
      <div>
        <div class="card">
          <h3 class="display">Lead</h3>
          <p>${esc(lead.phone)} · ${esc(lead.email) || "no email"}</p>
          ${lead.notes ? `<p class="muted">${esc(lead.notes)}</p>` : ""}
          ${user.role === "admin" ? assignForm(lead) : `<p class="muted">Caller ${esc(nameOf(lead.assignedCallerId))} · Builder ${esc(nameOf(lead.assignedBuilderId))}</p>`}
        </div>
        <div class="card" style="margin-top:12px">
          <h3 class="display">Brief</h3>
          ${user.role === "builder" ? briefRead(b) : briefForm(b)}
          <div class="row" style="margin-top:8px">
            <button class="btn" data-copy-brief>Copy brief for z.ai</button>
            <a class="btn" href="${ZAI}" target="_blank" rel="noopener">Open z.ai</a>
          </div>
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
        ${showZai ? zaiPanel(lead) : ""}
        <div class="card" style="margin-top:${showZai ? "12px" : "0"}">
          <h3 class="display">Site URL</h3>
          <form id="url-form">
            <input name="url" type="url" placeholder="https://…" value="${esc(lead.siteUrl)}"/>
            <div class="row" style="margin-top:8px"><button class="btn primary" type="submit">Save URL</button></div>
          </form>
          ${lead.siteUrl ? `<p style="margin-top:8px"><a href="${esc(lead.siteUrl)}" target="_blank" rel="noopener">${esc(lead.siteUrl)}</a></p>` : ""}
        </div>
        <div class="card" style="margin-top:12px">
          <h3 class="display">History</h3>
          <ul class="history">
            ${hist.map((h) => `<li>${fmt(h.at)} — ${esc(nameOf(h.by))} · ${STATUS_LABEL[h.from] || h.from} → ${STATUS_LABEL[h.to]} ${h.note ? "· " + esc(h.note) : ""}</li>`).join("") || "<li>No history</li>"}
          </ul>
        </div>
      </div>
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
  const f = (name, label, extra = "") =>
    `<label class="field"><span>${label}</span><${extra.includes("ta") ? "textarea" : "input"} name="${name}" ${extra}>${extra.includes("ta") ? esc(b[name]) : ""}</${extra.includes("ta") ? "textarea" : "input"}></label>`;
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

function zaiPanel(lead) {
  return `
    <div class="card">
      <h3 class="display">z.ai workspace</h3>
      <p class="muted">If the embed is blocked, use Open z.ai + copy brief.</p>
      <div class="iframe-wrap">
        <iframe src="${ZAI}" title="z.ai" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"></iframe>
      </div>
    </div>`;
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
        <thead><tr><th>Person</th><th>Role</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function bindPage(user) {
  $$("[data-open-lead]").forEach((tr) => {
    tr.addEventListener("click", () => go("/lead/" + tr.dataset.openLead));
  });
  $("[data-open-new]")?.addEventListener("click", () => openNewLead(user));
  $("[data-open-user]")?.addEventListener("click", () => openNewUser());
  $$("[data-status-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lead = db.leads.find((l) => l.id === route.id);
      if (!lead) return;
      const to = btn.dataset.statusAction;
      if (to === "assigned_builder" && !lead.assignedBuilderId) {
        alert("Assign a builder first.");
        return;
      }
      if (to === "assigned_caller" && !lead.assignedCallerId) {
        alert("Assign a caller first.");
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
    render();
  });
  $("#url-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const lead = db.leads.find((l) => l.id === route.id);
    lead.siteUrl = String(new FormData(e.target).get("url") || "").trim();
    lead.updatedAt = now();
    persist();
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
}

function briefText(lead) {
  const b = lead?.brief || emptyBrief();
  return `Build a website in z.ai for this client.

Business: ${b.businessName || lead.businessName}
Contact: ${b.contact || lead.phone + " " + lead.email}
Phone: ${lead.phone}
Email: ${lead.email}

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
${db.notes.filter((n) => n.leadId === lead.id).map((n) => "- " + n.text).join("\n")}
`;
}

function modal(html) {
  const wrap = document.createElement("div");
  wrap.className = "modal-back";
  wrap.innerHTML = `<div class="card modal">${html}</div>`;
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
      alert("That email already exists.");
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

render();
