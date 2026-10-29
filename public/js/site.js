// Interactions ported from the manager's Claude Design components (SiteHeader, Contact, ...).
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // ---------- Reveal on scroll ----------
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px 12% 0px' });
    reveals.forEach(function (r) { io.observe(r); });
  } else { reveals.forEach(function (r) { r.classList.add('in'); }); }

  // ---------- Header dropdowns (SiteHeader.dc.html) ----------
  // Open on hover or click; close on outside click and Escape. Marker + / −.
  var menus = Array.prototype.slice.call(document.querySelectorAll('.nav-menu'));
  var isMobile = function () { return window.matchMedia('(max-width: 960px)').matches; };

  function setMenu(menu, open) {
    var btn = menu.querySelector('button');
    var drop = menu.querySelector('.nav-dropdown');
    drop.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.style.color = open ? 'var(--artblue)' : btn.getAttribute('data-ink');
    menu.querySelector('[data-marker]').textContent = open ? '−' : '+';
  }
  function closeAll(except) { menus.forEach(function (m) { if (m !== except) setMenu(m, false); }); }

  menus.forEach(function (menu) {
    var btn = menu.querySelector('button');
    var hoverOpened = false;
    menu.addEventListener('mouseenter', function () { if (!isMobile()) { closeAll(menu); setMenu(menu, true); hoverOpened = true; } });
    menu.addEventListener('mouseleave', function () { if (!isMobile()) { setMenu(menu, false); hoverOpened = false; } });
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      // A click right after hover-open should not close the menu it just opened
      // (his original toggled it shut). Keyboard and touch still toggle.
      if (hoverOpened) { hoverOpened = false; return; }
      var open = btn.getAttribute('aria-expanded') !== 'true';
      closeAll(menu);
      setMenu(menu, open);
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.nav-menu')) closeAll();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeAll(); closeMobileNav(); }
  });

  // ---------- Mobile navigation (added: his header has no small-screen menu) ----------
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  function closeMobileNav() {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    nav.classList.remove('is-open');
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('is-open', open);
    });
    window.addEventListener('resize', function () { if (!isMobile()) closeMobileNav(); });
  }

  // ---------- Role chips (Contact.dc.html, ARTPARK-Home.dc.html) ----------
  // Selected chip styles come from data attributes so each page keeps its own palette.
  document.querySelectorAll('[data-role-group]').forEach(function (group) {
    var on = JSON.parse(group.getAttribute('data-on'));
    var off = JSON.parse(group.getAttribute('data-off'));
    group.querySelectorAll('[data-role]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        group.querySelectorAll('[data-role]').forEach(function (c) {
          var sel = c === chip;
          var s = sel ? on : off;
          c.setAttribute('aria-pressed', sel ? 'true' : 'false');
          c.style.background = s.bg; c.style.color = s.ink; c.style.borderColor = s.border;
        });
        group.setAttribute('data-value', chip.getAttribute('data-role'));
        // Contact page: the intro, message label and placeholder follow the role (copy in src/pages/contact.cjs).
        var copy = window.AP_ROLE_COPY && window.AP_ROLE_COPY[chip.getAttribute('data-role')];
        if (copy) {
          var intro = document.querySelector('[data-role-intro]');
          var label = document.querySelector('[data-role-label]');
          var box = document.querySelector('textarea[name=message]');
          if (intro) intro.textContent = copy.intro;
          if (label) label.textContent = copy.label;
          if (box) box.setAttribute('placeholder', copy.placeholder);
        }
      });
    });
  });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Home collage (ARTPARK-Home.dc.html, tiles + chips) ----------
  // Hover/focus a tile or its chip: that tile rises with an artblue border and its caption,
  // the others fade to 50%. Leaving the collage resets.
  var collage = document.querySelector('[data-collage]');
  if (collage) {
    var tiles = collage.querySelectorAll('[data-tile]');
    var chips = collage.querySelectorAll('[data-chip]');
    var hint = collage.querySelector('[data-collage-hint]');
    var HINT_IDLE = 'Hover over a picture or a label to see where it comes from in the stories.';
    var HINT_ON = 'Click the picture to read the story.';
    var setHover = function (hv) {
      tiles.forEach(function (t, i) {
        var on = hv === i, core = t.hasAttribute('data-core');
        t.style.zIndex = on ? 20 : core ? 10 : i + 1;
        t.style.opacity = hv !== -1 && !on ? 0.5 : 1;
        t.style.borderColor = core ? 'var(--artlight)' : on ? 'var(--artblue)' : '#fff';
        t.querySelector('[data-cap]').style.opacity = on ? 1 : 0;
      });
      chips.forEach(function (c, i) {
        var on = hv === i, core = c.hasAttribute('data-core');
        c.style.background = on ? 'var(--artblue)' : core ? 'var(--artlight)' : 'transparent';
        c.style.color = on ? '#fff' : 'var(--artblue)';
        c.style.borderColor = on ? 'var(--artblue)' : core ? 'var(--artlight)' : 'var(--line-strong)';
      });
      if (hint) hint.textContent = hv === -1 ? HINT_IDLE : HINT_ON;
    };
    var bind = function (el, i) {
      el.addEventListener('mouseenter', function () { setHover(i); });
      el.addEventListener('focus', function () { setHover(i); });
    };
    tiles.forEach(function (t, i) { bind(t, i); t.addEventListener('blur', function () { setHover(-1); }); });
    chips.forEach(function (c, i) { bind(c, i); c.addEventListener('click', function () { setHover(i); }); });
    collage.addEventListener('mouseleave', function () { setHover(-1); });
  }

  // ---------- Home stories carousel ----------
  // His behaviour: auto-advance every 9s, pause while hovered; tabs and arrows jump and pause.
  var carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    var slides = carousel.querySelectorAll('[data-slide]');
    var tabs = carousel.querySelectorAll('[data-go]');
    var count = carousel.querySelector('[data-count]');
    var n = slides.length, cur = 0, paused = false;
    var show = function (i) {
      cur = (i + n) % n;
      slides.forEach(function (s, k) {
        var on = k === cur;
        s.style.opacity = on ? 1 : 0;
        s.style.visibility = on ? 'visible' : 'hidden';
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
        s.querySelectorAll('a').forEach(function (a) { a.tabIndex = on ? 0 : -1; });
      });
      tabs.forEach(function (t, k) {
        var on = k === cur;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.style.borderTopColor = on ? 'var(--artblue)' : 'var(--line-strong)';
        t.style.color = on ? 'var(--artblue)' : 'var(--ink-soft)';
      });
      count.textContent = String(cur + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
    };
    // Autoplay driven by a JS clock (7s per story). It keeps running while you look at it;
    // a manual click holds the chosen story for 15s, then autoplay resumes.
    var DUR = 7000, t0 = performance.now(), holdUntil = 0;
    var go = function (i) { show(i); t0 = performance.now(); holdUntil = t0 + 15000; };
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { go(k); }); });
    carousel.querySelector('[data-prev]').addEventListener('click', function () { go(cur - 1); });
    carousel.querySelector('[data-next]').addEventListener('click', function () { go(cur + 1); });
    show(0);
    var tick = function (now) {
      if (document.hidden || now < holdUntil) { t0 = now - 0; }
      var p = Math.min(1, (now - t0) / DUR);
      tabs.forEach(function (t, k) { var b = t.querySelector('.tab-progress'); if (b) b.style.width = k === cur ? (p * 100) + '%' : '0%'; });
      if (p >= 1) { show(cur + 1); t0 = now; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ---------- Home founder stories: featured founder, logo picker, autoplay with progress ----------
  var rail = document.querySelector('[data-rail]');
  if (rail) {
    var fslides = rail.querySelectorAll('[data-rail-slide]');
    var picks = rail.querySelectorAll('[data-rail-go]');
    var rc = rail.querySelector('[data-rail-count]');
    var fn = fslides.length, fcur = 0, FDUR = 6500, ft0 = performance.now(), fhold = 0, fhover = false, fvisible = false;
    var fshow = function (i) {
      fcur = (i + fn) % fn;
      fslides.forEach(function (sl, k) {
        var on = k === fcur;
        sl.classList.toggle('is-on', on);
        sl.setAttribute('aria-hidden', on ? 'false' : 'true');
        sl.querySelectorAll('a.btn').forEach(function (a) { a.tabIndex = on ? 0 : -1; });
      });
      picks.forEach(function (p, k) { var on = k === fcur; p.classList.toggle('is-on', on); p.setAttribute('aria-selected', on ? 'true' : 'false'); });
      rc.textContent = String(fcur + 1).padStart(2, '0') + ' / ' + String(fn).padStart(2, '0');
      ft0 = performance.now();
    };
    var fgo = function (i) { fshow(i); fhold = performance.now() + 12000; };
    picks.forEach(function (p, k) { p.addEventListener('click', function () { fgo(k); }); p.addEventListener('mouseenter', function () { if (k !== fcur) fgo(k); }); });
    rail.querySelector('[data-rail-prev]').addEventListener('click', function () { fgo(fcur - 1); });
    rail.querySelector('[data-rail-next]').addEventListener('click', function () { fgo(fcur + 1); });
    var stage = rail.querySelector('[data-rail-stage]');
    stage.addEventListener('mouseenter', function () { fhover = true; });
    stage.addEventListener('mouseleave', function () { fhover = false; });
    rail.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') fgo(fcur + 1); if (e.key === 'ArrowLeft') fgo(fcur - 1); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { fvisible = e[0].isIntersecting; }, { threshold: 0.25 }).observe(rail);
    // Swipe on touch screens.
    var sx = null;
    stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) fgo(fcur + (dx < 0 ? 1 : -1)); sx = null; });
    var ftick = function (now) {
      var running = fvisible && !fhover && !document.hidden && now > fhold && !reduceMotion;
      if (!running) ft0 = now - (picks[fcur]._p || 0) * FDUR;
      var p = Math.min(1, (now - ft0) / FDUR);
      picks.forEach(function (pk, k) { pk._p = k === fcur ? p : 0; pk.querySelector('.fs-bar').style.transform = 'scaleX(' + pk._p + ')'; });
      if (p >= 1) fshow(fcur + 1);
      requestAnimationFrame(ftick);
    };
    requestAnimationFrame(ftick);
  }

  // ---------- FAQ (topic tabs + accordion with round +/− marker) ----------
  document.querySelectorAll('[data-faq]').forEach(function (faq) {
    var ftabs = faq.querySelectorAll('[data-faq-tab]');
    var panels = faq.querySelectorAll('[data-faq-panel]');
    var setItem = function (item, open) {
      var b = item.querySelector('button'), ring = item.querySelector('[data-ring]');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      item.querySelector('[role="region"]').hidden = !open;
      ring.textContent = open ? '−' : '+';
      ring.style.borderColor = open ? 'var(--artblue)' : 'var(--ink)';
      ring.style.background = open ? 'var(--artblue)' : 'transparent';
      ring.style.color = open ? '#fff' : 'var(--ink)';
    };
    ftabs.forEach(function (t, k) {
      t.addEventListener('click', function () {
        ftabs.forEach(function (o, j) {
          var on = j === k;
          o.setAttribute('aria-selected', on ? 'true' : 'false');
          o.style.background = on ? 'var(--artlight)' : 'var(--paper)';
          o.style.color = on ? 'var(--artblue)' : 'var(--ink)';
          o.style.borderColor = on ? 'var(--artlight)' : 'var(--line-strong)';
        });
        panels.forEach(function (p, j) {
          p.hidden = j !== k;
          // His behaviour: switching topic opens that topic's first question.
          p.querySelectorAll('.faq-item').forEach(function (it, m) { setItem(it, j === k && m === 0); });
        });
      });
    });
    faq.querySelectorAll('.faq-item').forEach(function (item) {
      item.querySelector('button').addEventListener('click', function () {
        var open = this.getAttribute('aria-expanded') !== 'true';
        item.parentNode.querySelectorAll('.faq-item').forEach(function (o) { setItem(o, false); });
        setItem(item, open);
      });
    });
  });

  // ---------- Home "Start a conversation" (his form only set local state; now it opens an email) ----------
  var quick = document.querySelector('[data-quick-form]');
  if (quick) {
    quick.addEventListener('submit', function (e) {
      e.preventDefault();
      var wrap = quick.closest('[data-quick-contact]');
      var role = wrap.querySelector('[data-role-group]').getAttribute('data-value');
      var email = quick.elements.email.value;
      var subject = 'Website enquiry — ' + role;
      var body = 'Email: ' + email + '\nI am a: ' + role + '\n\nWhat I am working on, and where I am stuck:\n';
      window.location.href = 'mailto:' + quick.getAttribute('data-mailto') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      wrap.hidden = true;
      document.querySelector('[data-quick-sent]').hidden = false;
    });
  }

  // Shared: style a group of his square filter buttons (black when active).
  var pressBlack = function (btns, on) {
    btns.forEach(function (b) {
      var sel = b === on;
      b.setAttribute('aria-pressed', sel ? 'true' : 'false');
      b.style.background = sel ? 'var(--artblack)' : 'transparent';
      b.style.color = sel ? '#fff' : 'var(--ink)';
      b.style.borderColor = sel ? 'var(--artblack)' : 'var(--line-strong)';
    });
  };

  // ---------- Tenders: status filter + expand a tender's documents ----------
  var tenderList = document.querySelector('[data-tenders]');
  if (tenderList) {
    var tf = tenderList.querySelectorAll('[data-filter]');
    tf.forEach(function (b) {
      b.addEventListener('click', function () {
        pressBlack(tf, b);
        var f = b.getAttribute('data-filter');
        tenderList.querySelectorAll('[data-item]').forEach(function (it) {
          it.hidden = !(f === 'all' || it.getAttribute('data-status') === f);
        });
      });
    });
    tenderList.querySelectorAll('[data-open]').forEach(function (b) {
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.getElementById(b.getAttribute('aria-controls')).hidden = !open;
        b.innerHTML = open ? 'Close <span class="arrow">−</span>' : 'View <span class="arrow">→</span>';
      });
    });
  }

  // ---------- Careers: search, category and work-mode filters (Careers.dc.html) ----------
  var careers = document.querySelector('[data-careers]');
  if (careers) {
    var state = { org: 'all', cat: 'All categories', mode: 'All', q: '' };
    var paintBlue = function (btns, attr, val) {
      btns.forEach(function (b) {
        var on = b.getAttribute(attr) === val;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.style.background = on ? 'var(--artblue)' : 'transparent';
        b.style.color = on ? '#fff' : b.disabled ? 'var(--ink-dim)' : 'var(--ink)';
      });
    };
    var cats = careers.querySelectorAll('button[data-cat]');
    var orgs = careers.querySelectorAll('button[data-org]');
    var modes = careers.querySelectorAll('button[data-mode]');
    var jobsEls = careers.querySelectorAll('[data-job]');
    var apply = function () {
      var n = 0, q = state.q.trim().toLowerCase();
      jobsEls.forEach(function (j) {
        var ok = (state.org === 'all' || j.getAttribute('data-org') === state.org) &&
          (state.cat === 'All categories' || j.getAttribute('data-cat') === state.cat) &&
          (state.mode === 'All' || j.getAttribute('data-mode') === state.mode) &&
          (!q || j.getAttribute('data-text').indexOf(q) !== -1);
        j.hidden = !ok; if (ok) n++;
      });
      careers.querySelectorAll('[data-group]').forEach(function (g) { g.hidden = !g.querySelector('[data-job]:not([hidden])'); });
      careers.querySelector('[data-count]').textContent = n + (n === 1 ? ' open role' : ' open roles');
      careers.querySelector('[data-empty]').hidden = n !== 0;
    };
    orgs.forEach(function (b) { b.addEventListener('click', function () { state.org = b.getAttribute('data-org'); paintBlue(orgs, 'data-org', state.org); apply(); }); });
    cats.forEach(function (b) { b.addEventListener('click', function () { state.cat = b.getAttribute('data-cat'); paintBlue(cats, 'data-cat', state.cat); apply(); }); });
    modes.forEach(function (b) { b.addEventListener('click', function () { state.mode = b.getAttribute('data-mode'); paintBlue(modes, 'data-mode', state.mode); apply(); }); });
    careers.querySelector('[data-q]').addEventListener('input', function (e) { state.q = e.target.value; apply(); });
  }

  // ---------- Partnerships: partner-type tabs, chip fields, mailto form (Partnerships.dc.html) ----------
  var partner = document.querySelector('[data-partner]');
  if (partner) {
    var ptabs = partner.querySelectorAll('[data-ptype]');
    ptabs.forEach(function (t) {
      t.addEventListener('click', function () {
        ptabs.forEach(function (o) {
          var on = o === t;
          o.setAttribute('aria-selected', on ? 'true' : 'false');
          o.style.background = on ? 'var(--artblue)' : 'var(--paper)';
          o.style.color = on ? '#fff' : 'var(--ink)';
          o.style.borderColor = on ? 'var(--artblue)' : 'var(--line)';
        });
        partner.querySelectorAll('[data-ppanel]').forEach(function (p) { p.hidden = p.getAttribute('data-ppanel') !== t.getAttribute('data-ptype'); });
      });
    });
    partner.querySelectorAll('[data-chip]').forEach(function (c) {
      c.addEventListener('click', function () {
        var on = c.getAttribute('aria-pressed') !== 'true';
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
        c.style.background = on ? 'var(--artblue)' : 'transparent';
        c.style.color = on ? '#fff' : 'var(--ink)';
        c.style.borderColor = on ? 'var(--artblue)' : 'var(--line-strong)';
      });
    });
    partner.querySelectorAll('[data-pform]').forEach(function (form) {
      var panel = form.closest('[data-ppanel]');
      var msg = form.querySelector('[data-msg]');
      var setMsg = function (t, err) { msg.textContent = t; msg.style.color = err ? 'var(--accent-coral)' : 'var(--ink-dim)'; msg.style.fontWeight = err ? '600' : '400'; };
      form.addEventListener('input', function () { setMsg('Goes to connect@artpark.in · * required', false); });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var label = function (el) { return el.closest('div').querySelector('.eyebrow').textContent.replace(' *', ''); };
        var miss = Array.prototype.filter.call(form.querySelectorAll('[data-req]'), function (el) { return !el.value.trim(); });
        if (miss.length) return setMsg('Please fill in: ' + miss.map(label).join(', ') + '.', true);
        var em = form.querySelector('input[type="email"]');
        if (em && em.value && !/^\S+@\S+\.\S+$/.test(em.value)) return setMsg('Please enter a valid email.', true);
        var lines = [];
        form.querySelectorAll('input,select,textarea,[data-chips]').forEach(function (el) {
          var v = el.hasAttribute('data-chips')
            ? Array.prototype.map.call(el.querySelectorAll('[aria-pressed="true"]'), function (c) { return c.getAttribute('data-chip'); }).join(', ')
            : el.value;
          lines.push(label(el) + ': ' + (v || '—'));
        });
        var org = (form.elements.org && form.elements.org.value) || '';
        var subject = 'Partnership enquiry — ' + form.getAttribute('data-label') + ' — ' + org;
        window.location.href = 'mailto:connect@artpark.in?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
        form.hidden = true;
        panel.querySelector('[data-psent]').hidden = false;
      });
      panel.querySelector('[data-preset]').addEventListener('click', function () {
        form.reset();
        form.querySelectorAll('[data-chip]').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); c.style.background = 'transparent'; c.style.color = 'var(--ink)'; c.style.borderColor = 'var(--line-strong)'; });
        form.hidden = false;
        panel.querySelector('[data-psent]').hidden = true;
      });
    });
  }

  // ---------- Portfolio: sector filter (Portfolio.dc.html) ----------
  // Portfolio: domain sidebar filters the cards; the programme switch (All / TIR / VIP) has no data yet,
  // so TIR and VIP only show a note and keep every card.
  var pf = document.querySelector('[data-portfolio]');
  if (pf) {
    var press = function (btns, on) { btns.forEach(function (x) { x.setAttribute('aria-pressed', x === on ? 'true' : 'false'); }); };
    var dbtns = pf.querySelectorAll('[data-domain]');
    dbtns.forEach(function (b) {
      b.addEventListener('click', function () {
        press(dbtns, b);
        var d = b.getAttribute('data-domain'), n = 0;
        pf.querySelectorAll('[data-company]').forEach(function (c) {
          var ok = !d || c.getAttribute('data-domains').split('|').indexOf(d) > -1;
          c.hidden = !ok; if (ok) n++;
        });
        pf.querySelector('[data-pcount]').textContent = n + (n === 1 ? ' company' : ' companies');
      });
    });
    var gbtns = pf.querySelectorAll('[data-programme]');
    gbtns.forEach(function (b) {
      b.addEventListener('click', function () {
        press(gbtns, b);
        pf.querySelector('[data-programme-note]').hidden = b.getAttribute('data-programme') === 'All';
      });
    });
  }

  // ---------- Story pages: reading progress bar (Story-0N.dc.html) ----------
  var bar = document.querySelector('[data-progress]');
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      var p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      bar.style.width = Math.min(100, Math.max(0, p * 100)) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- Certifications: show the description under a row ----------
  document.querySelectorAll('[data-cert-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.getElementById(b.getAttribute('aria-controls')).hidden = !open;
      b.textContent = open ? 'Hide details −' : 'View details →';
    });
  });

  // ---------- Contact form: hands off to the visitor's email app (as in his design) ----------
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var group = form.querySelector('[data-role-group]');
      var role = group.getAttribute('data-value');
      var el = form.elements;
      var subject = 'Website enquiry — ' + role + ' — ' + el.name.value;
      var body = 'Name: ' + el.name.value + '\nEmail: ' + el.email.value + '\nI am a: ' + role + '\n\n' + el.message.value;
      window.location.href = 'mailto:' + form.getAttribute('data-mailto') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      form.hidden = true;
      document.getElementById('contact-sent').hidden = false;
    });
  }

  // ---------- Home founder stories (round 7): the quote in the middle of the screen leads ----------
  var fx = document.querySelector('[data-founders]');
  if (fx) {
    var fxItems = fx.querySelectorAll('[data-fx-item]');
    var fxFigs = fx.querySelectorAll('[data-fx-fig]');
    var fxCount = fx.querySelector('[data-fx-count]');
    var fxBar = fx.querySelector('[data-fx-bar]');
    var fxList = fx.querySelector('[data-fx-list]');
    var fxN = fxItems.length, fxCur = 0;
    var fxShow = function (i) {
      if (i === fxCur) return;
      fxCur = i;
      fxItems.forEach(function (el, k) { el.classList.toggle('is-on', k === i); });
      fxFigs.forEach(function (el, k) { el.classList.toggle('is-on', k === i); });
      if (fxCount) fxCount.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(fxN).padStart(2, '0');
      if (fxBar) fxBar.style.width = ((i + 1) / fxN * 100).toFixed(2) + '%';
    };
    var fxWide = window.matchMedia('(min-width: 901px)');
    if ('IntersectionObserver' in window) {
      var fxIo = new IntersectionObserver(function (es) {
        if (!fxWide.matches) return;
        es.forEach(function (e) { if (e.isIntersecting) fxShow(+e.target.getAttribute('data-fx-item')); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      fxItems.forEach(function (el) { fxIo.observe(el); });
    }
    // Phones: the swipe row; the card nearest the left edge is the current one.
    if (fxList) {
      var fxTick = null;
      fxList.addEventListener('scroll', function () {
        if (fxWide.matches || fxTick) return;
        fxTick = requestAnimationFrame(function () {
          fxTick = null;
          var w = fxItems[0].getBoundingClientRect().width + 12;
          fxShow(Math.max(0, Math.min(fxN - 1, Math.round(fxList.scrollLeft / w))));
        });
      }, { passive: true });
    }
  }
})();
