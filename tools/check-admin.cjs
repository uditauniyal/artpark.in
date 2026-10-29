// End-to-end check of /admin against the local server (node tools/serve.cjs dist 3010 with .env.local):
// log in, add news / an upcoming event / a tender, move the tender to "Price bids opened", delete all three,
// and check the public pages after each step. Leaves the content as it found it.
// Usage: ADMIN_EMAIL=… ADMIN_PASSWORD=… node tools/check-admin.cjs [baseUrl=http://127.0.0.1:3010]
const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require(process.env.ARTPARK_PLAYWRIGHT || 'C:/Users/localadmin/Desktop/artpark-portal-design-system/build/frontend/node_modules/playwright-core');

const base = process.argv[2] || 'http://127.0.0.1:3010';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'check-admin-'));
const pdf = path.join(tmp, 'Admin Test Tender.pdf');
const result = path.join(tmp, 'Admin Test Result.pdf');
const png = path.join(tmp, 'admin-test.png');
fs.writeFileSync(pdf, '%PDF-1.4\n% admin test\n');
fs.writeFileSync(result, '%PDF-1.4\n% admin test result\n');
const big = path.join(tmp, 'big.pdf');
const half1 = path.join(tmp, 'half-1.pdf');
const half2 = path.join(tmp, 'half-2.pdf');
for (const [f, mb] of [[big, 3.5], [half1, 2.5], [half2, 2.5]]) { const buf = Buffer.alloc(Math.round(mb * 1024 * 1024), 0x20); buf.write('%PDF-1.4'); fs.writeFileSync(f, buf); }
fs.writeFileSync(png, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'));
const iso = (d) => d.toISOString().slice(0, 10);
const nextMonth = iso(new Date(Date.now() + 30 * 86400e3));

const results = {};
const check = (name, ok) => { results[name] = !!ok; };

(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  const pub = async (route) => (await (await p.context().request.get(base + route)).text());
  const saved = async () => { await p.waitForSelector('#status[data-state="ok"]', { timeout: 15000 }); };
  const row = (id) => p.locator(`[data-row="${id}"]`);
  try {
    await p.goto(base + '/admin/');
    await p.fill('#login-email', process.env.ADMIN_EMAIL);
    await p.fill('#login-password', 'definitely wrong');
    await p.click('#login-submit');
    await p.waitForSelector('#login-error:not(:empty)');
    check('wrongPasswordShowsError', /Wrong email or password/.test(await p.textContent('#login-error')));

    await p.fill('#login-password', process.env.ADMIN_PASSWORD);
    await p.click('#login-submit');
    await p.waitForSelector('[data-tab="events"]');
    check('loggedIn', true);
    await p.click('[data-tab="events"]');
    check('eventsSummary', /\d+ upcoming · \d+ past/.test(await p.textContent('#section-summary')));
    await p.fill('#search', 'open day');
    const titles = await p.locator('[data-row]:visible .a-row-title').allTextContents();
    check('searchFilters', titles.length > 0 && titles.every((t) => /open day/i.test(t)));
    await p.fill('#search', '');

    // News
    await p.click('[data-tab="news"]');
    await p.click('#add-new');
    await p.fill('[name=title]', 'Admin test news');
    await p.fill('[name=outlet]', 'Test');
    await p.fill('[name=date]', iso(new Date()));
    await p.fill('[name=url]', 'https://example.com/admin-test');
    await p.click('#save');
    await saved();
    check('newsOnPublicPage', (await pub('/news')).includes('Admin test news'));

    // Upcoming event: refused without a photo, saved with one
    await p.click('[data-tab="events"]');
    await p.click('#add-new');
    check('placementDefaultsAuto', await p.isChecked('[name=placement][value=auto]'));
    // A future event marked Past needs no photo and shows under Past events
    await p.fill('[name=title]', 'Admin test past talk');
    await p.fill('[name=start]', nextMonth);
    await p.fill('[name=venue]', 'IISc');
    await p.fill('[name=blurb]', 'A talk filed under past.');
    await p.check('[name=placement][value=past]');
    await p.click('#save');
    await saved();
    const evPast = await pub('/events');
    check('forcedPastShowsUnderPast', evPast.indexOf('Admin test past talk') > evPast.indexOf('Past events'));
    await p.click('#add-new');
    await p.fill('[name=title]', 'Admin test event');
    await p.fill('[name=start]', nextMonth);
    await p.fill('[name=venue]', 'ARTgarage');
    await p.fill('[name=blurb]', 'A test event.');
    await p.click('#save');
    await p.waitForSelector('[data-error-for="image"]:not(:empty)');
    check('eventNeedsPhoto', true);
    await p.setInputFiles('[name=imageFile]', png);
    await p.click('#save');
    await saved();
    const events = await pub('/events');
    check('eventUpcoming', events.indexOf('Admin test event') > -1 && events.indexOf('Admin test event') < events.indexOf('Past events'));

    // Tender: issued with its document, then bidding done with the result
    await p.click('[data-tab="tenders"]');
    await p.click('#add-new');
    await p.fill('[name=title]', 'Admin test tender');
    await p.fill('[name=cat]', 'Equipment');
    await p.fill('[name=published]', iso(new Date()));
    await p.check('[name=noPreBid]');
    await p.locator('.doc-row').nth(0).locator('[name=file]').setInputFiles(pdf);
    await p.click('#save');
    await saved();
    const tenderId = await p.getAttribute('#item-form', 'data-id');

    // Oversized uploads: a clear message, nothing sent
    await p.click('#add-doc');
    await p.locator('.doc-row').last().locator('[name=file]').setInputFiles(big);
    await p.click('#save');
    await p.waitForSelector('#status[data-state="error"]');
    check('bigFileMessage', /3 MB/.test(await p.textContent('#status')));
    await p.locator('.doc-row').last().locator('[name=file]').setInputFiles(half1);
    await p.click('#add-doc');
    await p.locator('.doc-row').last().locator('[name=file]').setInputFiles(half2);
    await p.click('#save');
    await p.waitForFunction(() => /separate saves/.test(document.querySelector('#status').textContent));
    check('totalSizeMessage', true);
    await p.click('[data-tab="tenders"]');
    await p.click(`[data-row="${tenderId}"] [data-edit]`);
    const track = (html) => (html.match(/Admin test tender[\s\S]*?<ol class="t-track">([\s\S]*?)<\/ol>/) || [, ''])[1];
    check('tenderOneStageDone', (track(await pub('/tenders')).match(/is-done/g) || []).length === 1);

    await p.locator('[name=phase]').evaluate((el) => { el.value = '4'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await p.click('#save');
    await p.waitForSelector('[data-error-for="docs"]:not(:empty)');
    check('phase4NeedsResult', true);
    await p.click('#add-doc');
    const last = p.locator('.doc-row').last();
    await last.locator('[name=label]').fill('Output of the price bid opening');
    await last.locator('[name=role]').selectOption('result');
    await last.locator('[name=file]').setInputFiles(result);
    await p.click('#save');
    await saved();
    const t4 = track(await pub('/tenders'));
    check('tenderAllStagesDone', (t4.match(/<li /g) || []).length === 4 && (t4.match(/is-done/g) || []).length === 4);

    // Delete all three
    for (const [tab, id] of [['news', 'admin-test-news'], ['events', 'admin-test-event'], ['events', 'admin-test-past-talk'], ['tenders', tenderId]]) {
      await p.click(`[data-tab="${tab}"]`);
      await row(id).locator('[data-delete]').click();
      await row(id).locator('[data-confirm-delete]').click();
      await saved();
    }
    check('deletedEverywhere', !(await pub('/news')).includes('Admin test news') && !(await pub('/events')).includes('Admin test event') && !(await pub('/events')).includes('Admin test past talk') && !(await pub('/tenders')).includes('Admin test tender'));
    const root = path.join(__dirname, '..');
    for (const f of [path.join(root, 'public/docs/tenders', tenderId), ...fs.readdirSync(path.join(root, 'public/assets/events')).filter((f) => f.startsWith('admin-test-event-')).map((f) => path.join(root, 'public/assets/events', f))]) fs.rmSync(f, { recursive: true, force: true });

    // Phone width
    await p.setViewportSize({ width: 390, height: 844 });
    await p.reload();
    await p.waitForSelector('[data-tab="events"]');
    await p.click('[data-tab="tenders"]');
    await p.locator('[data-row] [data-edit]').first().click();
    check('phoneNoOverflow', (await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 1);
    check('phonePanelFull', (await p.evaluate(() => document.querySelector('#panel').getBoundingClientRect().width)) >= 380);
    check('phoneSaveReachable', await p.evaluate(() => { const r = document.querySelector('#save').getBoundingClientRect(); return r.bottom <= window.innerHeight && r.top >= 0; }));
    await p.click('#cancel');

    await p.click('#logout');
    await p.waitForSelector('#login-email');
    check('logout', true);
  } catch (e) {
    results.exception = String(e).split('\n')[0];
  }
  results.errors = errors;
  console.log(JSON.stringify(results, null, 2));
  await b.close();
  process.exitCode = results.exception || errors.length || Object.values(results).includes(false) ? 1 : 0;
})();
