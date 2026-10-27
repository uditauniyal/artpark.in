// Side-by-side screenshots: his design (left) vs ours (right), same viewport and scroll position.
// node tools/side-by-side.cjs <pageKey> [scrollY ...]
const fs = require('fs');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');
const PAGES = JSON.parse(fs.readFileSync('qa/audit/pages.json', 'utf8'));
(async () => {
  const [k, ...ys] = process.argv.slice(2);
  const [his, ours] = PAGES[k];
  const b = await chromium.launch({ channel: 'chrome' });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 860 } });
  const A = await ctx.newPage(), B = await ctx.newPage();
  await A.goto('http://localhost:4400/' + encodeURIComponent(his), { waitUntil: 'networkidle' });
  await B.goto('http://localhost:3010' + ours, { waitUntil: 'networkidle' });
  await A.waitForTimeout(4000); await B.waitForTimeout(1500);
  for (const y of (ys.length ? ys : ['0']).map(Number)) {
    for (const p of [A, B]) { for (let s = 0; s <= y; s += 400) { await p.evaluate((v) => scrollTo(0, v), s); await p.waitForTimeout(40); } await p.evaluate((v) => scrollTo(0, v), y); }
    await A.waitForTimeout(1600); await B.waitForTimeout(1600);
    const a = (await A.screenshot()).toString('base64'), c = (await B.screenshot()).toString('base64');
    const q = await ctx.newPage(); await q.setViewportSize({ width: 2580, height: 900 });
    await q.setContent(`<body style="margin:0;display:flex;gap:20px;background:#f0f;font:bold 16px sans-serif"><div><div style="padding:8px;background:#000;color:#fff">HIS CLAUDE DESIGN</div><img src="data:image/png;base64,${a}"></div><div><div style="padding:8px;background:#3213b7;color:#fff">OURS</div><img src="data:image/png;base64,${c}"></div></body>`);
    fs.mkdirSync('qa/sbs', { recursive: true });
    await q.screenshot({ path: `qa/sbs/${k}-${y}.png` }); await q.close();
  }
  await b.close();
})();
