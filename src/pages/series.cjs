// The homepage story series: the three long-form stories from the manager's Claude Design
// (Story-01-Light-Bulb, Story-02-Strand, Story-03-GPS), at /stories/light-bulb, /stories/strand and /stories/gps.
// Manager (2026-11-05): "Read the stories" on the homepage should open these long stories, as in the design.
// The markup is his, imported verbatim by tools/import-series.cjs into src/data/series/.
const fs = require('fs');
const path = require('path');
const { page } = require('../lib.cjs');

const DIR = path.join(__dirname, '..', 'data', 'series');
const SLUGS = ['light-bulb', 'strand', 'gps'];
// The design export's story paintings are 200 px thumbnails, blurry at full width; use the oil-painted versions of the
// same scenes (about 600 px) that the manager made for the 2026-11-16 Home collage (user: no visual hiccups).
const sharpArt = (html) => html.replace(/\/assets\/art\/(story[123]-[a-z-]+?)\.jpg/g, (m, base) => (fs.existsSync(path.join(__dirname, '..', '..', 'public', 'assets', 'art', base + '-oil3.jpg')) ? `/assets/art/${base}-oil3.jpg` : m));

const pages = SLUGS.map((slug) => {
  const meta = JSON.parse(fs.readFileSync(path.join(DIR, slug + '.json'), 'utf8'));
  // The first picture is the hero, visible on arrival: load it straight away.
  // His design assumed a 96px header; the site header is taller, so the contents column and the headings it jumps to
  // sit at 132px, the same as the founder story pages (src/pages/stories.cjs).
  const body = sharpArt(fs.readFileSync(path.join(DIR, slug + '.html'), 'utf8'))
    // User (2026-11-16): no "Illustration." labels in the captions.
    .replace(/\s*(Painted|Watercolor|Watercolour) illustration\s*[—-]\s*interpretive[^<]*?\./gi, '').replace(/\s*Illustration\.(?=\s*<)/g, '').replace(' loading="lazy"', '')
    .replace(/position:sticky;top:96px/g, 'position:sticky;top:132px').replace(/scroll-margin-top:96px/g, 'scroll-margin-top:132px')
    // The contents column is the same as the founder stories', so it shares their class and their rule that unpins it
    // once it stacks above the text (user 2026-11-16, iPhone: the story text scrolled over the pinned contents).
    .replace('<aside style="flex:0 1 220px;position:sticky', '<aside class="story-toc" style="flex:0 1 220px;position:sticky');
  const lede = (body.match(/<h1[\s\S]*?<\/h1>\s*<p[^>]*>([\s\S]*?)<\/p>/) || [])[1] || '';
  return {
    route: meta.route,
    html: () => page({ title: meta.title, description: lede.replace(/<[^>]+>/g, '').trim(), active: 'home', body }),
  };
});
module.exports = pages;
module.exports.sharpArt = sharpArt;
