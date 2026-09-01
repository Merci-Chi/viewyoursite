# SiteDesk v4

Internal website-production desk. Hosted at
https://viewyoursite.today/sitedesk-v4/ inside the public GitHub Pages repo
Merci-Chi/viewyoursite.

Callers collect a brief and named photos. Builders use z.ai **or** the DIY
builder, then SiteDesk publishes a public folder on GitHub Pages. Client sites
live as siblings of this app:

- Tool: https://viewyoursite.today/sitedesk-v4/
- Live site: https://viewyoursite.today/{slug}/

Public client sites need no login. Only SiteDesk itself is gated.

This folder is self-contained. Do not change anything else in the repo.
Never commit a GitHub token. There is no Supabase, Firebase, or extra key.
One classic PAT in Settings is enough — the same token that publishes a
client site also writes the shared desk.

Browser cache uses localStorage key `sitedesk.v4`. It does not share or
migrate v3 data (`sitedesk.v3`). Session is `sitedesk.v4.session`. The
token stays in `sitedesk.githubToken` on this device only.

## Shared desk (same as publishing a site)

This is not a public SaaS. The board is files in Merci-Chi/viewyoursite:

- `sitedesk-data/state.json` — users, leads, notes, threads, messages
- `sitedesk-data/photos/{leadId}/{filename}` — named photos

Writes go through the GitHub Contents API (commit to `main`). After a
commit, anyone loading SiteDesk fetches those files:

- https://viewyoursite.today/sitedesk-data/state.json?v=TIMESTAMP
- or https://raw.githubusercontent.com/Merci-Chi/viewyoursite/main/sitedesk-data/state.json?v=TIMESTAMP

GitHub Pages may lag about a minute on the raw/pages URL. SiteDesk
refetches with a cache-bust query every 5 seconds and on window focus.
Devices with the token read via the Contents API (no Pages lag).

localStorage is a cache once a token exists. It is never the source of
truth with a token. Persist PUTs `state.json` (sha, retry on 409).
The UI is optimistic, then the next pull confirms.

**Never put the PAT in `state.json` or any repo file.** The repo is
public. Passwords are SHA-256 hashed before they are written to
`state.json`. Login accepts plaintext (first-device seed) or the hash.

If this phone has no token, a banner says so: jobs will not be stored
only on this phone, and they are not shared. Settings is available to
every role so callers and builders can paste the same business token.

## Job path

Each lead uses a slim stepper:

**Call → Brief → Build → Live → Manage**

- **Call** — airy overview: identity, call, assignment. Intake lives here
  (company, phone, email, contact, website, found-on).
- **Brief** — call-script questions, empty until the caller types. Site
  shape one/multi, page chips they add, per-page notes, photos assigned
  to a page or any/all. Never auto-fills about/services/gallery.
- **Build** — Use z.ai, or Build it here (DIY).
- **Live** — send-to-owner (URL, Copy, mailto/sms, QR) plus tiny edits.
- **Manage** — Sites list only.

Messages stay as messenger. Thread is a small header link, not a sixth
stepper item.

Board and Leads search filters cards. Default pair: a caller’s default
builder auto-fills on new/assigned leads.

## z.ai prompt

Copy instructions include only answered questions, the page list, and
photo-to-page filename rules. If one page / no extra chips: **only
index.html**. If a page has no assigned photo, the prompt does not tell
z.ai to put a gallery there. Empty facts are omitted. Never “none”.

## DIY builder

Left: pages matching brief chips (add/rename/delete). Center: canvas.
Blocks: Hero, Text, Image (this lead’s named photos only), Gallery,
Contact (omit empty fields), Custom HTML.

**How DIY publish works:** SiteDesk serializes the page list to
`lead.pages` plus a shared `styles.css`, copies photo bytes from desk
storage (or the in-memory data URL) into `{slug}/{filename}`, then PUTs
every HTML page + `styles.css` + images through the Contents API to
`{slug}/` on `main`. Public URL is https://viewyoursite.today/{slug}/.

z.ai paste still accepts `===== FILE: name =====` blocks and publishes
the same way.

## Tiny edits (post-launch)

Edit hours, phone, email, or replace one photo without rewriting the
whole site. String-replace previous values in HTML if present; write
`contact.json`; replace `{slug}/{filename}` and the desk photo path.
If local pages are empty, SiteDesk fetches published HTML from GitHub.

## Photos

Phone camera: `accept="image/*" capture="environment"`. After upload,
rename the label. The file becomes a unique kebab-case name per lead.
Bytes go to `sitedesk-data/photos/{leadId}/{filename}`. `dataUrl` is
only an in-memory cache while uploading. Image bytes are never sent to
z.ai.

## Team, pairing, import

- **Messages** are private 1:1 threads. Admin connects two people.
  Assigning both a caller and a builder also creates a job thread.
- **Team** CRUD: add, edit, deactivate, delete. You cannot delete
  yourself or the last remaining admin.
- **Call outcomes** on the lead.
- **Import** CSV, JSON, or live GitHub folders as Done leads.
- Board columns: New / Calling / Building / Review / Done.

## First device / logins

Paste the business token in Settings first. The first device to connect
seeds `state.json` (demo users if nothing is there yet). After that,
Team is the source of people.

| Role    | Email                   | Password    |
|---------|-------------------------|-------------|
| Admin   | admin@sitedesk.local    | admin123    |

Then add real people under Team. Demo caller/builder only exist as
first-device seed.

## Publish setup (once)

Everyone pastes the **same** classic PAT on each device.

1. GitHub → Settings → Developer settings → Personal access tokens →
   Tokens (classic) → Generate new token.
2. Note: SiteDesk. Scope: **repo**.
3. In SiteDesk, open Settings (any role). Paste the token. It is stored
   only in this browser under `sitedesk.githubToken`.
4. Optional (admin): override owner/repo (default Merci-Chi/viewyoursite).
5. Publish writes `{slug}/{filename}` for every page and photo on `main`.

If this device has no token, publish queues for an admin, and the desk
is not shared.

## Colors

`--bg #11110f`, `--bg-2 #191916`, `--bg-3 #22221c`, `--line #2e2e26`,
`--ink #f4f1e8`, `--muted #9a9586`, `--paper #efe7d3`, `--paper-ink #1a1914`,
`--ok #b7d59a`, `--warn #e2c07a`, `--bad #e08b73`, `--accent #efe7d3`.
Fraunces + IBM Plex. No new palettes.

## Files

- `index.html` — shell (`app.css?v=4`, `app.js?v=4`)
- `app.css` — desk styles
- `app.js` — the app
- `README.md` — this file
