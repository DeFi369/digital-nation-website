(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    if (typeof DigitalNationNav !== 'undefined' && DigitalNationNav.injectHeader) {
      DigitalNationNav.injectHeader('#site-menu');
    }
    /* menu + year handled by site.js */
    renderStats();
    renderPillars();
    renderFrameworksFeed();
    renderCasesFeed();
    renderProtocolsFeed();
    initFilters();
  }

  /* ---- stats ---- */
  function renderStats() {
    var container = document.getElementById('justice-stats');
    if (!container) return;
    fetch('assets/data/justice.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var stats = data.stats || {};
        var html = '';
        Object.keys(stats).forEach(function (key) {
          html += '<div class="stat">' +
            '<span class="stat-value">' + escapeHtml(String(stats[key])) + '</span>' +
            '<span class="stat-label">' + escapeHtml(pascalToTitle(key)) + '</span>' +
          '</div>';
        });
        container.innerHTML = html;
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Justice summary is temporarily unavailable.</div>';
      });
  }

  function pascalToTitle(value) {
    return String(value)
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, function (s) { return s.toUpperCase(); })
      .trim();
  }

  /* ---- pillars ---- */
  function renderPillars() {
    var container = document.getElementById('justice-pillars');
    if (!container) return;
    fetch('assets/data/justice.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var items = Array.isArray(data.pillars) ? data.pillars.slice() : [];
        container.innerHTML = items.map(function (item) {
          return '<article class="activity-item pillar">' +
            '<div class="activity-content">' +
            '<h3 class="activity-title">' + escapeHtml(String(item.title || '')) + '</h3>' +
            '<p class="activity-description">' + escapeHtml(String(item.summary || '')) + '</p>' +
            '</div>' +
            '</article>';
        }).join('');
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Pillar data is temporarily unavailable.</div>';
      });
  }

  /* ---- feeds ---- */
  function renderFrameworksFeed() {
    loadSection('justice-frameworks-feed', 'frameworks', 'Frameworks');
  }

  function renderCasesFeed() {
    loadSection('justice-cases-feed', 'cases', 'Cases');
  }

  function renderProtocolsFeed() {
    loadSection('justice-protocols-feed', 'protocols', 'Protocols');
  }

  /* ---- shared loader ---- */
  function loadSection(feedId, sectionKey, placeholderText) {
    var feed = document.getElementById(feedId);
    if (!feed) return;
    feed.innerHTML = '<div class="activity-loading" aria-hidden="true">Loading ' + escapeHtml(placeholderText || sectionKey) + '...</div>';

    fetch('assets/data/justice.json')
      .then(function (response) {
        if (!response.ok) throw new Error('justice data unavailable');
        return response.json();
      })
      .then(function (data) {
        var entries = data.entries && data.entries[sectionKey] ? data.entries[sectionKey] : [];
        var items = Array.isArray(entries) ? entries.slice() : [];
        renderList(feed, items);
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">' + escapeHtml(placeholderText || sectionKey) + ' are temporarily unavailable.</div>';
      });
  }

  /* ---- render list ---- */
  function renderList(container, items) {
    if (!items.length) {
      container.innerHTML = '<div class="activity-empty">No matching entries found.</div>';
      return;
    }
    container.innerHTML = items.map(function (item) {
      var statusClass = 'status-' + slugify(String(item.status || 'unknown'));
      var extra = buildExtraMeta(item);
      return '<article class="activity-item" role="article" aria-label="' + escapeHtml(String(item.id || item.title || '')) + '">' +
        '<div class="activity-content">' +
          '<h3 class="activity-title">' + escapeHtml(String(item.title || 'Untitled')) + '</h3>' +
          '<p class="activity-description">' + escapeHtml(String(item.summary || '')) + '</p>' +
          '<div class="activity-meta">' +
            '<span class="activity-type">' + escapeHtml(String(item.category || 'Case')) + '</span>' +
            '<span class="activity-divider">·</span>' +
            '<span>' + escapeHtml(String(item.id || '')) + '</span>' +
            '<span class="activity-divider">·</span>' +
            '<span>' + escapeHtml(String(item.owner || item.lead || item.petitioner || '—')) + '</span>' +
          '</div>' +
          (extra ? '<div class="activity-meta economics-meta">' + extra + '</div>' : '') +
        '</div>' +
        '<div class="activity-sidebar">' +
          '<span class="activity-status ' + statusClass + '">' + escapeHtml(String(item.status || '—')) + '</span>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function buildExtraMeta(item) {
    var parts = [];
    if (item.publicationDate) parts.push('<span class="meta-date">Published: ' + escapeHtml(String(item.publicationDate)) + '</span>');
    if (item.charterArticle) parts.push('<span class="metric">Charter: ' + escapeHtml(String(item.charterArticle)) + '</span>');
    if (item.decisionDate) parts.push('<span class="meta-date">Decided: ' + escapeHtml(String(item.decisionDate)) + '</span>');
    if (item.judge) parts.push('<span class="metric">Judge: ' + escapeHtml(String(item.judge)) + '</span>');
    if (item.respondent) parts.push('<span class="metric">Respondent: ' + escapeHtml(String(item.respondent)) + '</span>');
    if (item.lastReviewed) parts.push('<span class="meta-date">Reviewed: ' + escapeHtml(String(item.lastReviewed)) + '</span>');
    if (item.affectedServices) parts.push('<span class="metric">Services: ' + escapeHtml(Array.isArray(item.affectedServices) ? item.affectedServices.join(', ') : String(item.affectedServices)) + '</span>');
    return parts.join('<span class="activity-divider">·</span>');
  }

  /* ---- filters ---- */
  function initFilters() {
    var searchField = document.getElementById('justice-search');
    var statusField = document.getElementById('justice-status');
    var typeField = document.getElementById('justice-type');
    if (!searchField || !statusField || !typeField) return;

    var cachedData = null;
    fetch('assets/data/justice.json')
      .then(function (res) { return res.json(); })
      .then(function (data) { cachedData = data; })
      .catch(function () { cachedData = null; });

    function applyFilter() {
      if (!cachedData) return;
      var term = searchField.value.trim().toLowerCase();
      var status = statusField.value;
      var type = typeField.value;

      var allItems = [];
      var entries = cachedData.entries || {};
      ['frameworks', 'cases', 'protocols'].forEach(function (key) {
        (entries[key] || []).forEach(function (entry) {
          allItems.push(entry);
        });
      });

      var filtered = allItems.filter(function (entry) {
        var searchable =
          (entry.title || '') + ' ' +
          (entry.id || '') + ' ' +
          (entry.summary || '') + ' ' +
          (entry.category || '') + ' ' +
          (entry.owner || entry.petitioner || '') + ' ' +
          (entry.status || '');
        var matchesTerm = !term || String(searchable).toLowerCase().indexOf(term) !== -1;
        var matchesStatus = status === 'all' || entry.status === status;
        var matchesType = type === 'all' || entry.category === type || (type === 'framework' && entry.category === 'Constitutional Framework') || (type === 'protocol' && entry.category === 'Protocol') || (type === 'policy' && entry.category === 'Policy');
        return matchesTerm && matchesStatus && matchesType;
      });

      renderMixedList('justice-mixed-feed', filtered);
    }

    searchField.addEventListener('input', function () { applyFilter(); });
    statusField.addEventListener('change', function () { applyFilter(); });
    typeField.addEventListener('change', function () { applyFilter(); });
  }

  function renderMixedList(feedId, items) {
    var feed = document.getElementById(feedId);
    if (!feed) return;
    if (!items.length) {
      feed.innerHTML = '<div class="activity-empty">No matching entries found.</div>';
      return;
    }
    renderList(feed, items);
  }

  /* ---- menu / year ---- */
  function setupMenu() {
    var menuButton = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.menu');
    if (!menuButton || !menu) return;
    menuButton.addEventListener('click', function () {
      var open = menu.dataset.open === 'true';
      menu.dataset.open = String(!open);
      menu.setAttribute('aria-hidden', String(open));
      menuButton.setAttribute('aria-expanded', String(!open));
      if (!open) {
        var firstLink = menu.querySelector('a');
        if (firstLink) setTimeout(function () { firstLink.focus(); }, 0);
      }
    });
    menu.addEventListener('keydown', function (e) {
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
      var yearEl = document.querySelector('[data-year]');
      if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    } catch {}
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function slugify(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'unknown';
  }
})();
