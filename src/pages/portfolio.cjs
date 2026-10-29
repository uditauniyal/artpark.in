// Portfolio: ported from .reference/claude-design/Portfolio.dc.html.
// Batch 2 (2026-10-29): the 36 startups of the 2026 portfolio. A programme switch (All / TIR / VIP; no programme
// data yet, so TIR and VIP show a note) and a domain sidebar filter the grid (public/js/site.js).
// Each card opens the founder story, or the company's site when there is no story yet.
const { esc, page, R, floatStage } = require('../lib.cjs');
const C = require('../data/content.cjs');
const stories = require('./stories.cjs').all;

const hasStory = new Set(stories.map((s) => s.slug));

// Round 8 floating composition: real company logos and the real company count.
const FLOAT_PF = [
  ...['twara-robotics', 'comrado-aerospace', 'yaanendriya', 'kinesthetiq', 'uncharted-ai', 'strider-robotics'].map((slug, i) => ({ kind: 'chip', logo: '/assets/logos/' + slug + '.webp', x: [0, 54, 24, 62, 0, 34][i], y: [0, -2, 21, 25, 44, 48][i], w: [40, 38, 36, 36, 36, 34][i], d: [1.2, 0.8, 2, 1.5, 1, 2.2][i], r: [-2, 2, -1, 1.5, -1.5, 1][i], t: 6 + i })),
  { kind: 'stat', n: String(C.portfolio.length), l: 'deep-tech startups built and backed at ARTPARK', x: 70, y: 47, w: 30, d: 2.6, r: 3, t: 7 },
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
${[['', 'All domains', C.portfolio.length], ...C.DOMAIN_LIST.map((d) => [d, d, C.portfolio.filter((c) => c.domains.includes(d)).length])].map(([v, label, n], i) => `        <button type="button" class="pf-domain" data-domain="${esc(v)}" aria-pressed="${i === 0}"><span class="pf-domain-name">${esc(label)}</span><span class="pf-domain-n">${n}</span></button>`).join('\n')}
      </div>
    </aside>
    <div class="pf-main">
      <div class="pf-bar">
        <span data-pcount class="pf-count">${C.portfolio.length} companies</span>
        <div class="pf-programme" role="group" aria-label="Programme">
${['All', 'TIR', 'VIP'].map((g, i) => `          <button type="button" data-programme="${g}" aria-pressed="${i === 0}">${g}</button>`).join('\n')}
        </div>
      </div>
      <p data-programme-note hidden class="pf-note">Programme lists coming soon. Showing all startups meanwhile.</p>
      <div class="pf-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px;margin-top:20px">
${C.portfolio.map((c) => {
  const href = hasStory.has(c.slug) ? `${R.stories}/${c.slug}` : c.website;
  const ext = !hasStory.has(c.slug);
  return `      <a data-company data-domains="${esc(c.domains.join('|'))}" class="pf-card lift" href="${href || '#'}"${ext && href ? ' target="_blank" rel="noopener"' : ''} style="border:1px solid var(--line);padding:22px;display:flex;flex-direction:column;gap:14px;text-decoration:none;color:inherit;transition:border-color 150ms ease">
        <div class="mag" style="position:relative;width:100%;height:72px;background:var(--paper);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:center;padding:10px"><img src="${c.logo}" alt="${esc(c.name)} logo" loading="lazy" style="max-width:100%;max-height:56px;max-width:82%;object-fit:contain;display:block"></div>
        <div><div style="font-family:var(--font-display);font-weight:700;font-size:17px;color:var(--ink)">${esc(c.name)}</div><div style="font-size:13.5px;line-height:1.5;color:var(--ink-soft);margin-top:4px">${esc(c.oneLiner)}</div></div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;min-height:46px;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-dim);border-top:1px solid var(--line);padding-top:12px;margin-top:auto"><span>${esc(c.domains.join(' · '))}</span><span style="color:var(--artblue);white-space:nowrap">${hasStory.has(c.slug) ? 'Read story →' : 'Website ↗'}</span></div>
      </a>`;
}).join('\n')}
    </div>
      <p style="margin-top:20px;font-size:13px;color:var(--ink-dim)">Company list from the ARTPARK Start Up portfolio 2026. Stories are drawn from company announcements, press coverage and ARTPARK interviews; sources are listed on each story.</p>
    </div>
  </div>`,
  }),
};
