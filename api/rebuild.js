// Nightly Vercel cron (vercel.json): triggers a fresh deploy so events whose date has passed move to "Past events".
// Vercel sends Authorization: Bearer $CRON_SECRET; DEPLOY_HOOK_URL is the project's Deploy Hook.
const crypto = require('crypto');
const { send } = require('./_lib/http.js');

module.exports = async (req, res) => {
  const want = Buffer.from(`Bearer ${process.env.CRON_SECRET || ''}`);
  const got = Buffer.from(String(req.headers.authorization || ''));
  if (!process.env.CRON_SECRET || want.length !== got.length || !crypto.timingSafeEqual(want, got)) return send(res, 401, { error: 'Unauthorized.' });
  if (!process.env.DEPLOY_HOOK_URL) return send(res, 500, { error: 'DEPLOY_HOOK_URL is not set.' });
  const r = await fetch(process.env.DEPLOY_HOOK_URL, { method: 'POST' });
  send(res, r.ok ? 204 : 502, r.ok ? undefined : { error: `Deploy hook returned ${r.status}.` });
};
