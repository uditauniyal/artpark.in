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

// ---------------- Portfolio (artpark.in/startups-overview + startups-new sectors) ----------------
// Sectors as listed on artpark.in/startups-new. Companies missing there, or clearly mis-filed by the
// page layout, are assigned by Claude (logged in notes/corrections-log.md).
const SECTORS = ['Defence and Aerospace', 'Space Technology', 'Industrial Automation and Robotics', 'Healthcare', 'Agriculture', 'Mobility and Construction', 'Research and Deep Science'];
const SECTOR = {
  'acceleration-robotics': 'Industrial Automation and Robotics', algobotix: 'Defence and Aerospace', algofet: 'Defence and Aerospace',
  astrome: 'Space Technology', 'a-thon': 'Mobility and Construction', 'automind-dynamics': 'Defence and Aerospace',
  'charukesi-health': 'Healthcare', 'comrado-aerospace': 'Defence and Aerospace', 'contrivation-labs': 'Agriculture',
  'dexsent-robotics': 'Industrial Automation and Robotics', edgeverse: 'Mobility and Construction', floaid: 'Healthcare',
  'flo-mobility': 'Mobility and Construction', 'guerin-technologies': 'Space Technology', 'hyflex-mobility': 'Defence and Aerospace',
  kinesthetiq: 'Industrial Automation and Robotics', 'niral-networks': 'Research and Deep Science', nextoar: 'Industrial Automation and Robotics',
  nxtqube: 'Defence and Aerospace', 'open-science-stack': 'Research and Deep Science', qosmic: 'Space Technology',
  'q-axis-motors': 'Defence and Aerospace', rootsgoods: 'Agriculture', 'sakar-robotics': 'Mobility and Construction',
  'scivision-ai': 'Industrial Automation and Robotics', spacyphy: 'Mobility and Construction', strideaide: 'Healthcare',
  'strider-robotics': 'Industrial Automation and Robotics', 'twara-robotics': 'Industrial Automation and Robotics', udot: 'Healthcare',
  'uncharted-ai': 'Industrial Automation and Robotics', velastra: 'Space Technology', 'versor-robotics': 'Agriculture',
  'vishvasys-aerospace': 'Space Technology', yaanendriya: 'Defence and Aerospace', zenteiq: 'Research and Deep Science',
};
// One-liners exactly as on artpark.in, with scrape artefacts cleaned.
const ONE_LINER_FIX = {
  'a-thon': 'All-terrain assisted autonomous vehicles.',
  qosmic: 'Building space-based optical communications infrastructure.',
  nextoar: 'Agentic AI for continuous operational excellence.',
  'q-axis-motors': 'Integrated electro-optical payloads for defence and aerospace.',
};
const NAME_FIX = { qosmic: 'QOSMIC' };
const portfolio = rec.portfolio.map((c) => ({
  slug: c.id,
  name: NAME_FIX[c.id] || c.name,
  oneLiner: ONE_LINER_FIX[c.id] || c.description.replace(/\s+/g, ' ').trim().replace(/([^.])$/, '$1.'),
  website: c.url || '',
  logo: '/assets/logos/' + c.id + '.webp',
  sector: SECTOR[c.id],
  source: c.sourceUrl,
}));

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

// ---------------- Events (artpark.in/events + event pages; Open Days from artpark.in/artgarage) ----------------
const upcomingEvents = [
  {
    title: 'ARTPARK Open Day — Community Edition', date: '12 Nov 2026', time: '10:30 AM to 1 PM', venue: 'ARTgarage, Jalahalli',
    blurb: "For students, researchers, innovators and educators: live interactions with founders, a walkthrough of ARTgarage and an up-close look at the technologies being built at ARTPARK.",
    register: 'https://forms.gle/uBb9P9cvFrSXC3pq5', image: '/assets/site/skilling-session.webp', imageAlt: 'A session in the ARTgarage commons', source: 'https://www.artpark.in/artgarage',
  },
  {
    title: 'ARTPARK Open Day — VC & Corporate Edition', date: '26 Nov 2026', time: '10:30 AM to 1 PM', venue: 'ARTgarage, Jalahalli',
    blurb: "For investors and corporate partners: curated introductions to ARTPARK startups, insight into the investment and incubation model, and time with the team.",
    register: 'https://forms.gle/RAc4oFUHDtN36zy36', image: '/assets/site/artgarage-hall.webp', imageAlt: 'The main hall inside ARTgarage', source: 'https://www.artpark.in/artgarage',
  },
];
const pastEvents = [
  { title: 'Calibrate: testing and improving AI agents', date: '23 Oct 2026', venue: 'Online masterclass with the^delta', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7519287141550489600/', image: '/assets/linkedin/calibrate-masterclass.jpg', note: "A Pragati AI for Impact masterclass with ARTPARK's Jigar Doshi and Aman Dalmia." },
  { title: 'From Scale to Resilience: Rethinking Efficient AI System', date: '20 Jan 2026', venue: 'IISc Bengaluru', url: 'https://www.artpark.in/events/rethinking-efficient-ai-system', note: 'A pre-summit event of the India–AI Impact Summit 2026.' },
  { title: 'AI by HER — Pre-event, India AI Impact Summit', date: '17 Nov 2025', venue: 'ARTPARK, IISc Bengaluru', url: 'https://www.artpark.in/events/ai-by-her-pre-event-india-ai-impact-summit-2025', image: '/assets/events/ai-by-her.webp' },
  { title: 'CodeBot Hackathon 2025', date: '17 Jul 2025', venue: 'ARTgarage, Bengaluru', url: 'https://www.artpark.in/events/codebot-hackathon-2025', image: '/assets/events/codebot.webp' },
  { title: 'Tutorial on 5G essentials', date: '24 Feb 2025', venue: 'Online + ARTgarage, Bengaluru', url: 'https://www.artpark.in/events/tutorial-on-5g-essentials', image: '/assets/events/5g-tutorial.webp' },
  { title: '5G Test Lab Open House', date: '11 Dec 2024', venue: 'ARTgarage, Jalahalli', url: 'https://www.artpark.in/events/5g-test-lab-open-house', image: '/assets/events/5g-open-house.webp' },
  { title: 'ROSCon India 2024', date: '4–6 Dec 2024', venue: 'IISc Bengaluru', url: 'https://www.artpark.in/events/roscon-in-24', image: '/assets/events/roscon-in-24.webp' },
  { title: 'India Mobile Congress 2024', date: '15–18 Oct 2024', venue: 'New Delhi', url: 'https://www.artpark.in/events/india-mobile-congress-2024' },
  { title: 'ELCIA Tech Summit', date: '26 Jul 2024', venue: 'Bengaluru', url: 'https://www.artpark.in/events/https/elciatechsummitin/elcia-tech-summit', image: '/assets/events/elcia.webp' },
  { title: 'ROSCon India 2023', date: '14–15 Dec 2023', venue: 'Bengaluru', url: 'https://www.artpark.in/events/roscon', image: '/assets/events/roscon-2023.webp' },
  { title: 'Global Partnership on AI Summit', date: '12–14 Dec 2023', venue: 'New Delhi', url: 'https://www.artpark.in/events/global-partnership-on-ai', image: '/assets/events/gpai.webp' },
  { title: 'AI & Societal Good — Mint AI Summit', date: '8 Dec 2023', venue: 'New Delhi', url: 'https://www.artpark.in/events/mint-ai-summit', image: '/assets/events/mint-ai.webp' },
  { title: 'NaCDEC VI — Design Challenge', date: '12 Aug 2023', venue: '', url: 'https://www.artpark.in/events/nacdec-vi-design-challenge', image: '/assets/events/nacdec.webp' },
  { title: 'Robotics Challenge — Grand Finale', date: '14 May 2022', venue: '', url: 'https://www.artpark.in/events/robotics-challenge-finale', image: '/assets/events/robotics-challenge.webp' },
  { title: 'ARTPARK Innovation Summit', date: '14 Mar 2022', venue: '', url: 'https://www.artpark.in/events/artpark-innovation-summit', image: '/assets/events/innovation-summit.webp' },
  { title: 'Seminar on Advanced Air Mobility', date: '26 Feb 2022', venue: '', url: 'https://www.artpark.in/events/advanced-air-mobility' },
];

// ---------------- News (artpark.in/media, in its order; ET InterSafe item added on artpark.in Oct 2026) ----------------
const news = [
  { title: "IISc's ARTPARK InterSafe gets nod for AI and 5G pilot on Bengaluru-Hassan Highway", outlet: 'The Economic Times', date: '13 October 2026', url: 'https://www.artpark.in/media' },
  // The TIME partner page (partners.time.com) returns 404, so it is left out.
  ...col.news.filter((n) => !/partners\.time\.com/.test(n.url)).map((n) => ({ title: n.title, outlet: n.publication, date: n.date, url: n.url })),
];
// Fix outlet/date casing to match the publications.
const OUTLET_FIX = { 'India health fund': 'India Health Fund', 'Money Control': 'Moneycontrol', 'The HINDU Business Line': 'The Hindu BusinessLine', MINT: 'Mint' };
news.forEach((n) => { n.outlet = OUTLET_FIX[n.outlet] || n.outlet; n.date = (n.date || '').replace(/^(\d+)(st|nd|rd|th)/, '$1').trim(); });

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

// ---------------- Tenders (artpark.in/tenders) ----------------
const tenders = [
  {
    id: 'gpu-edge-cloud', title: 'The supply of GPU Edge Cloud System', status: 'active', cat: 'Equipment',
    note: 'Pre-bid clarification meeting: Thu 27 Feb 2025, 11:30 AM to 12:30 PM IST at ARTgarage. Please ignore the typo in the Important Dates on page 12 of the tender document (27 February 2025, 5 PM IST).',
    docs: [
      ['Tender document', 'https://www.artpark.in/s/Tender-document-GPU-Edge-Clouddocx.pdf', 'PDF'],
      ['Corrigendum of the tender · 28 Feb 2025', 'https://www.artpark.in/s/Corrigendum-Tender-document-GPU-Edge-Cloud-dtd-28-2-24.pdf', 'PDF'],
      ['Minutes of the commercial bid opening meeting · 17 Mar 2025', 'https://www.artpark.in/s/Price-Bid-Meeting-Minutes-of-Tender-Supply-of-GPU-Server-1.pdf', 'PDF'],
    ],
  },
  {
    id: 'gpu-rack-server', title: 'The supply of GPU Based Rack Server', status: 'closed', cat: 'Equipment',
    docs: [
      ['Tender document', 'https://drive.google.com/file/d/1K-T7Yozc6WMLqQ27smPBRKRdACfX_DFE/view?usp=sharing', 'Drive'],
      ['Output of the opening of the price bids', 'https://www.artpark.in/s/Website-Publication-Output-of-the-opening-of-the-Proce-Bid-Tender-GPU-Rack-Server.pdf', 'PDF'],
      ['Output of the opening of the technical bid', 'https://www.artpark.in/s/Website-Publication-Output-of-the-opening-of-the-Technical-Bid-Tender-GPU-Rack-Server.pdf', 'PDF'],
      ['Corrigendum to the tender', 'https://www.artpark.in/s/Tender-Supply-of-GPU-Based-Rack-Server-ARTPARK.pdf', 'PDF'],
      ['Corrigendum 2', 'https://docs.google.com/document/d/1XVV62ZlZEEILqOduKbJag6r_e03xE9wQ/edit?usp=sharing&ouid=110081720780474297908&rtpof=true&sd=true', 'Doc'],
      ['Corrigendum 3', 'https://docs.google.com/document/d/1Lu7pmIMPFC2h0lZXsGbzL--mWw6Tzle7/edit?usp=sharing&ouid=110081720780474297908&rtpof=true&sd=true', 'Doc'],
    ],
  },
  {
    id: 'robot-arm', title: 'The supply of robot arm, cobot pump and accessories', status: 'closed', cat: 'Equipment', published: '26 Aug 2024',
    docs: [['Tender document', 'https://drive.google.com/file/d/1YTMBx4T3ae-WC-9Kf3PBqExmAPJtDFoT/view?usp=sharing', 'Drive']],
  },
  {
    id: 'genomic-surveillance', title: 'Platform for clinical & environmental genomic surveillance', status: 'rfp', cat: 'Request for proposals',
    docs: [], note: 'The RFP page on the current site (artpark.in/rfp/genomic-surveillance-platform) no longer loads. Write to connect@artpark.in for the document.',
  },
];

module.exports = { slugify, SECTORS, people, portfolio, partners, upcomingEvents, pastEvents, news, jobs, certifications, tenders };
