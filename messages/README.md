# Messages

Standalone Amazon Message Center–style messenger. Static files only. No Firebase, no Google, no SiteDesk.

Live folder (when published by you): `https://viewyoursite.today/messages/`

## Files

- `index.html` — shell (cache-busts `app.css?v=1` and `app.js?v=1`)
- `app.css` — Amazon Message Center look
- `app.js` — login, inbox, 1:1 DMs, People, GitHub sync
- `db.json` — source of truth: `{ users, threads, messages, reads, rev }`

## Seed account

Only one user is seeded. There are no extra people and no leads.

- Name: Admin
- Email: `admin@messages.local`
- Password: `admin123`
- Role: admin (head)

After login, open **People** to add name / email / password. New passwords are stored as SHA-256 hex. Login accepts either plaintext or SHA-256 hex (email is case-insensitive). A pull of `db.json` runs **before** credentials are checked.

## Local preview

Do not open `index.html` as a `file://` URL (fetch of `db.json` will fail). From this folder:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080/`.

## Sync (GitHub Contents API)

Reads, in order:

1. Relative `db.json?v=timestamp` (GitHub Pages / local server)
2. `https://raw.githubusercontent.com/Merci-Chi/viewyoursite/main/messages/db.json`

Writes:

- `PUT` `messages/db.json` on branch `main` of `Merci-Chi/viewyoursite`
- Classic personal access token, **repo** scope, stored only in `localStorage` under `messages.githubToken`
- Paste the token on the admin **People** page (compact field)
- **Never** put the token in these files, in `db.json`, or in git

Images are stored as data URLs on the message. If a token exists they are also uploaded to `messages/chat/{threadId}/filename`. Send still succeeds if that upload fails.

## Behavior notes

- Click a person or a conversation to open a 1:1 DM. Creating a thread is persisted.
- Enter sends, Shift+Enter inserts a newline.
- Viewing a thread marks it read in memory only; `reads` are saved on the next real write (send, new person, new thread).
- Visible tabs poll `db.json` every 5 seconds.
- Session key: `messages.v1.session`. Cache key: `messages.v1`.

## Privacy

The GitHub token never belongs in this repo. Keep it in the browser only.
