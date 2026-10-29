const test = require('node:test');
const assert = require('node:assert/strict');
const { mockReq, mockRes } = require('./helpers.cjs');
const auth = require('../api/_lib/auth.js');

const SECRET = 'test-secret-0123456789';
process.env.SESSION_SECRET = SECRET;
process.env.ADMIN_USERS = JSON.stringify([{ email: 'marketing@artpark.in', hash: auth.hashPassword('correct horse') }]);
process.env.ADMIN_LOGIN_DELAY_MS = '0';

test('password hash round-trips and rejects a wrong password', () => {
  const h = auth.hashPassword('s3cret');
  assert.match(h, /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  assert.equal(auth.verifyPassword('s3cret', h), true);
  assert.equal(auth.verifyPassword('S3cret', h), false);
  assert.equal(auth.verifyPassword('s3cret', 'garbage'), false);
});

test('session cookie: valid, tampered and expired', () => {
  const tok = auth.signSession({ email: 'a@b.c', exp: Date.now() + 60e3 }, SECRET);
  assert.deepEqual(auth.readSession(`ap_admin=${tok}`, SECRET), { email: 'a@b.c' });
  const [p, sig] = tok.split('.');
  const forged = Buffer.from(JSON.stringify({ email: 'evil@x.y', exp: Date.now() + 60e3 })).toString('base64url');
  assert.equal(auth.readSession(`ap_admin=${forged}.${sig}`, SECRET), null);
  assert.equal(auth.readSession(`ap_admin=${p}.${sig}`, 'other-secret'), null);
  const old = auth.signSession({ email: 'a@b.c', exp: Date.now() - 1 }, SECRET);
  assert.equal(auth.readSession(`x=1; ap_admin=${old}`, SECRET), null);
});

const login = require('../api/login.js');

test('login: correct password sets a strict httpOnly cookie', async () => {
  const res = mockRes();
  await login(mockReq({ method: 'POST', headers: { 'content-type': 'application/json', 'x-test-ip': '10.0.0.1' }, body: { email: 'Marketing@artpark.in', password: 'correct horse' } }), res);
  assert.equal(res.statusCode, 204);
  const c = res.headers['set-cookie'];
  assert.match(c, /^ap_admin=/);
  assert.match(c, /HttpOnly/);
  assert.match(c, /SameSite=Strict/);
  assert.doesNotMatch(c, /Secure/); // 127.0.0.1
});

test('login: wrong password is 401 with one generic message', async () => {
  const res = mockRes();
  await login(mockReq({ method: 'POST', headers: { 'x-test-ip': '10.0.0.2' }, body: { email: 'marketing@artpark.in', password: 'nope' } }), res);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.json(), { error: 'Wrong email or password.' });
});

test('login: sixth failure in a minute from one IP is 429', async () => {
  let res;
  for (let i = 0; i < 6; i++) {
    res = mockRes();
    await login(mockReq({ method: 'POST', headers: { 'x-test-ip': '10.0.0.3' }, body: { email: 'x@y.z', password: 'nope' } }), res);
  }
  assert.equal(res.statusCode, 429);
});

test('login: Secure cookie on a real host', async () => {
  const res = mockRes();
  await login(mockReq({ method: 'POST', headers: { host: 'artpark.in', 'x-test-ip': '10.0.0.4' }, body: { email: 'marketing@artpark.in', password: 'correct horse' } }), res);
  assert.match(res.headers['set-cookie'], /; Secure/);
});

test('GET /api/login reports the session, or 401', async () => {
  const tok = auth.signSession({ email: 'marketing@artpark.in', exp: Date.now() + 60e3 }, SECRET);
  let res = mockRes();
  await login(mockReq({ headers: { cookie: `ap_admin=${tok}` } }), res);
  assert.deepEqual(res.json(), { email: 'marketing@artpark.in' });
  res = mockRes();
  await login(mockReq({}), res);
  assert.equal(res.statusCode, 401);
});

test('requireAdmin: 401 without session, 403 on a write without X-Admin', () => {
  let res = mockRes();
  assert.equal(auth.requireAdmin(mockReq({}), res, { write: false }), null);
  assert.equal(res.statusCode, 401);
  const tok = auth.signSession({ email: 'm@a.in', exp: Date.now() + 60e3 }, SECRET);
  res = mockRes();
  assert.equal(auth.requireAdmin(mockReq({ method: 'POST', headers: { cookie: `ap_admin=${tok}` } }), res, { write: true }), null);
  assert.equal(res.statusCode, 403);
  res = mockRes();
  assert.deepEqual(auth.requireAdmin(mockReq({ method: 'POST', headers: { cookie: `ap_admin=${tok}`, 'x-admin': '1' } }), res, { write: true }), { email: 'm@a.in' });
});

test('logout clears the cookie', async () => {
  const res = mockRes();
  await require('../api/logout.js')(mockReq({ method: 'POST', headers: { 'x-admin': '1' } }), res);
  assert.equal(res.statusCode, 204);
  assert.match(res.headers['set-cookie'], /ap_admin=;.*Max-Age=0/);
});
