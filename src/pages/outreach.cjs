// Outreach (Events, News, Tenders), Careers and Partnerships.
// Ported from .reference/claude-design/Outreach-*.dc.html, Careers.dc.html, Partnerships.dc.html.
const { esc, page, pageIntro, floatStage, OUTREACH_TABS, R, linkRows, icon } = require('../lib.cjs');
const C = require('../data/content.cjs');
const M = require('../outreach/model.cjs');

const outreachIntro = (current, h1, lede, float) => pageIntro({ eyebrow: 'Outreach', h1, lede, float, tabs: { current, items: OUTREACH_TABS } });

// Round 8 floating compositions (real photos, outlets, documents and counts only).
const FLOAT_EVENTS = [
  { kind: 'win', src: '/assets/events/codebot.webp', x: 0, y: 4, w: 50, d: 1.4, r: -3, t: 8, cap: 'CodeBot Hackathon' },
  { kind: 'win', src: '/assets/events/roscon-in-24.webp', x: 47, y: -4, w: 53, d: 0.8, r: 2.5, t: 9, cap: 'ROSCon India' },
  { kind: 'win', src: '/assets/events/5g-open-house.webp', x: 20, y: 50, w: 50, d: 1.9, r: -1, t: 7, cap: '5G Test Lab' },
  { kind: 'stat', n: String(C.upcomingEvents.length), l: C.upcomingEvents.length === 1 ? 'upcoming event' : 'upcoming events', x: 70, y: 56, w: 30, d: 2.6, r: 3, t: 6 },
];
const OUTLETS = ['The Economic Times', 'Forbes India', 'Mint', 'Deccan Herald', 'Moneycontrol', 'Hindustan Times'];
const FLOAT_NEWS = [
  ...OUTLETS.map((o, i) => ({ kind: 'chip', text: o, x: [2, 46, 8, 56, 26, 62][i], y: [2, 10, 34, 40, 66, 74][i], w: [46, 36, 26, 40, 44, 36][i], d: [1.2, 0.8, 2, 1.5, 1, 2.2][i], r: [-2, 2, -1, 1.5, -1.5, 2][i], t: 6 + i })),
  { kind: 'stat', n: String(C.news.length), l: 'stories about ARTPARK in the press', x: 0, y: 58, w: 30, d: 2.6, r: -3, t: 7 },
];
const FLOAT_TENDERS = [
  { kind: 'doc', tag: 'PDF', text: 'Tender document', sub: 'Supply of GPU Edge Cloud System', x: 4, y: 4, w: 50, d: 1.2, r: -3, t: 8 },
  { kind: 'doc', tag: 'PDF', text: 'Corrigendum', sub: '28 Feb 2025', x: 52, y: 14, w: 42, d: 0.8, r: 3, t: 9 },
  { kind: 'doc', tag: 'PDF', text: 'Minutes of the commercial bid opening', sub: '17 Mar 2025', x: 16, y: 52, w: 54, d: 1.9, r: -1, t: 7 },
  { kind: 'stat', n: String(C.tenders.length), l: 'procurement notices on this page', x: 70, y: 58, w: 30, d: 2.6, r: 3, t: 6 },
];

// ---------- Events (Outreach-Events.dc.html) ----------
const events = {
  route: R.events,
  html: () => page({
    title: 'Events — ARTPARK Outreach', active: 'outreach', sub: 'events',
    description: 'ARTPARK Open Days, summits, talks, challenges and hackathons.',
    body: outreachIntro('events', 'Events.', 'Open Days, summits, talks, challenges and hackathons.', FLOAT_EVENTS) + `
  <div style="max-width:1180px;margin:0 auto;padding:48px 24px 112px;display:flex;flex-direction:column;gap:56px">
    <section>
      <span class="eyebrow">Upcoming</span>
      ${!C.upcomingEvents.length ? '<p style="font-size:15px;color:var(--ink-soft);margin-top:16px">No upcoming events right now. Follow ARTPARK on <a href="https://www.linkedin.com/company/artpark-in/">LinkedIn</a> for the next one.</p>' : `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:16px">
${C.upcomingEvents.slice(0, 2).map((e) => `        <div class="lift" style="border:1px solid var(--line);display:flex;flex-direction:column">
          <div data-win style="position:relative;width:100%;aspect-ratio:16/9;background:var(--paper-soft);overflow:hidden"><img src="${esc(e.image)}" alt="${esc(e.imageAlt)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block"></div>
          <div style="padding:22px 24px;display:flex;flex-direction:column;gap:8px">
            <span style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;letter-spacing:0.14em;color:var(--ink-dim)"><span class="dot green"></span>${esc((M.formatRange(e.start, e.end) + (e.venue ? ' · ' + e.venue : '')).toUpperCase())}</span>
            <h3 style="font-size:22px">${esc(e.title)}</h3>
            <p style="font-size:14.5px;line-height:1.6;color:var(--ink-soft)">${esc(e.blurb)}${e.time ? ' ' + esc(e.time) + '.' : ''}</p>
            ${e.register ? `<a href="${esc(e.register)}" target="_blank" rel="noopener" style="font-family:var(--font-display);font-weight:700;font-size:14px;text-decoration:none;margin-top:6px">Register →</a>` : ''}
          </div>
        </div>`).join('\n')}
      </div>${C.upcomingEvents.length > 2 ? `<div style="border-top:1px solid var(--line-strong);margin-top:24px">
${C.upcomingEvents.slice(2).map((e) => `        <div class="sweep-row" data-upcoming-row style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:6px 24px;padding:20px 0;border-bottom:1px solid var(--line);align-items:baseline">
          <span style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--ink-dim)"><span class="dot green"></span>${esc(M.formatRange(e.start, e.end))}${e.venue ? ' · ' + esc(e.venue) : ''}</span>
          <span style="grid-column:span 2;font-family:var(--font-display);font-weight:700;font-size:18px;line-height:1.3">${esc(e.title)}</span>
          ${e.register ? `<a href="${esc(e.register)}" target="_blank" rel="noopener" style="font-size:14px;font-weight:600;justify-self:end">Register →</a>` : M.eventHasPage(e) ? `<a href="${R.events}/${e.id}" style="font-size:14px;font-weight:600;justify-self:end">Details →</a>` : ''}
        </div>`).join('\n')}
      </div>` : ''}`}
    </section>
    <section>
      <span class="eyebrow">Past events</span>
      <div style="border-top:1px solid var(--line-strong);margin-top:16px">
${C.pastEvents.map((p) => `        <div class="sweep-row"${p.image ? ` data-peek="${esc(p.image)}"` : ''} style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:6px 24px;padding:20px 0;border-bottom:1px solid var(--line);align-items:baseline">
          <span style="font-size:13px;color:var(--ink-dim)">${esc(M.formatRange(p.start, p.end))}${p.venue ? ' · ' + esc(p.venue) : ''}</span>
          <span style="grid-column:span 2;font-family:var(--font-display);font-weight:700;font-size:18px;line-height:1.3">${esc(p.title)}</span>
          ${M.eventHasPage(p) ? `<a href="${R.events}/${p.id}" style="font-size:14px;font-weight:600;justify-self:end">Recap →</a>` : p.recap ? `<a href="${esc(p.recap)}" target="_blank" rel="noopener" style="font-size:14px;font-weight:600;justify-self:end">Recap →</a>` : ''}
        </div>`).join('\n')}
      </div>
    </section>
  </div>`,
  }),
};

// ---------- Event detail pages: every event without a recap link, from its text in events.json ----------
const eventPages = C.outreach.events.filter(M.eventHasPage).map((e) => {
  const body = e.body.length ? e.body : [e.blurb];
  return {
    route: `${R.events}/${e.id}`,
    html: () => page({
      title: `${e.title} — ARTPARK Events`, active: 'outreach', sub: 'events', description: body[0] || e.title,
      body: pageIntro({ eyebrow: 'Events', h1: esc(e.title) + '.', lede: esc(M.formatRange(e.start, e.end) + (e.venue ? ' · ' + e.venue : '')) }) + `
  <div style="max-width:1180px;margin:0 auto;padding:48px 24px 112px">
    ${e.image ? `<figure style="margin:0 0 40px;max-width:860px"><div data-win style="position:relative;width:100%;aspect-ratio:16/9;background:var(--paper-soft);overflow:hidden"><img src="${esc(e.image)}" alt="${esc(e.title)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block"></div></figure>` : ''}
    <article style="max-width:760px;display:flex;flex-direction:column;gap:16px;font-size:17px;line-height:1.75;color:var(--ink-soft)">
${body.map((l) => `      <p>${esc(l)}</p>`).join('\n')}
    </article>
    <a href="${R.events}" style="display:inline-block;margin-top:40px;font-family:var(--font-display);font-weight:700;font-size:14px;text-decoration:none">← All events</a>
  </div>`,
    }),
  };
});

// ---------- News (Outreach-News.dc.html) ----------
const news = {
  route: R.news,
  html: () => page({
    title: 'News — ARTPARK Outreach', active: 'outreach', sub: 'news',
    description: 'ARTPARK and its projects in the press.',
    body: outreachIntro('news', 'In the news.', 'ARTPARK and its projects in the press.', FLOAT_NEWS) + `
  <div style="max-width:1180px;margin:0 auto;padding:48px 24px 112px">
    ${linkRows(C.news.map((n) => ({ meta: n.dateLabel || n.date ? `${n.dateLabel || M.formatLong(n.date)} · ${n.outlet}` : n.outlet, title: n.title, href: n.url })))}
    <section id="publications" style="margin-top:72px;scroll-margin-top:132px">
      <span class="eyebrow">Publications</span>
      <div style="margin-top:16px">${linkRows([
        { meta: 'September 2024 · White paper', title: 'Legal Framework for Open-Sourcing Language Data in India', href: '/publications/legal-framework-language-data' },
        { meta: '11 November 2023 · White paper', title: 'The LLM Landscape for LMICs', href: '/publications/llm-landscape-lmics' },
      ])}</div>
    </section>
    <section style="margin-top:72px">
      <span class="eyebrow">Let’s Talk @ ARTPARK</span>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr));gap:24px;margin-top:16px;align-items:center">
        <div style="position:relative;aspect-ratio:16/9;background:var(--artblack)"><iframe src="https://www.youtube.com/embed/fZntmGY10Uk" title="Let’s Talk @ ARTPARK, episode 1 with Dr. Vishal Rao" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div>
        <div><h2 style="font-size:26px;line-height:1.2">Episode 1, with Dr. Vishal Rao.</h2><p style="margin-top:10px;font-size:16px;line-height:1.7;color:var(--ink-soft)">Conversations with the people building at ARTPARK and around it.</p><a href="https://www.youtube.com/channel/UCW_92hCpIIoiYsR5NYebEag" target="_blank" rel="noopener" style="display:inline-block;margin-top:14px;font-family:var(--font-display);font-weight:700;font-size:14px;text-decoration:none">More on ARTPARK’s YouTube channel →</a></div>
      </div>
    </section>
  </div>`,
  }),
};

// ---------- Tenders (Outreach-Tenders.dc.html: list + detail; the sample vendor-registration flow is not used) ----------
const STATUS = { active: ['Active', 'green'], closed: ['Closed', 'coral'], rfp: ['Request for proposals', ''] };
// Round 8 tenders rework: each tender shows the stages it has reached, read from its own published documents and notes.
const stageTrack = (t) => `<ol class="t-track">${M.tenderStages(t).map(([l, done, d]) => `<li class="${done ? 'is-done' : ''}"><i></i><span>${esc(l)}</span>${d ? `<small>${esc(d)}</small>` : ''}</li>`).join('')}</ol>`;
const tenders = {
  route: R.tenders,
  html: () => page({
    title: 'Tenders — ARTPARK Outreach', active: 'outreach', sub: 'tenders',
    description: 'Procurement notices, tender documents and requests for proposals from ARTPARK.',
    body: outreachIntro('tenders', 'Tenders.', 'Procurement notices from ARTPARK. Download the documents for each tender, including corrigenda and bid-opening outputs.', FLOAT_TENDERS) + `
  <div style="max-width:1180px;margin:0 auto;padding:48px 24px 112px" data-tenders>
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px;padding-bottom:20px;border-bottom:1px solid var(--line)">
      <div style="display:flex;flex-wrap:wrap;gap:8px" role="group" aria-label="Filter tenders">
${['All', 'Active', 'Closed', 'Requests for proposals'].map((l, i) => `        <button type="button" data-filter="${['all', 'active', 'closed', 'rfp'][i]}" aria-pressed="${i === 0}" style="border:1px solid ${i === 0 ? 'var(--artblack)' : 'var(--line-strong)'};background:${i === 0 ? 'var(--artblack)' : 'transparent'};color:${i === 0 ? '#fff' : 'var(--ink)'};padding:7px 16px;font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.08em;border-radius:2px;cursor:pointer;transition:all 150ms ease">${l.toUpperCase()}</button>`).join('\n')}
      </div>
      <span style="font-size:13px;color:var(--ink-dim)">Questions about a tender: <a href="mailto:connect@artpark.in">connect@artpark.in</a></span>
    </div>
    <div>
${C.tenders.map((t) => `      <div data-item data-status="${t.status}" class="t-row" style="border-bottom:1px solid var(--line)">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px 24px;padding:22px 0;align-items:center">
          <div style="grid-column:span 2;min-width:0">
            <div style="font-size:12px;font-weight:600;letter-spacing:0.1em;color:var(--ink-dim)">${esc(t.cat.toUpperCase())}${t.published ? ' · ' + esc(M.formatShort(t.published).toUpperCase()) : ''}</div>
            <div style="font-family:var(--font-display);font-weight:700;font-size:18px;line-height:1.3;margin-top:4px">${esc(t.title)}</div>
            <div style="font-size:13.5px;color:var(--ink-soft);margin-top:4px">${t.docs.length ? t.docs.length + (t.docs.length === 1 ? ' document' : ' documents') : 'Document on request'}</div>
            ${t.status === 'rfp' ? '' : stageTrack(t)}
          </div>
          <div style="font-size:14px"><span style="display:block;font-size:11px;font-weight:600;letter-spacing:0.14em;color:var(--ink-dim)">TYPE</span>${t.status === 'rfp' ? 'RFP' : 'Tender'}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
            <span style="display:flex;align-items:center;gap:8px;font-size:13.5px"><span class="dot ${STATUS[t.status][1]}"></span>${STATUS[t.status][0]}</span>
            <button type="button" class="btn btn-ghost" data-open aria-expanded="false" aria-controls="tender-${t.id}" style="padding:8px 14px">View <span class="arrow">→</span></button>
          </div>
        </div>
        <div id="tender-${t.id}" hidden style="padding:0 0 26px">
          ${t.note ? `<p style="max-width:760px;font-size:15px;line-height:1.7;color:var(--ink-soft);margin-bottom:14px">${esc(t.note)}</p>` : ''}
          ${t.docs.length ? `<div class="t-docs">
${t.docs.map(({ label: n, href, kind }) => `            <a class="t-doc" href="${esc(href)}" target="_blank" rel="noopener"><em class="t-kind is-${esc(kind.toLowerCase())}">${esc(kind)}</em><b>${esc(n)}</b><span>Download <span class="arrow">→</span></span></a>`).join('\n')}
          </div>` : ''}
        </div>
      </div>`).join('\n')}
    </div>

    <section style="margin-top:72px">
      <span class="eyebrow">How tendering works</span>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1px;background:var(--line);border:1px solid var(--line);margin-top:16px">
        <div style="background:var(--paper);padding:24px;display:flex;flex-direction:column;gap:8px"><span style="font-family:var(--font-display);font-weight:700;font-size:28px;color:var(--artblue)">01</span><b style="font-family:var(--font-display);font-size:17px">Read the notice</b><p style="font-size:14px;line-height:1.6;color:var(--ink-soft)">Download the tender document and check the eligibility, scope and important dates.</p></div>
        <div style="background:var(--paper);padding:24px;display:flex;flex-direction:column;gap:8px"><span style="font-family:var(--font-display);font-weight:700;font-size:28px;color:var(--artblue)">02</span><b style="font-family:var(--font-display);font-size:17px">Review the tender</b><p style="font-size:14px;line-height:1.6;color:var(--ink-soft)">Attend the pre-bid meeting where one is held, and check any corrigenda.</p></div>
        <div style="background:var(--paper);padding:24px;display:flex;flex-direction:column;gap:8px"><span style="font-family:var(--font-display);font-weight:700;font-size:28px;color:var(--artblue)">03</span><b style="font-family:var(--font-display);font-size:17px">Submit your bid</b><p style="font-size:14px;line-height:1.6;color:var(--ink-soft)">Technical and commercial bids, as specified in the tender document, before the closing date.</p></div>
        <div style="background:var(--paper);padding:24px;display:flex;flex-direction:column;gap:8px"><span style="font-family:var(--font-display);font-weight:700;font-size:28px;color:var(--artblue)">04</span><b style="font-family:var(--font-display);font-size:17px">Evaluation &amp; award</b><p style="font-size:14px;line-height:1.6;color:var(--ink-soft)">Bids are opened and evaluated as published; outputs are posted on this page.</p></div>
      </div>
    </section>
  </div>`,
  }),
};

// ---------- Careers (Careers.dc.html) ----------
const ago = (iso) => {
  const d = Math.round((new Date('2026-10-24T12:00:00Z') - new Date(iso)) / 86400000);
  return d <= 0 ? 'Today' : d === 1 ? '1 day ago' : `${d} days ago`;
};
const CATS = ['All categories', 'Engineering', 'Research', 'Product & Design', 'Operations & Business', 'Leadership'];
const MODES = ['All', 'Hybrid', 'On-site', 'Remote (India)'];
const careers = {
  route: R.careers,
  html: () => page({
    title: 'Careers — ARTPARK', active: 'careers',
    description: 'Open roles on the ARTPARK team and at TIR startups building at ARTPARK.',
    body: `
  <section style="padding:clamp(56px,8vw,96px) 0 0">
    <div style="max-width:1180px;margin:0 auto;padding:0 24px">
      <div class="eyebrow-rule">Careers</div>
      <h1 style="font-size:clamp(44px,6.4vw,80px);line-height:1.03;margin-top:20px">Work at ARTPARK.</h1>
      <p style="margin-top:24px;max-width:680px;font-size:18px;line-height:1.7;color:var(--ink-soft)">Roles at ARTPARK, and at startups hiring through ARTPARK — for engineers, researchers and operators who like the work between a lab result and real-world use.</p>
    </div>
  </section>

  <div data-careers class="careers-grid" style="max-width:1180px;margin:0 auto;padding:56px 24px 112px;display:flex;flex-wrap:wrap;gap:40px 48px;align-items:flex-start">
    <aside style="flex:0 1 260px;min-width:220px;display:flex;flex-direction:column;gap:32px">
      <div style="display:flex;flex-direction:column;gap:10px">
        <span class="eyebrow">Search</span>
        <input class="field" type="search" data-q placeholder="Title, skill, team…" aria-label="Search roles">
      </div>
      <div style="display:flex;flex-direction:column;gap:4px" role="group" aria-label="Employer">
        <span class="eyebrow" style="margin-bottom:6px">Employer</span>
${[['all', 'Everyone', C.jobs.length], ['artpark', 'ARTPARK team', C.jobs.filter((j) => j.atArtpark).length], ['startup', 'TIR startups', C.jobs.filter((j) => !j.atArtpark).length]].map(([k, l, n], i) => `        <button type="button" data-org="${k}" aria-pressed="${i === 0}" style="display:flex;justify-content:space-between;align-items:center;width:100%;text-align:left;border:0;border-radius:2px;padding:11px 14px;background:${i === 0 ? 'var(--artblue)' : 'transparent'};color:${i === 0 ? '#fff' : 'var(--ink)'};font:inherit;font-size:15px;cursor:pointer;transition:background 150ms ease,color 150ms ease"><span>${l}</span><span style="font-size:13px;opacity:0.75">${n}</span></button>`).join('\n')}
      </div>
      <div style="display:flex;flex-direction:column;gap:4px" role="group" aria-label="Category">
        <span class="eyebrow" style="margin-bottom:6px">Category</span>
${CATS.map((c, i) => {
  const n = i === 0 ? C.jobs.length : C.jobs.filter((j) => j.cat === c).length;
  const off = i > 0 && n === 0;
  return `        <button type="button" data-cat="${esc(c)}" aria-pressed="${i === 0}"${off ? ' disabled' : ''} style="display:flex;justify-content:space-between;align-items:center;width:100%;text-align:left;border:0;border-radius:2px;padding:11px 14px;background:${i === 0 ? 'var(--artblue)' : 'transparent'};color:${i === 0 ? '#fff' : off ? 'var(--ink-dim)' : 'var(--ink)'};font:inherit;font-size:15px;cursor:${off ? 'default' : 'pointer'};transition:background 150ms ease,color 150ms ease"><span>${esc(c)}</span><span style="font-size:13px;opacity:0.75">${i === 0 ? '' : n || ''}</span></button>`;
}).join('\n')}
      </div>
      <div style="display:flex;flex-direction:column;gap:4px" role="group" aria-label="Work mode">
        <span class="eyebrow" style="margin-bottom:6px">Work mode</span>
${MODES.map((m, i) => `        <button type="button" data-mode="${esc(m)}" aria-pressed="${i === 0}" style="display:flex;width:100%;text-align:left;border:0;border-radius:2px;padding:11px 14px;background:${i === 0 ? 'var(--artblue)' : 'transparent'};color:${i === 0 ? '#fff' : 'var(--ink)'};font:inherit;font-size:15px;cursor:pointer;transition:background 150ms ease,color 150ms ease">${esc(m)}</button>`).join('\n')}
      </div>
    </aside>

    <div style="flex:1 1 560px;min-width:0">
      <p style="font-size:18px;color:var(--ink-soft)"><b data-count style="font-family:var(--font-display);color:var(--ink)">${C.jobs.length} open roles</b>: ${C.jobs.filter((j) => j.atArtpark).length} on the ARTPARK team, ${C.jobs.filter((j) => !j.atArtpark).length} at startups building at ARTPARK.</p>
${[[true, 'artpark', 'On the ARTPARK team', 'Roles at ARTPARK itself, in Bengaluru.'], [false, 'startup', 'At startups building at ARTPARK', 'These companies are in ARTPARK’s Technology Innovators in Residence (TIR) program. You join the startup; ARTPARK lists the role and runs the application.']].map(([at, key, h, sub]) => `      <section class="job-group" data-group="${key}">
        <div style="margin-top:40px;display:flex;flex-direction:column;gap:6px"><span class="eyebrow">${at ? 'ARTPARK team' : 'TIR startups'}</span><h2 style="font-size:26px">${h}</h2><p style="font-size:15px;line-height:1.65;color:var(--ink-soft);max-width:640px">${sub}</p></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-top:24px">
${C.jobs.filter((j) => j.atArtpark === at).map((j) => `          <article data-job data-org="${key}" data-cat="${esc(j.cat)}" data-mode="${esc(j.mode)}" data-text="${esc([j.title, j.company, j.about, j.desc, j.cat, ...j.tags].join(' ').toLowerCase())}" style="border:1px solid var(--line);padding:28px;display:flex;flex-direction:column;gap:14px;border-radius:2px">
            <div style="display:flex;align-items:center;gap:14px">
              <span style="width:44px;height:44px;flex:none;display:flex;align-items:center;justify-content:center;background:var(--paper-soft);color:var(--artblue);font-family:var(--font-display);font-weight:700;font-size:15px;border-radius:2px">${at ? '<img src="/assets/brand/artpark-logo.png" alt="" style="width:30px;height:30px;object-fit:cover;object-position:left center">' : 'TIR'}</span>
              <div><div style="font-family:var(--font-display);font-weight:700;font-size:16px;color:var(--artblue)">${esc(j.company)}</div><div style="font-size:13px;color:var(--ink-dim)">${at ? 'Internal hiring' : 'TIR startup · hiring via ARTPARK'}</div></div>
            </div>
            <h2 style="font-size:22px;line-height:1.2">${esc(j.title)}</h2>
            <p style="font-size:15px;line-height:1.6;color:var(--ink-soft)">${esc(j.desc)}</p>
            <div style="font-size:14px;color:var(--ink-soft)">${esc([j.location, j.type, j.mode].join(' · '))}</div>
            <div style="margin-top:auto;padding-top:14px;border-top:1px solid var(--line);display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px">
              <div style="display:flex;flex-wrap:wrap;gap:6px">${j.tags.map((t) => `<span style="font-size:12.5px;padding:4px 10px;border:1px solid var(--line-strong);background:var(--paper-soft);color:var(--artblue);border-radius:2px">${esc(t)}</span>`).join('')}</div>
              <span style="font-size:13px;color:var(--ink-dim)">${ago(j.postedAt)}</span>
            </div>
            <a href="${R.careers}/${j.slug}" style="font-family:var(--font-display);font-weight:700;font-size:14px;text-decoration:none">View role →</a>
          </article>`).join('\n')}
        </div>
      </section>`).join('\n')}
      <div data-empty hidden style="border:1px solid var(--line);padding:28px;margin-top:8px;font-size:15px;color:var(--ink-soft)">No roles listed for this filter yet.</div>
      <p style="margin-top:20px;font-size:13px;color:var(--ink-dim)">Roles as listed on <a href="https://www.artparkcareers.in/" target="_blank" rel="noopener">artparkcareers.in</a> on 24 October 2026. Each role page has the latest details and how to apply.</p>
      <div style="margin-top:40px;background:var(--paper-soft);padding:32px clamp(24px,3vw,36px);display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:20px">
        <div style="flex:1 1 360px"><h2 style="font-size:26px">Don't see your role.</h2><p style="margin-top:8px;font-size:15px;line-height:1.65;color:var(--ink-soft)">Send a short note on the problem you'd like to work on and why.</p></div>
        <a class="btn btn-primary" href="${R.contact}">Write to us <span class="arrow">→</span></a>
      </div>
    </div>
  </div>`,
  }),
};

// ---------- Partnerships (Partnerships.dc.html) ----------
const T = (name, label, opts = {}) => ({ name, label, kind: 'input', type: 'text', ...opts });
const TYPES = [
  { key: 'industry', label: 'Industry', who: 'Companies with a real problem, a real environment or a product line to extend', title: 'Bring us a problem from your operations.',
    offers: ['Co-develop technology with ARTPARK teams and startups', 'Pilot unfinished technology in your plants, fleets or networks', 'Sponsor applied research and access IISc expertise'],
    fields: [T('org', 'Company *', { req: true }), T('name', 'Your name *', { req: true }), T('role', 'Role / designation'), T('email', 'Work email *', { type: 'email', req: true }),
      { name: 'sector', label: 'Sector', kind: 'select', options: ['Manufacturing', 'Automotive & mobility', 'Healthcare & medtech', 'Agriculture & food', 'Telecom & electronics', 'Energy & infrastructure', 'Other'] },
      { name: 'interest', label: 'How would you like to work with us', kind: 'chips', options: ['Co-develop', 'Pilot / test', 'Sponsor research', 'Invest', 'Hire talent'] },
      { name: 'problem', label: 'The problem you want solved', kind: 'area', ph: 'What are you trying to do, and what has stopped it working so far?', span: true }] },
  { key: 'government', label: 'Government & public sector', who: 'Ministries, state departments, municipal bodies and PSUs', title: 'Turn a public challenge into a deployable system.',
    offers: ['Mission-mode projects on problems specific to India', 'Field pilots with measurable outcomes before scale-up', 'Open datasets and public digital infrastructure'],
    fields: [T('org', 'Department / agency *', { req: true }), { name: 'level', label: 'Level', kind: 'select', options: ['Central', 'State', 'District / municipal', 'PSU', 'Other'] },
      T('name', 'Name *', { req: true }), T('role', 'Designation'), T('email', 'Official email *', { type: 'email', req: true }), T('location', 'Proposed pilot location'),
      { name: 'area', label: 'Area', kind: 'chips', options: ['Health', 'Agriculture', 'Mobility', 'Infrastructure', 'Language & digital', 'Education'] },
      { name: 'problem', label: 'The challenge', kind: 'area', ph: 'Who is affected, what exists today, and what a good outcome would look like.', span: true }] },
  { key: 'academic', label: 'Academic & research', who: 'Faculty, labs and research institutions with a promising result', title: 'Take a lab result into the field.',
    offers: ['Engineering support to build the second and third prototype', 'Test facilities and realistic validation environments', 'Pathways to industry partners, licensing or a venture'],
    fields: [T('org', 'Institution *', { req: true }), T('lab', 'Department / lab'), T('name', 'Principal investigator *', { req: true }), T('email', 'Email *', { type: 'email', req: true }),
      { name: 'trl', label: 'Technology readiness', kind: 'select', options: ['TRL 1–2 · concept', 'TRL 3 · lab-validated', 'TRL 4–5 · prototype', 'TRL 6+ · field-tested', 'Not sure'] },
      T('field', 'Research area'),
      { name: 'need', label: 'What you need', kind: 'chips', options: ['Engineering', 'Test facilities', 'Industry partner', 'Funding', 'Translation advice'] },
      { name: 'problem', label: 'Your result, in plain words', kind: 'area', ph: 'What works today, how you know, and what it could be used for.', span: true }] },
  { key: 'philanthropy', label: 'Philanthropy & CSR', who: 'Foundations, CSR programmes and multilateral funders', title: 'Fund the work between research and impact.',
    offers: ['Programmes with clear milestones and public reporting', 'Open datasets and shared resources others can build on', 'Fellowships for innovators in residence', 'ARTPARK is eligible for CSR contributions (CSR00017521) and Section 80G deductions'],
    fields: [T('org', 'Organisation *', { req: true }), { name: 'orgType', label: 'Type', kind: 'select', options: ['Foundation', 'CSR programme', 'Multilateral / bilateral', 'Individual philanthropist', 'Other'] },
      T('name', 'Name *', { req: true }), T('email', 'Email *', { type: 'email', req: true }),
      { name: 'focus', label: 'Focus areas', kind: 'chips', options: ['Health', 'Agriculture', 'Language & inclusion', 'Climate', 'Education', 'Livelihoods'] },
      { name: 'support', label: 'Intended support', kind: 'select', options: ['Programme grant', 'Fellowships', 'Open data & public goods', 'Infrastructure', 'To discuss'] },
      { name: 'problem', label: 'Anything we should know', kind: 'area', ph: 'Priorities, geography, timelines.', span: true }] },
  { key: 'investors', label: 'Investors & ecosystem', who: 'VCs, angels, accelerators and other incubators', title: 'Back deep-tech teams early and patiently.',
    offers: ['Access to ARTPARK portfolio companies and VC & Corporate Open Days', 'Co-investment alongside ARTPARK', 'Mentoring and technical diligence with IISc experts'],
    fields: [T('org', 'Fund / organisation *', { req: true }), T('name', 'Name *', { req: true }), T('email', 'Email *', { type: 'email', req: true }), T('cheque', 'Typical cheque size'),
      { name: 'stage', label: 'Stage focus', kind: 'chips', options: ['Pre-seed', 'Seed', 'Series A', 'Growth'] },
      { name: 'interest', label: 'Interest', kind: 'chips', options: ['Co-invest', 'Deal flow', 'Mentor', 'Demo days'] },
      { name: 'problem', label: 'Thesis or sectors of interest', kind: 'area', ph: 'What you look for in a deep-tech team.', span: true }] },
];

const field = (f) => {
  const span = f.span ? 'grid-column:1 / -1' : 'grid-column:auto';
  let ctl = '';
  if (f.kind === 'input') ctl = `<input class="field" name="${f.name}" type="${f.type}" aria-label="${esc(f.label)}"${f.req ? ' data-req' : ''}>`;
  if (f.kind === 'area') ctl = `<textarea class="field" name="${f.name}" rows="4" placeholder="${esc(f.ph || '')}" aria-label="${esc(f.label)}"></textarea>`;
  if (f.kind === 'select') ctl = `<select class="field" name="${f.name}" aria-label="${esc(f.label)}"><option value="">Select</option>${f.options.map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
  if (f.kind === 'chips') ctl = `<div data-chips="${f.name}" style="display:flex;flex-wrap:wrap;gap:8px">${f.options.map((o) => `<button type="button" data-chip="${esc(o)}" aria-pressed="false" style="border:1px solid var(--line-strong);background:transparent;color:var(--ink);padding:8px 14px;font-family:var(--font-display);font-weight:700;font-size:13px;border-radius:2px;cursor:pointer;transition:all 150ms ease">${esc(o)}</button>`).join('')}</div>`;
  return `                <div style="display:flex;flex-direction:column;gap:8px;${span}"><span class="eyebrow">${esc(f.label)}</span>${ctl}</div>`;
};

// User (2026-10-29): DST, Government of Karnataka, IISc, Bosch and NVIDIA first (AI Foundry once a logo is supplied).
const PICK = ['Department of Science & Technology', 'Government of Karnataka', 'Indian Institute of Science', 'Bosch', 'NVIDIA', 'Google', 'Amazon Web Services', 'MIT'];
const ALLP = C.partners.flatMap((g) => g.items);
const FLOAT_PARTNERS = [
  ...PICK.map((n, i) => ({ kind: 'chip', logo: ALLP.find((p) => p.name === n).logo, x: [0, 52, 24, 66, 2, 40, 70, 20][i], y: [0, 4, 24, 30, 48, 54, 74, 76][i], w: [40, 40, 36, 32, 34, 44, 30, 34][i], d: [1.2, 0.8, 2, 1.5, 1, 2.2, 1.6, 2.4][i], r: [-2, 2, -1, 1.5, -1.5, 1, 2, -2][i], t: 6 + (i % 4) })),
];
const partnerships = {
  route: R.partnerships,
  html: () => page({
    title: 'Partnerships — ARTPARK', active: 'partnerships',
    description: 'Government, industry, academic and philanthropic partners of ARTPARK, and how to partner with us.',
    body: `
  <section style="padding:clamp(56px,8vw,96px) 0 0">
    <div class="intro-wrap has-float" style="max-width:1180px;margin:0 auto;padding:0 24px;position:relative">
      ${floatStage(FLOAT_PARTNERS)}<div class="eyebrow-rule">Partnerships</div>
      <h1 style="font-size:clamp(44px,6.4vw,80px);line-height:1.03;margin-top:20px">Partners.</h1>
      <p style="margin-top:24px;max-width:680px;font-size:18px;line-height:1.7;color:var(--ink-soft)">ARTPARK works as a bridge between research, academia, industry and government. These organisations, institutions and ministries share their expertise and resources to help steer India-first innovation in deep tech.</p>
      <a class="btn btn-primary" href="#partner" style="margin-top:28px">Become a partner <span class="arrow">→</span></a>
    </div>
  </section>

  <div style="max-width:1180px;margin:0 auto;padding:56px 24px 112px;display:flex;flex-direction:column;gap:56px">
${C.partners.map((g) => `    <section>
      <span class="eyebrow">${esc(g.label)}</span>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));border-top:1px solid var(--line);border-left:1px solid var(--line);margin-top:16px">
${g.items.map((p) => `        <div class="mag mag-cell" title="${esc(p.name)}" style="background:var(--paper);border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:18px 20px;height:84px;position:relative;display:flex;align-items:center;justify-content:center"><img src="${p.logo}" alt="${esc(p.name)}" loading="lazy" style="max-width:100%;max-height:50px;object-fit:contain;display:block"></div>`).join('\n')}
      </div>
    </section>`).join('\n')}
  </div>

  <section id="partner" data-screen-label="Partner with us" data-partner style="background:var(--paper-soft);padding:clamp(64px,9vw,112px) 0;scroll-margin-top:80px">
    <div style="max-width:1180px;margin:0 auto;padding:0 24px">
      <div class="eyebrow-rule">Partner with us</div>
      <h2 style="font-size:clamp(34px,4.6vw,52px);line-height:1.06;margin-top:16px;max-width:860px">Help a breakthrough reach the real world.</h2>
      <p style="margin-top:18px;max-width:680px;font-size:17px;line-height:1.7;color:var(--ink-soft)">Each kind of partner brings something different — a real environment, a hard problem, a lab result, patient capital. Pick the one that describes you; the form asks only what we need to start a useful conversation.</p>

      <div class="partner-layout" style="display:flex;flex-wrap:wrap;gap:32px 48px;margin-top:48px;align-items:flex-start">
        <div role="tablist" aria-label="Partner type" style="flex:0 1 300px;min-width:240px;display:flex;flex-direction:column;gap:6px">
${TYPES.map((t, i) => `          <button type="button" role="tab" data-ptype="${t.key}" aria-selected="${i === 0}" aria-controls="ptype-${t.key}" style="text-align:left;border:1px solid ${i === 0 ? 'var(--artblue)' : 'var(--line)'};background:${i === 0 ? 'var(--artblue)' : 'var(--paper)'};color:${i === 0 ? '#fff' : 'var(--ink)'};padding:16px 18px;border-radius:2px;cursor:pointer;font:inherit;transition:background 150ms ease,color 150ms ease,border-color 150ms ease">
            <span style="display:block;font-family:var(--font-display);font-weight:700;font-size:16px">${esc(t.label)}</span>
            <span style="display:block;font-size:13px;line-height:1.45;margin-top:3px;opacity:0.85">${esc(t.who)}</span>
          </button>`).join('\n')}
        </div>
${TYPES.map((t, i) => `        <div id="ptype-${t.key}" role="tabpanel" data-ppanel="${t.key}"${i === 0 ? '' : ' hidden'} style="flex:1 1 560px;min-width:0;background:var(--paper);border:1px solid var(--line);border-top:3px solid var(--artblue);padding:clamp(24px,3vw,40px)">
          <span class="eyebrow" style="color:var(--artblue)">${esc(t.label)}</span>
          <h3 style="font-size:clamp(24px,2.8vw,30px);line-height:1.2;margin-top:10px">${esc(t.title)}</h3>
          <div style="display:flex;flex-direction:column;margin-top:16px;border-top:1px solid var(--line)">
${t.offers.map((o) => `            <div style="display:grid;grid-template-columns:24px 1fr;gap:4px;padding:10px 0;border-bottom:1px solid var(--line);font-size:14.5px;line-height:1.55;color:var(--ink-soft)"><span style="font-family:var(--font-display);font-weight:700;color:var(--accent-green)">+</span><span>${esc(o)}</span></div>`).join('\n')}
          </div>
          <form data-pform data-label="${esc(t.label)}" novalidate style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;margin-top:28px">
${t.fields.map(field).join('\n')}
            <div style="grid-column:1/-1;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px;padding-top:18px;border-top:1px solid var(--line)">
              <span data-msg style="font-size:13px;color:var(--ink-dim)">Goes to connect@artpark.in · * required</span>
              <button type="submit" class="btn btn-primary">Send enquiry <span class="arrow">→</span></button>
            </div>
          </form>
          <div data-psent hidden style="margin-top:28px;background:var(--artlight);color:var(--artblue);padding:22px 24px">
            <div style="font-family:var(--font-display);font-weight:700;font-size:18px">Thank you.</div>
            <p style="margin-top:6px;font-size:14.5px;line-height:1.6">Your email app should have opened with the enquiry addressed to connect@artpark.in — send it from there and the partnerships team will follow up.</p>
            <button type="button" data-preset style="margin-top:14px;background:none;border:0;padding:0;cursor:pointer;font-family:var(--font-display);font-weight:700;font-size:14px;color:var(--artblue)">Send another enquiry →</button>
          </div>
        </div>`).join('\n')}
      </div>
    </div>
  </section>`,
  }),
};

// ---------- Role pages (round 7): each role on our own site, in the brand's type scale. ----------
// Text is the role's own description from the artparkcareers.in roles feed (research/careers-api.json).
// Applying needs an ARTPARK profile, so the Apply button hands over to artparkcareers.in for that step only.
const bullets = (items) => `<ul class="role-list">${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
const roleFacts = (j) => [
  ['Company', j.company], ['Location', j.location], ['Work mode', j.mode], ['Type', j.type],
  ['Experience', j.experience], ['Team', j.team], ['Posted', ago(j.postedAt)],
].filter(([, v]) => v);
const rolePages = C.jobs.filter((j) => j.jd).map((j) => ({
  route: `${R.careers}/${j.slug}`,
  html: () => {
    const key = j.atArtpark ? 'artpark' : 'startup';
    const more = [...C.jobs.filter((o) => o !== j && o.company === j.company), ...C.jobs.filter((o) => o !== j && o.company !== j.company)].slice(0, 3);
    return page({
      title: `${j.title} at ${j.company} — ARTPARK Careers`, active: 'careers',
      description: j.jd.summary || j.desc,
      body: `
  <section class="role-top">
    <div style="max-width:1180px;margin:0 auto;padding:0 24px">
      <a class="role-back" href="${R.careers}">← All open roles</a>
      <div class="role-tags"><span class="job-pill is-${key}">${j.atArtpark ? 'ARTPARK team' : 'TIR startup'}</span><span class="role-co">${esc(j.company)}</span>${j.team ? `<span class="role-team">${esc(j.team)}</span>` : ''}</div>
      <h1 class="role-title">${esc(j.title)}</h1>
      ${j.jd.summary ? `<p class="role-lede">${esc(j.jd.summary)}</p>` : ''}
      <div class="role-meta">${[j.location, j.mode, j.type, j.experience].filter(Boolean).map((m) => `<span>${esc(m)}</span>`).join('')}</div>
    </div>
  </section>
  <div class="role-wrap">
    <article class="role-body">
      ${j.jd.about ? `<section><h2>About the role</h2><p>${esc(j.jd.about)}</p></section>` : ''}
      ${j.jd.doing && j.jd.doing.length ? `<section><h2>What you’ll do</h2>${bullets(j.jd.doing)}</section>` : ''}
      ${j.jd.looking && j.jd.looking.length ? `<section><h2>What we’re looking for</h2>${bullets(j.jd.looking)}</section>` : ''}
      ${j.jd.nice && j.jd.nice.length ? `<section><h2>Nice to have</h2>${bullets(j.jd.nice)}</section>` : ''}
      ${j.about ? `<section class="role-about-co"><span class="eyebrow">About ${esc(j.company)}</span><p>${esc(j.about)}</p><p class="role-tir">${esc(j.company)} is part of ARTPARK’s Technology Innovators in Residence (TIR) program. You join ${esc(j.company)}; ARTPARK lists the role and runs the application.</p></section>` : ''}
    </article>
    <aside class="role-aside">
      <div class="role-apply">
        <span class="eyebrow">Apply</span>
        <h2>Interested in this role.</h2>
        <p>Applications go through ARTPARK Careers. Sign in with your ARTPARK profile and it is shared with the hiring team.</p>
        <a class="btn btn-primary" href="${j.url}" target="_blank" rel="noopener">Apply on ARTPARK Careers <span class="arrow">↗</span></a>
        <dl>${roleFacts(j).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      </div>
    </aside>
  </div>
  <div class="role-bar"><div><b>${esc(j.title)}</b><span>${esc(j.company)}</span></div><a class="btn btn-primary" href="${j.url}" target="_blank" rel="noopener">Apply <span class="arrow">↗</span></a></div>
  <section class="role-more">
    <div style="max-width:1180px;margin:0 auto;padding:0 24px">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px"><h2>More open roles.</h2><a href="${R.careers}" class="fx-link">See all ${C.jobs.length} roles <span class="arrow">→</span></a></div>
      <div class="job-grid">
${more.map((o) => `        <a class="job-card role-mini" href="${R.careers}/${o.slug}"><div class="job-top"><span class="job-pill is-${o.atArtpark ? 'artpark' : 'startup'}">${o.atArtpark ? 'ARTPARK team' : 'TIR startup'}</span><span class="job-ago">${ago(o.postedAt)}</span></div><div class="job-co"><b>${esc(o.company)}</b></div><h3>${esc(o.title)}</h3><div class="job-meta">${esc([o.location, o.mode, o.type].join(' · '))}</div><span class="job-go">View role <span class="arrow">→</span></span></a>`).join('\n')}
      </div>
    </div>
  </section>`,
    });
  },
}));

module.exports = [events, ...eventPages, news, tenders, careers, ...rolePages, partnerships];
