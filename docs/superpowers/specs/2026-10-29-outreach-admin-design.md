# Outreach admin: marketing edits events, news and tenders without code

Date: 2026-10-29. Status: draft for approval.

## Intent

Today every event, news item and tender on artpark.in is a hardcoded array in `src/data/content.cjs`.
Each update needs a developer. The marketing team should log in to an admin screen, add or change
an item, press Save, and see it live on the site a minute or two later. The public design of the
Outreach pages (Events, News, Tenders) is final and must not change.

## Goals

- `/admin` with a login. One account for the marketing person at first; a second account can be added
  later by configuration only, no code change.
- Three tabs: **Events**, **News**, **Tenders**. Each lists every existing entry (current content is
  migrated in), with **Add new**, **Edit** and **Delete**.
- Saving goes live without review (user decision), within about 1 to 2 minutes.
- Tenders: the document is uploaded at the two main points (tender issued, and after bidding is done).
  All other progress is changed with a phase slider, no document needed (user decision).
- The whole flow works locally first (admin → save → rebuilt site on 127.0.0.1:3010), then on Vercel.

## Non-goals

- Careers, portfolio, stories, programmes and the other pages stay code-edited.
- On the News page, the "Publications" and "Let's Talk @ ARTPARK" blocks stay hardcoded.
- No drafts, review queue, roles or permissions, scheduled publishing, or password-reset UI
  (a password is changed by updating an environment variable).

## Anti-goals (a failure even if it works)

- Any visible change to the public Outreach pages for existing content.
- The GitHub token or password ever reaching the browser, the repo or the logs.
- An admin edit that breaks the build and takes the whole site down (see "Safety" below).
- Admin pages indexed by search engines.

## Approaches considered

| | Approach | Trade-off |
|---|---|---|
| **A (chosen)** | Admin page plus small Vercel server functions that commit the change (JSON plus uploaded files) to the GitHub repo; Vercel rebuilds on every commit. | Site stays fully static, no new services or cost, every edit is in git history and revertible. Goes live in ~1–2 min, not instantly. Upload size is capped by Vercel's ~4.5 MB request limit. |
| B | Database and Vercel Blob; Outreach pages load content at runtime. | Instant and no file-size limit, but the Outreach pages stop being static (rework), two new services, no history. |
| C | Off-the-shelf Git CMS (Decap or Tina). | Less custom code, but the marketing person needs a GitHub account and the tender flow does not fit its generic forms. |

The user picked A: it keeps the site they are happy with and meets "live straight away" closely enough.

## Design

### 1. Content moves out of code into JSON

- New files: `src/data/outreach/events.json`, `news.json`, `tenders.json`. They are seeded once from the
  current arrays, so the built HTML for existing content is unchanged. This is verified by diffing
  `dist/events/**`, `dist/news` and `dist/tenders` before and after the migration. The only allowed
  differences are the `gpu-edge-cloud` track (section 4) and the floating stat label (section 2).
- `content.cjs` reads these files instead of its inline arrays. Renderers in `src/pages/outreach.cjs`
  stay as they are, apart from the tender stage track (section 4).
- Each item gets a stable `id` (slug) so edits and deletes target one record.

### 2. Fields (what the admin forms ask for)

**Event**: title, start date, optional end date (shown as "4–6 Dec 2024"), optional time, venue,
short description, image upload, optional "register" link, optional "recap" link.
- Upcoming or past is worked out from the date at build time, not chosen by hand.
- **Upcoming events must have a photo** (user decision). The admin will not save one without it,
  so every upcoming card keeps the 16:9 design. Photos stay optional for past events, as today.
- **When no events are upcoming**, the section stays and shows one line (user decision):
  "No upcoming events right now. Follow ARTPARK on LinkedIn for the next one."
  The floating stat changes from "Open Days coming up at ARTgarage" to "upcoming events"
  (Claude's call; the old wording is wrong as soon as an event isn't an Open Day).
- Missing time or register link: that part of the card is left out, never printed as "undefined".
- **Detail pages:** every event without a recap link gets a detail page at `/events/<id>` in the
  existing detail layout, built from its description. For a past event with neither a recap link nor
  a description, the "Recap →" link is left out.
- **Migrated events** (Claude's call):
  - The archived artpark.in text in `research/artpark-in/events__*.json` moves into the event's
    description in the JSON. Its detail page is then built from the JSON and stays editable.
  - The event's `id` and route are locked after creation, so old-URL redirects in `urlmap.cjs` keep working.
  - The admin shows the route as read-only.

**News**: headline, outlet, date, article link. The list stays sorted newest first.

**Tender**: title, category, published date, status (Active / Closed / Request for proposals),
optional note, phase (the slider), the tender document (upload or link), the result document
(upload or link), and optional extra documents such as corrigenda (upload or link, each with a label).

### 3. Login

- Credentials come from environment variables, never from the repo: `ADMIN_USERS`, a JSON list of
  `{email, passwordHash}` (scrypt from Node's built-in `crypto`), and `SESSION_SECRET`.
- `node tools/admin-hash.cjs` prints a hash for a new password.
- Session: HMAC-signed, httpOnly, Secure, SameSite=Strict cookie with an 8-hour expiry.
- Password checks are constant-time with a small fixed delay; a failed login gives one generic error.
- Every write endpoint checks the session and a custom request header, which blocks cross-site form posts.
- `/admin` and `/api/*` send `noindex` and are kept out of any sitemap.

### 4. Tender phases

The track shown on the Tenders page keeps its current five labels and look:
**Notice published → Pre-bid meeting → Corrigenda → Technical bids opened → Price bids opened.**

- The phase is now stored on the tender (`phase: 0–4`) and set with a slider in the admin. It is no
  longer guessed from document names. Every step up to the phase shows as done.
- Moving to **Notice published** requires the tender document. Moving to **Price bids opened**
  ("bidding is done") requires the result document. The admin will not save without them.
- The middle phases need nothing but the slider.
- **Pre-bid meeting** has a "No pre-bid meeting" checkbox. When ticked, the step is hidden from the
  track (as today) and the slider skips it.
- **Captions** under the steps:
  - Pre-bid: date and time typed in the admin.
  - Corrigenda: "N issued", still counted from the extra documents whose label says Corrigendum.
  - Published and price-bids: dates typed in the admin.
- **Existing tenders** are migrated with the furthest step the current inference finds. The one
  visible change (Claude's call): `gpu-edge-cloud` today shows Price bids opened but not Technical
  bids opened, because no technical-bid document was published. A single phase marks the technical
  step done as well, which is true (price bids open only after technical bids). The migration check
  allows exactly this one difference.
- RFPs show no track, as now.
- The dot and label next to each tender (Active / Closed / RFP) stay a separate, manually set status.

### 5. Saving and publishing

- **On Vercel:** `api/*.js` server functions validate the input, then create **one commit** on `main`
  with the changed JSON plus any uploaded files, using the GitHub API and a fine-grained token limited
  to this one repository with Contents read/write (`GITHUB_TOKEN`).
  - Commit message example: `admin: update tender gpu-edge-cloud (marketing@artpark.in)`.
  - Vercel's Git integration sees the commit and redeploys.
  - If someone else committed in between, the save is retried once on top of the latest version.
- **Locally** (no `GITHUB_TOKEN` set): the same functions write the files into the working folder
  and re-run the build in the same process. `tools/serve.cjs` learns to route `/api/*` to those
  functions and loads `.env.local` (gitignored).
- The admin always reads the current content from the API (GitHub's latest on Vercel, disk locally),
  so an item saved a moment ago shows in the list before the redeploy finishes.
- After Save the admin shows "Saved. Live on the site in about 1–2 minutes." with a link to the page.

### 6. Uploads

- Sent as base64 in the JSON request (no upload libraries). The limit is 3 MB per file, which keeps
  the request under Vercel's 4.5 MB cap after base64 growth, with a clear message when exceeded.
  Current tender PDFs are all under 1 MB.
- Allowed types, checked by file content and not just the extension:
  - documents: PDF, DOCX
  - images: JPG, PNG, WebP
- File names are made safe and stored under `public/docs/tenders/<id>/` and `public/assets/events/`.
- A document can be given as a link instead of an upload (some current ones are Google Drive links).

### 7. Safety

- Every field is validated on the server: required fields, length limits, dates, http(s)-only links.
- Output is already escaped by the existing renderers.
- An event date in the past rolls it into "Past events" only on the next build. A daily Vercel cron
  calls a Deploy Hook, so this happens without anyone saving anything.
- Before committing, the server checks that the new content still builds (the page renderers run
  against it). If they fail, nothing is committed and the admin shows the error. A bad edit cannot
  break the live site.
- Delete asks for confirmation. Every change is a git commit, so a developer can revert it.

### 8. The admin screen

- One static page at `/admin` in the site's own fonts and colour tokens, plain JavaScript like the
  rest of the site.
- A login form, then three tabs. Each tab shows a list with Edit and Delete, and an Add new button
  that opens a form.
- On the Tenders form the phase is a 5-step slider. The two document slots appear next to the steps
  that require them.
- Works at phone width.

## Testing

- Node's built-in `node:test`, no new dependencies:
  - validation
  - the password hash and session cookie
  - tender phase rules
  - migration (the built Outreach HTML is unchanged)
  - the local save path (writes JSON, rebuilds, and the new item appears in `dist/`)
- A Playwright run of the local flow: log in → add an event, a news item and a tender → move the
  tender's phase → delete → check each public page after every step. It uses the Playwright found
  through `ARTPARK_PLAYWRIGHT`.
- The existing `check-links` and `check-all` still pass.

## Going to production (later, with the user)

The user creates on Vercel `ADMIN_USERS`, `SESSION_SECRET`, `GITHUB_TOKEN` (fine-grained, this repo
only) and the Deploy Hook, then the login for the marketing person. Nothing is deployed or created
without the user's go-ahead. The existing `X-Robots-Tag: noindex` header stays until the real launch.

## Calls made by Claude (not discussed with the user)

- One login with email and password, extendable through `ADMIN_USERS`.
- The exact fields listed in section 2.
- Upcoming or past is decided by date, plus a daily rebuild through a Vercel cron and Deploy Hook.
- Events without a recap link get a detail page built from their description; archived text for
  existing events moves into the JSON, and event routes are locked.
- The tender track: one phase value, an optional pre-bid step, and the one visible change to `gpu-edge-cloud`.
- The floating stat changes to "upcoming events".
- 3 MB upload limit, with links allowed as an alternative to uploads.

## User decisions (2026-10-29)

- Approach A (GitHub-backed) · go live with no review · marketing login
- Tender docs at issue and after bidding; slider for the rest
- Empty Upcoming → short message
- Photo required for upcoming events
- Status (Active / Closed / RFP) stays separate from the phase slider.

## Left to the builder

File layout under `api/`, the slider's exact look within the site's design tokens, and the wording of
error messages.
