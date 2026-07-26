/* page-renderer.js
 * Generic renderer for citizen-site pages that use "Loading..." placeholders.
 *
 * Convention:
 *   <body data-page="about">  →  loads assets/data/about.json
 *   <div id="about-stats">     →  filled from data.stats
 *   <div id="about-pillars">   →  filled from data.pillars (array → cards)
 *
 * Supported section types (auto-detected from JSON value type):
 *   - object  → stats-grid: one card per key/value
 *   - array   → cards: one card per item (uses .title/.summary or .name/.description)
 *   - string  → plain text
 *
 * Usage: add <script src="assets/js/page-renderer.js"></script> to any page
 *        with data-page set and {pageId}-{section} placeholder divs.
 */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    var body = document.body;
    var pageId = body.getAttribute('data-page');
    if (!pageId) return;

    fetch('assets/data/' + pageId + '.json', { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data) return;
        // render every {pageId}-{key} section that exists in the data
        Object.keys(data).forEach(function (key) {
          var el = document.getElementById(pageId + '-' + key);
          if (el) renderSection(el, data[key], key);
        });
      })
      .catch(function () { /* silent: placeholders stay as-is */ });
  }

  function renderSection(el, value, key) {
    // remove the "Loading..." placeholder
    // NOTE: all values are escaped via escapeHtml() before insertion — safe innerHTML
    el.innerHTML = '';

    if (value == null) {
      el.innerHTML = '<p class="activity-empty">No data available.</p>';
      return;
    }

    if (Array.isArray(value)) {
      renderArray(el, value);
    } else if (typeof value === 'object') {
      renderObject(el, value);
    } else {
      el.innerHTML = '<p class="stat-value">' + escapeHtml(value) + '</p>';
    }
  }

  function renderObject(el, obj) {
    var html = '<div class="stats-grid">';
    Object.keys(obj).forEach(function (k) {
      html += '<div class="card"><h3>' + escapeHtml(k) + '</h3>' +
              '<p class="stat-value">' + escapeHtml(obj[k]) + '</p></div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  function renderArray(el, arr) {
    if (!arr.length) {
      el.innerHTML = '<p class="activity-empty">No entries.</p>';
      return;
    }
    var html = '<div class="activity-feed">';
    arr.forEach(function (item) {
      var title = item.title || item.name || item.id || 'Untitled';
      var desc = item.summary || item.description || '';
      html += '<article class="activity-item">' +
              '<header class="activity-header"><h3 class="activity-title">' +
              escapeHtml(title) + '</h3></header>' +
              (desc ? '<p class="activity-description">' + escapeHtml(desc) + '</p>' : '') +
              '</article>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
