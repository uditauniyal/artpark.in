// The homepage story series: the three long-form stories from the manager's Claude Design
// (Story-01-Light-Bulb, Story-02-Strand, Story-03-GPS), at /stories/light-bulb, /stories/strand and /stories/gps.
// Manager (2026-11-05): "Read the stories" on the homepage should open these long stories, as in the design.
// The markup is his, imported verbatim by tools/import-series.cjs into src/data/series/.
const fs = require('fs');
const path = require('path');
const { page } = require('../lib.cjs');

const DIR = path.join(__dirname, '..', 'data', 'series');
const SLUGS = ['light-bulb', 'strand', 'gps'];

module.exports = SLUGS.map((slug) => {
  const meta = JSON.parse(fs.readFileSync(path.join(DIR, slug + '.json'), 'utf8'));
  // The first picture is the hero, visible on arrival: load it straight away.
  // His design assumed a 96px header; the site header is taller, so the contents column and the headings it jumps to
  // sit at 132px, the same as the founder story pages (src/pages/stories.cjs).
  const body = fs.readFileSync(path.join(DIR, slug + '.html'), 'utf8').replace(' loading="lazy"', '')
    .replace(/position:sticky;top:96px/g, 'position:sticky;top:132px').replace(/scroll-margin-top:96px/g, 'scroll-margin-top:132px');
  const lede = (body.match(/<h1[\s\S]*?<\/h1>\s*<p[^>]*>([\s\S]*?)<\/p>/) || [])[1] || '';
  return {
    route: meta.route,
    html: () => page({ title: meta.title, description: lede.replace(/<[^>]+>/g, '').trim(), active: 'home', body }),
  };
});
