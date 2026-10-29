# artpark.in, rebuilt from the manager's Claude Design

A static site: the manager's page designs (`../.reference/claude-design/*.dc.html`) ported to plain HTML,
filled with verified ARTPARK content. No framework, no npm dependencies.

## Run it

```
node tools/build.cjs           # writes dist/
node tools/serve.cjs dist 3010 # http://127.0.0.1:3010/
```

Compare with the manager's original: `node tools/serve.cjs ../.reference/claude-design 4400`, then
`node tools/compare.cjs http://127.0.0.1:4400/Contact.dc.html http://127.0.0.1:3010/contact qa/contact`.

## Where things are

- `src/lib.cjs`: header, footer, page shell and shared components (all from his markup).
- `src/pages/*.cjs`: one module per page group (home, contact, about, outreach, portfolio, stories, legal).
- `src/data/`: content. `content.cjs` (people, portfolio, partners, events, news, careers, tenders),
  `programs.cjs` (programmes and facilities), `stories.json` (home carousel and collage),
  `stories/<slug>.json` (one founder or project story each), `*media*.json` (every image with its source).
- `public/`: CSS, JS, design-system tokens (`_ds/`), images (`assets/`).
- `research/artpark-in/`: captured artpark.in page text (the legal pages are built from it). Other research stays local.
- `tools/`: build, serve, image processing, screenshots, checks.
- `notes/`: working notes, kept locally only (not in the GitHub repo).

## Checks

- `node tools/check-links.cjs`: internal links, images, forbidden emails, placeholder text.
- `node tools/check-home.cjs`: homepage interactions and mobile menu (server must be running).
- `node --test test/`: content model, admin login, saving and uploads.

## Admin: events, news and tenders

The marketing team edits the Outreach pages at `/admin`, with no code involved. The content lives in
`src/data/outreach/{events,news,tenders}.json`, and the admin writes to those files.

**How saving works:**
- **On Vercel:** each save is one commit to `main`, with a message like `admin: update tenders gpu-edge-cloud (marketing@artpark.in)`. Vercel redeploys it in about 1 to 2 minutes.
- **Locally:** each save writes the files and rebuilds `dist/` straight away.
- **Bad edits can't break the site:** an edit that would stop the pages rendering is refused before anything is written.

**Run it locally:**
1. `node tools/admin-hash.cjs '<a password of 12+ characters>' marketing@artpark.in` prints an `ADMIN_USERS=...` line.
2. Create `.env.local` (it is gitignored) containing that line and `SESSION_SECRET=<random, e.g. openssl rand -hex 32>`.
3. `node tools/build.cjs && node tools/serve.cjs dist 3010`, then open http://127.0.0.1:3010/admin/.
4. Check the whole flow: `ARTPARK_PLAYWRIGHT=<path to playwright-core> ADMIN_EMAIL=... ADMIN_PASSWORD=... node tools/check-admin.cjs`.
   - It adds and deletes test items, and leaves the content as it was.

**Vercel environment variables** (Project → Settings → Environment Variables, Production):

| Variable | Value |
|---|---|
| `ADMIN_USERS` | the JSON list from `tools/admin-hash.cjs` |
| `SESSION_SECRET` | a long random string (different from the local one) |
| `GITHUB_TOKEN` | a fine-grained personal access token. Repository access: **only** `uditauniyal/artpark.in`. Permissions: **Contents: Read and write**, nothing else. |
| `GITHUB_REPO` / `GITHUB_BRANCH` | optional; default `uditauniyal/artpark.in` / `main` |
| `DEPLOY_HOOK_URL` | Project → Settings → Git → Deploy Hooks, for branch `main` |
| `CRON_SECRET` | a random string; Vercel sends it to the nightly `/api/rebuild` cron, which redeploys so passed events move to "Past events" |

**Managing users and edits:**
- **Add a user:** add another `{"email","hash"}` entry to `ADMIN_USERS` and redeploy.
- **Change a password:** replace that user's hash and redeploy.
- **Undo an admin edit:** `git revert <commit>` and push. Every admin save is its own commit.

**Limits:**
- Uploads are up to 3 MB each: PDF or DOCX for tender documents; JPG, PNG or WebP for event photos.
- A bigger file can be hosted elsewhere and its link pasted in instead.
- Upcoming events need a photo.
- On tenders, the tender document is needed from the start, and the result document once the progress slider reaches "Price bids opened".

## Deploying (the user deploys; nothing here deploys)

On Vercel, import the GitHub repo uditauniyal/artpark.in with Root Directory left at the repo root and Framework Preset "Other". `vercel.json` builds with
`node tools/build.cjs`, serves `dist/` with clean URLs, and redirects old artpark.in paths.
It also sends `X-Robots-Tag: noindex` so previews are not indexed: remove that header before the real launch.
