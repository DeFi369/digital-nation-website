(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    try {
      const searchField = document.getElementById('treasury-search');
      const statusField = document.getElementById('treasury-status');
      const sectionField = document.getElementById('treasury-section');
      if (!searchField && !statusField && !sectionField) return;

      setupMenu();
      liveYear();
      loadFeeds();
    } catch {}
  }

  function loadFeeds() {
    fetch('assets/data/treasury.json')
      .then(function (response) {
        if (!response.ok) throw new Error('treasury data unavailable');
        return response.json();
      })
      .then(function (data) {
        const entries = data.entries || {};
        renderSection('treasury-operations-feed', entries.operations || []);
        renderSection('treasury-assets-feed', entries.assets || []);
        renderSection('treasury-reserves-feed', entries.reserves || []);
      })
      .catch(function () {
        const ids = [
          'treasury-operations-feed',
          'treasury-assets-feed',
          'treasury-reserves-feed'
        ];
        ids.forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.innerHTML = '<div class="activity-empty">Treasury data is temporarily unavailable.</div>';
        });
      });
  }

  function renderSection(containerId, items) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var searchField = document.getElementById('treasury-search');
    var sectionField = document.getElementById('treasury-section');
    var statusField = document.getElementById('treasury-status');
    var term = searchField ? searchField.value.trim().toLowerCase() : '';
    var section = sectionField ? sectionField.value : 'all';
    var status = statusField ? statusField.value : 'all';

    var filtered = items.filter(function (entry) {
      var matchesSection = section === 'all' || containerId.indexOf(section) !== -1;
      var matchesTerm =
        !term ||
        String(entry.title || entry.name || '').toLowerCase().indexOf(term) !== -1 ||
        String(entry.id || '').toLowerCase().indexOf(term) !== -1 ||
        String(entry.category || '').toLowerCase().indexOf(term) !== -1 ||
        String(entry.summary || '').toLowerCase().indexOf(term) !== -1;
      var matchesStatus = status === 'all' || String(entry.status || '').toLowerCase() === status.toLowerCase();
      return matchesSection && matchesTerm && matchesStatus;
    });

    if (!filtered.length) {
      container.innerHTML = '<div class="activity-empty">No matching items found.</div>';
      return;
    }

    container.innerHTML = filtered
      .map(function (entry) {
        return (
          '<article class="activity-item treasury-item" role="article" aria-label="' +
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
