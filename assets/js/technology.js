(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    renderHeadline();
    renderMission();
    renderStats();
    renderPillars();
    renderOperations();
    renderInfrastructure();
    renderEmerging();
  }

  function renderHeadline() {
    var headline = document.getElementById('technology-headline');
    if (!headline) return;
    fetch('assets/data/technology.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        headline.textContent = (data.ministry || 'Technology, Science & Innovation') + ' — v3.0';
      })
      .catch(function () {});
  }

  function renderMission() {
    var container = document.getElementById('technology-mission');
    if (!container) return;
    fetch('assets/data/technology.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.mission) return;
        container.innerHTML = '<p class=\"lead\">' + escapeHtml(String(data.mission)) + '</p>';
      })
      .catch(function () {});
  }

  function renderStats() {
    var container = document.getElementById('technology-stats');
    if (!container) return;
    fetch('assets/data/technology.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.stats) {
          container.innerHTML = '<div class=\"activity-empty\">Technology metrics are temporarily unavailable.</div>';
          return;
        }
        var rows = Object.keys(data.stats).map(function (key) {
          return '<div class=\"stat-card\">' +
            '<div class=\"stat-value\">' + escapeHtml(String(data.stats[key])) + '</div>' +
            '<div class=\"stat-label\">' + escapeHtml(key) + '</div>' +
          '</div>';
        }).join('');
        container.innerHTML = '<div class=\"stats-grid\">' + rows + '</div>';
      })
      .catch(function () {
        container.innerHTML = '<div class=\"activity-empty\">Technology metrics are temporarily unavailable.</div>';
      });
  }

  function renderPillars() {
    var container = document.getElementById('technology-pillars');
    if (!container) return;
    fetch('assets/data/technology.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!Array.isArray(data.pillars) || !data.pillars.length) {
          container.innerHTML = '<div class=\"activity-empty\">No strategic pillars are currently defined.</div>';
          return;
        }
        var rows = data.pillars.map(function (pillar) {
          return '<article class=\"pillar-card\" aria-label=\"' + escapeHtml(String(pillar.title || pillar.id || '')) + '\">' +
            '<h3>' + escapeHtml(String(pillar.title || 'Untitled')) + '</h3>' +
            '<p>' + escapeHtml(String(pillar.summary || '')) + '</p>' +
          '</article>';
        }).join('');
        container.innerHTML = '<div class=\"pillars-grid\">' + rows + '</div>';
      })
      .catch(function () {
        container.innerHTML = '<div class=\"activity-empty\">Strategic pillars are temporarily unavailable.</div>';
      });
  }

  function renderOperations() {
    var headline = document.getElementById('technology-headline');
    if (!headline) return;
    fetch('assets/data/technology.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        headline.textContent = (data.ministry || 'Technology, Science & Innovation') + ' — v3.0';
      })
      .catch(function () {});
  }

  function renderMission() {
    var container = document.getElementById('technology-mission');
    if (!container) return;
    fetch('assets/data/technology.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.mission) return;
        container.innerHTML = '<p class="lead">' + escapeHtml(String(data.mission)) + '</p>';
      })
      .catch(function () {});
  }

  function renderOperations() {
    loadSection('technology-operations-feed', 'operations', 'Operations');
  }
  function renderInfrastructure() {
    loadSection('technology-infrastructure-feed', 'infrastructure', 'Infrastructure services');
  }
  function renderEmerging() {
    loadSection('technology-emerging-feed', 'emerging', 'Emerging technology');
  }

  function loadSection(feedId, sectionKey, placeholderText) {
    var feed = document.getElementById(feedId);
    if (!feed) return;
    feed.innerHTML = '<div class="activity-loading" aria-hidden="true">Loading ' + escapeHtml(placeholderText || sectionKey) + '...</div>';

    fetch('assets/data/technology.json')
      .then(function (response) {
        if (!response.ok) throw new Error('technology data unavailable');
        return response.json();
      })
      .then(function (data) {
        var entries = data.entries && data.entries[sectionKey] ? data.entries[sectionKey] : [];
        var items = Array.isArray(entries) ? entries.slice() : [];
        renderList(feed, items);
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">' + escapeHtml(placeholderText || sectionKey) + ' are temporarily unavailable.</div>';
      });
  }

  function renderList(container, items) {
    if (!items.length) {
      container.innerHTML = '<div class="activity-empty">No matching entries found.</div>';
      return;
    }
    container.innerHTML = items.map(function (item) {
      var statusClass = 'status-' + slugify(String(item.status || 'unknown'));
      var extra = buildMetrics(item);
      return '<article class="activity-item technology-item" role="article" aria-label="' + escapeHtml(String(item.id || item.title || '')) + '">' +
        '<div class="activity-content">' +
          '<h3 class="activity-title">' + escapeHtml(String(item.title || 'Untitled')) + '</h3>' +
          '<p class="activity-description">' + escapeHtml(String(item.summary || '')) + '</p>' +
          '<div class="activity-meta">' +
            '<span class="activity-type">' + escapeHtml(String(item.category || 'Program')) + '</span>' +
            '<span class="activity-divider">·</span>' +
            '<span>' + escapeHtml(String(item.id || '')) + '</span>' +
            '<span class="activity-divider">·</span>' +
            '<span>' + escapeHtml(String(item.owner || '—')) + '</span>' +
          '</div>' +
          (extra ? '<div class="activity-meta technology-meta">' + extra + '</div>' : '') +
        '</div>' +
        '<div class="activity-sidebar">' +
          '<span class="activity-status ' + statusClass + '">' + escapeHtml(String(item.status || '—')) + '</span>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function buildMetrics(item) {
    var parts = [];
    if (item.sloUptime) parts.push('<span class="metric">SLO: ' + escapeHtml(String(item.sloUptime)) + '</span>');
    if (item.teamSize) parts.push('<span class="metric">Team: ' + escapeHtml(String(item.teamSize)) + '</span>');
    if (item.monthlyBudget) parts.push('<span class="metric">Monthly Budget: ' + escapeHtml(String(item.monthlyBudget)) + '</span>');
    if (item.storageTb) parts.push('<span class="metric">Storage: ' + escapeHtml(String(item.storageTb)) + ' TB</span>');
    if (item.vCpu) parts.push('<span class="metric">vCPU: ' + escapeHtml(String(item.vCpu)) + '</span>');
    if (item.notes) parts.push('<span class="metric">Notes: ' + escapeHtml(String(item.notes)) + '</span>');
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
