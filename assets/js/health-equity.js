(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    renderEquityFeed('health-equity-frameworks-feed', 'frameworks', 'Equity frameworks');
    renderProgramsFeed('health-equity-programs-feed', 'programs', 'Access programs');
    renderStandardsFeed('health-equity-standards-feed', 'standards', 'Community health standards');
    initEquityFilters();
  }

  function renderEquityFeed(feedId, sectionKey, placeholderText) {
    renderSection(feedId, sectionKey, placeholderText || 'Frameworks');
  }

  function renderProgramsFeed(feedId, sectionKey, placeholderText) {
    renderSection(feedId, sectionKey, placeholderText || 'Programs');
  }

  function renderStandardsFeed(feedId, sectionKey, placeholderText) {
    renderSection(feedId, sectionKey, placeholderText || 'Standards');
  }

  function renderSection(feedId, sectionKey, placeholderText) {
    const feed = document.getElementById(feedId);
    if (!feed) return;

    feed.innerHTML = '<div class="activity-loading" aria-hidden="true">Loading ' + escapeHtml(placeholderText || sectionKey) + '...</div>';
    fetch('assets/data/health-equity.json')
      .then(function (response) {
        if (!response.ok) throw new Error('health-equity data unavailable');
        return response.json();
      })
      .then(function (data) {
        var entries = (data.entries && data.entries[sectionKey]) || [];
        var items = Array.isArray(entries) ? entries.slice() : [];
        renderFeed(feed, items);
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">' + escapeHtml(placeholderText || sectionKey) + ' are temporarily unavailable.</div>';
      });
  }

  function renderFeed(container, items) {
    if (!items.length) {
      container.innerHTML = '<div class="activity-empty">No matching entries found.</div>';
      return;
    }

    container.innerHTML = items
      .map(function (item) {
        var statusClass = 'status-' + slugify(String(item.status || 'unknown'));
        var lead = item.lead || item.owner || '—';
        return (
          '<article class="activity-item health-equity-item" role="article" aria-label="' + escapeHtml(String(item.id || item.title || '')) + '">' +
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

  function initEquityFilters() {
    var searchField = document.getElementById('health-equity-search');
    var typeField = document.getElementById('health-equity-type');
    var frameworkFeed = document.getElementById('health-equity-frameworks-feed');
    var programsFeed = document.getElementById('health-equity-programs-feed');
    var standardsFeed = document.getElementById('health-equity-standards-feed');
    if (!searchField || !typeField || !frameworkFeed || !programsFeed || !standardsFeed) return;

    function refreshAll() {
      renderEquityFeed('health-equity-frameworks-feed', 'frameworks', 'Equity frameworks');
      renderProgramsFeed('health-equity-programs-feed', 'programs', 'Access programs');
      renderStandardsFeed('health-equity-standards-feed', 'standards', 'Community health standards');
      applyTypeFilter();
    }

    var cachedData = [];
    Promise.resolve(fetch('assets/data/health-equity.json')
      .then(function (res) {
        if (!res.ok) throw new Error('health-equity unavailable');
        return res.json();
      })
      .then(function (data) {
        cachedData = data;
      })
      .catch(function () {
        cachedData = null;
      }));

    function applyTypeFilter() {
      [
        { feed: frameworkFeed, sectionKey: 'frameworks' },
        { feed: programsFeed, sectionKey: 'programs' },
        { feed: standardsFeed, sectionKey: 'standards' }
      ].forEach(function (item) {
        if (!cachedData) return;
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
        renderFeed(item.feed, filtered);
      });
    }

    searchField.addEventListener('input', function () {
      applyTypeFilter();
    });
    typeField.addEventListener('change', function () {
      applyTypeFilter();
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
