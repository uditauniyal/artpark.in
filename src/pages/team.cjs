// Our Team (/about/team): the "Editorial" design (V2 of the round 8 versions), chosen by the user on 2026-11-14.
// Changes asked for then: portraits in full colour (no ARTBlue/mint duotone), the three leadership portraits in one
// straight row, board of directors before the hub governing board, no research advisory board, Nirav Dedhia in place of
// Sheela Prabhakar (src/data/content.cjs). The V1/V3 previews and their switcher are retired; vercel.json redirects them.
// People, roles, portraits, LinkedIn and expertise areas come from src/data/team.cjs; nothing is invented.
const { esc, page, pageIntro, ABOUT_TABS, R } = require('../lib.cjs');
const T = require('../data/team.cjs');

const LABEL = Object.fromEntries(T.GROUPS.map(([g, l]) => [g, l]));
const li = (p, cls = '') => p.linkedin ? `<a class="${cls}" href="${p.linkedin}" target="_blank" rel="noopener" aria-label="${esc(p.name)} on LinkedIn">LinkedIn <span class="arrow">↗</span></a>` : '';
const areaTags = (p) => p.areas.length ? `<div class="tv-areas">${p.areas.map((a) => `<span>${esc(a)}</span>`).join('')}</div>` : '';

const boards = T.GROUPS.filter(([g]) => g !== 'leadership');
// No floating windows on the Team intro (user, 2026-11-14: tried, removed).
const boardPeople = boards.flatMap(([g]) => T.inGroup(g).map((p) => ({ p, g })));

const body = `
  <section class="tv2">
    <div class="tv-wrap">
      <div class="tv2-lead-head"><span class="eyebrow">Leadership team</span><h2>The people running <span>the work.</span></h2></div>
      <div class="tv2-leads">
${T.inGroup('leadership').map((p, i) => `        <article class="tv2-lead">
          <div class="tv2-portrait${p.fit === 'contain' ? ' is-contain' : ''}" data-win><img src="${p.portrait}" alt="${esc(p.name)}" loading="lazy"></div>
          <div class="tv2-lead-body"><span class="tv2-n">0${i + 1}</span><h3>${esc(p.name)}</h3><p>${esc(p.role)}</p>${li(p, 'tv-li')}</div>
        </article>`).join('\n')}
      </div>
    </div>
    <div class="tv2-boards" data-tv2>
      <div class="tv-wrap">
        <div class="tv2-boards-head"><span class="eyebrow">Boards &amp; advisors</span><h2>The people who govern <span>and advise.</span></h2><p>The board of directors, the hub governing board and ARTPARK’s executive advisors.</p></div>
        <div class="tv2-spy">
          <div class="tv2-frame" aria-hidden="true">
${boardPeople.map(({ p }, i) => `            <figure class="tv2-fig${i === 0 ? ' is-on' : ''}" data-tv2-fig="${i}"><img src="${p.portrait}" alt="" loading="lazy"></figure>`).join('\n')}
            <div class="tv2-frame-meta"><span data-tv2-count>01 / ${String(boardPeople.length).padStart(2, '0')}</span><i><b data-tv2-bar></b></i></div>
          </div>
          <div class="tv2-list">
${boards.map(([g, l, sub]) => `            <div class="tv2-group"><span class="eyebrow">${esc(l)}</span><p>${esc(sub)}</p></div>
${T.inGroup(g).map((p) => { const i = boardPeople.findIndex((x) => x.p === p && x.g === g); return `            <div class="tv2-row${i === 0 ? ' is-on' : ''}" data-tv2-row="${i}"><img class="tv2-thumb" src="${p.portrait}" alt="" loading="lazy"><div><h3>${esc(p.name)}</h3><p>${esc(p.roles[g])}</p>${areaTags(p)}${p.groups.length > 1 ? `<div class="tv2-also">Also: ${p.groups.filter((x) => x !== g).map((x) => esc(LABEL[x])).join(', ')}</div>` : ''}${li(p, 'tv-li')}</div></div>`; }).join('\n')}`).join('\n')}
          </div>
        </div>
      </div>
    </div>
  </section>`;

module.exports = {
  route: R.team,
  html: () => page({
    title: 'Our Team — ARTPARK', active: 'about', sub: 'team',
    description: 'The people who lead ARTPARK and the boards that govern and advise it.',
    body: pageIntro({ eyebrow: 'About ARTPARK', h1: 'Our team.', lede: 'The people who lead ARTPARK and the boards that govern and advise it.', tabs: { current: 'team', items: ABOUT_TABS } }) + body,
    scripts: ['/js/team-versions.js'],
  }).replace('</head>', '<link rel="stylesheet" href="/css/team-versions.css">\n</head>'),
};
