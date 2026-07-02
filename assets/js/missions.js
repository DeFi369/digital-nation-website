(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    try {
      const feed = document.getElementById('missions-feed');
      const searchField = document.getElementById('missions-search');
      const regionField = document.getElementById('missions-region');
      const typeField = document.getElementById('missions-type');

      if (!feed || !searchField || !regionField || !typeField) return;

      let missionItems = [];

      fetch('assets/data/missions.json')
        .then(function (response) {
          if (!response.ok) throw new Error('missions data unavailable');
          return response.json();
        })
        .then(function (data) {
          missionItems = Array.isArray(data.entries) ? data.entries.slice() : [];
          render(missionItems);
        })
        .catch(function () {
          feed.innerHTML = '<div class=\"activity-empty\">Mission directory is temporarily unavailable.</div>';
        });

      function render(items) {
        const term = searchField.value.trim().toLowerCase();
        const region = regionField.value;
        const type = typeField.value;

        const filtered = items.filter(function (entry) {
          const matchesTerm =
            !term ||
            String(entry.name || '').toLowerCase().includes(term) ||
            String(entry.representative || '').toLowerCase().includes(term) ||
            String(entry.region || '').toLowerCase().includes(term);
          const matchesRegion = region === 'all' || entry.region === region;
          const matchesType = type === 'all' || entry.type === type;
          return matchesTerm && matchesRegion && matchesType;
        });

        if (!filtered.length) {
          feed.innerHTML = '<div class=\"activity-empty\">No matching missions found.</div>';
          return;
        }

        feed.innerHTML = filtered
          .map(
            function (entry) {
              return (
                '<article class=\"activity-item mission-item\" role=\"article\" aria-label=\"' +
                escapeHtml(String(entry.id || '')) +
                '\">' +
                '<div class=\"mission-primary\">' +
                '<div class=\"activity-label\">' +
                escapeHtml(String(entry.name || 'Unnamed Mission')) +
                '</div>' +
                '<div class=\"activity-meta\">' +
                escapeHtml(String(entry.id || '')) +
                ' · ' +
                escapeHtml(String(entry.region || 'Unknown region')) +
                '</div>' +
                '</div>' +
                '<div class=\"mission-meta\">' +
                '<span class=\"mission-badge mission-type-' +
                slugify(String(entry.type || '')) +
                '\">' +
                escapeHtml(String(entry.type || '')) +
                '</span>' +
                '<span class=\"mission-badge mission-status-' +
                slugify(String(entry.status || '')) +
                '\">' +
                escapeHtml(String(entry.status || '')) +
                '</span>' +
                '</div>' +
                '<div class=\"activity-meta\">' +
                escapeHtml(String(entry.representative || '')) +
                '</div>' +
                '<div class=\"activity-meta\">' +
                escapeHtml(String(entry.note || '')) +
                '</div>' +
                '<div class=\"mission-contact\">' +
                '<a class=\"button\" href=\"mailto:' +
                escapeHtml(String(entry.contact || 'contact@example.aetheria')) +
                '\">Contact</a>' +
                '</div>' +
                '</article>'
              );
            }
          )
          .join('');
      }

      searchField.addEventListener('input', function () {
        render(missionItems);
      });
      regionField.addEventListener('change', function () {
        render(missionItems);
      });
      typeField.addEventListener('change', function () {
        render(missionItems);
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
