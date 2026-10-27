// Obvious-error finder for every route, at 1440 and 390:
//  - text overlapping other text (two text boxes that are not nested and intersect by > 4px both ways)
//  - text clipped by an overflow:hidden ancestor (the text box sticks out of it) or ellipsised
//  - images whose box aspect ratio is badly different from the picture with object-fit:fill (stretched)
//  - elements wider than the viewport
// Usage: node tools/check-visual.cjs [route ...]   (server on :3010). Writes qa/visual.json.
const fs = require('fs');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');
const SKIP = /^\/about\/team\/(v1|v2|v3|versions)$/;
(async () => {
  const routes = process.argv.slice(2).length ? process.argv.slice(2) : JSON.parse(fs.readFileSync('dist/routes.json', 'utf8')).filter((r) => !SKIP.test(r));
  const b = await chromium.launch({ channel: 'chrome' });
  const out = {};
  for (const w of (process.env.WIDTHS || '1440,390').split(',').map(Number)) {
    const p = await b.newPage({ viewport: { width: w, height: w < 600 ? 844 : 900 }, isMobile: w < 600 });
    await p.emulateMedia({ reducedMotion: 'reduce' }); // settle every animation so positions are final
    for (const r of routes) {
      await p.goto('http://localhost:3010' + r, { waitUntil: 'networkidle' });
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } scrollTo(0, 0); });
      await p.waitForTimeout(400);
      const issues = await p.evaluate(() => {
        const res = [];
        const skip = (el) => el.closest('.ap-curtain,.float-stage,.peek,iframe,svg,[aria-hidden="true"],.collage-stage,.tv1-stage,.hero-slide[aria-hidden="true"],.fs-slide:not(.is-on),[data-tv2-fig],.fx-fig,.fx-visual,header nav.site-nav:not(.is-open)');
        const texts = [];
        for (const el of document.querySelectorAll('body *')) {
          if (skip(el)) continue;
          const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.nodeValue.trim()).length;
          if (!own) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
          const rg = document.createRange(); rg.selectNodeContents(el);
          const rects = [...rg.getClientRects()].filter((q) => q.width > 2 && q.height > 2);
          if (!rects.length) continue;
          const t = el.textContent.trim().replace(/\s+/g, ' ').slice(0, 50);
          for (const q of rects) texts.push({ el, t, q });
          // clipped by overflow ancestor
          let a = el.parentElement;
          while (a && a !== document.body) {
            const as = getComputedStyle(a);
            if (/(hidden|clip)/.test(as.overflowX + as.overflowY) && !/auto|scroll/.test(as.overflowX + as.overflowY)) {
              const ar = a.getBoundingClientRect();
              for (const q of rects) if (q.right > ar.right + 3 || q.bottom > ar.bottom + 3 || q.left < ar.left - 3) { res.push({ kind: 'clipped', t, by: a.className || a.tagName }); break; }
              break;
            }
            a = a.parentElement;
          }
          if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) res.push({ kind: 'ellipsis', t });
        }
        for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
          const A = texts[i], B = texts[j];
          if (A.el === B.el || A.el.contains(B.el) || B.el.contains(A.el)) continue;
          const ox = Math.min(A.q.right, B.q.right) - Math.max(A.q.left, B.q.left);
          const oy = Math.min(A.q.bottom, B.q.bottom) - Math.max(A.q.top, B.q.top);
          if (ox > 4 && oy > 4) res.push({ kind: 'overlap', t: A.t, with: B.t });
        }
        for (const img of document.images) {
          if (skip(img) || !img.naturalWidth) continue;
          const r = img.getBoundingClientRect(); if (r.width < 30 || r.height < 30) continue;
          const fit = getComputedStyle(img).objectFit;
          if (fit === 'fill') { const k = (r.width / r.height) / (img.naturalWidth / img.naturalHeight); if (k > 1.12 || k < 0.89) res.push({ kind: 'stretched', t: img.src.split('/').pop(), k: k.toFixed(2) }); }
        }
        for (const el of document.querySelectorAll('body *')) { if (skip(el)) continue; const r = el.getBoundingClientRect(); if (r.right > innerWidth + 2 && r.width > 0 && getComputedStyle(el).position !== 'fixed' && !el.closest('[style*="overflow-x:auto"],.fx-list,.tv-chips,.sub-tabs,[role="group"]')) { res.push({ kind: 'wide', t: (el.className || el.tagName).toString().slice(0, 40) }); break; } }
        const seen = new Set();
        return res.filter((x) => { const k = JSON.stringify(x); if (seen.has(k)) return false; seen.add(k); return true; });
      });
      if (issues.length) { out[`${w} ${r}`] = issues; console.log(`${w} ${r}: ${issues.length} — ${issues.slice(0, 3).map((x) => x.kind + ': ' + x.t + (x.with ? ' × ' + x.with : '') + (x.k ? ' ' + x.k : '')).join(' | ')}`); }
    }
    await p.close();
  }
  fs.writeFileSync('qa/visual.json', JSON.stringify(out, null, 1));
  console.log(Object.keys(out).length ? `${Object.keys(out).length} page/width combinations with issues.` : 'No visual issues found.');
  await b.close();
})();
