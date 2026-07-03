(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    if (typeof DigitalNationNav === 'undefined' || !DigitalNationNav.injectHeader) {
      return;
    }
    DigitalNationNav.injectHeader('#site-menu');
    setupMenu();
    liveYear();
    renderStats();
    renderPillars();
    renderPrograms();
    renderInstruments();
    renderReports();
    initFilters();
  }

  /* ---- stats ---- */
  function renderStats() {
    const container = document.getElementById('economy-stats');
    if (!container) return;
    fetch('assets/data/economy.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        const stats = data.stats || {};
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
        container.innerHTML = '<div class="activity-empty">Economy summary is temporarily unavailable.</div>';
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
    const container = document.getElementById('economy-pillars');
    if (!container) return;
    fetch('assets/data/economy.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        const items = Array.isArray(data.pillars) ? data.pillars.slice() : [];
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

  /* ---- programs / instruments / reports ---- */
  function renderPrograms() {
    loadSection('economy-programs-feed', 'programs', 'Economy programs');
  }

  function renderInstruments() {
    loadSection('economy-instruments-feed', 'instruments', 'Financial instruments');
  }

  function renderReports() {
    loadSection('economy-reports-feed', 'reports', 'Governance and audit reports');
  }

  /* ---- shared loader ---- */
  function loadSection(feedId, sectionKey, placeholderText) {
    var feed = document.getElementById(feedId);
    if (!feed) return;
    feed.innerHTML = '<div class="activity-loading" aria-hidden="true">Loading ' + escapeHtml(placeholderText || sectionKey) + '...</div>';

    fetch('assets/data/economy.json')
      .then(function (response) {
        if (!response.ok) throw new Error('economy data unavailable');
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
      var meta = escapeHtml(String(item.id || '')) + ' · ' + escapeHtml(String(item.category || '')) + ' · ' + escapeHtml(String(item.owner || item.lead || '—'));
      var extra = buildExtraMeta(item);
      return '<article class="activity-item" role="article" aria-label="' + escapeHtml(String(item.id || item.title || '')) + '">' +
        '<div class="activity-content">' +
          '<h3 class="activity-title">' + escapeHtml(String(item.title || 'Untitled')) + '</h3>' +
          '<p class="activity-description">' + escapeHtml(String(item.summary || '')) + '</p>' +
          '<div class="activity-meta">' +
            '<span class="activity-type">' + escapeHtml(String(item.category || 'Program')) + '</span>' +
            '<span class="activity-divider">·</span>' +
            '<span>' + escapeHtml(String(item.id || '')) + '</span>' +
            '<span class="activity-divider">·</span>' +
            '<span>' + escapeHtml(String(item.owner || item.lead || '—')) + '</span>' +
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
    if (item.budget) parts.push('<span class="meta-budget">Budget: ' + escapeHtml(String(item.budget)) + '</span>');
    if (item.participants) parts.push('<span class="metric">Participants: ' + escapeHtml(String(item.participants)) + '</span>');
    if (item.issuance) parts.push('<span class="metric">Issuance: ' + escapeHtml(String(item.issuance)) + '</span>');
    if (item.holders) parts.push('<span class="metric">Holders: ' + escapeHtml(String(item.holders)) + '</span>');
    if (item.published) parts.push('<span class="meta-date">Published: ' + escapeHtml(String(item.published)) + '</span>');
    return parts.join('<span class="activity-divider">·</span>');
  }

  /* ---- filters ---- */
  function initFilters() {
    var searchField = document.getElementById('economy-search');
    var scopeField = document.getElementById('economy-scope');
    if (!searchField || !scopeField) return;

    var cachedData = null;
    fetch('assets/data/economy.json')
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        cachedData = data;
      })
      .catch(function () {
        cachedData = null;
      });

    function applyFilter() {
      if (!cachedData) return;
      var term = searchField.value.trim().toLowerCase();
      var scope = scopeField.value;

      var items = [];
      if (scope === 'all' || scope === 'programs') {
        (cachedData.entries && cachedData.entries.programs || []).forEach(function (entry) {
          items.push(entry);
        });
      }
      if (scope === 'all' || scope === 'instruments') {
        (cachedData.entries && cachedData.entries.instruments || []).forEach(function (entry) {
          items.push(entry);
        });
      }
      if (scope === 'all' || scope === 'reports') {
        (cachedData.entries && cachedData.entries.reports || []).forEach(function (entry) {
          items.push(entry);
        });
      }

      var filtered = items.filter(function (entry) {
        var searchable =
          (entry.title || '') + ' ' +
          (entry.id || '') + ' ' +
          (entry.summary || '') + ' ' +
          (entry.category || '') + ' ' +
          (entry.owner || '') + ' ' +
          (entry.status || '');
        return !term || String(searchable).toLowerCase().indexOf(term) !== -1;
      });

      renderMixedList('economy-mixed-feed', filtered);
    }

    searchField.addEventListener('input', function () { applyFilter(); });
    scopeField.addEventListener('change', function () { applyFilter(); });
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
