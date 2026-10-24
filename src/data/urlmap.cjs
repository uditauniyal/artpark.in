// Where every artpark.in address lives on the new site. The build rewrites all artpark.in links
// with this map and fails if any link is left unmapped, so nothing sends visitors back to Squarespace.
const projects = require('./projects.cjs');
const docs = require('./docs-map.json');

const EXACT = {
  '/': '/', '/home': '/',
  '/about-us': '/about/approach', '/team': '/about/team', '/boards-advisors': '/about/team',
  '/certifications': '/about/certifications', '/contact': '/contact', '/partnerships': '/partnerships',
  '/startups-overview': '/portfolio', '/startups-new': '/portfolio', '/dashboard': '/portfolio', '/stories': '/portfolio',
  '/startups-applyfortir2026': 'https://apply.artpark.info/tir', '/startups-applyforvip': 'https://apply.artpark.info/sip',
  '/advanced-robotics': '/about/programs/advanced-robotics', '/advanced-robotics/category/ADVANCED+ROBOTIC+SYSTEMS': '/about/programs/advanced-robotics',
  '/industry5': '/about/programs/industry-5', '/industry-50': '/about/programs/industry-5',
  '/health': '/about/programs/health', '/health-initiatives': '/about/programs/health', '/ai-and-health': '/about/programs/health',
  '/health-initiatives/category/SCREENING': '/about/programs/health', '/health-initiatives/category/SYSTEMS+RESILIENCE': '/about/programs/health',
  '/language': '/about/programs/language', '/language-data-ai': '/about/programs/language', '/language-data-ai/category/GenAI': '/about/programs/language',
  '/programs/coe-wwt1': '/about/programs/wired-wireless', '/programs': '/about/programs',
  '/skilling': '/about/programs/academy', '/artlabs': '/about/programs/artlabs',
  '/artgarage': '/about/facilities/artgarage', '/artgarage-1': '/about/facilities/artgarage', '/brainz': '/about/facilities/brainz',
  '/media': '/news', '/announcements': '/news', '/publications': '/news#publications',
  '/events': '/events', '/careers': '/careers', '/careers-1': '/careers', '/tenders': '/tenders',
  '/stories/blog-post-title-four-kpyhe': '/stories/algofet', '/stories/environmnetday2026': '/stories/nature-signals',
  '/privacy-policy': '/privacy-policy', '/aaprivacypolicy': '/privacy-policy', '/terms-of-use': '/terms-of-use',
  '/rfp/genomic-surveillance-platform': '/tenders',
};
for (const p of projects) for (const f of p.from) EXACT[f] = p.parent === 'publications' ? `/publications/${p.slug}` : `/projects/${p.slug}`;
for (const [k, v] of Object.entries(docs)) if (v) EXACT[k] = v;

// Returns the local target for an artpark.in path, or null.
module.exports = function mapArtparkPath(p, routes) {
  const clean = decodeURIComponent(p).replace(/\/$/, '') || '/';
  if (EXACT[clean] || EXACT[p]) return EXACT[clean] || EXACT[p];
  if (/^\/events\//.test(clean)) { const r = '/events/' + clean.split('/').pop(); return routes.has(r) ? r : '/events'; }
  if (/^\/careers-1\//.test(clean)) return '/careers';
  return null;
};
module.exports.EXACT = EXACT;
