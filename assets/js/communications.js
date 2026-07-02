(function () {
  function init() {
    try {
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
            String(entry.title || '').toLowerCase().includes(term) ||
            String(entry.owner || '').toLowerCase().includes(term) ||
            String(entry.summary || '').toLowerCase().includes(term);
          const matchesChannel = channel === 'all' || entry.channel === channel;
          const matchesStatus = status === 'all' || entry.status === status;
          return matchesTerm && matchesChannel && matchesStatus;
        });

        if (!filtered.length) {
          feed.innerHTML = '<div class="activity-empty">No matching communications entries found.</div>';
          return;
        }

        feed.innerHTML = filtered
          .map(
            function (entry) {
              return (
                '<article class="activity-item communications-item" role="article" aria-label="' +
                escapeHtml(String(entry.id || '')) +
                '">' +
                '<div class="activity-content">' +
                '<h3 class="activity-label">' +
                escapeHtml(String(entry.title || 'Untitled')) +
                '</h3>' +
                '<div class="activity-meta">' +
                escapeHtml(String(entry.id || '')) +
                ' · ' +
                escapeHtml(String(entry.channel || '')) +
                ' · ' +
                escapeHtml(String(entry.owner || '')) +
                '</div>' +
                '<div class="activity-meta">' +
                escapeHtml(String(entry.summary || '')) +
                '</div>' +
                '<div class="activity-meta">' +
                '<span class="communications-badge communications-status-' +
                slugify(String(entry.status || '')) +
                '">' +
                escapeHtml(String(entry.status || '')) +
                '</span>' +
                '</div>' +
                '</div>' +
                '</article>'
              );
            }
          )
          .join('');
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
    } catch {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
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
