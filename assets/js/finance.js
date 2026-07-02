(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    try {
      loadProgramsFeed();
      loadInstrumentsFeed();
      loadReportsFeed();
      attachListeners();
    } catch {}
  }

  /* ---------- Data helpers ---------- */

  function getAllItems(data, section) {
    var entries = data.entries && data.entries[section];
    return Array.isArray(entries) ? entries.slice() : [];
  }

  function renderSection(container, items, sectionKey) {
    if (!container) return;

    if (!items.length) {
      container.innerHTML = '<div class="activity-empty">No ' + escapeHtml(sectionKey) + ' found.</div>';
      return;
    }

    var html = items.map(function (item) {
      return (
        '<article class="activity-item" role="article" aria-label="' + escapeHtml(String(item.title || item.id || '')) + '">' +
          '<div class="activity-content">' +
            '<h3 class="activity-title">' + escapeHtml(String(item.title || 'Untitled')) + '</h3>' +
            '<p class="activity-description">' + escapeHtml(String(item.summary || '')) + '</p>' +
            '<div class="activity-meta">' +
              '<span class="activity-type">' + escapeHtml(String(item.category || 'Program')) + '</span>' +
              '<span class="activity-divider">·</span>' +
              '<span>' + escapeHtml(String(item.id || '')) + '</span>' +
              '<span class="activity-divider">·</span>' +
              '<span>' + escapeHtml(String(item.owner || '—')) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="activity-sidebar">' +
            '<span class="activity-status status-' + slugify(String(item.status || 'unknown')) + '">' + escapeHtml(String(item.status || '')) + '</span>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    container.innerHTML = html || '<div class="activity-empty">No items found.</div>';
  }

  /* ---------- Feed loaders ---------- */

  function getFinanceData() {
    if (!window.__financeDataPromise) {
      window.__financeDataPromise = fetch('assets/data/finance.json')
        .then(function (response) {
          if (!response.ok) throw new Error('finance data unavailable');
          return response.json();
        })
        .catch(function () { return null; });
    }
    return window.__financeDataPromise;
  }

  function wireFeed(containerId, sectionKey, statusFieldId, searchFieldId) {
    var feed = document.getElementById(containerId);
    if (!feed) return;

    getFinanceData().then(function (data) {
      if (!data) {
        feed.innerHTML = '<div class="activity-empty">Economic data is temporarily unavailable.</div>';
        return;
      }
      var items = getAllItems(data, sectionKey);
      renderSection(feed, items, sectionKey);
    });
  }

  function loadProgramsFeed() {
    wireFeed('finance-programs-feed', 'programs', 'finance-status', 'finance-search');
  }

  function loadInstrumentsFeed() {
    wireFeed('finance-instruments-feed', 'instruments', 'finance-status', 'finance-search');
  }

  function loadReportsFeed() {
    wireFeed('finance-reports-feed', 'reports', 'finance-status', 'finance-search');
  }

  /* ---------- Live filter/search ---------- */

  function attachListeners() {
    var searchField = document.getElementById('finance-search');
    var statusField = document.getElementById('finance-status');

    if (searchField) {
      searchField.addEventListener('input', debounce(updateFinances, 250));
    }
    if (statusField) {
      statusField.addEventListener('change', updateFinances);
    }
  }

  function updateFinances() {
    var term = '';
    var status = 'all';
    var searchEl = document.getElementById('finance-search');
    var statusEl = document.getElementById('finance-status');

    if (searchEl) term = searchEl.value.trim().toLowerCase();
    if (statusEl) status = statusEl.value;

    getFinanceData().then(function (data) {
      if (!data) return;

      var map = {
        'finance-programs-feed': 'programs',
        'finance-instruments-feed': 'instruments',
        'finance-reports-feed': 'reports'
      };

      Object.keys(map).forEach(function (containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;
        var items = getAllItems(data, map[containerId]);
        var filtered = items.filter(function (entry) {
          var matchesStatus = status === 'all' || (entry.status || '').toLowerCase() === status.toLowerCase();
          var matchesTerm = !term ||
            String(entry.title || '').toLowerCase().indexOf(term) !== -1 ||
            String(entry.id || '').toLowerCase().indexOf(term) !== -1 ||
            String(entry.category || '').toLowerCase().indexOf(term) !== -1 ||
            String(entry.owner || '').toLowerCase().indexOf(term) !== -1;
          return matchesStatus && matchesTerm;
        });
        renderSection(container, filtered, map[containerId]);
      });
    });
  }

  /* ---------- Utilities ---------- */

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function slugify(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'unknown';
  }

  function debounce(fn, delay) {
    var timer;
    return function () {
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(null, args); }, delay);
    };
  }
})();
