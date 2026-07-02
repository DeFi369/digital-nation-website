(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    loadSustainabilityFeeds();
    setupFilters();
  }

  function loadSustainabilityFeeds() {
    loadFeed('sustainability-operations-feed', 'assets/data/sustainability.json', 'entries.operations', 'Operational sustainability data is temporarily unavailable.');
    loadFeed('sustainability-impact-feed', 'assets/data/sustainability.json', 'entries.impact', 'Impact reporting is temporarily unavailable.');
    loadFeed('sustainability-infrastructure-feed', 'assets/data/sustainability.json', 'entries.greenInfrastructure', 'Green infrastructure projects are temporarily unavailable.');
  }

  function loadFeed(containerId, dataUrl, path, emptyMessage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(dataUrl)
      .then(function (response) {
        if (!response.ok) throw new Error('sustainability data unavailable');
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
    const searchField = document.getElementById('sustainability-search');
    const categoryField = document.getElementById('sustainability-category');
    const statusField = document.getElementById('sustainability-status');

    if (!searchField && !categoryField && !statusField) return;

    const operationsFeed = document.getElementById('sustainability-operations-feed');
    const impactFeed = document.getElementById('sustainability-impact-feed');
    const infrastructureFeed = document.getElementById('sustainability-infrastructure-feed');

    let operationsItems = [];
    let impactItems = [];
    let infrastructureItems = [];

    function refreshAllItems() {
      const container = operationsFeed || impactFeed || infrastructureFeed;
      fetch('assets/data/sustainability.json')
        .then(function (response) {
          if (!response.ok) throw new Error('sustainability data unavailable');
          return response.json();
        })
        .then(function (data) {
          operationsItems = getNestedArray(data, 'entries.operations');
          impactItems = getNestedArray(data, 'entries.impact');
          infrastructureItems = getNestedArray(data, 'entries.greenInfrastructure');
          renderAll();
        })
        .catch(function () {});
    }

    function renderAll() {
      renderList(operationsFeed, filterItems(operationsItems), 'No matching operations entries found.', 'entries.operations');
      renderList(impactFeed, filterItems(impactItems), 'No matching impact entries found.', 'entries.impact');
      renderList(infrastructureFeed, filterItems(infrastructureItems), 'No matching infrastructure entries found.', 'entries.greenInfrastructure');
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
