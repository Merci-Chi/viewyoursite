# SiteDesk v3

Internal website-production tool. Hosted at
https://viewyoursite.today/sitedesk-v3/ inside the public GitHub Pages repo
Merci-Chi/viewyoursite.

Callers collect a brief and named photos. Builders copy strict instructions into
z.ai (new tab — it will not iframe), paste the multi-file HTML back here, and
SiteDesk publishes a public folder on GitHub Pages. Client sites live as
siblings of this app, e.g.

- Tool: https://viewyoursite.today/sitedesk-v3/
- Live site: https://viewyoursite.today/GoldRushSmokeShop/

Public client sites need no login. Only SiteDesk itself is gated.

This folder is self-contained. Do not change anything else in the repo.
Never commit a GitHub token. SiteDesk does not embed Supabase keys. CSV, JSON,
and GitHub folder import is how leads get in.

Browser data uses localStorage key `sitedesk.v3`. It does not share or migrate
v2 data (`sitedesk.v2`).

## v3 vs v2

v2 had an open Team inbox anyone could post in, generic photo filenames
(logo.png, photo-1.jpg), a short brief copy, and a single index.html paste.
v3 changes the production loop:

- **Messages** are private. Admin connects two people (caller + builder, or
  admin + someone). That creates a 1:1 thread only they can see. Admins can
  always open any thread. Assigning both a caller and a builder on a lead also
  creates a **job thread** for that client (caller, builder, and all admins).
- **Named images.** After upload, rename the label. The file becomes a unique
  kebab-case name per lead (`gold-rush-storefront.jpg`, `menu-board.jpg`). The
  z.ai prompt lists those exact filenames. Image bytes are never sent to z.ai.
  Preview rewrites those filenames to local data URLs. Publish uploads
  `{slug}/{filename}` then every HTML page.
- **Copy instructions for z.ai** is a long, strict prompt: real multi-page
  site, required separate files (index, about, services, gallery, contact),
  relative nav, no fake photos, no invented awards or reviews.
- **Paste / publish multi-file.** Paste `===== FILE: name =====` blocks.
  `lead.pages` stores each file. Publish writes every page plus images to
  `{slug}/`. Public URL is still https://viewyoursite.today/{slug}/.
- **Team.** Admin can add, edit (name/email/role/password), deactivate, and
  delete people. You cannot delete yourself or the last remaining admin.
- **Auto-add leads.** Import `leads.csv` + `lead2.csv` from viewyoursite, or
  pull live site folders from GitHub as Done leads.
- **Lead board** like a production desk: New / Calling / Building / Review /
  Done columns, full lead editor, call-outcome chips, optional-field add modal
  (single + CSV/JSON import).
- **Desk polish.** Activity feed, pin / high priority, duplicate, archive,
  builder checklist.

## Demo logins

Data stays in this browser (localStorage). Create real teammates under Team
after you log in as admin.

| Role    | Email                   | Password    |
|---------|-------------------------|-------------|
| Admin   | admin@sitedesk.local    | admin123    |
| Caller  | caller@sitedesk.local   | caller123   |
| Builder | builder@sitedesk.local  | builder123  |

## Publish flow (admin sets this up once)

Builders never need GitHub. One admin pastes a token on their own device.

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token.
2. Note: SiteDesk publish. Expiration: whatever you want.
3. Scope: check **repo** (full control of private repositories). That is what classic tokens use to write files. You do not need a fine-grained token.
4. Generate the token, copy it once.
5. In SiteDesk, sign in as admin, open Settings. Paste the token. It is stored
   only in this browser under localStorage key sitedesk.githubToken.
6. Optional: override owner/repo (default Merci-Chi/viewyoursite).
7. Builder (or admin) pastes finished HTML (one file or `===== FILE:` blocks)
   on the lead and hits Save / Publish. SiteDesk writes `{slug}/{filename}`
   for every page and photo on branch main via the GitHub Contents API. The
   public URL is https://viewyoursite.today/{slug}/.

If someone publishes on a device with no token, the HTML is still saved locally
and the lead is marked publish queued. Admin, Settings, Publish queued sites
pushes them all.

The token never goes in source, never in the GitHub repo, and never in the
main SiteDesk data blob. If this browser is shared, clear the token in Settings
when you are done.

## Auto-add leads

Admin, Leads → Import:

- **Import from viewyoursite leads.csv** fetches
  https://raw.githubusercontent.com/Merci-Chi/viewyoursite/main/leads.csv
  and `lead2.csv`. Parses `# Name, Address, Phone, Rating, Business Type,
  Hours, Website` (tabs or commas; a `#` index column is fine). Dedupes by
  name + phone. Optional: assign the whole batch to one caller.
- Paste or upload CSV still works the same way.
- **Import live sites from GitHub** uses the admin classic PAT and the
  Contents / git tree API. Lists root folders of Merci-Chi/viewyoursite,
  skips `sitedesk*`, `assets`, and other non-client dirs, and creates a Done
  lead for each folder that has `index.html`, with
  siteUrl https://viewyoursite.today/{folder}/.

The add-lead modal has two tabs:

- **Single lead** — company, phone, email, contact name, website, site age,
  main issue, concerns/objections, notes, found-on. All optional.
- **Import multiple** — paste or upload CSV (`Name, Address, Phone, Rating,
  Business Type, Hours, Website`) or a JSON array of leads. Empty fields stay
  empty. Dedupes by name + phone. Admin can also one-click fetch viewyoursite
  `leads.csv` + `lead2.csv`, or import live GitHub site folders as Done.

The lead page is the main editor (not a tiny form): company + contact in the
header, click-to-call / email / website, inline fields, last-call outcome
chips (Interested, Call Back, Needs More Info, No Answer, Not Interested,
Wrong Number), call log, pair assignment, named photos, z.ai brief, and
delete (admin, with confirm).

## Messages pairing

There is no global team inbox. Anyone-can-post was a bug.

Admin opens **Messages**, picks two people, clicks **Connect**. That is a
private DM. From a lead, admin picks Caller and Builder and clicks **Connect
this pair** — that assigns both and opens (or creates) the job thread for
that client.

Nav says Messages, with an unread badge. Mobile: conversation list, then the
thread.

## Named images

On each lead, caller/admin upload a logo, storefront, and extras. Compress in
browser (max ~1600px). Rename the label; the filename becomes unique kebab-case
in that lead (suffix `-2` on clash). The filename is shown next to the thumb
so you know what z.ai will be told.

On publish they sit next to the HTML (`gold-rush-storefront.jpg`, not
`photo-1.jpg`). If the builder's HTML already references any of those
filenames, SiteDesk does **not** inject a dump-everything gallery. A gallery
of unused photos is injected only when the HTML used none of them.

## z.ai

z.ai sends X-Frame-Options and will not embed. SiteDesk does not iframe it.
Read or copy **Copy instructions for z.ai**, open https://chat.z.ai in a new
tab, build there, then paste the FILE blocks back into the lead for live
preview and publish. Preview is local (iframe srcdoc) with image filenames
rewritten to data URLs.

## Bulk leads

Admin can paste or upload CSV on the Leads page. Header style matches
leads.csv:

    # Name, Address, Phone, Rating, Business Type, Hours, Website

The header line may start with #. One business name per line also works.
Optional: assign the whole batch to one caller. Duplicates (same name + phone)
are skipped.

## Roles

- Admin: lead board, add/edit/archive/delete leads, Messages (all threads +
  Connect), team (add/edit/deactivate/delete), settings (token + queued
  publish), bulk / GitHub import, pair a caller and builder on a lead.
- Caller: assigned leads — edit contact fields, notes, call outcome, photos,
  brief, pin / priority, duplicate, archive, Messages (own threads).
- Builder: lands on Jobs; copy instructions, checklist, paste multi-file
  HTML, preview, publish, Messages (own threads).
