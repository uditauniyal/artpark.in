// Style audit: his Claude Design page vs ours, element by element.
// Every visible text element is fingerprinted (colour, size, weight, family, letter-spacing, case, line-height, background).
// Elements are matched by their text; any difference is reported. Also lists his text that is missing from ours.
// Usage: node tools/audit-styles.cjs [pageKey ...]   (his design served on :4400, ours on :3010)
const fs = require('fs');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');

const PAGES = {
  home: ['ARTPARK-Home.dc.html', '/'],
  team: ['About-Our-Team.dc.html', '/about/team'],
  approach: ['About-Approach.dc.html', '/about/approach'],
  facilities: ['About-Facilities-Offerings.dc.html', '/about/facilities'],
  certifications: ['About-Certifications.dc.html', '/about/certifications'],
  programs: ['About-Other-Programs.dc.html', '/about/programs'],
  portfolio: ['Portfolio.dc.html', '/portfolio'],
  partnerships: ['Partnerships.dc.html', '/partnerships'],
  events: ['Outreach-Events.dc.html', '/events'],
  news: ['Outreach-News.dc.html', '/news'],
  tenders: ['Outreach-Tenders.dc.html', '/tenders'],
  careers: ['Careers.dc.html', '/careers'],
  contact: ['Contact.dc.html', '/contact'],
  story1: ['Story-01-Light-Bulb.dc.html', '/stories/algofet'],
  story2: ['Story-02-Strand.dc.html', '/stories/qosmic'],
  story3: ['Story-03-GPS.dc.html', '/stories/vaani'],
};

async function collect(page, url, wait) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(wait);
  return page.evaluate(() => {
    const norm = (s) => s.replace(/\s+/g, ' ').trim();
    const out = [];
    const all = document.querySelectorAll('body *');
    for (const el of all) {
      if (el.closest('.ap-curtain,.float-stage,.tv-switch,.peek,script,style,noscript,iframe,svg')) continue;
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join(' ');
      const text = norm(own);
      if (text.length < 2) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      let bg = 'transparent', n = el;
      while (n && n !== document.body) { const b = getComputedStyle(n).backgroundColor; if (b && b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent') { bg = b; break; } n = n.parentElement; }
      out.push({
        text: text.slice(0, 90), tag: el.tagName.toLowerCase(),
        color: cs.color, size: cs.fontSize, weight: cs.fontWeight, family: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
        ls: cs.letterSpacing, tt: cs.textTransform, lh: cs.lineHeight, bg, deco: cs.textDecorationLine,
      });
    }
    return out;
  });
}

(async () => {
  const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PAGES);
  const b = await chromium.launch({ channel: 'chrome' });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const report = {};
  for (const k of keys) {
    const [his, ours] = PAGES[k];
    const H = await collect(page, 'http://localhost:4400/' + encodeURIComponent(his).replace(/%2F/g, '/'), 4500);
    const O = await collect(page, 'http://localhost:3010' + ours, 1800);
    const byText = new Map();
    for (const o of O) if (!byText.has(o.text)) byText.set(o.text, o);
    const diffs = [], missing = [];
    const seen = new Set();
    for (const h of H) {
      if (seen.has(h.text)) continue; seen.add(h.text);
      const o = byText.get(h.text);
      if (!o) { missing.push(h.text); continue; }
      const d = {};
      for (const f of ['color', 'size', 'weight', 'family', 'ls', 'tt', 'lh', 'bg', 'deco']) if (h[f] !== o[f]) d[f] = [h[f], o[f]];
      if (Object.keys(d).length) diffs.push({ text: h.text, tag: `${h.tag}/${o.tag}`, d });
    }
    report[k] = { his: H.length, ours: O.length, matched: seen.size - missing.length, diffs, missing };
    console.log(`${k}: his ${H.length} texts, matched ${seen.size - missing.length}, style diffs ${diffs.length}, his text not found ${missing.length}`);
  }
  fs.mkdirSync('qa/audit', { recursive: true });
  fs.writeFileSync('qa/audit/styles.json', JSON.stringify(report, null, 1));
  await b.close();
})();
