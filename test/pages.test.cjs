// Built-page checks for batch 2. Builds once into dist/ (BUILD_DATE pinned) and reads the HTML.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const build = (env = {}) => execFileSync(process.execPath, ['tools/build.cjs'], { cwd: ROOT, env: { ...process.env, BUILD_DATE: '2026-10-29', ...env }, stdio: 'pipe' });
const page = (route) => fs.readFileSync(path.join(ROOT, 'dist', route, 'index.html'), 'utf8');

test('events: two big upcoming cards, further upcoming events as rows', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pages-'));
  for (const f of ['news', 'tenders']) fs.copyFileSync(path.join(ROOT, 'src/data/outreach', f + '.json'), path.join(dir, f + '.json'));
  const ev = (id, start, o = {}) => ({ id, title: 'Event ' + id, start, end: '', time: '', venue: 'ARTgarage', blurb: 'b', body: [], image: '', imageAlt: '', register: '', recap: '', source: '', placement: 'auto', ...o });
  fs.writeFileSync(path.join(dir, 'events.json'), JSON.stringify([
    ev('one', '2026-11-01', { image: '/assets/site/artgarage-hall.webp' }), ev('two', '2026-11-02', { image: '/assets/site/artgarage-hall.webp' }),
    ev('three', '2026-11-03', { register: 'https://forms.gle/x' }), ev('four', '2026-11-04'), ev('old', '2025-01-01'),
  ]));
  try {
    build({ OUTREACH_DIR: dir });
    const html = page('events');
    const up = html.slice(html.indexOf('>Upcoming<'), html.indexOf('>Past events<'));
    assert.equal((up.match(/class="lift"/g) || []).length, 2);
    assert.equal((up.match(/data-upcoming-row/g) || []).length, 2);
    const rows = up.slice(up.indexOf('data-upcoming-row'));
    assert.equal((rows.match(/Register →/g) || []).length, 1);
    assert.ok(up.indexOf('Event three') < up.indexOf('Event four'));
  } finally {
    build();
  }
});

// ---- batch 2, task 2 ----
test('titles are two-tone', () => {
  build();
  assert.match(page('contact'), /<h1[^>]*>Contact <span class="tt">us\.<\/span><\/h1>/);
  assert.match(page('about/team'), /<h1[^>]*>[^<]*<span class="tt">/);
});

const ROLE_LABELS = ['What research would you like to take further?', 'What does your startup need from us?', 'What would you like to build with us?', 'How would you like to partner with us?', 'What is your story about?'];
test('contact page: Researcher copy by default, every role in the switch data', () => {
  const html = page('contact');
  assert.match(html, /data-role-intro[^>]*>Working on research that could leave the lab\? Tell us about it, and where you want to take it\. Messages go to the ARTPARK team at connect@artpark\.in\./);
  assert.match(html, /data-role-label[^>]*>What research would you like to take further\?</);
  assert.match(html, /placeholder="The problem, where the work stands today, and what would move it forward\."/);
  assert.match(html, /window\.AP_ROLE_COPY=/);
  for (const l of ROLE_LABELS) assert.ok(html.includes(l), l);
});

test('contact page: address text a little smaller', () => {
  const html = page('contact');
  assert.match(html, /font-family:var\(--font-display\);font-size:16px">Indian Institute of Science</);
  assert.match(html, /<p style="font-size:14px;line-height:1\.6;color:var\(--ink-soft\)">Ground Floor/);
});

// User (2026-10-29): DST and Government of Karnataka take Google's and Bosch's prominent spots, emblems shown larger.
test('partnerships: DST and Karnataka in the prominent spots, emblems larger', () => {
  const stage = page('partnerships').match(/<div class="float-stage"[\s\S]*?<\/div><\/div>/)[0];
  const chips = [...stage.matchAll(/<img src="([^"]+)" alt=""( style="max-height:(\d+)px")?/g)].map((m) => [m[1].split('/').pop().replace('.webp', ''), +m[3] || 0]);
  assert.deepEqual(chips.map((c) => c[0]), ['google', 'bosch', 'indian-institute-of-science', 'government-of-karnataka', 'nvidia', 'sponsor-dst-dark.png', 'ministry-of-heavy-industries', 'startup-karnataka']); // dark DST logo, manager 2026-11-19
  for (const [name, h] of chips) if (/sponsor-dst|government-of-karnataka|indian-institute/.test(name)) assert.ok(h >= 52, name);
  const hl = [...stage.matchAll(/<div class="fl fl-chip is-hl"[^>]*><span><img src="([^"]+)"/g)].map((m) => m[1].split('/').pop().replace('.webp', ''));
  assert.deepEqual(hl.sort(), ['government-of-karnataka', 'sponsor-dst-dark.png']);
});

test('contact page: choosing a role changes the copy (browser)', { skip: !process.env.ARTPARK_PLAYWRIGHT && 'ARTPARK_PLAYWRIGHT not set' }, async () => {
  const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT);
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const p = await b.newPage();
    await p.goto('http://127.0.0.1:3010/contact');
    await p.click('[data-role="Startup"]');
    assert.equal(await p.textContent('[data-role-label]'), 'What does your startup need from us?');
    assert.match(await p.getAttribute('textarea[name=message]', 'placeholder'), /^Your product, its stage/);
    assert.match(await p.textContent('[data-role-intro]'), /^Building a deep-tech startup\?/);
  } finally { await b.close(); }
});

test('news: floating chips show the outlets\' logos', () => {
  build();
  const stage = page('news').match(/<div class="float-stage"[\s\S]*?<\/div><\/div>/)[0];
  assert.deepEqual([...stage.matchAll(/<img src="\/assets\/outlets\/([^".]+)\.webp"/g)].map((m) => m[1]),
    ['economic-times', 'forbes-india', 'mint', 'deccan-herald', 'moneycontrol', 'hindustan-times']);
  for (const f of ['economic-times', 'forbes-india', 'mint', 'deccan-herald', 'moneycontrol', 'hindustan-times']) assert.ok(fs.existsSync(path.join(ROOT, 'public/assets/outlets', f + '.webp')), f);
});

// Chrome 156 renderer crash ("Aw, Snap! Error code 5") when a hidden hero slide is shown: the scroll-reveal
// clip-path animation on its image, under the masked and filtered media box, takes the tab down.
test('home hero slider images opt out of the scroll-reveal image animation', () => {
  execFileSync(process.execPath, ['tools/build.cjs'], { cwd: ROOT, stdio: 'pipe' });
  const html = fs.readFileSync(path.join(ROOT, 'dist', 'index.html'), 'utf8');
  assert.match(html, /<div class="hero-slides"[^>]*data-ap-noimg/);
});

// User (2026-10-31): the home page is the Claude Design file ("ARTPARK Home.html") exactly: painted
// historical stories, no stat band, no founder quotes. The story articles are not on the site, so the
// "Read the story" buttons are left out and the tiles and belief links go to the slider.
test('home matches the design: historical stories, painted art, no stats or founder quotes', () => {
  build();
  const html = page('');
  const h2 = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => m[1].replace(/<[^>]+>/g, ''));
  assert.deepEqual(h2.slice(0, 3), ['The light bulb was only the beginning.', 'From computational biology to a business built on science.', 'GPS became much more than a way to find your location.']);
  assert.ok(!h2.includes('In their own words.'));
  assert.ok(!html.includes('id="founders"') && !html.includes('stat-band'));
  assert.match(html, /These are historical case studies\. ARTPARK was not involved in any of them\./);
  assert.match(html, /Hover over a picture or a label to see what each kind of work means\./);
  assert.match(html, /Edison's three-wire distribution scheme sharply reduced the copper needed/);
  assert.deepEqual([...html.matchAll(/data-go="\d"[^>]*>([^<]+)<span class="tab-progress[ "]/g)].map((m) => m[1]), ['Light bulb', 'Strand', 'GPS']); // numbering removed, manager 2026-11-19
  const art = [...new Set([...html.matchAll(/\/assets\/art\/([\w-]+\.jpg)/g)].map((m) => m[1]))];
  assert.ok(art.length >= 9, 'painted art: ' + art.length);
  for (const f of art) assert.ok(fs.existsSync(path.join(ROOT, 'public', 'assets', 'art', f)), f);
  // Manager (2026-11-05): as in the design, the series links open the three long stories.
  assert.deepEqual([...html.matchAll(/<a class="btn btn-primary" href="([^"]+)"[^>]*>Read the story/g)].map((m) => m[1]), ['/stories/light-bulb', '/stories/strand', '/stories/gps']);
  assert.deepEqual([...html.matchAll(/<a href="([^"]+)"[^>]*>From the [^<]+ story →/g)].map((m) => m[1]), ['/stories/light-bulb', '/stories/strand', '/stories/gps']);
  for (const slug of ['light-bulb', 'strand', 'gps']) assert.ok(fs.existsSync(path.join(ROOT, 'dist', 'stories', slug, 'index.html')), slug);
});

// Manager (2026-11-12, Claude Design export "ARTPARK website v2.html"): home labels above the pictures, site-wide
// header/footer changes, About without sub-tabs, "Our programs" with TIR and VIP, the RDI Scheme page, tenders without Type.
test('manager changes of 2026-11-12', () => {
  build();
  const home = page('');
  // 2026-11-16: his newer Home (no eyebrow, no buttons under the collage) supersedes these two points.
  const chips = home.indexOf('class="collage-chips"'), stage = home.indexOf('class="collage-stage"');
  assert.ok(chips > 0 && chips < stage, 'labels above the pictures');
  for (const route of ['', 'tenders', 'about/programs/tir']) {
    const html = page(route);
    assert.ok(!html.includes('Technology Park · IISc Bengaluru</span>'), route + ': no tagline in the top bar');
    assert.ok(!html.includes('Founder stories are drawn from ARTPARK interviews'), route);
    assert.match(html, /aria-label="ARTPARK on LinkedIn"/);
    assert.ok(!html.includes('Other Programs') && !html.includes('Other programs'), route);
  }
  // Manager (2026-11-16): no tab rows under About or Outreach titles (user agreed).
  for (const route of ['about/team', 'about/approach', 'about/facilities', 'about/introduction', 'about/programs', 'events', 'news', 'tenders']) assert.ok(!page(route).includes('class="sub-tabs"'), route);
  assert.match(page('about/focus-areas'), /Domains we work in[\s\S]*Horizontal capabilities we back/);
  assert.ok(!page('about/facilities').includes('BRAINz campus</div>'));
  const programs = page('about/programs');
  assert.match(programs, /<h1[^>]*>Our <span class="tt">programs\.<\/span><\/h1>/);
  assert.deepEqual([...programs.matchAll(/<a id="([\w-]+)" class="prog-row"/g)].map((m) => m[1]), ['artlabs', 'advanced-robotics', 'industry-5', 'wired-wireless', 'academy', 'tir', 'vip', 'rdi', 'social-impact', 'health', 'language']); // manager 2026-11-19
  assert.match(programs, /RDI Scheme · Focused Research Organisation/);
  assert.match(page('about/programs/tir'), /<a class="btn btn-primary" href="\/apply">Apply for TIR/);
  assert.match(page('about/programs/vip'), /<a class="btn btn-primary" href="\/apply">Apply for VIP/);
  assert.ok(!page('tenders').includes('>TYPE</span>'));
});

// User (2026-11-13): his RDI form sent nothing. It opens the email app to connect@artpark.in like the other forms,
// with a link to the pitch deck in place of an upload (an email app cannot attach files).
test('RDI express-interest form hands off to the email app', () => {
  const html = page('about/programs/rdi');
  assert.match(html, /ARTPARK now deploys the <span class="hl">RDI Scheme<\/span>/);
  assert.ok(!html.includes('type="file"'));
  assert.match(html, /<input id="rdi-deck" name="deck" type="url"[^>]*required/);
  assert.match(html, /mailto:connect@artpark\.in\?subject='\+encodeURIComponent\('RDI interest: '/);
  assert.match(html, /Your email app should have opened with your details addressed to connect@artpark\.in\./);
  assert.ok(!html.includes('We\'ve received your details'));
});

// User (2026-11-14): no links to apply.artpark.info (applying and signing in open /apply, "in progress");
// TIR/VIP links go to the program pages; footer description; Team page is the Editorial design with the fixes.
test('changes of 2026-11-14', () => {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.html') ? [path.join(d, e.name)] : []);
  for (const f of walk(path.join(ROOT, 'dist'))) if (!f.includes(path.sep + 'admin' + path.sep)) assert.ok(!fs.readFileSync(f, 'utf8').includes('apply.artpark.info'), f);
  assert.match(page('apply'), /We are working <span class="tt">on it\.<\/span>/);
  assert.match(page(''), /href="\/apply" style="color:#fff;text-decoration:none;font-weight:600">Sign in</);
  assert.match(page(''), /ARTPARK \(AI &amp; Robotics Technology Park\) is a not-for-profit Section-8 company at the Indian Institute of Science, Bangalore, committed to building and deploying AI &amp; Robotics technologies for Society, Economy, and Sovereignty\./);
  const programs = page('about/programs');
  // 2026-11-16: painted versions of the TIR and VIP photographs (manager).
  assert.match(programs, /<a id="tir" class="prog-row" href="\/about\/programs\/tir"[^>]*><div class="prog-img"><img src="\/assets\/art\/prog-tir\.jpg"/);
  assert.match(programs, /<a id="vip" class="prog-row" href="\/about\/programs\/vip"[^>]*><div class="prog-img"><img src="\/assets\/art\/prog-vip\.jpg"/);
  const team = page('about/team');
  // Manager (2026-11-19 design): his Team page, board first, then the leadership team, then the hub governing board.
  const text = team.replace(/<[^>]+>/g, '\n').split('\n').map((t) => t.trim()).filter(Boolean);
  const at = (t) => text.indexOf(t);
  assert.ok(at('Board of directors.') > 0 && at('Board of directors.') < at('Innovation and programs team.') && at('Innovation and programs team.') < at('Hub governing board.'));
  for (const who of ['Manjunath Krishnaswamy', 'Sailaja Gudla', 'Raghu Dharmaraju', 'Nirav Dedhia']) assert.ok(at(who) > 0, who);
  assert.ok(!/Research advisory board|Executive advisors/.test(team));
  assert.ok(fs.existsSync(path.join(ROOT, 'public', 'assets', 'team-page', 'portraits-wc.webp')));
  assert.ok(!/Sheela/i.test(team) && !team.includes('tv2') && !team.includes('tv-switch'));
  for (const v of ['v1', 'v2', 'v3', 'versions']) assert.ok(!fs.existsSync(path.join(ROOT, 'dist', 'about', 'team', v)), v);
  assert.match(team, /href="https:\/\/www\.linkedin\.com\/in\/niravdedhia\/"/);
  for (const route of ['about/facilities', 'about/programs']) assert.match(page(route), /class="float-stage"/, route);
  assert.ok(!team.includes('class="float-stage"'), 'team intro has no floating windows');
});

// User (2026-11-14): richer News with a year filter; ARTGarage spelling; Calibrate venue without "the^delta".
test('news archive, ARTGarage spelling, events venue', () => {
  const news = page('news');
  const rows = (news.match(/<div class="link-row" data-row-year="news:\d{4}"/g) || []).length;
  assert.ok(rows >= 80, 'news rows: ' + rows);
  assert.match(news, /data-years="news">[\s\S]*?data-year="All" aria-pressed="true"/);
  assert.match(news, /12 October 2026 · The Economic Times[\s\S]{0,400}?InterSafe/);
  assert.match(news, />1 June 2021 · ET Healthworld/);
  assert.ok(!/>0\d [A-Z][a-z]+ \d{4} · /.test(news), 'no zero-padded day numbers');
  for (const r of ['events', 'about/facilities', 'about/facilities/artgarage', 'contact']) assert.ok(!page(r).includes('ARTgarage'), r);
  assert.ok(!page('events').includes('the^delta'));
  const ev = page('events');
  assert.match(ev, /data-years="events">/);
  for (const y of ['2022', '2023', '2024', '2025', '2026']) assert.match(ev, new RegExp('data-row-year="events:' + y + '"'), y);
});

// Manager (2026-11-16, design-canvas static export): rebuilt Home and Approach, new Focus Areas and Work-in-progress
// pages imported verbatim; Home-only header buttons; Focus Areas in the About menu; painted Facilities images;
// loading curtain shows the lockup. Our links stay root-relative without trailing slashes, and documents stay local.
test('manager changes of 2026-11-16', () => {
  build();
  const home = page('');
  assert.match(home, /One breakthrough\. Nine more things it took\./);
  assert.match(home, /data-chip="9"[^>]*>TEAM</);
  assert.ok(!home.includes('INSPIRING STORIES FORMING OUR BELIEF'));
  assert.match(home, /It is true deep-touch venture building\./);
  const hdr = (h) => h.slice(h.indexOf('<header'), h.indexOf('</header>'));
  assert.match(hdr(home), /site-cta" href="#building"[^>]*>What we build<\/a>[\s\S]*site-cta" href="#collaborate"[^>]*>Work with us<\/a>/);
  for (const r of ['about/team', 'events', 'stories/light-bulb']) assert.ok(!hdr(page(r)).includes('site-cta'), r);
  assert.match(hdr(page('about/team')), /href="\/about\/focus-areas"[\s\S]*?>Focus Areas<\/span>[\s\S]*?Domains and capabilities we back/);
  assert.match(hdr(home), /data-menu="programs"[\s\S]*?>ArtLabs<[\s\S]*?>Technology Innovator in Residence<[\s\S]*?>Venture Incubation Programme<[\s\S]*?>RDI Scheme<[\s\S]*?>Social Impact<[\s\S]*?All programs/);
  assert.match(page('about/approach'), /We measure progress in <b[^>]*>xRL<\/b>/);
  assert.match(page('about/focus-areas'), /<h1[^>]*>Where we <span class="hl">work/);
  assert.match(page('work-in-progress'), /<body data-ready-by="2026-11-20T18:00">/);
  assert.match(page('work-in-progress'), /data-cd="d"/);
  assert.match(page('about/facilities'), /\/assets\/art\/fac-drone-lab\.jpg/);
  for (const r of ['', 'about/approach', 'about/focus-areas', 'work-in-progress']) {
    const h = page(r);
    assert.ok(!h.includes('artparkin.vercel.app'), r);
    assert.ok(!/href="\/[^"#?]+\/"/.test(h), r + ': no trailing-slash links');
    for (const m of h.matchAll(/\/assets\/art\/[\w.-]+/g)) assert.ok(fs.existsSync(path.join(ROOT, 'public', m[0])), m[0]);
  }
  assert.match(fs.readFileSync(path.join(ROOT, 'public', 'css', 'site.css'), 'utf8'), /\.ap-curtain-label \{[^}]*artpark-iisc-lockup\.webp/);
  const v = require(path.join(ROOT, 'vercel.json')).redirects;
  assert.ok(!v.some((r) => r.source === '/publications/:path*'), 'our publication pages are not redirected away');
  assert.ok(v.some((r) => r.source === '/publications/llm-landscape-for-lmics' && r.destination === '/publications/llm-landscape-lmics'));
});

// Manager (2026-11-19): pages not finished show the countdown on artpark.in and artparkin.vercel.app alike; pages he
// merged redirect to their new homes.
test('manager changes of 2026-11-19: countdown on both public sites, merged pages redirect', () => {
  const v = require(path.join(ROOT, 'vercel.json')).redirects;
  assert.deepEqual([...new Set(v.filter((r) => r.has).map((r) => r.has[0].value))].sort(), ['artpark.in', 'artparkin.vercel.app', 'www.artpark.in']);
  assert.ok(v.filter((r) => r.has).every((r) => /^\/work-in-progress/.test(r.destination) && !r.permanent));
  // First matching rule for a host, as Vercel applies them.
  const countdown = (host, p) => { const r = v.filter((x) => x.has && x.has[0].value === host).find((x) => new RegExp('^/(?:' + x.source.match(/^\/:path\((.*)\)$/)[1] + ')$').test(p)); return r ? r.destination : null; }; // alternatives grouped, as path-to-regexp does
  for (const host of ['artpark.in', 'www.artpark.in', 'artparkin.vercel.app']) {
    for (const p of ['/projects/prism-h', '/publications/llm-landscape-lmics', '/stories/acceleration-robotics']) assert.equal(countdown(host, p), '/work-in-progress', host + p);
    // Nirav (2026-11-20): the Programs overview, ArtLabs and Social Impact until Monday 23 Nov.
    for (const p of ['/about/programs', '/about/programs/artlabs', '/about/programs/social-impact']) assert.equal(countdown(host, p), '/work-in-progress/programs', host + p);
    // Nirav (2026-11-20): Tenders and Careers 15 days, Sign in 30 days.
    for (const p of ['/tenders', '/careers', '/careers/embedded-engineer-heed']) assert.equal(countdown(host, p), '/work-in-progress/' + p.split('/')[1], host + p);
    assert.equal(countdown(host, '/apply'), '/work-in-progress/sign-in');
    // Nirav (2026-11-20): Approach, TIR, VIP and RDI are live.
    for (const p of ['/', '/about/introduction', '/about/approach', '/about/programs/tir', '/about/programs/vip', '/about/programs/rdi', '/about/team', '/about/focus-areas', '/about/facilities', '/about/facilities/artgarage', '/portfolio', '/stories/flo-mobility', '/partnerships', '/contact', '/events', '/news', '/privacy-policy', '/work-in-progress', '/work-in-progress/tenders', '/work-in-progress/sign-in']) assert.equal(countdown(host, p), null, 'live: ' + host + p);
  }
  for (const [r, at] of [['work-in-progress/tenders', '2026-12-05T18:00'], ['work-in-progress/careers', '2026-12-05T18:00'], ['work-in-progress/sign-in', '2026-12-20T18:00'], ['work-in-progress/programs', '2026-11-23T18:00']]) assert.match(page(r), new RegExp('<body data-ready-by="' + at + '">'), r);
  const to = (s) => (v.find((r) => r.source === s && !r.has) || {}).destination;
  assert.equal(to('/about/certifications'), '/about/introduction#certifications');
  assert.equal(to('/about/programs/health'), '/about/programs/social-impact#health');
  assert.equal(to('/about/programs/academy'), '/about/programs/artlabs#academy');
  // Old-URL and merged-page redirects come before the countdown rules.
  assert.ok(v.findIndex((r) => r.has) > v.findIndex((r) => r.source === '/about/programs/language'));
  for (const r of ['about/introduction', 'about/programs/social-impact']) assert.ok(fs.existsSync(path.join(ROOT, 'dist', r, 'index.html')), r);
  for (const r of ['about/certifications', 'about/programs/health', 'about/programs/advanced-robotics']) assert.ok(!fs.existsSync(path.join(ROOT, 'dist', r, 'index.html')), r);
  const contact = page('contact');
  assert.match(contact, /SUPPORTED BY<\/span>\s*<img src="\/assets\/brand\/sponsor-dst\.png"/);
  // Partnerships forms: a chip group's label is in its wrapper; looking inside the group threw and no form sent.
  const js = fs.readFileSync(path.join(ROOT, 'public', 'js', 'site.js'), 'utf8');
  assert.match(js, /el\.hasAttribute\('data-chips'\) \? el\.parentElement : el\.closest\('div'\)/);
  assert.ok((page('partnerships').match(/data-chips="/g) || []).length >= 5, 'the forms still have chip groups');
  assert.ok(!contact.includes('/about/certifications'));
});
