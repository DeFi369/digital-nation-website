(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const feed = document.getElementById('culture-feed');
    const searchField = document.getElementById('culture-search');
    const themeField = document.getElementById('culture-theme');
    const statusField = document.getElementById('culture-status');

    if (!feed || !searchField || !themeField || !statusField) return;

    let cultureItems = [];

    fetch('assets/data/culture.json')
      .then(function (response) {
        if (!response.ok) throw new Error('culture data unavailable');
        return response.json();
      })
      .then(function (data) {
        cultureItems = Array.isArray(data.entries) ? data.entries.slice() : [];
        render(cultureItems);
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Culture directory is temporarily unavailable.</div>';
      });

    function render(items) {
      const term = searchField.value.trim().toLowerCase();
      const theme = themeField.value;
      const status = statusField.value;

      const filtered = items.filter(function (entry) {
        const matchesTerm =
          !term ||
          String(entry.title || '').toLowerCase().indexOf(term) !== -1 ||
          String(entry.owner || '').toLowerCase().indexOf(term) !== -1 ||
          String(entry.summary || '').toLowerCase().indexOf(term) !== -1 ||
          String(entry.id || '').toLowerCase().indexOf(term) !== -1;
        const matchesTheme = theme === 'all' || entry.theme === theme;
        const matchesStatus = status === 'all' || entry.status === status;
        return matchesTerm && matchesTheme && matchesStatus;
      });

      if (!filtered.length) {
        feed.innerHTML = '<div class="activity-empty">No matching culture entries found.</div>';
        return;
      }

      feed.innerHTML = '<div class="activity-feed-inner">' + filtered
        .map(function (entry) {
          return (
            '<article class="activity-item culture-item" role="article" aria-label="' + escapeHtml(String(entry.id || entry.title || '')) + '">' +
              '<div class="activity-content">' +
                '<h3 class="activity-title">' + escapeHtml(String(entry.title || 'Untitled')) + '</h3>' +
                '<p class="activity-description">' + escapeHtml(String(entry.summary || '')) + '</p>' +
                '<div class="activity-meta">' +
                  '<span class="activity-type">' + escapeHtml(String(entry.theme || 'Program')) + '</span>' +
                  '<span class="activity-divider">·</span>' +
                  '<span>' + escapeHtml(String(entry.id || '')) + '</span>' +
                  '<span class="activity-divider">·</span>' +
                  '<span>' + escapeHtml(String(entry.owner || '—')) + '</span>' +
                '</div>' +
                '<div class="activity-meta">' +
                  '<span class="culture-badge culture-status-' + slugify(String(entry.status || 'unknown')) + '">' + escapeHtml(String(entry.status || '')) + '</span>' +
                '</div>' +
              '</div>' +
            '</article>'
          );
        })
        .join('') + '</div>';
    }

    searchField.addEventListener('input', function () {
      render(cultureItems);
    });
    themeField.addEventListener('change', function () {
      render(cultureItems);
    });
    statusField.addEventListener('change', function () {
      render(cultureItems);
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
