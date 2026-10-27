// One record per person for the Team page versions (round 8). Built from content.cjs people (artpark.in/team and
// artpark.in/boards-advisors). People who sit on two boards appear once with both groups.
// "areas" are the expertise lines artpark.in itself lists for governing-board members; nothing here is invented.
const C = require('./content.cjs');

const GROUPS = [
  ['leadership', 'Leadership team', 'The people running the work.'],
  ['governing', 'Hub governing board', 'Sets ARTPARK’s direction as the technology hub.'],
  ['directors', 'Board of directors', 'Oversees the company.'],
  ['research', 'Research advisory board', 'Advises on research direction.'],
  ['advisors', 'Executive advisors', 'Senior practitioners who work with the team.'],
];

const AREAS = {
  'govindan rangarajan': ['Nonlinear dynamics', 'Chaos', 'Time series analysis'],
  'b. gurumoorthy': ['Product informatics', 'Computational metrology', 'CAD', 'Computer aided prototyping'],
  'a. paulraj': ['MIMO wireless theory', 'Artificial intelligence', 'Wireless networks', 'Societal impact of IT'],
  'navakanta bhat': ['Nanoscale transistor devices', 'Novel materials', 'Low-power sensor systems'],
  'daniela rus': ['Artificial intelligence', 'Machine learning', 'Robotics', 'Security & cryptography', 'Systems & networking'],
};

const key = (n) => n.toLowerCase().replace(/^(prof\.?|dr\.?|mr\.?|ms\.?)\s+/g, '').replace(/,\s*ias$/, '').replace(/\s+/g, ' ').trim();
const byKey = new Map();
for (const [g] of GROUPS) {
  for (const p of C.people[g]) {
    const k = key(p.name);
    if (!byKey.has(k)) byKey.set(k, { id: k.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), name: p.name, role: p.role, portrait: p.portrait, linkedin: p.linkedin || '', groups: [], roles: {}, areas: AREAS[k] || [] });
    const rec = byKey.get(k);
    rec.groups.push(g);
    rec.roles[g] = p.role;
    if (!rec.linkedin && p.linkedin) rec.linkedin = p.linkedin;
    // Prefer the descriptive role over the bare "Director".
    if (rec.role === 'Director' && p.role !== 'Director') rec.role = p.role;
  }
}
const people = [...byKey.values()];
const inGroup = (g) => people.filter((p) => p.groups.includes(g));
const counts = Object.fromEntries(GROUPS.map(([g]) => [g, C.people[g].length]));

module.exports = { GROUPS, people, inGroup, counts };
