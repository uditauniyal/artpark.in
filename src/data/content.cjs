// All site content, assembled from verified sources.
// - artpark.in (captured 2026-10-24 into research/artpark-in/) is the source of truth for facts.
// - source/recovered-content.json + source/collections.json: records recovered from artpark.in,
//   artparkcareers.in and LinkedIn by the earlier build, each with its source URL.
// Anything Claude wrote itself is logged in notes/draft-copy-log.md.
const fs = require('fs');
const path = require('path');
const rec = require('./source/recovered-content.json');
const col = require('./source/collections.json');

const slugify = (s) => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------------- People (artpark.in/team, artpark.in/boards-advisors) ----------------
const people = {
  leadership: rec.team.map((p) => ({ name: p.name.replace(/^Prof /, 'Prof. '), role: p.role, portrait: p.portrait, source: p.sourceUrl })),
  // Roles condensed to his "Role · Affiliation" pattern from the artpark.in text.
  governing: [
    ['Prof. Govindan Rangarajan', 'Chair, Hub Governing Board · Director, IISc'],
    ['Dr. N. Manjula, IAS', 'Secretary, Dept. of Electronics, IT, BT and S&T · Government of Karnataka'],
    ['Prof. B. Gurumoorthy', 'Chief Executive · Society for Innovation & Development, IISc'],
    ['Prof. A. Paulraj', 'Emeritus Professor · Stanford University'],
    ['Dr. Navakanta Bhat', 'Dean, Division of Interdisciplinary Research · IISc'],
    ['Prof. Daniela Rus', 'Professor & Director, CSAIL · MIT'],
    ['Mr. Prashanth Prakash', 'Partner · Accel'],
    ['Dr. Ekta Kapoor', 'Mission Director, NM-ICPS · DST, Government of India'],
    ['Mr. Vipin Sondhi', 'Former MD and CEO · Ashok Leyland'],
    ['Mr. Guruprasad Mudlapur', 'Joint MD & CTO · Bosch Ltd.'],
  ].map(([name, role]) => ({ name, role })),
  research: [
    ['Prof. Yadati Narahari', 'Professor of Computer Science · IISc'],
    ['Mr. Kumar N. Sivarajan', 'CTO · Tejas Networks'],
    ['Dr. Venkat Padmanabhan', 'Deputy Managing Director · Microsoft Research India'],
  ].map(([name, role]) => ({ name, role })),
  // artpark.in lists "Prashanath Prakash" (typo) and gives no roles for directors.
  directors: [
    { name: 'Prof. Bharadwaj Amrutur', role: 'Director' },
    { name: 'Mr. Prashanth Prakash', role: 'Director' },
    { name: 'Dr. Navakanta Bhat', role: 'Director' },
    { name: 'Prof. Govindan Rangarajan', role: 'Director' },
    { name: 'Prof. Anil Parameswaran Sarala Kumar', role: 'Director' },
  ],
  advisors: [
    ['Dr. Vijay Chandru', "Co-founder and Director, Strand Life Sciences · Commissioner, Lancet Citizen's Commission"],
    ['Dr. P. Anandan', 'AI scientist and leader'],
    ['Utkarsh (UT)', 'Xmplify.tech · former Chief Architect, Flipkart'],
    ['Mr. Vijay Vujjini', 'CTO · Centre for Digital Public Infrastructure'],
    ['Dr. Anurag Srivastava', 'Executive Advisor, Startups · CAMRAS (MHI) Program Head'],
  ].map(([name, role]) => ({ name, role })),
  source: 'https://www.artpark.in/boards-advisors',
};
// Portraits as published on artpark.in/team and /boards-advisors (same order), LinkedIn links as linked there.
const PR = (n, i) => '/assets/recovered/portrait-' + n + '-' + i + '.webp';
[['prof-govindan-rangarajan', 0], ['dr-n-manjula-ias-officer', 1], ['prof-b-gurumoorthy', 2], ['prof-a-paulraj', 3], ['dr-navakanta-bhat', 4], ['prof-daniela-rus', 5], ['mr-prashanth-prakash', 6], ['dr-ekta-kapoor', 7], ['vipin-sondhi', 8], ['guruprasad-mudlapur', 9]].forEach(([n, i], k) => { people.governing[k].portrait = PR(n, i); });
[['prof-yadati-narahari', 10], ['kumar-n-sivarajan', 11], ['venkat-padmanabhan', 12]].forEach(([n, i], k) => { people.research[k].portrait = PR(n, i); });
[['prof-bharadwaj-amrutur', 13], ['prashanath-prakash', 14], ['dr-navakanta-bhat', 15], ['prof-govindan-rangarajan', 16], ['prof-anil-parameswaran-sarala-kumar', 17]].forEach(([n, i], k) => { people.directors[k].portrait = PR(n, i); });
[['dr-vijay-chandru', 18, 'https://www.linkedin.com/in/vijaychandru/'], ['dr-p-anandan', 19, 'https://www.linkedin.com/in/panandan/'], ['utkarsh-ut', 20, 'https://www.linkedin.com/in/ut-utkarsh/'], ['vijay-vujjini', 21, 'https://www.linkedin.com/in/vvujjini/'], ['dr-anurag-srivastava', 22, 'https://www.linkedin.com/in/anurag-srivastava-b65567/']].forEach(([n, i, l], k) => { people.advisors[k].portrait = PR(n, i); people.advisors[k].linkedin = l; });
['https://www.linkedin.com/in/amrutur/', 'https://www.linkedin.com/in/raghuramd/', 'https://www.linkedin.com/in/sheela-prabhakar-18562116b/'].forEach((l, k) => { people.leadership[k].linkedin = l; });

// ---------------- Portfolio (the ARTPARK Start Up portfolio 2026, 36 startups) ----------------
// Company names, one-liners and logos come from artpark.in for the 33 listed there; the 3 newer ones are
// written from their pages in the 2026 portfolio PDF. Startups are added and removed here, in code.
// Domains: the user-approved mapping (2026-10-29), one or two per company. Programme (TIR / VIP) is empty
// until the user supplies it.
const DOMAINS = {
  'Industry 5.0': ['twara-robotics', 'kinesthetiq', 'nextoar', 'flo-mobility', 'contrivation-labs', 'spacyphy', 'sakar-robotics', 'open-science-stack', 'edgeverse', 'scivision-ai'],
  'Defence & Aerospace': ['comrado-aerospace', 'yaanendriya', 'algobotix', 'automind-dynamics', 'astrome', 'algofet', 'guerin-technologies', 'hyflex-mobility', 'vishvasys-aerospace', 'q-axis-motors', 'qosmic', 'nxtqube', 'idle-robotics', 'a-thon'],
  'Foundational Models': ['zenteiq', 'kinesthetiq', 'nextoar', 'venomics-ai', 'arborum-labs'],
  Robotics: ['twara-robotics', 'yaanendriya', 'uncharted-ai', 'automind-dynamics', 'strider-robotics', 'flo-mobility', 'charukesi-health', 'sakar-robotics', 'acceleration-robotics', 'dexsent-robotics', 'idle-robotics'],
  MedTech: ['strideaide', 'charukesi-health', 'floaid', 'venomics-ai', 'open-science-stack', 'udot'],
  'Climate Tech': ['rootsgoods', 'hyflex-mobility', 'contrivation-labs'],
  'Wired & Wireless': ['astrome', 'guerin-technologies', 'qosmic', 'arborum-labs'],
};
const DOMAIN_LIST = Object.keys(DOMAINS);
const domainsOf = (slug) => DOMAIN_LIST.filter((d) => DOMAINS[d].includes(slug));
// Not in the 2026 portfolio.
const REMOVED = ['niral-networks', 'velastra', 'versor-robotics'];
const ADDED = [
  { slug: 'idle-robotics', name: 'Idle Robotics', oneLiner: 'GPS-independent navigation for robots and drones, using sensor fusion and on-device AI.', website: 'https://idlerobotics.com' },
  { slug: 'venomics-ai', name: 'Venomics AI', oneLiner: 'AI drug discovery that mines venom biodiversity for therapeutic peptides.', website: 'https://venomics.ai' },
  { slug: 'arborum-labs', name: 'Arborum Labs', oneLiner: 'Physics-grounded world models that let AI agents plan and run telecom and power networks.', website: 'https://arborum.ai' },
];
// One-liners exactly as on artpark.in, with scrape artefacts cleaned.
const ONE_LINER_FIX = {
  'a-thon': 'All-terrain assisted autonomous vehicles.',
  qosmic: 'Building space-based optical communications infrastructure.',
  nextoar: 'Agentic AI for continuous operational excellence.',
  'q-axis-motors': 'Integrated electro-optical payloads for defence and aerospace.',
};
const NAME_FIX = { qosmic: 'QOSMIC' };
const portfolio = [
  ...rec.portfolio.filter((c) => !REMOVED.includes(c.id)).map((c) => ({
    slug: c.id,
    name: NAME_FIX[c.id] || c.name,
    oneLiner: ONE_LINER_FIX[c.id] || c.description.replace(/\s+/g, ' ').trim().replace(/([^.])$/, '$1.'),
    website: c.url || '',
    source: c.sourceUrl,
  })),
  ...ADDED.map((c) => ({ ...c, source: 'Start Up portfolio 2026 (PDF)' })),
].map((c) => ({ ...c, logo: '/assets/logos/' + c.slug + '.webp', domains: domainsOf(c.slug), programme: '' }))
  .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

// ---------------- Partners (artpark.in/partnerships; grouping by Claude, see corrections-log) ----------------
const PARTNER_GROUP = {
  Government: ['Department of Science & Technology', 'Government of Karnataka', 'Ministry of Heavy Industries', 'Office of the Principal Scientific Adviser', 'Indian Council of Medical Research', 'Atal Innovation Mission', 'Karnataka Digital Economy Mission', 'KTech', 'Startup Karnataka', 'C-DAC', 'NTPC'],
  Industry: ['Google', 'Amazon Web Services', 'NVIDIA', 'Bosch', 'Volvo', 'Airtel', 'Flipkart', 'WhatsApp', 'Niramai'],
  'Academic & philanthropic': ['Indian Institute of Science', 'MIT', 'Aalto University', 'IIT Kanpur', 'IIT Jodhpur', 'AIIMS Raipur', 'BML Munjal University', 'Uttarakhand Technical University', 'Dr. H. N. Science Centre', 'Bill & Melinda Gates Foundation', 'Rockefeller Foundation', 'EkStep'],
};
const partnerByName = Object.fromEntries(col.partners.map((p) => [p.name.toLowerCase(), p]));
const partners = Object.entries(PARTNER_GROUP).map(([label, names]) => ({
  label,
  items: names.map((n) => {
    const p = partnerByName[n.toLowerCase()] || col.partners.find((x) => x.name.toLowerCase().replace(/[^a-z]/g, '') === n.toLowerCase().replace(/[^a-z]/g, ''));
    return p ? { name: p.name, logo: p.logo } : null;
  }).filter(Boolean),
}));
const grouped = new Set(partners.flatMap((g) => g.items.map((i) => i.name)));
const ungrouped = col.partners.filter((p) => !grouped.has(p.name)).map((p) => p.name);
if (ungrouped.length) throw new Error('Partners not grouped: ' + ungrouped.join(', '));

// ---------------- Events, news, tenders: src/data/outreach/*.json, edited through /admin ----------------
// (moved out of this file on 2026-10-29, see tools/migrate-outreach.cjs). OUTREACH_DIR lets the admin
// check a candidate edit against the renderers before saving it.
const { splitEvents, todayIST } = require('../outreach/model.cjs');
const OUTREACH_DIR = process.env.OUTREACH_DIR || path.join(__dirname, 'outreach');
const readOutreach = (name) => JSON.parse(fs.readFileSync(path.join(OUTREACH_DIR, name + '.json'), 'utf8'));
const outreach = { events: readOutreach('events'), news: readOutreach('news'), tenders: readOutreach('tenders') };
const { upcoming: upcomingEvents, past: pastEvents } = splitEvents(outreach.events, todayIST());
const news = outreach.news.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const tenders = outreach.tenders;

// ---------------- Careers (artparkcareers.in, checked 2026-10-24) ----------------
// Re-checked against the live roles feed on 2026-10-24 (research/careers-api.json): the AxD internship has closed,
// and the r_demo_* roles on that site are placeholders, so neither is listed. "about" is the startup's own one-liner.
const ORG_SHORT = { 'Foucault Private Limited': 'Foucault' };
const JOB_TYPE = { full_time: 'Full-time', contract: 'Contract', part_time: 'Part-time', internship: 'Internship' };
const EXPERIENCE = { student_0_1: 'Students and 0–1 years', '0_2': '0–2 years', '2_4': '2–4 years', '3_6': '3–6 years', '5_8': '5–8 years', '8_plus': '8+ years' };
const LIVE = (() => { try { return JSON.parse(JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'research', 'careers-api.json'), 'utf8'))[0].body).items.filter((r) => !/demo/.test(r.id)); } catch { return null; } })();
const jobs = col.jobs.filter((j) => !LIVE || LIVE.some((r) => j.url.endsWith(r.id))).map((j) => {
  const live = LIVE && LIVE.find((r) => j.url.endsWith(r.id));
  const atArtpark = j.organization === 'ARTPARK';
  const company = ORG_SHORT[j.organization] || j.organization;
  return {
    title: j.title, url: j.url, company, atArtpark,
    slug: slugify(`${j.title} ${company}`).slice(0, 80).replace(/-+$/, ''),
    about: !atArtpark && live && live.tirOverview ? live.tirOverview.replace(/^[^—]+—\s*/, '').replace(/^./, (c) => c.toUpperCase()) : '',
    desc: j.description, location: j.location, mode: j.workMode, cat: j.category,
    type: (live && JOB_TYPE[live.jobType]) || j.type,
    experience: live ? EXPERIENCE[live.experience] || '' : '',
    team: j.team, family: j.jobFamily,
    jd: live && live.jd ? live.jd : null,
    tags: [j.subFamily, j.team].filter(Boolean), postedAt: j.postedAt,
  };
});

// ---------------- Certifications (artpark.in/certifications) ----------------
const ISSUER = ['Department of Scientific & Industrial Research (DSIR)', 'Ministry of Corporate Affairs · CSR00017521', 'Income Tax Department · Section 80G', 'Income Tax Department'];
const certifications = col.certifications.map((c, i) => ({ title: c.title, issuer: ISSUER[i], desc: c.description, url: c.url }));

module.exports = { slugify, DOMAIN_LIST, people, portfolio, partners, upcomingEvents, pastEvents, news, jobs, certifications, tenders, outreach };
