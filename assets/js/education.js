(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    loadResearchFeed();
    loadLiteracyFeed();
    loadProgramsFeed();
  }

  function loadResearchFeed() {
    const feed = document.getElementById('education-research-feed');
    if (!feed) return;
    fetch('assets/data/education.json')
      .then(function (response) {
        if (!response.ok) throw new Error('education data unavailable');
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

  function loadLiteracyFeed() {
    const feed = document.getElementById('education-literacy-feed');
    if (!feed) return;
    fetch('assets/data/education.json')
      .then(function (response) {
        if (!response.ok) throw new Error('education data unavailable');
        return response.json();
      })
      .then(function (data) {
        const items = Array.isArray(data.entries?.literacy) ? data.entries.literacy.slice() : [];
        renderList(feed, items, 'Digital literacy programs are temporarily unavailable.');
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Digital literacy programs are temporarily unavailable.</div>';
      });
  }

  function loadProgramsFeed() {
    const feed = document.getElementById('education-programs-feed');
    if (!feed) return;
    fetch('assets/data/education.json')
      .then(function (response) {
        if (!response.ok) throw new Error('education data unavailable');
        return response.json();
      })
      .then(function (data) {
        const items = Array.isArray(data.entries?.programs) ? data.entries.programs.slice() : [];
        renderList(feed, items, 'Programs are temporarily unavailable.');
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Programs are temporarily unavailable.</div>';
      });
  }

  function renderList(container, items, emptyMessage) {
    if (!items.length) {
      container.innerHTML = '<div class="activity-empty">' + escapeHtml(emptyMessage || 'No matches found.') + '</div>';
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
