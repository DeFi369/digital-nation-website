(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function renderRepoValidation() {
    var container = document.getElementById('protocol-repo-validation');
    if (!container) return;
    fetch('assets/data/protocol-data.json')
      .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error('HTTP ' + res.status)); })
      .then(function (data) {
        var metrics = data.metrics || {};
        var totalRepos = typeof metrics.repoValidationTotalRepos === 'number' ? metrics.repoValidationTotalRepos : null;
        var reposWithTests = typeof metrics.repoValidationReposWithTests === 'number' ? metrics.repoValidationReposWithTests : null;
        var reposWithCI = typeof metrics.repoValidationReposWithCI === 'number' ? metrics.repoValidationReposWithCI : null;
        var totalEdges = typeof metrics.repoValidationTotalEdges === 'number' ? metrics.repoValidationTotalEdges : null;
        var topTargets = Array.isArray(metrics.repoValidationTopIntegrationTargets) ? metrics.repoValidationTopIntegrationTargets.slice(0, 8) : [];
        var hasData = [totalRepos, totalEdges, topTargets.length].some(function(v){ return v !== null && v !== undefined; });
        if (!hasData) {
          container.innerHTML = '<div class="activity-empty">No repository validation data is available yet.</div>';
          return;
        }
        container.innerHTML = (
          '<div class="stats-grid">' +
            '<div class="card">' +
              '<h3>Repos Validated</h3>' +
              '<p>' + escapeHtml(String(totalRepos != null ? totalRepos : '-')) + '</p>' +
            '</div>' +
            '<div class="card">' +
              '<h3>Test Coverage</h3>' +
              '<p>' + escapeHtml(String(reposWithTests != null ? reposWithTests : '-')) + ' repos with tests</p>' +
              '<p>' + escapeHtml(String(reposWithCI != null ? reposWithCI : '-')) + ' repos with CI</p>' +
            '</div>' +
            '<div class="card">' +
              '<h3>Cross-Repo Edges</h3>' +
              '<p>' + escapeHtml(String(totalEdges != null ? totalEdges : '-')) + '</p>' +
            '</div>' +
            '<div class="card">' +
              '<h3>Top Integration Targets</h3>' +
              (topTargets.length ? '<ul class="activity-list">' + topTargets.map(function(t){ return '<li>' + escapeHtml(String(t)) + '</li>'; }).join('') + '</ul>' : '<p class="activity-empty">No targets available.</p>') +
            '</div>' +
          '</div>'
        );
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Repository validation data is temporarily unavailable.</div>';
      });
  }

  function renderConformanceEvidence() {
    var container = document.getElementById('protocol-conformance');
    if (!container) return;
    fetch('assets/data/protocol-data.json')
      .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error('HTTP ' + res.status)); })
      .then(function (data) {
        var metrics = data.metrics || {};
        var evidence = data.conformanceEvidence || {};
        var passed = typeof evidence.passedCount === 'number' ? evidence.passedCount : (typeof metrics.conformancePassedCount === 'number' ? metrics.conformancePassedCount : null);
        var failed = typeof evidence.failedCount === 'number' ? evidence.failedCount : (typeof metrics.conformanceFailedCount === 'number' ? metrics.conformanceFailedCount : null);
        var summary = evidence.summaryLine || metrics.conformanceSummary || '';
        var generated = evidence.generatedAt || metrics.conformanceEvidenceGeneratedAt || '';
        var checks = Array.isArray(evidence.checks) ? evidence.checks.slice(0, 8) : [];
        if (passed === null && failed === null && !summary && !checks.length) {
          container.innerHTML = '<div class="activity-empty">No conformance evidence is available yet.</div>';
          return;
        }
        var statusClass = (failed === 0 || failed === null) ? 'status-active' : 'status-error';
        var statusText = (failed === 0 || failed === null) ? 'PASS' : 'FAIL';
        container.innerHTML = (
          '<div class="stats-grid">' +
            '<div class="card">' +
              '<h3>Latest Result</h3>' +
              '<p><span class="status-dot ' + escapeHtml(statusClass) + '" aria-hidden="true"></span>' + escapeHtml(String(statusText)) + '</p>' +
              '<p>' + escapeHtml(String(passed != null ? passed : '-')) + ' passed / ' + escapeHtml(String(failed != null ? failed : '-')) + ' failed</p>' +
              (summary ? '<p>' + escapeHtml(String(summary)) + '</p>' : '') +
            '</div>' +
            '<div class="card">' +
              '<h3>Evidence Age</h3>' +
              '<p>' + escapeHtml(String(generated || 'unknown')) + '</p>' +
            '</div>' +
            '<div class="card">' +
              '<h3>Check Sample</h3>' +
              (checks.length ? '<ul class="activity-list">' + checks.slice(0, 6).map(function (c) { return '<li>' + escapeHtml(String(c)) + '</li>'; }).join('') + '</ul>' : '<p class="activity-empty">No sample checks available.</p>') +
            '</div>' +
            '<div class="card">' +
              '<h3>Next Run</h3>' +
              '<p>Refresh with:</p>' +
              '<code>python3 /home/user/.hermes/scripts/refresh-protocol-evidence.py</code>' +
            '</div>' +
          '</div>'
        );
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Conformance evidence is temporarily unavailable.</div>';
      });
  }

  function renderRepoCrossReferences() {
    var container = document.getElementById('protocol-cross-references');
    if (!container) return;
    fetch('assets/data/protocol-data.json')
      .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error('HTTP ' + res.status)); })
      .then(function (data) {
        var xref = data.repoCrossReferences || {};
        var topIn = Array.isArray(xref.topInboundReferences) ? xref.topInboundReferences.slice(0, 8) : [];
        var topOut = Array.isArray(xref.topOutboundReferences) ? xref.topOutboundReferences.slice(0, 8) : [];
        var samples = Array.isArray(xref.samples) ? xref.samples.slice(0, 6) : [];
        var edgeCount = typeof xref.edgeCount === 'number' ? xref.edgeCount : 0;
        if (!edgeCount && !topIn.length && !topOut.length) {
          container.innerHTML = '<div class="activity-empty">No repository cross-reference evidence is available yet.</div>';
          return;
        }
        var buildList = function (items, labelKey) {
          if (!items.length) return '';
          var lis = items.map(function (item) {
            var repo = escapeHtml(String(item[labelKey] || item.repo || ''));
            var count = typeof item.count === 'number' ? item.count : (typeof item.references === 'number' ? item.references : '');
            return '<li><strong>' + repo + '</strong> — ' + escapeHtml(String(count)) + '</li>';
          }).join('');
          return '<ul class="activity-list">' + lis + '</ul>';
        };
        container.innerHTML = (
          '<div class="stats-grid">' +
            '<div class="card">' +
              '<h3>Top Inbound References</h3>' +
              (topIn.length ? buildList(topIn, 'repo') : '<p class="activity-empty">No inbound references found.</p>') +
            '</div>' +
            '<div class="card">' +
              '<h3>Top Outbound References</h3>' +
              (topOut.length ? buildList(topOut, 'repo') : '<p class="activity-empty">No outbound references found.</p>') +
            '</div>' +
            '<div class="card">' +
              '<h3>Sample Edges</h3>' +
              (samples.length ? '<ul class="activity-list">' + samples.map(function (s) {
                return '<li>' + escapeHtml(String(s.source || '')) + ' → ' + escapeHtml(String(s.target || '')) + (s.path ? ' <span class="activity-meta">(' + escapeHtml(String(s.path)) + ')</span>' : '') + '</li>';
              }).join('') + '</ul>' : '<p class="activity-empty">No sample edges available.</p>') +
            '</div>' +
            '<div class="card">' +
              '<h3>Total Referenced Edges</h3>' +
              '<p>' + escapeHtml(String(edgeCount)) + '</p>' +
            '</div>' +
          '</div>'
        );
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Repository cross-reference data is temporarily unavailable.</div>';
      });
  }

  function renderAttestation() {
    var container = document.getElementById('protocol-attestation');
    if (!container) return;
    Promise.all([
      fetch('assets/data/protocol-data.json').then(function (res) { return res.ok ? res.json() : Promise.reject(new Error('HTTP ' + res.status)); }),
      fetch('assets/data/attestation-status.json').then(function (res) { return res.ok ? res.json() : Promise.reject(new Error('HTTP ' + res.status)); })
    ]).then(function (results) {
      var protocol = results[0] || {};
      var attest = results[1] || {};
      var protoAttest = (protocol.attestation || {});
      var trustValid = !!attest.attestation && attest.attestation.trustBundleValid;
      var trustRoot = protoAttest.trustBundleRoot || attest.attestation && attest.attestation.trustBundleRoot || 'unknown';
      var trustExpiry = protoAttest.trustBundleExpiry || attest.attestation && attest.attestation.trustBundleExpiry || 'unknown';
      var sigVerified = protoAttest.signaturesVerified != null ? protoAttest.signaturesVerified : (attest.attestation && attest.attestation.signaturesVerified || 0);
      var sigTotal = protoAttest.signaturesTotal != null ? protoAttest.signaturesTotal : (attest.attestation && attest.attestation.signaturesTotal || 0);
      var sigCoverage = protoAttest.signatureCoverage || (sigTotal ? (sigVerified / sigTotal * 100).toFixed(0) + '%' : '0%');
      var lastVerified = protoAttest.lastVerification || (attest.generatedAt || 'never');
      var note = attest.attestation && attest.attestation.note ? attest.attestation.note : '';
      
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
            '<p>' + escapeHtml(String(sigVerified)) + ' / ' + escapeHtml(String(sigTotal)) + ' (' + escapeHtml(String(sigCoverage)) + ')</p>' +
            '<p>Status: <span class="status-dot ' + escapeHtml(sigVerified === sigTotal && sigTotal > 0 ? 'status-active' : 'status-warning') + '" aria-hidden="true"></span>' + escapeHtml(sigVerified === sigTotal && sigTotal > 0 ? 'FULL' : 'PARTIAL') + '</p>' +
          '</div>' +
          '<div class="card">' +
            '<h3>Last Verification</h3>' +
            '<p>' + escapeHtml(lastVerified) + '</p>' +
          '</div>' +
          '<div class="card">' +
            '<h3>Overall Attestation</h3>' +
            '<p><span class="status-dot ' + escapeHtml(statusClass) + '" aria-hidden="true"></span>' + escapeHtml(status) + '</p>' +
            (note ? '<p>' + escapeHtml(note) + '</p>' : '') +
          '</div>' +
        '</div>'
      );
    })
    .catch(function () {
      container.innerHTML = '<div class="activity-empty">Protocol attestation data is temporarily unavailable.</div>';
    });
  }

  function init() {
    renderAttestation();
    renderRepoCrossReferences();
    renderConformanceEvidence();
    renderRepoValidation();
    renderAepGapValidation();
    renderLiveServices();
  }

  function renderLiveServices() {
    var container = document.getElementById('protocol-live-services');
    if (!container) return;
    fetch('assets/data/protocol-data.json')
      .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error('HTTP ' + res.status)); })
      .then(function (data) {
        var services = data.services || {};
        var qbff = services.qbff || {};
        var guard = services.qbffIpGuard || {};
        var items = [];
        function addCard(title, status, detail) {
          items.push('<div class="stats-grid"><div class="card"><h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(status) + '</p><p>' + escapeHtml(detail || '') + '</p></div></div>');
        }
        addCard('QBFF Monitor', qbff.status || 'unknown', 'Timer: ' + (qbff.monitorTimer || ''));
        addCard('QBFF IP Guard', guard.status || 'unknown', 'Port ' + (guard.port || ''));
        addCard('Wave Service', services.wave || 'unknown', 'Front: 8095 | Back: 8080');
        addCard('OpenAgents Service', services.openagents || 'unknown', 'Front: 8096 | Back: 8082');
        container.innerHTML = items.join('');
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Live service data is temporarily unavailable.</div>';
      });
  }

  function renderAepGapValidation() {
    var container = document.getElementById('protocol-aep-gap-validation');
    if (!container) return;
    fetch('assets/data/protocol-data.json')
      .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error('HTTP ' + res.status)); })
      .then(function (data) {
        var metrics = data.metrics || {};
        var section = data.aepGapValidation || {};
        var summary = section.summary || {};
        var total = typeof summary.total === 'number' ? summary.total : (typeof metrics.aepGapValidationTotalPolicies === 'number' ? metrics.aepGapValidationTotalPolicies : null);
        var passed = typeof summary.passed === 'number' ? summary.passed : (typeof metrics.aepGapValidationPassed === 'number' ? metrics.aepGapValidationPassed : null);
        var failed = typeof summary.failed === 'number' ? summary.failed : (typeof metrics.aepGapValidationFailed === 'number' ? metrics.aepGapValidationFailed : null);
        var status = section.status || metrics.aepGapValidationStatus || '';
        var failures = Array.isArray(section.sampleFailures) ? section.sampleFailures.slice(0, 4) : [];
        var generated = section.generatedAt || '';
        if (total === null && !failures.length) {
          container.innerHTML = '<div class="activity-empty">No AEP↔GAP validation data is available yet.</div>';
          return;
        }
        var statusClass = (failed === 0 || failed === null) ? 'status-active' : 'status-error';
        var statusText = (failed === 0 || failed === null) ? 'PASS' : (status || 'FAIL');
        container.innerHTML = (
          '<div class="stats-grid">' +
            '<div class="card">' +
              '<h3>Validation Result</h3>' +
              '<p><span class="status-dot ' + escapeHtml(statusClass) + '" aria-hidden="true"></span>' + escapeHtml(String(statusText)) + '</p>' +
              '<p>' + escapeHtml(String(passed != null ? passed : '-')) + ' passed / ' + escapeHtml(String(failed != null ? failed : '-')) + ' failed</p>' +
              '<p>' + escapeHtml(String(total != null ? total : '-')) + ' policies checked</p>' +
            '</div>' +
            '<div class="card">' +
              '<h3>Evidence Age</h3>' +
              '<p>' + escapeHtml(String(generated || 'unknown')) + '</p>' +
            '</div>' +
            '<div class="card">' +
              '<h3>Sample Failures</h3>' +
              (failures.length ? '<ul class="activity-list">' + failures.map(function (f) { return '<li>' + escapeHtml(String(f.path || '')) + ' — ' + escapeHtml(String(f.error || '')) + '</li>'; }).join('') + '</ul>' : '<p class="activity-empty">No sample failures available.</p>') +
            '</div>' +
            '<div class="card">' +
              '<h3>Next Run</h3>' +
              '<p>Refresh with:</p>' +
              '<code>python3 /home/user/.hermes/scripts/refresh-protocol-evidence.py</code>' +
            '</div>' +
          '</div>'
        );
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">AEP↔GAP validation data is temporarily unavailable.</div>';
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