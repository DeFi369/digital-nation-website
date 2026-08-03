/* Homepage atmosphere: starfield + citizen-lattice canvas, scroll reveals.
   Loaded only by index.html. Respects prefers-reduced-motion (renders a
   single static frame) and pauses while the tab is hidden. */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initReveals();
    initSky();
  }

  /* ---- scroll reveals ---- */
  function initReveals() {
    if (!('IntersectionObserver' in window)) return;
    document.body.classList.add('reveal-armed');
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---- starfield + lattice ---- */
  function initSky() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ACCENT = '122, 167, 255';
    const ACCENT2 = '192, 132, 252';
    const LINK_DIST = 170;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];
    let nodes = [];
    let meteor = null;
    let nextMeteorAt = 0;
    let rafId = 0;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      const starCount = Math.min(220, Math.round((width * height) / 6500));
      stars = [];
      for (let i = 0; i < starCount; i++) {
        const depth = Math.random();
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.4 + depth * 1.3,
          drift: 0.02 + depth * 0.08,
          phase: Math.random() * Math.PI * 2,
          twinkle: 0.6 + Math.random() * 1.2,
          violet: Math.random() < 0.18
        });
      }
      const nodeCount = Math.min(30, Math.round(width / 46));
      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.18,
          r: 1.2 + Math.random() * 1.6,
          violet: Math.random() < 0.3
        });
      }
    }

    function drawFrame(t) {
      ctx.clearRect(0, 0, width, height);

      /* stars */
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.x -= s.drift;
        if (s.x < -2) s.x = width + 2;
        const a = 0.35 + 0.55 * Math.abs(Math.sin(s.phase + t * 0.0006 * s.twinkle));
        ctx.fillStyle = 'rgba(' + (s.violet ? ACCENT2 : '226, 235, 255') + ',' + a.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      /* citizen lattice */
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = width + 20; else if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20; else if (n.y > height + 20) n.y = -20;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const a = (1 - dist / LINK_DIST) * 0.34;
            ctx.strokeStyle = 'rgba(' + ACCENT + ',' + a.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const tint = n.violet ? ACCENT2 : ACCENT;
        ctx.fillStyle = 'rgba(' + tint + ',0.9)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(' + tint + ',0.12)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 3.4, 0, Math.PI * 2);
        ctx.fill();
      }

      /* occasional meteor */
      if (!meteor && t > nextMeteorAt) {
        meteor = {
          x: width * (0.2 + Math.random() * 0.7),
          y: height * 0.08,
          vx: -(3.4 + Math.random() * 2.4),
          vy: 2.2 + Math.random() * 1.4,
          life: 1
        };
      }
      if (meteor) {
        meteor.x += meteor.vx;
        meteor.y += meteor.vy;
        meteor.life -= 0.016;
        const grad = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.vx * 14, meteor.y - meteor.vy * 14);
        grad.addColorStop(0, 'rgba(226,235,255,' + (0.9 * meteor.life).toFixed(3) + ')');
        grad.addColorStop(1, 'rgba(' + ACCENT + ',0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x - meteor.vx * 14, meteor.y - meteor.vy * 14);
        ctx.stroke();
        if (meteor.life <= 0 || meteor.x < -40 || meteor.y > height + 40) {
          meteor = null;
          nextMeteorAt = t + 4000 + Math.random() * 6000;
        }
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
    nextMeteorAt = 2500;
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
