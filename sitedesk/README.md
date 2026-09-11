# SiteDesk

Current SiteDesk. Compact black desk.

Older folders remain archives:

- `sitedesk` (v1, after parent rename)
- `sitedesk-v2`
- `sitedesk-v3`
- `sitedesk-v4`

This app lives at `/sitedesk-v5/` (https://viewyoursite.today/sitedesk-v5/).

- Tool: https://viewyoursite.today/sitedesk-v5/
- Live site: https://viewyoursite.today/{slug}/

Public client sites need no login. Only SiteDesk is gated.

Do not change anything else in the repo.
Browser cache uses `sitedesk.db` and `sitedesk.db.session` (`app.css?v=db3`, `app.js?v=sb1`). Desk data (users, leads, threads, messages) lives in the free Supabase table `sitedesk_state` (row id `desk`). Client sites still publish to GitHub Pages as `{slug}/index.html` on Merci-Chi/viewyoursite `main`. This folder does not share v4 localStorage.

## Job path

Call → Brief → Build → Live → Manage

Callers call and brief. Builders build. Admin reviews after the site is built, then the caller sends the live link to the owner.

Manage is this job’s live URL and republish. Messages stay as messenger.

## First login

`admin@sitedesk.local` / `admin123`. Empty desk. Add people under Team.

## Files

- `index.html` — shell (`app.css?v=db1`, `app.js?v=db1`)
- `app.css` — compact black styles
- `app.js` — the app
- `db.json` — local empty-desk seed only (not the live sync path)
- `sitedesk_state.sql` — paste in the Supabase SQL editor to create the desk table
- `logo.png` — SiteDesk mark (login and sidebar only; never on client sites)
- `README.md` — this file
