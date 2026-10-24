// Combine a series of screenshots (prefix-*.png) side by side into one image for review.
// Usage: node tools/strip.cjs <outFile> <file1> <file2> ...
const fs = require('fs');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');
(async () => {
  const [out, ...files] = process.argv.slice(2);
  const imgs = files.map((f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'));
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const p = await b.newPage({ viewport: { width: 400 * imgs.length, height: 860 } });
  await p.setContent(`<body style="margin:0;display:flex;gap:6px;background:#888">${imgs.map((s) => `<img src="${s}" style="width:390px">`).join('')}</body>`);
  await p.waitForTimeout(300);
  await p.screenshot({ path: out, fullPage: true });
  await b.close();
})();
