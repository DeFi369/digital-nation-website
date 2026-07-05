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
      .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error('HTTP ' + res.status)); })
      .then(function (data) {
        var attestation = data.attestation || {};
        var trustValid = attestation.trustBundleValid;
        var trustRoot = attestation.trustBundleRoot || 'unknown';
        var trustExpiry = attestation.trustBundleExpiry || 'unknown';
        var sigVerified = attestation.signaturesVerified || 0;
        var sigTotal = attestation.signaturesTotal || 0;
        var sigCoverage = attestation.signatureCoverage || '0%';
        var lastVerified = attestation.lastVerification || 'never';
        
        var status = trustValid && sigVerified > 0 ? 'VERIFIED' : 'UNAVAILABLE';
        var statusClass = trustValid && sigVerified > 0 ? 'status-active' : 'status-unknown';

        container.innerHTML = (
          '<div class="stats-grid">' +
            '<div class="card">' +
              '<h3>Trust Bundle</h3>' +
              '<p>Root: ' + escapeHtml(trustRoot) + '</p>' +
              '<p>Expiry: ' + escapeHtml(trustExpiry) + '</p>' +
              '<p>Status: <span class="status-dot ' + escapeHtml(trustValid ? 'status-active' : 'status-error') + '" aria-hidden="true"></span>' + escapeHtml(trustValid ? 'VALID' : 'INVALID') + '</p>' +
            '</div>' +
            '<div class="card">' +
              '<h3>Signatures Verified</h3>' +
              '<p>' + escapeHtml(String(sigVerified)) + ' / ' + escapeHtml(String(sigTotal)) + ' (' + escapeHtml(sigCoverage) + ')</p>' +
              '<p>Status: <span class="status-dot ' + escapeHtml(sigVerified === sigTotal && sigTotal > 0 ? 'status-active' : 'status-warning') + '" aria-hidden="true"></span>' + escapeHtml(sigVerified === sigTotal && sigTotal > 0 ? 'FULL' : 'PARTIAL') + '</p>' +
            '</div>' +
            '<div class="card">' +
              '<h3>Last Verification</h3>' +
              '<p>' + escapeHtml(lastVerified) + '</p>' +
            '</div>' +
            '<div class="card">' +
              '<h3>Overall Attestation</h3>' +
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
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, "'");
  }
})();