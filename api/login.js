// POST /api/login {email, password} -> 204 + session cookie, 401, or 429 after 5 failures a minute per IP.
// GET /api/login -> {email} for the current session, or 401.
const { readJson, send } = require('./_lib/http.js');
const auth = require('./_lib/auth.js');

const failures = new Map(); // ip -> [timestamps]; per instance, which is enough to slow guessing
const ipOf = (req) => String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const s = auth.readSession(req.headers.cookie, process.env.SESSION_SECRET);
    return s ? send(res, 200, { email: s.email }) : send(res, 401, { error: 'Not signed in.' });
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  if (!process.env.SESSION_SECRET) return send(res, 500, { error: 'Admin is not configured (SESSION_SECRET).' });

  const ip = ipOf(req);
  const now = Date.now();
  const recent = (failures.get(ip) || []).filter((t) => now - t < 60e3);
  if (recent.length >= 5) return send(res, 429, { error: 'Too many attempts. Wait a minute and try again.' });

  let body;
  try { body = await readJson(req); } catch (e) { return send(res, e.status || 400, { error: e.message }); }
  const email = String(body.email || '').trim().toLowerCase();
  const user = auth.users().find((u) => String(u.email).toLowerCase() === email);
  const ok = auth.verifyPassword(String(body.password || ''), user ? user.hash : auth.hashPassword('x'));
  if (!user || !ok) {
    recent.push(now);
    failures.set(ip, recent);
    await wait(+(process.env.ADMIN_LOGIN_DELAY_MS ?? 400));
    return send(res, 401, { error: 'Wrong email or password.' });
  }
  failures.delete(ip);
  const token = auth.signSession({ email: user.email, exp: now + auth.SESSION_MS }, process.env.SESSION_SECRET);
  res.setHeader('Set-Cookie', auth.cookie(req, token, auth.SESSION_MS / 1000));
  send(res, 204);
};
