// Crop/resize the images listed in src/data/media.json into public/assets as WebP,
// using headless Chrome's canvas (no image library needed).
// Usage: node tools/images.cjs [onlyOutSubstring]
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');

const ROOT = path.resolve(__dirname, '..');
const only = process.argv[2] || '';
const images = fs.readdirSync(path.join(ROOT, 'src/data')).filter((f) => f.endsWith('.json') && f.includes('media')).flatMap((f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')).images);

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  for (const img of images.filter((i) => i.out.includes(only))) {
    const srcPath = path.resolve(ROOT, img.src);
    const ext = path.extname(srcPath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    const b64 = fs.readFileSync(srcPath).toString('base64');
    const out = await page.evaluate(async ({ b64, mime, crop, maxW, q }) => {
      const im = await new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = j; i.src = `data:${mime};base64,${b64}`; });
      const [sx, sy, sw, sh] = crop || [0, 0, im.naturalWidth, im.naturalHeight];
      const scale = Math.min(1, maxW / sw);
      const c = document.createElement('canvas'); c.width = Math.round(sw * scale); c.height = Math.round(sh * scale);
      const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
      x.drawImage(im, sx, sy, sw, sh, 0, 0, c.width, c.height);
      return { data: c.toDataURL('image/webp', q).split(',')[1], w: c.width, h: c.height };
    }, { b64, mime, crop: img.crop, maxW: img.maxW || 1600, q: img.quality || 0.82 });
    const dest = path.join(ROOT, 'public/assets', img.out);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, Buffer.from(out.data, 'base64'));
    console.log(`${img.out}  ${out.w}x${out.h}  ${Math.round(fs.statSync(dest).size / 1024)} KB`);
  }
  await browser.close();
})();
