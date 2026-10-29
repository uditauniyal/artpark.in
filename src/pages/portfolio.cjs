// Portfolio: ported from .reference/claude-design/Portfolio.dc.html.
// His filter row used TIR / SIP / Investment; programme data does not exist yet (user: decide later),
// so the same buttons filter by the sectors used on artpark.in. Each card opens the founder story.
const { esc, page, R, floatStage } = require('../lib.cjs');
const C = require('../data/content.cjs');
const stories = require('./stories.cjs').all;

const hasStory = new Set(stories.map((s) => s.slug));
const SHORT = { 'Defence and Aerospace': 'Defence & aerospace', 'Space Technology': 'Space', 'Industrial Automation and Robotics': 'Robotics & automation', Healthcare: 'Healthcare', Agriculture: 'Agriculture', 'Mobility and Construction': 'Mobility & construction', 'Research and Deep Science': 'Deep science' };

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

  <div data-portfolio style="max-width:1180px;margin:0 auto;padding:48px 24px 112px">
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px;padding-bottom:20px;border-bottom:1px solid var(--line)">
      <div style="display:flex;flex-wrap:wrap;gap:8px" role="group" aria-label="Filter by sector">
${['All', ...C.DOMAIN_LIST].map((s, i) => `        <button type="button" data-sector-filter="${esc(s)}" aria-pressed="${i === 0}" style="border:1px solid ${i === 0 ? 'var(--artblack)' : 'var(--line-strong)'};background:${i === 0 ? 'var(--artblack)' : 'transparent'};color:${i === 0 ? '#fff' : 'var(--ink)'};padding:7px 16px;font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.08em;border-radius:2px;cursor:pointer;transition:all 150ms ease">${esc((SHORT[s] || s).toUpperCase())}</button>`).join('\n')}
      </div>
      <span data-pcount style="font-size:13px;color:var(--ink-dim)">${C.portfolio.length} companies</span>
    </div>
    <div class="pf-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;margin-top:24px">
${C.portfolio.map((c) => {
  const href = hasStory.has(c.slug) ? `${R.stories}/${c.slug}` : c.website;
  const ext = !hasStory.has(c.slug);
  return `      <a data-company data-sector="${esc(c.domains.join('|'))}" class="pf-card lift" href="${href || '#'}"${ext && href ? ' target="_blank" rel="noopener"' : ''} style="border:1px solid var(--line);padding:22px;display:flex;flex-direction:column;gap:14px;text-decoration:none;color:inherit;transition:border-color 150ms ease">
        <div class="mag" style="position:relative;width:100%;height:72px;background:var(--paper);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:center;padding:10px"><img src="${c.logo}" alt="${esc(c.name)} logo" loading="lazy" style="max-width:100%;max-height:56px;max-width:82%;object-fit:contain;display:block"></div>
        <div><div style="font-family:var(--font-display);font-weight:700;font-size:17px;color:var(--ink)">${esc(c.name)}</div><div style="font-size:13.5px;line-height:1.5;color:var(--ink-soft);margin-top:4px">${esc(c.oneLiner)}</div></div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;min-height:46px;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-dim);border-top:1px solid var(--line);padding-top:12px;margin-top:auto"><span>${esc(c.domains.join(' · '))}</span><span style="color:var(--artblue);white-space:nowrap">${hasStory.has(c.slug) ? 'Read story →' : 'Website ↗'}</span></div>
      </a>`;
}).join('\n')}
    </div>
    <p style="margin-top:20px;font-size:13px;color:var(--ink-dim)">Company list and descriptions from artpark.in. Stories are drawn from company announcements, press coverage and ARTPARK interviews; sources are listed on each story.</p>
  </div>`,
  }),
};
