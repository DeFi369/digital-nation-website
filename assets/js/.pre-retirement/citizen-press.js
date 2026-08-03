(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    renderCitizenPress();
  }

  function renderCitizenPress() {
    var container = document.getElementById('citizen-press');
    if (!container) {
      return;
    }

    fetch('assets/data/citizen-press.json')
      .then(function (res) { return res.json(); })
      .then(function (posts) {
        if (!Array.isArray(posts) || posts.length === 0) {
          container.innerHTML = '<p class="press-empty">No updates yet.</p>';
          return;
        }

        var html = '<ul class="press-list">';
        posts.forEach(function (post) {
          var tag = post.tag ? '<span class="press-tag">' + escapeHtml(String(post.tag)) + '</span>' : '';
          var summary = post.summary ? '<p class="press-summary">' + escapeHtml(String(post.summary)) + '</p>' : '';
          html += '<li class="press-item">' +
            '<a class="press-link" href="' + escapeHtml(String(post.href || '#')) + '">' +
              '<h3 class="press-title">' + escapeHtml(String(post.title || '')) + '</h3>' +
              '<time datetime="' + escapeHtml(String(post.date || '')) + '">' + escapeHtml(String(post.date || '')) + '</time>' +
              tag +
            '</a>' +
            summary +
          '</li>';
        });
        html += '</ul>';
        container.innerHTML = html;
      })
      .catch(function () {
        container.innerHTML = '<p class="press-empty">Press updates are temporarily unavailable.</p>';
      });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}());
