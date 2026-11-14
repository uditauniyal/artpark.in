// Shared layout, header and footer.
// Markup and inline styles are ported verbatim from the manager's Claude Design export
// (.reference/claude-design/SiteHeader.dc.html, SiteFooter.dc.html). Deviations are
// listed in notes/corrections-log.md.

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Clean URLs for every page (manager's file name in comments).
const R = {
  home: '/',                               // ARTPARK-Home.dc.html
  team: '/about/team',                     // About-Our-Team.dc.html
  approach: '/about/approach',             // About-Approach.dc.html
  facilities: '/about/facilities',         // About-Facilities-Offerings.dc.html
  certifications: '/about/certifications', // About-Certifications.dc.html
  programs: '/about/programs',             // About-Other-Programs.dc.html
  portfolio: '/portfolio',
  partnerships: '/partnerships',
  events: '/events',                       // Outreach-Events.dc.html
  news: '/news',                           // Outreach-News.dc.html
  tenders: '/tenders',                     // Outreach-Tenders.dc.html
  careers: '/careers',
  stories: '/stories',
  contact: '/contact',
  // User (2026-11-14): no links to apply.artpark.info until it merges into artpark.in; applying and signing in open
  // an "in progress" page (src/pages/apply.cjs).
  apply: '/apply',
  applySignIn: '/apply',
};

const ABOUT_ITEMS = [
  ['team', 'Our Team', 'Leadership and board', R.team],
  ['approach', 'Approach', 'How we choose and run the work', R.approach],
  ['facilities', 'Facilities & Offerings', 'Labs, infrastructure and programs', R.facilities],
  ['certifications', 'Certifications', 'Registrations and accreditations', R.certifications],
  ['programs', 'Programs', 'Initiatives beyond TIR and SIP', R.programs],
];
const OUTREACH_ITEMS = [
  ['events', 'Events', 'Summits, talks and challenges', R.events],
  ['news', 'News', 'ARTPARK in the press', R.news],
  ['tenders', 'Tenders', 'Procurement notices and vendor registration', R.tenders],
];

// Correction: official IISc + ARTPARK co-branding lockup (brand guidelines p.4),
// one image, no divider. Manager's version: two images with a 1px rule between.
const LOCKUP = '/assets/brand/artpark-iisc-lockup.webp';
const LOCKUP_ALT = 'Indian Institute of Science and ARTPARK, AI & Robotics Technology Park @ IISc';

function header(active = '', sub = '') {
  const ink = (on) => (on ? 'var(--artblue)' : 'var(--ink)');
  const util = (on) => (on ? 'var(--artlight)' : '#fff');
  const menu = (key, label, items, isActive, minW) => `
        <div class="nav-menu" data-menu="${key}" style="position:relative;display:flex;align-items:center">
          <button type="button" aria-expanded="false" aria-haspopup="true" aria-controls="menu-${key}" class="nav-link" data-ink="${ink(isActive)}" style="background:none;border:0;padding:0;margin:0;font:inherit;font-family:var(--font-display);font-weight:700;font-size:14px;letter-spacing:0.04em;line-height:1.2;cursor:pointer;color:${ink(isActive)};display:flex;align-items:center;gap:6px">${label} <span data-marker style="color:var(--artblue);font-size:16px;line-height:1">+</span></button>
          <div id="menu-${key}" class="nav-dropdown" hidden style="position:absolute;top:100%;left:-16px;padding-top:14px;z-index:70">
            <div role="menu" style="background:var(--paper);border:1px solid var(--line-strong);border-radius:2px;min-width:${minW}px">
${items.map(([k, l, d, href]) => `              <a role="menuitem" href="${href}" style="display:block;padding:12px 16px;border-bottom:1px solid var(--line);text-decoration:none;background:${sub === k ? 'var(--paper-soft)' : 'var(--paper)'};transition:background 150ms ease">
                <span style="display:block;font-family:var(--font-display);font-weight:700;font-size:14px;color:${ink(sub === k)}">${esc(l)}</span>
                <span style="display:block;font-size:12.5px;line-height:1.4;color:var(--ink-dim);margin-top:2px">${esc(d)}</span>
              </a>`).join('\n')}
            </div>
          </div>
        </div>`;

  return `<div class="site-header-host" style="position:sticky;top:0;z-index:50">
<header data-screen-label="Header" style="background:var(--paper);font-family:var(--font-body)">
  <div class="util-bar" style="background:var(--artblack);color:#fff">
    <div style="max-width:1180px;margin:0 auto;padding:7px 24px;display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:6px 20px;font-size:12.5px">
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px 20px">
        <a href="${R.careers}" style="color:${util(active === 'careers')};text-decoration:none">Careers</a>
        <a href="${R.tenders}" style="color:${util(sub === 'tenders')};text-decoration:none">Tenders</a>
        <span style="width:1px;height:14px;background:rgba(255,255,255,0.3)"></span>
        <a href="${R.applySignIn}" style="color:#fff;text-decoration:none;font-weight:600">Sign in</a>
        <a href="${R.applySignIn}" style="background:var(--artlight);color:var(--artblue);padding:4px 14px;border-radius:999px;text-decoration:none;font-family:var(--font-display);font-weight:700">Sign up</a>
      </div>
    </div>
  </div>
  <div style="border-bottom:1px solid var(--line)">
    <div class="site-header-row" style="max-width:1180px;margin:0 auto;padding:14px 24px;display:flex;flex-wrap:wrap;align-items:center;gap:14px 20px">
      <a href="${R.home}" class="site-logo" style="display:flex;align-items:center;text-decoration:none">
        <img src="${LOCKUP}" alt="${LOCKUP_ALT}" width="205" height="41" style="width:205px;height:auto;display:block">
      </a>
      <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu"><span></span><span></span><span></span></button>
      <nav id="site-nav" class="site-nav" style="flex:1 1 auto;display:flex;flex-wrap:nowrap;gap:clamp(12px,1.6vw,30px);justify-content:center;align-items:center;white-space:nowrap">
        <a class="nav-link" href="${R.home}" style="line-height:1.2;color:${ink(active === 'home')}">Home</a>
${menu('about', 'About', ABOUT_ITEMS, active === 'about', 280)}
        <a class="nav-link" href="${R.portfolio}" style="line-height:1.2;color:${ink(active === 'portfolio')}">Portfolio</a>
        <a class="nav-link" href="${R.partnerships}" style="line-height:1.2;color:${ink(active === 'partnerships')}">Partnerships</a>
${menu('outreach', 'Outreach', OUTREACH_ITEMS, active === 'outreach', 260)}
        <a class="nav-link" href="${R.contact}" style="line-height:1.2;color:${ink(active === 'contact')}">Contact</a>
        <div class="nav-extra"><a class="btn btn-primary" href="${R.home}#collaborate" style="border-radius:999px;justify-content:center">Work with us <span class="arrow">→</span></a><div class="nav-extra-links"><a href="${R.careers}">Careers</a><a href="${R.tenders}">Tenders</a><a href="${R.applySignIn}">Sign in</a><a class="is-pill" href="${R.applySignIn}">Sign up</a></div></div>
      </nav>
      <a class="btn btn-primary site-cta" href="${R.home}#collaborate" style="border-radius:999px;padding:11px 20px;flex:none;white-space:nowrap">Work with us <span class="arrow">→</span></a>
    </div>
  </div>
</header>
</div>`;
}

// Manager (2026-11-12, Claude Design): social links as icons.
const SOCIAL = [
  ['LinkedIn', 'https://www.linkedin.com/company/artpark-in/', 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'],
  ['YouTube', 'https://www.youtube.com/channel/UCW_92hCpIIoiYsR5NYebEag', 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'],
  ['X', 'https://twitter.com/artparkindia', 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z'],
  ['Instagram', 'https://www.instagram.com/artpark_india/', 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z'],
];

function footer() {
  const col = (title, links) => `      <div style="display:flex;flex-direction:column;gap:8px">
        <span style="font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.14em;color:rgba(255,255,255,0.6)">${title}</span>
${links.map(([l, href]) => `        <a href="${href}" style="color:#fff;text-decoration:none;font-size:14px">${esc(l)}</a>`).join('\n')}
      </div>`;
  return `<footer data-screen-label="Footer" style="background:var(--artblack);color:#fff;padding:64px 0 32px;font-family:var(--font-body)">
  <div style="max-width:1180px;margin:0 auto;padding:0 24px">
    <div class="footer-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:32px">
      <div style="display:flex;flex-direction:column;gap:16px">
        <a href="${R.home}" style="align-self:flex-start;display:block"><img src="${LOCKUP}" alt="${LOCKUP_ALT}" width="218" height="44" class="footer-lockup" style="height:44px;width:auto;display:block"></a>
        <p style="font-size:14px;line-height:1.6;color:rgba(255,255,255,0.7);max-width:320px">ARTPARK (AI &amp; Robotics Technology Park) is a not-for-profit Section-8 company at the Indian Institute of Science, Bangalore, committed to building and deploying AI &amp; Robotics technologies for Society, Economy, and Sovereignty.</p>
        <div style="display:flex;flex-wrap:wrap;gap:18px;align-items:center">${SOCIAL.map(([l, h, d]) => `<a href="${h}" target="_blank" rel="noopener" aria-label="ARTPARK on ${l}" title="${l}" style="display:flex;align-items:center;justify-content:center;color:#fff;opacity:0.95;transition:opacity 150ms ease"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg></a>`).join('')}</div>
      </div>
${col('HOME', [['Stories', R.home + '#stories'], ['What we believe', R.home + '#believe'], ["What we're building", R.home + '#building'], ['Work with us', R.home + '#collaborate']])}
${col('ABOUT', ABOUT_ITEMS.map(([, l, , h]) => [l, h]))}
${col('EXPLORE', [['Portfolio', R.portfolio], ['Partnerships', R.partnerships], ['Events', R.events], ['News', R.news], ['Tenders', R.tenders], ['Careers', R.careers], ['Contact', R.contact]])}
    </div>
    <div style="margin-top:40px;border-top:1px solid rgba(255,255,255,0.15);padding-top:20px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font-size:12px;color:rgba(255,255,255,0.5)">
      <span>© 2026 ARTPARK, IISc Bengaluru · <a href="/privacy-policy" class="footer-legal">Privacy policy</a><a href="/terms-of-use" class="footer-legal">Terms of use</a></span>
    </div>
  </div>
</footer>`;
}

// Full HTML document. `body` is the page content between header and footer.
function page({ title, description = '', active = '', sub = '', body, scripts = [] }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" href="/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&amp;display=swap">
<link rel="stylesheet" href="/_ds/colors_and_type.css">
<link rel="stylesheet" href="/_ds/marketing.css">
<link rel="stylesheet" href="/css/site.css">
<link rel="stylesheet" href="/css/pages.css">
<link rel="stylesheet" href="/css/scale.css">
<link rel="stylesheet" href="/css/wow.css">
</head>
<body>
<div class="ap-curtain" aria-hidden="true"><span class="ap-curtain-label">ARTPARK</span></div>
<div style="font-family:var(--font-body);color:var(--ink);background:var(--paper)">
${header(active, sub)}
${body}
${footer()}
</div>
<script src="/js/site.js" defer></script>
<script src="/js/ap-motion.js" defer></script>
<script src="/js/ap-wow.js" defer></script>
${scripts.map((s) => `<script src="${s}" defer></script>`).join('\n')}
</body>
</html>
`;
}

// Standard inner-page intro: eyebrow rule, H1, lede, optional sub-tab row.
// Floating composition for the empty right side of a page intro (round 8: "floating stuff and moving windows").
// items: { kind: 'win'|'chip'|'stat'|'doc', x, y, w (percent of the stage), d (parallax depth), r (deg), t (bob seconds), ... }
function floatStage(items) {
  const one = (it, i) => {
    const st = `--x:${it.x}%;--y:${it.y}%;--w:${it.w}%;--d:${it.d || 1};--r:${it.r || 0}deg;--t:${it.t || 7}s;--del:${-(i * 1.3).toFixed(1)}s${it.ar ? ';--ar:' + it.ar : ''}`;
    let inner = '';
    if (it.kind === 'win') inner = `<img src="${it.src}" alt="" loading="eager" style="object-position:${it.pos || '50% 50%'}">${it.cap ? `<i>${esc(it.cap)}</i>` : ''}`;
    if (it.kind === 'chip') inner = it.logo ? `<img src="${it.logo}" alt=""${it.imgH ? ` style="max-height:${it.imgH}px"` : ''}>` : `<b>${esc(it.text)}</b>`;
    if (it.kind === 'stat') inner = `<b>${esc(it.n)}</b><small>${esc(it.l)}</small>`;
    if (it.kind === 'doc') inner = `<em>${esc(it.tag || 'PDF')}</em><b>${esc(it.text)}</b>${it.sub ? `<small>${esc(it.sub)}</small>` : ''}`;
    return `<div class="fl fl-${it.kind}${it.hl ? ' is-hl' : ''}" style="${st}"><span>${inner}</span></div>`;
  };
  return `<div class="float-stage" aria-hidden="true">${items.map(one).join('')}</div>`;
}

function pageIntro({ eyebrow, h1, lede, tabs, float }) {
  const tabRow = tabs ? `
      <div class="sub-tabs" style="display:flex;flex-wrap:wrap;gap:4px 28px;margin-top:40px;border-bottom:1px solid var(--line);font-family:var(--font-display);font-weight:700;font-size:14px">
${tabs.items.map(([k, l, href]) => `        <a href="${href}" style="padding-bottom:12px;margin-bottom:-1px;text-decoration:none;color:${tabs.current === k ? 'var(--artblue)' : 'var(--ink)'};border-bottom:2px solid ${tabs.current === k ? 'var(--artblue)' : 'transparent'}"${tabs.current === k ? ' aria-current="page"' : ''}>${esc(l)}</a>`).join('\n')}
      </div>` : '';
  return `  <section style="padding:clamp(56px,8vw,96px) 0 0">
    <div class="intro-wrap${float ? ' has-float' : ''}" style="max-width:1180px;margin:0 auto;padding:0 24px;position:relative">
      ${float ? floatStage(float) : ''}<div class="eyebrow-rule">${esc(eyebrow)}</div>
      <h1 style="font-size:clamp(44px,6.4vw,80px);line-height:1.03;margin-top:20px">${h1}</h1>
      <p style="margin-top:24px;max-width:680px;font-size:18px;line-height:1.7;color:var(--ink-soft)">${lede}</p>${tabRow}
    </div>
  </section>`;
}

// ---------- Components reused from his pages (same markup and inline styles) ----------

// Section heading: his ".eyebrow" + H2 (About pages: Leadership / Facilities / Focus areas).
const sectionHead = (eyebrow, h2, intro) => `<span class="eyebrow">${esc(eyebrow)}</span>
      <h2 style="font-size:clamp(30px,3.6vw,40px);margin-top:12px">${h2}</h2>${intro ? `
      <p style="margin-top:14px;max-width:760px;font-size:17px;line-height:1.7;color:var(--ink-soft)">${intro}</p>` : ''}`;

// Rows: his Approach "Where we work." list (h3 left, text right, ruled).
const rows = (items) => `<div style="margin-top:28px;border-top:1px solid var(--line-strong)">
${items.map(([h, p]) => `        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:6px 32px;padding:20px 0;border-bottom:1px solid var(--line)"><h3 style="font-size:20px">${esc(h)}</h3><p style="font-size:15px;line-height:1.6;color:var(--ink-soft)">${esc(p)}</p></div>`).join('\n')}
      </div>`;

// Numbered/stat grid: his Tenders "How tendering works" grid (1px rules, big artblue figure).
const statGrid = (items) => `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1px;background:var(--line);border:1px solid var(--line);margin-top:16px">
${items.map(([n, t]) => `        <div style="background:var(--paper);padding:24px;display:flex;flex-direction:column;gap:8px"><span style="font-family:var(--font-display);font-weight:700;font-size:28px;color:var(--artblue)">${esc(n)}</span><p style="font-size:14px;line-height:1.6;color:var(--ink-soft)">${esc(t)}</p></div>`).join('\n')}
      </div>`;

// Photo card: his Facilities "Facility name" card (3:2 image, bordered).
const photoCard = ({ image, alt, title, text, href, fit, label }) => `          <div style="border:1px solid var(--line);display:flex;flex-direction:column">
            <div style="position:relative;width:100%;aspect-ratio:3/2;background:var(--paper-soft);overflow:hidden"><img src="${image}" alt="${esc(alt || '')}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${fit || 'cover'};display:block">${label ? `<span style="position:absolute;left:10px;top:10px;background:rgba(255,255,255,0.94);color:var(--artblue);padding:4px 9px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:0.08em">${esc(label)}</span>` : ''}</div>
            <div style="padding:22px 24px;display:flex;flex-direction:column;gap:6px;flex:1"><div style="font-family:var(--font-display);font-weight:700;font-size:19px">${esc(title)}</div><p style="font-size:14px;line-height:1.6;color:var(--ink-soft)">${esc(text)}</p>${href ? `<a href="${href}" style="margin-top:auto;padding-top:8px;font-family:var(--font-display);font-weight:700;font-size:14px;text-decoration:none">Learn more →</a>` : ''}</div>
          </div>`;
const photoGrid = (cards) => `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:32px">
${cards.map(photoCard).join('\n')}
      </div>`;

// Figure: his Story hero figure (wide image + caption).
const figure = ({ image, alt, caption, ratio = '21/9', pos = '50% 50%', fit = 'cover' }) => `<figure style="margin:0">
      <div style="position:relative;width:100%;aspect-ratio:${ratio};background:var(--paper-soft);overflow:hidden"><img src="${image}" alt="${esc(alt || '')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${fit};object-position:${pos};display:block"></div>${caption ? `
      <figcaption style="margin-top:10px;font-size:13px;line-height:1.5;color:var(--ink-dim)">${esc(caption)}</figcaption>` : ''}
    </figure>`;

// Pull quote: his Story blockquote.
const quote = (text, who) => `<blockquote style="margin:16px 0;padding:28px 0;border-top:1px solid var(--line-strong);border-bottom:1px solid var(--line-strong);font-family:var(--font-display);font-weight:700;font-size:clamp(22px,2.6vw,30px);line-height:1.28;color:var(--artblue-deep);text-wrap:balance">“${esc(text)}”${who ? `<footer style="margin-top:14px;font-family:var(--font-body);font-weight:600;font-size:14px;color:var(--ink-soft)">${esc(who)}</footer>` : ''}</blockquote>`;

// Link rows: his News list rows (meta · title · action).
const linkRows = (items) => `<div style="border-top:1px solid var(--line-strong)">
${items.map(({ meta, title, href, action = 'Read →' }) => {
  const ext = /^https?:/.test(href);
  return `        <div class="link-row" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:6px 24px;padding:22px 0;border-bottom:1px solid var(--line);align-items:baseline">
          <span style="font-size:13px;color:var(--ink-dim)">${esc(meta)}</span>
          <span style="grid-column:span 2;font-family:var(--font-display);font-weight:700;font-size:19px;line-height:1.3">${esc(title)}</span>
          <a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''} style="font-size:14px;font-weight:600;justify-self:end">${action}</a>
        </div>`;
}).join('\n')}
      </div>`;

// Page body wrapper matching his inner pages (max 1180, side padding, bottom space).
const wrap = (inner, pad = '0 24px 112px') => `  <div style="max-width:1180px;margin:0 auto;padding:${pad}">
${inner}
  </div>`;
const section = (inner, { last = false, label = '' } = {}) => `    <section${label ? ` data-screen-label="${esc(label)}"` : ''} style="padding:64px 0${last ? ' 0' : ''};${last ? '' : 'border-bottom:1px solid var(--line)'}">
      ${inner}
    </section>`;

const ABOUT_TABS = ABOUT_ITEMS.map(([k, l, , h]) => [k, l, h]);
const OUTREACH_TABS = OUTREACH_ITEMS.map(([k, l, , h]) => [k, l, h]);

const ICONS = {
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
  banknote: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
  clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
  flask: '<path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
};
const icon = (name, size = 24) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

module.exports = { floatStage, icon, esc, R, page, pageIntro, ABOUT_TABS, OUTREACH_TABS, LOCKUP, LOCKUP_ALT, sectionHead, rows, statGrid, photoCard, photoGrid, figure, quote, linkRows, wrap, section };
