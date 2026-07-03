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
    const isJusticePage = document.body.classList.contains('page-justice') || window.location.pathname.includes('justice.html');
    const isSafetyPage = document.body.classList.contains('page-safety') || window.location.pathname.includes('safety.html');
    if (isJusticePage) {
      loadJusticeScript();
    }
    if (isSafetyPage) {
      loadSafetyScript();
    }
    const isFinancePage = document.body.classList.contains('page-finance') || window.location.pathname.includes('finance.html');
    const isTreasuryPage = document.body.classList.contains('page-treasury') || window.location.pathname.includes('treasury.html');
    const isCulturePage = document.body.classList.contains('page-culture') || window.location.pathname.includes('culture.html');
    const isCommunicationsPage = document.body.classList.contains('page-communications') || window.location.pathname.includes('communications.html');
    const isEnvironmentPage = document.body.classList.contains('page-environment') || window.location.pathname.includes('environment.html');
    const isSustainabilityPage = document.body.classList.contains('page-sustainability') || window.location.pathname.includes('sustainability.html');
    const isHealthEquityPage = document.body.classList.contains('page-health-equity') || window.location.pathname.includes('health-equity.html');
    const isBandwidthPage = document.body.classList.contains('page-bandwidth') || window.location.pathname.includes('bandwidth.html');
    const isResearchPage = document.body.classList.contains('page-research') || window.location.pathname.includes('research.html');
    const isLabsPage = document.body.classList.contains('page-labs') || window.location.pathname.includes('labs.html');
    const isEmergingTechPage = document.body.classList.contains('page-emerging-tech') || window.location.pathname.includes('emerging-tech.html');
    const isCharterAddendumPage = document.body.classList.contains('page-charter-addendum') || window.location.pathname.includes('charter-addendum.html');
    const isStructurePage = document.body.classList.contains('page-structure') || window.location.pathname.includes('structure.html');
    if (isFinancePage) {
      loadFinanceScript();
    }
    if (isTreasuryPage) {
      loadTreasuryScript();
    }
    if (isCulturePage) {
      loadCultureScript();
    }
    if (isCommunicationsPage) {
      loadCommunicationsScript();
    }
    if (isEnvironmentPage) {
      loadEnvironmentScript();
    }
    if (isSustainabilityPage) {
      loadSustainabilityScript();
    }
    if (isHealthEquityPage) {
      loadHealthEquityScript();
    }
    if (isBandwidthPage) {
      loadBandwidthScript();
    }
    if (isResearchPage) {
      loadResearchScript();
    }
    if (isLabsPage) {
      loadLabsScript();
    }
    if (isEmergingTechPage) {
      loadEmergingTechScript();
    }
    if (isCharterAddendumPage) {
      loadCharterAddendumScript();
    }
    if (isStructurePage) {
      loadStructureScript();
    }
    const isDashboardPage = document.body.classList.contains('page-dashboard') || window.location.pathname.includes('dashboard.html');
    if (isDashboardPage) {
      loadDashboardScript();
    }
  }

  function loadCharterAddendumScript() {
    if (document.querySelector('script[src="assets/js/charter-addendum.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/charter-addendum.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadStructureScript() {
    if (document.querySelector('script[src="assets/js/structure-map.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/structure-map.js';
    script.defer = true;
    document.body.appendChild(script);
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

  function loadJusticeScript() {
    if (document.querySelector('script[src="assets/js/justice.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/justice.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadSafetyScript() {
    if (document.querySelector('script[src="assets/js/safety.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/safety.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadFinanceScript() {
    if (document.querySelector('script[src="assets/js/finance.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/finance.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadTreasuryScript() {
    if (document.querySelector('script[src="assets/js/treasury.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/treasury.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadCultureScript() {
    if (document.querySelector('script[src="assets/js/culture.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/culture.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadCommunicationsScript() {
    if (document.querySelector('script[src="assets/js/communications.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/communications.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadEnvironmentScript() {
    if (document.querySelector('script[src="assets/js/environment.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/environment.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadSustainabilityScript() {
    if (document.querySelector('script[src="assets/js/sustainability.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/sustainability.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadHealthEquityScript() {
    if (document.querySelector('script[src="assets/js/health-equity.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/health-equity.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadBandwidthScript() {
    if (document.querySelector('script[src="assets/js/bandwidth.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/bandwidth.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadResearchScript() {
    if (document.querySelector('script[src="assets/js/research.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/research.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadLabsScript() {
    if (document.querySelector('script[src="assets/js/labs.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/labs.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadEmergingTechScript() {
    if (document.querySelector('script[src="assets/js/emerging-tech.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/emerging-tech.js';
    script.defer = true;
    document.body.appendChild(script);
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
    const el = document.getElementById('member-count');
    if (!el) return;
    fetch('assets/data/registry.json')
      .then(response => {
        if (!response.ok) throw new Error('registry ' + response.status);
        return response.json();
      })
      .then(data => {
        const count = typeof data?.count === 'number' ? data.count : (Array.isArray(data?.entries) ? data.entries.length : 0);
        el.textContent = String(count);
      })
      .catch(() => {
        el.textContent = '--';
      });
  }

  function initDropdownNavigation() {
    const menu = document.querySelector('.menu');
    if (!menu) return;
    const dropdowns = menu.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(dropdown => {
      const summary = dropdown.querySelector('summary');
      if (!summary) return;
      summary.addEventListener('click', (evt) => {
        const wasOpen = dropdown.hasAttribute('open');
        dropdowns.forEach(d => {
          if (d !== dropdown && d.hasAttribute('open')) {
            d.removeAttribute('open');
            d.setAttribute('aria-hidden', 'true');
          }
        });
        if (!wasOpen) {
          dropdown.setAttribute('open', '');
          dropdown.removeAttribute('aria-hidden');
        } else {
          dropdown.removeAttribute('open');
          dropdown.setAttribute('aria-hidden', 'true');
        }
        evt.preventDefault();
        evt.stopPropagation();
      });
      dropdown.addEventListener('keydown', (event) => {
        summary.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && dropdown.hasAttribute('open')) {
            dropdown.removeAttribute('open');
            dropdown.setAttribute('aria-hidden', 'true');
            summary.focus();
          }
        });
      });
    });
    if (menu.dataset.open === 'true') {
      dropdowns.forEach(d => d.removeAttribute('open'));
    }
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.nav-dropdown') && !event.target.closest('.menu-toggle')) {
        dropdowns.forEach(d => {
          d.removeAttribute('open');
          d.setAttribute('aria-hidden', 'true');
        });
      }
    });
  }
})();
