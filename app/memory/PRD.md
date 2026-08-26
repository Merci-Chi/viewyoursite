# Nest — Local Website Studio (Wix-like builder)

## Original Problem Statement (paraphrased)
Build a Wix-style, free-canvas website builder. No sign-up. Landing page → Sites dashboard → Editor with:
- Free canvas: drag & resize elements anywhere with soft guides (never blocking).
- Floating UI (no big sidebars): tiny top bar, small right inspector, popups & popovers for the rest.
- No emojis anywhere.
- Right-click context menu on any element.
- Inline text selection editing with a floating mini toolbar.
- Every element type via a floating `+` button: heading, text, image, video, button, form, accordion, shape, line, audio, calendar, chart, quote, code (HTML), markdown, embed, social links, search field, container.
- Pages: Main Navigation, Not Linked, Home. Per-page settings for title, nav label, slug, QR, password, SEO, header/body/footer code injection, show/hide header & footer, canvas height, duplicate, set as home, delete.
- Add page variants: Blank, Link (external), Dropdown.
- Media Gallery: upload images/videos/audio (base64, stored offline in localStorage) and insert into canvas.
- Section/page backgrounds: solid, gradient, image, URL.
- Auto-save to browser + one-click HTML export (single self-contained file).
- HTML import: paste HTML → new site with editable code block.
- Site dashboard listing all sites w/ rename, duplicate, export, delete, faction (custom brand name).
- Responsive preview: desktop, tablet, mobile, full-site iframe.

## Architecture
- Pure frontend app (React 19, react-router-dom, Zustand for state).
- Persistence: `localStorage` key `nest.sites.v1` (debounced saves, 250ms).
- No backend usage — FastAPI template left untouched.
- Design: cream paper (`#fefaf5`), ink text (`#1a1512`), orange accent (`#ff5c1a`); Fraunces + DM Sans + JetBrains Mono via Google Fonts.

## Files
- Router: `frontend/src/App.js`
- Pages: `Landing.jsx`, `Sites.jsx`, `Editor.jsx`
- Store: `lib/store.js` (zustand, undo/redo history per site, clipboard, gallery)
- Factory: `lib/factory.js` (site/page/element defaults for 19 element types)
- Exporter: `lib/exporter.js` (`exportSiteHTML`, `downloadHTML`)
- Editor: `Canvas.jsx`, `CanvasElement.jsx` (drag/resize/rotate/guides), `ElementRenderer.jsx`,
  `TopBar.jsx`, `AddMenu.jsx`, `Inspector.jsx`, `ContextMenu.jsx`, `InlineTextToolbar.jsx`,
  `PagesPanel.jsx`, `PageSettingsDialog.jsx`, `MediaGallery.jsx`, `SiteSettings.jsx`,
  `PreviewOverlay.jsx`, `ExportDialog.jsx`
- Fonts: `frontend/public/index.html`
- Global styles: `frontend/src/index.css`

## Implemented (2026-02-26)
- Landing page with Get Started → creates first site & jumps to editor.
- Sites dashboard: cards with duplicate/rename/export/delete, empty state, HTML import.
- Editor: free-canvas drag/resize/rotate; 8 handles + rotate handle; snap to 4px grid; center guides.
- 19 element types with type-specific inspectors.
- Right-click context menu (Copy/Paste/Duplicate/Copy style/Paste style/Bring to front/Send to back/Lock/Hide/Delete).
- Inline text editing with floating dark toolbar (font, size, B/I/U/S, color, highlight, alignment, lists, link).
- Pages panel with Main Nav / Not Linked groups; add Blank/Link/Dropdown pages; move between groups; set home; delete; duplicate; page preview.
- Page settings dialog: General / SEO / Security (password) / Code injections / QR code.
- Media Gallery: upload images/videos/audio to base64, insert anywhere.
- Site Settings: name/faction/favicon/site bg; theme fonts & colors; header/footer show/height/bg.
- Auto-save on every mutation (debounced 250ms).
- Undo/Redo with keyboard shortcuts (Cmd/Ctrl+Z, Cmd/Ctrl+Y).
- Responsive preview (desktop/tablet/mobile viewport widths) + full iframe preview.
- HTML export: single self-contained document with theme fonts, per-page sections, click-nav script, per-page password prompt.
- HTML import: paste raw HTML → new site with editable code element.
- Global keyboard shortcuts: delete/backspace, copy/paste/duplicate, undo/redo, escape closes everything.
- 100% pass on frontend E2E testing agent run.

## Iteration 2 — user feedback fixes (2026-02-26)
- Removed all color: palette reduced to black / white / transparent only. No orange, no red destructive colors.
- Removed "Nest" brand — app-agnostic wording ("Studio" wordmark only).
- File uploads FROM DEVICE inside the Inspector for image / video / audio (small "↑" pill next to URL input opens the OS file picker; also auto-adds to gallery).
- Editable header & footer inline in the canvas via new **scope pills** (Page / Header / Footer) in the top bar. Store is now scope-aware: `updateElement`, `removeElements`, `duplicateElements`, `bringToFront`, `sendToBack`, `alignSelection` all locate the correct section automatically. `addElement` inserts into the current scope; new sites default to "main".
- Cleaner top bar: 3 grouped pills (undo/back, scope+preview, panels+share+export). Zoom + grid tucked into a popover.
- Cleaner preview / export: removed the auto-inserted `<nav>` bar. Exported HTML now shows only what the user built. Pages are wrapped in a `max-width` container so they FIT any target device.
- **Preview overlay**: built-in device switcher (desktop/tablet/mobile) with auto-scaling iframe so the target device layout is always visible on the current screen without scrolling.
- **Section backgrounds**: the `container` element remains, and page backgrounds now support color / gradient / image / video via the existing background picker.
- **Multi-select align toolbar** (`AlignToolbar.jsx`): appears when 2+ elements are selected. Buttons: align L/H-center/R, T/V-center/B, distribute H/V.
- **Layers panel** (`LayersPanel.jsx`): tree of Header / Page / Footer with per-element visibility & lock toggles + click-to-select.
- **Publish preview link**: backend `POST /api/share` stores the site JSON in Mongo; `GET /api/share/:id` returns it. Frontend route `/share/:id` renders the site read-only in a full-screen iframe. `ShareDialog` component published + copy-link UI.
- **Downloadable source zip**: backend `GET /api/source-zip` streams a zip of `/app` (excluding `node_modules`, `.git`, build dirs, files > 5MB). Sites dashboard has a "Source .zip" button linking to this endpoint. Ready to drop into a GitHub repo.
- Localstorage key namespaced to `studio.sites.v1`.
- All destructive UI buttons now render in monochrome black/white.
- Larger default heading size so first-time text doesn't clip.

Testing: iteration_2 — backend 100% (4/4), frontend ~95% functional pass with only cosmetic color-token leaks & default heading overflow flagged (both subsequently fixed).

## Backlog / Nice-to-haves
- P1: Data-testid on each page-row action & page-add title/URL inputs (testing agent request).
- P1: Small right-side offset for Inspector so it doesn't overlap newly added elements.
- P2: Element grouping (multi-select group/ungroup), align-multiple, distribute.
- P2: Global color palette + reusable "saved block" library.
- P2: Version history snapshots (right now undo is in-memory only).
- P2: Header/Footer element editing directly in canvas (currently only via Site Settings + JSON model).
- P3: PWA export mode, native drag from Media Gallery to canvas position.
