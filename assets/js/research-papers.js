(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    renderPapers();
  }

  function renderPapers() {
    var container = document.getElementById('papers-feed');
    if (!container) return;
    fetch('assets/data/papers.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var papers = Array.isArray(data.papers) ? data.papers : [];
        container.innerHTML = papers.map(function (paper) {
          var evidence = paper.evidence || '#';
          var authors = Array.isArray(paper.authors) ? paper.authors.join(', ') : '';
          var tags = Array.isArray(paper.tags) ? paper.tags.map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') : '';
          return '<article class="activity-item research-paper">' +
            '<div class="activity-content">' +
              '<h3 class="activity-title">' + escapeHtml(paper.title || 'Untitled') + '</h3>' +
              '<p class="activity-description">' + escapeHtml(paper.summary || '') + '</p>' +
              '<div class="activity-meta">' +
                '<span class="activity-type">' + escapeHtml(paper.status || 'Published') + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span>' + escapeHtml(paper.published || '') + '</span>' +
                '<span class="activity-divider">·</span>' +
                '<span>' + escapeHtml(authors) + '</span>' +
              '</div>' +
              (tags ? '<div class="activity-meta">' + tags + '</div>' : '') +
            '</div>' +
            '<div class="activity-sidebar">' +
              '<a class="button" href="' + escapeHtml(evidence) + '" target="_blank" rel="noopener noreferrer">View Evidence</a>' +
            '</div>' +
          '</article>';
        }).join('');
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Research papers are temporarily unavailable.</div>';
      });
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}());
