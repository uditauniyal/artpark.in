// Imports the pages the manager rebuilt in his design canvas on 2026-11-16 (static export, artpark-site/) verbatim:
// Home, Approach, the new Focus Areas and the new Work-in-progress placeholder. Each page's body (between the site
// header and footer), its head <style>, its <body> attributes and any trailing inline script go to
// src/data/nirav-pages/; src/pages/nirav-pages.cjs serves them inside our header and footer.
// The export's own side effects are undone so links stay ours: trailing slashes on internal links are dropped and
// https://artparkin.vercel.app/ prefixes become root-relative. Painted images the pages use are copied to public/assets/art/.
// Usage: node tools/import-nirav-1116.cjs "<path to artpark-site>"
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'data', 'nirav-pages');
const SRC = process.argv[2];
if (!SRC) { console.error('Usage: node tools/import-nirav-1116.cjs "<artpark-site folder>"'); process.exit(1); }

const PAGES = [
  ['home', '/', 'index.html'],
  ['approach', '/about/approach', 'about/approach/index.html'],
  ['focus-areas', '/about/focus-areas', 'about/focus-areas/index.html'],
  ['work-in-progress', '/work-in-progress', 'work-in-progress/index.html'],
];
const unescape = (t) => t.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const ours = (t) => t.split('https://artparkin.vercel.app/').join('/').replace(/((?:href|src)="\/[^"#?]*?)\/(?=["#?])/g, '$1');

fs.mkdirSync(OUT, { recursive: true });
const art = new Set();
for (const [slug, route, file] of PAGES) {
  const html = fs.readFileSync(path.join(SRC, file), 'utf8').replace(/\r/g, '');
  const start = html.indexOf('</header>\n</div>\n'), end = html.indexOf('\n<footer');
  if (start < 0 || end < 0) throw new Error('layout not found: ' + file);
  const body = ours(html.slice(start + '</header>\n</div>\n'.length, end));
  const style = (html.slice(0, html.indexOf('</head>')).match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
  const tail = (html.slice(html.lastIndexOf('<script src=')).match(/<\/script>\n(<script>[\s\S]*?<\/script>)/) || [])[1] || '';
  const bodyAttrs = (html.match(/<body([^>]*)>/) || [])[1].trim();
  for (const m of (body + style).matchAll(/\/assets\/art\/[\w.-]+/g)) art.add(m[0]);
  fs.writeFileSync(path.join(OUT, slug + '.html'), body);
  fs.writeFileSync(path.join(OUT, slug + '.json'), JSON.stringify({
    route,
    title: unescape(html.match(/<title>([^<]*)<\/title>/)[1]),
    description: unescape((html.match(/<meta name="description" content="([^"]*)">/) || [])[1] || ''),
    style: ours(style.replace(/^\s*body\{margin:0\}\s*/, '').trim()),
    bodyAttrs,
    tail: ours(tail),
    source: 'Manager, design canvas static export (artpark-website-export.zip, 2026-11-16)',
  }, null, 2) + '\n');
  console.log('imported', route, '·', (body.length / 1024).toFixed(0) + ' KB', bodyAttrs ? '· body ' + bodyAttrs : '', tail ? '· inline script' : '');
}
for (const a of art) {
  const from = path.join(SRC, a), to = path.join(ROOT, 'public', a);
  if (!fs.existsSync(from)) { console.warn('missing in export', a); continue; }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}
console.log('art copied', art.size);
