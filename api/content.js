// GET /api/content -> {events, news, tenders} (latest saved content, so a fresh save shows before the redeploy).
// POST /api/content {kind, action: 'save'|'delete', item?, id?, uploads?: [{name, data(base64)}]}
//   An upload is referenced from the item as 'upload:N' in item.image (events) or item.docs[].href (tenders).
//   -> {ok, id, page} | {error, fields?} with 400 / 404 / 422.
const { readJson, send } = require('./_lib/http.js');
const { requireAdmin } = require('./_lib/auth.js');
const { getStore, dataPath, KINDS } = require('./_lib/store.js');
const { decodeUpload, safeName } = require('./_lib/uploads.js');
const { renderCheck } = require('./_lib/render-check.js');
const { validate, slugify, uniqueId } = require('../src/outreach/model.cjs');

const PAGE = { events: '/events', news: '/news', tenders: '/tenders' };
const fail = (status, message, fields) => Object.assign(new Error(message), { status, fields });
const str = (v) => (v == null ? '' : String(v).trim());

// Keeps only the known fields, with the right types.
function normalise(kind, x) {
  if (kind === 'events') {
    const body = Array.isArray(x.body) ? x.body.map(str).filter(Boolean) : [];
    return { id: '', title: str(x.title), start: str(x.start), end: str(x.end), time: str(x.time), venue: str(x.venue), blurb: str(x.blurb), body, image: str(x.image), imageAlt: str(x.imageAlt), register: str(x.register), recap: str(x.recap), source: str(x.source) };
  }
  if (kind === 'news') return { id: '', title: str(x.title), outlet: str(x.outlet), date: str(x.date), dateLabel: str(x.dateLabel), url: str(x.url) };
  const docs = Array.isArray(x.docs) ? x.docs.map((d) => ({ label: str(d && d.label), href: str(d && d.href), kind: str(d && d.kind), role: str(d && d.role) })) : x.docs;
  return { id: '', title: str(x.title), cat: str(x.cat), status: str(x.status), published: str(x.published), note: str(x.note), phase: Number(x.phase), noPreBid: !!x.noPreBid, preBid: str(x.preBid), priceBidsDate: str(x.priceBidsDate), docs };
}

// Replaces 'upload:N' references with stored files; returns the files to write.
function placeUploads(kind, item, uploads, taken) {
  const files = [];
  const take = (ref, purpose) => {
    const n = +ref.slice('upload:'.length);
    if (!Number.isInteger(n) || !uploads[n]) throw fail(400, 'A file was not received. Choose it again and save.');
    const { buffer, ext, kind: type } = decodeUpload(uploads[n], purpose);
    const stem = safeName(uploads[n].name).replace(/\.[a-z0-9]+$/, '');
    const at = (s) => (kind === 'tenders' ? `docs/tenders/${item.id}/${s}${ext}` : `assets/events/${item.id}-${s}${ext}`);
    let rel = at(stem);
    for (let i = 2; taken.has('/' + rel); i++) rel = at(`${stem}-${i}`);
    taken.add('/' + rel);
    files.push({ path: `public/${rel}`, content: buffer });
    return { href: '/' + rel, type };
  };
  if (kind === 'events' && item.image.startsWith('upload:')) item.image = take(item.image, 'image').href;
  if (kind === 'tenders' && Array.isArray(item.docs)) {
    for (const d of item.docs) if (d.href.startsWith('upload:')) { const r = take(d.href, 'doc'); d.href = r.href; d.kind = r.type; }
  }
  return files;
}

async function change(store, body, email) {
  const { kind, action } = body;
  if (!KINDS.includes(kind)) throw fail(400, 'Unknown section.');
  const data = await store.read();
  const list = data[kind];
  let id, files = [], verb;
  if (action === 'delete') {
    id = str(body.id);
    const i = list.findIndex((x) => x.id === id);
    if (i === -1) throw fail(404, 'That entry no longer exists.');
    list.splice(i, 1);
    verb = 'delete';
  } else if (action === 'save') {
    const item = normalise(kind, body.item || {});
    const given = str(body.item && body.item.id);
    const i = given ? list.findIndex((x) => x.id === given) : -1;
    if (given && i === -1) throw fail(404, 'That entry no longer exists.');
    item.id = given || uniqueId(slugify(item.title).slice(0, 80).replace(/-+$/, '') || kind, list.map((x) => x.id));
    // Files already in use (by this collection or this edit) are never overwritten.
    const taken = new Set(list.concat(item).flatMap((x) => [x.image, ...(Array.isArray(x.docs) ? x.docs.map((d) => d.href) : [])]).filter(Boolean));
    files = placeUploads(kind, item, Array.isArray(body.uploads) ? body.uploads : [], taken);
    const errs = validate(kind, item);
    if (errs.length) {
      const fields = {};
      for (const e of errs) { const [f, ...m] = e.split(': '); fields[f] = fields[f] || m.join(': '); }
      throw fail(400, 'Please fix the highlighted fields.', fields);
    }
    if (i === -1) list.unshift(item); else list[i] = item;
    id = item.id;
    verb = i === -1 ? 'add' : 'update';
  } else throw fail(400, 'Unknown action.');

  renderCheck(data);
  files.push({ path: dataPath(kind), content: JSON.stringify(list, null, 2) + '\n' });
  await store.write({ files, message: `admin: ${verb} ${kind} ${id} (${email})` });
  return { ok: true, id, page: PAGE[kind] };
}

module.exports = async (req, res) => {
  const write = req.method === 'POST';
  if (!write && req.method !== 'GET') return send(res, 405, { error: 'Method not allowed.' });
  const user = requireAdmin(req, res, { write });
  if (!user) return;
  const store = getStore();
  try {
    if (!write) return send(res, 200, await store.read());
    const body = await readJson(req);
    try {
      return send(res, 200, await change(store, body, user.email));
    } catch (e) {
      if (e.status !== 409) throw e;
      return send(res, 200, await change(store, body, user.email)); // someone saved in between: redo on top of theirs
    }
  } catch (e) {
    if (!e.status || e.status >= 500) console.error(e);
    send(res, e.status || 500, { error: e.status && e.status < 500 ? e.message : 'Saving failed. Try again in a minute.', ...(e.fields ? { fields: e.fields } : {}) });
  }
};
