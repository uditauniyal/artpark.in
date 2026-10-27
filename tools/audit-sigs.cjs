// Second audit pass: style "signatures" (tag-agnostic: family, size, weight, colour, letter-spacing, case) used on our page
// that never occur on his page. Catches restyled real content that the text match cannot pair.
const fs = require('fs');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');
const PAGES = JSON.parse(fs.readFileSync('qa/audit/pages.json', 'utf8'));
const grab = async (page, url, wait) => {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 }); await page.waitForTimeout(wait);
  return page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('.ap-curtain,.float-stage,.tv-switch,.peek,script,style,noscript,iframe,svg,header,footer')) continue;
      const t = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join(' ').replace(/\s+/g, ' ').trim();
      if (t.length < 2) continue;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
      const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      out.push({ sig: [cs.fontFamily.split(',')[0].replace(/["']/g, ''), cs.fontSize, cs.fontWeight, cs.color, cs.letterSpacing, cs.textTransform].join(' | '), text: t.slice(0, 70) });
    }
    return out;
  });
};
(async () => {
  const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PAGES);
  const b = await chromium.launch({ channel: 'chrome' });
  const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const rep = {};
  for (const k of keys) {
    const [his, ours] = PAGES[k];
    const H = await grab(page, 'http://localhost:4400/' + encodeURIComponent(his), 4500);
    const O = await grab(page, 'http://localhost:3010' + ours, 1800);
    const hs = new Set(H.map((x) => x.sig));
    const extra = {};
    for (const o of O) if (!hs.has(o.sig)) (extra[o.sig] = extra[o.sig] || []).push(o.text);
    rep[k] = Object.entries(extra).map(([sig, ex]) => ({ sig, n: ex.length, ex: ex.slice(0, 3) }));
    console.log(`${k}: ${rep[k].length} style signatures not in his design`);
  }
  fs.writeFileSync('qa/audit/sigs.json', JSON.stringify(rep, null, 1));
  await b.close();
})();
