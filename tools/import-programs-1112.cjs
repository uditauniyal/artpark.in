// Imports the TIR, VIP and RDI program pages the manager made in Claude Design (2026-11-12) verbatim.
// His export is the interactive copy of the site (tools/export-interactive.cjs) with his edits inside, so each page
// is a full built page: the body between the site header and footer is kept as is, in src/data/programs-pages/.
// Usage: node tools/import-programs-1112.cjs "<path to ARTPARK website v2.html>"
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'data', 'programs-pages');
const src = process.argv[2];
if (!src) { console.error('Usage: node tools/import-programs-1112.cjs "<ARTPARK website v2.html>"'); process.exit(1); }

const s = fs.readFileSync(src, 'utf8');
const i = s.indexOf('window.__SITE = ') + 16, j = s.indexOf(';</script>', i);
const D = JSON.parse(s.slice(i, j).split('<\\/script').join('</script').split('<\\!--').join('<!--'));
const unescape = (t) => t.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

fs.mkdirSync(OUT, { recursive: true });
for (const slug of ['tir', 'vip', 'rdi']) {
  const route = '/about/programs/' + slug;
  const html = zlib.gunzipSync(Buffer.from(D.pages[route], 'base64')).toString('utf8');
  const start = html.indexOf('</header>\n</div>\n'), end = html.indexOf('\n<footer');
  if (start < 0 || end < 0) throw new Error('page layout not found: ' + route);
  fs.writeFileSync(path.join(OUT, slug + '.html'), html.slice(start + '</header>\n</div>\n'.length, end));
  const meta = {
    route,
    title: unescape(html.match(/<title>([^<]*)<\/title>/)[1]),
    description: unescape(html.match(/<meta name="description" content="([^"]*)">/)[1]),
    source: 'Manager, Claude Design export "ARTPARK website v2.html" (2026-11-12)',
  };
  fs.writeFileSync(path.join(OUT, slug + '.json'), JSON.stringify(meta, null, 2) + '\n');
  console.log('imported', route, '·', meta.title);
}

// The RDI logo he added.
const logo = D.assets['/assets/brand/rdi-logo.png'];
fs.writeFileSync(path.join(ROOT, 'public', 'assets', 'brand', 'rdi-logo.png'), Buffer.from(logo[1], 'base64'));
console.log('wrote public/assets/brand/rdi-logo.png', logo[0]);
