// Where every artpark.in address lives on the new site. The build rewrites all artpark.in links
// with this map and fails if any link is left unmapped, so nothing sends visitors back to Squarespace.
const projects = require('./projects.cjs');
const docs = require('./docs-map.json');

const EXACT = {
  '/': '/', '/home': '/',
  '/about-us': '/about/approach', '/team': '/about/team', '/boards-advisors': '/about/team',
  '/certifications': '/about/introduction#certifications', '/contact': '/contact', '/partnerships': '/partnerships',
  '/startups-overview': '/portfolio', '/startups-new': '/portfolio', '/dashboard': '/portfolio', '/stories': '/portfolio',
  '/startups-applyfortir2026': '/about/programs/tir', '/startups-applyforvip': '/about/programs/vip',
  '/advanced-robotics': '/about/programs/artlabs#advanced-robotics', '/advanced-robotics/category/ADVANCED+ROBOTIC+SYSTEMS': '/about/programs/artlabs#advanced-robotics',
  '/industry5': '/about/programs/artlabs#industry-5', '/industry-50': '/about/programs/artlabs#industry-5',
  '/health': '/about/programs/social-impact#health', '/health-initiatives': '/about/programs/social-impact#health', '/ai-and-health': '/about/programs/social-impact#health',
  '/health-initiatives/category/SCREENING': '/about/programs/social-impact#health', '/health-initiatives/category/SYSTEMS+RESILIENCE': '/about/programs/social-impact#health',
  '/language': '/about/programs/social-impact#language', '/language-data-ai': '/about/programs/social-impact#language', '/language-data-ai/category/GenAI': '/about/programs/social-impact#language',
  '/programs/coe-wwt1': '/about/programs/artlabs#wired-wireless', '/programs': '/about/programs',
  '/skilling': '/about/programs/artlabs#academy', '/artlabs': '/about/programs/artlabs',
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
