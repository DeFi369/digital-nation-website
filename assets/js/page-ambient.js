/* Ambient starfield for inner pages (index.html has its own hero canvas).
   Draws a sparse, slowly-twinkling field tinted by the page's cluster
   accent (--page-accent). Static under prefers-reduced-motion; paused
   while the tab is hidden. */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    if (!document.body.hasAttribute('data-theme')) return;
    if (document.getElementById('page-ambient-canvas')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'page-ambient-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const accent = (getComputedStyle(document.body).getPropertyValue('--page-accent') || '#7aa7ff').trim();

    let width = 0;
    let height = 0;
    let stars = [];
    let rafId = 0;

    function hexToRgb(hex) {
      const m = /^#?([0-9a-f]{6})$/i.exec(hex);
      if (!m) return '122, 167, 255';
      const n = parseInt(m[1], 16);
      return ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255);
    }
    const tint = hexToRgb(accent);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(130, Math.round((width * height) / 12000));
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.4 + Math.random() * 1.1,
          phase: Math.random() * Math.PI * 2,
          twinkle: 0.5 + Math.random() * 1.1,
          tinted: Math.random() < 0.22
        });
      }
    }

    function drawFrame(t) {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const a = 0.25 + 0.45 * Math.abs(Math.sin(s.phase + t * 0.0005 * s.twinkle));
        ctx.fillStyle = 'rgba(' + (s.tinted ? tint : '226, 235, 255') + ',' + a.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(t) {
      drawFrame(t);
      rafId = window.requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', function () {
      window.clearTimeout(resize._t);
      resize._t = window.setTimeout(resize, 150);
    });

    if (reduceMotion) {
      drawFrame(0);
      return;
    }
    rafId = window.requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        window.cancelAnimationFrame(rafId);
      } else {
        rafId = window.requestAnimationFrame(loop);
      }
    });
  }
})();
