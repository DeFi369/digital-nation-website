(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    try {
      const feed = document.getElementById('treasury-feed');
      const searchField = document.getElementById('treasury-search');

      if (!feed || !searchField) return;

      let treasuryItems = [];

      fetch('assets/data/treasury.json')
        .then(function (response) {
          if (!response.ok) throw new Error('treasury data unavailable');
          return response.json();
        })
        .then(function (data) {
          treasuryItems = Array.isArray(data.entries) ? data.entries.slice() : [];
          render(treasuryItems);
        })
        .catch(function () {
          feed.innerHTML = '<div class="activity-empty">Treasury data is temporarily unavailable.</div>';
        });

      function render(items) {
        const term = searchField.value.trim().toLowerCase();

        const filtered = items.filter(function (entry) {
          const matchesTerm =
            !term ||
            String(entry.name || '').toLowerCase().includes(term) ||
            String(entry.category || '').toLowerCase().includes(term) ||
            String(entry.status || '').toLowerCase().includes(term) ||
            String(entry.id || '').toLowerCase().includes(term);
          return matchesTerm;
        });

        if (!filtered.length) {
          feed.innerHTML = '<div class="activity-empty">No matching treasury instruments found.</div>';
          return;
        }

        feed.innerHTML = filtered
          .map(function (entry) {
            return (
              '<article class="activity-item treasury-item" role="article" aria-label="' +
              escapeHtml(String(entry.id || '')) +
              '">' +
              '<div class="activity-content">' +
              '<h3 class="activity-label">' +
              escapeHtml(String(entry.name || 'Unnamed Instrument')) +
              '</h3>' +
              '<div class="activity-meta">' +
              escapeHtml(String(entry.id || '')) +
              ' · ' +
              escapeHtml(String(entry.category || 'Uncategorized')) +
              ' · ' +
              escapeHtml(String(entry.custodian || '')) +
              '</div>' +
              '<div class="activity-meta">' +
              escapeHtml(String(entry.maturity || '')) +
              '</div>' +
              '<div class="activity-meta">' +
              escapeHtml(String(entry.note || '')) +
              '</div>' +
              '<div class="activity-meta">' +
              '<span class="treasury-badge treasury-status-' +
              slugify(String(entry.status || '')) +
              '">' +
              escapeHtml(String(entry.status || '')) +
              '</span>' +
              '</div>' +
              '</div>' +
              '<div class="activity-sidebar">' +
              '<span class="activity-status status-' +
              slugify(String(entry.status || '')) +
              '">' +
              escapeHtml(String(entry.status || '').replace('-', ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); })) +
              '</span>' +
              '</div>' +
              '</article>'
            );
          })
          .join('');
      }

      searchField.addEventListener('input', function () {
        render(treasuryItems);
      });
    } catch {}
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
