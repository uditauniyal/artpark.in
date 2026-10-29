// One-off (2026-10-29): moved the inline events, news and tenders out of src/data/content.cjs into
// src/data/outreach/*.json, so the admin can edit them. Kept for the record; it needs the pre-migration
// content.cjs (git show 891baa0:src/data/content.cjs) and is not part of the build.
// Usage: node tools/migrate-outreach.cjs <path to old content.cjs>
const fs = require('fs');
const path = require('path');
const { slugify, uniqueId } = require('../src/outreach/model.cjs');

const ROOT = path.resolve(__dirname, '..');
const C = require(path.resolve(process.argv[2] || path.join(ROOT, 'src', 'data', 'content.cjs')));
const OUT = path.join(ROOT, 'src', 'data', 'outreach');
const MON = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
// '12 Nov 2026', '4–6 Dec 2024', '13 October 2026' -> { start, end }
function parseDate(s) {
  const m = /^(\d{1,2})(?:–(\d{1,2}))? ([A-Z][a-z]+) (\d{4})$/.exec((s || '').trim());
  if (!m) throw new Error('Unparsed date: ' + s);
  const mon = MON[m[3].slice(0, 3)];
  return { start: iso(m[4], mon, m[1]), end: m[2] ? iso(m[4], mon, m[2]) : '' };
}
const dateIn = (str) => (String(str || '').match(/\b(\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4})\b/) || [])[1] || '';

// Event text from the archived artpark.in page, cleaned exactly as src/pages/outreach.cjs did before.
function archivedBody(url) {
  const file = path.join(ROOT, 'research', 'artpark-in', 'events__' + url.split('/events/')[1].replace(/\//g, '__') + '.json');
  const raw = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).text : '';
  const lines = raw.split(/\n+/).map((l) => l.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]️?\s*/gu, '').trim()).filter(Boolean);
  const stop = lines.findIndex((l) => /^(Posted In:|Previous$)/.test(l));
  return lines.slice(0, stop === -1 ? undefined : stop)
    .filter((l, i) => i > 1 && !/^(Back to All Events|View fullsize|Jump to:|Google Calendar|ICS|Register now|Register Now)$/i.test(l) && !/\(map\)$/.test(l) && !/^\w+day, \w+ \d+, \d{4}/.test(l) && !/^\d{1,2}:\d{2}\s?[AP]M/.test(l));
}

const blank = { id: '', title: '', start: '', end: '', time: '', venue: '', blurb: '', body: [], image: '', imageAlt: '', register: '', recap: '', source: '' };
const events = [];
for (const e of C.upcomingEvents) {
  events.push({ ...blank, ...parseDate(e.date), id: slugify(e.title), title: e.title, time: e.time, venue: e.venue, blurb: e.blurb, image: e.image, imageAlt: e.imageAlt, register: e.register, source: e.source || '' });
}
for (const e of C.pastEvents) {
  const onArtpark = /artpark\.in\/events\//.test(e.url);
  const ev = { ...blank, ...parseDate(e.date), title: e.title, venue: e.venue || '', image: e.image || '' };
  if (onArtpark) {
    ev.id = e.url.replace(/\/$/, '').split('/').pop();
    ev.body = archivedBody(e.url);
    if (!ev.body.length) ev.blurb = e.note || '';
    ev.source = e.url;
  } else {
    ev.id = slugify(e.title);
    ev.recap = e.url;
    ev.blurb = e.note || '';
  }
  events.push(ev);
}

const news = [];
for (const n of C.news) {
  const id = uniqueId(slugify(n.title).slice(0, 80).replace(/-+$/, ''), news.map((x) => x.id));
  const d = n.date ? parseDate(n.date).start : '';
  news.push({ id, title: n.title, outlet: n.outlet, date: d, dateLabel: n.date || '', url: n.url });
}

const tenders = C.tenders.map((t) => {
  const docs = t.docs.map(([label, href, kind]) => ({ label, href, kind, role: /tender document/i.test(label) ? 'tender' : /price.?bid|commercial bid/i.test(label + ' ' + href) ? 'result' : 'other' }));
  const has = (re) => t.docs.some(([n, h]) => re.test((n + ' ' + h).toLowerCase()));
  const pre = t.note && /pre-bid/i.test(t.note) ? dateIn(t.note) : '';
  const corr = t.docs.some(([n]) => /corrigend/i.test(n));
  // Highest stage the old inference marked done.
  const phase = has(/price.?bid|commercial bid/) ? 4 : has(/technical bid/) ? 3 : corr ? 2 : pre ? 1 : 0;
  const priceDoc = t.docs.find(([n]) => /price|commercial/i.test(n));
  const priceDate = priceDoc && dateIn(priceDoc[0]);
  return {
    id: t.id, title: t.title, cat: t.cat, status: t.status, published: t.published ? parseDate(t.published).start : '',
    note: t.note || '', phase, noPreBid: !pre, preBid: pre, priceBidsDate: priceDate ? parseDate(priceDate).start : '', docs,
  };
});

fs.mkdirSync(OUT, { recursive: true });
for (const [name, data] of Object.entries({ events, news, tenders })) fs.writeFileSync(path.join(OUT, name + '.json'), JSON.stringify(data, null, 2) + '\n');
console.log(`events ${events.length}, news ${news.length}, tenders ${tenders.length}`);
