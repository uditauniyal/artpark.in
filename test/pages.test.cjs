// Built-page checks for batch 2. Builds once into dist/ (BUILD_DATE pinned) and reads the HTML.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const build = (env = {}) => execFileSync(process.execPath, ['tools/build.cjs'], { cwd: ROOT, env: { ...process.env, BUILD_DATE: '2026-10-29', ...env }, stdio: 'pipe' });
const page = (route) => fs.readFileSync(path.join(ROOT, 'dist', route, 'index.html'), 'utf8');

test('events: two big upcoming cards, further upcoming events as rows', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pages-'));
  for (const f of ['news', 'tenders']) fs.copyFileSync(path.join(ROOT, 'src/data/outreach', f + '.json'), path.join(dir, f + '.json'));
  const ev = (id, start, o = {}) => ({ id, title: 'Event ' + id, start, end: '', time: '', venue: 'ARTgarage', blurb: 'b', body: [], image: '', imageAlt: '', register: '', recap: '', source: '', placement: 'auto', ...o });
  fs.writeFileSync(path.join(dir, 'events.json'), JSON.stringify([
    ev('one', '2026-11-01', { image: '/assets/site/artgarage-hall.webp' }), ev('two', '2026-11-02', { image: '/assets/site/artgarage-hall.webp' }),
    ev('three', '2026-11-03', { register: 'https://forms.gle/x' }), ev('four', '2026-11-04'), ev('old', '2025-01-01'),
  ]));
  try {
    build({ OUTREACH_DIR: dir });
    const html = page('events');
    const up = html.slice(html.indexOf('>Upcoming<'), html.indexOf('>Past events<'));
    assert.equal((up.match(/class="lift"/g) || []).length, 2);
    assert.equal((up.match(/data-upcoming-row/g) || []).length, 2);
    const rows = up.slice(up.indexOf('data-upcoming-row'));
    assert.equal((rows.match(/Register →/g) || []).length, 1);
    assert.ok(up.indexOf('Event three') < up.indexOf('Event four'));
  } finally {
    build();
  }
});
