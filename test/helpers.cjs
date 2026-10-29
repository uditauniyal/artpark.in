// Minimal req/res stand-ins for calling api/*.js handlers directly.
const { Readable } = require('stream');

function mockReq({ method = 'GET', url = '/', headers = {}, body } = {}) {
  const req = Readable.from(body === undefined ? [] : [Buffer.from(typeof body === 'string' ? body : JSON.stringify(body))]);
  Object.assign(req, { method, url, headers: { host: '127.0.0.1:3010', ...headers }, socket: { remoteAddress: headers['x-test-ip'] || '127.0.0.1' } });
  return req;
}

function mockRes() {
  const res = { statusCode: 200, headers: {}, body: '' };
  res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
  res.getHeader = (k) => res.headers[k.toLowerCase()];
  res.end = (b) => { res.body = b ? String(b) : ''; res.ended = true; };
  res.json = () => (res.body ? JSON.parse(res.body) : null);
  return res;
}

module.exports = { mockReq, mockRes };
