const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { decodeUpload, safeName } = require('../api/_lib/uploads.js');
const { LocalStore, GitHubStore } = require('../api/_lib/store.js');
const { renderCheck } = require('../api/_lib/render-check.js');

const ROOT = path.join(__dirname, '..');
const b64 = (buf) => Buffer.from(buf).toString('base64');
const PNG = Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010806000000', 'hex');

test('decodeUpload accepts a PDF and a PNG', () => {
  const pdf = decodeUpload({ name: 'Tender Doc.PDF', data: b64('%PDF-1.4 hello') }, 'doc');
  assert.equal(pdf.kind, 'PDF');
  assert.equal(pdf.ext, '.pdf');
  assert.equal(decodeUpload({ name: 'p.png', data: b64(PNG) }, 'image').ext, '.png');
});

test('decodeUpload rejects a disguised file', () => {
  assert.throws(() => decodeUpload({ name: 'x.pdf', data: b64('MZ\x90\x00 not a pdf') }, 'doc'), (e) => e.status === 400 && /PDF/.test(e.message));
  assert.throws(() => decodeUpload({ name: 'x.png', data: b64('%PDF-1.4') }, 'image'), (e) => e.status === 400);
});

test('decodeUpload rejects files over 3 MB', () => {
  const big = Buffer.alloc(3 * 1024 * 1024 + 1, 0x20);
  big.write('%PDF-1.4');
  assert.throws(() => decodeUpload({ name: 'big.pdf', data: b64(big) }, 'doc'), (e) => e.status === 400 && /3 MB/.test(e.message));
});

test('safeName keeps a clean name and the extension', () => {
  assert.equal(safeName('Minutes of Bid Opening (Final).PDF'), 'minutes-of-bid-opening-final.pdf');
  assert.equal(safeName('../../etc/passwd'), 'etc-passwd');
  assert.ok(safeName('a'.repeat(200) + '.pdf').length <= 80);
});

function tempRoot() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'outreach-store-'));
  fs.cpSync(path.join(ROOT, 'src', 'data', 'outreach'), path.join(dir, 'src', 'data', 'outreach'), { recursive: true });
  return dir;
}

test('LocalStore write then read round-trips', async () => {
  const root = tempRoot();
  const store = new LocalStore(root, { build: false });
  const before = await store.read();
  before.news.unshift({ id: 'n1', title: 'T', outlet: 'Mint', date: '2026-10-29', dateLabel: '', url: 'https://mint.com/x' });
  await store.write({ files: [{ path: 'src/data/outreach/news.json', content: JSON.stringify(before.news) }, { path: 'public/docs/tenders/t/a.pdf', content: Buffer.from('%PDF') }], message: 'm' });
  const after = await store.read();
  assert.equal(after.news[0].id, 'n1');
  assert.equal(fs.readFileSync(path.join(root, 'public/docs/tenders/t/a.pdf'), 'utf8'), '%PDF');
});

test('LocalStore refuses paths outside its root', async () => {
  const store = new LocalStore(tempRoot(), { build: false });
  await assert.rejects(store.write({ files: [{ path: '../evil.txt', content: 'x' }], message: 'm' }));
});

function stubFetch(responses) {
  const calls = [];
  global.fetch = async (url, opts = {}) => {
    calls.push({ url, method: opts.method || 'GET', body: opts.body ? JSON.parse(opts.body) : null, headers: opts.headers });
    const r = responses.shift();
    return { ok: r.status < 300, status: r.status, json: async () => r.json, text: async () => (typeof r.json === 'string' ? r.json : JSON.stringify(r.json)) };
  };
  return calls;
}

test('GitHubStore.write makes one commit through the Git Data API', async () => {
  const calls = stubFetch([
    { status: 200, json: { object: { sha: 'c0' } } },
    { status: 200, json: { tree: { sha: 't0' } } },
    { status: 201, json: { sha: 'b1' } },
    { status: 201, json: { sha: 'b2' } },
    { status: 201, json: { sha: 't1' } },
    { status: 201, json: { sha: 'c1' } },
    { status: 200, json: {} },
  ]);
  const store = new GitHubStore({ token: 'tok', repo: 'o/r', branch: 'main' });
  await store.write({ files: [{ path: 'src/data/outreach/news.json', content: '[]' }, { path: 'public/docs/a.pdf', content: Buffer.from('%PDF') }], message: 'admin: add news x (m@a.in)' });
  assert.deepEqual(calls.map((c) => c.method + ' ' + c.url.replace('https://api.github.com/repos/o/r/', '')), [
    'GET git/ref/heads/main', 'GET git/commits/c0', 'POST git/blobs', 'POST git/blobs', 'POST git/trees', 'POST git/commits', 'PATCH git/refs/heads/main',
  ]);
  assert.equal(calls[0].headers.Authorization, 'Bearer tok');
  assert.equal(calls[4].body.base_tree, 't0');
  assert.deepEqual(calls[5].body.parents, ['c0']);
  assert.equal(calls[5].body.message, 'admin: add news x (m@a.in)');
  assert.deepEqual(calls[6].body, { sha: 'c1', force: false });
});

test('GitHubStore.write turns a rejected ref update into 409', async () => {
  stubFetch([
    { status: 200, json: { object: { sha: 'c0' } } }, { status: 200, json: { tree: { sha: 't0' } } },
    { status: 201, json: { sha: 'b1' } }, { status: 201, json: { sha: 't1' } }, { status: 201, json: { sha: 'c1' } },
    { status: 422, json: { message: 'Update is not a fast forward' } },
  ]);
  const store = new GitHubStore({ token: 'tok', repo: 'o/r', branch: 'main' });
  await assert.rejects(store.write({ files: [{ path: 'a.json', content: '[]' }], message: 'm' }), (e) => e.status === 409);
});

test('GitHubStore.read fetches the three JSON files raw from the branch', async () => {
  const calls = stubFetch([{ status: 200, json: [] }, { status: 200, json: [{ id: 'n' }] }, { status: 200, json: [] }]);
  const data = await new GitHubStore({ token: 'tok', repo: 'o/r', branch: 'main' }).read();
  assert.deepEqual(data.news, [{ id: 'n' }]);
  assert.match(calls[0].url, /contents\/src\/data\/outreach\/events\.json\?ref=main$/);
  assert.equal(calls[0].headers.Accept, 'application/vnd.github.raw+json');
});

test('renderCheck passes real content and fails broken content', () => {
  const data = Object.fromEntries(['events', 'news', 'tenders'].map((k) => [k, JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/outreach', k + '.json'), 'utf8'))]));
  renderCheck(data);
  data.tenders[0].docs = null;
  assert.throws(() => renderCheck(data), (e) => e.status === 422);
});
