// Portfolio: ported from .reference/claude-design/Portfolio.dc.html.
// Batch 2 (2026-10-29): the 2026 portfolio. A programme switch (All / Innovations / Startups / Social since the
// manager's 2026-11-19 design) and a domain sidebar filter the grid together (public/js/site.js).
// Each card opens the founder story, or the company's site when there is no story yet.
const fs = require('fs');
const path = require('path');
const { esc, page, R, floatStage } = require('../lib.cjs');
const C = require('../data/content.cjs');
const { all: stories, AWAITING_APPROVAL } = require('./stories.cjs');

// A story awaiting the founder's approval is hidden on the public sites, so its card opens the company's website.
const hasStory = new Set(stories.map((s) => s.slug).filter((slug) => !AWAITING_APPROVAL.has(slug)));
// Manager (2026-11-19 design): A-Thon is no longer listed (35 companies). Nirav (2026-11-20): A-Thon is no longer with
// ARTPARK, so its story is not published either (src/pages/stories.cjs).
const LISTED = C.portfolio.filter((c) => c.slug !== 'a-thon');

// User (2026-11-20): the programme switch filters for real. Startups = the 2026 startup portfolio; Innovations = the
// Technology Innovators in Residence of the 2026 cohort (src/data/tir-2026.json, from the cohort presentation V3, the
// source of truth); Social comes later. TIR cards show logo, name, one line and domains, and open the venture's website
// when it has one (stories follow once each innovator approves theirs).
const TIR_FILE = path.join(__dirname, '..', 'data', 'tir-2026.json');
const TIR = fs.existsSync(TIR_FILE) ? JSON.parse(fs.readFileSync(TIR_FILE, 'utf8')) : [];
const CARDS = [...LISTED.map((c) => ({ ...c, prog: 'Startups' })), ...TIR.map((t) => ({ ...t, prog: 'Innovations' }))];
const domainCount = (d) => CARDS.filter((c) => !d || c.domains.includes(d)).length;

// Round 8 floating composition: real company logos and the real company count.
const FLOAT_PF = [
  // KinesthetiQ asked to stay stealth (2026-11-20), so Astrome takes its place in this composition.
  ...['twara-robotics', 'comrado-aerospace', 'yaanendriya', 'astrome', 'uncharted-ai', 'strider-robotics'].map((slug, i) => ({ kind: 'chip', logo: '/assets/logos/' + slug + '.webp', x: [0, 54, 24, 62, 0, 34][i], y: [0, -2, 21, 25, 44, 48][i], w: [40, 38, 36, 36, 36, 34][i], d: [1.2, 0.8, 2, 1.5, 1, 2.2][i], r: [-2, 2, -1, 1.5, -1.5, 1][i], t: 6 + i })),
  { kind: 'stat', n: String(LISTED.length), l: 'deep-tech startups built and backed at ARTPARK', x: 70, y: 47, w: 30, d: 2.6, r: 3, t: 7 },
];
module.exports = {
  route: R.portfolio,
  html: () => page({
    title: 'Portfolio — ARTPARK', active: 'portfolio',
    description: 'Deep-tech startups built and backed at ARTPARK, and the founders behind them.',
    body: `
  <section style="padding:clamp(56px,8vw,96px) 0 0">
    <div class="intro-wrap has-float" style="max-width:1180px;margin:0 auto;padding:0 24px;position:relative">
      ${floatStage(FLOAT_PF)}<div class="eyebrow-rule">Portfolio</div>
      <h1 style="font-size:clamp(44px,6.4vw,80px);line-height:1.03;margin-top:20px">Current portfolio.</h1>
      <p style="margin-top:24px;max-width:680px;font-size:18px;line-height:1.7;color:var(--ink-soft)">Deep-tech startups built and backed at ARTPARK, through the Technology Innovators in Residence and Venture Incubation programmes. Open any company to read how its founders got here.</p>
    </div>
  </section>

  <div data-portfolio class="pf-layout" style="max-width:1180px;margin:0 auto;padding:48px 24px 112px">
    <aside class="pf-domains" aria-label="Filter by domain">
      <h2 class="pf-domains-title">Domain</h2>
      <div class="pf-domains-list" role="group" aria-label="Domain">
${[['', 'All domains', domainCount('')], ...C.DOMAIN_LIST.map((d) => [d, d, domainCount(d)])].map(([v, label, n], i) => `        <button type="button" class="pf-domain" data-domain="${esc(v)}" aria-pressed="${i === 0}"><span class="pf-domain-name">${esc(label)}</span><span class="pf-domain-n">${n}</span></button>`).join('\n')}
      </div>
    </aside>
    <div class="pf-main">
      <div class="pf-bar">
        <span data-pcount class="pf-count">${CARDS.length} in the portfolio</span>
        <div class="pf-programme" role="group" aria-label="Programme">
${['All', 'Innovations', 'Startups', 'Social'].map((g, i) => `          <button type="button" data-programme="${g}" aria-pressed="${i === 0}">${g}</button>`).join('\n')}
        </div>
      </div>
      <p data-programme-note hidden class="pf-note">Social impact listings are coming soon. Showing the whole portfolio meanwhile.</p>
      <div class="pf-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px;margin-top:20px">
${CARDS.map((c) => {
  const story = c.prog === 'Startups' && hasStory.has(c.slug);
  const href = story ? `${R.stories}/${c.slug}` : c.website;
  // No story and no website (some TIR ventures): a plain card, not a link.
  const tag = href ? 'a' : 'div';
  const logo = c.logo
    ? `<img src="${c.logo}" alt="${esc(c.name)} logo" loading="lazy" style="max-width:100%;max-height:56px;max-width:82%;object-fit:contain;display:block">`
    : `<span style="font-family:var(--font-display);font-weight:700;font-size:20px;color:var(--artblue);text-align:center;line-height:1.15">${esc(c.name)}</span>`;
  const action = story ? 'Read story →' : href ? 'Website ↗' : c.prog === 'Innovations' ? 'TIR 2026' : '';
  return `      <${tag} data-company data-programme-of="${c.prog}" data-domains="${esc(c.domains.join('|'))}" class="pf-card${href ? ' lift' : ''}"${href ? ` href="${href}"${story ? '' : ' target="_blank" rel="noopener"'}` : ''} style="border:1px solid var(--line);padding:22px;display:flex;flex-direction:column;gap:14px;text-decoration:none;color:inherit;transition:border-color 150ms ease">
        <div class="mag" style="position:relative;width:100%;height:72px;background:var(--paper);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:center;padding:10px">${logo}</div>
        <div><div style="font-family:var(--font-display);font-weight:700;font-size:17px;color:var(--ink)">${esc(c.name)}</div><div style="font-size:13.5px;line-height:1.5;color:var(--ink-soft);margin-top:4px">${esc(c.oneLiner)}</div></div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;min-height:46px;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-dim);border-top:1px solid var(--line);padding-top:12px;margin-top:auto"><span>${esc(c.domains.join(' · '))}</span><span style="color:var(--artblue);white-space:nowrap">${action}</span></div>
      </${tag}>`;
}).join('\n')}
    </div>
      <p style="margin-top:20px;font-size:13px;color:var(--ink-dim)">Company list from the ARTPARK Start Up portfolio 2026${TIR.length ? '; Technology Innovators in Residence from the 2026 cohort' : ''}. Stories are drawn from company announcements, press coverage and ARTPARK interviews; sources are listed on each story.</p>
    </div>
  </div>`,
  }),
};
