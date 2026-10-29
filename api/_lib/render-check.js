// Before an edit is saved, the outreach pages are rendered from the candidate content in a child process
// (content.cjs reads OUTREACH_DIR). If rendering fails, the edit is refused and the live site is untouched.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const SCRIPT = `for (const p of require(${JSON.stringify(path.join(ROOT, 'src', 'pages', 'outreach.cjs'))})) p.html();`;

function renderCheck(content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'outreach-'));
  try {
    for (const [k, v] of Object.entries(content)) fs.writeFileSync(path.join(dir, k + '.json'), JSON.stringify(v));
    const r = spawnSync(process.execPath, ['-e', SCRIPT], { cwd: ROOT, env: { ...process.env, OUTREACH_DIR: dir }, encoding: 'utf8' });
    if (r.status !== 0) {
      const line = (r.stderr || '').split('\n').find((l) => /Error/.test(l)) || 'unknown error';
      throw Object.assign(new Error('This change would break the page: ' + line.trim()), { status: 422 });
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

module.exports = { renderCheck };
