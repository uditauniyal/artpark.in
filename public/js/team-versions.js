/* Team page design versions (round 8): V1 constellation card + filter, V2 scroll spotlight, V3 wall filter (FLIP) + tilt. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pressed(btns, attr, v) { btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute(attr) === v ? 'true' : 'false'); }); }

  /* ---------- V1 · Constellation ---------- */
  var v1 = document.querySelector('[data-tv1]');
  if (v1) {
    var stage = v1.querySelector('[data-tv1-stage]'), card = v1.querySelector('[data-tv1-card]');
    var nodes = [].slice.call(v1.querySelectorAll('.tv1-node'));
    var fit = function () { var w = stage.clientWidth; stage.style.setProperty('--k', Math.min(1, w / 720).toFixed(3)); };
    fit(); addEventListener('resize', fit);
    var show = function (n) {
      nodes.forEach(function (x) { x.classList.toggle('is-on', x === n); });
      var pills = n.getAttribute('data-pills').split('|').map(function (p) { return '<span class="tv-pill">' + esc(p) + '</span>'; }).join('');
      var areas = n.getAttribute('data-areas') ? '<div class="tv-areas">' + n.getAttribute('data-areas').split('|').map(function (a) { return '<span>' + esc(a) + '</span>'; }).join('') + '</div>' : '';
      var li = n.getAttribute('data-li') ? '<a class="tv-li" href="' + n.getAttribute('data-li') + '" target="_blank" rel="noopener">LinkedIn <span class="arrow">↗</span></a>' : '';
      card.innerHTML = '<div class="tv1-p"><img src="' + n.getAttribute('data-img') + '" alt=""><div class="pills">' + pills + '</div><h3>' + esc(n.getAttribute('data-name')) + '</h3><p>' + esc(n.getAttribute('data-role')) + '</p>' + areas + li + '</div>';
    };
    nodes.forEach(function (n) {
      n.addEventListener('mouseenter', function () { show(n); });
      n.addEventListener('focus', function () { show(n); });
      n.addEventListener('click', function () { show(n); stage.classList.add('is-paused'); });
    });
    var chips = [].slice.call(v1.querySelectorAll('[data-tv1-filter]'));
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var g = c.getAttribute('data-tv1-filter'); pressed(chips, 'data-tv1-filter', g);
        nodes.forEach(function (n) { n.classList.toggle('is-dim', g !== 'all' && n.getAttribute('data-groups').split(' ').indexOf(g) === -1); });
        var first = nodes.filter(function (n) { return !n.classList.contains('is-dim'); })[0]; if (first && g !== 'all') show(first);
      });
    });
    // Gentle idle tour: if nobody interacts, introduce a person every 3.5s.
    var tour = 0, touring = !reduce;
    var tick = function () { if (!touring) return; var live = nodes.filter(function (n) { return !n.classList.contains('is-dim'); }); show(live[tour++ % live.length]); };
    stage.addEventListener('mouseenter', function () { touring = false; });
    chips.forEach(function (c) { c.addEventListener('click', function () { touring = false; }); });
    if (touring) { setTimeout(tick, 1600); setInterval(tick, 3500); }
  }

  /* ---------- V2 · Editorial spotlight ---------- */
  var v2 = document.querySelector('[data-tv2]');
  if (v2) {
    var rows = [].slice.call(v2.querySelectorAll('[data-tv2-row]'));
    var figs = [].slice.call(v2.querySelectorAll('[data-tv2-fig]'));
    var cnt = v2.querySelector('[data-tv2-count]'), bar = v2.querySelector('[data-tv2-bar]');
    var n = figs.length, cur = -1;
    var set = function (i) {
      if (i === cur) return; cur = i;
      rows.forEach(function (r) { r.classList.toggle('is-on', +r.getAttribute('data-tv2-row') === i); });
      figs.forEach(function (f, k) { f.classList.toggle('is-on', k === i); });
      cnt.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
      bar.style.width = ((i + 1) / n * 100).toFixed(1) + '%';
    };
    set(0);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) set(+e.target.getAttribute('data-tv2-row')); }); }, { rootMargin: '-45% 0px -45% 0px' });
      rows.forEach(function (r) { io.observe(r); });
    }
  }

  /* ---------- V3 · Duotone wall ---------- */
  var v3 = document.querySelector('[data-tv3]');
  if (v3) {
    var wall = v3.querySelector('[data-tv3-wall]');
    var tiles = [].slice.call(wall.querySelectorAll('.tv3-tile'));
    var chips3 = [].slice.call(v3.querySelectorAll('[data-tv3-filter]'));
    chips3.forEach(function (c) {
      c.addEventListener('click', function () {
        var g = c.getAttribute('data-tv3-filter'); pressed(chips3, 'data-tv3-filter', g);
        var before = new Map(); tiles.forEach(function (t) { if (!t.hidden) before.set(t, t.getBoundingClientRect()); });
        tiles.forEach(function (t) { t.hidden = g !== 'all' && t.getAttribute('data-groups').split(' ').indexOf(g) === -1; });
        if (reduce) return;
        tiles.forEach(function (t, i) {
          if (t.hidden) return;
          var a = before.get(t), b = t.getBoundingClientRect();
          if (a) t.animate([{ transform: 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px) scale(' + (a.width / b.width) + ',' + (a.height / b.height) + ')' }, { transform: 'none' }], { duration: 560, easing: 'cubic-bezier(.22,.8,.24,1)' });
          else t.animate([{ opacity: 0, transform: 'scale(.85)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: Math.min(i, 10) * 30, easing: 'cubic-bezier(.22,.8,.24,1)', fill: 'backwards' });
        });
      });
    });
    tiles.forEach(function (t) {
      t.addEventListener('click', function (e) { if (e.target.closest('a')) return; var open = t.classList.contains('is-open'); tiles.forEach(function (x) { x.classList.remove('is-open'); }); if (!open) t.classList.add('is-open'); });
      if (fine && !reduce) {
        t.addEventListener('mousemove', function (e) { var r = t.getBoundingClientRect(); var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; t.style.transform = 'perspective(900px) rotateY(' + (x * 8).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg) translateZ(0)'; });
        t.addEventListener('mouseleave', function () { t.style.transform = ''; });
      }
    });
  }
})();
