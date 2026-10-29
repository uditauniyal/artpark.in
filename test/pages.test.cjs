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

// ---- batch 2, task 2 ----
test('titles are two-tone', () => {
  build();
  assert.match(page('contact'), /<h1[^>]*>Contact <span class="tt">us\.<\/span><\/h1>/);
  assert.match(page('about/team'), /<h1[^>]*>[^<]*<span class="tt">/);
});

const ROLE_LABELS = ['What research would you like to take further?', 'What does your startup need from us?', 'What would you like to build with us?', 'How would you like to partner with us?', 'What is your story about?'];
test('contact page: Researcher copy by default, every role in the switch data', () => {
  const html = page('contact');
  assert.match(html, /data-role-intro[^>]*>Working on research that could leave the lab\? Tell us about it, and where you want to take it\. Messages go to the ARTPARK team at connect@artpark\.in\./);
  assert.match(html, /data-role-label[^>]*>What research would you like to take further\?</);
  assert.match(html, /placeholder="The problem, where the work stands today, and what would move it forward\."/);
  assert.match(html, /window\.AP_ROLE_COPY=/);
  for (const l of ROLE_LABELS) assert.ok(html.includes(l), l);
});

test('contact page: address text a little smaller', () => {
  const html = page('contact');
  assert.match(html, /font-family:var\(--font-display\);font-size:16px">Indian Institute of Science</);
  assert.match(html, /<p style="font-size:14px;line-height:1\.6;color:var\(--ink-soft\)">Ground Floor/);
});

test('partnerships: floating logos lead with DST, Karnataka, IISc, Bosch, NVIDIA', () => {
  const stage = page('partnerships').match(/<div class="float-stage"[\s\S]*?<\/div><\/div>/)[0];
  const srcs = [...stage.matchAll(/<img src="([^"]+)"/g)].map((m) => m[1].split('/').pop().replace('.webp', ''));
  assert.deepEqual(srcs.slice(0, 5), ['department-of-science-technology', 'government-of-karnataka', 'indian-institute-of-science', 'bosch', 'nvidia']);
});

test('contact page: choosing a role changes the copy (browser)', { skip: !process.env.ARTPARK_PLAYWRIGHT && 'ARTPARK_PLAYWRIGHT not set' }, async () => {
  const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT);
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const p = await b.newPage();
    await p.goto('http://127.0.0.1:3010/contact');
    await p.click('[data-role="Startup"]');
    assert.equal(await p.textContent('[data-role-label]'), 'What does your startup need from us?');
    assert.match(await p.getAttribute('textarea[name=message]', 'placeholder'), /^Your product, its stage/);
    assert.match(await p.textContent('[data-role-intro]'), /^Building a deep-tech startup\?/);
  } finally { await b.close(); }
});

test('news: floating chips show the outlets\' logos', () => {
  build();
  const stage = page('news').match(/<div class="float-stage"[\s\S]*?<\/div><\/div>/)[0];
  assert.deepEqual([...stage.matchAll(/<img src="\/assets\/outlets\/([^".]+)\.webp"/g)].map((m) => m[1]),
    ['economic-times', 'forbes-india', 'mint', 'deccan-herald', 'moneycontrol', 'hindustan-times']);
  for (const f of ['economic-times', 'forbes-india', 'mint', 'deccan-herald', 'moneycontrol', 'hindustan-times']) assert.ok(fs.existsSync(path.join(ROOT, 'public/assets/outlets', f + '.webp')), f);
});
