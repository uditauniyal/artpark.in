// Third audit pass: background colours of every section/block wider than half the page, in page order, his vs ours.
const fs = require('fs');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');
const PAGES = JSON.parse(fs.readFileSync('qa/audit/pages.json', 'utf8'));
const grab = async (page, url, wait) => {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 }); await page.waitForTimeout(wait);
  return page.evaluate(() => {
    const seq = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('.ap-curtain,.float-stage,.tv-switch,.peek,header,footer,iframe')) continue;
      const cs = getComputedStyle(el); const bg = cs.backgroundColor;
      if (!bg || bg === 'rgba(0, 0, 0, 0)') continue;
      const r = el.getBoundingClientRect(); if (r.width < innerWidth * 0.5 || r.height < 40) continue;
      if (seq[seq.length - 1] !== bg) seq.push(bg);
    }
    return seq;
  });
};
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  for (const k of process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PAGES)) {
    const [his, ours] = PAGES[k];
    const H = await grab(page, 'http://localhost:4400/' + encodeURIComponent(his), 4500);
    const O = await grab(page, 'http://localhost:3010' + ours, 1500);
    const hs = new Set(H), os = new Set(O);
    const extra = O.filter((c) => !hs.has(c)), lost = H.filter((c) => !os.has(c));
    console.log(`${k}: his [${H.join(' > ')}]\n${' '.repeat(k.length)}  ours [${O.join(' > ')}]${extra.length || lost.length ? `\n  !! extra ${[...new Set(extra)].join(', ') || '-'} | missing ${[...new Set(lost)].join(', ') || '-'}` : ''}`);
  }
  await b.close();
})();
