/* Generic page renderer. Pages opt in with <body data-page="<slug>"> and it
   renders the standard blocks from assets/data/<slug>.json:
     #<slug>-stats       <- data.stats        (key/value telemetry cards)
     #<slug>-pillars     <- data.pillars      (numbered doctrine cards)
     #<slug>-search/-scope -> #<slug>-mixed-feed  (filterable entries feed)
   Each block is skipped when its container is absent, so pages can use any
   subset. Pages with bespoke renderers keep their own <slug>.js instead and
   do NOT set data-page (double-rendering guard).
   Menu/footer injection lives in nav.js; menu behavior in site.js. */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    var slug = document.body ? document.body.getAttribute('data-page') : null;
    if (!slug) return;
    var dataUrl = 'assets/data/' + slug + '.json';
    renderStats(slug, dataUrl);
    renderPillars(slug, dataUrl);
    initFilters(slug, dataUrl);
  }

  /* ---- stats ---- */
  function renderStats(slug, dataUrl) {
    var container = document.getElementById(slug + '-stats');
    if (!container) return;
    fetch(dataUrl)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var stats = data.stats || {};
        var html = '';
        Object.keys(stats).forEach(function (key) {
          html += '<div class="stat">' +
            '<span class="stat-value">' + escapeHtml(String(stats[key])) + '</span>' +
            '<span class="stat-label">' + escapeHtml(pascalToTitle(key)) + '</span>' +
          '</div>';
        });
        container.innerHTML = html;
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Summary is temporarily unavailable.</div>';
      });
  }

  function pascalToTitle(value) {
    return String(value)
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, function (s) { return s.toUpperCase(); })
      .trim();
  }

  /* ---- pillars ---- */
  function renderPillars(slug, dataUrl) {
    var container = document.getElementById(slug + '-pillars');
    if (!container) return;
    fetch(dataUrl)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var items = Array.isArray(data.pillars) ? data.pillars.slice() : [];
        container.innerHTML = items.map(function (item) {
          return '<article class="activity-item pillar">' +
            '<div class="activity-content">' +
            '<h3 class="activity-title">' + escapeHtml(String(item.title || '')) + '</h3>' +
            '<p class="activity-description">' + escapeHtml(String(item.summary || '')) + '</p>' +
            '</div>' +
            '</article>';
        }).join('');
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Pillar data is temporarily unavailable.</div>';
      });
  }

  /* ---- filterable entries feed ---- */
  function initFilters(slug, dataUrl) {
    var searchField = document.getElementById(slug + '-search');
    var scopeField = document.getElementById(slug + '-scope');
    if (!searchField || !scopeField) return;

    var cachedData = null;
    fetch(dataUrl)
      .then(function (res) { return res.json(); })
      .then(function (data) { cachedData = data; })
      .catch(function () { cachedData = null; });

    function applyFilter() {
      if (!cachedData) return;
      var term = searchField.value.trim().toLowerCase();
      var scope = scopeField.value;

      var items = [];
      if (scope === 'all' || scope === 'entries') {
        var entries = cachedData.entries || {};
        Object.keys(entries).forEach(function (key) {
          (entries[key] || []).forEach(function (entry) {
            items.push(entry);
          });
        });
      }

      var filtered = items.filter(function (entry) {
        var searchable =
          (entry.title || '') + ' ' +
          (entry.id || '') + ' ' +
          (entry.summary || '') + ' ' +
          (entry.category || '') + ' ' +
          (entry.owner || '') + ' ' +
          (entry.status || '');
        return !term || String(searchable).toLowerCase().indexOf(term) !== -1;
      });

      renderMixedList(slug + '-mixed-feed', filtered);
    }

    searchField.addEventListener('input', function () { applyFilter(); });
    scopeField.addEventListener('change', function () { applyFilter(); });
  }

  function renderMixedList(feedId, items) {
    var feed = document.getElementById(feedId);
    if (!feed) return;
    if (!items.length) {
      feed.innerHTML = '<div class="activity-empty">No matching entries found.</div>';
      return;
    }
    feed.innerHTML = items.map(function (item) {
      var statusClass = 'status-' + slugify(String(item.status || 'unknown'));
      var extra = buildExtraMeta(item);
      return '<article class="activity-item" role="article" aria-label="' + escapeHtml(String(item.id || item.title || '')) + '">' +
        '<div class="activity-content">' +
          '<h3 class="activity-title">' + escapeHtml(String(item.title || 'Untitled')) + '</h3>' +
          '<p class="activity-description">' + escapeHtml(String(item.summary || '')) + '</p>' +
          '<div class="activity-meta">' +
            '<span class="activity-type">' + escapeHtml(String(item.category || 'Entry')) + '</span>' +
            '<span class="activity-divider">·</span>' +
            '<span>' + escapeHtml(String(item.id || '')) + '</span>' +
            '<span class="activity-divider">·</span>' +
            '<span>' + escapeHtml(String(item.owner || item.lead || '—')) + '</span>' +
          '</div>' +
          (extra ? '<div class="activity-meta economics-meta">' + extra + '</div>' : '') +
        '</div>' +
        '<div class="activity-sidebar">' +
          '<span class="activity-status ' + statusClass + '">' + escapeHtml(String(item.status || '—')) + '</span>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function buildExtraMeta(item) {
    var parts = [];
    if (item.budget) parts.push('<span class="meta-budget">Budget: ' + escapeHtml(String(item.budget)) + '</span>');
    if (item.participants) parts.push('<span class="metric">Participants: ' + escapeHtml(String(item.participants)) + '</span>');
    if (item.published) parts.push('<span class="meta-date">Published: ' + escapeHtml(String(item.published)) + '</span>');
    if (item.teamSize) parts.push('<span class="metric">Team: ' + escapeHtml(String(item.teamSize)) + '</span>');
    if (item.monthlyBudget) parts.push('<span class="meta-budget">Budget: ' + escapeHtml(String(item.monthlyBudget)) + '</span>');
    if (item.beneficiaries) parts.push('<span class="metric">Beneficiaries: ' + escapeHtml(String(item.beneficiaries)) + '</span>');
    return parts.join('<span class="activity-divider">·</span>');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function slugify(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'unknown';
  }
})();
