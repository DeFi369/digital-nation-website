(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    try {
      var searchField = document.getElementById('data-governance-search');
      var statusField = document.getElementById('data-governance-status');
      if (!searchField && !statusField) return;

      setupMenu();
      liveYear();
      loadFeeds();
    } catch {}
  }

  function loadFeeds() {
    fetch('assets/data/data-governance.json')
      .then(function (response) {
        if (!response.ok) throw new Error('data governance data unavailable');
        return response.json();
      })
      .then(function (data) {
        var entries = data.entries || {};
        renderSection('data-governance-policies-feed', entries.policies || []);
        renderSection('data-governance-assessments-feed', entries.assessments || []);
        renderSection('data-governance-retention-feed', entries.retention || []);
      })
      .catch(function () {
        var ids = [
          'data-governance-policies-feed',
          'data-governance-assessments-feed',
          'data-governance-retention-feed'
        ];
        ids.forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.innerHTML = '<div class="activity-empty">Data Governance data is temporarily unavailable.</div>';
        });
      });
  }

  function renderSection(containerId, items) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var searchField = document.getElementById('data-governance-search');
    var statusField = document.getElementById('data-governance-status');
    var term = searchField ? searchField.value.trim().toLowerCase() : '';
    var status = statusField ? statusField.value : 'all';

    var filtered = items.filter(function (entry) {
      var matchesTerm =
        !term ||
        String(entry.title || entry.name || '').toLowerCase().indexOf(term) !== -1 ||
        String(entry.id || '').toLowerCase().indexOf(term) !== -1 ||
        String(entry.category || '').toLowerCase().indexOf(term) !== -1 ||
        String(entry.summary || '').toLowerCase().indexOf(term) !== -1;
      var matchesStatus = status === 'all' || String(entry.status || '').toLowerCase() === status.toLowerCase();
      return matchesTerm && matchesStatus;
    });

    if (!filtered.length) {
      container.innerHTML = '<div class="activity-empty">No matching items found.</div>';
      return;
    }

    container.innerHTML = filtered
      .map(function (entry) {
        var meta = [
          escapeHtml(String(entry.id || '')),
          escapeHtml(String(entry.category || ''))
        ];
        if (entry.owner) meta.push('Owner: ' + escapeHtml(String(entry.owner)));
        if (entry.validatedBy) meta.push('Validated by: ' + escapeHtml(String(entry.validatedBy)));
        if (entry.administeredBy) meta.push('Administered by: ' + escapeHtml(String(entry.administeredBy)));
        if (entry.disposition) meta.push('Disposition: ' + escapeHtml(String(entry.disposition)));
        if (entry.retentionPeriod) meta.push('Retention: ' + escapeHtml(String(entry.retentionPeriod)));

        var details = [];
        if (entry.effective) details.push('Effective: ' + escapeHtml(String(entry.effective)));
        if (entry.period) details.push('Period: ' + escapeHtml(String(entry.period)));
        if (entry.cohort) details.push('Cohort: ' + escapeHtml(String(entry.cohort)));
        if (entry.station) details.push('Station: ' + escapeHtml(String(entry.station)));

        var html =
          '<article class="activity-item data-governance-item" role="article" aria-label="' +
          escapeHtml(String(entry.id || '')) +
          '">' +
          '<div class="activity-content">' +
          '<h3 class="activity-label">' +
          escapeHtml(String(entry.title || entry.name || 'Untitled')) +
          '</h3>' +
          '<div class="activity-meta">' + meta.join(' · ') + '</div>' +
          '<div class="activity-meta">' + escapeHtml(String(entry.summary || '')) + '</div>';
        if (details.length) {
          html += '<div class="activity-meta">' + details.join('<br/>') + '</div>';
        }
        html +=
          '<div class="activity-meta">' +
          '<span class="data-governance-status data-governance-status-' +
          slugify(String(entry.status || '')) +
          '">' +
          escapeHtml(String(entry.status || '')) +
          '</span>' +
          '</div>' +
          '</div>' +
          '</article>';

        return html;
      })
      .join('');
  }

  function setupMenu() {
    var menuButton = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.menu');
    if (!menuButton || !menu) return;
    menuButton.addEventListener('click', function () {
      var open = menu.dataset.open === 'true';
      menu.dataset.open = String(!open);
      menu.setAttribute('aria-hidden', String(open));
      menuButton.setAttribute('aria-expanded', String(!open));
      if (!open) {
        var firstLink = menu.querySelector('a');
        if (firstLink) setTimeout(function () { firstLink.focus(); }, 0);
      }
    });
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.dataset.open === 'true') {
        menu.dataset.open = 'false';
        menu.setAttribute('aria-hidden', 'true');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.focus();
      }
    });
  }

  function liveYear() {
    try {
      var yearEl = document.querySelector('[data-year]');
      if (yearEl) yearEl.textContent = String(new Date().getFullYear());
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
