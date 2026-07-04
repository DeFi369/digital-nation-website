(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    renderStack();
    renderMetrics();
    renderAttestation();
    renderVerifiedIdentities();
    renderQuantumStatus();
    renderBenefits();
  }

  function renderStack() {
    var container = document.getElementById('protocol-stack');
    if (!container) return;
    fetch('assets/data/protocol-data.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var stacks = Array.isArray(data.stacks) ? data.stacks : [];
        container.innerHTML = stacks.map(function (stack) {
          var highlights = Array.isArray(stack.highlights) ? stack.highlights.map(function (h) {
            return '<li>' + escapeHtml(h) + '</li>';
          }).join('') : '';

          return '<article class="activity-item protocol-stack">' +
            '<header class="activity-header">' +
              '<h3 class="activity-title">' + escapeHtml(stack.name || '') + '</h3>' +
              '<span class="activity-meta">' + escapeHtml(String(stack.version || '')) + '</span>' +
            '</header>' +
            '<p class="activity-description">' + escapeHtml(String(stack.summary || '')) + '</p>' +
            (highlights ? '<ul class="protocol-highlights">' + highlights + '</ul>' : '') +
          '</article>';
        }).join('');
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Protocol stack data is temporarily unavailable.</div>';
      });
  }

  function renderMetrics() {
    var container = document.getElementById('protocol-metrics');
    if (!container) return;
    fetch('assets/data/protocol-data.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var metrics = data.metrics || {};
        var items = [
          { label: 'AEP Version', value: metrics.aepVersion || '-' },
          { label: 'dynAEP Version', value: metrics.dynaepVersion || '-' },
          { label: 'GAP Status', value: metrics.gapStatus || '-' },
          { label: 'Conformance', value: metrics.conformanceStatus || '-' },
          { label: 'Signatures', value: metrics.signatureStatus || '-' },
          { label: 'Last Audit', value: metrics.lastAudit || '-' }
        ];
        container.innerHTML = items.map(function (item) {
          return '<div class="stat">' +
            '<span class="stat-value">' + escapeHtml(String(item.value)) + '</span>' +
            '<span class="stat-label">' + escapeHtml(String(item.label)) + '</span>' +
          '</div>';
        }).join('');
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Protocol metrics are temporarily unavailable.</div>';
      });
  }

  function renderBenefits() {
    var container = document.getElementById('protocol-benefits');
    if (!container) return;
    fetch('assets/data/protocol-data.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var benefits = Array.isArray(data.citizenBenefits) ? data.citizenBenefits : [];
        container.innerHTML = benefits.map(function (benefit) {
          return '<li>' + escapeHtml(benefit) + '</li>';
        }).join('');
      })
      .catch(function () {
        container.innerHTML = '<li class="activity-empty">Benefit data is temporarily unavailable.</li>';
      });
  }

  function renderQuantumStatus() {
    var container = document.getElementById('quantum-status');
    if (!container) return;
    fetch('assets/data/protocol-data.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var q = data.quantum || {};
        if (!q.available) {
          container.innerHTML = '<div class="activity-empty">Quantum compute signal is not available yet.</div>';
          return;
        }
        var items = [
          { label: 'Quantum Layer', value: q.collapseChosenLattice || '-' },
          { label: 'Normalized Total', value: q.afterNormalizeTotal != null ? String(q.afterNormalizeTotal) : '-' },
          { label: 'Booster Phase', value: q.boosterPhaseReady ? 'Ready' : 'Not ready' }
        ];
        container.innerHTML = items.map(function (item) {
          return '<div class="stat">' +
            '<span class="stat-value">' + escapeHtml(String(item.value)) + '</span>' +
            '<span class="stat-label">' + escapeHtml(String(item.label)) + '</span>' +
          '</div>';
        }).join('');
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Quantum status is temporarily unavailable.</div>';
      });
  }

  function renderAttestation() {
    var container = document.getElementById('protocol-attestation');
    if (!container) return;
    fetch('assets/data/protocol-data.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var metrics = data.metrics || {};
        var manifestCount = metrics.identityManifestCount || 0;
        var keyCount = metrics.identityKeyCount || 0;
        var signatureStatus = metrics.signatureStatus || 'pre-v1.0';
        var items = [
          { label: 'Verified Profiles', value: String(manifestCount) },
          { label: 'Identity Keys', value: String(keyCount) },
          { label: 'Signature Status', value: signatureStatus }
        ];
        container.innerHTML = items.map(function (item) {
          return '<div class="stat">' +
            '<span class="stat-value">' + escapeHtml(String(item.value)) + '</span>' +
            '<span class="stat-label">' + escapeHtml(String(item.label)) + '</span>' +
          '</div>';
        }).join('');
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Protocol attestation is temporarily unavailable.</div>';
      });
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderVerifiedIdentities() {
    var container = document.getElementById('verified-identities');
    if (!container) {
      return;
    }
    fetch('assets/data/protocol-data.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var names = Array.isArray(data.verifiedIdentities) ? data.verifiedIdentities : [];
        if (!names.length) {
          container.innerHTML = '<div class="activity-empty">No verified identities yet.</div>';
          return;
        }
        var html = '<ul class="identity-list">';
        names.forEach(function (name) {
          html += '<li class="identity-item">' + escapeHtml(String(name)) + '</li>';
        });
        html += '</ul>';
        container.innerHTML = html;
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Identity data is temporarily unavailable.</div>';
      });
  }
}());
