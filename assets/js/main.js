(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // lightweight load treatment: remove loader once body is visible
    try {
      const loader = document.querySelector('.page-loader');
      if (loader) loader.classList.add('hidden');
    } catch {}

    const menuButton = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    if (menuButton && menu) {
      menuButton.addEventListener('click', () => {
        const open = menu.dataset.open === 'true';
        menu.dataset.open = String(!open);
        menu.setAttribute('aria-hidden', String(open));
        menuButton.setAttribute('aria-expanded', String(!open));
        if (!open) {
          const firstLink = menu.querySelector('a');
          if (firstLink) setTimeout(() => firstLink.focus(), 0);
        }
      });

      menu.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.dataset.open === 'true') {
          menu.dataset.open = 'false';
          menu.setAttribute('aria-hidden', 'true');
          menuButton.setAttribute('aria-expanded', 'false');
          menuButton.focus();
        }
      });
    }
    try {
      const yearEl = document.querySelector('[data-year]');
      if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    } catch {}

    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const mouse = { x: -9999, y: -9999, active: false };
    let width, height, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const nodeCount = Math.min(90, Math.max(40, Math.floor(width / 14)));
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.6 + Math.random() * 2.4,
      pulse: Math.random() * Math.PI * 2,
      pulseRate: 0.004 + Math.random() * 0.018,
      alpha: 0.6 + Math.random() * 0.4,
    }));

    const connectionDist = 110;
    const mouseDist = 170;

    canvas.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });
    canvas.addEventListener('pointerleave', () => {
      mouse.active = false;
    });
    canvas.addEventListener('pointercancel', () => {
      mouse.active = false;
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'round';

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.pulse += n.pulseRate;
        if (mouse.active) {
          const dx = mouse.x - n.x, dy = mouse.y - n.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < mouseDist) {
            const force = (mouseDist - d) / mouseDist;
            const angle = Math.atan2(dy, dx);
            n.vx += Math.cos(angle) * force * 0.008;
            n.vy += Math.sin(angle) * force * 0.008;
          }
        }
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > 0.55) {
          n.vx = (n.vx / speed) * 0.55;
          n.vy = (n.vy / speed) * 0.55;
        }
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.18;
            ctx.strokeStyle = 'rgba(122,167,255,' + alpha.toFixed(3) + ')';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      if (mouse.active) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const dx = mouse.x - n.x, dy = mouse.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseDist) {
            const alpha = (1 - dist / mouseDist) * 0.35;
            ctx.strokeStyle = 'rgba(192,132,252,' + alpha.toFixed(3) + ')';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const glow = 0.6 + 0.4 * Math.sin(n.pulse);
        ctx.shadowBlur = 6 + glow * 6;
        ctx.shadowColor = 'rgba(122,167,255,0.45)';
        ctx.fillStyle = i % 5 === 0
          ? 'rgba(192,132,252,' + (n.alpha * glow).toFixed(3) + ')'
          : 'rgba(122,167,255,' + (n.alpha * glow).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + glow * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (mouse.active) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 90);
        grad.addColorStop(0, 'rgba(122,167,255,0.06)');
        grad.addColorStop(1, 'rgba(122,167,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 90, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop() {
      draw();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
})();
