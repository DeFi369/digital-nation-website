(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    loadCoverageFeed();
    loadStandardsFeed();
    loadProgramsFeed();
    initBandwidthFilters();
  }

  function loadCoverageFeed() {
    loadSection('bandwidth-coverage-feed', 'coverage', 'Connectivity coverage');
  }

  function loadStandardsFeed() {
    loadSection('bandwidth-standards-feed', 'standards', 'Access standards');
  }

  function loadProgramsFeed() {
    loadSection('bandwidth-programs-feed', 'programs', 'Deployment programs');
  }

  function loadSection(feedId, sectionKey, placeholderText) {
    const feed = document.getElementById(feedId);
    if (!feed) return;

    feed.innerHTML = '<div class="activity-loading" aria-hidden="true">Loading ' + escapeHtml(placeholderText || sectionKey) + '...</div>';
    fetch('assets/data/bandwidth.json')
      .then(function (response) {
        if (!response.ok) throw new Error('bandwidth data unavailable');
        return response.json();
      })
      .then(function (data) {
        var entries = (data.entries && data.entries[sectionKey]) || [];
        var items = Array.isArray(entries) ? entries.slice() : [];
        render(feed, items);
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">' + escapeHtml(placeholderText || sectionKey) + ' are temporarily unavailable.</div>';
      });
  }

  function render(container, items) {
    if (!items.length) {
      container.innerHTML = '<div class="activity-empty">No matching entries found.</div>';
      return;
    }

    container.innerHTML = items
      .map(function (item) {
        var statusClass = 'status-' + slugify(String(item.status || 'unknown'));
        var lead = item.lead || item.owner || '—';
        return (
          '<article class="activity-item bandwidth-item" role="article" aria-label="' + escapeHtml(String(item.id || item.title || '')) + '">' +
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

  function initBandwidthFilters() {
    var searchField = document.getElementById('bandwidth-search');
    var typeField = document.getElementById('bandwidth-type');
    var coverageFeed = document.getElementById('bandwidth-coverage-feed');
    var standardsFeed = document.getElementById('bandwidth-standards-feed');
    var programsFeed = document.getElementById('bandwidth-programs-feed');
    if (!searchField || !typeField || !coverageFeed || !standardsFeed || !programsFeed) return;

    var cachedData = null;
    fetch('assets/data/bandwidth.json')
      .then(function (res) {
        if (!res.ok) throw new Error('bandwidth unavailable');
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
        { feed: coverageFeed, sectionKey: 'coverage' },
        { feed: standardsFeed, sectionKey: 'standards' },
        { feed: programsFeed, sectionKey: 'programs' }
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
        render(item.feed, filtered);
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
