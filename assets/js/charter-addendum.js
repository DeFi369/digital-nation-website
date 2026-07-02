(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    renderFeed('addendum-proposed-feed', 'proposed', 'Proposed amendments are temporarily unavailable.');
    renderFeed('addendum-revision-feed', 'ratified', 'No ratified revisions on record.');
    initFilters();
  }

  function renderFeed(feedId, sectionKey, emptyMessage) {
    var feed = document.getElementById(feedId);
    if (!feed) return;

    feed.innerHTML = '<div class="activity-loading" aria-hidden="true">Loading ' + escapeHtml(sectionKey || 'entries') + '...</div>';
    fetch('assets/data/charter-addendum.json')
      .then(function (response) {
        if (!response.ok) throw new Error('charter addendum data unavailable');
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
                '<span class="activity-type">' + escapeHtml(String(item.category || 'Amendment')) + '</span>' +
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
    var searchField = document.getElementById('addendum-search');
    var statusField = document.getElementById('addendum-status');
    var categoryField = document.getElementById('addendum-category');
    var proposedFeed = document.getElementById('addendum-proposed-feed');
    var revisionFeed = document.getElementById('addendum-revision-feed');
    if (!searchField || !statusField || !categoryField || !proposedFeed || !revisionFeed) return;

    var cachedData = null;
    fetch('assets/data/charter-addendum.json')
      .then(function (res) {
        if (!res.ok) throw new Error('charter addendum unavailable');
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
      [{
        feed: proposedFeed,
        sectionKey: 'proposed'
      }, {
        feed: revisionFeed,
        sectionKey: 'ratified'
      }].forEach(function (item) {
        var entries = (cachedData.entries && cachedData.entries[item.sectionKey]) || [];
        var items = Array.isArray(entries) ? entries.slice() : [];
        var term = searchField.value.trim().toLowerCase();
        var status = statusField.value;
        var category = categoryField.value;
        var filtered = items.filter(function (entry) {
          var matchesTerm =
            !term ||
            String(entry.title || '').toLowerCase().includes(term) ||
            String(entry.id || '').toLowerCase().includes(term) ||
            String(entry.summary || '').toLowerCase().includes(term);
          var matchesStatus = status === 'all' || entry.status === status;
          var matchesCategory = category === 'all' || entry.category === category;
          return matchesTerm && matchesStatus && matchesCategory;
        });
        renderList(item.feed, filtered, 'No matching entries found.');
      });
    }

    searchField.addEventListener('input', function () {
      applyFilter();
    });
    statusField.addEventListener('change', function () {
      applyFilter();
    });
    categoryField.addEventListener('change', function () {
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
