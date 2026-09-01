# SiteDesk v5

Compact black redo of v4. Same desk, smaller type and controls, one black page.

v4 remains at `/sitedesk-v4/` (https://viewyoursite.today/sitedesk-v4/).
v5 is self-contained at https://viewyoursite.today/sitedesk-v5/.

- Tool: https://viewyoursite.today/sitedesk-v5/
- Live site: https://viewyoursite.today/{slug}/

Public client sites need no login. Only SiteDesk is gated.

Do not change anything else in the repo.
Browser cache uses `sitedesk.v5` and `sitedesk.v5.session` (`app.css?v=5c`, `app.js?v=5c`). Desk state lives in
`sitedesk-data/state.json`. This folder does not share v4 localStorage.

## Job path

Call → Brief → Build → Live → Manage

Manage is this job’s live URL and republish. Messages stay as messenger.

## First login

`admin@sitedesk.local` / `admin123`. Empty desk. Add people under Team.

## Files

- `index.html` — shell (`app.css?v=5c`, `app.js?v=5c`)
- `app.css` — compact black styles
- `app.js` — the app
- `README.md` — this file
