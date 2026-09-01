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
Browser cache uses `sitedesk.v5` and `sitedesk.v5.session` (`app.css?v=5d`, `app.js?v=5d`). Desk state lives in
`sitedesk-data/state.json`. This folder does not share v4 localStorage.

## Job path

Call → Brief → Build → Live → Manage

Callers call and brief. Builders build. Admin reviews after the site is built, then the caller sends the live link to the owner.

Manage is this job’s live URL and republish. Messages stay as messenger.

## First login

`admin@sitedesk.local` / `admin123`. Empty desk. Add people under Team.

## Files

- `index.html` — shell (`app.css?v=5d`, `app.js?v=5d`)
- `app.css` — compact black styles
- `app.js` — the app
- `logo.png` — SiteDesk mark (login and sidebar only; never on client sites)
- `README.md` — this file
