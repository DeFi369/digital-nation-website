(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu');
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = menu.dataset.open === 'true';
      menu.dataset.open = String(!open);
      menu.setAttribute('aria-hidden', String(open));
      menuButton.setAttribute('aria-expanded', String(!open));
    });
  }
  try {
    const yearEl = document.querySelector('[data-year]');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  } catch {}
})();
