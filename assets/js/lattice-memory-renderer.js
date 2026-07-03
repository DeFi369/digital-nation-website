(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    renderCurrentState();
    renderMemoryIndex();
  }

  function renderCurrentState() {
    setText('latticeCurrentLayer', null);
    setText('latticeMemoryCount', null);
    setText('latticeVisitedLayers', null);
    setText('latticeMode', null);
    fetch('assets/data/lattice-summary.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        setText('latticeCurrentLayer', data.currentLayer != null ? 'Layer ' + data.currentLayer : '-');
        setText('latticeMemoryCount', data.memoryCount != null ? String(data.memoryCount) : '-');
        setText('latticeVisitedLayers', Array.isArray(data.visitedLayers) ? data.visitedLayers.join(' · ') : '-');
        setText('latticeMode', data.mode || '-');
      })
      .catch(function () {
        setText('latticeCurrentLayer', '--');
        setText('latticeMemoryCount', '--');
        setText('latticeVisitedLayers', '--');
        setText('latticeMode', '--');
      });
  }

  function renderMemoryIndex() {
    var container = document.getElementById('latticeMemoryIndex');
    if (!container) return;
    fetch('assets/data/lattice-summary.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var memories = Array.isArray(data.memories) ? data.memories : [];
        if (!memories.length) {
          container.innerHTML = '<div class="activity-empty">No visible memory entries.</div>';
          return;
        }
        container.innerHTML = memories.map(function (memory) {
          return '<article class="activity-item memory-entry">' +
            '<header class="activity-header">' +
              '<h3 class="activity-title">' + escapeHtml(memory.key || '') + '</h3>' +
              (memory.layer != null ? '<span class="layer-badge" aria-label="Layer ' + escapeHtml(String(memory.layer)) + '">Layer ' + escapeHtml(String(memory.layer)) + '</span>' : '') +
            '</header>' +
            '<p class="activity-description">' + escapeHtml(memory.content || '') + '</p>' +
            '<p class="activity-meta">Energy: ' + escapeHtml(memory.energy != null ? String(memory.energy) : '-') + ' · Hops: ' + escapeHtml(memory.hops != null ? String(memory.hops) : '-') + '</p>' +
          '</article>';
        }).join('');
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Memory index is temporarily unavailable.</div>';
      });
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = text != null ? text : '--';
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}());
