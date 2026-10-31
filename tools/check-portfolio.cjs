// Portfolio filters in a real browser: domain filter, programme note, phone layout.
// Usage: node tools/check-portfolio.cjs [baseUrl=http://127.0.0.1:3010] (needs ARTPARK_PLAYWRIGHT)
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');
const base = process.argv[2] || 'http://127.0.0.1:3010';
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const r = {};
  const errors = [];
  try {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    p.on('pageerror', (e) => errors.push(String(e)));
    await p.goto(base + '/portfolio');
    const visible = () => p.locator('[data-company]:visible').count();
    await p.click('[data-domain="MedTech"]');
    r.medtechCards = await visible();
    r.medtechCount = await p.textContent('[data-pcount]');
    r.medtechPressed = await p.getAttribute('[data-domain="MedTech"]', 'aria-pressed');
    await p.click('[data-programme="TIR"]');
    r.tirNote = await p.isVisible('[data-programme-note]');
    r.tirCards = await visible();
    await p.click('[data-programme="All"]');
    r.allNoteHidden = !(await p.isVisible('[data-programme-note]'));
    await p.click('[data-domain=""]');
    r.allCards = await visible();
    const m = await b.newPage({ viewport: { width: 390, height: 844 } });
    m.on('pageerror', (e) => errors.push(String(e)));
    await m.goto(base + '/portfolio');
    r.phoneOverflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    r.phoneRowScrolls = await m.evaluate(() => { const a = document.querySelector('.pf-domains-list'); return a.scrollWidth > a.clientWidth; });
    await m.click('[data-domain="Space Tech"]');
    r.phoneClimateCards = await m.locator('[data-company]:visible').count();
  } catch (e) { r.exception = String(e).split('\n')[0]; }
  r.errors = errors;
  const ok = r.medtechCards === 6 && r.medtechCount === '6 companies' && r.medtechPressed === 'true' && r.tirNote && r.tirCards === 6 && r.allNoteHidden && r.allCards === 36 && r.phoneOverflow <= 1 && r.phoneRowScrolls && r.phoneClimateCards === 2 && !errors.length && !r.exception;
  console.log(JSON.stringify({ ok, ...r }, null, 2));
  process.exitCode = ok ? 0 : 1;
  await b.close();
})();
