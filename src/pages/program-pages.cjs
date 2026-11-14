// TIR, VIP and RDI program pages, made by the manager in Claude Design (2026-11-12) and imported verbatim
// by tools/import-programs-1112.cjs into src/data/programs-pages/.
// One deviation, agreed with the user (2026-11-13): his RDI "Express interest" form only showed a thank-you and sent
// nothing. Like the site's other forms it now opens the visitor's email app to connect@artpark.in with the answers
// filled in; an email app cannot attach files, so the pitch-deck upload asks for a link to the deck instead.
const fs = require('fs');
const path = require('path');
const { page } = require('../lib.cjs');

const DIR = path.join(__dirname, '..', 'data', 'programs-pages');

// Exact replacement that fails the build if his markup changes underneath it.
const swap = (html, from, to) => {
  if (!html.includes(from)) throw new Error('program-pages: markup not found: ' + from.slice(0, 80));
  return html.split(from).join(to);
};

const RDI_FORM = [
  ['A few details and your pitch deck. The ARTPARK team will review and get in touch.',
    'A few details and a link to your pitch deck. The ARTPARK team will review and get in touch.'],
  ['<label class="rdi-drop"><input id="rdi-deck" name="deck" type="file" accept=".pdf,.ppt,.pptx,.key" required><span id="rdi-deck-label" style="display:block;font-family:var(--font-display);font-weight:700;font-size:16px;color:var(--artblue)">Upload pitch deck</span><span style="display:block;font-size:13px;color:var(--ink-soft);margin-top:6px">PDF, PPT, PPTX or Keynote</span></label>',
    // His mint dashed box stays; the link field sits inside it (inline styles undo his hidden-file-input rule).
    '<label class="rdi-drop" style="cursor:text"><span style="display:block;font-family:var(--font-display);font-weight:700;font-size:16px;color:var(--artblue)">Add a link to your pitch deck</span><span style="display:block;font-size:13px;color:var(--ink-soft);margin-top:6px">PDF, PPT, PPTX or Keynote, shared from Google Drive, Dropbox or similar</span><input id="rdi-deck" name="deck" type="url" placeholder="https://" required class="rdi-in" aria-label="Link to your pitch deck" style="position:static;opacity:1;margin-top:16px;text-align:center;cursor:text"></label>'],
  ['<p style="margin:0;color:var(--ink-soft);line-height:1.7">We\'ve received your details. The ARTPARK team will be in touch.</p>',
    '<p style="margin:0;color:var(--ink-soft);line-height:1.7">Your email app should have opened with your details addressed to connect@artpark.in. Send it from there and the ARTPARK team will be in touch.</p>'],
  [",d=document.getElementById('rdi-deck'),l=document.getElementById('rdi-deck-label');d.addEventListener('change',function(){l.textContent=d.files[0]?d.files[0].name:'Upload pitch deck'});", ';'],
  ["f.addEventListener('submit',function(e){e.preventDefault();f.hidden=true;document.getElementById('rdi-done').hidden=false;})",
    String.raw`f.addEventListener('submit',function(e){e.preventDefault();var el=f.elements,inv=[].map.call(ls.querySelectorAll('input'),function(q){return q.value.trim()}).filter(Boolean);var body=['Startup: '+el.startup.value,'Founder: '+el.founder_name.value,'Email: '+el.founder_email.value,'Phone: '+el.founder_phone.value,'LinkedIn: '+(el.founder_linkedin.value||'-'),'Interested in RDI: '+el.interested.value,'Private capital investors identified: '+el.investors.value+(el.investors.value==='Yes'&&inv.length?' ('+inv.join(', ')+')':''),'Pitch deck: '+el.deck.value].join('\n');window.location.href='mailto:connect@artpark.in?subject='+encodeURIComponent('RDI interest: '+el.startup.value)+'&body='+encodeURIComponent(body);f.hidden=true;document.getElementById('rdi-done').hidden=false;})`],
];

// User (2026-11-14): nothing links to apply.artpark.info. "Apply" opens the in-progress page (src/pages/apply.cjs);
// "Full brief" pointed at apply.artpark.info's copy of this same page, so it is left out.
const APPLY = {
  tir: [['<a class="btn btn-primary" href="https://apply.artpark.info/apply/signup?track=tir" target="_blank" rel="noopener">', '<a class="btn btn-primary" href="/apply">'],
    ['<a class="btn btn-ghost" href="https://apply.artpark.info/tir#program" target="_blank" rel="noopener">Full brief</a>', '']],
  vip: [['<a class="btn btn-primary" href="https://apply.artpark.info/apply-sip/signup?track=sip" target="_blank" rel="noopener">', '<a class="btn btn-primary" href="/apply">'],
    ['<a class="btn btn-ghost" href="https://apply.artpark.info/sip#program" target="_blank" rel="noopener">Full brief</a>', '']],
  rdi: [],
};

module.exports = ['tir', 'vip', 'rdi'].map((slug) => {
  const meta = JSON.parse(fs.readFileSync(path.join(DIR, slug + '.json'), 'utf8'));
  let body = fs.readFileSync(path.join(DIR, slug + '.html'), 'utf8');
  if (slug === 'rdi') for (const [from, to] of RDI_FORM) body = swap(body, from, to);
  for (const [from, to] of APPLY[slug]) body = swap(body, from, to);
  return {
    route: meta.route,
    html: () => page({ title: meta.title, description: meta.description, active: 'about', sub: 'programs', body }),
  };
});
