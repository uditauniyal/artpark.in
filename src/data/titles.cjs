// Two-tone page titles (manager feedback 2026-10-25: "part purple and part black", like apply.artpark.info,
// "this feedback for all pages"). The closing phrase of every H1 is set in ARTBlue (<span class="tt">),
// the way V7 and apply.artpark.info do it. On dark heroes .tt turns mint (brand pairs, guidelines p.12).
// Titles that are a single word get a short lead-in so there is a black part and a purple part.
const MAP = {
  'Our team.': 'Our <span class="tt">team.</span>',
  'Approach.': 'Our <span class="tt">approach.</span>',
  'Certifications.': 'Our <span class="tt">certifications.</span>',
  'Facilities &amp; offerings.': 'Facilities &amp; <span class="tt">offerings.</span>',
  'Other programs.': 'Other <span class="tt">programs.</span>',
  'Contact us.': 'Contact <span class="tt">us.</span>',
  'In the news.': 'In the <span class="tt">news.</span>',
  'Current portfolio.': 'Current <span class="tt">portfolio.</span>',
  'Partners.': 'Our <span class="tt">partners.</span>',
  'Events.': 'ARTPARK <span class="tt">events.</span>',
  'Tenders.': 'ARTPARK <span class="tt">tenders.</span>',
  'Work at ARTPARK.': 'Work at <span class="tt">ARTPARK.</span>',
  'Privacy policy.': 'Privacy <span class="tt">policy.</span>',
  'Terms of use.': 'Terms of <span class="tt">use.</span>',
  'ARTgarage.': 'Inside <span class="tt">ARTgarage.</span>',
  'BRAINz.': 'Inside <span class="tt">BRAINz.</span>',
  'ARTLabs.': 'Inside <span class="tt">ARTLabs.</span>',
  'Academy.': 'ARTPARK <span class="tt">Academy.</span>',
  'Advanced Robotic Systems.': 'Advanced Robotic <span class="tt">Systems.</span>',
  'Health Data &amp; AI.': 'Health Data <span class="tt">&amp; AI.</span>',
  'Language Data &amp; AI.': 'Language Data <span class="tt">&amp; AI.</span>',
  'Integrated Industry 5.0 Platform.': 'Integrated Industry <span class="tt">5.0 Platform.</span>',
  'RDI Fund · Focused Research Organisation.': 'RDI Fund · Focused Research <span class="tt">Organisation.</span>',
  'Wired &amp; Wireless Technologies (CoE-WWT).': '<span class="tt">Wired &amp; Wireless</span> Technologies (CoE-WWT).',
};

// Anything not in the map: a title with " — " gets the part after the dash; otherwise the last word.
const auto = (inner) => {
  const dash = inner.indexOf(' — ');
  if (dash > 0) return `${inner.slice(0, dash)} — <span class="tt">${inner.slice(dash + 3)}</span>`;
  const m = inner.match(/^(.*\S)\s+(\S+)$/s);
  return m ? `${m[1]} <span class="tt">${m[2]}</span>` : `<span class="tt">${inner}</span>`;
};

const tone = (inner) => {
  const t = inner.trim();
  if (/<span\b/.test(t)) return inner; // already two-tone (home, 404)
  if (MAP[t]) return MAP[t];
  if (/<br\s*\/?>/.test(t)) return inner;
  return auto(t);
};

module.exports = (html) => html.replace(/(<h1\b[^>]*>)([\s\S]*?)(<\/h1>)/, (m, a, inner, b) => a + tone(inner) + b);
