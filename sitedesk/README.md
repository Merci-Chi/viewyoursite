# SiteDesk

Internal tool for the website team. Admin assigns leads to callers. Callers gather the brief. Builders make the site in z.ai and send the URL back.

This folder is self-contained. Do not change anything else in the repo.

## Open it

On GitHub Pages: `https://merci-chi.github.io/viewyoursite/sitedesk/`

Or open `index.html` in a browser.

## Demo logins

| Role | Email | Password |
|---|---|---|
| Admin | admin@sitedesk.local | admin123 |
| Caller | caller@sitedesk.local | caller123 |
| Builder | builder@sitedesk.local | builder123 |

Data stays in that browser (localStorage). Create real teammates under Team after you log in as admin.

## Flow

1. Admin adds a lead and assigns a caller.
2. Caller logs notes, fills the brief, sends it to a builder.
3. Builder copies the brief into z.ai (embed or new tab) and pastes the preview URL back.
4. Caller reviews and marks it done.
