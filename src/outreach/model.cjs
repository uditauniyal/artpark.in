// Outreach content model, shared by the build (src/pages/outreach.cjs) and the admin API (api/).
// Dates are kept as 'YYYY-MM-DD' strings and formatted without Date, so time zones never shift them.

const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

const parts = (iso) => { const m = ISO.exec(iso || ''); return m ? { y: m[1], m: +m[2] - 1, d: +m[3] } : null; };
const formatShort = (iso) => { const p = parts(iso); return p ? `${p.d} ${SHORT[p.m]} ${p.y}` : ''; };
const formatLong = (iso) => { const p = parts(iso); return p ? `${p.d} ${LONG[p.m]} ${p.y}` : ''; };
function formatRange(start, end) {
  const a = parts(start), b = parts(end);
  if (!a) return '';
  if (!b || end === start) return formatShort(start);
  if (a.y !== b.y) return `${formatShort(start)} – ${formatShort(end)}`;
  if (a.m !== b.m) return `${a.d} ${SHORT[a.m]} – ${b.d} ${SHORT[b.m]} ${b.y}`;
  return `${a.d}–${b.d} ${SHORT[a.m]} ${a.y}`;
}

const todayIST = () => process.env.BUILD_DATE || new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);

function splitEvents(events, today) {
  const upcoming = events.filter((e) => (e.end || e.start) >= today).sort((a, b) => a.start.localeCompare(b.start));
  const past = events.filter((e) => (e.end || e.start) < today).sort((a, b) => b.start.localeCompare(a.start));
  return { upcoming, past };
}
const eventHasPage = (e) => !e.recap && !!((e.body && e.body.length) || e.blurb);

const STAGES = ['Notice published', 'Pre-bid meeting', 'Corrigenda', 'Technical bids opened', 'Price bids opened'];
function tenderStages(t) {
  const corr = (t.docs || []).filter((d) => /corrigend/i.test(d.label)).length;
  const captions = [formatShort(t.published), t.preBid || '', corr ? corr + ' issued' : '', '', formatShort(t.priceBidsDate)];
  return STAGES.map((label, i) => [label, i <= t.phase, captions[i]]).filter((s, i) => !(i === 1 && t.noPreBid));
}

const slugify = (s) => String(s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function uniqueId(base, existing) {
  const taken = new Set(existing);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

// Validation: returns a list of messages, each starting with the field name.
const DOC_KINDS = ['PDF', 'DOCX', 'Drive', 'Doc'];
const LINK = /^(https?:\/\/[^\s"<>]+|\/(?!\/)[^\s"<>]*)$/;
function validate(kind, item) {
  const errs = [];
  const text = (f, max, required) => {
    const v = item[f];
    if (v != null && typeof v !== 'string') return errs.push(`${f}: must be text`);
    if (required && !String(v || '').trim()) errs.push(`${f}: required`);
    else if (v && v.length > max) errs.push(`${f}: at most ${max} characters`);
  };
  const link = (f, required) => {
    const v = item[f];
    if (!v) { if (required) errs.push(`${f}: required`); return; }
    if (typeof v !== 'string' || v.length > 500 || !LINK.test(v)) errs.push(`${f}: must be a web link (https://…)`);
  };
  const date = (f, required) => {
    const v = item[f];
    if (!v) { if (required) errs.push(`${f}: required`); return; }
    if (!parts(v)) errs.push(`${f}: must be a date (YYYY-MM-DD)`);
  };
  if (kind === 'events') {
    text('title', 200, true); date('start', true); date('end', false); text('time', 80); text('venue', 120);
    text('blurb', 600); text('imageAlt', 200); link('image'); link('register'); link('recap'); link('source');
    if (item.end && item.start && item.end < item.start) errs.push('end: must be on or after the start date');
    if (!Array.isArray(item.body) || item.body.some((p) => typeof p !== 'string')) errs.push('body: must be a list of paragraphs');
    else if (item.body.join('').length > 20000) errs.push('body: at most 20000 characters');
    if (parts(item.start) && (item.end || item.start) >= todayIST() && !item.image) errs.push('image: a photo is required for upcoming events');
  } else if (kind === 'news') {
    text('title', 200, true); text('outlet', 120, true); date('date', true); text('dateLabel', 40); link('url', true);
  } else if (kind === 'tenders') {
    text('title', 200, true); text('cat', 80, true); text('note', 2000); text('preBid', 80);
    date('published', false); date('priceBidsDate', false);
    if (!['active', 'closed', 'rfp'].includes(item.status)) errs.push('status: must be active, closed or rfp');
    if (!Number.isInteger(item.phase) || item.phase < 0 || item.phase > 4) errs.push('phase: must be a whole number from 0 to 4');
    if (!Array.isArray(item.docs)) errs.push('docs: must be a list');
    else {
      item.docs.forEach((d, i) => {
        if (!d || typeof d.label !== 'string' || !d.label.trim() || d.label.length > 200) errs.push(`docs: document ${i + 1} needs a label`);
        if (!d || typeof d.href !== 'string' || d.href.length > 500 || !LINK.test(d.href)) errs.push(`docs: document ${i + 1} needs a file or a web link`);
        if (!d || !['tender', 'result', 'other'].includes(d.role)) errs.push(`docs: document ${i + 1} has an unknown role`);
        if (!d || !DOC_KINDS.includes(d.kind)) errs.push(`docs: document ${i + 1} has an unknown file type`);
      });
      if (item.status !== 'rfp' && !item.docs.some((d) => d && d.role === 'tender')) errs.push('docs: the tender document is required');
      if (item.phase === 4 && !item.docs.some((d) => d && d.role === 'result')) errs.push('docs: the result document is required once bidding is done');
    }
  } else errs.push('kind: unknown');
  return errs;
}

module.exports = { STAGES, formatShort, formatLong, formatRange, todayIST, splitEvents, eventHasPage, tenderStages, slugify, uniqueId, validate };
