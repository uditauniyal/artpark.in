// Capture the rendered text, headings, links and images of every artpark.in page (read-only).
// Usage: node tools/scrape-artpark.cjs  -> research/artpark-in/<slug>.json + index.json
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'research', 'artpark-in');
fs.mkdirSync(OUT, { recursive: true });
const RETRY = process.argv.includes('--retry');
const prevIndex = RETRY ? JSON.parse(fs.readFileSync(path.join(OUT, 'index.json'), 'utf8')) : [];
const allUrls = fs.readFileSync(path.join(ROOT, 'research', 'sitemap.txt'), 'utf8').split(/\r?\n/).filter(Boolean)
  .filter((u) => !/\/careers-1\//.test(u) && !/homedemo/.test(u));
const extra = ['https://www.artpark.in/about-us', 'https://www.artpark.in/boards-advisors', 'https://www.artpark.in/certifications', 'https://www.artpark.in/artgarage', 'https://www.artpark.in/brainz', 'https://www.artpark.in/contact', 'https://www.artpark.in/announcements', 'https://www.artpark.in/artlabs', 'https://www.artpark.in/health', 'https://www.artpark.in/5g-test-lab-wwt-1', 'https://www.artpark.in/programs/coe-wwt1'];
for (const e of extra) if (!allUrls.includes(e)) allUrls.push(e);
const urls = RETRY ? prevIndex.filter((p) => p.error).map((p) => p.url) : allUrls;

const slug = (u) => (new URL(u).pathname.replace(/^\/|\/$/g, '').replace(/\//g, '__') || 'home');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const index = RETRY ? prevIndex.filter((p) => !p.error) : [];
  const queue = urls.slice();
  const worker = async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    while (queue.length) {
      const url = queue.shift();
      try {
        const res = await page.goto(url, { waitUntil: RETRY ? 'load' : 'networkidle', timeout: RETRY ? 90000 : 45000 });
        await page.waitForTimeout(RETRY ? 3000 : 800);
        for (let y = 0; y < 15000; y += 1000) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(60); }
        const data = await page.evaluate(() => {
          const main = document.querySelector('main') || document.body;
          const strip = (s) => s.replace(/\u00a0/g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
          return {
            title: document.title,
            description: (document.querySelector('meta[name="description"]') || {}).content || '',
            headings: [...main.querySelectorAll('h1,h2,h3,h4')].map((h) => h.tagName + ': ' + h.innerText.trim()).filter((x) => x.length > 4),
            text: strip(main.innerText),
            links: [...main.querySelectorAll('a[href]')].map((a) => [a.innerText.trim().replace(/\s+/g, ' ').slice(0, 120), a.href]).filter(([t, h]) => t || /\.pdf/i.test(h)),
            images: [...main.querySelectorAll('img')].map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight })).filter((i) => i.src && !i.src.startsWith('data:') && i.w > 60),
          };
        });
        const file = slug(url) + '.json';
        fs.writeFileSync(path.join(OUT, file), JSON.stringify({ url, status: res && res.status(), ...data }, null, 2));
        index.push({ url, file, status: res && res.status(), title: data.title, chars: data.text.length, images: data.images.length });
        process.stdout.write('.');
      } catch (e) { index.push({ url, error: e.message.slice(0, 120) }); process.stdout.write('x'); }
    }
    await page.close();
  };
  await Promise.all(RETRY ? [worker(), worker()] : [worker(), worker(), worker(), worker()]);
  index.sort((a, b) => a.url.localeCompare(b.url));
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 2));
  console.log('\n' + index.length + ' pages captured');
  await browser.close();
})();
