(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    loadServicesFeed();
    loadWellnessFeed();
  }

  function loadServicesFeed() {
    const feed = document.getElementById('health-services-feed');
    if (!feed) return;
    fetch('assets/data/health.json')
      .then(function (response) {
        if (!response.ok) throw new Error('health data unavailable');
        return response.json();
      })
      .then(function (data) {
        const items = getAllItems(data, 'services');
        renderSection(feed, items, 'services');
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Health services are temporarily unavailable.</div>';
      });
  }

  function loadWellnessFeed() {
    const feed = document.getElementById('health-wellness-feed');
    if (!feed) return;
    fetch('assets/data/health.json')
      .then(function (response) {
        if (!response.ok) throw new Error('health data unavailable');
        return response.json();
      })
      .then(function (data) {
        const items = getAllItems(data, 'wellness');
        renderSection(feed, items, 'wellness');
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Wellness programs are temporarily unavailable.</div>';
      });
  }

  function getAllItems(data, section) {
    const entries = data.entries && data.entries[section];
    return Array.isArray(entries) ? entries.slice() : [];
  }

  function renderSection(container, items, sectionKey) {
    if (!items.length) {
      container.innerHTML = '<div class="activity-empty">No ' + escapeHtml(sectionKey) + ' found.</div>';
      return;
    }

    const html = items.map(function (item) {
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
              '<span>' + escapeHtml(String(item.lead || item.owner || '—')) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="activity-sidebar">' +
            '<span class="activity-status ' + statusClass + '">' + escapeHtml(String(item.status || '')) + '</span>' +
          '</div>' +
        '</article>'
      );
    }).join('');
    container.innerHTML = html;
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
