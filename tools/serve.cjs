// Local static server with clean URLs (/contact -> /contact/index.html), plus the admin API:
// /api/<name> runs api/<name>.js, the same handler Vercel runs. Settings come from .env.local (gitignored).
// Usage: node tools/serve.cjs [root=dist] [port=3010]
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..', 'dist'));
const port = +(process.argv[3] || 3010);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.woff2': 'font/woff2',
};

// KEY=VALUE lines; a value may be wrapped in single or double quotes.
const envFile = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^'(.*)'$|^"(.*)"$/, '$1$2');
  }
}
const API = path.join(__dirname, '..', 'api');

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  const api = rel.match(/^\/api\/([a-z-]+)$/);
  if (api && fs.existsSync(path.join(API, api[1] + '.js'))) {
    return Promise.resolve(require(path.join(API, api[1] + '.js'))(req, res)).catch((e) => {
      console.error(e);
      if (!res.headersSent) { res.writeHead(500); res.end(); }
    });
  }
  if (/^\/(admin|api)(\/|$)/.test(rel)) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  let file = path.join(root, rel);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  else if (!path.extname(file) && fs.existsSync(file + '.html')) file += '.html';
  fs.readFile(file, (err, data) => {
    if (err) {
      const nf = path.join(root, '404.html');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(port, '127.0.0.1', () => console.log(`Serving ${root} at http://127.0.0.1:${port}/`));
