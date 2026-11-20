// Imports the pages the manager changed in his design canvas on 2026-11-20 (static export, artpark-site/) verbatim,
// the same way as tools/import-nirav-1119.cjs: Approach (teams-and-flywheel block moved up, model stacks on phones),
// TIR, VIP and RDI (painted picture sections) and Social Impact (documents and links gathered at the bottom).
// TIR, VIP and RDI move here from src/pages/program-pages.cjs: his export already carries our fixes (Apply buttons to
// /apply, no apply.artpark.info links, the RDI form opening the email app to connect@artpark.in). His RDI page loads
// that form script from /js/inline/; it is put back inline (as `tail`) so the page stays self-contained.
// Usage: node tools/import-nirav-1120.cjs "<path to artpark-site>"
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'data', 'nirav-pages');
const SRC = process.argv[2];
if (!SRC) { console.error('Usage: node tools/import-nirav-1120.cjs "<artpark-site folder>"'); process.exit(1); }

const PAGES = [
  ['approach', '/about/approach', 'about/approach/index.html'],
  ['tir', '/about/programs/tir', 'about/programs/tir/index.html'],
  ['vip', '/about/programs/vip', 'about/programs/vip/index.html'],
  ['rdi', '/about/programs/rdi', 'about/programs/rdi/index.html'],
  ['social-impact', '/about/programs/social-impact', 'about/programs/social-impact/index.html'],
];
const unescape = (t) => t.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const ours = (t) => t.split('https://artparkin.vercel.app/').join('/').replace(/((?:href|src)="\/[^"#?]*?)\/(?=["#?])/g, '$1');

for (const [slug, route, file] of PAGES) {
  const html = fs.readFileSync(path.join(SRC, file), 'utf8').replace(/\r/g, '');
  const start = html.indexOf('</header>\n</div>\n'), end = html.indexOf('\n<footer');
  if (start < 0 || end < 0) throw new Error('layout not found: ' + file);
  const body = ours(html.slice(start + '</header>\n</div>\n'.length, end));
  const style = (html.slice(0, html.indexOf('</head>')).match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
  let tail = (html.slice(html.lastIndexOf('<script src=')).match(/<\/script>\n(<script>[\s\S]*?<\/script>)/) || [])[1] || '';
  for (const m of html.matchAll(/<script src="(\/js\/inline\/[\w.-]+\.js)"><\/script>/g)) tail += `<script>${fs.readFileSync(path.join(SRC, m[1]), 'utf8').trim()}</script>`;
  const bodyAttrs = (html.match(/<body([^>]*)>/) || [])[1].trim();
  for (const m of (body + style).matchAll(/\/assets\/[\w./-]+\.(?:webp|png|jpe?g|svg|gif)/g)) {
    if (!fs.existsSync(path.join(ROOT, 'public', m[0]))) throw new Error('asset not in public/: ' + m[0] + ' (' + file + ')');
  }
  fs.writeFileSync(path.join(OUT, slug + '.html'), body);
  fs.writeFileSync(path.join(OUT, slug + '.json'), JSON.stringify({
    route,
    title: unescape(html.match(/<title>([^<]*)<\/title>/)[1]),
    description: unescape((html.match(/<meta name="description" content="([^"]*)">/) || [])[1] || ''),
    style: ours(style.replace(/^\s*body\{margin:0\}\s*/, '').trim()),
    bodyAttrs,
    tail: ours(tail),
    source: 'Manager, design canvas static export (artpark-website-export (2).zip, 2026-11-20)',
  }, null, 2) + '\n');
  console.log('imported', route, '·', (body.length / 1024).toFixed(0) + ' KB', tail ? '· inline script' : '');
}
