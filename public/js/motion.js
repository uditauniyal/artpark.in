// Homepage motion: scroll-linked parallax, a self-running tour of the collage, count-up figures,
// pointer tilt on cards, and a page progress bar. Layout is untouched; only transforms change.
// Everything is skipped when the visitor has asked their system to reduce motion.
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-count-to]').forEach(function (el) { el.textContent = el.getAttribute('data-count-to'); });
    return;
  }
  var desktop = window.matchMedia('(min-width: 761px)');

  // ---------- Page progress bar ----------
  var bar = document.createElement('div');
  bar.className = 'page-progress';
  document.body.appendChild(bar);

  // ---------- Scroll-linked parallax ----------
  var opening = document.querySelector('.opening');
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.collage-tile'));
  var DEPTH = [0.16, 0.28, 0.08, 0.22, 0, 0.12, 0.3, 0.1, 0.24];
  var SPIN = [-1, 1, -1, 1, 0, 1, -1, 1, -1];
  var headline = document.querySelector('.opening h1');
  var watermark = document.querySelector('.opening-watermark');
  var mx = 0, my = 0;
  if (opening) opening.addEventListener('pointermove', function (e) {
    var r = opening.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5;
  });
  if (opening) opening.addEventListener('pointerleave', function () { mx = 0; my = 0; });

  var stageSteps = document.querySelectorAll('.stage-step');
  var columns = document.querySelectorAll('#building .stage-arrows + div > div');
  var believeHl = document.querySelector('#believe .hl');
  var collab = document.querySelector('#collaborate');

  var cmx = 0, cmy = 0;
  var frame = function () {
    var y = window.scrollY, vh = window.innerHeight;
    var doc = document.documentElement;
    bar.style.transform = 'scaleX(' + Math.min(1, y / Math.max(1, doc.scrollHeight - vh)) + ')';
    cmx += (mx - cmx) * 0.08; cmy += (my - cmy) * 0.08;

    if (opening && desktop.matches) {
      var oy = Math.min(y, 700);
      tiles.forEach(function (t, i) {
        var d = DEPTH[i] || 0;
        t.style.setProperty('--py', (cmy * 12 * (d + 0.15)) + 'px');
        t.style.setProperty('--px', (cmx * 16 * (d + 0.15)) + 'px');
        
      });
      if (headline) { headline.style.transform = 'translateY(' + (oy * 0.1) + 'px)'; }
      if (watermark) watermark.style.transform = 'translateY(' + (oy * 0.35) + 'px) scale(' + (1 + oy / 3000) + ')';
    }

    // Build. Prototype. Scale.: columns lift into place as they travel up the screen.
    columns.forEach(function (c, i) {
      var r = c.getBoundingClientRect();
      var t = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.55)));
      c.style.setProperty('--lift', ((1 - t) * (40 + i * 30)) + 'px');
    });
    // What we believe: the highlight grows with scroll.
    if (believeHl) {
      var br = believeHl.getBoundingClientRect();
      var bt = Math.max(0, Math.min(1, (vh * 0.85 - br.top) / (vh * 0.35)));
      believeHl.style.backgroundSize = (bt * 100) + '% 100%';
    }
    // Work with us: the deep purple panel slides its background as you pass.
    if (collab) {
      var cr = collab.getBoundingClientRect();
      collab.style.setProperty('--shift', ((cr.top / vh) * 60) + 'px');
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // ---------- Collage: a self-running tour of the nine stories ----------
  var collage = document.querySelector('[data-collage]');
  if (collage) {
    var order = [4, 0, 5, 2, 7, 1, 6, 3, 8], k = 0, touched = false, visible = true;
    var chips = collage.querySelectorAll('[data-chip]');
    collage.addEventListener('mouseenter', function () { touched = true; collage.classList.remove('touring'); });
    collage.addEventListener('mouseleave', function () { touched = false; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0.3 }).observe(collage);
    setInterval(function () {
      if (touched || !visible || document.hidden) return;
      collage.classList.add('touring');
      var i = order[k++ % order.length];
      var t = collage.querySelector('[data-tile="' + i + '"]');
      if (t) t.dispatchEvent(new Event('mouseenter'));
      chips.forEach(function (c, j) { c.classList.toggle('tour-on', j === i); });
    }, 2600);
  }

  // ---------- Count-up figures ----------
  var counters = document.querySelectorAll('[data-count-to]');
  var run = function (el) {
    var target = el.getAttribute('data-count-to'), num = parseFloat(target.replace(/[^\d.]/g, '')), pre = target.match(/^[^\d]*/)[0], suf = target.replace(/^[^\d]*[\d,.]+/, '');
    var start = performance.now(), dur = 1600;
    var step = function (now) {
      var p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(num * e).toLocaleString('en-IN') + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); } }); }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  // ---------- Pointer tilt on cards ----------
  document.querySelectorAll('.tilt').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--rx', (-y * 5) + 'deg'); el.style.setProperty('--ry', (x * 6) + 'deg');
      el.style.setProperty('--gx', ((x + 0.5) * 100) + '%'); el.style.setProperty('--gy', ((y + 0.5) * 100) + '%');
    });
    el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });
})();
