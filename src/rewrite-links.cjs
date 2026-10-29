// Rewrites every artpark.in href/src to its page on the new site (src/data/urlmap.cjs).
// Paths it cannot map are added to `unmapped` and left as they are. Used by tools/build.cjs, and by the
// admin's render check so an edit with an unmappable link is refused before it can fail the build.
const mapArtpark = require('./data/urlmap.cjs');

function rewriteArtparkLinks(html, routes, unmapped, label = '') {
  return html.replace(/(href|src)="https?:\/\/(?:www\.)?artpark\.in(\/[^"#?]*)?([^"]*)"/g, (m, attr, pth = '/', rest) => {
    let to = null;
    try { to = mapArtpark(pth || '/', routes); } catch { /* malformed %-escape */ }
    if (!to) { unmapped.add(`${label}${pth}${rest}`); return m; }
    const hash = rest && rest.startsWith('#') ? rest : '';
    return `${attr}="${to}${to.includes('#') ? '' : hash}"`;
  });
}

module.exports = { rewriteArtparkLinks };
