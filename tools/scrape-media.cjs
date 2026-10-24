// For artpark.in pages: capture iframes (YouTube etc.), video tags and every outbound link (read-only).
// Usage: node tools/scrape-media.cjs <url> ...  -> research/artpark-media.json (merged)
const fs = require('fs');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');
(async () => {
  const urls = process.argv.slice(2);
  const file = __dirname + '/../research/artpark-media.json';
  const out = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const queue = urls.slice();
  const work = async () => {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    while (queue.length) {
      const u = queue.shift();
      try {
        await p.goto(u, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(2500);
        for (let y = 0; y < 14000; y += 900) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(70); }
        out[u] = await p.evaluate(() => {
          const main = document.querySelector('main') || document.body;
          return {
            iframes: [...main.querySelectorAll('iframe')].map((f) => f.src || f.dataset.src).filter((s) => s && !/maps|recaptcha/.test(s)),
            embeds: [...main.querySelectorAll('[data-block-json]')].map((e) => e.getAttribute('data-block-json')).filter((s) => /youtu|vimeo/.test(s)).map((s) => (s.match(/https?:\/\/[^"\\\s]*(youtu|vimeo)[^"\\\s]*/) || [''])[0]),
            videos: [...main.querySelectorAll('video source, video')].map((v) => v.src).filter(Boolean),
            links: [...main.querySelectorAll('a[href]')].map((a) => [a.innerText.trim().replace(/\s+/g, ' ').slice(0, 100), a.href]).filter(([, h]) => /^https?:/.test(h)),
          };
        });
      } catch (e) { out[u] = { error: e.message }; }
      process.stdout.write('.');
    }
    await p.close();
  };
  await Promise.all([work(), work(), work()]);
  fs.writeFileSync(file, JSON.stringify(out, null, 1));
  await b.close();
})();
