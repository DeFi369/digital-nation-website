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
