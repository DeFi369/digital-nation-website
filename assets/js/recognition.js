(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const feed = document.getElementById('recognition-feed');
    const filterField = document.getElementById('recognition-filter');

    if (!feed) return;

    let recognitionItems = [];

    fetch('assets/data/recognition.json')
      .then(function (response) {
        if (!response.ok) throw new Error('recognition data unavailable');
        return response.json();
      })
      .then(function (data) {
        recognitionItems = Array.isArray(data.entries) ? data.entries.slice() : [];
        render(recognitionItems);
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Recognition directory is temporarily unavailable.</div>';
      });

    if (filterField) {
      filterField.addEventListener('input', function () {
        render(recognitionItems);
      });
    }

    function render(items) {
      const keyword = filterField ? String(filterField.value || '').trim().toLowerCase() : '';
      const filtered = items.filter(function (entry) {
        const matchesKeyword =
          !keyword ||
          String(entry.title || '').toLowerCase().indexOf(keyword) !== -1 ||
          String(entry.criteria || '').toLowerCase().indexOf(keyword) !== -1 ||
          String(entry.status || '').toLowerCase().indexOf(keyword) !== -1 ||
          String(entry.id || '').toLowerCase().indexOf(keyword) !== -1;
        return matchesKeyword;
      });

      if (!filtered.length) {
        const msg = keyword
          ? 'No recognition entries match "' + escapeHtml(keyword) + '".'
          : 'No recognition entries recorded.';
        feed.innerHTML = '<div class="activity-empty">' + msg + '</div>';
        return;
      }

      feed.innerHTML = '<div class="activity-feed-inner">' + filtered
        .map(function (entry) {
          const statusClass = 'status-' + slugify(String(entry.status || 'unknown'));
          return (
            '<article class="activity-item recognition-item" role="article" aria-label="' + escapeHtml(String(entry.title || entry.id || '')) + '">' +
              '<div class="activity-content">' +
                '<h3 class="activity-title">' + escapeHtml(String(entry.title || 'Untitled')) + '</h3>' +
                '<p class="activity-description">' + escapeHtml(String(entry.summary || '')) + '</p>' +
                '<div class="activity-meta">' +
                  '<span class="activity-type">' + escapeHtml(String(entry.criteria || 'Recognition')) + '</span>' +
                  '<span class="activity-divider">·</span>' +
                  '<span>' + escapeHtml(String(entry.id || '')) + '</span>' +
                  '<span class="activity-divider">·</span>' +
                  '<span>Since ' + escapeHtml(String(entry.effectiveDate || '—')) + '</span>' +
                  (entry.renewable ? '<span class="activity-divider">·</span><span>Renewable</span>' : '') +
                '</div>' +
                (Array.isArray(entry.evidence) && entry.evidence.length
                  ? '<ul class="activity-tags">' + entry.evidence.map(function (ev) {
                      return '<li>' + escapeHtml(ev) + '</li>';
                    }).join('') + '</ul>'
                  : '') +
              '</div>' +
              '<div class="activity-sidebar">' +
                '<span class="activity-status ' + statusClass + '">' + escapeHtml(String(entry.status || '')) + '</span>' +
              '</div>' +
            '</article>'
          );
        })
        .join('') + '</div>';
    }
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
