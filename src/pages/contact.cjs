// Contact: ported from .reference/claude-design/Contact.dc.html.
// Manager: "For Contact us page please directly use the design I created."
const { page, esc } = require('../lib.cjs');

const ROLES = ['Researcher', 'Startup', 'Builder', 'Industry partner', 'Media'];

const roleChip = (label, on) => `              <button type="button" data-role="${esc(label)}" aria-pressed="${on}" style="border:1px solid ${on ? 'var(--artblack)' : 'var(--line-strong)'};background:${on ? 'var(--artblack)' : 'transparent'};color:${on ? '#fff' : 'var(--ink)'};padding:7px 14px;font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0.06em;border-radius:2px;cursor:pointer;transition:all 150ms ease">${esc(label.toUpperCase())}</button>`;

const placeCard = ({ img, alt, focus, eyebrow, name, lines }) => `        <div style="border:1px solid var(--line);display:flex;flex-direction:column">
          <div style="position:relative;width:100%;aspect-ratio:1/1;background:var(--paper-soft);overflow:hidden"><img src="${img}" alt="${esc(alt)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${focus};display:block"></div>
          <div style="padding:20px 22px;display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--line)"><span class="eyebrow" style="color:var(--artblue)">${esc(eyebrow)}</span><b style="font-family:var(--font-display);font-size:18px">${esc(name)}</b><p style="font-size:15px;line-height:1.6;color:var(--ink-soft)">${lines.map(esc).join('<br>')}</p></div>
        </div>`;

const body = `
  <section style="padding:clamp(56px,8vw,96px) 0 0">
    <div style="max-width:1180px;margin:0 auto;padding:0 24px">
      <div class="eyebrow-rule">Contact</div>
      <h1 style="font-size:clamp(44px,6.4vw,80px);line-height:1.03;margin-top:20px">Contact us.</h1>
      <p style="margin-top:24px;max-width:680px;font-size:18px;line-height:1.7;color:var(--ink-soft)">Tell us what you're working on and where you're stuck. Messages go to the ARTPARK team at connect@artpark.in.</p>
    </div>
  </section>

  <div class="contact-grid" style="max-width:1180px;margin:0 auto;padding:56px 24px 112px;display:flex;flex-wrap:wrap;gap:48px">
    <div style="flex:1 1 420px;min-width:0">
      <form id="contact-form" data-mailto="connect@artpark.in" style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;flex-direction:column;gap:8px"><span class="eyebrow" id="role-label">I am a</span>
          <div role="group" aria-labelledby="role-label" data-role-group data-value="${ROLES[0]}" data-on='{"bg":"var(--artblack)","ink":"#fff","border":"var(--artblack)"}' data-off='{"bg":"transparent","ink":"var(--ink)","border":"var(--line-strong)"}' style="display:flex;flex-wrap:wrap;gap:8px">
${ROLES.map((r, i) => roleChip(r, i === 0)).join('\n')}
          </div>
        </div>
        <label style="display:flex;flex-direction:column;gap:8px"><span class="eyebrow">Name</span><input class="field" name="name" autocomplete="name" required></label>
        <label style="display:flex;flex-direction:column;gap:8px"><span class="eyebrow">Work email</span><input class="field" name="email" type="email" autocomplete="email" required></label>
        <label style="display:flex;flex-direction:column;gap:8px"><span class="eyebrow">WHAT CAN WE ASSIST YOU WITH</span><textarea class="field" name="message" rows="5" placeholder="The problem you're stuck on — the more specific, the better."></textarea></label>
        <div><button type="submit" class="btn btn-primary">Send message <span class="arrow">→</span></button></div>
      </form>
      <div id="contact-sent" hidden style="border:1px solid var(--line-strong);padding:28px"><h2 style="font-size:26px">Thank you.</h2><p style="margin-top:8px;font-size:15px;line-height:1.65;color:var(--ink-soft)">Your email app should have opened with the message addressed to connect@artpark.in — send it from there and someone from the ARTPARK team will write back.</p></div>
    </div>
    <div style="flex:1 1 480px;min-width:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;align-content:start">
${placeCard({
  img: '/assets/photos/artpark-office.webp', alt: 'The ARTPARK office, with team members at work beneath the ARTPARK sign', focus: '72% 50%',
  eyebrow: 'Registered address', name: 'Indian Institute of Science',
  lines: ['Ground Floor, Entrepreneurship Building', 'Indian Institute of Science', 'Bengaluru 560012'],
})}
${placeCard({
  img: '/assets/photos/artgarage-exterior.webp', alt: 'The entrance of the ARTgarage building at HMT Estate, Jalahalli', focus: '68% 50%',
  eyebrow: 'The garage', name: 'HMT Colony, Jalahalli',
  lines: ['177, HMT Colony, HMT Staff Quarters', 'HMT Estate, Jalahalli', 'Bengaluru, Karnataka 560013'],
})}
    </div>
  </div>
`;

module.exports = {
  route: '/contact',
  html: () => page({
    title: 'Contact — ARTPARK',
    description: "Tell us what you're working on and where you're stuck. Messages go to the ARTPARK team at connect@artpark.in.",
    active: 'contact',
    body,
  }),
};
