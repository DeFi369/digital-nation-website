(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const feed = document.getElementById('communications-feed');
    const searchField = document.getElementById('communications-search');
    const channelField = document.getElementById('communications-channel');
    const statusField = document.getElementById('communications-status');

    if (!feed || !searchField || !channelField || !statusField) return;

    let communicationsItems = [];

    fetch('assets/data/communications.json')
      .then(function (response) {
        if (!response.ok) throw new Error('communications data unavailable');
        return response.json();
      })
      .then(function (data) {
        communicationsItems = Array.isArray(data.entries) ? data.entries.slice() : [];
        render(communicationsItems);
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Communications directory is temporarily unavailable.</div>';
      });

    function render(items) {
      const term = searchField.value.trim().toLowerCase();
      const channel = channelField.value;
      const status = statusField.value;

      const filtered = items.filter(function (entry) {
        const matchesTerm =
          !term ||
          String(entry.title || '').toLowerCase().indexOf(term) !== -1 ||
          String(entry.owner || '').toLowerCase().indexOf(term) !== -1 ||
          String(entry.summary || '').toLowerCase().indexOf(term) !== -1 ||
          String(entry.id || '').toLowerCase().indexOf(term) !== -1;
        const matchesChannel = channel === 'all' || entry.channel === channel;
        const matchesStatus = status === 'all' || entry.status === status;
        return matchesTerm && matchesChannel && matchesStatus;
      });

      if (!filtered.length) {
        feed.innerHTML = '<div class="activity-empty">No matching communications entries found.</div>';
        return;
      }

      feed.innerHTML = '<div class="activity-feed-inner">' + filtered
        .map(function (entry) {
          return (
            '<article class="activity-item communications-item" role="article" aria-label="' + escapeHtml(String(entry.id || entry.title || '')) + '">' +
              '<div class="activity-content">' +
                '<h3 class="activity-title">' + escapeHtml(String(entry.title || 'Untitled')) + '</h3>' +
                '<p class="activity-description">' + escapeHtml(String(entry.summary || '')) + '</p>' +
                '<div class="activity-meta">' +
                  '<span class="activity-type">' + escapeHtml(String(entry.channel || 'Public Affairs')) + '</span>' +
                  '<span class="activity-divider">·</span>' +
                  '<span>' + escapeHtml(String(entry.id || '')) + '</span>' +
                  '<span class="activity-divider">·</span>' +
                  '<span>' + escapeHtml(String(entry.owner || '—')) + '</span>' +
                '</div>' +
                '<div class="activity-meta">' +
                  '<span class="communications-badge communications-status-' + slugify(String(entry.status || 'unknown')) + '">' + escapeHtml(String(entry.status || '')) + '</span>' +
                '</div>' +
              '</div>' +
            '</article>'
          );
        })
        .join('') + '</div>';
    }

    searchField.addEventListener('input', function () {
      render(communicationsItems);
    });
    channelField.addEventListener('change', function () {
      render(communicationsItems);
    });
    statusField.addEventListener('change', function () {
      render(communicationsItems);
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
