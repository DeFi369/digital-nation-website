(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    renderStatusPage();
  }

  function renderStatusPage() {
    var site = document.getElementById('site-status');
    if (site) {
      fetch('assets/data/ecosystem-status.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
          renderSiteStatus(site, data);
        })
        .catch(function () {
          site.innerHTML = '<div class="activity-empty">Site status is temporarily unavailable.</div>';
        });
    }

    var components = document.getElementById('ecosystem-components');
    if (components) {
      fetch('assets/data/ecosystem-status.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
          renderComponents(components, data);
        })
        .catch(function () {
          components.innerHTML = '<div class="activity-empty">Component status is temporarily unavailable.</div>';
        });
    }

    var metrics = document.getElementById('ecosystem-metrics');
    if (metrics) {
      fetch('assets/data/ecosystem-status.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
          renderMetrics(metrics, data);
        })
        .catch(function () {
          metrics.innerHTML = '<div class="activity-empty">Metrics are temporarily unavailable.</div>';
        });
    }

    var attestation = document.getElementById('citizen-attestation');
    if (attestation) {
      fetch('assets/data/ecosystem-status.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
          attestation.textContent = data.citizenAttestation || '';
        })
        .catch(function () {
          attestation.textContent = '';
        });
    }

    var identities = document.getElementById('verified-identities');
    if (identities) {
      fetch('assets/data/ecosystem-status.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
          renderVerifiedIdentities(identities, data);
        })
        .catch(function () {
          identities.innerHTML = '<div class="activity-empty">Verified identity data is temporarily unavailable.</div>';
        });
    }

    var quantum = document.getElementById('quantum-status');
    if (quantum) {
      fetch('assets/data/ecosystem-status.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
          renderQuantumStatus(quantum, data);
        })
        .catch(function () {
          quantum.innerHTML = '<div class="activity-empty">Quantum status is temporarily unavailable.</div>';
        });
    }
  }

  function renderSiteStatus(container, data) {
    var site = data.site || {};
    var items = [
      { label: 'Website Pages', value: site.pageCount || '-' },
      { label: 'Latest Commit', value: site.latestCommit || '-' },
      { label: 'Latest Commit Date', value: site.latestCommitDate || '-' },
      { label: 'Phase 7', value: site.phase7Status || '-' },
      { label: 'Phase 8', value: site.phase8Status || '-' },
      { label: 'Protocol Page', value: site.protocolPageStatus || '-' }
    ];

    container.innerHTML = items.map(function (item) {
      return '<div class="stat">' +
        '<span class="stat-value">' + escapeHtml(String(item.value)) + '</span>' +
        '<span class="stat-label">' + escapeHtml(String(item.label)) + '</span>' +
      '</div>';
    }).join('');
  }

  function renderComponents(container, data) {
    var components = Array.isArray(data.components) ? data.components : [];
    if (!components.length) {
      container.innerHTML = '<div class="activity-empty">No protocol components reported.</div>';
      return;
    }

    container.innerHTML = components.map(function (component) {
      var highlights = Array.isArray(component.knownIssues) ? component.knownIssues.map(function (issue) {
        return '<li>' + escapeHtml(issue) + '</li>';
      }).join('') : '';

      return '<article class="activity-item protocol-stack">' +
        '<header class="activity-header">' +
          '<h3 class="activity-title">' + escapeHtml(component.name || '') + '</h3>' +
          '<span class="activity-meta">' + escapeHtml(String(component.version || '')) + ' / ' + escapeHtml(String(component.stage || '')) + '</span>' +
        '</header>' +
        '<p class="activity-description">' + escapeHtml(String(component.summary || '')) + '</p>' +
        (highlights ? '<details class="protocol-details"><summary class="protocol-details-summary">Known issues</summary><ul>' + highlights + '</ul></details>' : '') +
        '<p class="activity-meta">Last updated: ' + escapeHtml(String(component.lastUpdated || '')) + '</p>' +
      '</article>';
    }).join('');
  }

  function renderMetrics(container, data) {
    var metrics = data.metrics || {};
    var items = [
      { label: 'AEP Version', value: metrics.aepVersion || '-' },
      { label: 'dynAEP Version', value: metrics.dynaepVersion || '-' },
      { label: 'GAP Status', value: metrics.gapStatus || '-' },
      { label: 'Conformance', value: metrics.conformanceStatus || '-' },
      { label: 'Signatures', value: metrics.signatureStatus || '-' },
      { label: 'Known Issues', value: metrics.knownIssueCount || '-' },
      { label: 'Last Audit', value: metrics.lastAudit || '-' }
    ];

    container.innerHTML = items.map(function (item) {
      return '<div class="stat">' +
        '<span class="stat-value">' + escapeHtml(String(item.value)) + '</span>' +
        '<span class="stat-label">' + escapeHtml(String(item.label)) + '</span>' +
      '</div>';
    }).join('');
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderVerifiedIdentities(container, data) {
    var metrics = data.metrics || {};
    var manifestCount = metrics.identityManifestCount || 0;
    var keyCount = metrics.identityKeyCount || 0;
    var label = manifestCount ? 'Verified Agent Identities' : 'Verified Agent Identities';
    var value = manifestCount ? manifestCount + ' verified manifest(s), ' + keyCount + ' key pair(s)' : 'No verified identities yet';
    container.innerHTML = '<div class="stat">' +
      '<span class="stat-value">' + escapeHtml(String(manifestCount)) + '</span>' +
      '<span class="stat-label">' + escapeHtml(String(label)) + '</span>' +
      '</div>' +
      '<div class="stat">' +
      '<span class="stat-value">' + escapeHtml(String(keyCount)) + '</span>' +
      '<span class="stat-label">Identity Key Pairs</span>' +
      '</div>' +
      '<div class="activity-item">' +
      '<p>' + escapeHtml(value) + '</p>' +
      '</div>';
  }

  function renderQuantumStatus(container, data) {
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
  }
}());
