// Project and publication pages, rebuilt from the published artpark.in pages.
// Layout: his inner-page intro + Story figure + article column + his stat grid, rows and link rows.
const fs = require('fs');
const path = require('path');
const { esc, page, pageIntro, R, statGrid, linkRows } = require('../lib.cjs');
const PROJECTS = require('../data/projects.cjs');
const { programs } = require('../data/programs.cjs');

const ROOT = path.join(__dirname, '..', '..');
const CAP = path.join(ROOT, 'research', 'artpark-in');
const MEDIA = JSON.parse(fs.readFileSync(path.join(ROOT, 'research', 'artpark-media.json'), 'utf8'));
const IMAGES = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'projects-media.json'), 'utf8')).images;

const PARENT = Object.fromEntries(programs.map((p) => [p.slug, { name: p.name, href: `${R.programs}/${p.slug}` }]));
PARENT.publications = { name: 'Publications', href: R.news + '#publications' };
const routeOf = (p) => (p.parent === 'publications' ? `/publications/${p.slug}` : `/projects/${p.slug}`);

const NOISE = /^(Jump to:?|View fullsize|Read More|Read more →|Learn More|Contact Us|Talk To MIDAS Team|Access The Data|Access Data Set|Access Vaani|Play|Mute|Settings|Enter fullscreen|\d{1,2}:\d{2}|Make it stand out|Download Brochure|View|Our Partners|Supported By|Funders|Partners \(In Discussion\)|ARTPARK @ IISc \| Program|Our Scale|Numbers at Glance|Research Collaborations|Industry Partnerships)$/i;
const STOP = /^(Previous|Next|Language Programs|Our Programs|Health Programs|Working on AI for research and screening\?)$/;

const linkify = (html, links) => {
  for (const [text, href] of links) {
    if (!text || text.length < 4 || /^(here|view|link|read)$/i.test(text)) continue;
    const t = esc(text);
    const i = html.indexOf(t);
    if (i !== -1 && !html.slice(0, i).includes(`>${t}`)) html = html.slice(0, i) + `<a href="${href}" target="_blank" rel="noopener">${t}</a>` + html.slice(i + t.length);
  }
  return html;
};

function parse(p) {
  const d = JSON.parse(fs.readFileSync(path.join(CAP, p.file + '.json'), 'utf8'));
  const head = {};
  for (const h of d.headings) { const m = h.match(/^H(\d): (.*)$/s); if (m) head[m[2].trim()] = +m[1]; }
  let lines = d.text.split(/\n+/).map((l) => l.replace(/ /g, ' ').trim()).filter(Boolean);
  const titleLine = Object.keys(head).find((k) => head[k] === 1) || lines[0];
  const title = p.title || titleLine;
  let i = lines.indexOf(titleLine); lines = lines.slice(i + 1);
  const stop = lines.findIndex((l) => STOP.test(l));
  if (stop !== -1) lines = lines.slice(0, stop);
  // Drop "Jump to:" tables of contents (until the next real heading).
  const out = [];
  for (let k = 0; k < lines.length; k++) {
    if (/^Jump to:?$/i.test(lines[k])) {
      // The jump list is a run of short lines; each names a section that appears later.
      while (k + 1 < lines.length && lines[k + 1].length < 60 && !(lines[k + 1] in head && lines.indexOf(lines[k + 1], k + 2) === -1)) k++;
      continue;
    }
    if (NOISE.test(lines[k])) continue;
    out.push(lines[k]);
  }
  // Subtitle: first line, if it is a heading.
  let lede = '';
  if (out.length && out[0] in head && head[out[0]] > 1) lede = out.shift();
  return { d, title, lede, lines: out, head };
}

function render(p) {
  const { d, title, lede, lines, head } = parse(p);
  const media = MEDIA[d.url] || {};
  const links = (media.links || d.links || []).filter(([, h]) => /^https?:/.test(h) && !/artpark\.in|squarespace|google\.com\/(maps|calendar)|maps\.google|maps\.app/.test(h));
  const videos = [...new Set([...(media.iframes || []), ...(media.embeds || [])].filter((s) => /youtube\.com\/embed|youtu\.be|youtube\.com\/watch/.test(s)))]
    .map((s) => s.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/').split('&')[0]);
  const all = IMAGES.filter((x) => x.project === p.slug).sort((a, b) => a.order - b.order).map((x) => '/assets/' + x.out);
  const imgs = p.keep === 'all' ? all : (p.keep || []).map((k) => all[k]).filter(Boolean);
  const gallery = p.keep === 'all';

  // Body: headings, stat pairs, bullet runs, paragraphs.
  const blocks = [];
  const isNum = (l) => /^[₹$]?[\d.,]+\s?(M|K|k|L|Cr|B)?\s?[+%]?$|^\d+\s?(Weeks?|Days?)$/.test(l);
  const isShort = (l) => l.length <= 90 && !/[.:]$/.test(l) && !(l in head);
  let k = 0;
  while (k < lines.length) {
    const l = lines[k];
    if (isNum(l) && lines[k + 1] && !isNum(lines[k + 1])) {
      const pairs = [];
      while (k < lines.length && isNum(lines[k]) && lines[k + 1]) { pairs.push([lines[k].replace(/s+/g, ' '), lines[k + 1]]); k += 2; }
      blocks.push('      ' + statGrid(pairs));
      continue;
    }
    if (l in head) { blocks.push(`      <h2 style="font-size:${head[l] >= 4 ? '22px' : 'clamp(26px,3vw,32px)'};line-height:1.2;margin-top:${head[l] >= 4 ? 12 : 28}px">${esc(l)}</h2>`); k++; continue; }
    if (isNum(l) && lines[k + 1] && !isNum(lines[k + 1])) {
      const pairs = [];
      while (k < lines.length && isNum(lines[k]) && lines[k + 1] && !(lines[k + 1] in head)) { pairs.push([lines[k].replace(/\s+/g, ' '), lines[k + 1]]); k += 2; }
      blocks.push('      ' + statGrid(pairs));
      continue;
    }
    if (isShort(l) && lines[k + 1] && isShort(lines[k + 1])) {
      const items = [];
      while (k < lines.length && isShort(lines[k])) { items.push(lines[k]); k++; }
      blocks.push(`      <ul style="margin:0;padding:0;list-style:none;border-top:1px solid var(--line)">\n${items.map((t) => `        <li style="display:grid;grid-template-columns:24px 1fr;gap:4px;padding:10px 0;border-bottom:1px solid var(--line);font-size:16px;line-height:1.6"><span style="font-family:var(--font-display);font-weight:700;color:var(--artblue)">+</span><span>${linkify(esc(t), links)}</span></li>`).join('\n')}\n      </ul>`);
      continue;
    }
    const m = l.match(/^([^:]{2,40}):\s+(.+)$/);
    const html = m ? `<b style="color:var(--ink)">${esc(m[1])}:</b> ${esc(m[2])}` : esc(l);
    blocks.push(`      <p>${linkify(html, links)}</p>`);
    k++;
  }

  const parent = PARENT[p.parent];
  const docLinks = (d.links || []).filter(([, h]) => /artpark\.in\/s\//.test(h)).map(([t, h]) => [t === 'View' ? 'Download the full document (PDF)' : t, h]);
  const linkList = [...docLinks.map(([t, h]) => ({ meta: 'Document', title: t, href: h, action: 'Download →' })),
    ...links.filter(([, h]) => !/linkedin\.com\/in\//.test(h)).filter((x, i, a) => a.findIndex((y) => y[1] === x[1]) === i)
      .map(([t, h]) => ({ meta: new URL(h).hostname.replace('www.', ''), title: t && t.length > 3 ? t : new URL(h).hostname.replace('www.', ''), href: h, action: /youtu/.test(h) ? 'Watch →' : 'Open →' }))];

  return page({
    title: `${title} — ARTPARK`, active: 'about', sub: 'programs', description: lede || title,
    body: pageIntro({ eyebrow: parent.name, h1: esc(title.replace(/\.$/, '')) + '.', lede: esc(lede || '') }) + `
  <div style="max-width:1180px;margin:0 auto;padding:48px 24px 112px">
    ${imgs[0] && !gallery ? `<figure style="margin:0 0 48px"><div style="background:var(--paper-soft);display:flex;justify-content:center"><img src="${imgs[0]}" alt="${esc(title)}" style="max-width:100%;max-height:560px;width:auto;height:auto;display:block"></div></figure>` : ''}
    <div class="story-layout" style="display:flex;flex-wrap:wrap;gap:48px 72px;align-items:flex-start">
      <aside class="story-toc" style="flex:0 1 220px;position:sticky;top:132px;display:flex;flex-direction:column;gap:10px">
        <span class="eyebrow">Part of</span>
        <a href="${parent.href}" style="font-family:var(--font-display);font-weight:700;font-size:16px;text-decoration:none">${esc(parent.name)} →</a>
      </aside>
      <article class="prose" style="flex:1 1 560px;min-width:0;max-width:760px;display:flex;flex-direction:column;gap:18px;font-size:17px;line-height:1.75;color:var(--ink-soft);text-wrap:pretty">
${blocks.join('\n')}
      </article>
    </div>
${!gallery && imgs.length > 1 ? `    <section style="margin-top:64px"><span class="eyebrow">From the project</span>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:16px">
${imgs.slice(1).map((s) => `        <div style="position:relative;aspect-ratio:3/2;background:var(--paper-soft);overflow:hidden;border:1px solid var(--line)"><img src="${s}" alt="" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block"></div>`).join('\n')}
      </div></section>` : ''}
${gallery ? `    <section style="margin-top:64px"><span class="eyebrow">The vignettes</span>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-top:16px">
${imgs.map((s) => `        <a href="${s}" target="_blank" rel="noopener" style="display:block;aspect-ratio:1/1;border:1px solid var(--line);overflow:hidden"><img src="${s}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block"></a>`).join('\n')}
      </div></section>` : ''}
${videos.length ? `    <section style="margin-top:64px"><span class="eyebrow">Watch</span>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr));gap:16px;margin-top:16px">
${videos.map((v) => `        <div style="position:relative;aspect-ratio:16/9;background:var(--artblack)"><iframe src="${v}" title="ARTPARK video" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div>`).join('\n')}
      </div></section>` : ''}
${linkList.length ? `    <section style="margin-top:64px"><span class="eyebrow">Links and resources</span>
      <div style="margin-top:16px">${linkRows(linkList)}</div></section>` : ''}
    <div style="margin-top:48px;display:flex;flex-wrap:wrap;gap:12px"><a class="btn btn-primary" href="${R.contact}">Work with us on this <span class="arrow">→</span></a><a class="btn btn-ghost" href="${parent.href}">Back to ${esc(parent.name)}</a></div>
  </div>`,
  });
}

module.exports = PROJECTS.map((p) => ({ route: routeOf(p), html: () => render(p) }));
// Card info for programme pages: title, one-line lede, first photo.
module.exports.info = (slug) => {
  const p = PROJECTS.find((x) => x.slug === slug);
  const { title, lede, lines } = parse(p);
  const img = p.card ? { out: p.card.replace('/assets/', '') } : null;
  const text = (lede || lines.find((l) => l.length > 60) || '').replace(/\s+/g, ' ');
  return { title: p.cardTitle || title.replace(/\.$/, ''), lede: p.cardText || text.length > 170 ? text.slice(0, 167).replace(/\s\S*$/, '') + '…' : text, image: img && '/assets/' + img.out, route: routeOf(p) };
};
module.exports.routeOf = routeOf;
module.exports.list = PROJECTS;
