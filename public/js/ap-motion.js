/* ARTPARK motion layer: a port of the manager's Claude Design motion.js (.reference/claude-design-v2/motion.js),
   same six effects and the same timings: 1 page curtain, 2 scroll hairline, 3 scroll reveals with image wipe,
   4 count-ups, 5 live-content ease-in, 6 arrow nudge. Web Animations API only.
   Adapted for this static site: the curtain is in the HTML from the first paint (so the page never flashes),
   its lift is a CSS animation (so the page still opens if this script fails), and internal links are our clean URLs. */
(function () {
  if (window.__apMotion) return; window.__apMotion = true;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.22,.8,.24,1)';
  var BLUE = '#3213b7';
  var ready = false, seen = new WeakSet();
  document.documentElement.classList.add('ap-motion');

  function el(tag, css) { var e = document.createElement(tag); e.style.cssText = css; return e; }

  /* 1 · Page curtain: lifts on enter (CSS, see site.css .ap-curtain), drops on internal navigation */
  var curtain = document.querySelector('.ap-curtain');
  var label = curtain && curtain.querySelector('.ap-curtain-label');
  function leave(href) {
    if (reduce || !curtain) { location.href = href; return; }
    curtain.classList.add('is-leaving');
    curtain.getAnimations().forEach(function (x) { x.cancel(); });
    if (label) label.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 260, fill: 'forwards' });
    var a = curtain.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }],
      { duration: 480, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
    a.onfinish = function () { location.href = href; };
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]'); if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) return;
    var url; try { url = new URL(href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    if (/\.(pdf|docx?|xlsx?|zip|png|jpe?g|webp)$/i.test(url.pathname)) return;
    if (url.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '') && url.hash) return; // same-page anchor
    e.preventDefault(); leave(url.href);
  }, true);
  window.addEventListener('pageshow', function (e) {
    if (e.persisted && curtain) { curtain.getAnimations().forEach(function (x) { x.cancel(); }); curtain.classList.remove('is-leaving'); curtain.style.display = 'none'; }
  });

  /* 2 · Scroll progress hairline */
  var bar = el('div', 'position:fixed;top:0;left:0;height:3px;width:100%;transform-origin:0 50%;transform:scaleX(0);background:' + BLUE + ';z-index:9998;pointer-events:none');
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
  }

  /* 3 · Scroll reveal: section content rises in; grid/row children stagger; images wipe up */
  function isGroup(n) {
    var cs = getComputedStyle(n); if (n.children.length < 2) return false;
    return cs.display.indexOf('grid') > -1 || (cs.display.indexOf('flex') > -1 && (cs.flexWrap === 'wrap' || cs.flexDirection === 'column') && n.children.length >= 3);
  }
  function skip(n) { return n.closest('[data-ap-skip]') || n.matches('script,style,template,[hidden]'); }
  function targets() {
    var out = [];
    document.querySelectorAll('main section, body > div > section, section').forEach(function (sec) {
      if (sec.__apSec) return; sec.__apSec = true;
      if (sec.closest('header') || sec.closest('[role=dialog]') || sec.closest('[data-ap-skip]')) return;
      if (sec.parentElement && sec.parentElement.closest('section')) return; // nested sections belong to their parent
      var wrap = sec.firstElementChild && sec.children.length === 1 ? sec.firstElementChild : sec;
      Array.prototype.forEach.call(wrap.children, function (c) {
        if (skip(c)) return;
        if (isGroup(c)) Array.prototype.forEach.call(c.children, function (k, i) { if (!skip(k)) out.push([k, i]); });
        else out.push([c, 0]);
      });
    });
    var f = document.querySelector('footer'); if (f) out.push([f, 0]);
    return out;
  }
  function hide(n) { n.__apHide = n.animate([{ opacity: 0, transform: 'translateY(28px)' }], { duration: 1, fill: 'forwards' }); }
  function show(n, i) {
    if (n.__apShown) return; n.__apShown = true;
    var d = Math.min(i, 8) * 70;
    n.animate([{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: d, easing: EASE, fill: 'backwards' });
    if (n.__apHide) n.__apHide.cancel();
    n.querySelectorAll('img').forEach(function (img) {
      if (img.getBoundingClientRect().height < 60 || img.closest('[data-ap-noimg]')) return;
      img.animate([{ clipPath: 'inset(100% 0 0 0)', transform: 'scale(1.06)' }, { clipPath: 'inset(0 0 0 0)', transform: 'scale(1)' }], { duration: 1000, delay: d + 120, easing: 'cubic-bezier(.65,0,.2,1)', fill: 'backwards' });
    });
    countUps(n, d);
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (ents) {
    var batch = 0;
    ents.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); show(en.target, en.target.__apIdx + batch); batch++; } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;

  /* 4 · Count-up numerals (₹25L, 120+, years excluded); the home stat band has its own counter */
  var NUM = /^(₹?)(\d{1,4}(?:[.,]\d+)?)(\+|%|L|Cr| Cr|k|K)?$/;
  function countUps(root, delay) {
    root.querySelectorAll('b,strong,span,div,p,h2,h3').forEach(function (n) {
      if (n.children.length || seen.has(n) || n.closest('[data-count-to]')) return;
      var t = (n.textContent || '').trim(), m = t.match(NUM); if (!m) return;
      var v = parseFloat(m[2].replace(',', '')); if (!(v > 1) || (v >= 1900 && v <= 2100)) return;
      if (parseFloat(getComputedStyle(n).fontSize) < 26) return;
      seen.add(n);
      var dec = (m[2].split('.')[1] || '').length, start = performance.now() + delay, dur = 1100;
      var tn = n.firstChild; if (!tn || tn.nodeType !== 3) return;
      (function step(now) {
        var p = Math.max(0, Math.min(1, (now - start) / dur)), e = 1 - Math.pow(1 - p, 3);
        tn.nodeValue = m[1] + (v * e).toFixed(dec) + (m[3] || '');
        if (p < 1) requestAnimationFrame(step); else tn.nodeValue = t;
      })(performance.now());
    });
  }

  /* 5 · Live content: filtered lists, tab panels, form success, dropdowns ease in.
     His pages add nodes; ours mostly un-hide them, so both are watched. */
  function easeIn(n, i) {
    var r = n.getBoundingClientRect(); if (r.height < 24 || r.bottom < 0 || r.top > innerHeight) return;
    n.animate([{ opacity: 0, transform: 'translateY(12px) scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: Math.min(i, 10) * 40, easing: EASE, fill: 'backwards' });
  }
  var mo = new MutationObserver(function (muts) {
    if (!ready || reduce) return;
    var i = 0;
    muts.forEach(function (m) {
      if (m.type === 'attributes') {
        var t = m.target;
        if (t.nodeType === 1 && !t.hidden && m.oldValue !== null && !t.closest('[data-ap-skip]') && !t.closest('.ap-curtain')) easeIn(t, i++);
        return;
      }
      m.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1 || n === curtain || n === bar || n.closest('[data-ap-skip]')) return;
        easeIn(n, i++);
      });
    });
  });

  /* 6 · Arrow nudge on buttons / links that end in → */
  function nudge(e, on) {
    var a = e.target.closest && e.target.closest('a,button'); if (!a || a.contains(e.relatedTarget)) return;
    var ar = a.querySelector('.arrow'); if (!ar) return;
    ar.style.display = 'inline-block';
    ar.animate([{ transform: on ? 'translateX(0)' : 'translateX(4px)' }, { transform: on ? 'translateX(4px)' : 'translateX(0)' }], { duration: 180, easing: EASE, fill: 'forwards' });
  }
  document.addEventListener('mouseover', function (e) { nudge(e, true); });
  document.addEventListener('mouseout', function (e) { nudge(e, false); });

  function boot() {
    document.body.appendChild(bar);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    if (!reduce && io) {
      targets().forEach(function (p) {
        var n = p[0]; if (n.__apIdx !== undefined) return; n.__apIdx = p[1];
        var r = n.getBoundingClientRect();
        hide(n);
        if (r.top < innerHeight && r.bottom > 0) setTimeout(function () { show(n, p[1]); }, 380); else io.observe(n);
      });
    }
    setTimeout(function () { ready = true; mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'], attributeOldValue: true }); }, 900);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
