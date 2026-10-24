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

## Deploying (the user deploys; nothing here deploys)

On Vercel, import the GitHub repo uditauniyal/artpark.in with Root Directory left at the repo root and Framework Preset "Other". `vercel.json` builds with
`node tools/build.cjs`, serves `dist/` with clean URLs, and redirects old artpark.in paths.
It also sends `X-Robots-Tag: noindex` so previews are not indexed: remove that header before the real launch.
