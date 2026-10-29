const test = require('node:test');
const assert = require('node:assert/strict');
const { mockReq, mockRes } = require('./helpers.cjs');

process.env.CRON_SECRET = 'cron-secret';
process.env.DEPLOY_HOOK_URL = 'https://api.vercel.com/v1/integrations/deploy/prj_x/abc';
const rebuild = require('../api/rebuild.js');

test('rebuild without the cron secret is 401 and calls nothing', async () => {
  let called = false;
  global.fetch = async () => { called = true; return { ok: true, status: 201 }; };
  const res = mockRes();
  await rebuild(mockReq({ headers: { authorization: 'Bearer wrong' } }), res);
  assert.equal(res.statusCode, 401);
  assert.equal(called, false);
});

test('rebuild with the cron secret posts to the deploy hook', async () => {
  const calls = [];
  global.fetch = async (url, opts) => { calls.push([url, opts.method]); return { ok: true, status: 201 }; };
  const res = mockRes();
  await rebuild(mockReq({ headers: { authorization: 'Bearer cron-secret' } }), res);
  assert.equal(res.statusCode, 204);
  assert.deepEqual(calls, [[process.env.DEPLOY_HOOK_URL, 'POST']]);
});
