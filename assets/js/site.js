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

    initSmoothSkipLinks();
    setupMenu();
    liveYear();
    initDropdownNavigation();
    initMemberCounter();
    /* Page modules are included statically by their pages; the old dynamic
       per-page script loaders were removed with the page-core.js refactor. */
  }

  function initSmoothSkipLinks() {
    document.querySelectorAll('.skip-link[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
        if (!target.matches('a, button, input, select, textarea, [tabindex]')) {
          target.setAttribute('tabindex', '-1');
        }
        target.focus();
      });
    });
  }

  function setupMenu() {
    const menuButton = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    if (!menuButton || !menu) return;
    const openMenu = () => {
      menu.dataset.open = 'true';
      menu.setAttribute('aria-hidden', 'false');
      menuButton.setAttribute('aria-expanded', 'true');
      const first = menu.querySelector('a, button, summary, [tabindex]:not([tabindex="-1"])');
      if (first) requestAnimationFrame(() => first.focus());
    };
    const closeMenu = () => {
      menu.dataset.open = 'false';
      menu.setAttribute('aria-hidden', 'true');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.focus();
    };
    menuButton.addEventListener('click', () => {
      const isOpen = menu.dataset.open === 'true';
      isOpen ? closeMenu() : openMenu();
    });
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.dataset.open === 'true') {
        closeMenu();
      }
    });
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a') && menu.dataset.open === 'true') {
        closeMenu();
      }
    });
  }

  function liveYear() {
    try {
      const yearEl = document.querySelector('[data-year]');
      if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    } catch {}
  }

  function initMemberCounter() {
    /* Canonical shared metrics live in metrics.json (single source). */
    const el = document.getElementById('member-count');
    fetch('assets/data/metrics.json')
      .then(response => {
        if (!response.ok) throw new Error('metrics ' + response.status);
        return response.json();
      })
      .then(data => {
        if (el && typeof data?.members === 'number') {
          el.textContent = String(data.members);
        }
        if (data?.protocolVersion) {
          document.querySelectorAll('.protocol-version').forEach(node => {
            node.textContent = 'Protocol ' + data.protocolVersion;
          });
        }
      })
      .catch(() => {
        if (el) el.textContent = '--';
      });
  }

  function initDropdownNavigation() {
    /* All handlers are delegated to the static .menu element: the dropdown
       markup itself is injected later by each page's script (nav.js), so
       binding per-dropdown here would attach to an empty menu. */
    const menu = document.querySelector('.menu');
    if (!menu) return;

    const hoverMode = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px)');
    const allDropdowns = () => Array.from(menu.querySelectorAll('.nav-dropdown'));
    const closeAll = (except) => {
      allDropdowns().forEach(d => {
        if (d !== except) d.removeAttribute('open');
      });
    };
    let hoverTimer = 0;

    /* 'toggle' does not bubble — capture it */
    menu.addEventListener('toggle', (event) => {
      const dd = event.target;
      if (dd instanceof Element && dd.matches('.nav-dropdown') && dd.hasAttribute('open')) {
        closeAll(dd);
      }
    }, true);

    menu.addEventListener('mouseover', (event) => {
      if (!hoverMode.matches) return;
      const dd = event.target.closest('.nav-dropdown');
      if (!dd || !menu.contains(dd)) return;
      clearTimeout(hoverTimer);
      if (!dd.hasAttribute('open')) {
        closeAll(dd);
        dd.setAttribute('open', '');
      }
    });
    menu.addEventListener('mouseout', (event) => {
      if (!hoverMode.matches) return;
      const dd = event.target.closest('.nav-dropdown');
      if (!dd || dd.contains(event.relatedTarget)) return;
      hoverTimer = setTimeout(() => dd.removeAttribute('open'), 220);
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.nav-dropdown') && !event.target.closest('.menu-toggle')) {
        closeAll();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const open = allDropdowns().find(d => d.hasAttribute('open'));
      if (open) {
        closeAll();
        const summary = open.querySelector('summary');
        if (summary) summary.focus();
      }
    });
  }
})();
