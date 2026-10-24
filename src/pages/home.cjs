// Home: ported from .reference/claude-design/ARTPARK-Home.dc.html, section by section.
// Layout, spacing, copy and interactions are his. Story content is real ARTPARK material
// (src/data/stories.json). Changes are listed in notes/corrections-log.md.
const { page, esc, R } = require('../lib.cjs');
const { stories, tiles, rail } = require('../data/stories.json');
const fs = require('fs');
const path = require('path');
const C = require('../data/content.cjs');
const company = Object.fromEntries(C.portfolio.map((c) => [c.slug, c]));
const storyFile = (slug) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'stories', slug + '.json'), 'utf8'));

// His tile geometry, in the same order as his TILES array.
const GEO = [
  ['1%', '6%', '22%', '46%'], ['5%', '56%', '18%', '42%'], ['24.5%', '0%', '14.5%', '42%'],
  ['25%', '46%', '14%', '40%'], ['40%', '10%', '20%', '74%'], ['61%', '2%', '15%', '42%'],
  ['61.5%', '48%', '14.5%', '44%'], ['77%', '6%', '14%', '42%'], ['77.5%', '52%', '21%', '42%'],
];
const storyHref = (slug) => `/stories/${slug}`;

// ---------- A. Opening: collage ----------
const tileHtml = tiles.map((t, i) => {
  const [l, top, w, h] = GEO[i];
  const core = !!t.core;
  return `        <a href="${storyHref(t.story)}" class="collage-tile" data-tile="${i}"${core ? ' data-core' : ''} aria-label="${esc(t.tag + ' — ' + t.cap)}" style="--i:${i};position:absolute;left:${l};top:${top};width:${w};height:${h};z-index:${core ? 10 : i + 1};display:block;border-radius:12px;overflow:hidden;background:#fff;border:${core ? '3px solid var(--artlight)' : '3px solid #fff'};opacity:1;transition:opacity 150ms ease,border-color 150ms ease;text-decoration:none;outline-offset:3px">
          <div class="tile-img" role="img" aria-hidden="true" style="width:100%;height:100%;background-image:url(${t.img});background-size:cover;background-position:${t.pos}"></div>
          <span style="position:absolute;left:10px;top:10px;background:${core ? 'var(--artlight)' : 'rgba(255,255,255,0.94)'};color:var(--artblue);padding:4px 9px;border-radius:999px;font-size:clamp(8.5px,0.85vw,10px);font-weight:700;letter-spacing:0.08em;max-width:calc(100% - 20px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box">${esc(t.tag)}</span>
          <div data-cap style="position:absolute;left:0;right:0;bottom:0;background:var(--artblue);color:#fff;padding:12px 14px;opacity:0;transition:opacity 150ms ease">
            <span style="display:block;font-size:10px;font-weight:600;letter-spacing:0.14em;color:var(--artlight)">${esc(t.label)}</span>
            <span style="display:block;font-family:var(--font-display);font-weight:700;font-size:clamp(12px,1.15vw,15px);line-height:1.25;margin-top:4px">${esc(t.cap)}</span>
          </div>
        </a>`;
}).join('\n');

const chipHtml = tiles.map((t, i) => {
  const core = !!t.core;
  return `          <button type="button" class="collage-chip" data-chip="${i}"${core ? ' data-core' : ''} style="border:1px solid ${core ? 'var(--artlight)' : 'var(--line-strong)'};background:${core ? 'var(--artlight)' : 'transparent'};color:var(--artblue);padding:7px 14px;border-radius:999px;font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.06em;cursor:pointer;transition:all 150ms ease">${esc(t.tag)}</button>`;
}).join('\n');

const opening = `
  <!-- A. Opening — collage -->
  <section data-screen-label="Opening" class="opening" style="position:relative;background:var(--paper);padding:clamp(20px,2.5vw,32px) 0 clamp(24px,3vw,36px);overflow:hidden">
    <div style="position:relative;max-width:1180px;margin:0 auto;padding:0 24px;text-align:center;display:flex;flex-direction:column;align-items:center">
      <span style="font-size:11px;font-weight:600;letter-spacing:0.16em;color:var(--ink-dim)">STORIES FROM ARTPARK · IISC BENGALURU</span>
      <h1 style="font-size:clamp(42px,6.4vw,84px);line-height:1.02;letter-spacing:-0.015em;margin-top:14px;max-width:1000px">The breakthrough is only the <span class="hl">beginning</span>.</h1>
      <p style="margin-top:16px;max-width:640px;font-size:clamp(16px,1.6vw,19px);line-height:1.6;color:var(--ink-soft);text-wrap:balance">A result in the lab tells you what might be possible. Making it real takes another body of work — and much of that work is invention too.</p>
    </div>

    <div class="collage" data-collage style="max-width:1240px;margin:clamp(28px,3.5vw,44px) auto 0;padding:0 24px">
      <div class="collage-stage" style="position:relative;width:100%;aspect-ratio:1180/520;min-height:340px">
${tileHtml}
      </div>

      <div style="margin-top:28px;display:flex;flex-direction:column;align-items:center;gap:14px">
        <p style="font-family:var(--font-display);font-weight:700;font-size:clamp(17px,1.7vw,20px);text-align:center">One breakthrough. Eight more things it took.</p>
        <div class="collage-chips" style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px">
${chipHtml}
        </div>
        <p data-collage-hint style="font-size:13px;color:var(--ink-dim);text-align:center">Hover over a picture or a label to see where it comes from in the stories.</p>
      </div>
    </div>

    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:20px;padding:0 24px">
      <a class="btn btn-primary" href="#stories">Read the stories <span class="arrow">→</span></a>
      <a class="btn btn-ghost" href="#building">What ARTPARK is building</a>
    </div>

    <div class="stat-band" style="position:relative;max-width:1180px;margin:clamp(32px,4vw,48px) auto 0;padding:0 24px">
      <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--line-strong);border-bottom:1px solid var(--line-strong)">
${[[String(C.portfolio.length), 'startups built and backed at ARTPARK', R.portfolio], ['₹230 Cr', 'seed support from DST and the Government of Karnataka', R.approach], ['75,000 sq ft', 'of labs and test arenas at ARTgarage', R.facilities + '/artgarage'], ['31,000+', 'hours of Indian speech, open in Project Vaani', '/stories/vaani']].map(([n, l, h], i) => `        <a href="${h}" class="stat" style="--d:${i}"><span class="stat-n" data-count-to="${n}">${n}</span><span class="stat-l">${l}</span></a>`).join('\n')}
      </div>
    </div>
  </section>`;

// ---------- B. Featured stories carousel ----------
const slide = (s, i) => `      <div class="hero-slide" data-slide="${i}" aria-hidden="${i === 0 ? 'false' : 'true'}" style="grid-area:1/1;position:relative;display:flex;align-items:center;min-height:clamp(480px,50vw,600px);opacity:${i === 0 ? 1 : 0};visibility:${i === 0 ? 'visible' : 'hidden'};transition:opacity 150ms ease">
        <div class="hero-slide-media" style="position:absolute;top:0;right:0;bottom:0;width:min(1100px,88%);-webkit-mask-image:linear-gradient(90deg,transparent 0%,rgba(0,0,0,0.55) 22%,#000 48%);mask-image:linear-gradient(90deg,transparent 0%,rgba(0,0,0,0.55) 22%,#000 48%);filter:saturate(0.85) brightness(1.04)">
          <img class="kenburns" src="${s.image}" alt="${esc(s.imageAlt)}"${i === 0 ? '' : ' loading="lazy"'} style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${s.imagePos};display:block">
        </div>
        <div aria-hidden="true" class="hero-slide-fade" style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,#fff 0%,rgba(255,255,255,0.92) 30%,rgba(255,255,255,0.55) 48%,rgba(255,255,255,0) 66%)"></div>
        <div class="hero-slide-body" style="position:relative;width:100%;max-width:1180px;margin:0 auto;padding:clamp(36px,4.5vw,56px) 24px clamp(112px,10vw,136px);pointer-events:none">
          <div style="max-width:600px;display:flex;flex-direction:column;pointer-events:auto">
            <span style="align-self:flex-start;display:inline-flex;align-items:center;gap:10px;border:1px solid var(--artblue);background:var(--paper);padding:7px 12px;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:var(--artblue)"><span class="dot"></span>Story ${s.n} · ${esc(s.path)}</span>
            <h2 style="font-size:clamp(40px,6vw,80px);line-height:1.03;letter-spacing:-0.015em;margin-top:24px">${s.h2}</h2>
            <p style="margin-top:24px;font-size:18px;line-height:1.7;color:var(--ink);max-width:560px;text-wrap:pretty">${s.lead}</p>
            <p style="margin-top:14px;font-size:16px;line-height:1.7;color:var(--ink-soft);max-width:540px;text-wrap:pretty">${s.sub}</p>
            ${s.metric ? `<div class="slide-metric"><b>${esc(s.metric[0])}</b><span>${esc(s.metric[1])}</span></div>` : ''}
            <div style="margin-top:32px;display:flex;flex-wrap:wrap;align-items:center;gap:20px">
              <a class="btn btn-primary" href="${storyHref(s.slug)}" tabindex="${i === 0 ? 0 : -1}">Read the story <span class="arrow">→</span></a>
              <span style="font-size:13px;color:var(--ink-soft)">${esc(s.meta)}</span>
            </div>
            ${s.also ? `<div class="also-row" style="margin-top:26px;padding-top:18px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:10px">
              <span class="eyebrow">Also on this path</span>
              <div style="display:flex;flex-wrap:wrap;gap:8px">${s.also.map((slug) => `<a href="${storyHref(slug)}" class="also-chip" tabindex="${i === 0 ? 0 : -1}"><img src="/assets/logos/${slug}.webp" alt="" loading="lazy"><span>${esc(company[slug].name)}</span></a>`).join('')}</div>
            </div>` : ''}
          </div>
        </div>
        <span class="hero-slide-caption" style="position:absolute;right:24px;top:16px;font-size:12px;color:var(--ink-soft);background:rgba(255,255,255,0.85);padding:4px 8px;pointer-events:none">${esc(s.caption)}</span>
      </div>`;

const carousel = `
  <!-- B. Featured stories carousel -->
  <section id="stories" data-screen-label="Featured stories" data-carousel aria-roledescription="carousel" aria-label="Featured stories" style="position:relative;overflow:hidden;background:var(--paper);border-top:1px solid var(--line);border-bottom:1px solid var(--line);scroll-margin-top:72px">
    <div style="position:relative;z-index:3;border-bottom:1px solid var(--line);background:var(--paper)">
      <div style="max-width:1180px;margin:0 auto;padding:28px 24px 26px;display:flex;flex-wrap:wrap;gap:16px 48px;align-items:flex-start">
        <div style="flex:0 1 300px;min-width:220px;display:flex;flex-direction:column;gap:10px">
          <div class="eyebrow-rule">The series</div>
          <p style="font-family:var(--font-display);font-weight:700;font-size:clamp(22px,2.4vw,28px);line-height:1.15;letter-spacing:-0.01em">Three ways a breakthrough travels.</p>
        </div>
        <div style="flex:1 1 520px;min-width:0;display:flex;flex-direction:column;gap:10px">
          <p style="font-size:16px;line-height:1.7;color:var(--ink-soft);text-wrap:pretty;max-width:720px">Research translation is not one pipeline. Sometimes it means <b style="color:var(--ink)">completing a system</b> around an invention. Sometimes it means <b style="color:var(--ink)">building an enterprise</b> around a scientific capability. Sometimes it means <b style="color:var(--ink)">creating a platform</b> that other people build on. Each story follows one of those paths — what happened, who did the work, and what it took.</p>
          <p style="display:flex;align-items:baseline;gap:8px;font-size:13px;line-height:1.6;color:var(--ink-dim);max-width:720px"><span class="dot" style="flex:none;transform:translateY(-1px)"></span><span>These are ARTPARK stories, told from published interviews, company announcements and project records. Sources are listed in each article.</span></p>
        </div>
      </div>
    </div>
    <div class="hero-slides" style="display:grid">
${stories.map(slide).join('\n')}
    </div>
    <div class="hero-controls-wrap" style="position:absolute;left:0;right:0;bottom:0;z-index:2;pointer-events:none">
      <div class="hero-controls" style="max-width:1180px;margin:0 auto;padding:0 24px 28px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px;pointer-events:auto">
        <div role="tablist" class="hero-tabs" aria-label="Choose a story" style="display:flex;flex-wrap:wrap;gap:6px">
${stories.map((s, i) => `          <button type="button" role="tab" data-go="${i}" aria-selected="${i === 0}" style="display:flex;flex-direction:column;gap:6px;min-width:120px;text-align:left;background:rgba(255,255,255,0.9);border:0;border-top:3px solid ${i === 0 ? 'var(--artblue)' : 'var(--line-strong)'};padding:8px 10px 6px;cursor:pointer;font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.08em;color:${i === 0 ? 'var(--artblue)' : 'var(--ink-soft)'};transition:color 150ms ease,border-color 150ms ease;position:relative">${esc(s.tab)}<span class="tab-progress" aria-hidden="true"></span></button>`).join('\n')}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span data-count style="font-size:13px;color:var(--ink-soft);margin-right:6px">01 / 03</span>
          <button type="button" class="btn btn-ghost" data-prev aria-label="Previous story" style="padding:10px 16px;background:var(--paper)">←</button>
          <button type="button" class="btn btn-ghost" data-next aria-label="Next story" style="padding:10px 16px;background:var(--paper)">→</button>
        </div>
      </div>
    </div>
  </section>`;

// ---------- C. Founders, in their own words (his slide-track logic: track, bars, prev/next, count) ----------
const quoteFor = (r) => {
  if (r.text) return r;
  const st = storyFile(r.slug); let hit = null;
  const walk = (b) => { if (b && b.quote && !hit && b.quote.text.includes(r.match)) hit = b.quote; };
  (st.lead || []).forEach(walk); st.sections.forEach((x) => x.blocks.forEach(walk));
  if (!hit) throw new Error('Rail quote not found: ' + r.slug + ' / ' + r.match);
  const [who, ...roleParts] = hit.who.split(', ');
  let text = hit.text.trim();
  const first = text.match(/^.+?[.?!](?=\s|$)/);
  if (text.length > 210 && first && first[0].length > 60) text = first[0];
  return { ...r, text, who, role: roleParts.join(', '), source: hit.source };
};
const RAIL = rail.map(quoteFor);
// Scroll-led founder stories (round 7). Desktop: the photo stays pinned on the left and changes as each
// founder's quote reaches the middle of the screen; the quote being read is full strength, the rest dimmed.
// Phones: swipeable photo cards with the next one peeking in. Short pull-quotes are exact excerpts (stories.json "pull").
const FX = RAIL.map((r) => ({ ...r, title: storyFile(r.slug).title, short: r.pull || r.text, name: company[r.slug].name }));
const founders = `
  <!-- C. Founders, in their own words -->
  <section id="founders" data-screen-label="Founder stories" data-founders style="background:var(--paper-soft);padding:clamp(56px,7vw,104px) 0 clamp(48px,6vw,88px);scroll-margin-top:110px">
    <div style="max-width:1180px;margin:0 auto;padding:0 24px">
      <div class="fx-head">
        <div class="eyebrow-rule">Founder stories</div>
        <h2 style="font-size:clamp(36px,5vw,60px);line-height:1.06;margin-top:16px">In their own <span class="hl">words</span>.</h2>
        <p style="margin-top:14px;max-width:640px;font-size:18px;line-height:1.7;color:var(--ink-soft);text-wrap:pretty">${C.portfolio.length} companies have been built and backed at ARTPARK. These are some of the people behind them, on what they saw, what was hard and what it took.</p>
      </div>
      <div class="fx-grid">
        <div class="fx-visual" aria-hidden="true">
          <div class="fx-frame">
${FX.map((r, i) => `            <figure class="fx-fig${i === 0 ? ' is-on' : ''}" data-fx-fig="${i}"><img src="${r.img}" alt="" loading="${i < 2 ? 'eager' : 'lazy'}" style="object-position:${r.pos || '50% 50%'}"><span class="fx-chip"><img src="/assets/logos/${r.slug}.webp" alt=""></span></figure>`).join('\n')}
          </div>
          <div class="fx-progress"><span data-fx-count>01 / ${String(FX.length).padStart(2, '0')}</span><i><b data-fx-bar style="width:${(100 / FX.length).toFixed(2)}%"></b></i></div>
        </div>
        <ol class="fx-list" data-fx-list>
${FX.map((r, i) => `          <li class="fx-item${i === 0 ? ' is-on' : ''}" data-fx-item="${i}">
            <a class="fx-card-media" href="${storyHref(r.slug)}" tabindex="-1" aria-hidden="true"><img src="${r.img}" alt="" loading="lazy" style="object-position:${r.pos || '50% 50%'}"><span class="fx-chip"><img src="/assets/logos/${r.slug}.webp" alt=""></span></a>
            <div class="fx-body">
              <div class="fx-meta"><span class="fx-n">${String(i + 1).padStart(2, '0')}</span><img class="fx-logo" src="/assets/logos/${r.slug}.webp" alt="${esc(r.name)}"></div>
              <p class="fx-kicker">${esc(r.title)}</p>
              <blockquote class="fx-quote">“${esc(r.short)}”</blockquote>
              <p class="fx-who"><b>${esc(r.who)}</b><span>${esc(r.role)}</span></p>
              <a class="fx-link" href="${storyHref(r.slug)}">Read the ${esc(r.name)} story <span class="arrow">→</span></a>
            </div>
          </li>`).join('\n')}
        </ol>
      </div>
      <div class="fx-foot"><span class="fx-swipe">Swipe for more founders →</span><a href="${R.portfolio}">All ${C.portfolio.length} companies and their stories →</a></div>
    </div>
  </section>`;

// ---------- D. What we believe ----------
const BELIEFS = [
  ['01', 'A working result is where the questions start.', 'AlgoFET’s drones could already fly. Whether one could land, recharge and fly again on its own, at night, with no one on the ground, was a separate question — and the answer was a dock, a charger and a backup for every critical step.', 'algofet', 'From Story 01 →'],
  ['02', 'Test it where it will live.', 'Real environments add requirements no lab result can satisfy on its own. QOSMIC’s steering mirror had to survive thermal vacuum and launch-level vibration before it could matter to anyone. It passed both on the first attempt, nine months after the team started from scratch.', 'qosmic', 'From Story 02 →'],
  ['03', 'Not every result should become a startup.', 'Some research becomes a product, some becomes a firm, and some becomes infrastructure that others build on. Vaani creates its widest value as open data — MWire Labs in Shillong used it to build the first publicly available Garo speech-to-text model.', 'vaani', 'From Story 03 →'],
  ['04', 'The unglamorous work is invention too.', '“We build multiple options for critical steps to make sure that if one fails, the other solution exists,” says AlgoFET’s Ankit Mishra. Integration, reliability and economics deserve the same respect as the original insight.', null, null],
];
const believe = `
  <!-- D. What we believe -->
  <section id="believe" data-screen-label="What we believe" class="reveal" style="background:var(--paper-soft);padding:clamp(36px,4.5vw,56px) 0;scroll-margin-top:72px">
    <div style="max-width:1180px;margin:0 auto;padding:0 24px">
      <div class="eyebrow-rule">What we believe</div>
      <p style="font-family:var(--font-display);font-weight:700;font-size:clamp(30px,4.4vw,52px);line-height:1.12;letter-spacing:-0.01em;margin-top:24px;max-width:1000px;text-wrap:balance">The work between research and real-world use is not the paperwork after innovation. It is <span class="hl">part of innovation itself</span>.</p>
      <p style="margin-top:14px;max-width:680px;font-size:17px;line-height:1.7;color:var(--ink-soft);text-wrap:pretty">Technologies have to be built, tested, challenged, integrated and refined in the environments where they will finally be used. What we learned from the three stories, in four sentences:</p>

      <div style="margin-top:28px;border-top:1px solid var(--line-strong)">
${BELIEFS.map(([n, h, p, slug, link]) => `        <div class="belief-row" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px 40px;padding:20px 0;border-bottom:1px solid var(--line-strong)">
          <div style="display:flex;gap:20px;align-items:baseline"><span style="font-family:var(--font-display);font-weight:700;font-size:14px;color:var(--artblue)">${n}</span><h3 style="font-size:24px;line-height:1.2">${esc(h)}</h3></div>
          <div style="display:flex;flex-direction:column;gap:12px"><p style="font-size:16px;line-height:1.7;color:var(--ink-soft)">${esc(p)}</p>${slug ? `<a href="${storyHref(slug)}" style="font-size:14px;font-weight:600">${link}</a>` : ''}</div>
        </div>`).join('\n')}
      </div>
    </div>
  </section>`;

// ---------- E. What ARTPARK is building ----------
const pillBtn = (href, label, color, ext) => `<a class="btn" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''} style="align-self:flex-start;margin-top:auto;background:#fff;color:${color};padding:8px 16px;font-size:13px">${label}</a>`;
const forIncubated = `<span style="align-self:flex-start;margin-top:auto;background:var(--artlight);color:var(--artblue);padding:7px 14px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.1em">FOR INCUBATED COMPANIES</span>`;

const building = `
  <!-- E. What ARTPARK is building -->
  <section id="building" data-screen-label="What we're building" class="reveal" style="padding:clamp(36px,4.5vw,56px) 0;scroll-margin-top:110px">
    <div style="max-width:1180px;margin:0 auto;padding:0 24px">
      <div class="eyebrow-rule">What ARTPARK is building</div>
      <h2 style="font-size:clamp(36px,5vw,56px);line-height:1.05;margin-top:16px">Build. Prototype. Scale.</h2>
      <p style="margin-top:12px;max-width:760px;font-size:17px;line-height:1.7;color:var(--ink-soft);text-wrap:pretty">ARTPARK — the AI &amp; Robotics Technology Park — is a not-for-profit at the Indian Institute of Science, Bengaluru, seed-funded by the Department of Science &amp; Technology under the National Mission on Interdisciplinary Cyber-Physical Systems, and by the Government of Karnataka. Our programs follow the work beyond the breakthrough, in three stages.</p>
      <div class="stage-arrows" style="margin-top:24px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:16px;align-items:center;font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.14em;color:var(--ink-dim)">${['LAB-PROVEN RESEARCH', 'PROTOTYPE &amp; VENTURE', 'SCALE-READY COMPANY'].map((l, i) => `<span class="stage-step" style="--d:${i}"><span class="stage-label">${l}</span><span class="stage-line"></span><span class="stage-end${i === 2 ? ' is-dot' : ''}" aria-hidden="true">${i === 2 ? '' : '→'}</span></span>`).join('')}</div>
          <div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));grid-auto-rows:auto;gap:0 14px;row-gap:16px">
            <div class="tilt stage-col" style="grid-row:span 3;display:grid;grid-template-rows:subgrid;row-gap:0;background:var(--artblue);color:#fff;border-radius:14px;overflow:hidden">
              <div style="padding:30px 28px 22px"><span style="font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.12em;color:var(--artlight)">01 · BUILD</span><h3 style="color:#fff;font-size:32px;margin-top:8px">Make it real.</h3></div>
              <div style="margin:0 12px;padding:20px;background:rgba(255,255,255,0.1);border-radius:10px;display:flex;flex-direction:column;gap:8px"><b style="font-family:var(--font-display);font-size:17px">Technology Innovators in Residence</b><p style="font-size:14px;line-height:1.55;color:rgba(255,255,255,0.85)">IISc labs, full-time residency and a ₹25L non-dilutive first cheque.</p>${pillBtn('https://apply.artpark.info/tir', 'About TIR →', 'var(--artblue)', true)}</div>
              <div style="margin:10px 12px 12px;padding:20px;background:rgba(255,255,255,0.1);border-radius:10px;display:flex;flex-direction:column;gap:8px"><b style="font-family:var(--font-display);font-size:17px">Lab-to-market · ArtLabs</b><p style="font-size:14px;line-height:1.55;color:rgba(255,255,255,0.85)">Research teams meet engineering and industry.</p>${pillBtn(R.programs + '/artlabs', 'About ArtLabs →', 'var(--artblue)', false)}</div>
            </div>
            <div class="tilt stage-col" style="grid-row:span 3;display:grid;grid-template-rows:subgrid;row-gap:0;background:var(--accent-violet);color:#fff;border-radius:14px;overflow:hidden">
              <div style="padding:30px 28px 22px"><span style="font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.12em;color:var(--artlight)">02 · PROTOTYPE</span><h3 style="color:#fff;font-size:32px;margin-top:8px">Make it work.</h3></div>
              <div style="margin:0 12px;padding:20px;background:rgba(255,255,255,0.14);border-radius:10px;display:flex;flex-direction:column;gap:8px"><b style="font-family:var(--font-display);font-size:17px">Venture Incubation Programme</b><p style="font-size:14px;line-height:1.55;color:#fff">Investment, venture-building, customers and pilots.</p>${pillBtn('https://apply.artpark.info/sip', 'About VIP →', 'var(--accent-violet)', true)}</div>
              <div style="margin:10px 12px 12px;padding:20px;background:rgba(255,255,255,0.14);border-radius:10px;display:flex;flex-direction:column;gap:8px"><b style="font-family:var(--font-display);font-size:17px">RDI Scheme</b><p style="font-size:14px;line-height:1.55;color:#fff">R&amp;D and innovation projects moving toward deployment.</p>${pillBtn(R.programs + '/rdi', 'About RDI →', 'var(--accent-violet)', false)}</div>
            </div>
            <div class="tilt stage-col" style="grid-row:span 3;display:grid;grid-template-rows:subgrid;row-gap:0;background:var(--artblack);color:#fff;border-radius:14px;overflow:hidden">
              <div style="padding:30px 28px 22px"><span style="font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.12em;color:var(--artlight)">03 · SCALE</span><h3 style="color:#fff;font-size:32px;margin-top:8px">Make it usable.</h3></div>
              <div style="margin:0 12px;padding:20px;background:rgba(255,255,255,0.08);border-radius:10px;display:flex;flex-direction:column;gap:8px"><b style="font-family:var(--font-display);font-size:17px">Fundraising support</b><p style="font-size:14px;line-height:1.55;color:rgba(255,255,255,0.8)">Preparing for and raising follow-on capital.</p>${forIncubated}</div>
              <div style="margin:10px 12px 12px;padding:20px;background:rgba(255,255,255,0.08);border-radius:10px;display:flex;flex-direction:column;gap:8px"><b style="font-family:var(--font-display);font-size:17px">Manufacturing Centre of Excellence</b><p style="font-size:14px;line-height:1.55;color:rgba(255,255,255,0.8)">Toward repeatable, manufacturable products.</p>${forIncubated}</div>
            </div>
          </div>
      <p style="margin-top:20px;font-size:13px;line-height:1.6;color:var(--ink-dim)">Program terms change between cohorts. Current details are at <a href="https://apply.artpark.info/" target="_blank" rel="noopener">apply.artpark.info</a>.</p>
    </div>
  </section>`;

// ---------- F. Collaborate ----------
const AUDIENCES = [
  ['Researchers', 'You have a lab-proven result and want to find out whether it survives outside the lab.', 'https://apply.artpark.info/tir', 'Apply as an Innovator in Residence →', true],
  ['Startups', "You're incorporated, at TRL 4 or beyond, and the next problem is engineering, validation or scale.", 'https://apply.artpark.info/sip', 'Apply to the incubation program →', true],
  ['Technology builders', 'Engineers and designers who like the middle of the journey — integration, reliability, test rigs, the second and third prototype.', '#contact', 'Introduce yourself →', false],
  ['Industry &amp; public partners', 'You have a real environment and a real problem, and you are willing to test unfinished technology inside it.', '#contact', 'Propose a collaboration →', false],
];
const HOME_ROLES = ['Researcher', 'Startup', 'Builder', 'Industry partner'];
const collaborate = `
  <!-- F. Collaborate -->
  <section id="collaborate" data-screen-label="Work with us" class="reveal" style="background:var(--artblue-deep);color:#fff;padding:clamp(36px,4.5vw,56px) 0;scroll-margin-top:72px">
    <div style="max-width:1180px;margin:0 auto;padding:0 24px">
      <div class="eyebrow-rule" style="color:rgba(255,255,255,0.7)">Work with us</div>
      <h2 style="color:#fff;font-size:clamp(36px,5vw,56px);line-height:1.05;margin-top:16px">Bring us the hard part.</h2>
      <p style="margin-top:20px;max-width:640px;font-size:17px;line-height:1.7;color:rgba(255,255,255,0.85);text-wrap:pretty">We are most useful where a promising result meets a stubborn problem — an integration that won't hold, a test you can't run alone, a cost that doesn't close. If that is where you are, tell us about it.</p>

      <div style="margin-top:24px;border-top:1px solid rgba(255,255,255,0.2)">
${AUDIENCES.map(([h, p, href, label, ext]) => `        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px 40px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.2);align-items:baseline">
          <h3 style="color:#fff;font-size:22px">${h}</h3>
          <p style="font-size:15px;line-height:1.65;color:rgba(255,255,255,0.85)">${esc(p)}</p>
          <a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''} style="color:var(--artlight);font-family:var(--font-display);font-weight:700;font-size:14px;text-decoration:none">${label}</a>
        </div>`).join('\n')}
      </div>

      <div id="contact" style="margin-top:28px;max-width:640px;scroll-margin-top:96px">
        <div data-quick-contact>
          <p style="font-family:var(--font-display);font-weight:700;font-size:20px">Start a conversation.</p>
          <div data-role-group data-value="${HOME_ROLES[0]}" data-on='{"bg":"var(--artlight)","ink":"var(--artblue)","border":"var(--artlight)"}' data-off='{"bg":"transparent","ink":"#fff","border":"rgba(255,255,255,0.35)"}' role="group" aria-label="I am a" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">
${HOME_ROLES.map((r, i) => `            <button type="button" data-role="${r}" aria-pressed="${i === 0}" style="border:1px solid ${i === 0 ? 'var(--artlight)' : 'rgba(255,255,255,0.35)'};background:${i === 0 ? 'var(--artlight)' : 'transparent'};color:${i === 0 ? 'var(--artblue)' : '#fff'};padding:7px 14px;font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.06em;border-radius:2px;cursor:pointer;transition:all 150ms ease">${r}</button>`).join('\n')}
          </div>
          <form data-quick-form data-mailto="connect@artpark.in" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:14px">
            <input type="email" name="email" required placeholder="Your work email" aria-label="Your work email" autocomplete="email" style="flex:1 1 260px;min-width:0;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.25);color:#fff;font:inherit;padding:14px 16px;border-radius:2px">
            <button type="submit" style="background:var(--artlight);color:var(--artblue);border:0;padding:14px 22px;font-family:var(--font-display);font-weight:700;font-size:14px;border-radius:2px;cursor:pointer">Get in touch →</button>
          </form>
        </div>
        <div data-quick-sent hidden style="border:1px solid rgba(255,255,255,0.25);padding:24px 28px">
          <p style="font-family:var(--font-display);font-weight:700;font-size:20px">Thank you.</p>
          <p style="margin-top:8px;font-size:15px;line-height:1.65;color:rgba(255,255,255,0.85)">Your email app should have opened with a note to connect@artpark.in. Send it from there and someone from the ARTPARK team will write back. It helps if your note includes the problem you're stuck on — the more specific, the better.</p>
        </div>
      </div>
    </div>
  </section>`;

// ---------- FAQ (his six categories, verbatim) ----------
const FAQ = [
  ['The basics', [
    ['What makes ARTPARK different?', 'We focus on the work after the breakthrough — engineering, testing, integration and scale — and we do it from inside the Indian Institute of Science, with labs, researchers and industry partners in one place.'],
    ['Is it ever too early to approach ARTPARK?', 'Rarely. If you have a lab-proven result and want to know whether it can survive the real world, that is exactly when to talk to us. Technology Innovators in Residence is built for teams that have not yet formed a company.', 'About TIR →', 'https://apply.artpark.info/tir'],
    ['What does ARTPARK look for in an idea?', 'A differentiated technology, a real problem it could solve, and a team willing to do the unglamorous work of making it dependable, affordable and usable.'],
    ['What size investments does ARTPARK make?', 'TIR begins with a ₹25L non-dilutive first cheque. The Venture Incubation Programme makes direct investments in incorporated startups; amounts depend on stage and need.'],
  ]],
  ['How we work', [
    ['Does ARTPARK take board seats?', 'For companies in the Venture Incubation Programme we may take a board or observer seat, depending on the size and stage of the investment. For TIR teams, we work alongside you rather than on a board.'],
    ['What happens beyond board meetings?', 'Most of the value is in the day-to-day: access to IISc labs and our garage, engineering help, introductions to customers and partners, pilots, and preparing for follow-on fundraising.'],
    ['How do you handle competitive conflicts?', 'We are careful not to back directly competing teams in the same program without telling both, and we keep confidential information within the team working with you.'],
    ['Where does your capital come from?', 'ARTPARK is seed-funded by the Department of Science & Technology under the National Mission on Interdisciplinary Cyber-Physical Systems and by the Government of Karnataka, with project support from industry and philanthropic partners.'],
  ]],
  ['The team', [
    ['How do I know which team member is the best fit?', 'You don’t need to. Apply or write to us and we will route you to the people closest to your technology and stage.', 'Meet the team →', R.team],
    ['Are you hiring?', 'Yes — engineers, researchers and operators, at ARTPARK and at startups hiring through ARTPARK.', 'See open roles →', R.careers],
    ['Where are your offices?', 'Our registered office is in the Entrepreneurship Building at IISc, Bengaluru 560012, and our garage is at 177, HMT Colony, Jalahalli, Bengaluru 560013.', 'Contact details →', R.contact],
  ]],
  ['What we look for', [
    ['What does ARTPARK look for in an idea?', 'Technology that is genuinely differentiated, a clear path to a real-world use, and evidence that it works in the lab — ideally with a sense of what will break when it leaves.'],
    ['How do you weigh different criteria in your decision-making?', 'Team and technology come first, then the problem and the path to market. At early stages we weigh the quality of the evidence more than the size of the market slide.'],
    ['Do you only invest in particular areas or industries?', 'Our roots are in AI, robotics and cyber-physical systems, with work across healthcare, mobility, agriculture, industrial automation and education — but we look at any deep-tech that needs building, testing and scaling.'],
    ['Do you invest outside Bengaluru?', 'Yes. Teams from anywhere in India can apply; residency programs expect you to spend significant time working with us in Bengaluru.'],
    ['Do you invest outside India?', 'Our programs are designed for Indian researchers and Indian-incorporated startups. If you are building abroad and want to work in India, write to us.'],
  ]],
  ['Reaching out', [
    ['What’s the best way to get on your radar?', 'Apply through apply.artpark.info, or write to us with a short note on what you are building and where you are stuck.', 'Go to applications →', 'https://apply.artpark.info/'],
    ['Is it ever too early to approach ARTPARK?', 'Not if you have a lab result worth testing. Early conversations help us both understand what the next stage needs.'],
    ['What if I’m still employed elsewhere?', 'That’s common for researchers. TIR is a full-time residency, so we’ll talk through timing and any institutional permissions before you join.'],
    ['What if I’ve already raised from angels or a pre-seed fund?', 'That’s fine. Startups with prior funding can apply to the Venture Incubation Programme.'],
    ['Do I need customers and revenue?', 'No. For TIR you need lab-proven technology; for VIP a prototype and a pitch-ready proposition. Early pilots help, but are not required.'],
  ]],
  ['The process', [
    ['What does your selection process look like?', 'An online application, a conversation with our team, a technical review with domain experts, and a final presentation. We aim to keep each step short and to tell you clearly where you stand.', 'Start an application →', 'https://apply.artpark.info/'],
    ['How should I prep for the final presentation?', 'Bring evidence: what works today, how you know, and what you need to prove next. Be candid about the risks — we would rather hear them from you.'],
    ['How much do you usually invest?', 'TIR starts with ₹25L, non-dilutive. VIP investments vary by stage and need.'],
    ['Do you have strict ownership requirements?', 'No fixed target. TIR is non-dilutive; VIP terms are discussed with each company.'],
    ['What size rounds do you participate in?', 'Mostly early rounds, with follow-on pathways and fundraising support for incubated companies as they grow.'],
  ]],
];

const faqRow = ([q, a, linkLabel, href], i, ci) => {
  const open = ci === 0 && i === 0;
  const ext = href && href.startsWith('http');
  return `          <div class="faq-item" style="border-bottom:1px solid var(--line-strong)">
            <button type="button" aria-expanded="${open}" aria-controls="faq-${ci}-${i}" id="faq-q-${ci}-${i}" style="width:100%;display:flex;justify-content:space-between;align-items:center;gap:24px;padding:18px 4px;background:none;border:0;cursor:pointer;text-align:left;font-family:var(--font-display);font-weight:700;font-size:clamp(18px,2vw,22px);line-height:1.3;color:var(--ink)">
              <span>${esc(q)}</span>
              <span data-ring style="flex:none;width:44px;height:44px;border-radius:999px;border:1.5px solid ${open ? 'var(--artblue)' : 'var(--ink)'};background:${open ? 'var(--artblue)' : 'transparent'};color:${open ? '#fff' : 'var(--ink)'};display:flex;align-items:center;justify-content:center;font-size:22px;line-height:1;transition:all 150ms ease">${open ? '−' : '+'}</span>
            </button>
            <div id="faq-${ci}-${i}" role="region" aria-labelledby="faq-q-${ci}-${i}"${open ? '' : ' hidden'} style="padding:0 72px 28px 4px;display:flex;flex-direction:column;gap:12px">
              <p style="font-size:16.5px;line-height:1.75;color:var(--ink-soft);text-wrap:pretty">${esc(a)}</p>${linkLabel ? `
              <a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''} style="align-self:flex-start;font-family:var(--font-display);font-weight:700;font-size:14px;text-decoration:none">${linkLabel}</a>` : ''}
            </div>
          </div>`;
};

const faq = `
  <section id="faq" data-screen-label="FAQ" data-faq class="reveal" style="background:var(--paper-soft);padding:clamp(36px,4.5vw,56px) 0;scroll-margin-top:110px">
    <div style="max-width:1000px;margin:0 auto;padding:0 24px">
      <div style="text-align:center;display:flex;flex-direction:column;align-items:center">
        <span style="font-size:11px;font-weight:600;letter-spacing:0.16em;color:var(--ink-dim)">FREQUENTLY ASKED</span>
        <h2 style="font-size:clamp(34px,4.6vw,52px);line-height:1.08;margin-top:12px">Questions, <span class="hl">answered</span>.</h2>
      </div>
      <div role="tablist" aria-label="Question topics" style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:20px;padding-bottom:18px;border-bottom:1px solid var(--line-strong)">
${FAQ.map(([label], ci) => `        <button type="button" role="tab" data-faq-tab="${ci}" aria-selected="${ci === 0}" aria-controls="faq-panel-${ci}" style="border:1px solid ${ci === 0 ? 'var(--artlight)' : 'var(--line-strong)'};background:${ci === 0 ? 'var(--artlight)' : 'var(--paper)'};color:${ci === 0 ? 'var(--artblue)' : 'var(--ink)'};padding:9px 20px;border-radius:999px;font-family:var(--font-display);font-weight:700;font-size:14px;cursor:pointer;transition:all 150ms ease">${esc(label)}</button>`).join('\n')}
      </div>
${FAQ.map(([, items], ci) => `      <div id="faq-panel-${ci}" role="tabpanel" data-faq-panel="${ci}"${ci === 0 ? '' : ' hidden'}>
${items.map((it, i) => faqRow(it, i, ci)).join('\n')}
      </div>`).join('\n')}
    </div>
  </section>`;

module.exports = {
  route: '/',
  html: () => page({
    title: 'ARTPARK — The breakthrough is only the beginning.',
    description: 'ARTPARK, the AI & Robotics Technology Park at IISc Bengaluru, works on what comes after the breakthrough: engineering, testing, integration and scale.',
    active: 'home',
    scripts: ['/js/motion.js'],
    body: opening + carousel + founders + believe + building + collaborate + faq,
  }),
};
