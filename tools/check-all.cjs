// Load every route at 1440 and 390 wide: report JS errors, broken images and horizontal overflow.
const fs = require('fs');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');
(async () => {
  const routes = JSON.parse(fs.readFileSync(__dirname + '/../dist/routes.json', 'utf8')).filter((r) => r !== '/404');
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const issues = [];
  for (const w of [1440, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    let errs = [];
    p.on('pageerror', (e) => errs.push(String(e)));
    for (const r of routes) {
      errs = [];
      await p.goto('http://127.0.0.1:3010' + r, { waitUntil: 'load' });
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 1500) { window.scrollTo(0, y); await new Promise((s) => setTimeout(s, 30)); } });
      await p.waitForTimeout(300);
      const res = await p.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')),
      }));
      if (res.overflow > 1) issues.push(`${w} ${r}: overflow ${res.overflow}px`);
      if (res.broken.length) issues.push(`${w} ${r}: broken ${res.broken.join(', ')}`);
      if (errs.length) issues.push(`${w} ${r}: ${errs.join(' | ')}`);
    }
    await p.close();
  }
  console.log(`${routes.length} routes x 2 widths.`, issues.length ? '\n' + issues.join('\n') : 'No issues.');
  await b.close();
})();
