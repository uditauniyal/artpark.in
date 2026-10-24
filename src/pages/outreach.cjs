// Outreach (Events, News, Tenders), Careers and Partnerships.
// Ported from .reference/claude-design/Outreach-*.dc.html, Careers.dc.html, Partnerships.dc.html.
const { esc, page, pageIntro, OUTREACH_TABS, R, linkRows, icon } = require('../lib.cjs');
const jobMark = (j) => j.company === 'ARTPARK' ? '<span class="job-mark is-artpark" title="ARTPARK"><img src="/assets/brand/artpark-logo.png" alt=""></span>' : '<span class="job-mark" title="' + esc(j.cat) + '">' + icon(j.cat === 'Operations & Business' ? 'clipboard' : /research/i.test(j.title) ? 'flask' : 'cpu', 22) + '</span>';
const C = require('../data/content.cjs');

const outreachIntro = (current, h1, lede) => pageIntro({ eyebrow: 'Outreach', h1, lede, tabs: { current, items: OUTREACH_TABS } });

// ---------- Events (Outreach-Events.dc.html) ----------
const events = {
  route: R.events,
  html: () => page({
    title: 'Events — ARTPARK Outreach', active: 'outreach', sub: 'events',
    description: 'ARTPARK Open Days, summits, talks, challenges and hackathons.',
    body: outreachIntro('events', 'Events.', 'Open Days, summits, talks, challenges and hackathons.') + `
  <div style="max-width:1180px;margin:0 auto;padding:48px 24px 112px;display:flex;flex-direction:column;gap:56px">
    <section>
      <span class="eyebrow">Upcoming</span>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:16px">
${C.upcomingEvents.map((e) => `        <div style="border:1px solid var(--line);display:flex;flex-direction:column">
          <div style="position:relative;width:100%;aspect-ratio:16/9;background:var(--paper-soft);overflow:hidden"><img src="${e.image}" alt="${esc(e.imageAlt)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block"></div>
          <div style="padding:22px 24px;display:flex;flex-direction:column;gap:8px">
            <span style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;letter-spacing:0.14em;color:var(--ink-dim)"><span class="dot green"></span>${esc((e.date + ' · ' + e.venue).toUpperCase())}</span>
            <h3 style="font-size:22px">${esc(e.title)}</h3>
            <p style="font-size:14.5px;line-height:1.6;color:var(--ink-soft)">${esc(e.blurb)} ${esc(e.time)}.</p>
            <a href="${e.register}" target="_blank" rel="noopener" style="font-family:var(--font-display);font-weight:700;font-size:14px;text-decoration:none;margin-top:6px">Register →</a>
          </div>
        </div>`).join('\n')}
      </div>
    </section>
    <section>
      <span class="eyebrow">Past events</span>
      <div style="border-top:1px solid var(--line-strong);margin-top:16px">
${C.pastEvents.map((p) => `        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:6px 24px;padding:20px 0;border-bottom:1px solid var(--line);align-items:baseline">
          <span style="font-size:13px;color:var(--ink-dim)">${esc(p.date)}${p.venue ? ' · ' + esc(p.venue) : ''}</span>
          <span style="grid-column:span 2;font-family:var(--font-display);font-weight:700;font-size:18px;line-height:1.3">${esc(p.title)}</span>
          <a href="${p.local || p.url}"${p.local ? '' : ' target="_blank" rel="noopener"'} style="font-size:14px;font-weight:600;justify-self:end">Recap →</a>
        </div>`).join('\n')}
      </div>
    </section>
  </div>`,
  }),
};

// ---------- Event detail pages: original artpark.in text, same paths as artpark.in ----------
const fs = require('fs');
const path = require('path');
const eventSlug = (url) => url.replace(/\/$/, '').split('/').pop();
const eventPages = C.pastEvents.filter((e) => /artpark\.in\/events\//.test(e.url)).map((e) => {
  const slug = eventSlug(e.url);
  const file = path.join(__dirname, '..', '..', 'research', 'artpark-in', 'events__' + e.url.split('/events/')[1].replace(/\//g, '__') + '.json');
  const raw = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).text : '';
  // His design system: no emoji. The original event text uses a few; strip them.
  const lines = raw.split(/\n+/).map((l) => l.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]️?\s*/gu, '').trim()).filter(Boolean);
  const stop = lines.findIndex((l) => /^(Posted In:|Previous$)/.test(l));
  const body = lines.slice(0, stop === -1 ? undefined : stop)
    .filter((l, i) => i > 1 && !/^(Back to All Events|View fullsize|Jump to:|Google Calendar|ICS|Register now|Register Now)$/i.test(l) && !/\(map\)$/.test(l) && !/^\w+day, \w+ \d+, \d{4}/.test(l) && !/^\d{1,2}:\d{2}\s?[AP]M/.test(l));
  e.local = `${R.events}/${slug}`;
  return {
    route: e.local,
    html: () => page({
      title: `${e.title} — ARTPARK Events`, active: 'outreach', sub: 'events', description: body[0] || e.title,
      body: pageIntro({ eyebrow: 'Events', h1: esc(e.title) + '.', lede: esc(e.date + (e.venue ? ' · ' + e.venue : '')) }) + `
  <div style="max-width:1180px;margin:0 auto;padding:48px 24px 112px">
    ${e.image ? `<figure style="margin:0 0 40px;max-width:860px"><div style="position:relative;width:100%;aspect-ratio:16/9;background:var(--paper-soft);overflow:hidden"><img src="${e.image}" alt="${esc(e.title)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block"></div></figure>` : ''}
    <article style="max-width:760px;display:flex;flex-direction:column;gap:16px;font-size:17px;line-height:1.75;color:var(--ink-soft)">
${(body.length ? body : [e.note || '']).map((l) => `      <p>${esc(l)}</p>`).join('\n')}
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
    body: outreachIntro('news', 'In the news.', 'ARTPARK and its projects in the press.') + `
  <div style="max-width:1180px;margin:0 auto;padding:48px 24px 112px">
    ${linkRows(C.news.map((n) => ({ meta: n.date ? `${n.date} · ${n.outlet}` : n.outlet, title: n.title, href: n.url })))}
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
const tenders = {
  route: R.tenders,
  html: () => page({
    title: 'Tenders — ARTPARK Outreach', active: 'outreach', sub: 'tenders',
    description: 'Procurement notices, tender documents and requests for proposals from ARTPARK.',
    body: outreachIntro('tenders', 'Tenders.', 'Procurement notices from ARTPARK. Download the documents for each tender, including corrigenda and bid-opening outputs.') + `
  <div style="max-width:1180px;margin:0 auto;padding:48px 24px 112px" data-tenders>
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px;padding-bottom:20px;border-bottom:1px solid var(--line)">
      <div style="display:flex;flex-wrap:wrap;gap:8px" role="group" aria-label="Filter tenders">
${['All', 'Active', 'Closed', 'Requests for proposals'].map((l, i) => `        <button type="button" data-filter="${['all', 'active', 'closed', 'rfp'][i]}" aria-pressed="${i === 0}" style="border:1px solid ${i === 0 ? 'var(--artblack)' : 'var(--line-strong)'};background:${i === 0 ? 'var(--artblack)' : 'transparent'};color:${i === 0 ? '#fff' : 'var(--ink)'};padding:7px 16px;font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.08em;border-radius:2px;cursor:pointer;transition:all 150ms ease">${l.toUpperCase()}</button>`).join('\n')}
      </div>
      <span style="font-size:13px;color:var(--ink-dim)">Questions about a tender: <a href="mailto:connect@artpark.in">connect@artpark.in</a></span>
    </div>
    <div>
${C.tenders.map((t) => `      <div data-item data-status="${t.status}" style="border-bottom:1px solid var(--line)">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px 24px;padding:22px 0;align-items:center">
          <div style="grid-column:span 2;min-width:0">
            <div style="font-size:12px;font-weight:600;letter-spacing:0.1em;color:var(--ink-dim)">${esc(t.cat.toUpperCase())}${t.published ? ' · ' + esc(t.published.toUpperCase()) : ''}</div>
            <div style="font-family:var(--font-display);font-weight:700;font-size:18px;line-height:1.3;margin-top:4px">${esc(t.title)}</div>
            <div style="font-size:13.5px;color:var(--ink-soft);margin-top:4px">${t.docs.length ? t.docs.length + (t.docs.length === 1 ? ' document' : ' documents') : 'Document on request'}</div>
          </div>
          <div style="font-size:14px"><span style="display:block;font-size:11px;font-weight:600;letter-spacing:0.14em;color:var(--ink-dim)">TYPE</span>${t.status === 'rfp' ? 'RFP' : 'Tender'}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
            <span style="display:flex;align-items:center;gap:8px;font-size:13.5px"><span class="dot ${STATUS[t.status][1]}"></span>${STATUS[t.status][0]}</span>
            <button type="button" class="btn btn-ghost" data-open aria-expanded="false" aria-controls="tender-${t.id}" style="padding:8px 14px">View <span class="arrow">→</span></button>
          </div>
        </div>
        <div id="tender-${t.id}" hidden style="padding:0 0 26px">
          ${t.note ? `<p style="max-width:760px;font-size:15px;line-height:1.7;color:var(--ink-soft);margin-bottom:14px">${esc(t.note)}</p>` : ''}
          ${t.docs.length ? `<div style="border:1px solid var(--line);max-width:820px">
${t.docs.map(([n, href, kind]) => `            <div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;padding:14px 18px;border-bottom:1px solid var(--line);align-items:center;font-size:15px"><span><b style="font-family:var(--font-display)">${esc(n)}</b> <span style="color:var(--ink-dim)">· ${kind}</span></span><a href="${href}" target="_blank" rel="noopener" style="font-size:14px;font-weight:600">Download →</a></div>`).join('\n')}
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
    description: 'Roles at ARTPARK, and at startups hiring through ARTPARK.',
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
      <p style="font-size:18px;color:var(--ink-soft)"><b data-count style="font-family:var(--font-display);color:var(--ink)">${C.jobs.length} roles</b> at ARTPARK</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-top:24px">
${C.jobs.map((j) => `        <article data-job data-cat="${esc(j.cat)}" data-mode="${esc(j.mode)}" data-text="${esc([j.title, j.company, j.desc, j.cat, ...j.tags].join(' ').toLowerCase())}" style="border:1px solid var(--line);padding:28px;display:flex;flex-direction:column;gap:14px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:14px">
            ${jobMark(j)}
            <div><div style="font-family:var(--font-display);font-weight:700;font-size:16px;color:var(--artblue)">${esc(j.company)}</div><div style="font-size:13px;color:var(--ink-dim)">${esc(j.via)}</div></div>
          </div>
          <h2 style="font-size:22px;line-height:1.2">${esc(j.title)}</h2>
          <p style="font-size:15px;line-height:1.6;color:var(--ink-soft)">${esc(j.desc)}</p>
          <div style="font-size:14px;color:var(--ink-soft)">${esc([j.location, j.type, j.mode].join(' · '))}</div>
          <div style="margin-top:auto;padding-top:14px;border-top:1px solid var(--line);display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px">
            <div style="display:flex;flex-wrap:wrap;gap:6px">
${j.tags.map((t) => `              <span style="font-size:12.5px;padding:4px 10px;border:1px solid var(--line-strong);background:var(--paper-soft);color:var(--artblue);border-radius:2px">${esc(t)}</span>`).join('\n')}
            </div>
            <span style="font-size:13px;color:var(--ink-dim)">${ago(j.postedAt)}</span>
          </div>
          <a href="${j.url}" target="_blank" rel="noopener" style="font-family:var(--font-display);font-weight:700;font-size:14px;text-decoration:none">View role →</a>
        </article>`).join('\n')}
      </div>
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

const partnerships = {
  route: R.partnerships,
  html: () => page({
    title: 'Partnerships — ARTPARK', active: 'partnerships',
    description: 'Government, industry, academic and philanthropic partners of ARTPARK, and how to partner with us.',
    body: `
  <section style="padding:clamp(56px,8vw,96px) 0 0">
    <div style="max-width:1180px;margin:0 auto;padding:0 24px">
      <div class="eyebrow-rule">Partnerships</div>
      <h1 style="font-size:clamp(44px,6.4vw,80px);line-height:1.03;margin-top:20px">Partners.</h1>
      <p style="margin-top:24px;max-width:680px;font-size:18px;line-height:1.7;color:var(--ink-soft)">ARTPARK works as a bridge between research, academia, industry and government. These organisations, institutions and ministries share their expertise and resources to help steer India-first innovation in deep tech.</p>
      <a class="btn btn-primary" href="#partner" style="margin-top:28px">Become a partner <span class="arrow">→</span></a>
    </div>
  </section>

  <div style="max-width:1180px;margin:0 auto;padding:56px 24px 112px;display:flex;flex-direction:column;gap:56px">
${C.partners.map((g) => `    <section>
      <span class="eyebrow">${esc(g.label)}</span>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));border-top:1px solid var(--line);border-left:1px solid var(--line);margin-top:16px">
${g.items.map((p) => `        <div title="${esc(p.name)}" style="background:var(--paper);border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:18px 20px;height:84px;position:relative;display:flex;align-items:center;justify-content:center"><img src="${p.logo}" alt="${esc(p.name)}" loading="lazy" style="max-width:100%;max-height:50px;object-fit:contain;display:block"></div>`).join('\n')}
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

module.exports = [events, ...eventPages, news, tenders, careers, partnerships];
