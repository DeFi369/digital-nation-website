(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const filterInput = document.getElementById('diplomacy-treaty-filter');
    if (filterInput) {
      filterInput.addEventListener('input', function () {
        renderTreaties(String(this.value || '').trim());
      });
      renderTreaties('');
    } else {
      renderTreaties('');
    }
    renderMultilateral();
  }

  function renderTreaties(keyword) {
    const feed = document.getElementById('diplomacy-treaty-feed');
    if (!feed) return;

    feed.innerHTML = '<div class="activity-loading" aria-hidden="true">Loading treaty register…</div>';

    fetch('assets/data/diplomacy.json')
      .then(function (response) {
        if (!response.ok) throw new Error('diplomacy data unavailable');
        return response.json();
      })
      .then(function (data) {
        let items = [];
        if (Array.isArray(data.entries?.treaties)) {
          items = data.entries.treaties.slice();
        }
        if (keyword) {
          const q = keyword.toLowerCase();
          items = items.filter(function (t) {
            return (
              String(t.title || '').toLowerCase().indexOf(q) !== -1 ||
              String(t.party || '').toLowerCase().indexOf(q) !== -1 ||
              String(t.status || '').toLowerCase().indexOf(q) !== -1 ||
              String(t.id || '').toLowerCase().indexOf(q) !== -1
            );
          });
        }
        renderTreatyList(feed, items, keyword);
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Treaty register is temporarily unavailable.</div>';
      });
  }

  function renderTreatyList(container, items, keyword) {
    if (!items.length) {
      const msg = keyword
        ? 'No treaties match "' + escapeHtml(keyword) + '".'
        : 'No treaties are registered.';
      container.innerHTML = '<div class="activity-empty">' + msg + '</div>';
      return;
    }

    container.innerHTML = '<div class="activity-feed-inner">' + items
      .map(function (t) {
        const statusClass = 'status-' + slugify(String(t.status || 'unknown'));
        const typeBadge = 'type-' + slugify(String(t.type || 'accord'));
        return (
          '<article class="activity-item treaty-item" role="article" aria-label="' + escapeHtml(String(t.title || t.id || '')) + '">' +
            '<div class="activity-content">' +
              '<h3 class="activity-title">' + escapeHtml(String(t.title || 'Untitled')) + '</h3>' +
              '<p class="activity-description">' + escapeHtml(String(t.summary || '')) + '</p>' +
              '<div class="activity-meta">' +
                '<span class="activity-type ' + typeBadge + '">' + escapeHtml(String(t.type || 'Accord')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span>' + escapeHtml(String(t.id || '')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span>Party: ' + escapeHtml(String(t.party || '—')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span>Effective: ' + escapeHtml(String(t.effectiveDate || '—')) + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="activity-sidebar">' +
              '<span class="activity-status ' + statusClass + '">' + escapeHtml(String(t.status || '')) + '</span>' +
            '</div>' +
          '</article>'
        );
      })
      .join('') + '</div>';
  }

  function renderMultilateral() {
    const feed = document.getElementById('diplomacy-multilateral-feed');
    if (!feed) return;

    feed.innerHTML = '<div class="activity-loading" aria-hidden="true">Loading multilateral engagements…</div>';

    fetch('assets/data/diplomacy.json')
      .then(function (response) {
        if (!response.ok) throw new Error('diplomacy data unavailable');
        return response.json();
      })
      .then(function (data) {
        const items = Array.isArray(data.entries?.multilateral) ? data.entries.multilateral.slice() : [];
        renderMultilateralList(feed, items);
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Multilateral engagements are temporarily unavailable.</div>';
      });
  }

  function renderMultilateralList(container, items) {
    if (!items.length) {
      container.innerHTML = '<div class="activity-empty">No multilateral engagements on record.</div>';
      return;
    }

    container.innerHTML = '<div class="activity-feed-inner">' + items
      .map(function (m) {
        const statusClass = 'status-' + slugify(String(m.status || 'unknown'));
        return (
          '<article class="activity-item" role="article" aria-label="' + escapeHtml(String(m.title || m.id || '')) + '">' +
            '<div class="activity-content">' +
              '<h3 class="activity-title">' + escapeHtml(String(m.title || 'Untitled')) + '</h3>' +
              '<p class="activity-description">' + escapeHtml(String(m.topic || '')) + '</p>' +
              '<div class="activity-meta">' +
                '<span>' + escapeHtml(String(m.id || '')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span>' + escapeHtml(String(m.participants || '—')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span>Last: ' + escapeHtml(String(m.lastMeeting || '—')) + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="activity-sidebar">' +
              '<span class="activity-status ' + statusClass + '">' + escapeHtml(String(m.status || '')) + '</span>' +
            '</div>' +
          '</article>'
        );
      })
      .join('') + '</div>';
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
