// Outreach admin: sign in, then add, edit and delete events, news and tenders through /api/content.
// Files are sent as base64 and referenced from the item as 'upload:N'.
(function () {
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var STAGES = ['Notice published', 'Pre-bid meeting', 'Corrigenda', 'Technical bids opened', 'Price bids opened'];
  var PAGE = { events: '/events', news: '/news', tenders: '/tenders' };
  var state = { data: null, tab: 'events', current: null };
  var today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function api(method, body) {
    return fetch('/api/' + (body && body.path || 'content'), {
      method: method, credentials: 'same-origin',
      headers: method === 'GET' ? {} : { 'Content-Type': 'application/json', 'X-Admin': '1' },
      body: method === 'GET' ? undefined : JSON.stringify(body.payload),
    }).then(function (r) {
      if (r.status === 401 && !(body && body.path === 'login')) { showLogin(); throw new Error('Please sign in again.'); }
      return r.status === 204 ? {} : r.json().then(function (j) { if (!r.ok) { var e = new Error(j.error || 'Something went wrong.'); e.fields = j.fields; throw e; } return j; });
    });
  }

  function status(state_, html) { var s = $('#status'); s.setAttribute('data-state', state_); s.innerHTML = html; }

  // ---------- login ----------
  function showLogin() { $('#login').hidden = false; $('#app').hidden = true; $('#logout').hidden = true; $('#who').hidden = true; }
  function showApp(email) {
    $('#login').hidden = true; $('#app').hidden = false; $('#logout').hidden = false;
    $('#who').hidden = false; $('#who').textContent = 'Signed in as ' + email;
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
  $('#logout').addEventListener('click', function () {
    api('POST', { path: 'logout', payload: {} }).then(showLogin, showLogin);
  });

  // ---------- lists ----------
  function load() { return api('GET').then(function (d) { state.data = d; }); }
  function sorted(tab) {
    var list = state.data[tab].slice();
    if (tab === 'events') list.sort(function (a, b) { return b.start.localeCompare(a.start); });
    if (tab === 'news') list.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    return list;
  }
  function meta(tab, x) {
    if (tab === 'events') return ((x.end || x.start) >= today ? 'Upcoming · ' : 'Past · ') + x.start + (x.venue ? ' · ' + x.venue : '');
    if (tab === 'news') return (x.date || '') + ' · ' + x.outlet;
    return { active: 'Active', closed: 'Closed', rfp: 'Request for proposals' }[x.status] + (x.status === 'rfp' ? '' : ' · ' + STAGES[x.phase]);
  }
  function renderList() {
    var list = sorted(state.tab);
    $('#count').textContent = list.length + (list.length === 1 ? ' entry' : ' entries');
    $('#list').innerHTML = list.map(function (x) {
      return '<li data-row="' + esc(x.id) + '"' + (state.current && state.current.id === x.id ? ' class="is-current"' : '') + '><div class="a-item"><b>' + esc(x.title) + '</b><span>' + esc(meta(state.tab, x)) + '</span></div>' +
        '<div class="a-actions"><button type="button" class="a-btn a-ghost a-small" data-edit>Edit</button><button type="button" class="a-btn a-danger a-small" data-delete>Delete</button></div></li>';
    }).join('');
  }
  $('#list').addEventListener('click', function (ev) {
    var li = ev.target.closest('[data-row]'); if (!li) return;
    var id = li.getAttribute('data-row');
    var item = state.data[state.tab].filter(function (x) { return x.id === id; })[0];
    if (ev.target.closest('[data-edit]')) openForm(item);
    if (ev.target.closest('[data-delete]')) {
      li.querySelector('.a-actions').innerHTML = '<span class="a-muted">Delete?</span><button type="button" class="a-btn a-danger a-small" data-confirm-delete>Yes, delete</button><button type="button" class="a-btn a-ghost a-small" data-cancel>Cancel</button>';
    }
    if (ev.target.closest('[data-cancel]')) renderList();
    if (ev.target.closest('[data-confirm-delete]')) {
      status('busy', 'Deleting…');
      api('POST', { payload: { kind: state.tab, action: 'delete', id: id } }).then(function (r) {
        if (state.current && state.current.id === id) closeForm();
        return load().then(function () { renderList(); done(r); });
      }).catch(function (e) { status('error', esc(e.message)); renderList(); });
    }
  });
  function selectTab(tab) {
    state.tab = tab;
    document.querySelectorAll('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-tab') === tab)); });
    closeForm(); status('', ''); renderList();
  }
  document.querySelectorAll('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { selectTab(b.getAttribute('data-tab')); }); });
  $('#add-new').addEventListener('click', function () { openForm(null); });
  function done(r) { status('ok', 'Saved. Live on the site in about 1–2 minutes. <a href="' + PAGE[state.tab] + '" target="_blank" rel="noopener">View the page →</a>'); }

  // ---------- forms ----------
  function field(name, label, value, opts) {
    opts = opts || {};
    var input = opts.type === 'textarea'
      ? '<textarea name="' + name + '"' + (opts.rows ? ' rows="' + opts.rows + '"' : '') + '>' + esc(value) + '</textarea>'
      : opts.type === 'select'
        ? '<select name="' + name + '">' + opts.options.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === value ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'
        : '<input name="' + name + '" type="' + (opts.type || 'text') + '" value="' + esc(value) + '"' + (opts.accept ? ' accept="' + opts.accept + '"' : '') + '>';
    return '<label>' + label + (opts.hint ? ' <span class="a-hint">' + opts.hint + '</span>' : '') + input + '<span class="a-field-err" data-error-for="' + (opts.errorFor || name) + '"></span></label>';
  }
  function closeForm() { state.current = null; $('#item-form').hidden = true; $('#item-form').removeAttribute('data-id'); $('#form-empty').hidden = false; }
  function openForm(item) {
    state.current = item;
    var f = $('#item-form'), x = item || {};
    var h = '<h2>' + (item ? 'Edit ' : 'New ') + { events: 'event', news: 'news item', tenders: 'tender' }[state.tab] + '</h2>';
    if (state.tab === 'events') {
      h += field('title', 'Title', x.title) +
        '<div class="a-row">' + field('start', 'Date', x.start, { type: 'date' }) + field('end', 'End date', x.end, { type: 'date', hint: 'if more than one day' }) + '</div>' +
        '<div class="a-row">' + field('time', 'Time', x.time, { hint: 'e.g. 10:30 AM to 1 PM' }) + field('venue', 'Venue', x.venue) + '</div>' +
        field('blurb', 'Short description', x.blurb, { type: 'textarea', rows: 3, hint: 'shown on the event card' }) +
        field('body', 'Full write-up', (x.body || []).join('\n\n'), { type: 'textarea', rows: 8, hint: 'optional; for the event page. Leave a blank line between paragraphs.' }) +
        (x.image ? '<img class="a-preview" src="' + esc(x.image) + '" alt="">' : '') +
        field('imageFile', 'Photo', '', { type: 'file', accept: 'image/jpeg,image/png,image/webp', hint: 'JPG, PNG or WebP, up to 3 MB. Required for upcoming events.' + (x.image ? ' Leave empty to keep the current photo.' : ''), errorFor: 'image' }) +
        field('imageAlt', 'Photo description', x.imageAlt, { hint: 'for screen readers' }) +
        '<div class="a-row">' + field('register', 'Registration link', x.register) + field('recap', 'Recap link', x.recap, { hint: 'if the recap is elsewhere, e.g. LinkedIn' }) + '</div>' +
        (item && !x.recap ? '<p class="a-readonly">Event page: /events/' + esc(x.id) + '</p>' : '');
    } else if (state.tab === 'news') {
      h += field('title', 'Headline', x.title) +
        '<div class="a-row">' + field('outlet', 'Outlet', x.outlet, { hint: 'e.g. The Economic Times' }) + field('date', 'Date', x.date, { type: 'date' }) + '</div>' +
        field('url', 'Article link', x.url);
    } else {
      var phase = item ? x.phase : 0;
      h += field('title', 'Title', x.title) +
        '<div class="a-row">' + field('cat', 'Category', x.cat || 'Equipment') +
        field('status', 'Status', x.status || 'active', { type: 'select', options: [['active', 'Active'], ['closed', 'Closed'], ['rfp', 'Request for proposals']] }) +
        field('published', 'Published', x.published, { type: 'date' }) + '</div>' +
        field('note', 'Note', x.note, { type: 'textarea', rows: 3, hint: 'optional, shown when the tender is opened' }) +
        '<div class="a-phase"><label>Progress <span class="a-hint">slide to the stage the tender has reached</span><input type="range" name="phase" min="0" max="4" step="1" value="' + phase + '"><span class="a-field-err" data-error-for="phase"></span></label><div class="a-steps" id="steps"></div></div>' +
        '<label class="a-check"><input type="checkbox" name="noPreBid"' + (item ? (x.noPreBid ? ' checked' : '') : '') + '> No pre-bid meeting</label>' +
        '<div class="a-row">' + field('preBid', 'Pre-bid meeting', x.preBid, { hint: 'e.g. 27 Feb 2025' }) + field('priceBidsDate', 'Price bids opened on', x.priceBidsDate, { type: 'date' }) + '</div>' +
        '<div><b style="font-size:13px;color:var(--ink-soft)">Documents</b> <span class="a-hint">The tender document is needed from the start, and the result document once bidding is done. Corrigenda and others are optional.</span><span class="a-field-err" data-error-for="docs" style="display:block"></span></div>' +
        '<div class="a-docs" id="docs"></div><div><button type="button" class="a-btn a-ghost a-small" id="add-doc">Add a document</button></div>';
    }
    h += '<div class="a-formfoot"><button type="submit" class="a-btn" id="save">' + (item ? 'Save changes' : 'Add') + '</button><button type="button" class="a-btn a-ghost" id="cancel">Cancel</button></div>';
    f.innerHTML = h;
    f.hidden = false; $('#form-empty').hidden = true;
    if (item) f.setAttribute('data-id', item.id); else f.removeAttribute('data-id');
    if (state.tab === 'tenders') {
      var docs = item ? x.docs : [{ label: 'Tender document', href: '', kind: '', role: 'tender' }];
      docs.forEach(addDoc);
      $('#add-doc').addEventListener('click', function () { addDoc({ label: '', href: '', kind: '', role: 'other' }); refreshPhase(); });
      f.phase.addEventListener('input', refreshPhase);
      f.noPreBid.addEventListener('change', refreshPhase);
      refreshPhase();
    }
    $('#cancel').addEventListener('click', function () { closeForm(); renderList(); });
    renderList();
    f.scrollIntoView({ block: 'nearest' });
  }

  function addDoc(d) {
    var row = document.createElement('div');
    row.className = 'doc-row';
    row.innerHTML = '<label>Label<input name="label" value="' + esc(d.label) + '"></label>' +
      '<label>Type<select name="role"><option value="tender">Tender document</option><option value="result">Result document</option><option value="other">Other (corrigendum, minutes…)</option></select></label>' +
      '<button type="button" class="a-btn a-danger a-small" data-remove-doc>Remove</button>' +
      '<div class="a-file"><label>Upload <span class="a-hint">PDF or DOCX, up to 3 MB</span><input type="file" name="file" accept=".pdf,.docx,application/pdf"></label>' +
      '<label>or a link<input name="href" value="' + esc(/^upload:/.test(d.href) ? '' : d.href) + '" placeholder="https://"></label></div>' +
      (d.href ? '<div class="a-current">Current: <a href="' + esc(d.href) + '" target="_blank" rel="noopener">' + esc(d.href) + '</a></div>' : '');
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
    document.querySelectorAll('.doc-row').forEach(function (row) {
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
    var f = ev.target, x = state.current || {}, uploads = [], jobs = [];
    var val = function (n) { return f[n] ? f[n].value.trim() : ''; };
    var upload = function (file) { var n = uploads.length; uploads.push(null); jobs.push(readFile(file).then(function (u) { uploads[n] = u; })); return 'upload:' + n; };
    var item = { id: x.id || '' };
    if (state.tab === 'events') {
      ['title', 'start', 'end', 'time', 'venue', 'blurb', 'imageAlt', 'register', 'recap'].forEach(function (n) { item[n] = val(n); });
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
      item.docs = Array.prototype.map.call(document.querySelectorAll('.doc-row'), function (row, i) {
        var file = row.querySelector('[name=file]').files[0];
        var link = row.querySelector('[name=href]').value.trim();
        var label = row.querySelector('[name=label]').value.trim();
        var prev = old.filter(function (d) { return d.label === label && d.href === link; })[0];
        return { label: label, role: row.querySelector('[name=role]').value, href: file ? upload(file) : link, kind: file ? '' : prev ? prev.kind : /drive\.google/.test(link) ? 'Drive' : /docs\.google/.test(link) ? 'Doc' : 'PDF' };
      });
    }
    document.querySelectorAll('[data-error-for]').forEach(function (e) { e.textContent = ''; });
    status('busy', 'Saving…');
    $('#save').disabled = true;
    Promise.all(jobs).then(function () {
      return api('POST', { payload: { kind: state.tab, action: 'save', item: item, uploads: uploads } });
    }).then(function (r) {
      return load().then(function () {
        openForm(state.data[state.tab].filter(function (y) { return y.id === r.id; })[0]);
        done(r);
      });
    }).catch(function (e) {
      status('error', esc(e.message));
      Object.keys(e.fields || {}).forEach(function (k) { var el = $('[data-error-for="' + k + '"]'); if (el) el.textContent = e.fields[k]; });
    }).then(function () { if ($('#save')) $('#save').disabled = false; });
  });

  fetch('/api/login', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (me) { if (me) showApp(me.email); else showLogin(); }, showLogin);
})();
