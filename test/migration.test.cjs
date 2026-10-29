// The outreach pages built from src/data/outreach/*.json match the pre-migration snapshot in qa/before/
// (taken with `BUILD_DATE=2026-10-29 node tools/build.cjs` on commit 891baa0), apart from the two
// approved changes: the gpu-edge-cloud track and the Events stat label.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BEFORE = path.join(ROOT, 'qa', 'before');
const files = (d) => fs.readdirSync(d, { recursive: true }).filter((f) => f.endsWith('.html'));

test('outreach pages unchanged by the migration, except the approved differences', { skip: !fs.existsSync(BEFORE) && 'no qa/before snapshot' }, () => {
  execFileSync(process.execPath, ['tools/build.cjs'], { cwd: ROOT, env: { ...process.env, BUILD_DATE: '2026-10-29' }, stdio: 'pipe' });
  const allow = (html) => html
    .replace(/Open Days coming up at ARTgarage|upcoming events/, 'STAT')
    .replace(/(The supply of GPU Edge Cloud System[\s\S]*?<ol class="t-track">)[\s\S]*?(<\/ol>)/, '$1TRACK$2');
  for (const f of files(BEFORE)) {
    const after = path.join(ROOT, 'dist', f);
    assert.ok(fs.existsSync(after), `missing ${f}`);
    assert.equal(allow(fs.readFileSync(after, 'utf8')), allow(fs.readFileSync(path.join(BEFORE, f), 'utf8')), f);
  }
  const track = fs.readFileSync(path.join(ROOT, 'dist', 'tenders', 'index.html'), 'utf8').match(/The supply of GPU Edge Cloud System[\s\S]*?<ol class="t-track">([\s\S]*?)<\/ol>/)[1];
  const lis = track.match(/<li class="[^"]*"/g);
  assert.equal(lis.length, 5);
  assert.ok(lis.every((l) => l.includes('is-done')));
});

test('with no upcoming events the Events page shows the empty message', () => {
  execFileSync(process.execPath, ['tools/build.cjs'], { cwd: ROOT, env: { ...process.env, BUILD_DATE: '2026-12-01' }, stdio: 'pipe' });
  const html = fs.readFileSync(path.join(ROOT, 'dist', 'events', 'index.html'), 'utf8');
  assert.match(html, /No upcoming events right now\. Follow ARTPARK on <a href="https:\/\/www\.linkedin\.com\/company\/artpark-in\/">LinkedIn<\/a> for the next one\./);
  assert.ok(!html.includes('undefined'));
  const past = html.slice(html.indexOf('Past events'));
  assert.ok(past.includes('ARTPARK Open Day — Community Edition'));
  execFileSync(process.execPath, ['tools/build.cjs'], { cwd: ROOT, stdio: 'pipe' });
});
