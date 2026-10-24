// Static check of dist/: every internal href/src resolves to a file, no "#" dead links,
// no placeholder copy, no forbidden emails. Usage: node tools/check-links.cjs
const fs = require('fs');
const path = require('path');
const DIST = path.join(__dirname, '..', 'dist');

const pages = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.html')) pages.push(p); } })(DIST);

const exists = (url) => {
  const clean = decodeURIComponent(url.split('#')[0].split('?')[0]);
  if (!clean || clean === '/') return fs.existsSync(path.join(DIST, 'index.html'));
  const p = path.join(DIST, clean);
  return fs.existsSync(p) && (fs.statSync(p).isFile() || fs.existsSync(path.join(p, 'index.html')));
};

const problems = [];
const external = new Set();
for (const file of pages) {
  const rel = path.relative(DIST, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (u === '#') problems.push(`${rel}: dead "#" link`);
    else if (u.startsWith('/')) { if (!exists(u)) problems.push(`${rel}: missing ${u}`); }
    else if (/^https?:/.test(u)) external.add(u);
  }
  for (const m of html.matchAll(/url\((\/[^)]+)\)/g)) if (!exists(m[1])) problems.push(`${rel}: missing bg ${m[1]}`);
  for (const bad of ['startup@artpark.in', 'office@artpark.in', 'social@artpark.in', 'Name Surname', 'Placeholder', 'Lorem', 'undefined', 'NaN']) {
    if (rel.includes('privacy') || rel.includes('terms')) continue; // legal text kept verbatim
    if (html.includes(bad)) problems.push(`${rel}: contains "${bad}"`);
  }
}
console.log(`${pages.length} pages checked, ${external.size} distinct external links.`);
console.log(problems.length ? problems.join('\n') : 'No internal problems found.');
fs.writeFileSync(path.join(__dirname, '..', 'qa', 'external-links.txt'), [...external].sort().join('\n'));
process.exitCode = problems.length ? 1 : 0;
