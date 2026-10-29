// Portfolio matches the ARTPARK Start Up portfolio 2026 (36 startups), with the user-approved domains.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const C = require('../src/data/content.cjs');

const DOMAINS = {
  'Industry 5.0': ['twara-robotics', 'kinesthetiq', 'nextoar', 'flo-mobility', 'contrivation-labs', 'spacyphy', 'sakar-robotics', 'open-science-stack', 'edgeverse', 'scivision-ai'],
  'Defence & Aerospace': ['comrado-aerospace', 'yaanendriya', 'algobotix', 'automind-dynamics', 'astrome', 'algofet', 'guerin-technologies', 'hyflex-mobility', 'vishvasys-aerospace', 'q-axis-motors', 'qosmic', 'nxtqube', 'idle-robotics', 'a-thon'],
  'Foundational Models': ['zenteiq', 'kinesthetiq', 'nextoar', 'venomics-ai', 'arborum-labs'],
  Robotics: ['twara-robotics', 'yaanendriya', 'uncharted-ai', 'automind-dynamics', 'strider-robotics', 'flo-mobility', 'charukesi-health', 'sakar-robotics', 'acceleration-robotics', 'dexsent-robotics', 'idle-robotics'],
  MedTech: ['strideaide', 'charukesi-health', 'floaid', 'venomics-ai', 'open-science-stack', 'udot'],
  'Climate Tech': ['rootsgoods', 'hyflex-mobility', 'contrivation-labs'],
  'Wired & Wireless': ['astrome', 'guerin-technologies', 'qosmic', 'arborum-labs'],
};
const ALL = [...new Set(Object.values(DOMAINS).flat())].sort();

test('exactly the 36 startups of the 2026 portfolio', () => {
  assert.equal(ALL.length, 36);
  assert.deepEqual(C.portfolio.map((c) => c.slug).sort(), ALL);
});

test('domains: the approved mapping, 1–2 each, in the domain list', () => {
  assert.deepEqual(C.DOMAIN_LIST, Object.keys(DOMAINS));
  for (const c of C.portfolio) {
    assert.ok(c.domains.length >= 1 && c.domains.length <= 2, c.slug);
    assert.ok(c.domains.every((d) => C.DOMAIN_LIST.includes(d)), c.slug);
    assert.equal(c.programme, '');
  }
  for (const [d, slugs] of Object.entries(DOMAINS)) {
    assert.deepEqual(C.portfolio.filter((c) => c.domains.includes(d)).map((c) => c.slug).sort(), [...slugs].sort(), d);
  }
});

test('new startups use the PDF copy; existing cards keep theirs; every logo exists', () => {
  const by = Object.fromEntries(C.portfolio.map((c) => [c.slug, c]));
  assert.equal(by['idle-robotics'].oneLiner, 'GPS-independent navigation for robots and drones, using sensor fusion and on-device AI.');
  assert.equal(by['venomics-ai'].oneLiner, 'AI drug discovery that mines venom biodiversity for therapeutic peptides.');
  assert.equal(by['arborum-labs'].oneLiner, 'Physics-grounded world models that let AI agents plan and run telecom and power networks.');
  assert.equal(by['arborum-labs'].website, 'https://arborum.ai');
  assert.equal(by['acceleration-robotics'].oneLiner, 'Hardware brains that speed up a robot’s operation.');
  for (const c of C.portfolio) assert.ok(fs.existsSync(path.join(ROOT, 'public', c.logo)), c.logo);
});

test('home rail keeps 8 founders, none removed', () => {
  const s = require('../src/data/stories.json');
  assert.equal(s.rail.length, 8);
  const slugs = s.rail.map((r) => r.slug);
  assert.ok(!slugs.includes('niral-networks'));
  assert.ok(slugs.every((slug) => ALL.includes(slug)));
});

test('no link or file for a removed startup anywhere in the built site', () => {
  execFileSync(process.execPath, ['tools/build.cjs'], { cwd: ROOT, stdio: 'pipe' });
  const dist = path.join(ROOT, 'dist');
  const hits = [];
  for (const f of fs.readdirSync(dist, { recursive: true })) {
    if (/niral-networks|velastra|versor-robotics/.test(f)) hits.push(f);
    if (f.endsWith('.html') && /niral-networks|stories\/velastra|versor-robotics/.test(fs.readFileSync(path.join(dist, f), 'utf8'))) hits.push(f + ' (content)');
  }
  assert.deepEqual(hits, []);
  const v = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  for (const s of ['niral-networks', 'velastra', 'versor-robotics']) assert.ok(v.redirects.some((r) => r.source === `/stories/${s}` && r.destination === '/portfolio'), s);
});

test('portfolio floating logos are the six chosen startups', () => {
  const html = fs.readFileSync(path.join(ROOT, 'dist', 'portfolio', 'index.html'), 'utf8');
  const stage = html.match(/<div class="float-stage"[\s\S]*?<\/div><\/div>/)[0];
  assert.deepEqual([...stage.matchAll(/<img src="\/assets\/logos\/([^".]+)/g)].map((m) => m[1]), ['twara-robotics', 'comrado-aerospace', 'yaanendriya', 'kinesthetiq', 'uncharted-ai', 'strider-robotics']);
});
