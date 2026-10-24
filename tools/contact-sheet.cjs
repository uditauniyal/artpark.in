// Make labelled contact sheets of a folder of images, for quick visual review.
// Usage: node tools/contact-sheet.cjs <dir> <outPrefix> [perSheet=12]
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');

(async () => {
  const [dir, prefix, per = '12'] = process.argv.slice(2);
  const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f)).sort();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
  for (let s = 0; s * per < files.length; s++) {
    const chunk = files.slice(s * per, (s + 1) * per);
    const cells = chunk.map((f) => {
      const ext = path.extname(f).slice(1).toLowerCase().replace('jpg', 'jpeg');
      const b64 = fs.readFileSync(path.join(dir, f)).toString('base64');
      return `<figure><img src="data:image/${ext};base64,${b64}"><figcaption>${f}</figcaption></figure>`;
    }).join('');
    await page.setContent(`<style>body{margin:0;font:13px sans-serif;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px;background:#ddd}figure{margin:0;background:#fff}img{width:100%;height:260px;object-fit:contain;background:#222;display:block}figcaption{padding:4px;word-break:break-all}</style>${cells}`);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${prefix}-${s}.png`, fullPage: true });
    console.log(`${prefix}-${s}.png`, chunk.length);
  }
  await browser.close();
})();
