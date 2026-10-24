// Visual fidelity check: screenshot the manager's original and our page at the same viewport,
// then diff them pixel by pixel in a browser canvas.
// Usage: node tools/compare.cjs <referenceUrl> <oursUrl> <outPrefix> [width=1440] [clipHeight]
// Writes <outPrefix>-ref.png, -ours.png, -diff.png (differences in red) and prints a summary.
const fs = require('fs');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');

async function shot(browser, url, file, width, clipH) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.addStyleTag({ content: '*{transition:none!important;animation:none!important;caret-color:transparent!important}' });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.screenshot({ path: file, fullPage: !clipH, clip: clipH ? { x: 0, y: 0, width, height: Math.min(+clipH, h) } : undefined });
  await page.close();
  return h;
}

(async () => {
  const [ref, ours, prefix, w = '1440', clipH] = process.argv.slice(2);
  const width = +w;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const hRef = await shot(browser, ref, prefix + '-ref.png', width, clipH);
  const hOurs = await shot(browser, ours, prefix + '-ours.png', width, clipH);
  const page = await browser.newPage();
  const a = fs.readFileSync(prefix + '-ref.png').toString('base64');
  const b = fs.readFileSync(prefix + '-ours.png').toString('base64');
  const res = await page.evaluate(async ({ a, b }) => {
    const load = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; });
    const [ia, ib] = await Promise.all([load(a), load(b)]);
    const W = Math.max(ia.width, ib.width), H = Math.max(ia.height, ib.height);
    const ctx = (img) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(img, 0, 0); return x.getImageData(0, 0, W, H); };
    const da = ctx(ia), db = ctx(ib);
    const out = document.createElement('canvas'); out.width = W; out.height = H;
    const ox = out.getContext('2d'); const od = ox.createImageData(W, H);
    let diff = 0; const rows = new Set();
    for (let i = 0; i < da.data.length; i += 4) {
      const d = Math.abs(da.data[i] - db.data[i]) + Math.abs(da.data[i + 1] - db.data[i + 1]) + Math.abs(da.data[i + 2] - db.data[i + 2]);
      const g = (da.data[i] + da.data[i + 1] + da.data[i + 2]) / 3;
      if (d > 40) { diff++; rows.add(Math.floor(i / 4 / W)); od.data[i] = 255; od.data[i + 1] = 0; od.data[i + 2] = 0; od.data[i + 3] = 255; }
      else { od.data[i] = od.data[i + 1] = od.data[i + 2] = 200 + g / 5; od.data[i + 3] = 255; }
    }
    ox.putImageData(od, 0, 0);
    // Group differing rows into bands so the summary says WHERE things differ.
    const sorted = [...rows].sort((x, y) => x - y); const bands = [];
    for (const r of sorted) { const last = bands[bands.length - 1]; if (last && r - last[1] <= 12) last[1] = r; else bands.push([r, r]); }
    return { W, H, diff, pct: +(100 * diff / (W * H)).toFixed(3), bands: bands.slice(0, 40), png: out.toDataURL('image/png').split(',')[1] };
  }, { a, b });
  fs.writeFileSync(prefix + '-diff.png', Buffer.from(res.png, 'base64'));
  console.log(JSON.stringify({ refHeight: hRef, oursHeight: hOurs, size: [res.W, res.H], diffPixels: res.diff, diffPct: res.pct, diffBandsY: res.bands }));
  await browser.close();
})();
