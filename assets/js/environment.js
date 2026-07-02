(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    loadEnvironmentFeeds();
    setupFilters();
  }

  function loadEnvironmentFeeds() {
    loadFeed('environment-policy-feed', 'assets/data/environment.json', 'entries.policy', 'Environmental policy is temporarily unavailable.');
    loadFeed('environment-program-feed', 'assets/data/environment.json', 'entries.programs', 'Sustainability programs are temporarily unavailable.');
    loadFeed('environment-standards-feed', 'assets/data/environment.json', 'entries.standards', 'Green protocol standards are temporarily unavailable.');
  }

  function loadFeed(containerId, dataUrl, path, emptyMessage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(dataUrl)
      .then(function (response) {
        if (!response.ok) throw new Error('environment data unavailable');
        return response.json();
      })
      .then(function (data) {
        const items = getNestedArray(data, path);
        renderList(container, items, emptyMessage, path);
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">' + escapeHtml(emptyMessage || 'Feed is temporarily unavailable.') + '</div>';
      });
  }

  function getNestedArray(data, path) {
    const parts = String(path).split('.');
    let current = data;
    for (let i = 0; i < parts.length; i++) {
      if (current == null) return [];
      current = current[parts[i]];
    }
    return Array.isArray(current) ? current.slice() : [];
  }

  function setupFilters() {
    const searchField = document.getElementById('environment-search');
    const categoryField = document.getElementById('environment-category');
    const statusField = document.getElementById('environment-status');

    if (!searchField && !categoryField && !statusField) return;

    const policyFeed = document.getElementById('environment-policy-feed');
    const programFeed = document.getElementById('environment-program-feed');
    const standardsFeed = document.getElementById('environment-standards-feed');

    let policyItems = [];
    let programItems = [];
    let standardsItems = [];

    function refreshAllItems() {
      const container = policyFeed || programFeed || standardsFeed;
      fetch('assets/data/environment.json')
        .then(function (response) {
          if (!response.ok) throw new Error('environment data unavailable');
          return response.json();
        })
        .then(function (data) {
          policyItems = getNestedArray(data, 'entries.policy');
          programItems = getNestedArray(data, 'entries.programs');
          standardsItems = getNestedArray(data, 'entries.standards');
          renderAll();
        })
        .catch(function () {});
    }

    function renderAll() {
      renderList(policyFeed, filterItems(policyItems), 'No matching policy entries found.', 'entries.policy');
      renderList(programFeed, filterItems(programItems), 'No matching program entries found.', 'entries.programs');
      renderList(standardsFeed, filterItems(standardsItems), 'No matching standards entries found.', 'entries.standards');
    }

    function filterItems(items) {
      const term = searchField ? searchField.value.trim().toLowerCase() : '';
      const category = categoryField ? categoryField.value : 'all';
      const status = statusField ? statusField.value : 'all';

      return items.filter(function (entry) {
        const matchesTerm =
          !term ||
          String(entry.title || '').toLowerCase().includes(term) ||
          String(entry.id || '').toLowerCase().includes(term) ||
          String(entry.owner || entry.lead || '').toLowerCase().includes(term);
        const matchesCategory = category === 'all' || entry.category === category;
        const matchesStatus = status === 'all' || entry.status === status;
        return matchesTerm && matchesCategory && matchesStatus;
      });
    }

    if (searchField) {
      searchField.addEventListener('input', function () {
        renderAll();
      });
    }
    if (categoryField) {
      categoryField.addEventListener('change', function () {
        renderAll();
      });
    }
    if (statusField) {
      statusField.addEventListener('change', function () {
        renderAll();
      });
    }

    refreshAllItems();
  }

  function renderList(container, items, emptyMessage, path) {
    if (!container) return;
    if (!items.length) {
      container.innerHTML = '<div class="activity-empty">' + escapeHtml(emptyMessage || 'No matches found.') + '</div>';
      return;
    }

    container.innerHTML = items
      .map(function (item) {
        const statusClass = 'status-' + slugify(String(item.status || 'unknown'));
        const categoryClass = 'category-' + slugify(String(item.category || 'general'));
        return (
          '<article class="activity-item" role="article" aria-label="' + escapeHtml(String(item.title || item.id || '')) + '">' +
            '<div class="activity-content">' +
              '<h3 class="activity-title">' + escapeHtml(String(item.title || 'Untitled')) + '</h3>' +
              '<p class="activity-description">' + escapeHtml(String(item.summary || '')) + '</p>' +
              '<div class="activity-meta">' +
                '<span class="activity-type ' + categoryClass + '">' + escapeHtml(String(item.category || 'Program')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span>' + escapeHtml(String(item.id || '')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span>' + escapeHtml(String(item.owner || item.lead || '—')) + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="activity-sidebar">' +
              '<span class="activity-status ' + statusClass + '">' + escapeHtml(String(item.status || '')) + '</span>' +
            '</div>' +
          '</article>'
        );
      })
      .join('');
  }

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
})();
