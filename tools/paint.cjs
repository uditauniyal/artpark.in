// Painterly treatment of real photographs, in the spirit of the apply.artpark.info hero:
// repeated Kuwahara (flat painted colour areas), gentle colour banding, warm-light / violet-shadow
// split toning, soft ink lines and paper grain. A deterministic filter on the original photo:
// people, products and places stay exactly as photographed.
// Usage: node tools/paint.cjs [onlyOutSubstring]   (reads src/data/paint-media.json)
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');

const ROOT = path.resolve(__dirname, '..');
const only = process.argv[2] || '';
const { images } = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/paint-media.json'), 'utf8'));

(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await b.newPage();
  for (const img of images.filter((i) => i.out.includes(only))) {
    const src = path.resolve(ROOT, img.src);
    const ext = path.extname(src).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    const out = await page.evaluate(async ({ b64, mime, o }) => {
      const im = await new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = `data:${mime};base64,${b64}`; });
      const [sx, sy, sw, sh] = o.crop || [0, 0, im.naturalWidth, im.naturalHeight];
      const W = Math.round(Math.min(o.maxW || 1200, sw)), H = Math.round(sh * W / sw);
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(im, sx, sy, sw, sh, 0, 0, W, H);
      const orig = x.getImageData(0, 0, W, H);

      const kuwahara = (src, r) => {
        const s = src.data, N = (W + 1) * (H + 1);
        const S = [new Float64Array(N), new Float64Array(N), new Float64Array(N)], Q = new Float64Array(N);
        for (let yy = 1; yy <= H; yy++) for (let xx = 1; xx <= W; xx++) {
          const i = ((yy - 1) * W + (xx - 1)) * 4, j = yy * (W + 1) + xx, up = j - (W + 1);
          const L = 0.299 * s[i] + 0.587 * s[i + 1] + 0.114 * s[i + 2];
          for (let ch = 0; ch < 3; ch++) S[ch][j] = s[i + ch] + S[ch][j - 1] + S[ch][up] - S[ch][up - 1];
          Q[j] = L * L + Q[j - 1] + Q[up] - Q[up - 1];
        }
        const box = (T, x0, y0, x1, y1) => T[y1 * (W + 1) + x1] - T[y0 * (W + 1) + x1] - T[y1 * (W + 1) + x0] + T[y0 * (W + 1) + x0];
        const res = new ImageData(W, H), d = res.data;
        for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
          let best = Infinity, br = 0, bg = 0, bb = 0;
          for (const [ax, ay] of [[-r, -r], [0, -r], [-r, 0], [0, 0]]) {
            const x0 = Math.max(0, xx + ax), y0 = Math.max(0, yy + ay), x1 = Math.min(W, xx + ax + r + 1), y1 = Math.min(H, yy + ay + r + 1);
            const n = (x1 - x0) * (y1 - y0); if (n <= 0) continue;
            const mr = box(S[0], x0, y0, x1, y1) / n, mg = box(S[1], x0, y0, x1, y1) / n, mb = box(S[2], x0, y0, x1, y1) / n;
            const ml = 0.299 * mr + 0.587 * mg + 0.114 * mb, v = box(Q, x0, y0, x1, y1) / n - ml * ml;
            if (v < best) { best = v; br = mr; bg = mg; bb = mb; }
          }
          const k = (yy * W + xx) * 4; d[k] = br; d[k + 1] = bg; d[k + 2] = bb; d[k + 3] = 255;
        }
        return res;
      };

      let paint = orig;
      for (const r of (o.passes || [5, 3])) paint = kuwahara(paint, r);
      const d = paint.data, s = orig.data;

      // Ink lines (difference of Gaussians on the original), soft.
      const blurL = (sigma) => {
        const cc = document.createElement('canvas'); cc.width = W; cc.height = H;
        const cx = cc.getContext('2d'); cx.filter = `grayscale(1) blur(${sigma}px)`; cx.drawImage(c, 0, 0);
        return cx.getImageData(0, 0, W, H).data;
      };
      const g1 = blurL(o.sigma || 1.0), g2 = blurL((o.sigma || 1.0) * 1.7);
      const ink = o.ink ?? 0.45, levels = o.levels ?? 9, grain = o.grain ?? 7;
      const warm = [255, 214, 168], cool = [58, 40, 120]; // highlight / shadow tints (amber light, ARTPARK violet shade)
      for (let k = 0; k < d.length; k += 4) {
        let r = d[k], g = d[k + 1], bl = d[k + 2];
        // Gentle banding of light, like painted planes.
        const L = 0.299 * r + 0.587 * g + 0.114 * bl;
        const Lq = Math.round((L / 255) * levels) / levels * 255;
        const f = L > 1 ? (L * 0.55 + Lq * 0.45) / L : 1;
        r *= f; g *= f; bl *= f;
        // Split tone: warm light, violet shadow.
        const t = Math.min(1, Math.max(0, L / 255));
        const sh = (1 - t) * (o.shadow ?? 0.22), hi = t * (o.light ?? 0.2);
        r = r * (1 - sh - hi) + cool[0] * sh + warm[0] * hi;
        g = g * (1 - sh - hi) + cool[1] * sh + warm[1] * hi;
        bl = bl * (1 - sh - hi) + cool[2] * sh + warm[2] * hi;
        // Lift and saturate slightly.
        const ex = o.exposure ?? 1.06, sat = o.saturation ?? 1.15;
        r *= ex; g *= ex; bl *= ex;
        const L2 = 0.299 * r + 0.587 * g + 0.114 * bl;
        r = L2 + (r - L2) * sat; g = L2 + (g - L2) * sat; bl = L2 + (bl - L2) * sat;
        // Ink.
        const u = (2.2 * g1[k] - 1.2 * g2[k]) / 255;
        const line = u >= 0.7 ? 1 : 1 + Math.tanh(8 * (u - 0.7));
        const m = 1 - (1 - Math.max(0, line)) * ink;
        // Paper grain.
        const px = (k / 4) % W, py = Math.floor(k / 4 / W);
        const n = (Math.sin(px * 12.9898 + py * 78.233) * 43758.5453) % 1;
        const gr = (n - 0.5) * grain;
        d[k] = r * m + gr; d[k + 1] = g * m + gr; d[k + 2] = bl * m + gr;
      }
      x.putImageData(paint, 0, 0);
      return { data: c.toDataURL('image/webp', 0.86).split(',')[1], W, H };
    }, { b64: fs.readFileSync(src).toString('base64'), mime, o: img });
    const dest = path.join(ROOT, 'public/assets', img.out);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, Buffer.from(out.data, 'base64'));
    console.log(`${img.out} ${out.W}x${out.H} ${Math.round(fs.statSync(dest).size / 1024)} KB`);
  }
  await b.close();
})();
