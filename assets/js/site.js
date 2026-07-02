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

    const isEngagePage = document.body.classList.contains('page-engage') || window.location.pathname.includes('engage.html');
    const isDashboardPage = document.body.classList.contains('page-dashboard') || window.location.pathname.includes('dashboard.html');

    if (isEngagePage || isDashboardPage) {
      loadEngageScript();
    }
  }

  function loadEngageScript() {
    if (document.querySelector('script[src="assets/js/engage.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/engage.js';
    script.defer = true;
    document.body.appendChild(script);
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
})();
