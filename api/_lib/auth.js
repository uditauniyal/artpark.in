// Admin login: scrypt password hashes from ADMIN_USERS, and an HMAC-signed session cookie (SESSION_SECRET).
// ADMIN_USERS is a JSON list: [{"email":"…","hash":"scrypt$<salt>$<key>"}]. Make a hash with tools/admin-hash.cjs.
const crypto = require('crypto');
const { send } = require('./http.js');

const COOKIE = 'ap_admin';
const SESSION_MS = 8 * 3600e3;

function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  return `scrypt$${salt.toString('hex')}$${crypto.scryptSync(String(pw), salt, 64).toString('hex')}`;
}
function verifyPassword(pw, stored) {
  const [alg, salt, key] = String(stored || '').split('$');
  if (alg !== 'scrypt' || !/^[0-9a-f]{32}$/.test(salt || '') || !/^[0-9a-f]{128}$/.test(key || '')) return false;
  return crypto.timingSafeEqual(crypto.scryptSync(String(pw), Buffer.from(salt, 'hex'), 64), Buffer.from(key, 'hex'));
}

const mac = (payload, secret) => crypto.createHmac('sha256', secret).update(payload).digest('base64url');
function signSession(data, secret) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  return `${payload}.${mac(payload, secret)}`;
}
function readSession(cookieHeader, secret, now = Date.now()) {
  if (!secret) return null;
  const m = String(cookieHeader || '').match(/(?:^|;\s*)ap_admin=([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)/);
  if (!m) return null;
  const expected = Buffer.from(mac(m[1], secret));
  const given = Buffer.from(m[2]);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    const { email, exp } = JSON.parse(Buffer.from(m[1], 'base64url').toString('utf8'));
    return typeof email === 'string' && exp > now ? { email } : null;
  } catch { return null; }
}

function users() {
  try { return JSON.parse(process.env.ADMIN_USERS || '[]'); } catch { return []; }
}
const isLocal = (req) => /^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host || '');
function cookie(req, value, maxAgeS) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeS}${isLocal(req) ? '' : '; Secure'}`;
}

// Returns {email} or answers the request itself (401 no session, 403 write without X-Admin) and returns null.
function requireAdmin(req, res, { write }) {
  const s = readSession(req.headers.cookie, process.env.SESSION_SECRET);
  if (!s) { send(res, 401, { error: 'Please sign in again.' }); return null; }
  if (write && req.headers['x-admin'] !== '1') { send(res, 403, { error: 'Forbidden.' }); return null; }
  return s;
}

module.exports = { COOKIE, SESSION_MS, hashPassword, verifyPassword, signSession, readSession, users, cookie, requireAdmin };
