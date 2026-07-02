(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    loadTechnologyFeed('emerging-quantum-feed', 'quantum', 'Quantum programs');
    loadTechnologyFeed('emerging-biotech-feed', 'biotechnology', 'Biotechnology programs');
    loadTechnologyFeed('emerging-autonomous-feed', 'autonomous', 'Autonomous systems programs');
    initFilters();
  }

  function loadTechnologyFeed(feedId, sectionKey, placeholderText) {
    var feed = document.getElementById(feedId);
    if (!feed) return;

    feed.innerHTML = '<div class="activity-loading" aria-hidden="true">Loading ' + escapeHtml(placeholderText || sectionKey) + '...</div>';
    fetch('assets/data/emerging-tech.json')
      .then(function (response) {
        if (!response.ok) throw new Error('emerging tech data unavailable');
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

  function renderList(container, items) {
    if (!items.length) {
      container.innerHTML = '<div class="activity-empty">No matching entries found.</div>';
      return;
    }

    container.innerHTML = items
      .map(function (item) {
        var statusClass = 'status-' + slugify(String(item.status || 'unknown'));
        var lead = item.lead || item.owner || '—';
        return (
          '<article class="activity-item" role="article" aria-label="' + escapeHtml(String(item.id || item.title || '')) + '">' +
            '<div class="activity-content">' +
              '<h3 class="activity-title">' + escapeHtml(String(item.title || 'Untitled')) + '</h3>' +
              '<p class="activity-description">' + escapeHtml(String(item.summary || '')) + '</p>' +
              '<div class="activity-meta">' +
                '<span class="activity-type">' + escapeHtml(String(item.category || 'Program')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span>' + escapeHtml(String(item.id || '')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span>' + escapeHtml(String(lead)) + '</span>' +
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

  function initFilters() {
    var searchField = document.getElementById('emerging-tech-search');
    var typeField = document.getElementById('emerging-tech-type');
    var quantumFeed = document.getElementById('emerging-quantum-feed');
    var biotechFeed = document.getElementById('emerging-biotech-feed');
    var autonomousFeed = document.getElementById('emerging-autonomous-feed');
    if (!searchField || !typeField || !quantumFeed || !biotechFeed || !autonomousFeed) return;

    var cachedData = null;
    fetch('assets/data/emerging-tech.json')
      .then(function (res) {
        if (!res.ok) throw new Error('emerging tech unavailable');
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
      [
        { feed: quantumFeed, sectionKey: 'quantum' },
        { feed: biotechFeed, sectionKey: 'biotechnology' },
        { feed: autonomousFeed, sectionKey: 'autonomous' }
      ].forEach(function (item) {
        var entries = (cachedData.entries && cachedData.entries[item.sectionKey]) || [];
        var items = Array.isArray(entries) ? entries.slice() : [];
        var term = searchField.value.trim().toLowerCase();
        var type = typeField.value;
        var filtered = items.filter(function (entry) {
          var matchesTerm =
            !term ||
            String(entry.title || '').toLowerCase().includes(term) ||
            String(entry.id || '').toLowerCase().includes(term) ||
            String(entry.summary || '').toLowerCase().includes(term);
          var matchesType = type === 'all' || entry.category === type;
          return matchesTerm && matchesType;
        });
        renderList(item.feed, filtered);
      });
    }

    searchField.addEventListener('input', function () {
      applyFilter();
    });
    typeField.addEventListener('change', function () {
      applyFilter();
    });
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
