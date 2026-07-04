/* Global navigation templates.
   Edit link groups here (NAV_GROUPS); one change propagates to the header
   dropdowns AND the footer sitemap on every page that loads this module. */
var DigitalNationNav = (function () {
  'use strict';

  /* Single source of truth for site navigation. */
  var NAV_GROUPS = [
    { label: 'Foundations', links: [
      { href: 'about.html', label: 'About' },
      { href: 'goals.html', label: 'Goals' },
      { href: 'initiatives.html', label: 'Initiatives' },
      { href: 'manifesto.html', label: 'Manifesto' },
      { href: 'charter.html', label: 'Charter' },
      { href: 'charter-addendum.html', label: 'Charter Addendum' },
      { href: 'structure.html', label: 'Structure' },
      { href: 'contact.html', label: 'Contact' }
    ]},
    { label: 'Governance', links: [
      { href: 'assembly.html', label: 'Assembly' },
      { href: 'court.html', label: 'Court' },
      { href: 'justice.html', label: 'Justice' },
      { href: 'safety.html', label: 'Safety' }
    ]},
    { label: 'Identity', links: [
      { href: 'citizenship.html', label: 'Citizenship' },
      { href: 'passport.html', label: 'Passport' },
      { href: 'registry.html', label: 'Registry' }
    ]},
    { label: 'Policy', links: [
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
    ]},
    { label: 'Diplomacy', links: [
      { href: 'recognition.html', label: 'Recognition' },
      { href: 'missions.html', label: 'Missions' },
      { href: 'diplomacy.html', label: 'Diplomacy' },
      { href: 'protocol.html', label: 'Protocol' },
      { href: 'protocol-status.html', label: 'Protocol Status' },
      { href: 'quantum-roadmap.html', label: 'Quantum Roadmap' },
      { href: 'consular.html', label: 'Consular' },
      { href: 'culture.html', label: 'Culture' },
      { href: 'communications.html', label: 'Communications' }
    ]},
    { label: 'Engagement', links: [
      { href: 'engage.html', label: 'Engage' },
      { href: 'citizen-hub.html', label: 'Citizen Hub' },
      { href: 'tools.html', label: 'Tools' },
      { href: 'transparency.html', label: 'Transparency' },
      { href: 'digital-service-corps.html', label: 'Digital Service Corps' },
      { href: 'elections.html', label: 'Elections &amp; Petitions' },
      { href: 'privacy.html', label: 'Privacy' },
      { href: 'terms.html', label: 'Terms' }
    ]}
  ];

  function anchor(link) {
    var extra = link.external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return '<a href="' + link.href + '"' + extra + '>' + link.label + '</a>';
  }

  function details(summaryText, links) {
    var html = '';
    for (var i = 0; i < links.length; i++) {
      html += anchor(links[i]);
    }
    /* groups with many links get a two-column panel so they stay on screen */
    var wide = links.length > 8 ? ' dropdown-wrap--wide' : '';
    return '<details class="nav-dropdown"><summary>' + summaryText + '</summary>' +
      '<div class="dropdown-wrap' + wide + '">' +
      '<span class="dropdown-label" aria-hidden="true">' + summaryText + '</span>' +
      html + '</div></details>';
  }

  /* highlight the page being viewed: accent the link + its parent group */
  function markCurrent(container) {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    var links = container.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('href') === path) {
        links[i].setAttribute('aria-current', 'page');
        var dropdown = links[i].closest ? links[i].closest('.nav-dropdown') : null;
        if (dropdown) dropdown.classList.add('has-current');
      }
    }
  }

  /* Header: menu contents only. Every page injects this into the #site-menu
     <nav> already present in its static header — do NOT emit brand/counter/
     toggle here or the header chrome gets duplicated inside the menu panel. */
  function headerFragment() {
    var template = document.createElement('template');
    var html = '<a href="index.html">Home</a>';
    for (var i = 0; i < NAV_GROUPS.length; i++) {
      html += details(NAV_GROUPS[i].label, NAV_GROUPS[i].links);
    }
    template.innerHTML = html;
    return template.content;
  }

  /* Footer: sitemap column grid. Injected into the (empty) .footer-nav
     element each page carries — footers have room, so no dropdowns here. */
  function footerFragment() {
    var template = document.createElement('template');
    var html = '';
    for (var i = 0; i < NAV_GROUPS.length; i++) {
      html += '<div class="footer-col">';
      html += '<span class="footer-col-title">' + NAV_GROUPS[i].label + '</span>';
      for (var j = 0; j < NAV_GROUPS[i].links.length; j++) {
        html += anchor(NAV_GROUPS[i].links[j]);
      }
      html += '</div>';
    }
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
    markCurrent(container);
  }

  function injectHeader(parentSelector) {
    inject(parentSelector, headerFragment);
  }

  function injectFooter(parentSelector) {
    inject(parentSelector, footerFragment);
  }

  return {
    injectHeader: injectHeader,
    injectFooter: injectFooter,
    headerFragment: headerFragment,
    footerFragment: footerFragment,
    injectEngagement: injectEngagement,
    buildEngagementFragment: buildEngagementFragment
  };
})();

/* Fallback: fill any nav container a page script hasn't filled by DOM-ready,
   so no page ever ships an empty menu or footer. Re-injection by page
   scripts is harmless (inject clears the container first). */
(function () {
  function autoInject() {
    var menu = document.getElementById('site-menu');
    if (menu && !menu.firstElementChild) {
      DigitalNationNav.injectHeader('#site-menu');
    }
    var footerNav = document.querySelector('.footer-nav');
    if (footerNav && !footerNav.firstElementChild) {
      DigitalNationNav.injectFooter('.footer-nav');
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInject);
  } else {
    autoInject();
  }
})();
