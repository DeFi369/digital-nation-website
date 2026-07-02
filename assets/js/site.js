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

    const isAssemblyPage = document.body.classList.contains('page-assembly') || window.location.pathname.includes('assembly.html');
    const isCourtPage = document.body.classList.contains('page-court') || window.location.pathname.includes('court.html');
    const isRegistryPage = document.body.classList.contains('page-registry') || window.location.pathname.includes('registry.html');
    const isMissionsPage = document.body.classList.contains('page-missions') || window.location.pathname.includes('missions.html');
    const isEducationPage = document.body.classList.contains('page-education') || window.location.pathname.includes('education.html');
    const isHealthPage = document.body.classList.contains('page-health') || window.location.pathname.includes('health.html');
    const isInfrastructurePage = document.body.classList.contains('page-infrastructure') || window.location.pathname.includes('infrastructure.html');
    if (isAssemblyPage) {
      loadAssemblyScript();
    }
    if (isCourtPage) {
      loadCourtScript();
    }
    if (isRegistryPage) {
      loadRegistryScript();
    }
    if (isMissionsPage) {
      loadMissionsScript();
    }
    if (isEducationPage) {
      loadEducationScript();
    }
    if (isHealthPage) {
      loadHealthScript();
    }
    if (isInfrastructurePage) {
      loadInfrastructureScript();
    }
    const isDiplomacyPage = document.body.classList.contains('page-diplomacy') || window.location.pathname.includes('diplomacy.html');
    const isProtocolPage = document.body.classList.contains('page-protocol') || window.location.pathname.includes('protocol.html');
    if (isDiplomacyPage) {
      loadDiplomacyScript();
    }
    if (isProtocolPage) {
      loadProtocolScript();
    }
  }

  function loadEngageScript() {
    if (document.querySelector('script[src="assets/js/engage.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/engage.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadAssemblyScript() {
    if (document.querySelector('script[src="assets/js/assembly.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/assembly.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadCourtScript() {
    if (document.querySelector('script[src="assets/js/court.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/court.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadRegistryScript() {
    if (document.querySelector('script[src="assets/js/registry.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/registry.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadMissionsScript() {
    if (document.querySelector('script[src="assets/js/missions.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/missions.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadEducationScript() {
    if (document.querySelector('script[src="assets/js/education.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/education.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadHealthScript() {
    if (document.querySelector('script[src="assets/js/health.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/health.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadInfrastructureScript() {
    if (document.querySelector('script[src="assets/js/infrastructure.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/infrastructure.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadDiplomacyScript() {
    if (document.querySelector('script[src="assets/js/diplomacy.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/diplomacy.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadProtocolScript() {
    if (document.querySelector('script[src="assets/js/protocol.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/protocol.js';
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
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a') && menu.dataset.open === 'true') {
        menu.dataset.open = 'false';
        menu.setAttribute('aria-hidden', 'true');
        menuButton.setAttribute('aria-expanded', 'false');
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
