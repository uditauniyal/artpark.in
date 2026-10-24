// Read a public web page like a visitor: rendered text, links and images.
// Usage: node tools/read-page.cjs <url> [outJson]
const fs = require('fs');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');

(async () => {
  const [url, out] = process.argv.slice(2);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2000);
  for (let y = 0; y < 20000; y += 800) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(80); }
  const data = await page.evaluate(() => ({
    title: document.title,
    text: document.body.innerText,
    links: [...document.querySelectorAll('a[href]')].map((a) => [a.innerText.trim().slice(0, 80), a.href]).filter(([t]) => t),
    images: [...document.querySelectorAll('img')].map((i) => [i.currentSrc || i.src, i.alt, i.naturalWidth, i.naturalHeight]).filter(([s]) => s && !s.startsWith('data:')),
  }));
  if (out) fs.writeFileSync(out, JSON.stringify(data, null, 2));
  console.log(data.title + '\n\n' + data.text.slice(0, 6000));
  await browser.close();
})();
