(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    renderAttestation();
  }

  function renderAttestation() {
    var container = document.getElementById('protocol-attestation');
    if (!container) return;
    fetch('assets/data/protocol-data.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var identity = data.identityManifestCount || 0;
        var keys = data.identityKeyCount || 0;
        var status = identity > 0 && keys > 0 ? 'VERIFIED' : 'UNAVAILABLE';
        var statusClass = identity > 0 && keys > 0 ? 'status-active' : 'status-unknown';

        container.innerHTML = (
          '<div class="stats-grid">' +
            '<div class="card">' +
              '<h3>Identity Manifests</h3>' +
              '<p>' + escapeHtml(String(identity)) + ' verified agent identities</p>' +
            '</div>' +
            '<div class="card">' +
              '<h3>Key Material</h3>' +
              '<p>' + escapeHtml(String(keys)) + ' public keys</p>' +
            '</div>' +
            '<div class="card">' +
              '<h3>Attestation Status</h3>' +
              '<p><span class="status-dot ' + escapeHtml(statusClass) + '" aria-hidden="true"></span>' + escapeHtml(status) + '</p>' +
            '</div>' +
          '</div>'
        );
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Protocol attestation data is temporarily unavailable.</div>';
      });
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}());
