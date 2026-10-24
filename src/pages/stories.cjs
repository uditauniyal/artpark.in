// Founder and project stories: his Story-01-Light-Bulb.dc.html article layout, one page per story.
// Story content lives in src/data/stories/<slug>.json (sources listed in each file).
const fs = require('fs');
const path = require('path');
const { esc, page, R } = require('../lib.cjs');

const DIR = path.join(__dirname, '..', 'data', 'stories');
const all = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))) : [];

// Inline markup allowed in story text: **bold**, _italic_. Everything else is escaped.
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|\W)_(.+?)_(?=\W|$)/g, '$1<i>$2</i>');

const fig = (f) => `      <figure style="margin:16px 0;display:flex;flex-direction:column;gap:10px">
        <div style="position:relative;width:100%;aspect-ratio:${f.ratio || '3/2'};background:var(--paper-soft);overflow:hidden"><img src="${f.image}" alt="${esc(f.alt || '')}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${f.fit || 'cover'};object-position:${f.pos || '50% 50%'};display:block"></div>
        <figcaption style="font-size:13px;line-height:1.5;color:var(--ink-dim)">${md(f.caption || '')}</figcaption>
      </figure>`;

const quoteBlock = (q) => `      <blockquote style="margin:16px 0;padding:28px 0;border-top:1px solid var(--line-strong);border-bottom:1px solid var(--line-strong);font-family:var(--font-display);font-weight:700;font-size:clamp(24px,3vw,32px);line-height:1.25;color:var(--artblue-deep);text-wrap:balance">“${md(q.text)}”<footer style="margin-top:14px;font-family:var(--font-body);font-weight:600;font-size:15px;line-height:1.5;color:var(--ink-soft)">${esc(q.who)}${q.source ? ` · <a href="${q.source}" target="_blank" rel="noopener" style="font-weight:600">${esc(q.sourceLabel || 'source')}</a>` : ''}</footer></blockquote>`;

const keyDates = (rows) => `      <div style="border:1px solid var(--line);margin:16px 0">
        <div style="padding:16px 22px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:baseline;gap:12px"><span class="eyebrow">Key dates</span><span style="font-size:12px;color:var(--ink-dim)">From published sources</span></div>
${rows.map(([d, t], i) => `        <div style="display:grid;grid-template-columns:96px 1fr;gap:14px;padding:12px 22px;font-size:15px;line-height:1.55;${i < rows.length - 1 ? 'border-bottom:1px solid var(--line);' : ''}${i % 2 ? 'background:var(--paper-soft)' : ''}"><b style="font-family:var(--font-display)">${esc(d)}</b><span>${md(t)}</span></div>`).join('\n')}
      </div>`;

const panel = (p) => `      <div style="background:var(--artblack);color:#fff;padding:28px clamp(20px,3vw,32px);margin:8px 0;border-radius:2px">
        <span style="font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.14em;color:var(--artlight)">${esc(p.title.toUpperCase())}</span>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0 28px;margin-top:16px">
${p.items.map(([h, t]) => `          <div style="padding:14px 0;border-top:1px solid rgba(255,255,255,0.18)"><b style="font-family:var(--font-display);font-size:16px">${esc(h)}</b><p style="font-size:14.5px;line-height:1.55;color:rgba(255,255,255,0.78);margin-top:4px">${md(t)}</p></div>`).join('\n')}
        </div>
      </div>`;

const people = (list) => `      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:20px 16px;margin:8px 0 16px">
${list.map((p) => `        <div style="display:flex;flex-direction:column;gap:10px">${p.photo ? `<div style="position:relative;width:100%;aspect-ratio:4/5;background:var(--paper-soft);overflow:hidden"><img src="${p.photo}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${p.pos || '50% 25%'};display:block"></div>` : ''}<div><div style="font-family:var(--font-display);font-weight:700;font-size:16px;line-height:1.3">${esc(p.name)}</div><div style="font-size:13.5px;line-height:1.45;color:var(--ink-dim);margin-top:2px">${esc(p.role)}</div></div></div>`).join('\n')}
      </div>`;

const block = (b) => {
  if (typeof b === 'string') return `      <p>${md(b)}</p>`;
  if (b.figure) return fig(b.figure);
  if (b.quote) return b.quote.draft && process.env.ARTPARK_FINAL ? '' : quoteBlock(b.quote);
  if (b.dates) return keyDates(b.dates);
  if (b.panel) return panel(b.panel);
  if (b.people) return people(b.people);
  return '';
};

const storyPage = (s) => ({
  route: `${R.stories}/${s.slug}`,
  html: () => page({
    title: `${s.title} — ARTPARK Stories`, description: s.standfirst, active: 'portfolio',
    body: `
  <div aria-hidden="true" data-progress style="position:fixed;top:0;left:0;height:3px;width:0;background:var(--artblue);z-index:60"></div>
  <section data-screen-label="Story hero" style="background:var(--artblack);color:#fff">
    <div style="max-width:1180px;margin:0 auto;padding:clamp(56px,8vw,104px) 24px clamp(48px,6vw,72px)">
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.7)">
        <span style="background:var(--artlight);color:var(--artblue);padding:3px 8px;font-family:var(--font-display);font-weight:700;letter-spacing:0.06em">${esc(s.tag)}</span>
        <span>${esc(s.kicker)}</span>
      </div>
      <h1 style="color:#fff;font-size:clamp(44px,7vw,88px);line-height:1.02;letter-spacing:-0.015em;margin-top:24px;max-width:980px">${esc(s.title)}</h1>
      <p style="margin-top:28px;max-width:720px;font-size:clamp(18px,2vw,22px);line-height:1.6;color:rgba(255,255,255,0.86);text-wrap:pretty">${md(s.standfirst)}</p>
      <div style="margin-top:32px;display:flex;flex-wrap:wrap;gap:8px 24px;font-size:13px;color:rgba(255,255,255,0.6)">
        ${s.meta.map((m) => `<span>${esc(m)}</span>`).join('')}${s.website ? `<a href="${s.website}" target="_blank" rel="noopener" style="color:var(--artlight)">${esc(s.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))} ↗</a>` : ''}
      </div>
    </div>
  </section>

  <figure style="max-width:1180px;margin:0 auto;padding:0 24px">
    <div style="position:relative;width:100%;aspect-ratio:${s.hero.ratio || '21/9'};background:var(--paper-soft);margin-top:-1px;overflow:hidden"><img src="${s.hero.image}" alt="${esc(s.hero.alt)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${s.hero.fit || 'cover'};object-position:${s.hero.pos || '50% 50%'};display:block"></div>
    <figcaption style="margin-top:10px;font-size:13px;line-height:1.5;color:var(--ink-dim)">${md(s.hero.caption)}</figcaption>
  </figure>

  <div class="story-layout" style="max-width:1180px;margin:0 auto;padding:clamp(48px,7vw,88px) 24px;display:flex;flex-wrap:wrap;gap:48px 72px;align-items:flex-start">
    <aside class="story-toc" style="flex:0 1 220px;position:sticky;top:132px;display:flex;flex-direction:column;gap:10px">
      <span class="eyebrow">In this story</span>
${s.sections.map((x, i) => `      <a href="#s${i + 1}" style="font-size:14px;line-height:1.4;color:var(--ink-soft);text-decoration:none">${esc(x.toc || x.h2.replace(/\.$/, ''))}</a>`).join('\n')}
      <a href="#sources" style="font-size:14px;line-height:1.4;color:var(--ink-soft);text-decoration:none">Sources</a>
    </aside>

    <article style="flex:1 1 560px;min-width:0;max-width:700px;display:flex;flex-direction:column;gap:24px;font-size:19px;line-height:1.75;color:var(--ink);text-wrap:pretty">
${(s.lead || []).map((p, i) => i === 0 ? `      <p style="font-size:22px;line-height:1.65">${md(p)}</p>` : block(p)).join('\n')}
${s.sections.map((x, i) => `
      <h2 id="s${i + 1}" style="font-size:clamp(28px,3.2vw,34px);line-height:1.15;margin-top:32px;scroll-margin-top:132px">${esc(x.h2)}</h2>
${x.blocks.map(block).join('\n')}`).join('\n')}

      <h2 id="sources" style="font-size:clamp(28px,3.2vw,34px);line-height:1.15;margin-top:32px;scroll-margin-top:132px">Sources.</h2>
      <ol style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:8px;font-size:15px;line-height:1.6;color:var(--ink-soft)">
${s.sources.map(([label, url]) => `        <li>${url ? `<a href="${url}" target="_blank" rel="noopener">${esc(label)}</a>` : esc(label)}</li>`).join('\n')}
      </ol>
      <div style="margin-top:24px;padding-top:24px;border-top:1px solid var(--line-strong);display:flex;flex-wrap:wrap;gap:12px">
        <a class="btn btn-primary" href="${R.portfolio}">More founder stories <span class="arrow">→</span></a>
        <a class="btn btn-ghost" href="${R.home}#collaborate">Work with us</a>
      </div>
    </article>
  </div>`,
  }),
});

const drafts = all.reduce((n, st) => n + JSON.stringify(st).split('"draft":true').length - 1, 0);
if (drafts && !process.env.ARTPARK_FINAL) console.warn(`Note: ${drafts} draft founder quotes are shown (see notes/draft-quotes.md). Build with ARTPARK_FINAL=1 to drop them.`);
module.exports = all.map(storyPage);
module.exports.all = all;
