/* Global navigation templates.
   Edit markup here; one change propagates across all pages that load this module. */
var DigitalNationNav = (function () {
  'use strict';

  function details(summaryText, hrefs) {
    var links = '';
    for (var i = 0; i < hrefs.length; i++) {
      links += '<a href="' + hrefs[i].href + '">' + hrefs[i].label + '</a>';
    }
    return '<details class="nav-dropdown"><summary>' + summaryText + '</summary><div class="dropdown-wrap">' + links + '</div></details>';
  }

  function headerFragment() {
    var template = document.createElement('template');
    var html = '<div class="nav">';
    html += '<a class="brand" href="index.html">';
    html += '<img class="logo-img" src="assets/images/digital-nation-logo.svg" alt="The Principality of Aetheria"/>';
    html += '<span class="logo-text">AETHERIA</span>';
    html += '</a>';
    html += '<span class="member-counter" id="member-counter" title="Registered citizens">';
    html += '<span class="member-counter-label" aria-hidden="true">Members</span>';
    html += '<span class="member-counter-value" id="member-count" aria-live="polite" aria-label="Current member total">--</span>';
    html += '</span>';
    html += '<button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="site-menu">';
    html += '<span class="menu-toggle-bar"></span>';
    html += '<span class="menu-toggle-bar"></span>';
    html += '<span class="menu-toggle-bar"></span>';
    html += '</button>';
    html += '<nav class="menu" id="site-menu" aria-hidden="true">';
    html += '<a href="index.html">Home</a>';
    html += details('Foundations', [
      { href: 'about.html', label: 'About' },
      { href: 'goals.html', label: 'Goals' },
      { href: 'initiatives.html', label: 'Initiatives' },
      { href: 'manifesto.html', label: 'Manifesto' },
      { href: 'charter.html', label: 'Charter' },
      { href: 'charter-addendum.html', label: 'Charter Addendum' },
      { href: 'structure.html', label: 'Structure' },
      { href: 'contact.html', label: 'Contact' }
    ]);
    html += details('Governance', [
      { href: 'assembly.html', label: 'Assembly' },
      { href: 'court.html', label: 'Court' },
      { href: 'justice.html', label: 'Justice' },
      { href: 'safety.html', label: 'Safety' }
    ]);
    html += details('Identity', [
      { href: 'citizenship.html', label: 'Citizenship' },
      { href: 'passport.html', label: 'Passport' },
      { href: 'registry.html', label: 'Registry' }
    ]);
    html += details('Policy', [
      { href: 'economy.html', label: 'Economy' },
      { href: 'finance.html', label: 'Finance' },
      { href: 'treasury.html', label: 'Treasury' },
      { href: 'environment.html', label: 'Environment' },
      { href: 'sustainability.html', label: 'Sustainability' },
      { href: 'science.html', label: 'Science' },
      { href: 'technology.html', label: 'Technology' },
      { href: 'research-papers.html', label: 'Research Papers' },
      { href: 'https://github.com/defi369/WorldHermes', label: 'WorldHermes', external: true },
      { href: 'health-equity.html', label: 'Health Equity' },
      { href: 'bandwidth.html', label: 'Bandwidth' },
      { href: 'education.html', label: 'Education' },
      { href: 'health.html', label: 'Health' },
      { href: 'infrastructure.html', label: 'Infrastructure' }
    ]);
    html += details('Diplomacy', [
      { href: 'recognition.html', label: 'Recognition' },
      { href: 'missions.html', label: 'Missions' },
      { href: 'diplomacy.html', label: 'Diplomacy' },
      { href: 'protocol.html', label: 'Protocol' },
      { href: 'protocol-status.html', label: 'Protocol Status' },
      { href: 'quantum-roadmap.html', label: 'Quantum Roadmap' },
      { href: 'consular.html', label: 'Consular' },
      { href: 'culture.html', label: 'Culture' },
      { href: 'communications.html', label: 'Communications' }
    ]);
    html += details('Engagement', [
      { href: 'engage.html', label: 'Engage' },
      { href: 'citizen-hub.html', label: 'Citizen Hub' },
      { href: 'tools.html', label: 'Tools' },
      { href: 'transparency.html', label: 'Transparency' },
      { href: 'digital-service-corps.html', label: 'Digital Service Corps' },
      { href: 'elections.html', label: 'Elections &amp; Petitions' }
    ]);
    html += '</nav>';
    html += '</div>';
    template.innerHTML = html;
    return template.content;
  }

  function footerFragment() {
    var template = document.createElement('template');
    var html = '<nav class="footer-nav" aria-label="Footer">';
    html += details('Foundations', [
      { href: 'about.html', label: 'About' },
      { href: 'goals.html', label: 'Goals' },
      { href: 'initiatives.html', label: 'Initiatives' },
      { href: 'manifesto.html', label: 'Manifesto' },
      { href: 'charter.html', label: 'Charter' },
      { href: 'charter-addendum.html', label: 'Charter Addendum' },
      { href: 'structure.html', label: 'Structure' },
      { href: 'contact.html', label: 'Contact' }
    ]);
    html += details('Governance', [
      { href: 'assembly.html', label: 'Assembly' },
      { href: 'court.html', label: 'Court' },
      { href: 'justice.html', label: 'Justice' },
      { href: 'safety.html', label: 'Safety' }
    ]);
    html += details('Identity', [
      { href: 'citizenship.html', label: 'Citizenship' },
      { href: 'passport.html', label: 'Passport' },
      { href: 'registry.html', label: 'Registry' }
    ]);
    html += details('Policy', [
      { href: 'economy.html', label: 'Economy' },
      { href: 'finance.html', label: 'Finance' },
      { href: 'treasury.html', label: 'Treasury' },
      { href: 'environment.html', label: 'Environment' },
      { href: 'sustainability.html', label: 'Sustainability' },
      { href: 'science.html', label: 'Science' },
      { href: 'technology.html', label: 'Technology' },
      { href: 'health-equity.html', label: 'Health Equity' },
      { href: 'bandwidth.html', label: 'Bandwidth' },
      { href: 'education.html', label: 'Education' },
      { href: 'health.html', label: 'Health' },
      { href: 'infrastructure.html', label: 'Infrastructure' }
    ]);
    html += details('Diplomacy', [
      { href: 'recognition.html', label: 'Recognition' },
      { href: 'missions.html', label: 'Missions' },
      { href: 'diplomacy.html', label: 'Diplomacy' },
      { href: 'protocol.html', label: 'Protocol' },
      { href: 'consular.html', label: 'Consular' },
      { href: 'culture.html', label: 'Culture' },
      { href: 'communications.html', label: 'Communications' }
    ]);
    html += details('Engagement', [
      { href: 'engage.html', label: 'Engage' },
      { href: 'citizen-hub.html', label: 'Citizen Hub' },
      { href: 'tools.html', label: 'Tools' },
      { href: 'transparency.html', label: 'Transparency' },
      { href: 'digital-service-corps.html', label: 'Digital Service Corps' },
      { href: 'elections.html', label: 'Elections &amp; Petitions' }
    ]);
    html += '</nav>';
    html += '<div class="footer-extras">';
    html += '<a class="social-link" href="https://github.com" rel="noopener noreferrer" target="_blank" aria-label="GitHub repository">';
    html += '<span aria-hidden="true">GitHub</span>';
    html += '</a>';
    html += '</div>';
    template.innerHTML = html;
    return template.content;
  }

  function engagementLinks() {
    return [
      { href: 'engage.html', label: 'Engage' },
      { href: 'citizen-hub.html', label: 'Citizen Hub' },
      { href: 'tools.html', label: 'Tools' },
      { href: 'transparency.html', label: 'Transparency' },
      { href: 'digital-service-corps.html', label: 'Digital Service Corps' },
      { href: 'elections.html', label: 'Elections & Petitions' },
      { href: 'open-records.html', label: 'Open Records' },
      { href: 'data-governance.html', label: 'Data Governance' },
      { href: 'situational-awareness.html', label: 'Situational Awareness' }
    ];
  }

  function buildEngagementFragment() {
    var links = engagementLinks();
    var html = '<details class="nav-dropdown"><summary>Engagement</summary><div class="dropdown-wrap">';
    for (var i = 0; i < links.length; i++) {
      html += '<a href="' + links[i].href + '">' + links[i].label + '</a>';
    }
    html += '</div></details>';
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content;
  }

  function injectEngagement(containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) {
      return;
    }
    var fragment = buildEngagementFragment();
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(fragment);
  }

  return {
    injectHeader: injectHeader,
    injectFooter: injectFooter,
    headerFragment: headerFragment,
    footerFragment: footerFragment,
    injectEngagement: injectEngagement,
    buildEngagementFragment: buildEngagementFragment
  };

  function inject(parentSelector, fragmentFactory) {
    var container = document.querySelector(parentSelector);
    if (!container) {
      return;
    }
    var fragment = fragmentFactory();
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(fragment);
  }

  function injectHeader(parentSelector) {
    inject(parentSelector, headerFragment);
  }

  function injectFooter(parentSelector) {
    inject(parentSelector, footerFragment);
  }
})();
