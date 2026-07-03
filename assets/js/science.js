(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    loadResearchFeed();
    loadPolicyFeed();
    loadStandardsFeed();
    loadStats();
    loadPillars();
  }

  function loadResearchFeed() {
    const feed = document.getElementById('science-research-feed');
    if (!feed) return;
    fetch('assets/data/science.json')
      .then(function (response) {
        if (!response.ok) throw new Error('science data unavailable');
        return response.json();
      })
      .then(function (data) {
        const items = Array.isArray(data.entries?.research) ? data.entries.research.slice() : [];
        renderList(feed, items, 'Research initiatives are temporarily unavailable.');
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Research initiatives are temporarily unavailable.</div>';
      });
  }

  function loadPolicyFeed() {
    const feed = document.getElementById('science-policy-feed');
    if (!feed) return;
    fetch('assets/data/science.json')
      .then(function (response) {
        if (!response.ok) throw new Error('science data unavailable');
        return response.json();
      })
      .then(function (data) {
        const items = Array.isArray(data.entries?.policy) ? data.entries.policy.slice() : [];
        renderList(feed, items, 'Innovation policy items are temporarily unavailable.');
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Innovation policy items are temporarily unavailable.</div>';
      });
  }

  function loadStandardsFeed() {
    const feed = document.getElementById('science-standards-feed');
    if (!feed) return;
    fetch('assets/data/science.json')
      .then(function (response) {
        if (!response.ok) throw new Error('science data unavailable');
        return response.json();
      })
      .then(function (data) {
        const items = Array.isArray(data.entries?.standards) ? data.entries.standards.slice() : [];
        renderList(feed, items, 'Technology standards are temporarily unavailable.');
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Technology standards are temporarily unavailable.</div>';
      });
  }

  function loadStats() {
    var container = document.getElementById('science-stats');
    if (!container) return;
    fetch('assets/data/science.json')
      .then(function (response) {
        if (!response.ok) throw new Error('science data unavailable');
        return response.json();
      })
      .then(function (data) {
        if (!data.stats) {
          container.innerHTML = '<div class="activity-empty">Science metrics are temporarily unavailable.</div>';
          return;
        }
        var rows = Object.keys(data.stats).map(function (key) {
          return '<div class="stat-card">' +
            '<div class="stat-value">' + escapeHtml(String(data.stats[key])) + '</div>' +
            '<div class="stat-label">' + escapeHtml(key) + '</div>' +
          '</div>';
        }).join('');
        container.innerHTML = '<div class="stats-grid">' + rows + '</div>';
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Science metrics are temporarily unavailable.</div>';
      });
  }

  function loadPillars() {
    var container = document.getElementById('science-pillars');
    if (!container) return;
    fetch('assets/data/science.json')
      .then(function (response) {
        if (!response.ok) throw new Error('science data unavailable');
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

  function renderList(container, items, emptyMessage) {
    if (!items.length) {
      container.innerHTML = '<div class="activity-empty">' + escapeHtml(emptyMessage || 'No matching entries found.') + '</div>';
      return;
    }

    container.innerHTML = items
      .map(function (item) {
        const statusClass = 'status-' + slugify(String(item.status || 'unknown'));
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
                '<span>' + escapeHtml(String(item.lead || item.owner || '—')) + '</span>' +
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
