// Outreach admin: sign in, then add, edit and delete events, news and tenders through /api/content.
// Files are sent as base64 and referenced from the item as 'upload:N'.
(function () {
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var STAGES = ['Notice published', 'Pre-bid meeting', 'Corrigenda', 'Technical bids opened', 'Price bids opened'];
  var PAGE = { events: '/events', news: '/news', tenders: '/tenders' };
  var TITLE = { events: 'Events', news: 'News', tenders: 'Tenders' };
  var NOUN = { events: 'event', news: 'news item', tenders: 'tender' };
  var state = { data: null, tab: 'events', current: null, opener: null };
  var today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
  var MB3 = 3 * 1024 * 1024;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // Same rule as src/outreach/model.cjs isUpcoming.
  function isUpcoming(e) { return e.placement === 'upcoming' ? true : e.placement === 'past' ? false : (e.end || e.start) >= today; }

  function api(method, body) {
    return fetch('/api/' + (body && body.path || 'content'), {
      method: method, credentials: 'same-origin',
      headers: method === 'GET' ? {} : { 'Content-Type': 'application/json', 'X-Admin': '1' },
      body: method === 'GET' ? undefined : JSON.stringify(body.payload),
    }).then(function (r) {
      if (r.status === 401 && !(body && body.path === 'login')) { showLogin(); throw new Error('Please sign in again.'); }
      if (r.status === 204) return {};
      return r.json().catch(function () {
        return { error: r.status === 413 ? 'The files are too large to send. Each file can be at most 3 MB; upload them in separate saves.' : 'The server did not answer properly (' + r.status + '). Try again in a minute.' };
      }).then(function (j) { if (!r.ok) { var e = new Error(j.error || 'Something went wrong.'); e.fields = j.fields; throw e; } return j; });
    });
  }

  var toastTimer;
  function status(kind, html) {
    var s = $('#status');
    clearTimeout(toastTimer);
    s.setAttribute('data-state', kind); s.innerHTML = html;
    if (kind === 'ok') toastTimer = setTimeout(function () { s.innerHTML = ''; s.removeAttribute('data-state'); }, 9000);
  }

  // ---------- sign in ----------
  function showLogin() { $('#login').hidden = false; $('#app').hidden = true; closePanel(); }
  function showApp(email) {
    $('#login').hidden = true; $('#app').hidden = false;
    $('#who').textContent = email;
    load().then(function () { selectTab(state.tab); });
  }
  $('#login-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    $('#login-error').textContent = '';
    $('#login-submit').disabled = true;
    api('POST', { path: 'login', payload: { email: $('#login-email').value, password: $('#login-password').value } })
      .then(function () { $('#login-password').value = ''; return fetch('/api/login', { credentials: 'same-origin' }).then(function (r) { return r.json(); }); })
      .then(function (me) { showApp(me.email); })
      .catch(function (e) { $('#login-error').textContent = e.message; })
      .then(function () { $('#login-submit').disabled = false; });
  });
  $('#logout').addEventListener('click', function () { api('POST', { path: 'logout', payload: {} }).then(showLogin, showLogin); });

  // ---------- lists ----------
  function load() { return api('GET').then(function (d) { state.data = d; renderCounts(); }); }
  function renderCounts() {
    $$('[data-tab]').forEach(function (b) { b.querySelector('[data-count]').textContent = state.data[b.getAttribute('data-tab')].length; });
  }
  function sorted(tab) {
    var list = state.data[tab].slice();
    if (tab === 'events') list.sort(function (a, b) { var u = isUpcoming(b) - isUpcoming(a); return u || (isUpcoming(a) ? a.start.localeCompare(b.start) : b.start.localeCompare(a.start)); });
    if (tab === 'news') list.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    return list;
  }
  function fmt(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return +p[2] + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+p[1] - 1] + ' ' + p[0];
  }
  function rowParts(tab, x) {
    if (tab === 'events') {
      var up = isUpcoming(x);
      return { thumb: true, meta: fmt(x.start) + (x.venue ? ', ' + x.venue : ''), pill: up ? ['is-up', 'Upcoming'] : ['is-past', 'Past'] };
    }
    if (tab === 'news') return { meta: (x.date ? fmt(x.date) + ', ' : '') + x.outlet, pill: null };
    var st = { active: ['is-active', 'Active'], closed: ['is-closed', 'Closed'], rfp: ['is-rfp', 'RFP'] }[x.status] || ['is-past', x.status];
    return { meta: x.status === 'rfp' ? x.cat : STAGES[x.phase], pill: st };
  }
  function summary(tab) {
    var list = state.data[tab];
    if (tab === 'events') { var u = list.filter(isUpcoming).length; return u + ' upcoming · ' + (list.length - u) + ' past'; }
    if (tab === 'news') return list.length + (list.length === 1 ? ' story' : ' stories') + ' in the press';
    var a = list.filter(function (t) { return t.status === 'active'; }).length;
    return a + ' active · ' + (list.length - a) + ' closed or RFP';
  }
  function renderList() {
    var tab = state.tab;
    $('#section-title').textContent = TITLE[tab];
    $('#section-summary').textContent = summary(tab);
    $('#add-new').textContent = 'New ' + NOUN[tab];
    $('#list').innerHTML = sorted(tab).map(function (x) {
      var r = rowParts(tab, x);
      var current = state.current && state.current.id === x.id;
      return '<li data-row="' + esc(x.id) + '"' + (current ? ' class="is-current"' : '') + '>' +
        (r.thumb ? '<span class="a-thumb' + (x.image ? '" style="background-image:url(\'' + esc(x.image) + '\')"' : ' is-blank"') + '></span>' : '<span></span>') +
        '<span class="a-row-text"><span class="a-row-title">' + esc(x.title) + '</span><span class="a-row-meta">' + esc(r.meta) + '</span></span>' +
        (r.pill ? '<span class="pill ' + r.pill[0] + '">' + r.pill[1] + '</span>' : '<span></span>') +
        '<span class="a-actions"><button type="button" class="a-btn a-ghost a-small" data-edit>Edit</button><button type="button" class="a-btn a-danger a-small" data-delete>Delete</button></span></li>';
    }).join('');
    applySearch();
  }
  function applySearch() {
    var q = $('#search').value.trim().toLowerCase(), shown = 0;
    $$('#list [data-row]').forEach(function (li) {
      var ok = !q || li.querySelector('.a-row-title').textContent.toLowerCase().indexOf(q) > -1;
      li.hidden = !ok; if (ok) shown++;
    });
    $('#list-empty').hidden = shown > 0 || !q;
  }
  $('#search').addEventListener('input', applySearch);

  $('#list').addEventListener('click', function (ev) {
    var li = ev.target.closest('[data-row]'); if (!li) return;
    var id = li.getAttribute('data-row');
    var item = state.data[state.tab].filter(function (x) { return x.id === id; })[0];
    var actions = li.querySelector('.a-actions');
    if (ev.target.closest('[data-delete]')) {
      actions.classList.add('is-confirm');
      actions.innerHTML = '<span class="a-muted">Delete?</span><button type="button" class="a-btn a-danger a-small" data-confirm-delete>Yes, delete</button><button type="button" class="a-btn a-ghost a-small" data-cancel>Keep</button>';
      return;
    }
    if (ev.target.closest('[data-cancel]')) { renderList(); return; }
    if (ev.target.closest('[data-confirm-delete]')) {
      status('busy', 'Deleting…');
      api('POST', { payload: { kind: state.tab, action: 'delete', id: id } }).then(function () {
        if (state.current && state.current.id === id) closePanel();
        return load().then(function () { renderList(); status('ok', 'Deleted. The page updates in about 1–2 minutes.'); });
      }).catch(function (e) { status('error', esc(e.message)); renderList(); });
      return;
    }
    if (ev.target.closest('.a-actions')) { if (ev.target.closest('[data-edit]')) openForm(item, li); return; }
    openForm(item, li);
  });

  function selectTab(tab) {
    state.tab = tab;
    $$('[data-tab]').forEach(function (b) { if (b.getAttribute('data-tab') === tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    $('#search').value = '';
    closePanel(); renderList();
  }
  $$('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { selectTab(b.getAttribute('data-tab')); }); });
  $('#add-new').addEventListener('click', function (ev) { openForm(null, ev.currentTarget); });
  function saved(r) { status('ok', 'Saved. Live on the site in about 1–2 minutes. <a href="' + PAGE[state.tab] + '" target="_blank" rel="noopener">View the page</a>'); }

  // ---------- panel ----------
  function closePanel() {
    state.current = null;
    $('#panel').hidden = true; $('#scrim').hidden = true;
    $('#app').classList.remove('has-panel');
    $('#item-form').removeAttribute('data-id');
    if (state.opener && document.contains(state.opener)) state.opener.focus();
    state.opener = null;
  }
  $('#scrim').addEventListener('click', function () { closePanel(); renderList(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#panel').hidden) { closePanel(); renderList(); } });

  function field(name, label, value, opts) {
    opts = opts || {};
    var input = opts.type === 'textarea'
      ? '<textarea name="' + name + '"' + (opts.rows ? ' rows="' + opts.rows + '"' : '') + '>' + esc(value) + '</textarea>'
      : opts.type === 'select'
        ? '<select name="' + name + '">' + opts.options.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === value ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'
        : '<input name="' + name + '" type="' + (opts.type || 'text') + '" value="' + esc(value) + '"' + (opts.ph ? ' placeholder="' + esc(opts.ph) + '"' : '') + '>';
    return '<label>' + label + (opts.hint ? ' <span class="a-hint">' + opts.hint + '</span>' : '') + input + '<span class="a-field-err" data-error-for="' + (opts.errorFor || name) + '"></span></label>';
  }
  var group = function (title, html) { return '<div class="a-group"><h3>' + title + '</h3>' + html + '</div>'; };

  function openForm(item, opener) {
    state.current = item;
    state.opener = opener || null;
    var f = $('#item-form'), x = item || {}, body = '';
    if (state.tab === 'events') {
      var placement = x.placement || 'auto';
      body = group('Basics', field('title', 'Title', x.title) +
          field('blurb', 'Short description', x.blurb, { type: 'textarea', rows: 3, hint: 'Shown on the event card.' }) +
          field('body', 'Full write-up', (x.body || []).join('\n\n'), { type: 'textarea', rows: 6, hint: 'Optional, for the event page. Leave a blank line between paragraphs.' })) +
        group('Show on site as', '<div class="a-seg" role="radiogroup" aria-label="Show on site as">' +
          [['auto', 'Auto'], ['upcoming', 'Upcoming'], ['past', 'Past']].map(function (o) { return '<label><input type="radio" name="placement" value="' + o[0] + '"' + (placement === o[0] ? ' checked' : '') + '>' + o[1] + '</label>'; }).join('') +
          '</div><p class="a-hint" id="placement-hint"></p><span class="a-field-err" data-error-for="placement"></span>') +
        group('When and where', '<div class="a-row2">' + field('start', 'Date', x.start, { type: 'date' }) + field('end', 'End date', x.end, { type: 'date', hint: 'If more than one day.' }) + '</div>' +
          '<div class="a-row2">' + field('time', 'Time', x.time, { ph: '10:30 AM to 1 PM' }) + field('venue', 'Venue', x.venue) + '</div>') +
        group('Photo', '<label class="a-drop" id="drop"><input type="file" name="imageFile" accept="image/jpeg,image/png,image/webp">' +
          '<img id="photo-preview" alt=""' + (x.image ? ' src="' + esc(x.image) + '"' : ' hidden') + '><span id="drop-text">' + (x.image ? 'Drop a new photo here or click to replace it' : 'Drop a photo here or click to choose') + '<br><span class="a-hint">JPG, PNG or WebP, up to 3 MB. <b id="photo-need"></b></span></span></label>' +
          '<span class="a-field-err" data-error-for="image"></span>' +
          field('imageAlt', 'Photo description', x.imageAlt, { hint: 'For screen readers.' })) +
        group('Links', field('register', 'Registration link', x.register, { ph: 'https://' }) + field('recap', 'Recap link', x.recap, { ph: 'https://', hint: 'If the recap lives elsewhere, such as LinkedIn.' }) +
          (item && !x.recap ? '<p class="a-readonly">Event page: /events/' + esc(x.id) + '</p>' : ''));
    } else if (state.tab === 'news') {
      body = group('Article', field('title', 'Headline', x.title) +
        '<div class="a-row2">' + field('outlet', 'Outlet', x.outlet, { ph: 'The Economic Times' }) + field('date', 'Date', x.date, { type: 'date' }) + '</div>' +
        field('url', 'Article link', x.url, { ph: 'https://' }));
    } else {
      var phase = item ? x.phase : 0;
      body = group('Basics', field('title', 'Title', x.title) +
          '<div class="a-row2">' + field('cat', 'Category', x.cat || 'Equipment') +
          field('status', 'Status', x.status || 'active', { type: 'select', options: [['active', 'Active'], ['closed', 'Closed'], ['rfp', 'Request for proposals']] }) + '</div>' +
          field('published', 'Published', x.published, { type: 'date' }) +
          field('note', 'Note', x.note, { type: 'textarea', rows: 3, hint: 'Optional, shown when the tender is opened.' })) +
        group('Progress', '<div class="a-phase"><label>Stage reached <span class="a-hint">Slide to the stage the tender has reached.</span><input type="range" name="phase" min="0" max="4" step="1" value="' + phase + '"><span class="a-field-err" data-error-for="phase"></span></label><div class="a-steps" id="steps"></div></div>' +
          '<label class="a-check"><input type="checkbox" name="noPreBid"' + (x.noPreBid ? ' checked' : '') + '> No pre-bid meeting</label>' +
          '<div class="a-row2">' + field('preBid', 'Pre-bid meeting', x.preBid, { ph: '27 Feb 2025' }) + field('priceBidsDate', 'Price bids opened on', x.priceBidsDate, { type: 'date' }) + '</div>') +
        group('Documents', '<p class="a-hint">The tender document is needed from the start, and the result document once bidding is done. Corrigenda and others are optional.</p><span class="a-field-err" data-error-for="docs"></span>' +
          '<div class="a-docs" id="docs"></div><div><button type="button" class="a-btn a-ghost a-small" id="add-doc">Add a document</button></div>');
    }
    f.innerHTML = '<div class="a-panel-head"><h2>' + (item ? 'Edit ' : 'New ') + NOUN[state.tab] + '</h2><button type="button" class="a-close" id="close" aria-label="Close">×</button></div>' +
      '<div class="a-panel-body">' + body + '</div>' +
      '<div class="a-panel-foot"><button type="submit" class="a-btn" id="save">' + (item ? 'Save changes' : 'Add ' + NOUN[state.tab]) + '</button><button type="button" class="a-btn a-ghost" id="cancel">Cancel</button></div>';
    if (item) f.setAttribute('data-id', item.id); else f.removeAttribute('data-id');
    $('#panel').hidden = false; $('#scrim').hidden = false;
    $('#app').classList.add('has-panel');
    $('#panel').scrollTop = 0;

    if (state.tab === 'events') wireEvent(f);
    if (state.tab === 'tenders') {
      (item ? x.docs : [{ label: 'Tender document', href: '', kind: '', role: 'tender' }]).forEach(addDoc);
      $('#add-doc').addEventListener('click', function () { addDoc({ label: '', href: '', kind: '', role: 'other' }); refreshPhase(); });
      f.phase.addEventListener('input', refreshPhase);
      f.noPreBid.addEventListener('change', refreshPhase);
      refreshPhase();
    }
    $('#cancel').addEventListener('click', function () { closePanel(); renderList(); });
    $('#close').addEventListener('click', function () { closePanel(); renderList(); });
    renderList();
    f.title.focus({ preventScroll: true });
  }

  function wireEvent(f) {
    var hint = function () {
      var v = (f.querySelector('[name=placement]:checked') || {}).value;
      var e = { placement: v, start: f.start.value, end: f.end.value };
      var up = e.start ? isUpcoming(e) : v === 'upcoming';
      $('#placement-hint').textContent = v === 'auto' ? 'Shows as upcoming until the date has passed, then moves to past.' : v === 'upcoming' ? 'Always shows as upcoming, whatever the date.' : 'Always shows under past events.';
      $('#photo-need').textContent = up ? 'Required: this event shows as upcoming.' : '';
    };
    $$('[name=placement]', f).forEach(function (r) { r.addEventListener('change', hint); });
    f.start.addEventListener('input', hint); f.end.addEventListener('input', hint);
    hint();
    var drop = $('#drop'), input = f.imageFile;
    var show = function () {
      var file = input.files[0]; if (!file) return;
      var img = $('#photo-preview'); img.src = URL.createObjectURL(file); img.hidden = false;
      $('#drop-text').firstChild.textContent = file.name;
    };
    input.addEventListener('change', show);
    ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('is-over'); }); });
    ['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function () { drop.classList.remove('is-over'); }); });
    drop.addEventListener('drop', function (e) {
      e.preventDefault();
      if (e.dataTransfer.files[0]) { var dt = new DataTransfer(); dt.items.add(e.dataTransfer.files[0]); input.files = dt.files; show(); }
    });
  }

  function addDoc(d) {
    var row = document.createElement('div');
    row.className = 'doc-row';
    row.innerHTML = '<label>Label<input name="label" value="' + esc(d.label) + '"></label>' +
      '<label>Type<select name="role"><option value="tender">Tender document</option><option value="result">Result document</option><option value="other">Other (corrigendum, minutes)</option></select></label>' +
      '<button type="button" class="a-btn a-danger a-small" data-remove-doc>Remove</button>' +
      '<div class="a-file"><label>Upload <span class="a-hint">PDF or DOCX, up to 3 MB</span><input type="file" name="file" accept=".pdf,.docx,application/pdf"></label>' +
      '<label>Or a link<input name="href" value="' + esc(/^upload:/.test(d.href) ? '' : d.href) + '" placeholder="https://"></label></div>' +
      (d.href ? '<div class="a-current">Current file: <a href="' + esc(d.href) + '" target="_blank" rel="noopener">' + esc(d.href) + '</a></div>' : '');
    row.querySelector('[name=role]').value = d.role;
    row.querySelector('[name=role]').addEventListener('change', refreshPhase);
    row.querySelector('[data-remove-doc]').addEventListener('click', function () { row.remove(); refreshPhase(); });
    row.querySelector('[name=file]').addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (file && !row.querySelector('[name=label]').value) row.querySelector('[name=label]').value = file.name.replace(/\.[^.]+$/, '');
    });
    $('#docs').appendChild(row);
  }

  function refreshPhase() {
    var f = $('#item-form'), off = f.noPreBid.checked, r = f.phase, v = +r.value;
    if (off && v === 1) { v = (r.dataset.prev && +r.dataset.prev > 1) ? 0 : 2; r.value = v; }
    r.dataset.prev = v;
    $('#steps').innerHTML = STAGES.map(function (s, i) { return '<span class="' + (i === 1 && off ? 'is-off' : i <= v ? 'is-done' : '') + '">' + s + '</span>'; }).join('');
    $$('.doc-row').forEach(function (row) {
      var role = row.querySelector('[name=role]').value;
      row.classList.toggle('is-needed', role === 'tender' || (role === 'result' && v === 4));
    });
  }

  function readFile(file) {
    return new Promise(function (ok, bad) {
      var fr = new FileReader();
      fr.onload = function () { ok({ name: file.name, data: String(fr.result).split(',')[1] }); };
      fr.onerror = function () { bad(new Error('Could not read ' + file.name)); };
      fr.readAsDataURL(file);
    });
  }

  $('#item-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = ev.target, x = state.current || {}, uploads = [], jobs = [], total = 0, tooBig = null;
    var val = function (n) { return f[n] && f[n].value != null ? String(f[n].value).trim() : ''; };
    var upload = function (file) { total += file.size; if (file.size > MB3) tooBig = file.name; var n = uploads.length; uploads.push(null); jobs.push(readFile(file).then(function (u) { uploads[n] = u; })); return 'upload:' + n; };
    var item = { id: x.id || '' };
    if (state.tab === 'events') {
      ['title', 'start', 'end', 'time', 'venue', 'blurb', 'imageAlt', 'register', 'recap'].forEach(function (n) { item[n] = val(n); });
      item.placement = (f.querySelector('[name=placement]:checked') || {}).value || 'auto';
      item.body = val('body') ? val('body').split(/\n\s*\n/).map(function (p) { return p.replace(/\s*\n\s*/g, ' ').trim(); }).filter(Boolean) : [];
      item.image = f.imageFile.files[0] ? upload(f.imageFile.files[0]) : (x.image || '');
      item.source = x.source || '';
    } else if (state.tab === 'news') {
      ['title', 'outlet', 'date', 'url'].forEach(function (n) { item[n] = val(n); });
      item.dateLabel = x.date === item.date ? (x.dateLabel || '') : '';
    } else {
      ['title', 'cat', 'status', 'published', 'note', 'preBid', 'priceBidsDate'].forEach(function (n) { item[n] = val(n); });
      item.phase = +f.phase.value;
      item.noPreBid = f.noPreBid.checked;
      var old = x.docs || [];
      item.docs = $$('.doc-row').map(function (row) {
        var file = row.querySelector('[name=file]').files[0];
        var link = row.querySelector('[name=href]').value.trim();
        var label = row.querySelector('[name=label]').value.trim();
        var prev = old.filter(function (d) { return d.label === label && d.href === link; })[0];
        return { label: label, role: row.querySelector('[name=role]').value, href: file ? upload(file) : link, kind: file ? '' : prev ? prev.kind : /drive\.google/.test(link) ? 'Drive' : /docs\.google/.test(link) ? 'Doc' : 'PDF' };
      });
    }
    $$('[data-error-for]').forEach(function (e) { e.textContent = ''; });
    // Vercel accepts about 4.5 MB per request, and files grow by a third when sent.
    if (tooBig) return status('error', esc('"' + tooBig + '" is larger than 3 MB. Compress it, or upload it elsewhere and paste a link.'));
    if (total > MB3) return status('error', 'Together these files are larger than 3 MB. Upload them in separate saves: add one, save, then add the next.');
    status('busy', 'Saving…');
    $('#save').disabled = true;
    Promise.all(jobs).then(function () {
      return api('POST', { payload: { kind: state.tab, action: 'save', item: item, uploads: uploads } });
    }).then(function (r) {
      return load().then(function () {
        var fresh = state.data[state.tab].filter(function (y) { return y.id === r.id; })[0];
        if (fresh) openForm(fresh); else { closePanel(); renderList(); }
        saved(r);
      });
    }).catch(function (e) {
      status('error', esc(e.message));
      Object.keys(e.fields || {}).forEach(function (k) { var el = $('[data-error-for="' + k + '"]'); if (el) el.textContent = e.fields[k]; });
      var first = $('.a-field-err:not(:empty)'); if (first) first.scrollIntoView({ block: 'center' });
    }).then(function () { if ($('#save')) $('#save').disabled = false; });
  });

  fetch('/api/login', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (me) { if (me) showApp(me.email); else showLogin(); }, showLogin);
})();
