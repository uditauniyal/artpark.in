const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { mockReq, mockRes } = require('./helpers.cjs');
const auth = require('../api/_lib/auth.js');

const ROOT = path.join(__dirname, '..');
const SECRET = 'test-secret-content';
process.env.SESSION_SECRET = SECRET;
process.env.ARTPARK_SKIP_BUILD = '1';
delete process.env.GITHUB_TOKEN;
const content = require('../api/content.js');

let root;
test.beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'outreach-api-'));
  fs.cpSync(path.join(ROOT, 'src', 'data', 'outreach'), path.join(root, 'src', 'data', 'outreach'), { recursive: true });
  process.env.ARTPARK_ROOT = root;
});
const read = (k) => JSON.parse(fs.readFileSync(path.join(root, 'src/data/outreach', k + '.json'), 'utf8'));
const cookie = `ap_admin=${auth.signSession({ email: 'marketing@artpark.in', exp: Date.now() + 60e3 }, SECRET)}`;
async function call(body, { headers = { cookie, 'x-admin': '1' }, method = 'POST' } = {}) {
  const res = mockRes();
  await content(mockReq({ method, headers, body }), res);
  return { status: res.statusCode, json: res.json() };
}
const b64 = (s) => Buffer.from(s).toString('base64');
const news = { title: 'ARTPARK opens a new lab', outlet: 'Mint', date: '2026-10-29', url: 'https://www.livemint.com/x' };

test('GET returns all three collections', async () => {
  const r = await call(undefined, { method: 'GET', headers: { cookie } });
  assert.equal(r.status, 200);
  assert.equal(r.json.tenders.length, 4);
});

test('without a session: 401 and nothing written', async () => {
  const r = await call({ kind: 'news', action: 'save', item: news }, { headers: { 'x-admin': '1' } });
  assert.equal(r.status, 401);
  assert.equal(read('news').length, 14);
});

test('adding news writes it with a generated id', async () => {
  const r = await call({ kind: 'news', action: 'save', item: news });
  assert.equal(r.status, 200);
  assert.deepEqual(r.json, { ok: true, id: 'artpark-opens-a-new-lab', page: '/news' });
  const saved = read('news').find((n) => n.id === 'artpark-opens-a-new-lab');
  assert.deepEqual(saved, { id: 'artpark-opens-a-new-lab', title: news.title, outlet: 'Mint', date: '2026-10-29', dateLabel: '', url: news.url });
});

test('unknown fields are dropped and an id change is ignored', async () => {
  const t = read('tenders').find((x) => x.id === 'robot-arm');
  const r = await call({ kind: 'tenders', action: 'save', item: { ...t, id: 'robot-arm', title: 'Robot arm (edited)', evil: '<script>' } });
  assert.equal(r.status, 200);
  const saved = read('tenders').find((x) => x.id === 'robot-arm');
  assert.equal(saved.title, 'Robot arm (edited)');
  assert.equal(saved.evil, undefined);
});

test('phase 4 without a result document is refused with a field error', async () => {
  const t = read('tenders').find((x) => x.id === 'robot-arm');
  const r = await call({ kind: 'tenders', action: 'save', item: { ...t, phase: 4 } });
  assert.equal(r.status, 400);
  assert.ok(r.json.fields.docs);
  assert.equal(read('tenders').find((x) => x.id === 'robot-arm').phase, 0);
});

test('phase 4 with an uploaded result PDF is saved and the file stored', async () => {
  const t = read('tenders').find((x) => x.id === 'robot-arm');
  const item = { ...t, phase: 4, docs: [...t.docs, { label: 'Output of the price bid opening', href: 'upload:0', kind: '', role: 'result' }] };
  const r = await call({ kind: 'tenders', action: 'save', item, uploads: [{ name: 'Price Bid Result.pdf', data: b64('%PDF-1.4 result') }] });
  assert.equal(r.status, 200, JSON.stringify(r.json));
  const saved = read('tenders').find((x) => x.id === 'robot-arm');
  assert.deepEqual(saved.docs[1], { label: 'Output of the price bid opening', href: '/docs/tenders/robot-arm/price-bid-result.pdf', kind: 'PDF', role: 'result' });
  assert.ok(fs.existsSync(path.join(root, 'public/docs/tenders/robot-arm/price-bid-result.pdf')));
});

test('a disguised upload is refused', async () => {
  const t = read('tenders').find((x) => x.id === 'robot-arm');
  const item = { ...t, docs: [...t.docs, { label: 'Corrigendum 1', href: 'upload:0', kind: '', role: 'other' }] };
  const r = await call({ kind: 'tenders', action: 'save', item, uploads: [{ name: 'c.pdf', data: b64('MZ not a pdf') }] });
  assert.equal(r.status, 400);
  assert.match(r.json.error, /PDF/);
});

test('an upcoming event without a photo is refused', async () => {
  const r = await call({ kind: 'events', action: 'save', item: { title: 'Demo Day', start: '2999-01-10', venue: 'ARTgarage', blurb: 'x' } });
  assert.equal(r.status, 400);
  assert.ok(r.json.fields.image);
});

test('an upcoming event with an uploaded photo is saved', async () => {
  const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex').toString('base64');
  const r = await call({ kind: 'events', action: 'save', item: { title: 'Demo Day', start: '2999-01-10', venue: 'ARTgarage', blurb: 'x', image: 'upload:0' }, uploads: [{ name: 'Demo.PNG', data: png }] });
  assert.equal(r.status, 200, JSON.stringify(r.json));
  const ev = read('events').find((e) => e.id === 'demo-day');
  assert.equal(ev.image, '/assets/events/demo-day-demo.png');
  assert.deepEqual(ev.body, []);
});

test('deleting an unknown id is 404; deleting a real one removes it', async () => {
  assert.equal((await call({ kind: 'news', action: 'delete', id: 'nope' })).status, 404);
  const id = read('news')[0].id;
  assert.equal((await call({ kind: 'news', action: 'delete', id })).status, 200);
  assert.ok(!read('news').some((n) => n.id === id));
});

test('editing an unknown id is 404', async () => {
  assert.equal((await call({ kind: 'news', action: 'save', item: { ...news, id: 'nope' } })).status, 404);
});

test('a stale tab does not undo someone else\'s edit', async () => {
  const list = read('news');
  const tabCopy = JSON.parse(JSON.stringify(list));
  list[0].title = 'Edited elsewhere';
  fs.writeFileSync(path.join(root, 'src/data/outreach/news.json'), JSON.stringify(list));
  const r = await call({ kind: 'news', action: 'save', item: { ...tabCopy[1], title: 'Edited here' } });
  assert.equal(r.status, 200);
  const now = read('news');
  assert.equal(now[0].title, 'Edited elsewhere');
  assert.equal(now[1].title, 'Edited here');
});

test('a write without X-Admin is 403', async () => {
  assert.equal((await call({ kind: 'news', action: 'save', item: news }, { headers: { cookie } })).status, 403);
});
