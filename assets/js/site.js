(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    try {
      const loader = document.querySelector('.page-loader');
      if (loader) loader.classList.add('hidden');
    } catch {}

    setupMenu();
    liveYear();

    const doc = document.documentElement;
    if (doc.classList.contains('page-dashboard') || doc.classList.contains('page-tools')) {
      initDashboardTools();
    }
  }

  function setupMenu() {
    const menuButton = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    if (!menuButton || !menu) return;
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

  function liveYear() {
    try {
      const yearEl = document.querySelector('[data-year]');
      if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    } catch {}
  }

  function initDashboardTools() {
    runDashboard();
    runTools();
  }

  /* ----------------------------------------------------------------
     Dashboard features: animated counters, filter activity, status toggle
  ---------------------------------------------------------------- */
  function runDashboard() {
    const counters = document.querySelectorAll('[data-count-to]');
    if (counters.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = toNum(el.getAttribute('data-count-to'));
          if (Number.isNaN(target)) return;
          animateCount(el, target);
          io.unobserve(el);
        });
      }, { threshold: 0.5 });
      counters.forEach((el) => io.observe(el));
    }

    const filterInput = document.getElementById('activity-filter');
    const activityList = document.querySelector('.activity-list');
    if (!filterInput || !activityList) return;
    const items = activityList.querySelectorAll('[role="listitem"]');
    const labels = {};
    items.forEach((item) => {
      const label = (item.querySelector('.activity-state')?.textContent || '').trim().toLowerCase();
      labels[label] = labels[label] || [];
      labels[label].push(item);
    });

    filterInput.addEventListener('input', () => {
      const q = filterInput.value.trim().toLowerCase();
      document.querySelectorAll('.activity-list [role="listitem"]').forEach((item) => item.style.display = '');
      if (!q) return;
      Object.entries(labels).forEach(([label, group]) => {
        if (!label.includes(q)) group.forEach((item) => (item.style.display = 'none'));
      });
    });

    const copyBtn = document.getElementById('copy-status');
    const copyTarget = document.getElementById('copy-target');
    if (copyBtn && copyTarget) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(copyTarget.textContent.trim());
          const original = copyBtn.textContent;
          copyBtn.textContent = 'Copied';
          setTimeout(() => (copyBtn.textContent = original), 1200);
        } catch {}
      });
    }
  }

  function animateCount(el, target) {
    const start = performance.now();
    const duration = 900;
    const from = 0;
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(from + (target - from) * easeOut(t));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function toNum(v) {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? 0 : n;
  }

  /* ----------------------------------------------------------------
     Tools readiness calculator + contribution path finder
  ---------------------------------------------------------------- */
  function runTools() {
    const form = document.getElementById('readiness');
    if (form) {
      const boxes = form.querySelectorAll('input[type="checkbox"]');
      const scoreEl = document.getElementById('readiness-score');
      const labelEl = document.getElementById('readiness-label');
      const total = boxes.length;
      const set = () => {
        const checked = Array.from(boxes).filter((b) => b.checked).length;
        if (scoreEl) scoreEl.textContent = String(checked);
        if (labelEl) {
          const ratio = checked / total;
          const label = ratio >= 0.85 ? 'Ready to apply'
            : ratio >= 0.6 ? 'Prepare a few gaps'
            : ratio >= 0.3 ? 'On the right path'
            : 'Keep exploring the Republic';
          labelEl.textContent = label;
        }
      };
      set();
      boxes.forEach((b) => b.addEventListener('change', set));
    }

    const pathSelect = document.getElementById('path-interests');
    const goButton = document.getElementById('path-go');
    const resultBox = document.getElementById('pathfinder-result');
    const paths = {
      engineering: 'Start with protocol docs and toolchain setup, then review implementation tracker and ask in engineering channel.',
      governance: 'Read the Charter and latest governance thread, then consider joining a verifier review or governance action.',
      outreach: 'Begin with passport framing and recognition context, then consider press patterns, short-form content, and community threads.',
      node: 'Review node operation guidance, infrastructure reports, and regional cluster requirements before applying for a node slot.',
      security: 'Review disclosed audit patterns and secure onboarding, then raise questions through the secure channel before applying.',
      docs: 'Start with live pages and published PDFs, then review translation/accessibility contribution patterns.',
    };
    const applyPath = () => {
      if (!pathSelect || !resultBox) return;
      const key = pathSelect.value;
      resultBox.innerHTML = key && paths[key]
        ? '<p>' + escapeHtml(paths[key]) + '</p>'
        : '<p>Select an interest and choose "Find path" to see a suggested route.</p>';
    };
    if (pathSelect) pathSelect.addEventListener('change', applyPath);
    if (goButton) goButton.addEventListener('click', applyPath);
  }

  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();
