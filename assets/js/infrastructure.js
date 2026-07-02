(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initInfrastructureFeed();
  }

  function initInfrastructureFeed() {
    loadSection('infrastructure-services-feed', 'services', 'Infrastructure services');
    loadSection('infrastructure-civic-tech-feed', 'civicTech', 'Civic technology');
    loadSection('infrastructure-projects-feed', 'projects', 'Projects');
  }

  function loadSection(feedId, sectionKey, placeholderText) {
    const feed = document.getElementById(feedId);
    if (!feed) return;

    feed.innerHTML = '<div class="activity-loading" aria-hidden="true">Loading ' + escapeHtml(placeholderText || sectionKey) + '...</div>';

    fetch('assets/data/infrastructure.json')
      .then(function (response) {
        if (!response.ok) throw new Error('infrastructure data unavailable');
        return response.json();
      })
      .then(function (data) {
        const entries = data.entries && data.entries[sectionKey];
        const items = Array.isArray(entries) ? entries.slice() : [];
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
        const statusClass = 'status-' + slugify(String(item.status || 'unknown'));
        return (
          '<article class="activity-item" role="article" aria-label="' + escapeHtml(String(item.title || item.id || '')) + '">' +
            '<div class="activity-content">' +
              '<h3 class="activity-title">' + escapeHtml(String(item.title || 'Untitled')) + '</h3>' +
              '<p class="activity-description">' + escapeHtml(String(item.summary || '')) + '</p>' +
              '<div class="activity-meta">' +
                '<span class="activity-type">' + escapeHtml(String(item.category || 'Program')) + '</span>' +
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
