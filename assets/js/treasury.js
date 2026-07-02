(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    try {
      loadOperationsFeed();
      loadAssetsFeed();
      loadReservesFeed();
      buildTreasuryCache();
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
        '<article class="activity-item treasury-item" role="article" aria-label="' + escapeHtml(String(item.title || item.id || '')) + '">' +
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
            '<span class="activity-status treasury-status-' + slugify(String(item.status || 'unknown')) + '">' + escapeHtml(String(item.status || '')) + '</span>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    container.innerHTML = html || '<div class="activity-empty">No items found.</div>';
  }

  /* ---------- Feed loaders ---------- */

  function getTreasuryData() {
    if (!window.__treasuryDataPromise) {
      window.__treasuryDataPromise = fetch('assets/data/treasury.json')
        .then(function (response) {
          if (!response.ok) throw new Error('treasury data unavailable');
          return response.json();
        })
        .catch(function () { return null; });
    }
    return window.__treasuryDataPromise;
  }

  function wireFeed(containerId, sectionKey) {
    var feed = document.getElementById(containerId);
    if (!feed) return;

    getTreasuryData().then(function (data) {
      if (!data) {
        feed.innerHTML = '<div class="activity-empty">Treasury data is temporarily unavailable.</div>';
        return;
      }
      var items = getAllItems(data, sectionKey);
      renderSection(feed, items, sectionKey);
    });
  }

  function loadOperationsFeed() {
    wireFeed('treasury-operations-feed', 'operations');
  }

  function loadAssetsFeed() {
    wireFeed('treasury-assets-feed', 'assets');
  }

  function loadReservesFeed() {
    wireFeed('treasury-reserves-feed', 'reserves');
  }

  /* ---------- Shared filter cache ---------- */

  function buildTreasuryCache() {
    getTreasuryData().then(function (data) {
      window.__treasuryData = data;
    });
  }

  function updateTreasuryFeeds() {
    var data = window.__treasuryData;
    if (!data) return;

    var term = '';
    var sectionFilter = 'all';
    var statusFilter = 'all';

    var searchEl = document.getElementById('treasury-search');
    var sectionEl = document.getElementById('treasury-section');
    var statusEl = document.getElementById('treasury-status');

    if (searchEl) term = searchEl.value.trim().toLowerCase();
    if (sectionEl) sectionFilter = sectionEl.value;
    if (statusEl) statusFilter = statusEl.value;

    var sections = (data.entries || {});
    var operations = Array.isArray(sections.operations) ? sections.operations.slice() : [];
    var assets = Array.isArray(sections.assets) ? sections.assets.slice() : [];
    var reserves = Array.isArray(sections.reserves) ? sections.reserves.slice() : [];

    if (sectionFilter !== 'all') {
      if (sectionFilter !== 'operations') operations = [];
      if (sectionFilter !== 'assets') assets = [];
      if (sectionFilter !== 'reserves') reserves = [];
    }

    if (term) {
      operations = operations.filter(matchesTerm(term));
      assets = assets.filter(matchesTerm(term));
      reserves = reserves.filter(matchesTerm(term));
    }

    if (statusFilter !== 'all') {
      operations = operations.filter(statusFn(statusFilter));
      assets = assets.filter(statusFn(statusFilter));
      reserves = reserves.filter(statusFn(statusFilter));
    }

    renderSection(document.getElementById('treasury-operations-feed'), operations, 'operations');
    renderSection(document.getElementById('treasury-assets-feed'), assets, 'assets');
    renderSection(document.getElementById('treasury-reserves-feed'), reserves, 'reserves');
  }

  function matchesTerm(term) {
    return function (entry) {
      return (
        String(entry.title || '').toLowerCase().indexOf(term) !== -1 ||
        String(entry.id || '').toLowerCase().indexOf(term) !== -1 ||
        String(entry.category || '').toLowerCase().indexOf(term) !== -1 ||
        String(entry.owner || '').toLowerCase().indexOf(term) !== -1
      );
    };
  }

  function statusFn(filter) {
    return function (entry) { return (entry.status || '').toLowerCase() === filter.toLowerCase(); };
  }

  /* ---------- Listeners ---------- */

  function attachListeners() {
    var searchEl = document.getElementById('treasury-search');
    var sectionEl = document.getElementById('treasury-section');
    var statusEl = document.getElementById('treasury-status');

    if (searchEl) searchEl.addEventListener('input', debounce(updateTreasuryFeeds, 250));
    if (sectionEl) sectionEl.addEventListener('change', updateTreasuryFeeds);
    if (statusEl) statusEl.addEventListener('change', updateTreasuryFeeds);
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
