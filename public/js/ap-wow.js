/* Round 8 "wow" layer, paired with /css/wow.css: floating compositions follow the pointer and drift on scroll,
   moving image windows, a cursor-following preview for rows with data-peek, and magnetic logos (.mag). */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var stages = [].slice.call(document.querySelectorAll('.float-stage'));
  var wins = [].slice.call(document.querySelectorAll('[data-win]'));
  var mx = 0, my = 0, tick = false;

  function frame() {
    tick = false;
    var sy = window.scrollY;
    stages.forEach(function (s) { s.style.setProperty('--mx', mx.toFixed(2)); s.style.setProperty('--my', my.toFixed(2)); s.style.setProperty('--sy', (-sy * 0.06).toFixed(2)); });
    var h = innerHeight;
    wins.forEach(function (w) {
      var r = w.getBoundingClientRect(); if (r.bottom < -100 || r.top > h + 100) return;
      var p = (r.top + r.height / 2 - h / 2) / (h / 2 + r.height / 2); // -1 (top) .. 1 (bottom)
      w.style.setProperty('--wy', (p * r.height * 0.06).toFixed(1) + 'px');
    });
  }
  function ask() { if (!tick) { tick = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', ask, { passive: true });
  addEventListener('resize', ask);
  if (fine) addEventListener('mousemove', function (e) { mx = (e.clientX / innerWidth - 0.5) * 22; my = (e.clientY / innerHeight - 0.5) * 16; ask(); }, { passive: true });
  ask();

  /* Cursor-following preview window */
  var rows = document.querySelectorAll('[data-peek]');
  if (fine && rows.length) {
    var peek = document.createElement('div'); peek.className = 'peek'; peek.setAttribute('aria-hidden', 'true');
    var img = document.createElement('img'); img.alt = ''; img.src = rows[0].getAttribute('data-peek'); peek.appendChild(img); document.body.appendChild(peek);
    var tx = 0, ty = 0, cx = 0, cy = 0, on = false, raf = null;
    var follow = function () {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      var rot = Math.max(-6, Math.min(6, (tx - cx) * 0.05));
      peek.style.transform = 'translate3d(' + (cx + 28).toFixed(1) + 'px,' + (cy - 90).toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
      raf = on || Math.abs(tx - cx) > 0.5 ? requestAnimationFrame(follow) : null;
    };
    rows.forEach(function (row) {
      row.addEventListener('mouseenter', function (e) {
        img.src = row.getAttribute('data-peek'); on = true; peek.classList.add('is-on');
        if (!raf) { cx = tx = e.clientX; cy = ty = e.clientY; raf = requestAnimationFrame(follow); }
      });
      row.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
      row.addEventListener('mouseleave', function () { on = false; peek.classList.remove('is-on'); });
    });
  }

  /* Magnetic logos */
  if (fine) document.querySelectorAll('.mag').forEach(function (m) {
    m.addEventListener('mousemove', function (e) {
      var r = m.getBoundingClientRect();
      m.style.setProperty('--gx', ((e.clientX - r.left) / r.width - 0.5) * 12 + 'px');
      m.style.setProperty('--gy', ((e.clientY - r.top) / r.height - 0.5) * 10 + 'px');
      m.style.setProperty('--gs', '1.06');
    });
    m.addEventListener('mouseleave', function () { m.style.setProperty('--gx', '0px'); m.style.setProperty('--gy', '0px'); m.style.setProperty('--gs', '1'); });
  });
})();
