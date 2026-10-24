// Render a page (e.g. the manager's original via its runtime) and save the resulting DOM.
// Usage: node tools/dump-dom.cjs <url> <outFile> [width]
const fs = require('fs');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');

(async () => {
  const [url, out, w = '1440'] = process.argv.slice(2);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: +w, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
  const html = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync(out, html);
  console.log('saved', out, html.length, 'chars');
  await browser.close();
})();
