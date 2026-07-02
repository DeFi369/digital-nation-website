(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const standardFilter = document.getElementById('protocol-standard-filter');
    if (standardFilter) {
      standardFilter.addEventListener('input', function () {
        renderStandards(String(this.value || '').trim());
      });
      renderStandards('');
    } else {
      renderStandards('');
    }

    const sovereigntyFilter = document.getElementById('protocol-sovereignty-filter');
    if (sovereigntyFilter) {
      sovereigntyFilter.addEventListener('input', function () {
        renderSovereignty(String(this.value || '').trim());
      });
      renderSovereignty('');
    } else {
      renderSovereignty('');
    }
  }

  function renderStandards(keyword) {
    const feed = document.getElementById('protocol-standard-feed');
    if (!feed) return;

    feed.innerHTML = '<div class="activity-loading" aria-hidden="true">Loading standards…</div>';

    fetch('assets/data/protocol.json')
      .then(function (response) {
        if (!response.ok) throw new Error('protocol data unavailable');
        return response.json();
      })
      .then(function (data) {
        let items = [];
        if (Array.isArray(data.entries?.standards)) {
          items = data.entries.standards.slice();
        }
        if (keyword) {
          const q = keyword.toLowerCase();
          items = items.filter(function (s) {
            return (
              String(s.title || '').toLowerCase().indexOf(q) !== -1 ||
              String(s.category || '').toLowerCase().indexOf(q) !== -1 ||
              String(s.status || '').toLowerCase().indexOf(q) !== -1 ||
              String(s.id || '').toLowerCase().indexOf(q) !== -1
            );
          });
        }
        renderStandardList(feed, items, keyword);
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Technical standards are temporarily unavailable.</div>';
      });
  }

  function renderStandardList(container, items, keyword) {
    if (!items.length) {
      const msg = keyword
        ? 'No standards match "' + escapeHtml(keyword) + '".'
        : 'No standards on record.';
      container.innerHTML = '<div class="activity-empty">' + msg + '</div>';
      return;
    }

    container.innerHTML = '<div class="activity-feed-inner">' + items
      .map(function (s) {
        const statusClass = 'status-' + slugify(String(s.status || 'unknown'));
        const categoryBadge = 'type-' + slugify(String(s.category || 'standard'));
        return (
          '<article class="activity-item" role="article" aria-label="' + escapeHtml(String(s.title || s.id || '')) + '">' +
            '<div class="activity-content">' +
              '<h3 class="activity-title">' + escapeHtml(String(s.title || 'Untitled')) + '</h3>' +
              '<p class="activity-description">' + escapeHtml(String(s.summary || '')) + '</p>' +
              '<div class="activity-meta">' +
                '<span class="activity-type ' + categoryBadge + '">' + escapeHtml(String(s.category || 'Standard')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span class="activity-status ' + statusClass + '">' + escapeHtml(String(s.status || '')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span>' + escapeHtml(String(s.id || '')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span>v' + escapeHtml(String(s.version || '—')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span>' + escapeHtml(String(s.owner || '—')) + '</span>' +
              '</div>' +
            '</div>' +
          '</article>'
        );
      })
      .join('') + '</div>';
  }

  function renderSovereignty(keyword) {
    const feed = document.getElementById('protocol-sovereignty-feed');
    if (!feed) return;

    feed.innerHTML = '<div class="activity-loading" aria-hidden="true">Loading sovereignty protocols…</div>';

    fetch('assets/data/protocol.json')
      .then(function (response) {
        if (!response.ok) throw new Error('protocol data unavailable');
        return response.json();
      })
      .then(function (data) {
        let items = [];
        if (Array.isArray(data.entries?.sovereignty)) {
          items = data.entries.sovereignty.slice();
        }
        if (keyword) {
          const q = keyword.toLowerCase();
          items = items.filter(function (s) {
            return (
              String(s.title || '').toLowerCase().indexOf(q) !== -1 ||
              String(s.riskLevel || '').toLowerCase().indexOf(q) !== -1 ||
              String(s.category || '').toLowerCase().indexOf(q) !== -1 ||
              String(s.status || '').toLowerCase().indexOf(q) !== -1 ||
              String(s.id || '').toLowerCase().indexOf(q) !== -1
            );
          });
        }
        renderSovereigntyList(feed, items, keyword);
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Sovereignty protocols are temporarily unavailable.</div>';
      });
  }

  function renderSovereigntyList(container, items, keyword) {
    if (!items.length) {
      const msg = keyword
        ? 'No sovereignty protocols match "' + escapeHtml(keyword) + '".'
        : 'No sovereignty protocols on record.';
      container.innerHTML = '<div class="activity-empty">' + msg + '</div>';
      return;
    }

    container.innerHTML = '<div class="activity-feed-inner">' + items
      .map(function (s) {
        const statusClass = 'status-' + slugify(String(s.status || 'unknown'));
        const riskClass = 'risk-' + slugify(String(s.riskLevel || 'unknown'));
        const catBadge = 'type-' + slugify(String(s.category || 'protocol'));
        return (
          '<article class="activity-item" role="article" aria-label="' + escapeHtml(String(s.title || s.id || '')) + '">' +
            '<div class="activity-content">' +
              '<h3 class="activity-title">' + escapeHtml(String(s.title || 'Untitled')) + '</h3>' +
              '<p class="activity-description">' + escapeHtml(String(s.summary || '')) + '</p>' +
              '<div class="activity-meta">' +
                '<span class="risk-badge ' + riskClass + '">' + escapeHtml(String(s.riskLevel || '—')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span class="activity-type ' + catBadge + '">' + escapeHtml(String(s.category || 'Protocol')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span class="activity-status ' + statusClass + '">' + escapeHtml(String(s.status || '')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span>' + escapeHtml(String(s.id || '')) + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span>' + escapeHtml(String(s.owner || '—')) + '</span>' +
              '</div>' +
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
