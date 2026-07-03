(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    try {
      var searchField = document.getElementById('elections-search');
      var statusField = document.getElementById('elections-status');
      if (!searchField && !statusField) return;

      setupMenu();
      liveYear();
      loadFeeds();
    } catch {}
  }

  function loadFeeds() {
    fetch('assets/data/elections.json')
      .then(function (response) {
        if (!response.ok) throw new Error('elections data unavailable');
        return response.json();
      })
      .then(function (data) {
        var entries = data.entries || {};
        renderSection('elections-elections-feed', entries.elections || []);
        renderSection('elections-apportionment-feed', entries.apportionment || []);
        renderSection('elections-referendums-feed', entries.referendums || []);
        renderSection('elections-petitions-feed', entries.petitions || []);
      })
      .catch(function () {
        var ids = [
          'elections-elections-feed',
          'elections-apportionment-feed',
          'elections-referendums-feed',
          'elections-petitions-feed'
        ];
        ids.forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.innerHTML = '<div class="activity-empty">Elections data is temporarily unavailable.</div>';
        });
      });
  }

  function renderSection(containerId, items) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var searchField = document.getElementById('elections-search');
    var statusField = document.getElementById('elections-status');
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
        if (entry.administeredBy) meta.push('Administered by: ' + escapeHtml(String(entry.administeredBy)));
        if (entry.reportsTo) meta.push('Reports to: ' + escapeHtml(String(entry.reportsTo)));
        if (entry.validatedBy) meta.push('Validated by: ' + escapeHtml(String(entry.validatedBy)));
        if (entry.district) meta.push('District: ' + escapeHtml(String(entry.district)));
        if (entry.seats !== undefined) meta.push('Seats: ' + escapeHtml(String(entry.seats)));
        if (entry.population !== undefined) meta.push('Population: ' + escapeHtml(String(entry.population)));
        if (entry.signatures !== undefined) meta.push('Signatures: ' + escapeHtml(String(entry.signatures)));

        var details = [];
        if (entry.opened) details.push('Opened: ' + escapeHtml(String(entry.opened)));
        if (entry.closed) details.push('Closed: ' + escapeHtml(String(entry.closed)));
        if (entry.certified) details.push('Certified: ' + escapeHtml(String(entry.certified)));
        if (entry.effective) details.push('Effective: ' + escapeHtml(String(entry.effective)));
        if (entry.validated) details.push('Validated: ' + escapeHtml(String(entry.validated)));

        var html =
          '<article class="activity-item elections-item" role="article" aria-label="' +
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
          '<span class="elections-status elections-status-' +
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
