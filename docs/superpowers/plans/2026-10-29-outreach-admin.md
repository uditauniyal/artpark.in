# Outreach Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A logged-in marketing person adds, edits and deletes events, news and tenders at `/admin`. Saving commits to GitHub (Vercel rebuilds), or writes to disk and rebuilds when run locally.

**Architecture:** Outreach content moves from inline arrays in `src/data/content.cjs` to three JSON files. A pure model module (`src/outreach/model.cjs`) owns dates, validation, the event split and the tender track, and both the build and the API use it. Vercel functions in `api/` handle login and content. They save through a store: GitHub's Git Data API when `GITHUB_TOKEN` is set, otherwise local disk followed by `node tools/build.cjs`. `tools/serve.cjs` routes `/api/*` to the same handlers locally. The admin UI is static (`public/admin/`), plain JS.

**Tech Stack:** Node 18+ built-ins only (`crypto`, `fs`, `child_process`, global `fetch`, `node:test`). No npm dependencies (README rule). Playwright for the end-to-end check, loaded via `ARTPARK_PLAYWRIGHT`.

**Spec:** `docs/superpowers/specs/2026-10-29-outreach-admin-design.md`

## Global Constraints

- **No npm dependencies**, and no new services beyond GitHub and Vercel.
- **Public Outreach HTML for existing content does not change.** The only allowed differences are:
  - the `gpu-edge-cloud` track (Technical bids opened becomes done)
  - the Events floating stat label (`upcoming events`)
- **Secrets only in env:** `ADMIN_USERS`, `SESSION_SECRET`, `GITHUB_TOKEN`, `GITHUB_REPO` (default `uditauniyal/artpark.in`), `GITHUB_BRANCH` (default `main`), `DEPLOY_HOOK_URL`, `CRON_SECRET`. Locally they live in `.env.local`, which is gitignored.
- **Session:** HMAC-SHA256-signed cookie `ap_admin`, httpOnly, SameSite=Strict, 8 h, Secure except on `127.0.0.1` or `localhost`.
- **Every write needs** a valid session and the header `X-Admin: 1`.
- **Uploads:** at most 3 MB decoded. Types are checked by magic bytes:
  - PDF `%PDF`
  - DOCX `PK\x03\x04` with a `.docx` name
  - JPG `FF D8 FF`
  - PNG `89 50 4E 47`
  - WebP `RIFF....WEBP`
- **Upload locations:**
  - documents → `public/docs/tenders/<tenderId>/<safe-name>`
  - images → `public/assets/events/<eventId>-<safe-name>`
- **Links** must be `https?://` or a site path starting with a single `/`, at most 500 characters.
- **Tender stage labels**, exact and in order: `Notice published`, `Pre-bid meeting`, `Corrigenda`, `Technical bids opened`, `Price bids opened`.
- **Empty-upcoming copy**, exact: `No upcoming events right now. Follow ARTPARK on <a href="https://www.linkedin.com/company/artpark-in/">LinkedIn</a> for the next one.`
- **Git:** work on branch `outreach-admin`. Commit messages have no AI attribution (user's global rule). Commit only after the user OKs committing.
- **Commit message for admin saves:** `admin: <add|update|delete> <kind> <id> (<email>)`.

## Review Focus

1. **Item edited in a stale tab.** Saving builds on the latest store content: the edited record is replaced by `id`, and other records stay as they are now. Test in Task 5.
2. **Upcoming event saved without a photo, or a tender without its required document.** The save is rejected with a field-specific message and nothing is written. Tests in Tasks 1 and 5.
3. **Oversize or disguised upload** (a 3.5 MB PDF, or an `.exe` renamed `.pdf`). Rejected with a 400 that names the limit or type. Test in Task 4.
4. **Session tampering or expiry** (edited cookie payload, expired `exp`, missing `X-Admin`). Returns 401 or 403 and never writes. Test in Task 3.
5. **Event whose date passes.** On the next build it moves from Upcoming to Past. With no upcoming events left, the empty message shows; it never shows an empty grid or `undefined`. Tests in Tasks 1 and 2.

---

### Task 1: Outreach model (pure functions)

**Files:**
- Create: `src/outreach/model.cjs`
- Test: `test/model.test.cjs`
- Modify: `package.json` (add `"test": "node --test test/"`)

**Interfaces:**
- Produces:
  - `formatShort(iso) -> '12 Nov 2026'`
  - `formatRange(startIso, endIso?) -> '4–6 Dec 2024' | '30 Nov – 2 Dec 2024' | '30 Dec 2024 – 2 Jan 2025'`
  - `formatLong(iso) -> '13 October 2026'` (no zero padding)
  - `splitEvents(events, todayIso) -> { upcoming, past }`
    - An event is upcoming when `(end || start) >= todayIso`.
    - Upcoming is sorted by start ascending, past by start descending.
  - `eventHasPage(e) -> boolean`, true when there is no `recap` and there is `body.length || blurb`.
  - `tenderStages(t) -> [[label, done, caption]]`
    - The stages are the 5 labels. A stage is done when its index is `<= t.phase`.
    - `Pre-bid meeting` is omitted when `t.noPreBid`.
    - Captions:
      - Notice: `formatShort(t.published)` or `''`
      - Pre-bid: `t.preBid` or `''`
      - Corrigenda: `'N issued'`, where N is the number of docs whose label matches `/corrigend/i`, or `''`
      - Technical: `''`
      - Price: `t.priceBidsDate ? formatShort(...) : ''`
  - `validate(kind, item) -> string[]` of errors, empty when valid. `kind` is `'events' | 'news' | 'tenders'`.
  - `slugify(s)`, the same algorithm as `content.cjs`.
  - `uniqueId(base, existingIds)`, which appends `-2`, `-3`, ... on collision.
  - `todayIST() -> 'YYYY-MM-DD'`, which honours `process.env.BUILD_DATE`.
- **Record shapes** (all strings default to `''`):
  - Event: `{id, title, start, end, time, venue, blurb, body: string[], image, imageAlt, register, recap, source}`
  - News: `{id, title, outlet, date, dateLabel, url}`. `dateLabel` holds a migrated original text and wins over `formatLong(date)`.
  - Tender: `{id, title, cat, status: 'active'|'closed'|'rfp', published, note, phase: 0..4, noPreBid: bool, preBid, priceBidsDate, docs: [{label, href, kind: 'PDF'|'Doc'|'Drive'|'DOCX', role: 'tender'|'result'|'other'}]}`

- [ ] **Step 1: Write failing tests** in `test/model.test.cjs`:
  - **Dates:**
    - `formatRange('2024-12-04','2024-12-06') === '4–6 Dec 2024'`
    - `formatRange('2023-12-14','2023-12-15') === '14–15 Dec 2023'`
    - `formatRange('2026-11-12','') === '12 Nov 2026'`
    - `formatLong('2024-05-05') === '5 May 2024'`
  - **Event split:**
    - `splitEvents` with today `2026-10-29`: `{start:'2026-11-12'}` is upcoming and `{start:'2026-10-23'}` is past.
    - A multi-day event with `end:'2026-10-30'` and start `2026-10-28` is upcoming.
  - **`tenderStages`:**
    - `{phase:4, noPreBid:false, preBid:'27 Feb 2025', priceBidsDate:'2025-03-17', docs:[{label:'Corrigendum · 28 Feb 2025'}]}` gives 5 stages, all done, with captions `['', '27 Feb 2025', '1 issued', '', '17 Mar 2025']`.
    - `{phase:0, noPreBid:true, docs:[]}` gives 4 stages, only the first done.
  - **`validate`, rejections** (assert that the error string mentions the field):
    - an upcoming event (start in the future) with no `image`
    - a non-rfp tender with no doc of role `tender`
    - a tender with `phase:4` and no doc of role `result`
    - `phase:5`
    - a link `javascript:alert(1)`
    - a title of 201 characters
    - news with no `outlet`
  - **`validate`, accepts:**
    - an rfp tender with `docs:[]`
    - a past event with no image

- [ ] **Step 2: Run** `node --test test/`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement `src/outreach/model.cjs`.** Month names are fixed English arrays. Dates are parsed as `YYYY-MM-DD` strings without `Date`, to avoid time-zone shifts. `todayIST` = `new Date(Date.now()+5.5*3600e3).toISOString().slice(0,10)` unless `BUILD_DATE` is set.
- [ ] **Step 4: Run** `node --test test/`. Expected: all pass.
- [ ] **Step 5: Commit** `feat: outreach content model`.

### Task 2: Migrate outreach content to JSON and render from it

**Files:**
- Create: `tools/migrate-outreach.cjs` (one-off, kept for the record)
- Create: `src/data/outreach/events.json`, `news.json`, `tenders.json`
- Modify: `src/data/content.cjs` (drop the inline `upcomingEvents`, `pastEvents`, `news` and `tenders`, plus `OUTLET_FIX`; load the JSON)
- Modify: `src/pages/outreach.cjs` (events, event pages, news, tenders, `FLOAT_EVENTS` stat)
- Test: `test/migration.test.cjs`

**Interfaces:**
- Consumes: everything from Task 1.
- Produces:
  - `content.cjs` exports `outreach: { events, news, tenders }`. It reads from `process.env.OUTREACH_DIR || src/data/outreach`.
  - It also keeps exporting `upcomingEvents` and `pastEvents` (via `splitEvents(events, todayIST())`), plus `news` (sorted by `date` desc, stable) and `tenders`, so other code keeps working.

- [ ] **Step 1: Snapshot the current output.**
  - Run `node tools/build.cjs && rm -rf qa/before && mkdir -p qa/before && cp -R dist/events dist/news dist/tenders qa/before/`.
  - Expected: `qa/before/events/index.html` exists.
- [ ] **Step 2: Write `tools/migrate-outreach.cjs`.** It requires the *current* `content.cjs` and writes the three JSON files.
  - **Events:**
    - `start` and `end` are parsed from the display date. Examples: `'4–6 Dec 2024'` → `2024-12-04` / `2024-12-06`; `'15–18 Oct 2024'` similarly.
    - For events whose url matches `artpark.in/events/`: `id` is the last url segment, `recap` is `''`, and `body` is the paragraph list exactly as `outreach.cjs` derives it today. Move that parse code here.
    - Every other past event: `id = slugify(title)`, `recap = url`, `blurb = note || ''`.
    - Upcoming events keep `blurb`, `time`, `register`, `image`, `imageAlt` and `source`.
  - **News:**
    - `id = slugify(title)`, with `uniqueId` on collision.
    - `date` is ISO; `dateLabel` is the original string, so padded `05 May 2024` survives.
  - **Tenders:**
    - Each `docs` entry becomes `{label, href, kind, role}`. The role is `tender` for `/tender document/i`, `result` for `/price.?bid|commercial bid/i`, `other` otherwise.
    - `phase` is the highest done stage from today's inference: gpu-edge-cloud 4, gpu-rack-server 4, robot-arm 0, genomic-surveillance 0.
    - `noPreBid` is true unless the note mentions a pre-bid meeting.
    - `preBid` is `dateIn(note)`. `priceBidsDate` is the ISO of `dateIn(price doc label)`. `published` is ISO.
- [ ] **Step 3: Run** `node tools/migrate-outreach.cjs`. Expected: three JSON files; events has 18 items, news 14, tenders 4.
- [ ] **Step 4: Switch the loaders and renderers.**
  - `content.cjs` loads the JSON.
  - In `outreach.cjs`:
    - The event date shown is `formatRange(start, end)`.
    - Past-row links go to `/events/<id>` when `eventHasPage(e)`, to `recap` when set, and are left out otherwise.
    - Upcoming cards leave out ` ${time}` and the `Register →` link when empty.
    - When the upcoming list is empty, show the exact empty copy in a `<p style="font-size:15px;color:var(--ink-soft);margin-top:16px">`.
    - Event detail pages come from `events.filter(eventHasPage)` with `body.length ? body : [blurb]`. Leave the research file reading out of the page module.
    - News meta: `(dateLabel || formatLong(date))`.
    - The tender track uses `model.tenderStages`; tender docs render from `{label, href, kind}`.
    - `FLOAT_EVENTS` stat label: `upcoming event` / `upcoming events` by count.
- [ ] **Step 5: Write `test/migration.test.cjs`.** It runs `BUILD_DATE=2026-10-29 node tools/build.cjs`, then:
  - For every file under `qa/before`, the new `dist` file is identical after removing two allowed differences: the gpu-edge-cloud `<ol class="t-track">` block and the stat label text.
  - In the new gpu-edge-cloud track, every `<li>` has `is-done`.
- [ ] **Step 6: Run** `node --test test/ && node tools/check-links.cjs`. Expected: pass, and `No internal problems found.` If a diff appears, fix the migration (not the test) until only the allowed differences remain.
- [ ] **Step 7: Run** `BUILD_DATE=2026-12-01 node tools/build.cjs` and grep `dist/events/index.html` for `No upcoming events right now`. Expected: found, with both Open Days now listed under Past. Then rebuild without `BUILD_DATE`.
- [ ] **Step 8: Commit** `feat: outreach content in JSON, explicit tender phases`.

### Task 3: Auth (password hashes and signed session)

**Files:**
- Create: `api/_lib/auth.js`, `api/_lib/http.js`, `api/login.js`, `api/logout.js`
- Create: `tools/admin-hash.cjs`
- Test: `test/auth.test.cjs`

**Interfaces:**
- Produces:
  - `hashPassword(pw) -> 'scrypt$<saltHex>$<keyHex>'`, with a 16-byte salt and a 64-byte key.
  - `verifyPassword(pw, stored) -> boolean`, using `timingSafeEqual`.
  - `signSession({email, exp}, secret) -> string` and `readSession(cookieHeader, secret, now=Date.now()) -> {email} | null`.
  - `requireAdmin(req, res, {write}) -> {email} | null`. On failure it responds itself: 401 without a session, 403 when a write lacks `X-Admin: 1`.
  - `http.js`:
    - `readJson(req) -> Promise<object>`. It uses `req.body` if Vercel already parsed it, otherwise reads the stream. It caps the body at 4.4 MB and throws `{status:413}` above that.
    - `send(res, status, obj)`.
  - `POST /api/login {email, password}`:
    - **204 and `Set-Cookie`** on success.
    - **401 `{error:'Wrong email or password.'}`** on failure, after an added 400 ms.
    - **429** after 5 failures per IP per minute (in-memory).
  - `POST /api/logout` returns 204 and clears the cookie.
  - `GET /api/login` returns `{email}` or 401. The admin UI uses this to check the session.
  - `node tools/admin-hash.cjs <password>` prints the hash and a sample `ADMIN_USERS` line.
- Handlers are `module.exports = async (req, res) => {}` and use only Node `res` methods, so they run under Vercel and `serve.cjs` alike. The `api/_lib` underscore keeps those files from becoming routes.

- [ ] **Step 1: Write failing tests:**
  - a hash round-trip, and a wrong password failing
  - a tampered payload returns `null`
  - an expired `exp` returns `null`
  - the login handler, with a mocked req/res and `ADMIN_USERS` set in `process.env`:
    - returns 204 with a `Set-Cookie` containing `HttpOnly` and `SameSite=Strict`
    - the 6th bad attempt returns 429
  - `requireAdmin` with a write and no `X-Admin` header returns 403
- [ ] **Step 2: Run** `node --test test/`. Expected: the new tests fail.
- [ ] **Step 3: Implement** the files above.
- [ ] **Step 4: Run** `node --test test/`. Expected: pass.
- [ ] **Step 5: Commit** `feat: admin login and sessions`.

### Task 4: Stores (local disk and GitHub) and uploads

**Files:**
- Create: `api/_lib/store.js`, `api/_lib/uploads.js`, `api/_lib/render-check.js`
- Test: `test/store.test.cjs`

**Interfaces:**
- Produces:
  - `getStore() -> LocalStore | GitHubStore`. It returns a GitHub store when `GITHUB_TOKEN` is set, otherwise a local one rooted at `process.env.ARTPARK_ROOT || <repo root>`.
  - Both stores implement:
    - `read() -> Promise<{events, news, tenders}>`
    - `write({files: [{path, content: Buffer|string}], message}) -> Promise<void>`
  - **LocalStore:**
    - `write` writes the files under its root.
    - Then, unless `opts.build === false`, it runs `spawnSync(process.execPath, ['tools/build.cjs'], {cwd: root})`. It throws on a non-zero exit.
  - **GitHubStore:**
    - `read` uses `GET /repos/{repo}/contents/src/data/outreach/<f>.json?ref=<branch>` with `Accept: application/vnd.github.raw`.
    - `write` does: get the ref, get the base commit tree, create a blob per file (base64), create a tree with `base_tree`, create a commit, then `PATCH` the ref with `force:false`.
    - It throws `{status:409}` on 422/409 from the ref update.
    - It authenticates with `Authorization: Bearer ${GITHUB_TOKEN}` and uses global `fetch`.
  - `decodeUpload({name, data}, purpose: 'doc'|'image') -> {buffer, ext, kind}`.
    - It throws `{status:400, message}` for a file over 3 MB or a type mismatch.
    - `kind` is `'PDF'` or `'DOCX'` for documents.
  - `safeName(name) -> string`: lowercase `[a-z0-9.-]`, at most 80 characters, keeping the extension.
  - `renderCheck({events, news, tenders}) -> void`.
    - It writes the JSON to `os.tmpdir()/outreach-<random>`.
    - It runs `spawnSync(node, ['-e', <require src/pages/outreach.cjs and call html() on every page>])` with `OUTREACH_DIR` set.
    - It throws `{status:422, message: stderr's first line}` on failure.

- [ ] **Step 1: Write failing tests:**
  - **`decodeUpload`:**
    - accepts `%PDF-1.4…` bytes as a PDF, and a 1×1 PNG
    - rejects an `MZ` header named `x.pdf` with a message mentioning "PDF"
    - rejects 3 MB + 1 byte with a message mentioning "3 MB"
  - **LocalStore**, with `build:false` and a temp root copied from `src/data/outreach`:
    - `write`, then `read`, round-trips the content
  - **GitHubStore**, with a stubbed `global.fetch`:
    - `write` makes the calls in order ref → commit → blobs → tree → commit → ref PATCH, with `force:false`
    - a 422 on the PATCH throws status 409
  - **`renderCheck`:**
    - fails for a tender whose `docs` is not an array
- [ ] **Step 2: Run** `node --test test/`. Expected: the new tests fail.
- [ ] **Step 3: Implement** the three modules.
- [ ] **Step 4: Run** `node --test test/`. Expected: pass.
- [ ] **Step 5: Commit** `feat: content stores, upload checks, render check`.

### Task 5: Content API

**Files:**
- Create: `api/content.js`
- Test: `test/content-api.test.cjs`

**Interfaces:**
- Consumes: `requireAdmin`, `readJson` and `send` (Task 3); `getStore`, `decodeUpload`, `safeName` and `renderCheck` (Task 4); `validate`, `slugify` and `uniqueId` (Task 1).
- Produces:
  - `GET /api/content` → `{events, news, tenders}`. Needs a session.
  - `POST /api/content`, body `{kind, action: 'save'|'delete', item?, id?, uploads?: [{name, data}]}`. Needs a session and `X-Admin`.
- **Save:**
  1. Read the latest content from the store.
  2. A new item (no `id`) gets `uniqueId(slugify(title))`. An existing `id` replaces that record and ignores any `id` change.
  3. Swap each `'upload:N'` string in `item.image` and `item.docs[].href` for the stored path, and set `docs[].kind` from the decoded type.
  4. `validate`, then `renderCheck`.
  5. `store.write` the changed JSON plus the upload files, with the commit message from Global Constraints.
  6. On a 409, retry once from step 1.
- **Response:** `{ok: true, id, page: '/events' | '/news' | '/tenders'}`, or `{error, fields?}` with status 400, 404 or 422.

- [ ] **Step 1: Write failing tests.** The handler runs against LocalStore (`build:false`, temp root) via `ARTPARK_ROOT`:
  - adding news writes it to `news.json` and returns its id
  - editing a tender's phase from 0 to 4 without a result doc returns 400 with `fields` including `docs`
  - the same edit with an upload `{name:'result.pdf', data:<base64 %PDF>}` and a doc `href:'upload:0', role:'result'` succeeds, and the file exists under `public/docs/tenders/<id>/`
  - an upcoming event with no image returns 400
  - deleting an unknown id returns 404
  - **stale tab:** after news A is edited in the store directly, saving news B leaves A's edit intact
  - a request without a session returns 401
- [ ] **Step 2: Run** `node --test test/`. Expected: the new tests fail.
- [ ] **Step 3: Implement** `api/content.js`.
- [ ] **Step 4: Run** `node --test test/`. Expected: pass.
- [ ] **Step 5: Commit** `feat: content API`.

### Task 6: Local server routing, cron hook and Vercel config

**Files:**
- Modify: `tools/serve.cjs`. Load `.env.local` (simple `KEY=VALUE` lines; a value may be single-quoted JSON). Route `/api/<name>` to `require('../api/<name>.js')` when that file exists. Send `X-Robots-Tag: noindex` for `/admin` and `/api`.
- Create: `api/rebuild.js`. Checks `Authorization: Bearer ${CRON_SECRET}`, then `POST DEPLOY_HOOK_URL`. Returns 401 without the secret and 204 on success.
- Modify: `vercel.json`:
  - `"functions": {"api/content.js": {"includeFiles": "{src,research,tools}/**"}}`
  - `"crons": [{"path": "/api/rebuild", "schedule": "30 18 * * *"}]` (midnight IST)
  - headers for `/admin/(.*)` and `/api/(.*)` with `Cache-Control: no-store`
- Modify: `.gitignore` (add `.env.local`)
- Test: `test/rebuild.test.cjs` (401 without the secret; with it, a stubbed `fetch` is called with the hook URL)

- [ ] **Step 1: Write the failing rebuild test.** Run it. Expected: FAIL.
- [ ] **Step 2: Implement** `api/rebuild.js` and the `serve.cjs` routing.
- [ ] **Step 3: Run** `node --test test/`. Expected: pass.
- [ ] **Step 4: Manual check.**
  - Create `.env.local` with an `ADMIN_USERS` line from `node tools/admin-hash.cjs <pw>` and a `SESSION_SECRET`.
  - Restart `node tools/serve.cjs dist 3010`.
  - `curl -i -X POST 127.0.0.1:3010/api/login -d '{"email":"…","password":"…"}' -H 'content-type: application/json'` returns 204 with a cookie.
  - The same request with a wrong password returns 401.
- [ ] **Step 5: Commit** `feat: local API routing, nightly rebuild, vercel config`.

### Task 7: Admin UI

**Files:**
- Create: `public/admin/index.html` (`<meta name="robots" content="noindex">`; loads `/_ds/colors_and_type.css`, `/css/site.css` and `admin.css`)
- Create: `public/admin/admin.js`, `public/admin/admin.css`
- Create: `tools/check-admin.cjs` (Playwright end-to-end check)

**Behaviour:**
- **Login and session:**
  - On load, `GET /api/login`. Without a session, show the login form. With one, show "Signed in as …", Log out, and the tabs **Events / News / Tenders**.
- **Lists:**
  - Each tab lists items as title, date and status, each with Edit and Delete (Delete asks to confirm), plus an **Add new** button.
- **Event form:**
  - Fields: title, start, end, time, venue, short description, full write-up (textarea; paragraphs split on blank lines into `body`), image upload, image alt, register link, recap link.
  - Shows the event's page address read-only.
- **News form:** headline, outlet, date, link.
- **Tender form:**
  - Fields: title, category, status, published date, note, a "No pre-bid meeting" checkbox, a pre-bid caption, and a price-bids date.
  - **Phase slider:** `<input type=range min=0 max=4>` with the 5 stage labels under it. When `noPreBid` is ticked, step 1 is greyed out and the slider jumps over it.
  - **Documents:** each row has a label, a role (Tender document / Result document / Other), and a file input or link.
  - The Tender document slot is highlighted at phase ≥ 0 and the Result document slot at phase 4.
- **Uploads:** files are read with `FileReader` as base64 and sent as `uploads[N]`. The row's href becomes `upload:N`.
- **Requests:** every write sends `X-Admin: 1` and `credentials: 'same-origin'`.
- **After saving:** show `Saved. Live on the site in about 1–2 minutes.` with a link to the page. Locally it is live at once; the same message is fine.
- **Errors:** field errors from the API show next to their fields.
- **Phone width:** at 390 px the page fits with no horizontal scroll.

- [ ] **Step 1: Write `tools/check-admin.cjs`.** Base URL is `argv[2]`, default `http://127.0.0.1:3010`; credentials come from env `ADMIN_EMAIL` / `ADMIN_PASSWORD`. It checks, in order:
  1. A wrong password shows the error.
  2. Log in.
  3. Add news "Admin test news" (today, outlet "Test"). `/news` contains it.
  4. Add an upcoming event with a PNG and a date one month out. The `/events` Upcoming section contains it.
  5. Add a tender with a PDF tender document. `/tenders` shows it with 1 done stage.
  6. Move it to phase 4 without a result doc: an error appears. Add a result PDF and save: the track shows all stages done.
  7. Delete all three test items. The pages no longer contain them.
  8. At 390 px, the admin page has `scrollWidth - innerWidth <= 1`.
  9. No page errors are logged.
  - It prints a JSON summary and exits non-zero on any failure.
- [ ] **Step 2: Run** it before the UI exists. Expected: FAIL (no login form).
- [ ] **Step 3: Implement** the admin UI files.
- [ ] **Step 4: Run** `ARTPARK_PLAYWRIGHT=… ADMIN_EMAIL=… ADMIN_PASSWORD=… node tools/check-admin.cjs`. Expected: all steps pass. Afterwards `git status` shows the test items' JSON changes undone, apart from upload files, which the test removes.
- [ ] **Step 5: Run** the full suite:
  - `node --test test/`
  - `node tools/build.cjs`
  - `node tools/check-links.cjs`
  - `node tools/check-all.cjs`
  - `node tools/check-home.cjs`
  - Expected: all pass, as before the change.
- [ ] **Step 6: Commit** `feat: outreach admin UI`.

### Task 8: Docs

**Files:**
- Modify: `README.md`. Add an "Admin (events, news, tenders)" section covering:
  - local setup with `.env.local` and `tools/admin-hash.cjs`
  - each Vercel env var and how to create the fine-grained token (this repo only, Contents read/write)
  - how to create a Deploy Hook and set `CRON_SECRET`
  - how to add a second user
  - how to revert a bad edit (`git revert`)

- [ ] **Step 1: Write the section.** Then run `node --test test/` once more. Expected: pass.
- [ ] **Step 2: Commit** `docs: outreach admin setup`.

Deploying to Vercel and creating the real marketing login happen afterwards, with the user, and are not part of this plan.
