import { create } from "zustand";
import { newSite, newPage, newElement, uid } from "./factory";

const LS_KEY = "studio.sites.v1";

function loadAll() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
}
function saveAll(all) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(all)); } catch (e) { console.warn("Save failed:", e); }
}

let saveTimer = null;
function scheduleSave(getSites) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveAll(getSites()), 250);
}

const history = { past: [], future: [], siteId: null };
function pushHistory(currentSite) {
  if (history.siteId !== currentSite.id) { history.past = []; history.future = []; history.siteId = currentSite.id; }
  history.past.push(JSON.stringify(currentSite));
  if (history.past.length > 80) history.past.shift();
  history.future = [];
}

// Helper: find which scope contains an element id
function locate(site, id) {
  if (!site) return null;
  const page = site.pages.find((p) => p.id === site.currentPageId);
  if (page?.elements?.find((e) => e.id === id)) return { scope: "main", page };
  if (site.header?.elements?.find((e) => e.id === id)) return { scope: "header" };
  if (site.footer?.elements?.find((e) => e.id === id)) return { scope: "footer" };
  return null;
}

function updateScopeElements(site, scope, mapper) {
  if (scope === "main") {
    return { ...site, pages: site.pages.map((p) => p.id === site.currentPageId ? { ...p, elements: mapper(p.elements) } : p) };
  }
  if (scope === "header") return { ...site, header: { ...site.header, elements: mapper(site.header.elements) } };
  if (scope === "footer") return { ...site, footer: { ...site.footer, elements: mapper(site.footer.elements) } };
  return site;
}

export const useStore = create((set, get) => ({
  sites: loadAll(),
  activeSiteId: null,
  selectedIds: [],
  clipboard: null,
  previewMode: null,
  copiedStyle: null,
  contextMenu: null,
  openPanel: null,
  panelData: null,
  zoom: 1,
  showGrid: false,
  showGuides: true,
  snap: true,
  editingScope: "main", // 'main' | 'header' | 'footer' — informational focus

  createSite(name) {
    const s = newSite(name || "Untitled site");
    set((st) => { const sites = { ...st.sites, [s.id]: s }; scheduleSave(() => sites); return { sites }; });
    return s.id;
  },
  deleteSite(id) {
    set((st) => { const sites = { ...st.sites }; delete sites[id]; scheduleSave(() => sites); return { sites }; });
  },
  renameSite(id, name) { get().updateSite(id, (s) => ({ ...s, name })); },
  setSiteFaction(id, faction) { get().updateSite(id, (s) => ({ ...s, faction })); },
  duplicateSite(id) {
    const src = get().sites[id]; if (!src) return null;
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = uid("site"); copy.name = src.name + " copy"; copy.createdAt = Date.now(); copy.updatedAt = Date.now();
    set((st) => { const sites = { ...st.sites, [copy.id]: copy }; scheduleSave(() => sites); return { sites }; });
    return copy.id;
  },
  setActiveSite(id) { set({ activeSiteId: id, selectedIds: [], editingScope: "main" }); history.siteId = id; history.past = []; history.future = []; },
  updateSite(id, updater, opts = {}) {
    set((st) => {
      const s = st.sites[id]; if (!s) return {};
      if (opts.history !== false) pushHistory(s);
      const next = updater(s);
      const sites = { ...st.sites, [id]: { ...next, updatedAt: Date.now() } };
      scheduleSave(() => sites);
      return { sites };
    });
  },

  // Pages
  addPage(pg = {}) {
    const { activeSiteId } = get(); const p = newPage(pg);
    get().updateSite(activeSiteId, (s) => ({ ...s, pages: [...s.pages, p], currentPageId: p.id }));
    return p.id;
  },
  setCurrentPage(pageId) {
    const { activeSiteId } = get();
    get().updateSite(activeSiteId, (s) => ({ ...s, currentPageId: pageId }), { history: false });
    set({ selectedIds: [] });
  },
  updatePage(pageId, updater, opts) {
    const { activeSiteId } = get();
    get().updateSite(activeSiteId, (s) => ({ ...s, pages: s.pages.map((p) => (p.id === pageId ? updater(p) : p)) }), opts);
  },
  deletePage(pageId) {
    const { activeSiteId } = get();
    get().updateSite(activeSiteId, (s) => {
      const pages = s.pages.filter((p) => p.id !== pageId);
      if (pages.length === 0) pages.push(newPage({ title: "Home", isHome: true, slug: "home", location: "main" }));
      const cur = s.currentPageId === pageId ? pages[0].id : s.currentPageId;
      if (!pages.some((p) => p.isHome)) pages[0].isHome = true;
      return { ...s, pages, currentPageId: cur };
    });
  },
  duplicatePage(pageId) {
    const { activeSiteId } = get();
    get().updateSite(activeSiteId, (s) => {
      const src = s.pages.find((p) => p.id === pageId); if (!src) return s;
      const copy = JSON.parse(JSON.stringify(src));
      copy.id = uid("pg"); copy.title = src.title + " copy"; copy.slug = src.slug + "-copy"; copy.isHome = false;
      copy.elements = copy.elements.map((e) => ({ ...e, id: uid("el") }));
      return { ...s, pages: [...s.pages, copy] };
    });
  },
  setPageAsHome(pageId) {
    const { activeSiteId } = get();
    get().updateSite(activeSiteId, (s) => ({ ...s, pages: s.pages.map((p) => ({ ...p, isHome: p.id === pageId })) }));
  },
  movePageLocation(pageId, location) { get().updatePage(pageId, (p) => ({ ...p, location })); },

  // Scope-aware element ops (scope defaults to editingScope)
  addElement(type, x, y, scope) {
    const { activeSiteId } = get();
    const sc = scope || get().editingScope || "main";
    const el = newElement(type, x ?? 100, y ?? 100);
    get().updateSite(activeSiteId, (s) => updateScopeElements(s, sc, (list) => [...list, el]));
    set({ selectedIds: [el.id] });
    return el.id;
  },
  updateElement(elId, updater, opts) {
    const { activeSiteId, sites } = get();
    const loc = locate(sites[activeSiteId], elId); if (!loc) return;
    get().updateSite(activeSiteId, (s) => updateScopeElements(s, loc.scope, (list) => list.map((e) => e.id === elId ? { ...e, ...updater(e) } : e)), opts);
  },
  updateElementProps(elId, patch) { get().updateElement(elId, (e) => ({ props: { ...e.props, ...patch } })); },
  removeElements(ids) {
    const { activeSiteId, sites } = get();
    const site = sites[activeSiteId]; if (!site) return;
    // Group ids by scope
    const byScope = { main: [], header: [], footer: [] };
    ids.forEach((id) => { const l = locate(site, id); if (l) byScope[l.scope].push(id); });
    get().updateSite(activeSiteId, (s) => {
      let next = s;
      Object.entries(byScope).forEach(([sc, arr]) => { if (arr.length) next = updateScopeElements(next, sc, (list) => list.filter((e) => !arr.includes(e.id))); });
      return next;
    });
    set({ selectedIds: [] });
  },
  duplicateElements(ids) {
    const { activeSiteId, sites } = get();
    const site = sites[activeSiteId]; if (!site) return;
    const newIds = [];
    const byScope = { main: [], header: [], footer: [] };
    ids.forEach((id) => { const l = locate(site, id); if (l) byScope[l.scope].push(id); });
    get().updateSite(activeSiteId, (s) => {
      let next = s;
      Object.entries(byScope).forEach(([sc, arr]) => {
        if (!arr.length) return;
        next = updateScopeElements(next, sc, (list) => {
          const cloned = list.filter((e) => arr.includes(e.id)).map((e) => { const c = JSON.parse(JSON.stringify(e)); c.id = uid("el"); c.x += 24; c.y += 24; newIds.push(c.id); return c; });
          return [...list, ...cloned];
        });
      });
      return next;
    });
    set({ selectedIds: newIds });
  },
  bringToFront(elId) {
    const { activeSiteId, sites } = get();
    const loc = locate(sites[activeSiteId], elId); if (!loc) return;
    get().updateSite(activeSiteId, (s) => updateScopeElements(s, loc.scope, (list) => {
      const maxZ = Math.max(0, ...list.map((e) => e.zIndex || 0));
      return list.map((e) => e.id === elId ? { ...e, zIndex: maxZ + 1 } : e);
    }));
  },
  sendToBack(elId) {
    const { activeSiteId, sites } = get();
    const loc = locate(sites[activeSiteId], elId); if (!loc) return;
    get().updateSite(activeSiteId, (s) => updateScopeElements(s, loc.scope, (list) => {
      const minZ = Math.min(0, ...list.map((e) => e.zIndex || 0));
      return list.map((e) => e.id === elId ? { ...e, zIndex: minZ - 1 } : e);
    }));
  },
  // Multi-element align
  alignSelection(mode) {
    const { activeSiteId, sites, selectedIds } = get();
    const site = sites[activeSiteId]; if (!site || selectedIds.length < 2) return;
    // For each selected element by scope, align within its scope
    const groups = { main: [], header: [], footer: [] };
    selectedIds.forEach((id) => { const l = locate(site, id); if (l) groups[l.scope].push(id); });
    get().updateSite(activeSiteId, (s) => {
      let next = s;
      Object.entries(groups).forEach(([sc, ids]) => {
        if (ids.length < 2) return;
        next = updateScopeElements(next, sc, (list) => {
          const sel = list.filter((e) => ids.includes(e.id));
          const minX = Math.min(...sel.map((e) => e.x));
          const maxX = Math.max(...sel.map((e) => e.x + e.width));
          const minY = Math.min(...sel.map((e) => e.y));
          const maxY = Math.max(...sel.map((e) => e.y + e.height));
          const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
          const transform = (e) => {
            switch (mode) {
              case "left": return { ...e, x: minX };
              case "right": return { ...e, x: maxX - e.width };
              case "hcenter": return { ...e, x: cx - e.width / 2 };
              case "top": return { ...e, y: minY };
              case "bottom": return { ...e, y: maxY - e.height };
              case "vcenter": return { ...e, y: cy - e.height / 2 };
              default: return e;
            }
          };
          return list.map((e) => ids.includes(e.id) ? transform(e) : e);
        });
      });
      // Distribute
      if (mode === "distH" || mode === "distV") {
        Object.entries(groups).forEach(([sc, ids]) => {
          if (ids.length < 3) return;
          next = updateScopeElements(next, sc, (list) => {
            const sel = list.filter((e) => ids.includes(e.id)).sort((a, b) => mode === "distH" ? a.x - b.x : a.y - b.y);
            const first = sel[0], last = sel[sel.length - 1];
            const total = mode === "distH" ? (last.x - first.x) : (last.y - first.y);
            const step = total / (sel.length - 1);
            return list.map((e) => {
              const i = sel.findIndex((x) => x.id === e.id);
              if (i <= 0 || i >= sel.length - 1) return e;
              return mode === "distH" ? { ...e, x: first.x + step * i } : { ...e, y: first.y + step * i };
            });
          });
        });
      }
      return next;
    });
  },

  // Selection
  select(ids, additive = false) {
    set((st) => ({ selectedIds: additive ? Array.from(new Set([...st.selectedIds, ...ids])) : ids }));
    // Auto-set editing scope to first selected's scope
    const site = get().sites[get().activeSiteId];
    if (site && ids.length) { const loc = locate(site, ids[0]); if (loc) set({ editingScope: loc.scope }); }
  },
  clearSelection() { set({ selectedIds: [] }); },
  setEditingScope(scope) { set({ editingScope: scope, selectedIds: [] }); },

  copySelection() {
    const { activeSiteId, sites, selectedIds } = get();
    const site = sites[activeSiteId]; if (!site) return;
    const items = selectedIds.map((id) => {
      const loc = locate(site, id); if (!loc) return null;
      const list = loc.scope === "main" ? loc.page.elements : loc.scope === "header" ? site.header.elements : site.footer.elements;
      return list.find((e) => e.id === id);
    }).filter(Boolean);
    set({ clipboard: JSON.stringify(items) });
  },
  pasteClipboard() {
    const { clipboard, activeSiteId } = get();
    if (!clipboard) return;
    const els = JSON.parse(clipboard);
    const scope = get().editingScope || "main";
    const newIds = [];
    get().updateSite(activeSiteId, (s) => updateScopeElements(s, scope, (list) => {
      const cloned = els.map((e) => { const c = { ...e, id: uid("el"), x: (e.x || 0) + 24, y: (e.y || 0) + 24 }; newIds.push(c.id); return c; });
      return [...list, ...cloned];
    }));
    set({ selectedIds: newIds });
  },

  undo() {
    const { activeSiteId, sites } = get();
    if (history.siteId !== activeSiteId || history.past.length === 0) return;
    const s = sites[activeSiteId];
    const prev = history.past.pop();
    history.future.push(JSON.stringify(s));
    const parsed = JSON.parse(prev);
    set((st) => { const next = { ...st.sites, [activeSiteId]: parsed }; scheduleSave(() => next); return { sites: next }; });
  },
  redo() {
    const { activeSiteId, sites } = get();
    if (history.siteId !== activeSiteId || history.future.length === 0) return;
    const s = sites[activeSiteId];
    const nxt = history.future.pop();
    history.past.push(JSON.stringify(s));
    const parsed = JSON.parse(nxt);
    set((st) => { const next = { ...st.sites, [activeSiteId]: parsed }; scheduleSave(() => next); return { sites: next }; });
  },

  openPanelFn(name, data = null) { set({ openPanel: name, panelData: data }); },
  closePanel() { set({ openPanel: null, panelData: null }); },
  setContextMenu(cm) { set({ contextMenu: cm }); },
  setPreview(mode) { set({ previewMode: mode }); },
  setZoom(z) { set({ zoom: Math.max(0.25, Math.min(3, z)) }); },
  toggleGrid() { set((st) => ({ showGrid: !st.showGrid })); },
  toggleGuides() { set((st) => ({ showGuides: !st.showGuides })); },
  toggleSnap() { set((st) => ({ snap: !st.snap })); },
  copyStyle(elId) {
    const { activeSiteId, sites } = get();
    const site = sites[activeSiteId]; if (!site) return;
    const loc = locate(site, elId); if (!loc) return;
    const list = loc.scope === "main" ? loc.page.elements : loc.scope === "header" ? site.header.elements : site.footer.elements;
    const el = list.find((e) => e.id === elId); if (!el) return;
    set({ copiedStyle: { type: el.type, props: el.props, style: el.style } });
  },
  pasteStyle(elId) {
    const { copiedStyle } = get(); if (!copiedStyle) return;
    get().updateElement(elId, (e) => ({ props: { ...e.props, ...copiedStyle.props }, style: { ...e.style, ...copiedStyle.style } }));
  },

  addToGallery(item) {
    const { activeSiteId } = get();
    get().updateSite(activeSiteId, (s) => ({ ...s, gallery: [{ ...item, id: uid("g"), createdAt: Date.now() }, ...(s.gallery || [])] }), { history: false });
  },
  removeFromGallery(id) {
    const { activeSiteId } = get();
    get().updateSite(activeSiteId, (s) => ({ ...s, gallery: (s.gallery || []).filter((g) => g.id !== id) }), { history: false });
  },

  // Element scope lookup
  getElementScope(id) { const s = get().sites[get().activeSiteId]; return locate(s, id)?.scope || "main"; },
}));

export function useActiveSite() { return useStore((s) => s.sites[s.activeSiteId] || null); }
export function useCurrentPage() {
  return useStore((s) => {
    const site = s.sites[s.activeSiteId]; if (!site) return null;
    return site.pages.find((p) => p.id === site.currentPageId) || site.pages[0] || null;
  });
}
