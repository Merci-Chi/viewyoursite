# SiteDesk

Internal website-production tool for the team. Hosted at
https://viewyoursite.today/sitedesk/ inside the public GitHub Pages repo
Merci-Chi/viewyoursite.

Callers collect a brief and photos. Builders make the site in z.ai, paste the
HTML here, and SiteDesk publishes a new public folder on GitHub Pages.
Client sites live as siblings of this app, e.g.

- Tool: https://viewyoursite.today/sitedesk/
- Live site: https://viewyoursite.today/GoldRushSmokeShop/

Public client sites need no login. Only SiteDesk itself is gated.

This folder is self-contained. Do not change anything else in the repo.
Never commit a GitHub token.

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
7. Optional: override owner/repo (default Merci-Chi/viewyoursite).
8. Builder (or admin) pastes finished HTML on the lead and hits Save / Publish.
   SiteDesk writes {slug}/index.html (and photos) on branch main via the
   GitHub Contents API. The public URL is https://viewyoursite.today/{slug}/.

If someone publishes on a device with no token, the HTML is still saved locally
and the lead is marked publish queued. Admin, Settings, Publish queued sites
pushes them all.

The token never goes in source, never in the GitHub repo, and never in the
main SiteDesk data blob. If this browser is shared, clear the token in Settings
when you are done.

## z.ai

z.ai sends X-Frame-Options and will not embed. SiteDesk does not iframe it.
Copy the brief, open https://chat.z.ai in a new tab, build there, then paste
the HTML back into the lead for live preview and publish.

## Caller photos

On each lead, upload a logo, storefront, and extra photos. They are compressed
in-browser (max ~1600px) and stored locally. On publish they become files in
the site folder (logo.png, storefront.jpg, photo-1.jpg, and so on). If the
pasted HTML does not already reference them, a small gallery is injected
before </body>.

## Bulk leads

Admin can paste or upload CSV on the Leads page. Header style matches
leads.csv:

    # Name, Address, Phone, Rating, Business Type, Hours, Website

The header line may start with #. One business name per line also works.
Optional: assign the whole batch to one caller. Duplicates (same name + phone)
are skipped.

## Roles

- Admin: board, all leads, team, settings (token + queued publish), bulk import.
- Caller: assigned leads, notes, brief, photos, lead chat, team inbox.
- Builder: lands on Jobs; copy brief, paste HTML, preview, publish, chat.
