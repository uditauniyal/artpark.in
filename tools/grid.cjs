// Tile desktop screenshots into a 2-column review sheet at half size.
// Usage: node tools/grid.cjs <outFile> <file1> <file2> ...
const fs = require('fs');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');
(async () => {
  const [out, ...files] = process.argv.slice(2);
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const p = await b.newPage({ viewport: { width: 1450, height: 400 } });
  await p.setContent(`<body style="margin:0;display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#888">${files.map((f) => `<img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}" style="width:100%">`).join('')}</body>`);
  await p.waitForTimeout(300);
  await p.screenshot({ path: out, fullPage: true });
  await b.close();
})();
