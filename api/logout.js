// POST /api/logout -> 204, clears the session cookie.
const { send } = require('./_lib/http.js');
const auth = require('./_lib/auth.js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  res.setHeader('Set-Cookie', auth.cookie(req, '', 0));
  send(res, 204);
};
