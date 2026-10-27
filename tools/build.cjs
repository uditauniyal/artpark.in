// Build: copies public/ into dist/, renders every page in src/pages to dist/<route>/index.html,
// then rewrites every artpark.in link to its local page (src/data/urlmap.cjs). Fails on unmapped links.
// Usage: node tools/build.cjs
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PAGES = path.join(ROOT, 'src', 'pages');

fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });

const pages = [];
for (const file of fs.readdirSync(PAGES).filter((f) => f.endsWith('.cjs')).sort()) {
  const mod = require(path.join(PAGES, file));
  for (const p of (Array.isArray(mod) ? mod : [mod])) pages.push(p);
}
const routes = new Set(pages.map((p) => p.route));
const mapArtpark = require(path.join(ROOT, 'src', 'data', 'urlmap.cjs'));
const twoTone = require(path.join(ROOT, 'src', 'data', 'titles.cjs'));

const unmapped = new Set();
for (const p of pages) {
  let html = twoTone(p.html());
  html = html.replace(/(href|src)="https?:\/\/(?:www\.)?artpark\.in(\/[^"#?]*)?([^"]*)"/g, (m, attr, pth = '/', rest) => {
    const to = mapArtpark(pth || '/', routes);
    if (!to) { unmapped.add(`${p.route}: ${pth}${rest}`); return m; }
    const hash = rest && rest.startsWith('#') ? rest : '';
    return `${attr}="${to}${to.includes('#') ? '' : hash}"`;
  });
  const out = p.out ? path.join(DIST, p.out) : p.route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, p.route, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}
fs.writeFileSync(path.join(DIST, 'routes.json'), JSON.stringify([...routes].sort(), null, 2));
if (unmapped.size) { console.error('Unmapped artpark.in links:\n' + [...unmapped].join('\n')); process.exitCode = 1; }
console.log(`Built ${routes.size} pages.`);
