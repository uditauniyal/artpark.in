// About section: ported from .reference/claude-design/About-*.dc.html, filled with artpark.in content.
const L = require('../lib.cjs');
const { esc, page, pageIntro, ABOUT_TABS, R, sectionHead, rows, statGrid, photoGrid, figure, quote, linkRows, wrap, section } = L;
const C = require('../data/content.cjs');
const P = require('../data/programs.cjs');
const PJ = require('./projects.cjs');

const intro = (current, h1, lede) => pageIntro({ eyebrow: 'About ARTPARK', h1, lede, tabs: { current, items: ABOUT_TABS } });

// ---------- Our Team (About-Our-Team.dc.html) ----------
// His leadership card (4:5 portrait, name, role), now used for every group since portraits exist.
const personCard = (p) => `          <div class="person-card" style="display:flex;flex-direction:column;gap:12px">
            <div style="position:relative;width:100%;aspect-ratio:4/5;background:var(--paper-soft);overflow:hidden"><img src="${p.portrait}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 20%;display:block"></div>
            <div><div style="font-family:var(--font-display);font-weight:700;font-size:17px">${esc(p.name)}</div><div style="font-size:14px;color:var(--ink-dim);margin-top:2px">${esc(p.role)}</div>${p.linkedin ? `<a href="${p.linkedin}" target="_blank" rel="noopener" style="display:inline-block;margin-top:6px;font-size:13px;font-weight:600">LinkedIn ↗</a>` : ''}</div>
          </div>`;
const boardList = (list) => `<div class="person-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:28px 16px;margin-top:32px">
${list.map(personCard).join('\n')}
      </div>`;

const team = {
  route: R.team,
  html: () => page({
    title: 'Our Team — ARTPARK', active: 'about', sub: 'team',
    description: 'The people who lead ARTPARK and the boards that govern and advise it.',
    body: intro('team', 'Our team.', 'The people who lead ARTPARK and the boards that govern and advise it.') + '\n' + wrap([
      section(`${sectionHead('Leadership team', 'The people running the work.')}
      <div class="person-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:28px 16px;margin-top:32px">
${C.people.leadership.map(personCard).join('\n')}
      </div>`, { label: 'Leadership' }),
      section(`${sectionHead('Governing board', 'Hub governing board.')}
      ${boardList(C.people.governing)}`, { label: 'Governing board' }),
      section(`${sectionHead('Board', 'Board of directors.')}
      ${boardList(C.people.directors)}`, { label: 'Board of directors' }),
      section(`${sectionHead('Research', 'Research advisory board.')}
      ${boardList(C.people.research)}`, { label: 'Research advisory board' }),
      section(`${sectionHead('Advisors', 'Executive advisors.')}
      ${boardList(C.people.advisors)}`, { last: true, label: 'Executive advisors' }),
    ].join('\n')),
  }),
};

// ---------- Approach (About-Approach.dc.html) ----------
// His page: three cards (Model / Selection / Ecosystem) + "Where we work." rows.
// Filled from artpark.in/about-us, with a readiness-arc infographic, icons and photographs.
const TRL_STEPS = [
  { from: 0, to: 3, label: 'Idea to lab proof', note: 'ARTLabs innovation projects. Technology Innovators in Residence enter at TRL 3.', href: R.programs + '/artlabs' },
  { from: 4, to: 5, label: 'Prototype and pilots', note: 'The Venture Incubation Programme takes startups from TRL 4 towards field trials, at ARTgarage.', href: 'https://apply.artpark.info/sip' },
  { from: 6, to: 9, label: 'Deployed, at scale', note: 'Field deployment, manufacturing readiness and follow-on capital, through programmes such as CAMRAS.', href: '/projects/camras' },
];
const SUPPORT = [
  ['users', 'Mentorship & expertise', 'Domain experts, serial founders, policy advisors, government agencies and industry practitioners who engage at depth.'],
  ['network', 'Networks & collaborations', 'Industry, government ministries and international institutions, for customers, procurement channels and deployment environments.'],
  ['banknote', 'Capital & investment', 'Direct investment and grant funding at pre-commercial stages, when the risk is highest and most capital will not move.'],
  ['cpu', 'Technical infrastructure', 'IISc’s research facilities: robotics labs, fabrication shops, AI compute and specialised 5G testing at ARTgarage.'],
];
const MODELS = [
  ['rocket', 'Model A', 'For-profit startup', 'When the technology has a clear commercial pathway, defensible IP and a customer willing to pay for performance, we build a company.', '/assets/paint/tile-algofet.webp', 'AlgoFET', '/stories/algofet'],
  ['heart', 'Model B', 'Social non-profit', 'When the beneficiary is a population underserved by market forces, and the intervention is too important to leave to commercial incentives, we build a non-profit initiative.', '/assets/site/hrp-training.webp', 'the high-risk pregnancy copilot', '/projects/hrp-copilot'],
  ['globe', 'Model C', 'Digital public good', 'When an open tool or platform can unlock value across an entire sector, we build it as a digital public good, designed for adoption and national integration.', '/assets/paint/slide-vaani.webp', 'Project Vaani', '/stories/vaani'],
];
const FOCUS = [
  ['Healthcare', 'Dengue and heat-risk forecasting live in Karnataka, a WhatsApp copilot for 3,000+ frontline health workers, AI screening for oral cancer and TB, and One Health surveillance.', '/assets/site/oral-screening.webp', R.programs + '/health'],
  ['Mobility', 'Drones that land and recharge on their own, 5G drone corridors, the InterSafe road-safety pilot, and autonomy and navigation stacks for vehicles.', '/assets/site/drone-room.webp', R.programs + '/wired-wireless'],
  ['Agriculture', 'Robots that work inside crop rows, the Agri Robotics Centre of Excellence, livestock disease strategy, and speech data for farmers in their own languages.', '/assets/founders/versor-robotics-trellis-row.webp', '/stories/versor-robotics'],
  ['Industrial automation', 'CAMRAS, the Industry 5.0 platform for MSMEs, robotic actuators, quadrupeds and humanoids built and tested at ARTgarage.', '/assets/site/quadruped-team.webp', R.programs + '/advanced-robotics'],
  ['Education', 'Spark sessions for founders, UG-PG fellowships, internships, robotics challenges and 5G courses through the ARTPARK Academy.', '/assets/site/skilling-session.webp', R.programs + '/academy'],
];
const trlArc = `<div class="trl reveal" style="margin-top:32px">
        <div class="trl-scale">${Array.from({ length: 10 }, (_, n) => `<span class="trl-tick${n <= 6 ? ' is-in' : ''}" style="--n:${n}"><b>${n}</b></span>`).join('')}</div>
        <div class="trl-band"><span class="trl-fill"></span><span class="trl-enter">We enter at TRL 0–3</span><span class="trl-stay">We stay until TRL 6 and beyond</span></div>
        <div class="trl-steps">
${TRL_STEPS.map((t, i) => `          <a class="trl-step" href="${t.href}" style="--i:${i}"${/^https?:/.test(t.href) ? ' target="_blank" rel="noopener"' : ''}><span class="trl-range">TRL ${t.from}–${t.to === 9 ? '9' : t.to}</span><b>${esc(t.label)}</b><span>${esc(t.note)}</span></a>`).join('\n')}
        </div>
      </div>`;
const approach = {
  route: R.approach,
  html: () => page({
    title: 'Approach — ARTPARK', active: 'about', sub: 'approach',
    description: 'What does it actually take to turn a breakthrough technology from an idea into a meaningful solution, at scale?',
    body: intro('approach', 'Approach.', 'Built for society, economy and sovereignty. By principle, by design. ARTPARK’s approach is defined by a single question: what does it actually take to turn a breakthrough technology from an idea into a meaningful solution, at scale?') + `
  <div style="max-width:1180px;margin:0 auto;padding:48px 24px 0">
    ${figure({ image: '/assets/site/team-meeting.webp', alt: 'The ARTPARK team in a working session', caption: 'The ARTPARK team at work, IISc Bengaluru.', pos: '50% 40%' })}
  </div>
  <div style="max-width:1180px;margin:0 auto;padding:0 24px 112px">
    <section class="reveal" style="padding:64px 0;border-bottom:1px solid var(--line)">
      ${sectionHead('Model', 'The technology readiness arc.', 'Technology Readiness Level (TRL) measures maturity, from raw concept to full deployment. ARTPARK was built to work across the whole arc, with different support at each phase.')}
      ${trlArc}
    </section>
    <section class="reveal" style="padding:64px 0;border-bottom:1px solid var(--line)">
      ${sectionHead('How we build', 'Four forms of support. Deployed together.')}
      <div class="icon-grid">
${SUPPORT.map(([ic, h, p], i) => `        <div class="icon-card" style="--i:${i}"><span class="icon-badge">${L.icon(ic, 26)}</span><span class="icon-n">0${i + 1}</span><h3 style="font-size:20px;line-height:1.25">${esc(h)}</h3><p style="font-size:15px;line-height:1.65;color:var(--ink-soft)">${esc(p)}</p></div>`).join('\n')}
      </div>
    </section>
    <section class="reveal" style="padding:64px 0;border-bottom:1px solid var(--line)">
      ${sectionHead('Selection', 'We choose the model that fits the mission.', 'ARTPARK does not assume every innovation should be a for-profit company. We assess the intended scale, the nature of the beneficiary and the economics of the market, and build accordingly.')}
      <div class="model-grid">
${MODELS.map(([ic, k, h, p, img, ex, href]) => `        <a class="model-card" href="${href}">
          <div class="model-img"><img src="${img}" alt="" loading="lazy"><span class="model-k">${L.icon(ic, 18)} ${esc(k)}</span></div>
          <div style="padding:22px 24px 24px;display:flex;flex-direction:column;gap:8px;flex:1"><h3 style="font-size:22px">${esc(h)}</h3><p style="font-size:15px;line-height:1.65;color:var(--ink-soft)">${esc(p)}</p><span class="model-ex">For example: ${esc(ex)} →</span></div>
        </a>`).join('\n')}
      </div>
    </section>
    <section class="reveal" style="padding:64px 0 0">
      ${sectionHead('Focus areas', 'Where we work.')}
      <div style="margin-top:28px;border-top:1px solid var(--line-strong)">
${FOCUS.map(([h, p, img, href]) => `        <a class="focus-row" href="${href}"><div class="focus-img"><img src="${img}" alt="" loading="lazy"></div><h3 style="font-size:20px">${esc(h)}</h3><p style="font-size:15px;line-height:1.6;color:var(--ink-soft)">${esc(p)}</p><span class="focus-go" aria-hidden="true">→</span></a>`).join('\n')}
      </div>
    </section>
  </div>`,
    scripts: ['/js/motion.js'],
  }),
};


// ---------- Facilities & Offerings (About-Facilities-Offerings.dc.html) ----------
const facilitiesPage = {
  route: R.facilities,
  html: () => page({
    title: 'Facilities & Offerings — ARTPARK', active: 'about', sub: 'facilities',
    description: 'The labs and infrastructure teams can use at ARTPARK, and the programs through which they come in.',
    body: intro('facilities', 'Facilities &amp; offerings.', 'The labs and infrastructure teams can use, and the programs through which they come in.') + '\n' + wrap([
      section(`${sectionHead('Facilities', 'Where the building and testing happens.')}
      ${photoGrid(P.facilities.map((f) => ({ image: f.image, alt: f.alt, title: f.name, text: f.text, href: f.href, label: f.render ? 'VISION RENDER' : '' })))}`, { label: 'Facilities' }),
      `    <section data-screen-label="Offerings" style="padding:64px 0 0">
      ${sectionHead('Offerings', 'Ways to work with ARTPARK.')}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:32px">
        <div style="background:var(--artblue);color:#fff;padding:32px 28px;min-height:240px;display:flex;flex-direction:column;gap:12px"><span style="font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.12em;color:var(--artlight)">TIR</span><h3 style="color:#fff;font-size:26px">Technology Innovators in Residence</h3><p style="font-size:14px;line-height:1.6;color:rgba(255,255,255,0.85)">For researchers with lab-proven technology. ₹25L non-dilutive first cheque and IISc lab access.</p><a href="https://apply.artpark.info/tir" target="_blank" rel="noopener" style="margin-top:auto;color:#fff;font-family:var(--font-display);font-weight:700;font-size:14px;text-decoration:none">Apply for TIR →</a></div>
        <div style="background:var(--accent-violet);color:#fff;padding:32px 28px;min-height:240px;display:flex;flex-direction:column;gap:12px"><span style="font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.12em;color:var(--artlight)">VIP</span><h3 style="color:#fff;font-size:26px">Venture Incubation Programme</h3><p style="font-size:14px;line-height:1.6;color:#fff">For incorporated startups at TRL 4+. Up to ₹2 Cr direct equity investment with follow-on pathways.</p><a href="https://apply.artpark.info/sip" target="_blank" rel="noopener" style="margin-top:auto;color:#fff;font-family:var(--font-display);font-weight:700;font-size:14px;text-decoration:none">Apply to VIP →</a></div>
        <div style="background:var(--artblack);color:#fff;padding:32px 28px;min-height:240px;display:flex;flex-direction:column;gap:12px"><span style="font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.12em;color:var(--artlight)">FACILITY ACCESS</span><h3 style="color:#fff;font-size:26px">Labs, 5G testbed and Open Days</h3><p style="font-size:14px;line-height:1.6;color:rgba(255,255,255,0.8)">The 5G test lab is open to startups, academia and industry at nominal cost. ARTgarage opens its doors twice a month for the community and for investors.</p><a href="${R.events}" style="margin-top:auto;color:#fff;font-family:var(--font-display);font-weight:700;font-size:14px;text-decoration:none">See Open Day dates →</a></div>
      </div>
      <p style="margin-top:20px;font-size:13px;line-height:1.6;color:var(--ink-dim)">Program terms change between cohorts. Current details are at <a href="https://apply.artpark.info/" target="_blank" rel="noopener">apply.artpark.info</a>.</p>
    </section>`,
    ].join('\n')),
  }),
};

// ---------- Certifications (About-Certifications.dc.html) ----------
const certifications = {
  route: R.certifications,
  html: () => page({
    title: 'Certifications — ARTPARK', active: 'about', sub: 'certifications',
    description: 'ARTPARK’s registrations, accreditations and tax status.',
    body: intro('certifications', 'Certifications.', 'Registrations, accreditations and statutory recognitions. As a charitable organisation seed-funded by DST, ARTPARK is eligible for Section 80G deductions and CSR contributions.') + `
  <div style="max-width:1180px;margin:0 auto;padding:64px 24px 112px">
    <div class="cert-table" data-cert-table style="border:1px solid var(--line)">
      <div class="cert-head" style="display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr) auto;gap:16px;padding:14px 22px;border-bottom:1px solid var(--line)"><span class="eyebrow">Document</span><span class="eyebrow">Issued by</span><span class="eyebrow">Details</span></div>
${C.certifications.map((c, i) => `      <div style="border-bottom:${i === C.certifications.length - 1 ? '0' : '1px solid var(--line)'};background:${i % 2 ? 'var(--paper-soft)' : 'var(--paper)'}">
        <div style="display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr) auto;gap:16px;padding:18px 22px;align-items:center;font-size:15px"><b style="font-family:var(--font-display)">${esc(c.title)}</b><span style="color:var(--ink-dim)">${esc(c.issuer)}</span><button type="button" data-cert-toggle aria-expanded="false" aria-controls="cert-${i}" style="background:none;border:0;padding:0;cursor:pointer;font:inherit;font-size:14px;font-weight:600;color:var(--artblue)">View details →</button></div>
        <p id="cert-${i}" hidden style="padding:0 22px 20px;max-width:820px;font-size:15px;line-height:1.7;color:var(--ink-soft)">${esc(c.desc)}</p>
      </div>`).join('\n')}
    </div>
    <p style="margin-top:16px;font-size:13px;color:var(--ink-dim)">For copies of certificates, write to <a href="mailto:connect@artpark.in">connect@artpark.in</a>.</p>
  </div>`,
  }),
};

// ---------- Other Programs (About-Other-Programs.dc.html) ----------
const DOT = { ONGOING: '', NEW: 'green', OPEN: 'green', CLOSED: 'coral' };
const programsList = {
  route: R.programs,
  html: () => page({
    title: 'Other Programs — ARTPARK', active: 'about', sub: 'programs',
    description: 'ARTPARK’s research and innovation programs beyond the residency and incubation tracks.',
    body: intro('programs', 'Other programs.', 'Initiatives beyond the residency and incubation tracks: research programs, centres of excellence and the academy.') + `
  <div style="max-width:1180px;margin:0 auto;padding:64px 24px 112px">
    <div style="border-top:1px solid var(--line-strong)">
${P.programs.map((p, i) => `      <a id="${p.slug}" class="prog-row" href="${R.programs}/${p.slug}" style="--i:${i}"><div class="prog-img"><img src="${p.image}" alt="" loading="lazy" style="object-fit:${p.fit || 'cover'};object-position:${p.imagePos || '50% 50%'}"></div><div style="display:flex;flex-direction:column;gap:8px"><span style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;letter-spacing:0.14em;color:var(--ink-dim)"><span class="dot ${DOT[p.status]}"></span>${p.status}</span><h3 style="font-size:22px">${esc(p.name)}</h3><p style="font-size:15px;line-height:1.65;color:var(--ink-soft)">${esc(p.short)}</p><span style="font-size:14px;font-weight:600;color:var(--artblue);text-decoration:underline">Learn more →</span></div></a>`).join('\n')}
    </div>
  </div>`,
  }),
};

// ---------- Program detail pages (his inner-page layout + his components) ----------
const programPage = (p) => ({
  route: `${R.programs}/${p.slug}`,
  html: () => page({
    title: `${p.name} — ARTPARK`, active: 'about', sub: 'programs', description: p.short,
    body: pageIntro({ eyebrow: 'Other programs', h1: esc(p.name) + '.', lede: esc(p.lede) }) + `
  <div style="max-width:1180px;margin:0 auto;padding:48px 24px 0">
    ${figure({ image: p.image, alt: p.imageAlt, caption: p.caption, pos: p.imagePos || '50% 50%', fit: p.fit || 'cover', ratio: p.fit === 'contain' ? '16/9' : '21/9' })}
  </div>
` + wrap([
      p.stats ? section(`${sectionHead('At a glance', 'The work, in numbers.')}
      ${statGrid(p.stats)}`) : '',
      section(`${sectionHead('The work', 'What we are building.')}
      <div class="work-grid">${p.rows.map(([h, t], i) => `<div class="work-card" style="--i:${i}"><span class="work-n">${String(i + 1).padStart(2, '0')}</span><h3 style="font-size:20px;line-height:1.25">${esc(h)}</h3><p style="font-size:15px;line-height:1.65;color:var(--ink-soft)">${esc(t)}</p></div>`).join('')}</div>${p.partnersNote ? `
      <p style="margin-top:16px;font-size:14px;color:var(--ink-dim)">${esc(p.partnersNote)}</p>` : ''}`, { last: !p.cards && !p.quotes && !p.links }),
      p.cards ? section(`${sectionHead('Inside the program', 'Up close.')}
      ${photoGrid(p.cards.map((c) => ({ ...c, alt: c.imageAlt })))}`, { last: !p.quotes && !p.links }) : '',
      p.quotes ? section(`${sectionHead('In their words', 'From the people building on it.')}
      ${p.quotes.map(([t, w]) => quote(t, w)).join('\n')}`, { last: !p.links }) : '',
      p.projects ? section(`${sectionHead('Projects', 'Inside the work.')}
      ${photoGrid(p.projects.map((s) => { const x = PJ.info(s); return { image: x.image || p.image, alt: x.title, title: x.title, text: x.lede, href: x.route, fit: x.image ? 'cover' : 'cover' }; }))}`) : '',
      p.videos ? section(`${sectionHead('Watch', 'See it working.')}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr));gap:24px 16px;margin-top:32px">
${p.videos.map(([t, v]) => `        <figure style="margin:0"><div style="position:relative;aspect-ratio:16/9;background:var(--artblack)"><iframe src="${v}" title="${esc(t)}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div><figcaption style="margin-top:10px;font-family:var(--font-display);font-weight:700;font-size:16px">${esc(t)}</figcaption></figure>`).join('\n')}
      </div>`) : '',
      (p.links || P.resources[p.slug]) ? section(`${sectionHead('Go further', 'Data, code, documents and announcements.')}
      <div style="margin-top:24px">${linkRows([...(p.links || []), ...(P.resources[p.slug] || [])].map(([title, href]) => ({ meta: /mailto:/.test(href) ? 'Email' : href.startsWith('/') ? (/\.(pdf|docx)$/.test(href) ? 'Document' : 'ARTPARK') : new URL(href).hostname.replace('www.', ''), title, href, action: /mailto:/.test(href) ? 'Write →' : /\.(pdf|docx)$/.test(href) ? 'Download →' : /youtu/.test(href) ? 'Watch →' : href.startsWith('/') ? 'Read →' : 'Open →' })))}</div>`, { last: true }) : '',
    ].filter(Boolean).join('\n')),
  }),
});

// ---------- Facility detail: ARTgarage and BRAINz ----------
const artgaragePage = {
  route: `${R.facilities}/artgarage`,
  html: () => page({
    title: 'ARTgarage — ARTPARK', active: 'about', sub: 'facilities',
    description: 'ARTgarage: 75,000 sq ft of manufacturing, testing, 5G and GPU infrastructure for AI, robotics and autonomous systems in Bengaluru.',
    body: pageIntro({ eyebrow: 'Facilities & Offerings', h1: 'ARTgarage.', lede: 'Where ideas become hardware. A 75,000 sq ft deep-tech facility at Jalahalli, Bengaluru: advanced manufacturing equipment, clean rooms, communications infrastructure, GPU compute and indoor-outdoor test arenas, all in one place. Here, innovators move from concept to prototype to customer trial, saving months if not years.' }) + `
  <div style="max-width:1180px;margin:0 auto;padding:48px 24px 0">
    ${figure({ image: '/assets/site/artgarage-hall.webp', alt: 'The main hall inside ARTgarage', caption: 'Inside ARTgarage, in a former HMT factory at Jalahalli.' })}
  </div>
` + wrap([
      section(`${sectionHead('At a glance', 'The facility.')}
      ${statGrid(P.artgarage.facts.map(([a, b]) => [a, b]))}`),
      section(`${sectionHead('What’s inside', 'Specialised labs and facilities.')}
      ${rows(P.artgarage.labs)}`),
      section(`${sectionHead('Technology areas', 'What gets built here.')}
      ${rows(P.artgarage.areas)}`),
      section(`${sectionHead('Up close', 'Life at the garage.')}
      ${photoGrid([
        { image: '/assets/site/quadruped-assembly.webp', alt: 'Engineers assembling a quadruped robot', title: 'Robots, assembled by hand', text: 'Quadrupeds and actuators are built and tested on site.' },
        { image: '/assets/site/test-equipment.webp', alt: 'An engineer at mechanical test equipment', title: 'Test before you ship', text: 'Mechanical and electrical test benches for validation.' },
        { image: '/assets/site/artgarage-entrance.webp', alt: 'The ARTgarage building entrance', title: 'Visit us', text: '177, HMT Colony, HMT Estate, Jalahalli, Bengaluru 560013. Open Days twice a month.', href: R.events },
      ])}`, { last: true }),
    ].join('\n')),
  }),
};
const brainzPage = {
  route: `${R.facilities}/brainz`,
  html: () => page({
    title: 'BRAINz — ARTPARK', active: 'about', sub: 'facilities',
    description: 'BRAINz: a 9-acre Bengaluru Robotics and AI Innovation Zone campus being built with the Government of Karnataka.',
    body: pageIntro({ eyebrow: 'Facilities & Offerings', h1: 'BRAINz.', lede: 'The Bengaluru Robotics and AI Innovation Zone: a 9-acre deep-tech campus, being built with the Government of Karnataka, for rapid discovery, organic collaboration and faster market impact in Space Tech, Aerospace &amp; Defence, Advanced Manufacturing and MedTech.' }) + `
  <div style="max-width:1180px;margin:0 auto;padding:48px 24px 0">
    ${figure({ image: '/assets/site/brainz-render.webp', alt: 'BRAINz campus vision render of the open innovation atrium', caption: 'Vision render: the open innovation atrium. The campus is being built.' })}
  </div>
` + wrap([
      section(`${sectionHead('The campus', 'Five purpose-built spaces.')}
      ${rows(P.brainz.spaces)}`),
      section(`${sectionHead('Partner to build BRAINz', 'Three ways to join.')}
      ${rows(P.brainz.partners)}
      <div style="margin-top:28px;display:flex;flex-wrap:wrap;gap:12px"><a class="btn btn-primary" href="${R.contact}">Write to us <span class="arrow">→</span></a><a class="btn btn-ghost" href="${R.facilities}/artgarage">Explore ARTgarage</a></div>`, { last: true }),
    ].join('\n')),
  }),
};

module.exports = [team, approach, facilitiesPage, certifications, programsList, ...P.programs.map(programPage), artgaragePage, brainzPage];
