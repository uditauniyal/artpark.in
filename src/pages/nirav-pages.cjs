// Pages the manager rebuilt in his design canvas on 2026-11-16, imported verbatim by tools/import-nirav-1116.cjs into
// src/data/nirav-pages/: Home, Approach, the new Focus Areas and the new Work-in-progress placeholder.
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
  // On phones the four countdown boxes (76 px minimum each) overflowed the screen; share the width equally instead.
  'work-in-progress': { css: '@media (max-width:480px){[data-cd-running] div[style*="display:flex;gap:10px"]{display:grid!important;grid-template-columns:repeat(4,1fr);gap:8px!important}[data-cd-running] div[style*="min-width:76px"]{min-width:0!important;padding:10px 4px!important}}', scripts: ['/js/motion.js'], description: 'This page is being rebuilt as the ARTPARK website moves to its new home.' },
};

module.exports = Object.entries(PAGES).map(([slug, o]) => {
  const meta = JSON.parse(fs.readFileSync(path.join(DIR, slug + '.json'), 'utf8'));
  const body = sharpArt(fs.readFileSync(path.join(DIR, slug + '.html'), 'utf8'));
  return {
    route: meta.route,
    html: () => page({ title: meta.title, description: o.description, active: o.active || '', sub: o.sub || '', home: !!o.home, body, scripts: o.scripts, head: meta.style + (o.css ? '\n' + o.css : ''), bodyAttrs: meta.bodyAttrs, tail: meta.tail }),
  };
});
