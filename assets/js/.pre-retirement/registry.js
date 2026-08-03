(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    renderStats();
    renderPillars();
    renderRegistryFeed();
    bindFilters();
  }

  /* ---- stats ---- */
  function renderStats() {
    var container = document.getElementById('registry-stats');
    if (!container) return;
    fetch('assets/data/registry.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var stats = data.stats || {};
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
        container.innerHTML = '<div class="activity-empty">Registry summary is temporarily unavailable.</div>';
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
    var container = document.getElementById('registry-pillars');
    if (!container) return;
    fetch('assets/data/registry.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var items = Array.isArray(data.pillars) ? data.pillars.slice() : [];
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

  /* ---- registry feed ---- */
  function renderRegistryFeed() {
    var feed = document.getElementById('registry-feed');
    if (!feed) return;
    var searchField = document.getElementById('registry-search');
    var tierField = document.getElementById('registry-tier');
    var statusField = document.getElementById('registry-status');

    loadData();

    function loadData() {
      fetch('assets/data/registry.json')
        .then(function (response) {
          if (!response.ok) throw new Error('registry data unavailable');
          return response.json();
        })
        .then(function (data) {
          var items = Array.isArray(data.entries) ? data.entries.slice() : [];
          renderFiltered(items);
        })
        .catch(function () {
          feed.innerHTML = '<div class="activity-empty">Registry is temporarily unavailable.</div>';
        });
    }

    function renderFiltered(items) {
      var term = (searchField && searchField.value || '').trim().toLowerCase();
      var tier = tierField ? tierField.value : 'all';
      var status = statusField ? statusField.value : 'all';

      var filtered = items.filter(function (entry) {
        var matchesTerm =
          !term ||
          String(entry.name || '').toLowerCase().indexOf(term) !== -1 ||
          String(entry.id || '').toLowerCase().indexOf(term) !== -1 ||
          String(entry.region || '').toLowerCase().indexOf(term) !== -1 ||
          String(entry.note || '').toLowerCase().indexOf(term) !== -1;
        var matchesTier = tier === 'all' || entry.tier === tier;
        var matchesStatus = status === 'all' || entry.status === status;
        return matchesTerm && matchesTier && matchesStatus;
      });

      if (!filtered.length) {
        feed.innerHTML = '<div class="activity-empty">No matching registry entries found.</div>';
        return;
      }

      feed.innerHTML = filtered.map(function (entry) {
        var statusClass = 'status-' + slugify(String(entry.status || 'unknown'));
        return '<article class="activity-item registry-item" role="article" aria-label="' + escapeHtml(String(entry.id || '')) + '">' +
          '<div class="activity-content">' +
            '<h3 class="activity-title">' + escapeHtml(String(entry.name || 'Unnamed')) + '</h3>' +
            '<p class="activity-description">' + escapeHtml(String(entry.note || '')) + '</p>' +
            '<div class="activity-meta">' +
              '<span class="activity-type">' + escapeHtml(String(entry.tier || '—')) + '</span>' +
              '<span class="activity-divider">·</span>' +
              '<span>' + escapeHtml(String(entry.id || '')) + '</span>' +
              '<span class="activity-divider">·</span>' +
              '<span>' + escapeHtml(String(entry.region || 'Unknown region')) + '</span>' +
            '</div>' +
            '<div class="activity-meta">Verified ' + escapeHtml(String(entry.verified || '—')) + (entry.lastActive ? ' · Last active ' + escapeHtml(String(entry.lastActive || '—')) : '') + '</div>' +
          '</div>' +
          '<div class="activity-sidebar">' +
            '<span class="activity-status ' + statusClass + '">' + escapeHtml(String(entry.status || '—')) + '</span>' +
          '</div>' +
        '</article>';
      }).join('');
    }

    if (searchField) {
      searchField.addEventListener('input', loadData);
    }
    if (tierField) {
      tierField.addEventListener('change', loadData);
    }
    if (statusField) {
      statusField.addEventListener('change', loadData);
    }
  }

  function bindFilters() {
    var searchField = document.getElementById('registry-search');
    var tierField = document.getElementById('registry-tier');
    var statusField = document.getElementById('registry-status');
    if (!searchField || !tierField || !statusField) return;
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
