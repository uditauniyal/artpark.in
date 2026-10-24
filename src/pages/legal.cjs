// Privacy policy and terms of use: text verbatim from artpark.in (legal text is not edited),
// in his story-article layout with a contents column. Plus the 404 page.
const fs = require('fs');
const path = require('path');
const { esc, page, R } = require('../lib.cjs');

const load = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'research', 'artpark-in', f), 'utf8')).text;

// Numbered clause lines ("1. Legal Compliance") become headings and contents entries.
const render = (text) => {
  const toc = [];
  const body = text.split(/\n+/).slice(1).map((l) => l.trim()).filter(Boolean).map((l) => {
    if (/^\d+(\.\d+)*\.?\s+[A-Z][^.]{0,70}$/.test(l) && l.length < 80) {
      const id = 's' + toc.length;
      toc.push([id, l]);
      return `      <h2 id="${id}" style="font-size:24px;line-height:1.2;margin-top:28px;color:var(--ink);scroll-margin-top:132px">${esc(l)}</h2>`;
    }
    return `      <p>${esc(l)}</p>`;
  }).join('\n');
  return { toc, body };
};

const legal = (route, title, file) => ({
  route,
  html: () => {
    const doc = render(load(file));
    return page({
      title: `${title} — ARTPARK`, description: `ARTPARK ${title.toLowerCase()}.`,
      body: `
  <section style="padding:clamp(56px,8vw,96px) 0 0">
    <div style="max-width:1180px;margin:0 auto;padding:0 24px">
      <div class="eyebrow-rule">Legal</div>
      <h1 style="font-size:clamp(44px,6.4vw,80px);line-height:1.03;margin-top:20px">${esc(title)}.</h1>
      <p style="margin-top:24px;max-width:680px;font-size:18px;line-height:1.7;color:var(--ink-soft)">I-Hub for Robotics and Autonomous Systems Innovation Foundation (ARTPARK). Questions about this document can be sent to <a href="mailto:connect@artpark.in">connect@artpark.in</a>.</p>
    </div>
  </section>
  <div style="max-width:1180px;margin:0 auto;padding:48px 24px 112px">
    <div class="legal-layout">
      <nav class="legal-toc" aria-label="Contents"><span class="eyebrow" style="margin-bottom:6px">Contents</span>${doc.toc.map(([id, t]) => `<a href="#${id}">${esc(t)}</a>`).join('')}</nav>
      <article style="flex:1 1 560px;min-width:0;max-width:760px;display:flex;flex-direction:column;gap:16px;font-size:16px;line-height:1.75;color:var(--ink-soft)">
${doc.body}
      </article>
    </div>
  </div>`,
    });
  },
});

const notFound = {
  route: '/404',
  out: '404.html',
  html: () => page({
    title: 'Page not found — ARTPARK', description: 'This page does not exist.',
    body: `
  <section style="padding:clamp(56px,8vw,96px) 0 112px">
    <div style="max-width:1180px;margin:0 auto;padding:0 24px">
      <div class="eyebrow-rule">404</div>
      <h1 style="font-size:clamp(44px,6.4vw,80px);line-height:1.03;margin-top:20px">This page has <span class="hl">moved</span>.</h1>
      <p style="margin-top:24px;max-width:680px;font-size:18px;line-height:1.7;color:var(--ink-soft)">The ARTPARK website has a new home. The page you were looking for may have moved; these are good places to start.</p>
      <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:28px"><a class="btn btn-primary" href="${R.home}">Go to the homepage <span class="arrow">→</span></a><a class="btn btn-ghost" href="${R.portfolio}">See the portfolio</a><a class="btn btn-ghost" href="${R.contact}">Contact us</a></div>
    </div>
  </section>`,
  }),
};

module.exports = [legal('/privacy-policy', 'Privacy policy', 'privacy-policy.json'), legal('/terms-of-use', 'Terms of use', 'terms-of-use.json'), notFound];
