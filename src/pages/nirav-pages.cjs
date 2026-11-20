// Pages the manager rebuilt in his design canvas, imported verbatim into src/data/nirav-pages/: on 2026-11-16
// (tools/import-nirav-1116.cjs) Home, Approach, the new Focus Areas and the new Work-in-progress placeholder; on
// 2026-11-19 (tools/import-nirav-1119.cjs) Home and Focus Areas again, and Introduction, Our Team, Facilities,
// Programs, ArtLabs and Social Impact; on 2026-11-20 (tools/import-nirav-1120.cjs) Approach, Social Impact again, and
// TIR, VIP and RDI.
// They sit inside our header and footer. His export has no page descriptions, so Home and Approach keep the ones they
// had, and Focus Areas and Work in progress use his own intro sentences.
const fs = require('fs');
const path = require('path');
const { page } = require('../lib.cjs');
const { sharpArt } = require('./series.cjs');

const DIR = path.join(__dirname, '..', 'data', 'nirav-pages');
const PAGES = {
  home: { active: 'home', home: true, scripts: ['/js/motion.js'], description: 'ARTPARK, the AI & Robotics Technology Park at IISc Bengaluru, works on what comes after the breakthrough: engineering, testing, integration and scale.' },
  approach: { active: 'about', sub: 'approach', scripts: ['/js/motion.js'], description: 'What does it actually take to turn a breakthrough technology from an idea into a meaningful solution, at scale?' },
  'focus-areas': { active: 'about', sub: 'focus', scripts: ['/js/motion.js'], description: 'We back deep technology in four domains where India needs its own capability, through three horizontal capabilities that cut across all of them.' },
  // Manager, 2026-11-19 design (tools/import-nirav-1119.cjs). Descriptions are each page's own intro sentence.
  introduction: { active: 'about', sub: 'introduction', scripts: ['/js/motion.js'], description: 'ARTPARK (AI & Robotics Technology Park) at IISc, Bengaluru, is a nonprofit (section-8) organisation building India’s next generation of innovations and innovators for its economy, sovereignty and society.' },
  team: { active: 'about', sub: 'team', scripts: ['/js/team-versions.js'], description: 'Meet the people behind the ARTPARK engine, from the board that sets our course to the team that turns research into ventures, every day.' },
  facilities: { active: 'about', sub: 'facilities', description: 'The labs and infrastructure teams can use, and the programs through which they come in.' },
  programs: { active: 'programs', sub: 'programs', description: 'ARTPARK’s programs span three tracks: ArtLabs, Venture Building and Social Impact.' },
  artlabs: { active: 'programs', sub: 'artlabs', description: 'ARTLabs is where bold ideas become innovations, technologies and ventures, bringing together deep-tech researchers, engineers and entrepreneurs across AI, robotics, health, climate and advanced systems.' },
  // Manager, 2026-11-20 design (tools/import-nirav-1120.cjs); were src/pages/program-pages.cjs, same descriptions.
  tir: { active: 'programs', sub: 'tir', description: 'Six months, ₹25L and IISc infrastructure for researchers with lab-proven, TRL 3 technology.' },
  vip: { active: 'programs', sub: 'vip', description: 'Direct investment and venture building support for incorporated Indian deep-tech startups at TRL 4+.' },
  rdi: { active: 'programs', sub: 'rdi', description: 'ARTPARK deploys the Government of India RDI Scheme as a Focused Research Organisation. Express interest.' },
  'social-impact': { active: 'programs', sub: 'social-impact', description: 'Data and AI for the public good: health data and AI deployed with city, state and national governments, and open speech and language data so AI can serve India’s languages.' },
  // On phones the four countdown boxes (76 px minimum each) overflowed the screen; share the width equally instead.
  'work-in-progress': { css: '@media (max-width:480px){[data-cd-running] div[style*="display:flex;gap:10px"]{display:grid!important;grid-template-columns:repeat(4,1fr);gap:8px!important}[data-cd-running] div[style*="min-width:76px"]{min-width:0!important;padding:10px 4px!important}}', scripts: ['/js/motion.js'], description: 'This page is being rebuilt as the ARTPARK website moves to its new home.' },
};

const pages = Object.entries(PAGES).map(([slug, o]) => {
  const meta = JSON.parse(fs.readFileSync(path.join(DIR, slug + '.json'), 'utf8'));
  // User (2026-11-16): no "… · painted illustration" label pills over the pictures.
  const body = sharpArt(fs.readFileSync(path.join(DIR, slug + '.html'), 'utf8'))
    .replace(/<span class="hero-slide-caption"[^>]*>[^<]*<\/span>/g, '')
    .replace(/<figcaption[^>]*>[^<]*painted illustration<\/figcaption>/gi, '');
  const render = (bodyAttrs) => page({ title: meta.title, description: o.description, active: o.active || '', sub: o.sub || '', home: !!o.home, body, scripts: o.scripts, head: meta.style + (o.css ? '\n' + o.css : ''), bodyAttrs, tail: meta.tail });
  return { route: meta.route, html: () => render(meta.bodyAttrs), render };
});

// Nirav (2026-11-20): Tenders and Careers count down 15 days, the Sign in page (/apply) 30 days, from the original
// 20 Nov 18:00 IST deadline. Each gets its own copy of the countdown page; vercel.json sends those pages to it.
const WIP_READY_BY = { tenders: '2026-12-05T18:00', careers: '2026-12-05T18:00', 'sign-in': '2026-12-20T18:00' };
const wip = pages.find((p) => p.route === '/work-in-progress');
for (const [key, at] of Object.entries(WIP_READY_BY)) pages.push({ route: `/work-in-progress/${key}`, html: () => wip.render(`data-ready-by="${at}"`) });

module.exports = pages;
