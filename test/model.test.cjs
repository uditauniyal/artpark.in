const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../src/outreach/model.cjs');

test('formatRange: same-month range, single day', () => {
  assert.equal(M.formatRange('2024-12-04', '2024-12-06'), '4–6 Dec 2024');
  assert.equal(M.formatRange('2023-12-14', '2023-12-15'), '14–15 Dec 2023');
  assert.equal(M.formatRange('2026-11-12', ''), '12 Nov 2026');
});

test('formatRange: across months and years', () => {
  assert.equal(M.formatRange('2024-11-30', '2024-12-02'), '30 Nov – 2 Dec 2024');
  assert.equal(M.formatRange('2024-12-30', '2025-01-02'), '30 Dec 2024 – 2 Jan 2025');
});

test('formatLong has no zero padding', () => {
  assert.equal(M.formatLong('2024-05-05'), '5 May 2024');
  assert.equal(M.formatLong('2026-10-13'), '13 October 2026');
});

test('splitEvents: upcoming by end-or-start date, sorted', () => {
  const ev = [{ id: 'a', start: '2026-10-23' }, { id: 'b', start: '2026-11-26' }, { id: 'c', start: '2026-11-12' }, { id: 'd', start: '2026-10-28', end: '2026-10-30' }, { id: 'e', start: '2026-01-20' }];
  const { upcoming, past } = M.splitEvents(ev, '2026-10-29');
  assert.deepEqual(upcoming.map((e) => e.id), ['d', 'c', 'b']);
  assert.deepEqual(past.map((e) => e.id), ['a', 'e']);
});

test('eventHasPage: no recap and some text', () => {
  assert.equal(M.eventHasPage({ recap: '', body: ['x'], blurb: '' }), true);
  assert.equal(M.eventHasPage({ recap: '', body: [], blurb: 'short' }), true);
  assert.equal(M.eventHasPage({ recap: 'https://x.org', body: ['x'], blurb: '' }), false);
  assert.equal(M.eventHasPage({ recap: '', body: [], blurb: '' }), false);
});

test('tenderStages: full track with captions', () => {
  const st = M.tenderStages({ phase: 4, noPreBid: false, published: '', preBid: '27 Feb 2025', priceBidsDate: '2025-03-17', docs: [{ label: 'Corrigendum · 28 Feb 2025' }] });
  assert.deepEqual(st.map((s) => s[0]), ['Notice published', 'Pre-bid meeting', 'Corrigenda', 'Technical bids opened', 'Price bids opened']);
  assert.ok(st.every((s) => s[1] === true));
  assert.deepEqual(st.map((s) => s[2]), ['', '27 Feb 2025', '1 issued', '', '17 Mar 2025']);
});

test('tenderStages: no pre-bid hides that stage; phase 0 marks only the notice', () => {
  const st = M.tenderStages({ phase: 0, noPreBid: true, published: '2024-08-26', docs: [] });
  assert.equal(st.length, 4);
  assert.deepEqual(st.map((s) => s[1]), [true, false, false, false]);
  assert.equal(st[0][2], '26 Aug 2024');
});

const future = { id: 'x', title: 'Open Day', start: '2999-01-01', end: '', time: '', venue: 'ARTgarage', blurb: 'b', body: [], image: '', imageAlt: '', register: '', recap: '', source: '' };
const tender = (o) => ({ id: 't', title: 'Supply of X', cat: 'Equipment', status: 'active', published: '2025-01-01', note: '', phase: 0, noPreBid: true, preBid: '', priceBidsDate: '', docs: [{ label: 'Tender document', href: 'https://x.org/a.pdf', kind: 'PDF', role: 'tender' }], ...o });
const hasField = (errs, f) => errs.some((e) => e.includes(f));

test('validate rejects an upcoming event without an image', () => {
  assert.ok(hasField(M.validate('events', future), 'image'));
});
test('validate accepts a past event without an image', () => {
  assert.deepEqual(M.validate('events', { ...future, start: '2020-01-01' }), []);
});
test('validate rejects a tender without its tender document', () => {
  assert.ok(hasField(M.validate('tenders', tender({ docs: [] })), 'docs'));
});
test('validate rejects phase 4 without a result document', () => {
  assert.ok(hasField(M.validate('tenders', tender({ phase: 4 })), 'docs'));
});
test('validate rejects an out-of-range phase', () => {
  assert.ok(hasField(M.validate('tenders', tender({ phase: 5 })), 'phase'));
});
test('validate accepts an RFP without documents', () => {
  assert.deepEqual(M.validate('tenders', tender({ status: 'rfp', docs: [] })), []);
});
test('validate rejects javascript: links and long titles', () => {
  assert.ok(hasField(M.validate('events', { ...future, register: 'javascript:alert(1)', image: '/assets/events/x.webp' }), 'register'));
  assert.ok(hasField(M.validate('news', { id: 'n', title: 'x'.repeat(201), outlet: 'Mint', date: '2026-01-01', dateLabel: '', url: 'https://mint.com' }), 'title'));
});
test('validate rejects news without an outlet', () => {
  assert.ok(hasField(M.validate('news', { id: 'n', title: 'T', outlet: '', date: '2026-01-01', dateLabel: '', url: 'https://mint.com' }), 'outlet'));
});

test('uniqueId appends a counter on collision', () => {
  assert.equal(M.uniqueId('open-day', ['open-day', 'open-day-2']), 'open-day-3');
  assert.equal(M.uniqueId('x', []), 'x');
});

test('todayIST honours BUILD_DATE', () => {
  process.env.BUILD_DATE = '2026-12-01';
  assert.equal(M.todayIST(), '2026-12-01');
  delete process.env.BUILD_DATE;
  assert.match(M.todayIST(), /^\d{4}-\d{2}-\d{2}$/);
});

test('validate: doc kind must be a known type', () => {
  assert.ok(hasField(M.validate('tenders', tender({ docs: [{ label: 'Tender document', href: 'https://x.org/a.pdf', kind: '<b>', role: 'tender' }] })), 'docs'));
});

// ---- batch 2: placement ----
test('isUpcoming honours forced placement, otherwise the date', () => {
  assert.equal(M.isUpcoming({ placement: 'upcoming', start: '2020-01-01' }, '2026-10-29'), true);
  assert.equal(M.isUpcoming({ placement: 'past', start: '2999-01-01' }, '2026-10-29'), false);
  assert.equal(M.isUpcoming({ placement: 'auto', start: '2999-01-01' }, '2026-10-29'), true);
  assert.equal(M.isUpcoming({ start: '2020-01-01' }, '2026-10-29'), false);
});
test('splitEvents respects forced placement', () => {
  const { upcoming, past } = M.splitEvents([{ id: 'a', start: '2020-01-01', placement: 'upcoming' }, { id: 'b', start: '2999-01-01', placement: 'past' }], '2026-10-29');
  assert.deepEqual(upcoming.map((e) => e.id), ['a']);
  assert.deepEqual(past.map((e) => e.id), ['b']);
});
test('validate: photo rule follows the effective placement; placement must be known', () => {
  assert.ok(!hasField(M.validate('events', { ...future, placement: 'past' }), 'image'));
  assert.ok(hasField(M.validate('events', { ...future, start: '2020-01-01', placement: 'upcoming' }), 'image'));
  assert.ok(hasField(M.validate('events', { ...future, placement: 'soon', image: '/x.png' }), 'placement'));
});
