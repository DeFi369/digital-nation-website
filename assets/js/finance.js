(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    try {
      const searchField = document.getElementById('finance-search');
      const statusField = document.getElementById('finance-status');
      if (!searchField && !statusField) return;

      setupMenu();
      liveYear();
      loadFeeds();
    } catch {}
  }

  function loadFeeds() {
    fetch('assets/data/finance.json')
      .then(function (response) {
        if (!response.ok) throw new Error('finance data unavailable');
        return response.json();
      })
      .then(function (data) {
        const entries = data.entries || {};
        renderSection('finance-programs-feed', entries.programs || []);
        renderSection('finance-instruments-feed', entries.instruments || []);
        renderSection('finance-reports-feed', entries.reports || []);
      })
      .catch(function () {
        const ids = [
          'finance-programs-feed',
          'finance-instruments-feed',
          'finance-reports-feed'
        ];
        ids.forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.innerHTML = '<div class="activity-empty">Finance data is temporarily unavailable.</div>';
        });
      });
  }

  function renderSection(containerId, items) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var searchField = document.getElementById('finance-search');
    var statusField = document.getElementById('finance-status');
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
        return (
          '<article class="activity-item finance-item" role="article" aria-label="' +
          escapeHtml(String(entry.id || '')) +
          '">' +
          '<div class="activity-content">' +
          '<h3 class="activity-label">' +
          escapeHtml(String(entry.title || entry.name || 'Untitled')) +
          '</h3>' +
          '<div class="activity-meta">' +
          escapeHtml(String(entry.id || '')) +
          ' · ' +
          escapeHtml(String(entry.category || '')) +
          ' · ' +
          escapeHtml(String(entry.owner || '')) +
          '</div>' +
          '<div class="activity-meta">' +
          escapeHtml(String(entry.summary || '')) +
          '</div>' +
          '<div class="activity-meta">' +
          '<span class="finance-badge finance-status-' +
          slugify(String(entry.status || '')) +
          '">' +
          escapeHtml(String(entry.status || '')) +
          '</span>' +
          '</div>' +
          '</div>' +
          '</article>'
        );
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
