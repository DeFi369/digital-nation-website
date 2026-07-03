(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initInfrastructureFeed();
    initFilters();
  }

  function initInfrastructureFeed() {
    loadSection('infrastructure-services-feed', 'services', 'Infrastructure services');
    loadSection('infrastructure-civic-tech-feed', 'civicTech', 'Civic technology');
    loadSection('infrastructure-projects-feed', 'projects', 'Projects');
    loadSection('infrastructure-reports-feed', 'reports', 'Infrastructure reports');
  }

  function loadSection(feedId, sectionKey, placeholderText) {
    var feed = document.getElementById(feedId);
    if (!feed) return;
    feed.innerHTML = '<div class="activity-loading" aria-hidden="true">Loading ' + escapeHtml(placeholderText || sectionKey) + '...</div>';
    fetch('assets/data/infrastructure.json')
      .then(function (response) {
        if (!response.ok) throw new Error('infrastructure data unavailable');
        return response.json();
      })
      .then(function (data) {
        var entries = data.entries && data.entries[sectionKey];
        var items = Array.isArray(entries) ? entries.slice() : [];
        renderList(feed, items);
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">' + escapeHtml(placeholderText || sectionKey) + ' are temporarily unavailable.</div>';
      });
  }

  function renderList(container, items) {
    if (!container) return;
    if (!items.length) {
      container.innerHTML = '<div class="activity-empty">No matching entries found.</div>';
      return;
    }
    container.innerHTML = items.map(function (item) {
      var statusClass = 'status-' + slugify(String(item.status || 'unknown'));
      var extra = buildExtraMeta(item);
      return '<article class="activity-item" role="article" aria-label="' + escapeHtml(String(item.title || item.id || '')) + '">' +
        '<div class="activity-content">' +
          '<h3 class="activity-title">' + escapeHtml(String(item.title || 'Untitled')) + '</h3>' +
          '<p class="activity-description">' + escapeHtml(String(item.summary || '')) + '</p>' +
          '<div class="activity-meta">' +
            '<span class="activity-type">' + escapeHtml(String(item.category || 'Program')) + '</span>' +
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
    if (item.teamSize) parts.push('<span class="metric">Team: ' + escapeHtml(String(item.teamSize)) + '</span>');
    if (item.sloUptime) parts.push('<span class="metric">SLO: ' + escapeHtml(String(item.sloUptime)) + '</span>');
    if (item.vCpu != null) parts.push('<span class="metric">vCPU: ' + escapeHtml(String(item.vCpu)) + '</span>');
    if (item.storageTb != null) parts.push('<span class="metric">Storage: ' + escapeHtml(String(item.storageTb)) + ' TB</span>');
    if (item.monthlyBudget) parts.push('<span class="meta-budget">Budget: ' + escapeHtml(String(item.monthlyBudget)) + '</span>');
    if (item.published) parts.push('<span class="meta-date">Published: ' + escapeHtml(String(item.published)) + '</span>');
    return parts.join('<span class="activity-divider">·</span>');
  }

  function initFilters() {
    var searchField = document.getElementById('infrastructure-search');
    var scopeField = document.getElementById('infrastructure-scope');
    if (!searchField || !scopeField) return;

    var cachedData = null;
    fetch('assets/data/infrastructure.json')
      .then(function (res) { return res.json(); })
      .then(function (data) { cachedData = data; })
      .catch(function () { cachedData = null; });

    function applyFilter() {
      if (!cachedData) return;
      var term = searchField.value.trim().toLowerCase();
      var scope = scopeField.value;

      var items = [];
      if (scope === 'all' || scope === 'services') {
        (cachedData.entries && cachedData.entries.services || []).forEach(function (entry) { items.push(entry); });
      }
      if (scope === 'all' || scope === 'civicTech') {
        (cachedData.entries && cachedData.entries.civicTech || []).forEach(function (entry) { items.push(entry); });
      }
      if (scope === 'all' || scope === 'projects') {
        (cachedData.entries && cachedData.entries.projects || []).forEach(function (entry) { items.push(entry); });
      }
      if (scope === 'all' || scope === 'reports') {
        (cachedData.entries && cachedData.entries.reports || []).forEach(function (entry) { items.push(entry); });
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

      renderMixed('infrastructure-mixed-feed', filtered);
    }

    searchField.addEventListener('input', function () { applyFilter(); });
    scopeField.addEventListener('change', function () { applyFilter(); });
  }

  function renderMixed(feedId, items) {
    var feed = document.getElementById(feedId);
    if (!feed) return;
    if (!items.length) {
      feed.innerHTML = '<div class="activity-empty">No matching entries found.</div>';
      return;
    }
    renderList(feed, items);
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
