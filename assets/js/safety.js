(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    loadFrameworksFeed();
    loadIncidentsFeed();
    loadProtocolsFeed();
  }

  function loadFrameworksFeed() {
    const feed = document.getElementById('safety-frameworks-feed');
    if (!feed) return;
    fetch('assets/data/safety.json')
      .then(function (response) {
        if (!response.ok) throw new Error('safety data unavailable');
        return response.json();
      })
      .then(function (data) {
        const items = getAllItems(data, 'frameworks');
        renderSection(feed, items, 'frameworks');
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Security frameworks are temporarily unavailable.</div>';
      });
  }

  function loadIncidentsFeed() {
    const feed = document.getElementById('safety-incidents-feed');
    if (!feed) return;
    fetch('assets/data/safety.json')
      .then(function (response) {
        if (!response.ok) throw new Error('safety data unavailable');
        return response.json();
      })
      .then(function (data) {
        const items = getAllItems(data, 'incidents');
        renderSection(feed, items, 'incidents');
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Security incidents are temporarily unavailable.</div>';
      });
  }

  function loadProtocolsFeed() {
    const feed = document.getElementById('safety-protocols-feed');
    if (!feed) return;
    fetch('assets/data/safety.json')
      .then(function (response) {
        if (!response.ok) throw new Error('safety data unavailable');
        return response.json();
      })
      .then(function (data) {
        const items = getAllItems(data, 'protocols');
        renderSection(feed, items, 'protocols');
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Security protocols are temporarily unavailable.</div>';
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
              '<span>' + escapeHtml(String(item.owner || item.lead || '—')) + '</span>' +
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
