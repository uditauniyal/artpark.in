// Interaction check for the homepage: hovers, carousel, menu, FAQ, mobile. Saves screenshots to qa/.
// Usage: node tools/check-home.cjs [baseUrl=http://127.0.0.1:3010]
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');
const path = require('path');
const QA = path.join(__dirname, '..', 'qa');

(async () => {
  const base = process.argv[2] || 'http://127.0.0.1:3010';
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  const results = {};

  // Collage: hover the ECONOMICS tile (index 3).
  await page.locator('[data-tile="3"]').hover();
  await page.waitForTimeout(300);
  results.hoverOpacityOthers = await page.locator('[data-tile="0"]').evaluate((e) => e.style.opacity);
  results.hint = await page.locator('[data-collage-hint]').innerText();
  await page.locator('[data-collage]').screenshot({ path: path.join(QA, 'check-collage-hover.png') });

  // Carousel: each slide via tabs.
  for (const i of [0, 1, 2]) {
    await page.locator(`[data-go="${i}"]`).click();
    await page.waitForTimeout(300);
    await page.locator('#stories').screenshot({ path: path.join(QA, `check-slide-${i}.png`) });
  }
  results.count = await page.locator('[data-count]').innerText();

  // Header About menu: click opens, Escape closes.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('[data-menu="about"] button').click();
  await page.waitForTimeout(200);
  results.aboutOpen = await page.locator('#menu-about').isVisible();
  await page.screenshot({ path: path.join(QA, 'check-menu.png'), clip: { x: 0, y: 0, width: 1440, height: 460 } });
  await page.keyboard.press('Escape');
  results.aboutClosedAfterEsc = !(await page.locator('#menu-about').isVisible());

  // FAQ: switch to "The process", first question should be open.
  await page.locator('[data-faq-tab="5"]').click();
  await page.waitForTimeout(200);
  results.faqPanel5Visible = await page.locator('[data-faq-panel="5"]').isVisible();
  results.faqFirstOpen = await page.locator('#faq-5-0').isVisible();
  await page.locator('#faq').screenshot({ path: path.join(QA, 'check-faq.png') });

  // Mobile.
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await m.goto(base + '/', { waitUntil: 'networkidle' });
  results.mobileOverflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await m.screenshot({ path: path.join(QA, 'check-mobile-top.png') });
  await m.locator('.nav-toggle').click();
  await m.waitForTimeout(200);
  await m.screenshot({ path: path.join(QA, 'check-mobile-menu.png') });

  results.errors = errors;
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
