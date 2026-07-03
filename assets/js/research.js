(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    renderFeed('res-initiatives-feed', 'initiatives', 'Research initiatives are temporarily unavailable.');
    renderFeed('res-policy-feed', 'policy', 'Innovation policy items are temporarily unavailable.');
    renderFeed('res-standards-feed', 'standards', 'Technology standards are temporarily unavailable.');
    loadStats();
    loadPillars();
    initFilters();
  }

  function renderFeed(feedId, sectionKey, emptyMessage) {
    var feed = document.getElementById(feedId);
    if (!feed) return;

    feed.innerHTML = '<div class="activity-loading" aria-hidden="true">Loading ' + escapeHtml(sectionKey || 'entries') + '...</div>';
    fetch('assets/data/research.json')
      .then(function (response) {
        if (!response.ok) throw new Error('research data unavailable');
        return response.json();
      })
      .then(function (data) {
        var items = getSection(data, sectionKey);
        renderList(feed, items, emptyMessage);
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">' + escapeHtml(emptyMessage || 'Entries are temporarily unavailable.') + '</div>';
      });
  }

  function getSection(data, sectionKey) {
    if (!data || !data.entries) return [];
    var entries = data.entries[sectionKey];
    return Array.isArray(entries) ? entries.slice() : [];
  }

  function renderList(container, items, emptyMessage) {
    if (!items.length) {
      container.innerHTML = '<div class="activity-empty">' + escapeHtml(emptyMessage || 'No matching entries found.') + '</div>';
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
                '<span class="activity-type">' + escapeHtml(String(item.category || 'Research')) + '</span>' +
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

  function loadPillars() {
    var container = document.getElementById('research-pillars');
    if (!container) return;
    fetch('assets/data/research.json')
      .then(function (response) {
        if (!response.ok) throw new Error('research data unavailable');
        return response.json();
      })
      .then(function (data) {
        if (!Array.isArray(data.pillars) || !data.pillars.length) {
          container.innerHTML = '<div class="activity-empty">No strategic pillars are currently defined.</div>';
          return;
        }
        var rows = data.pillars.map(function (pillar) {
          return '<article class="pillar-card" aria-label="' + escapeHtml(String(pillar.title || pillar.id || '')) + '">' +
            '<h3>' + escapeHtml(String(pillar.title || 'Untitled')) + '</h3>' +
            '<p>' + escapeHtml(String(pillar.summary || '')) + '</p>' +
          '</article>';
        }).join('');
        container.innerHTML = '<div class="pillars-grid">' + rows + '</div>';
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Strategic pillars are temporarily unavailable.</div>';
      });
  }

  function initFilters() {
    var searchField = document.getElementById('research-search');
    var typeField = document.getElementById('research-type');
    var initiativesFeed = document.getElementById('res-initiatives-feed');
    var policyFeed = document.getElementById('res-policy-feed');
    var standardsFeed = document.getElementById('res-standards-feed');
    if (!searchField || !typeField || !initiativesFeed || !policyFeed || !standardsFeed) return;

    var cachedData = null;
    fetch('assets/data/research.json')
      .then(function (res) {
        if (!res.ok) throw new Error('research unavailable');
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
        { feed: initiativesFeed, sectionKey: 'initiatives' },
        { feed: policyFeed, sectionKey: 'policy' },
        { feed: standardsFeed, sectionKey: 'standards' }
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
        renderList(item.feed, filtered, 'No matching entries found.');
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
