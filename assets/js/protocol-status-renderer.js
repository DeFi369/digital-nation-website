/* protocol-status-renderer.js */
(function () {
  'use strict';
  function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function dot(status) {
    var c = '#34d399';
    if (status === 'active') c = '#34d399';
    else if (status === 'scaffolding' || status === 'pre-v1.0') c = '#facc15';
    else if (status === 'active-release') c = '#7aa7ff';
    else if (status === 'experimental') c = '#f87171';
    return '<span class="status-dot" style="background:' + c + ';box-shadow:0 0 8px ' + c + '"></span> ' + esc(status);
  }
  function set(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }
  function init() {
    var base = (document.querySelector('base[href]') ? document.querySelector('base[href]').getAttribute('href') : './');
    if (base && !base.endsWith('/')) base = base + '/';
    var root = base || './';
    fetch(root + 'assets/data/protocol-data.json', { mode: 'cors' })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (data) {
        var stacks = data.stacks || [];
        set('protocol-stack', stacks.map(function (s) {
          return '<div class="activity-item activity-governance"><div><div class="activity-label">' + esc(s.name || s.id) + '</div><div class="activity-meta"><span class="activity-type">' + esc(s.fullName || s.id) + '</span><span class="activity-divider" aria-hidden="true"></span><span>v' + esc(s.version) + '</span><span class="activity-divider" aria-hidden="true"></span><span>' + esc(s.status) + '</span></div>' + (s.summary ? '<div style="margin-top:6px;color:rgba(230,232,235,0.85)">' + esc(s.summary.slice(0, 180)) + '</div>' : '') + '</div><div class="activity-state">' + dot(s.status) + '</div></div>';
        }).join('') || '<p class="activity-empty">No protocol stacks loaded.</p>');
        var m = data.metrics || {};
        set('protocol-metrics', '<div class="stats-grid">' + [
          ['Protocol', m.protocolVersion || '—'],
          ['AEP', m.aepVersion || '—'],
          ['dynAEP', m.dynaepVersion || '—'],
          ['GAP', m.gapStatus || '—'],
          ['Conformance', m.conformanceStatus || '—'],
          ['Signatures', m.signatureStatus || '—'],
          ['Known Issues', String(m.knownIssueCount || '—')],
          ['Total Components', String(m.totalComponents || '—')],
          ['Pages', String(m.pageCount || '—')],
          ['Identities', String(m.identityManifestCount || '—')]
        ].map(function (r) { return '<div class="card"><h3>' + esc(r[0]) + '</h3><p>' + esc(r[1]) + '</p></div>'; }).join('') + '</div>');
        set('verified-identities', (data.verifiedIdentities || []).map(function (id) {
          return '<div class="card"><h3>' + esc(id.name || id.id) + '</h3><p>' + esc(id.role || id.type || 'Agent') + '</p>' + (id.pubkey ? '<p><code>' + esc(id.pubkey.slice(0, 24)) + '...</code></p>' : '') + '</div>';
        }).join('') || '<p class="activity-empty">No verified identities loaded.</p>');
        set('quantum-status', '<div class="stats-grid"><div class="card"><h3>Quantum Compute</h3><p>Available: ' + (data.quantum && data.quantum.available === true ? 'Yes' : data.quantum && data.quantum.available === false ? 'No' : '—') + '</p><p>Mode: ' + (data.quantum && data.quantum.mode ? '<code>' + esc(data.quantum.mode) + '</code>' : '—') + '</p>' + (data.quantum && data.quantum.note ? '<p>' + esc(data.quantum.note.slice(0, 200)) + '</p>' : '') + '</div></div>');
        set('protocol-live-services', (data.services && Object.keys(data.services).length) ? '<div class="stats-grid">' + Object.keys(data.services).map(function (k) { return '<div class="card"><h3>' + esc(k) + '</h3><p>' + esc(data.services[k].status || '—') + '</p></div>'; }).join('') + '</div>' : '<p class="activity-empty">No services loaded.</p>');
        set('protocol-benefits', (data.citizenBenefits || []).map(function (b) { return '<div class="activity-item activity-governance"><div class="activity-label">' + esc(b.text || b.title || b) + '</div></div>'; }).join('') || '<p class="activity-empty">No benefits loaded.</p>');
        var xref = data.repoCrossReferences || {};
        set('protocol-cross-references', (xref && xref.edgeCount) ? '<div class="stats-grid"><div class="card"><h3>Cross-References</h3><p>' + esc(String(xref.edgeCount)) + ' edges</p></div></div>' : '<p class="activity-empty">No cross-references loaded.</p>');
        set('protocol-conformance', m.conformanceEvidence ? '<div class="stats-grid"><div class="card"><h3>Conformance</h3><p>' + esc(m.conformanceEvidence.summaryLine || '—') + '</p></div></div>' : '<p class="activity-empty">Conformance evidence requires metrics.conformanceEvidence.</p>');
        set('protocol-repo-validation', m.repoValidationTotalRepos ? '<div class="stats-grid"><div class="card"><h3>Repo Validation</h3><p>' + esc(String(m.repoValidationTotalRepos)) + ' repos validated</p></div></div>' : '<p class="activity-empty">Repo validation requires metrics.repoValidation* fields.</p>');
        set('protocol-aep-gap-validation', data.aepGapValidation ? '<div class="stats-grid"><div class="card"><h3>AEP/GAP Validation</h3><p>' + esc(data.aepGapValidation.status || '—') + '</p></div></div>' : '<p class="activity-empty">AEP/GAP validation requires data.aepGapValidation.</p>');
        set('protocol-attestation', (data.attestation && Object.keys(data.attestation).length) ? '<div class="stats-grid"><div class="card"><h3>Attestation</h3>' + Object.keys(data.attestation).map(function (k) { return '<p><strong>' + esc(k) + ':</strong> ' + esc(String(data.attestation[k])) + '</p>'; }).join('') + '</div></div>' : '<p class="activity-empty">No attestation data loaded.</p>');
      })
      .catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
