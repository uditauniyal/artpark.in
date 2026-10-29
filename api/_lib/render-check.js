// Before an edit is saved, the outreach pages are rendered from the candidate content in a child process
// (content.cjs reads OUTREACH_DIR). If rendering fails, the edit is refused and the live site is untouched.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
// Renders every outreach page and maps its artpark.in links the way tools/build.cjs does; an unmappable link
// would fail the build, so it fails here. Event routes count as known (a new event adds its own page).
const SCRIPT = `
const pages = require(${JSON.stringify(path.join(ROOT, 'src', 'pages', 'outreach.cjs'))});
const { rewriteArtparkLinks } = require(${JSON.stringify(path.join(ROOT, 'src', 'rewrite-links.cjs'))});
const routes = new Set(pages.map((p) => p.route));
const unmapped = new Set();
for (const p of pages) rewriteArtparkLinks(p.html(), routes, unmapped);
if (unmapped.size) { console.error('UNMAPPED ' + [...unmapped][0]); process.exit(3); }`;

function renderCheck(content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'outreach-'));
  try {
    for (const [k, v] of Object.entries(content)) fs.writeFileSync(path.join(dir, k + '.json'), JSON.stringify(v));
    const r = spawnSync(process.execPath, ['-e', SCRIPT], { cwd: ROOT, env: { ...process.env, OUTREACH_DIR: dir }, encoding: 'utf8', timeout: 20000 });
    if (r.status === 3) {
      const link = (r.stderr.match(/UNMAPPED (\S+)/) || [])[1];
      throw Object.assign(new Error(`This artpark.in link can't be used on the new site: artpark.in${link}. Upload the file instead, or use a link from another site.`), { status: 422 });
    }
    if (r.status !== 0) {
      const line = (r.stderr || '').split('\n').find((l) => /Error/.test(l)) || 'unknown error';
      throw Object.assign(new Error('This change would break the page: ' + line.trim()), { status: 422 });
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

module.exports = { renderCheck };
