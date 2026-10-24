# ARTPARK V7

Preview: http://127.0.0.1:3006/

V6 is frozen at port 3005. Its complete source, assets, docs and built output are recorded in `../v6-baseline.json` and checked for preservation. Older previews are also retained. Nothing was deployed or changed in Squarespace.

Build and serve from the repository root:

```
npm.cmd --prefix versions/v7 run build
npm.cmd --prefix versions/v7 start
```

The output is `versions/v7/dist`, with 29 routes. The server reads rebuilt files without restarting. For a future deployment managed by the user, Vercel Root Directory is `versions/v7`, using the included `vercel.json`.

The opening sentence now says: “ARTPARK brings research, engineering labs and venture building together.” Institutional identification remains elsewhere.

The company story replaces V6’s eight illustrated cards with five product-led scenes, actual company media and direct website links. Scroll, selectors, previous/next buttons and keyboard navigation all change the featured team. The scene measures the actual available viewport so its content fits short desktop windows. Mobile and reduced-motion layouts use manual selectors without pinning. Twara’s original demonstration animation supplies actual robot movement; reduced motion shows a still product image. Source images are unedited and recorded in `src/data/v7-media-provenance.json`.

A new startup-support section restores the three previously verified funding milestones: QOSMIC’s $3.33M seed round, Yaanendriya’s ₹15 crore institutional round and AlgoFET’s ₹15 crore Pre-Series A. Original announcements and supporting sources remain in `src/data/home-stories.json`. These are company financing rounds, not a claim of grants paid by ARTPARK. The section links to programmes, ARTgarage and incubation without claiming universal programme eligibility.

Shared motion includes a reading-progress line, heading and section arrivals, photo drift, filter and people-panel transitions, pointer feedback on resource cards, partner names and form focus states. Long programme, facility, approach and partnership pages receive sticky navigation generated from their actual headings. Contact role choices update the enquiry guidance. All previous FAQ, search, portfolio dialogs, galleries and contact handoff behavior remain.

Validation evidence is in `docs/preview`:

- `checks.json`: all 29 routes, shared interactions, responsive layouts and V6 preservation.
- `v7-checks.json`: the new company scenes and real animation frames, short desktop layouts, restored financing, section navigation, mobile, contact context and reduced motion.
- `polish-checks.json`: final mobile logos, title spacing and chapter labels.

Run `node versions/v7/tools/check.cjs`, `node versions/v7/tools/check-v7.cjs` or `node versions/v7/tools/check-polish.cjs` as appropriate. Preview helpers use the existing Chrome/Playwright installation in the adjacent design-system project.
