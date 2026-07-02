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
  }

  function loadEngageScript() {