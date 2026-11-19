// Imports the pages the manager rebuilt in his design canvas on 2026-11-19 (static export, artpark-site/) verbatim,
// the same way as tools/import-nirav-1116.cjs: Home and Focus Areas again, and the new or rebuilt Introduction, Our
// Team, Facilities, Programs, ArtLabs and Social Impact. Approach and Work in progress are left as imported on 16 Nov
// (he did not change them; the countdown date is ours). Each page's body (between the site header and footer), its
// head <style>, its <body> attributes and any trailing inline script go to src/data/nirav-pages/;
// src/pages/nirav-pages.cjs serves them inside our header and footer.
// Links stay ours: trailing slashes on internal links are dropped and https://artparkin.vercel.app/ prefixes become
// root-relative. Every /assets/ file the pages use that public/ does not have yet is copied from the export.
// Usage: node tools/import-nirav-1119.cjs "<path to artpark-site>"
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'data', 'nirav-pages');
const SRC = process.argv[2];
if (!SRC) { console.error('Usage: node tools/import-nirav-1119.cjs "<artpark-site folder>"'); process.exit(1); }

const PAGES = [
  ['home', '/', 'index.html'],
  ['focus-areas', '/about/focus-areas', 'about/focus-areas/index.html'],
  ['introduction', '/about/introduction', 'about/introduction/index.html'],
  ['team', '/about/team', 'about/team/index.html'],
  ['facilities', '/about/facilities', 'about/facilities/index.html'],
  ['programs', '/about/programs', 'about/programs/index.html'],
  ['artlabs', '/about/programs/artlabs', 'about/programs/artlabs/index.html'],
  ['social-impact', '/about/programs/social-impact', 'about/programs/social-impact/index.html'],
];
const unescape = (t) => t.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const ours = (t) => t.split('https://artparkin.vercel.app/').join('/').replace(/((?:href|src)="\/[^"#?]*?)\/(?=["#?])/g, '$1');

fs.mkdirSync(OUT, { recursive: true });
const assets = new Set();
for (const [slug, route, file] of PAGES) {
  const html = fs.readFileSync(path.join(SRC, file), 'utf8').replace(/\r/g, '');
  const start = html.indexOf('</header>\n</div>\n'), end = html.indexOf('\n<footer');
  if (start < 0 || end < 0) throw new Error('layout not found: ' + file);
  const body = ours(html.slice(start + '</header>\n</div>\n'.length, end));
  const style = (html.slice(0, html.indexOf('</head>')).match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
  const tail = (html.slice(html.lastIndexOf('<script src=')).match(/<\/script>\n(<script>[\s\S]*?<\/script>)/) || [])[1] || '';
  const bodyAttrs = (html.match(/<body([^>]*)>/) || [])[1].trim();
  for (const m of (body + style).matchAll(/\/assets\/[\w./-]+\.(?:webp|png|jpe?g|svg|gif)/g)) assets.add(m[0]);
  fs.writeFileSync(path.join(OUT, slug + '.html'), body);
  fs.writeFileSync(path.join(OUT, slug + '.json'), JSON.stringify({
    route,
    title: unescape(html.match(/<title>([^<]*)<\/title>/)[1]),
    description: unescape((html.match(/<meta name="description" content="([^"]*)">/) || [])[1] || ''),
    style: ours(style.replace(/^\s*body\{margin:0\}\s*/, '').trim()),
    bodyAttrs,
    tail: ours(tail),
    source: 'Manager, design canvas static export (artpark-website-export (1).zip, 2026-11-19)',
  }, null, 2) + '\n');
  console.log('imported', route, '·', (body.length / 1024).toFixed(0) + ' KB', bodyAttrs ? '· body ' + bodyAttrs : '', tail ? '· inline script' : '');
}
let copied = 0;
for (const a of assets) {
  const from = path.join(SRC, a), to = path.join(ROOT, 'public', a);
  if (fs.existsSync(to)) continue;
  if (!fs.existsSync(from)) { console.warn('missing in export and in public/:', a); continue; }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  copied++; console.log('asset added', a);
}
console.log(`assets referenced ${assets.size}, added ${copied}`);
