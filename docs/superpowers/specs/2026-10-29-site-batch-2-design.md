# Batch 2: admin dashboard, event placement, two-tone titles, contact, logos, portfolio

Date: 2026-10-29. Branch: `outreach-admin` (builds on the outreach admin, see `2026-10-29-outreach-admin-design.md`).

## Intent

The user reviewed the site and the new admin and asked for one batch of changes:
- **The admin looks poor.** It should look professional, and marketing must be able to choose whether an event shows as upcoming or past.
- **The page titles** should be two-tone, the way the brand does it.
- **The contact page** should respond to who is writing.
- **The floating logo groups** on Partnerships and Portfolio should show the organisations and startups that matter most.
- **The portfolio** should match the official "Start Up portfolio 2026" PDF, with a programme switch and a domain sidebar.

Success means the user opens each page and it looks deliberate and polished, not templated.

## Goals

### 1. Admin redesign: the "dashboard with side panel" direction (user picked option A from mockups)
- **Sidebar.** A dark ARTBlue-deep (`#1f0a8a`) sidebar shows the brand, the three sections with item counts (Events · News · Tenders), the signed-in email and Log out.
- **List area:**
  - a title, a summary line (e.g. "2 upcoming · 16 past"), and a "+ New …" button;
  - a search box that filters the list as you type;
  - rows with a thumbnail for events with a photo, a bold title, a muted meta line, and a status badge (Upcoming / Past / Active / Closed / RFP).
- **Editing.** Opens in a right-hand panel (about 380–440 px), so the list stays visible. On narrow screens the panel becomes a full-width sheet.
  - The form is grouped into sections, e.g. Basics · When & where · Photo · Links.
  - Save and Cancel stay visible at the bottom of the panel.
  - The photo upload is a drop zone with a preview.
- **Feedback.** Saving, saved and error states appear as a toast or inline banner. Delete keeps the inline "Delete? Yes / Cancel".
- **Unchanged behaviour.** All existing behaviour and the API stay the same: tender phase slider, document rows, field errors, size checks, `upload:N` references.
  - `tools/check-admin.cjs` must keep passing. Selectors may change, and the check is updated with them.
- **Look and feel.** The `frontend-design` skill guides the visual work, within the site tokens (`/_ds/colors_and_type.css`: ARTBlue `#3213b7`, mint `#aafcf0`, Ubuntu/Open Sans).
- **Login screen.** Restyled to match: a centred card on a soft ARTBlue-tinted background.

### 2. Event placement: "Show on site as"
- New event field `placement`: `'auto' | 'upcoming' | 'past'`, default `'auto'`.
  - **auto:** upcoming while `(end || start) >= today`, then past. This is today's behaviour, and the nightly rebuild keeps doing the move.
  - **upcoming / past:** forced, whatever the date.
- **Events page, Upcoming section:**
  - The **first 2 upcoming events by start date** keep today's big 16:9 cards.
  - Any further upcoming events show as **compact rows below them** (date · venue, title, Register → when there is a link). They use the past-events row style, so they need no photo.
  - With none, the existing empty-state message stays.
- **Photo rule.** A photo is still required for any event that will show as upcoming, so the top-2 cards always have one.
- **Existing events.** All existing events migrate to `placement: 'auto'`, so nothing changes visibly.
- **Admin control.** A 3-way segmented control "Auto · Upcoming · Past", with the hint "Auto: upcoming until the date passes".

### 3. Two-tone titles everywhere
- `src/data/titles.cjs` already maps every H1 to two tones: ink plus ARTBlue `<span class="tt">` (mint on dark heroes).
  - The build switched it off on 2026-10-28 (`tools/build.cjs`: `const twoTone = (h) => h;`).
  - Switch it back on.
- Check every page's H1 by screenshot. Titles not in the map use the "last word purple" rule, which is acceptable.
- The user's examples:
  - "Contact us." → "Contact **us.**"
  - Home already has its own highlight.

### 4. Contact page responds to "I am a…"
The roles stay Researcher · Startup · Builder · Industry partner · Media. Choosing one changes both the intro line under the H1 and the message box's label and placeholder. Copy (Claude's draft, the user may edit):

| Role | Intro line | Box label | Placeholder |
|---|---|---|---|
| Researcher | Working on research that could leave the lab? Tell us about it, and where you want to take it. | What research would you like to take further? | The problem, where the work stands today, and what would move it forward. |
| Startup | Building a deep-tech startup? Tell us what you're building and where you need help. | What does your startup need from us? | Your product, its stage, and where you're stuck: funding, labs, pilots or mentors. |
| Builder | Want to build at ARTPARK? Tell us what you make and what you're looking for. | What would you like to build with us? | Your skills or project, and the kind of team or problem you're after. |
| Industry partner | Looking to work with ARTPARK? Tell us about your organisation and the problem you want solved. | How would you like to partner with us? | Your organisation, the challenge, and how you'd like to work together. |
| Media | Writing about ARTPARK? Tell us about your story and your deadline. | What is your story about? | Your publication, the angle, and your deadline. |

- The sentence "Messages go to the ARTPARK team at connect@artpark.in." stays after every intro line.
- The default role (Researcher) is server-rendered, so the page reads correctly without JS. The switch is a few lines in `public/js/site.js`, next to the existing role-chip handler.
- The text changes in place (no layout jump). It is announced politely through `aria-live` on the intro paragraph.

### 5. Contact address text slightly smaller
- In `placeCard`, the place name goes from 18 px to 16 px and the address lines from 15 px to 14 px.
- The eyebrow and map stay as they are.

### 6. Partnerships floating logos
- **First five, in order:** Department of Science & Technology, Government of Karnataka, Indian Institute of Science, Bosch, NVIDIA.
  - AI Foundry: **IISc only for now** (user decision); AI Foundry is added later when a logo is supplied.
- **Then three of the current set** to fill the composition: Google, Amazon Web Services, MIT.
- The stage keeps 8 chips with the existing positions, drift and tilt values.

### 7. Portfolio
- **The list.**
  - Exactly the 36 startups in `/Users/apple/Downloads/Start Up portfolio 2026.pdf`.
  - **Removed:** Niral Networks, Velastra, Versor Robotics. This covers their portfolio cards, their story pages (`src/data/stories/<slug>.json`), their entries in `src/data/stories.json`. On the home page, Niral's slot in the 8-founder quote rail is filled by **another current startup's real founder quote and photo**, taken from its story file (user decision); Niral is also dropped from the `also` list, and the references in `about.cjs` if any. Old `/stories/<slug>` URLs redirect to `/portfolio` in `vercel.json`.
  - **Added:**
    - Idle Robotics (idlerobotics.com) — "GPS-independent navigation for robots and drones, using sensor fusion and on-device AI."
    - Venomics AI (venomics.ai) — "AI drug discovery that mines venom biodiversity for therapeutic peptides."
    - Arborum Labs (arborum.ai) — "Physics-grounded world models that let AI agents plan and run telecom and power networks."
  - The new startups' logos are extracted from the PDF (`pdfimages`, p.13 and p.14) and saved as webp in `public/assets/logos/`. Their cards link to their websites (new tab), since they have no story yet.
  - **Data stays in code** (`src/data/content.cjs`), per the user: startups are added and removed by a developer.
- **Domains.** Each startup gets `domains` (1–2 of the 7) and `programme` (`''` for now). The user approved this mapping after clicking through the prototype:
  - **Industry 5.0:** twara-robotics, kinesthetiq, nextoar, flo-mobility, contrivation-labs, spacyphy, sakar-robotics, open-science-stack, edgeverse, scivision-ai
  - **Defence & Aerospace:** comrado-aerospace, yaanendriya, algobotix, automind-dynamics, astrome, algofet, guerin-technologies, hyflex-mobility, vishvasys-aerospace, q-axis-motors, qosmic, nxtqube, idle-robotics, a-thon
  - **Foundational Models:** zenteiq, kinesthetiq, nextoar, venomics-ai, arborum-labs
  - **Robotics:** twara-robotics, yaanendriya, uncharted-ai, automind-dynamics, strider-robotics, flo-mobility, charukesi-health, sakar-robotics, acceleration-robotics, dexsent-robotics, idle-robotics
  - **MedTech:** strideaide, charukesi-health, floaid, venomics-ai, open-science-stack, udot
  - **Climate Tech:** rootsgoods, hyflex-mobility, contrivation-labs
  - **Wired & Wireless:** astrome, guerin-technologies, qosmic, arborum-labs
- **Layout.**
  - **Top right:** programme switch All · TIR · VIP. "All" is selected by default. TIR and VIP show "Programme lists coming soon. Showing all startups meanwhile." and keep all cards visible.
  - **Left:** a "Domain" sidebar with All domains (36) plus the 7 domains with counts. Selecting one filters the grid, with an ARTBlue left bar and tint on the active item.
  - **Sticky behaviour.** The sidebar is sticky on desktop. On phones (<760 px) it becomes a horizontal scrollable chip row above the grid.
  - **Old filters removed.** The old sector filter row (Defence & Aerospace, Space, Robotics & Automation …) goes.
  - **Cards** keep the current card design (logo panel, name, one-liner, Read story →). The bottom tag line shows the startup's domains in place of the old sector.
  - The `frontend-design` skill guides the polish (the user asked for it to be "presented in a better way" than the prototype). Counts update in the hero stat (36).
- **Floating logos** in the portfolio hero: Twara Robotics, Comrado Aerospace, Yaanendriya, KinesthetIQ, Uncharted AI, Strider Robotics, plus the existing "36 deep-tech startups" stat card.

## Non-goals
- No portfolio admin tab (user: "we will add with code").
- No TIR/VIP data yet.
- No AI Foundry logo yet.
- No changes to other pages beyond the title colours.

## Anti-goals
- Breaking any existing check: `node --test test/`, `check-links`, `check-all` (no overflow or JS errors at 1440 and 390), `check-home`, `check-admin`.
- Leaving any link to a removed startup anywhere on the site.
- Invented facts in startup copy.
  - **The 33 existing cards keep their current one-liners** (from artpark.in) (user decision).
  - Only the 3 new startups take theirs from the PDF.

## Approaches considered

| Item | Options | Picked |
|---|---|---|
| Admin look | A dashboard with side panel · B mirrors the live page with a full-page form | **A** (user) |
| 3+ upcoming events | 2 cards + rows below · only 2 shown · all cards | **2 cards + rows** (user) |
| Past/upcoming | auto by date with override · always manual | **auto + override** (user) |
| TIR/VIP before data | show with "coming soon" · hide · tag now | **coming soon** (user) |
| Portfolio data | JSON file, admin-ready · admin tab now · keep in code | **keep in code** (user) |

## Calls made by Claude
- The contact copy for the five roles (table above).
- The three partner logos filling the composition after the user's five: Google, AWS, MIT.
- The one-liners for the three new startups, condensed from the PDF.
- New-startup cards link to their websites.
- Removed startups' stories are deleted and redirected.
- Upcoming rows (3rd and later) use the past-row style.
- `placement` is added to `normalise()` and `validate()` in the API.
- "Photo required" uses the effective placement.
- The replacement founder for the home rail.
- The admin search box.
- The contact address font sizes (16 / 14 px).

## Left to the builder
Exact spacing and shadows within the tokens, the toast versus banner choice, and file organisation inside `public/admin/`.
