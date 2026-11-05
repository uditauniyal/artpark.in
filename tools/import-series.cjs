// Imports the three long-form homepage stories from the manager's Claude Design export
// (Story-01-Light-Bulb, Story-02-Strand, Story-03-GPS .dc.html) into src/data/series/*.html, verbatim.
// Only the design-runtime parts are converted: header/footer imports are dropped (the site adds its own),
// the reading-progress bar is dropped (the site's motion layer already draws one), <image-slot> becomes <img>,
// and links between the design files become site routes.
// Usage: node tools/import-series.cjs [path to the Claude Design export, default ../.reference/claude-design-v2]
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.resolve(process.argv[2] || path.join(ROOT, '..', '.reference', 'claude-design-v2'));
const STORIES = [
  ['Story-01-Light-Bulb.dc.html', 'light-bulb'],
  ['Story-02-Strand.dc.html', 'strand'],
  ['Story-03-GPS.dc.html', 'gps'],
];
const ROUTE = { 'Story-01-Light-Bulb.dc.html': '/stories/light-bulb', 'Story-02-Strand.dc.html': '/stories/strand', 'Story-03-GPS.dc.html': '/stories/gps', 'ARTPARK-Home.dc.html': '/' };

const out = path.join(ROOT, 'src', 'data', 'series');
fs.mkdirSync(out, { recursive: true });
for (const [file, slug] of STORIES) {
  const html = fs.readFileSync(path.join(SRC, file), 'utf8');
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const start = html.indexOf('>', html.indexOf('<dc-import name="SiteHeader"'));
  const end = html.indexOf('<dc-import name="SiteFooter"');
  if (!title || start < 0 || end < 0) throw new Error('Unexpected layout in ' + file);
  let body = html.slice(html.indexOf('</dc-import>', start) + '</dc-import>'.length, end).trim();
  // <image-slot src> -> <img>; alt text from the figure's caption when there is one.
  body = body.replace(/(<figure[\s\S]*?)?<image-slot\b[^>]*\bsrc="([^"]+)"[^>]*><\/image-slot>([\s\S]*?<figcaption[^>]*>([\s\S]*?)<\/figcaption>)?/g, (m, before = '', src, after = '', cap = '') => {
    const alt = cap.replace(/<[^>]+>/g, '').replace(/"/g, '&quot;').trim();
    return `${before}<img src="/${src.replace(/^\.?\//, '')}" alt="${alt}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block">${after}`;
  });
  if (/<image-slot|\{\{|<dc-|<sc-/.test(body)) throw new Error('Unconverted design markup left in ' + file);
  body = body.replace(/href="([^"#]+\.dc\.html)(#[^"]*)?"/g, (m, f, hash = '') => {
    if (!ROUTE[f]) throw new Error('No route for ' + f);
    return `href="${ROUTE[f]}${hash}"`;
  });
  const meta = `<!-- Imported verbatim from the Claude Design export (${file}) by tools/import-series.cjs. Do not edit by hand; re-run the import. -->\n`;
  fs.writeFileSync(path.join(out, slug + '.html'), meta + body + '\n');
  fs.writeFileSync(path.join(out, slug + '.json'), JSON.stringify({ slug, route: '/stories/' + slug, title, source: file }, null, 2) + '\n');
  console.log(slug, body.length, 'chars');
}
