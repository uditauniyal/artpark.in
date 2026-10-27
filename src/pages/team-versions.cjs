// Team page: three design versions for the user to choose from (round 8; manager: "About (Team details) needs update").
// Preview-only routes /about/team/v1, /v2, /v3 and an index at /about/team/versions. Not linked from the site.
// People, roles, portraits, LinkedIn and expertise areas come from src/data/team.cjs (artpark.in); nothing is invented.
const { esc, page, pageIntro, ABOUT_TABS, R } = require('../lib.cjs');
const T = require('../data/team.cjs');

const LABEL = Object.fromEntries(T.GROUPS.map(([g, l]) => [g, l]));
const SHORT = { leadership: 'Leadership', governing: 'Governing board', directors: 'Board of directors', research: 'Research advisory', advisors: 'Executive advisors' };
const intro = pageIntro({ eyebrow: 'About ARTPARK', h1: 'Our team.', lede: 'The people who lead ARTPARK and the boards that govern and advise it.', tabs: { current: 'team', items: ABOUT_TABS } });
const li = (p, cls = '') => p.linkedin ? `<a class="${cls}" href="${p.linkedin}" target="_blank" rel="noopener" aria-label="${esc(p.name)} on LinkedIn">LinkedIn <span class="arrow">↗</span></a>` : '';
const groupPills = (p) => p.groups.map((g) => `<span class="tv-pill is-${g}">${esc(SHORT[g])}</span>`).join('');
const areaTags = (p) => p.areas.length ? `<div class="tv-areas">${p.areas.map((a) => `<span>${esc(a)}</span>`).join('')}</div>` : '';
const dataPerson = (p) => `data-id="${p.id}" data-groups="${p.groups.join(' ')}" data-name="${esc(p.name)}" data-role="${esc(p.role)}" data-img="${p.portrait}" data-li="${p.linkedin}" data-pills="${esc(p.groups.map((g) => SHORT[g]).join('|'))}" data-areas="${esc(p.areas.join('|'))}"`;
const filterChips = (attr) => `<div class="tv-chips" role="group" aria-label="Show">${[['all', 'Everyone', T.people.length], ...T.GROUPS.map(([g]) => [g, SHORT[g], T.counts[g]])].map(([k, l, n], i) => `<button type="button" ${attr}="${k}" aria-pressed="${i === 0}">${esc(l)} <b>${n}</b></button>`).join('')}</div>`;

const switcher = (cur) => `
  <nav class="tv-switch" aria-label="Team page versions"><span>Team page preview</span>${[['v1', 'Constellation'], ['v2', 'Editorial'], ['v3', 'Duotone wall']].map(([k, l]) => `<a href="${R.team}/${k}"${k === cur ? ' aria-current="page"' : ''}>${k.toUpperCase()} · ${l}</a>`).join('')}<a href="${R.team}/versions">All versions</a></nav>`;

// ---------------------------------------------------------------- V1 · Constellation
const ORBITS = [
  { key: 'o1', people: T.inGroup('leadership'), r: 118, size: 92, dur: 90 },
  { key: 'o2', people: T.people.filter((p) => !p.groups.includes('leadership') && (p.groups.includes('governing') || p.groups.includes('directors'))), r: 228, size: 66, dur: 140 },
  { key: 'o3', people: T.people.filter((p) => p.groups.includes('research') || p.groups.includes('advisors')), r: 322, size: 58, dur: 200 },
];
const v1 = `
  <section class="tv1" data-tv1 data-ap-skip>
    <div class="tv1-sky">
      <div class="tv1-wrap">
        <div class="tv1-head">
          <span class="eyebrow">The ARTPARK network</span>
          <h2>Who runs, governs and <span>advises ARTPARK.</span></h2>
          <p>${T.people.length} people across the leadership team, two boards and two advisory groups. Hover a portrait to meet them; pick a group to light it up.</p>
          ${filterChips('data-tv1-filter')}
        </div>
        <div class="tv1-body">
          <div class="tv1-stage" data-tv1-stage>
            <div class="tv1-scale">
${ORBITS.map((o) => `              <div class="tv1-orbit ${o.key}" style="--r:${o.r}px;--s:${o.size}px;--dur:${o.dur}s">
${o.people.map((p, i) => `                <button type="button" class="tv1-node" style="--a:${(360 / o.people.length) * i + (o.key === 'o2' ? 16 : o.key === 'o3' ? 8 : -90)}deg" ${dataPerson(p)} aria-label="${esc(p.name)}, ${esc(p.role)}"><span><img src="${p.portrait}" alt="" loading="lazy"></span></button>`).join('\n')}
              </div>`).join('\n')}
              <div class="tv1-core"><img src="/assets/brand/artpark-logo.png" alt="ARTPARK"></div>
            </div>
          </div>
          <aside class="tv1-card" data-tv1-card aria-live="polite">
            <div class="tv1-card-empty"><b>${T.people.length}</b><span>people</span><p>Leadership at the centre; the governing board and board of directors on the middle ring; research and executive advisors on the outer ring.</p></div>
          </aside>
        </div>
      </div>
    </div>
    <div class="tv1-dir">
${T.GROUPS.map(([g, l, sub]) => `      <div class="tv1-group">
        <div class="tv1-group-head"><span class="eyebrow">${esc(l)}</span><span class="tv1-count">${T.counts[g]}</span></div>
        <div class="tv1-group-grid">
${T.inGroup(g).map((p) => `          <div class="tv1-person"><img src="${p.portrait}" alt="${esc(p.name)}" loading="lazy"><div><b>${esc(p.name)}</b><span>${esc(p.roles[g])}</span>${li(p, 'tv-li')}</div></div>`).join('\n')}
        </div>
      </div>`).join('\n')}
    </div>
  </section>`;

// ---------------------------------------------------------------- V2 · Editorial spotlight
const boardPeople = T.GROUPS.filter(([g]) => g !== 'leadership').flatMap(([g]) => T.inGroup(g).map((p) => ({ p, g })));
const v2 = `
  <section class="tv2">
    <div class="tv-wrap">
      <div class="tv2-lead-head"><span class="eyebrow">Leadership team</span><h2>The people running <span>the work.</span></h2></div>
      <div class="tv2-leads">
${T.inGroup('leadership').map((p, i) => `        <article class="tv2-lead">
          <div class="tv2-portrait" data-win><img src="${p.portrait}" alt="${esc(p.name)}" loading="lazy"></div>
          <div class="tv2-lead-body"><span class="tv2-n">0${i + 1}</span><h3>${esc(p.name)}</h3><p>${esc(p.role)}</p>${li(p, 'tv-li')}</div>
        </article>`).join('\n')}
      </div>
    </div>
    <div class="tv2-boards" data-tv2>
      <div class="tv-wrap">
        <div class="tv2-boards-head"><span class="eyebrow">Boards &amp; advisors</span><h2>The people who govern <span>and advise.</span></h2><p>The hub governing board, the board of directors, the research advisory board and ARTPARK’s executive advisors.</p></div>
        <div class="tv2-spy">
          <div class="tv2-frame" aria-hidden="true">
${boardPeople.map(({ p }, i) => `            <figure class="tv2-fig${i === 0 ? ' is-on' : ''}" data-tv2-fig="${i}"><img src="${p.portrait}" alt="" loading="lazy"></figure>`).join('\n')}
            <div class="tv2-frame-meta"><span data-tv2-count>01 / ${String(boardPeople.length).padStart(2, '0')}</span><i><b data-tv2-bar></b></i></div>
          </div>
          <div class="tv2-list">
${T.GROUPS.filter(([g]) => g !== 'leadership').map(([g, l, sub]) => `            <div class="tv2-group"><span class="eyebrow">${esc(l)}</span><p>${esc(sub)}</p></div>
${T.inGroup(g).map((p) => { const i = boardPeople.findIndex((x) => x.p === p && x.g === g); return `            <div class="tv2-row${i === 0 ? ' is-on' : ''}" data-tv2-row="${i}"><img class="tv2-thumb" src="${p.portrait}" alt="" loading="lazy"><div><h3>${esc(p.name)}</h3><p>${esc(p.roles[g])}</p>${areaTags(p)}${p.groups.length > 1 ? `<div class="tv2-also">Also: ${p.groups.filter((x) => x !== g).map((x) => esc(LABEL[x])).join(', ')}</div>` : ''}${li(p, 'tv-li')}</div></div>`; }).join('\n')}`).join('\n')}
          </div>
        </div>
      </div>
    </div>
  </section>`;

// ---------------------------------------------------------------- V3 · Duotone wall
const v3 = `
  <section class="tv3" data-tv3>
    <div class="tv-wrap">
      <div class="tv3-counts">
${T.GROUPS.map(([g]) => `        <div><b>${T.counts[g]}</b><span>${esc(LABEL[g])}</span></div>`).join('\n')}
      </div>
    </div>
    <div class="tv3-bar"><div class="tv-wrap">${filterChips('data-tv3-filter')}</div></div>
    <div class="tv-wrap">
      <div class="tv3-wall" data-tv3-wall>
${T.people.map((p) => `        <article class="tv3-tile${p.groups.includes('leadership') ? ' is-lead' : ''}" ${dataPerson(p)} tabindex="0">
          <div class="tv3-img"><img src="${p.portrait}" alt="${esc(p.name)}" loading="lazy"></div>
          <div class="tv3-info"><h3>${esc(p.name)}</h3><div class="tv3-pills">${groupPills(p)}</div><p>${esc(p.role)}</p>${areaTags(p)}${li(p, 'tv-li')}</div>
        </article>`).join('\n')}
      </div>
    </div>
  </section>`;

// ---------------------------------------------------------------- pages
const versionPage = (k, title, body) => ({
  route: `${R.team}/${k}`,
  html: () => page({
    title: `Our team (${title}) — ARTPARK`, active: 'about', sub: 'team',
    description: 'Preview of a Team page design version.',
    body: intro + body + switcher(k),
    scripts: ['/js/team-versions.js'],
  }).replace('</head>', '<meta name="robots" content="noindex, nofollow">\n<link rel="stylesheet" href="/css/team-versions.css">\n</head>'),
});

const index = {
  route: `${R.team}/versions`,
  html: () => page({
    title: 'Team page versions — ARTPARK', active: 'about', sub: 'team', description: 'Three Team page design versions.',
    body: `
  <section style="padding:clamp(56px,8vw,96px) 0 112px">
    <div class="tv-wrap">
      <div class="eyebrow-rule">Preview</div>
      <h1 style="font-size:clamp(44px,6.4vw,80px);line-height:1.03;margin-top:20px">Team page versions.</h1>
      <p style="margin-top:20px;max-width:680px;font-size:18px;line-height:1.7;color:var(--ink-soft)">Three directions for About · Our team, built with the same ${T.people.length} people, portraits and roles from artpark.in. Pick one and it replaces the current Team page.</p>
      <div class="tv-index">
${[['v1', 'Constellation', 'An ARTBlue night sky: leadership at the centre, the boards and advisors on slowly orbiting rings. Hover a portrait to meet the person; chips light up each group. A clean directory follows.'],
  ['v2', 'Editorial spotlight', 'Large editorial portraits for the leadership team, then a scroll-led section: the portrait stays pinned and changes as you scroll through each board member and advisor.'],
  ['v3', 'Duotone wall', 'A portrait wall in ARTBlue and mint duotone. Hover turns a portrait to full colour and slides up the details; the group filter re-flows the wall with motion.']].map(([k, l, d], i) => `        <a class="tv-index-card" href="${R.team}/${k}"><span class="tv-index-n">0${i + 1}</span><h2>${l}</h2><p>${d}</p><span class="tv-index-go">Open ${k.toUpperCase()} <span class="arrow">→</span></span></a>`).join('\n')}
      </div>
    </div>
  </section>`,
  }).replace('</head>', '<meta name="robots" content="noindex, nofollow">\n<link rel="stylesheet" href="/css/team-versions.css">\n</head>'),
};

module.exports = [versionPage('v1', 'Constellation', v1), versionPage('v2', 'Editorial', v2), versionPage('v3', 'Duotone wall', v3), index];
