(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    try {
      const feed = document.getElementById('registry-feed');
      const searchField = document.getElementById('registry-search');
      const tierField = document.getElementById('registry-tier');
      const statusField = document.getElementById('registry-status');

      if (!feed || !searchField || !tierField || !statusField) return;

      fetch('assets/data/registry.json')
        .then(function (response) {
          if (!response.ok) throw new Error('registry data unavailable');
          return response.json();
        })
        .then(function (data) {
          const entries = Array.isArray(data.entries) ? data.entries : [];
          render(entries);
        })
        .catch(function () {
          feed.innerHTML = '<div class=\"activity-empty\">Registry is temporarily unavailable.</div>';
        });

      function render(items) {
        const term = searchField.value.trim().toLowerCase();
        const tier = tierField.value;
        const status = statusField.value;

        const filtered = items.filter(function (entry) {
          const matchesTerm =
            !term ||
            String(entry.name || '').toLowerCase().includes(term) ||
            String(entry.id || '').toLowerCase().includes(term) ||
            String(entry.region || '').toLowerCase().includes(term);
          const matchesTier = tier === 'all' || entry.tier === tier;
          const matchesStatus = status === 'all' || entry.status === status;
          return matchesTerm && matchesTier && matchesStatus;
        });

        if (!filtered.length) {
          feed.innerHTML = '<div class=\"activity-empty\">No matching registry entries found.</div>';
          return;
        }

        feed.innerHTML = filtered
          .map(
            function (entry) {
              return (
                '<article class=\"activity-item registry-item\" role=\"article\" aria-label=\"' +
                escapeHtml(String(entry.id || '')) +
                '\">' +
                '<div class=\"registry-primary\">' +
                '<div class=\"activity-label\">' +
                escapeHtml(String(entry.name || 'Unnamed')) +
                '</div>' +
                '<div class=\"activity-meta\">' +
                escapeHtml(String(entry.id || '')) +
                ' · ' +
                escapeHtml(String(entry.region || 'Unknown region')) +
                '</div>' +
                '</div>' +
                '<div class=\"registry-meta\">' +
                '<span class=\"registry-badge registry-tier-' +
                slugify(String(entry.tier || '')) +
                '\">' +
                escapeHtml(String(entry.tier || '')) +
                '</span>' +
                '<span class=\"registry-badge registry-status-' +
                slugify(String(entry.status || '')) +
                '\">' +
                escapeHtml(String(entry.status || '')) +
                '</span>' +
                '</div>' +
                '<div class=\"activity-meta\">' +
                escapeHtml(String(entry.verified || '')) +
                '</div>' +
                '<div class=\"activity-meta\">' +
                escapeHtml(String(entry.note || '')) +
                '</div>' +
                '</article>'
              );
            }
          )
          .join('');
      }

      searchField.addEventListener('input', function () {
        renderRegistry();
      });
      tierField.addEventListener('change', function () {
        renderRegistry();
      });
      statusField.addEventListener('change', function () {
        renderRegistry();
      });

      function renderRegistry() {
        if (window._registryData) render(window._registryData);
      }
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
