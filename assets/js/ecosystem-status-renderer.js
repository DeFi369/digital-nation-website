/* ecosystem-status-renderer.js */
(function () {
  'use strict';
  function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }
  function dot(status) {
    var c = '#34d399';
    if (status === 'scaffolding' || status === 'pre-v1.0') c = '#facc15';
    else if (status === 'active-release') c = '#7aa7ff';
    else if (status === 'experimental') c = '#f87171';
    return '<span class="status-dot" style="background:' + c + ';box-shadow:0 0 8px ' + c + '"></span> ' + esc(status);
  }
  function buildCard(title, body) { return '<div class="card"><h3>' + esc(title) + '</h3><div>' + (body || '') + '</div></div>'; }
  function buildKV(rows) { return rows.map(function (r) { return '<p><strong>' + esc(r[0]) + ':</strong> ' + esc(r[1]) + '</p>'; }).join(''); }
  function init() {
    var base = (document.querySelector('base[href]') ? document.querySelector('base[href]').getAttribute('href') : './');
    if (base && !base.endsWith('/')) base = base + '/';
    var root = base || './';
    Promise.all([
      fetch(root + 'assets/data/ecosystem-status.json', { mode: 'cors' }).then(function (r) { return r.ok ? r.json() : {}; }),
      fetch(root + 'assets/data/metrics.json', { mode: 'cors' }).then(function (r) { return r.ok ? r.json() : {}; })
    ]).then(function (results) {
      var eco = results[0] || {};
      var metrics = results[1] || {};
      set('site-status', buildCard('Website Status', buildKV([
        ['AEP', eco.aepVersion || '—'],
        ['dynAEP', eco.dynaepVersion || '—'],
        ['GAP', eco.gapStatus || '—'],
        ['Status', eco.status || '—'],
        ['Pages', String(eco.site && eco.site.pageCount || eco.metrics && eco.metrics.pageCount || '—')]
      ])));
      set('ecosystem-components', (eco.components || []).map(function (c) {
        return '<div class="activity-item activity-governance"><div class="activity-label">' + esc(c.name || c.id) + '</div><div class="activity-meta"><span class="activity-type">' + esc(c.fullName || c.id) + '</span><span class="activity-divider" aria-hidden="true"></span><span>v' + esc(c.version) + '</span><span class="activity-divider" aria-hidden="true"></span><span>' + esc(c.stage || c.status || '—') + '</span></div></div>';
      }).join('') || '<p class="activity-empty">No components loaded.</p>');
      set('ecosystem-metrics', buildCard('Ecosystem Metrics', buildKV([
        ['Members', String(eco.metrics && eco.metrics.members || '—')],
        ['Pages', String(eco.metrics && eco.metrics.pageCount || eco.site && eco.site.pageCount || '—')],
        ['Protocol', esc(eco.metrics && eco.metrics.protocolVersion || eco.aepVersion || '—')]
      ])));
      set('verified-identities', (eco.verifiedIdentities || []).map(function (id) {
        return '<div class="card"><h3>' + esc(id.name || id.id || 'Unknown') + '</h3><p>' + esc(id.role || id.type || 'Agent') + '</p>' + (id.pubkey ? '<p><code>' + esc(id.pubkey.slice(0, 16)) + '...</code></p>' : '') + '</div>';
      }).join('') || '<p class="activity-empty">No identities loaded.</p>');
      set('verification-feed', (eco.verifiedIdentities || []).map(function (id) {
        return '<div class="activity-item activity-governance"><div class="activity-label">' + esc(id.name || id.id || 'Unknown') + '</div><div class="activity-meta"><span class="activity-type">' + esc(id.role || id.type || 'Agent') + '</span></div><div class="activity-state">' + dot('active') + '</div></div>';
      }).join('') || '');
      set('quantum-status', buildCard('Quantum Compute Signal', buildKV([
        ['Available', eco.quantum && eco.quantum.available === true ? 'Yes' : eco.quantum && eco.quantum.available === false ? 'No' : '—'],
        ['Mode', esc(eco.quantum && eco.quantum.mode || '—')],
        ['Note', esc(eco.quantum && eco.quantum.note || eco.quantum && eco.quantum.summary || '—')]
      ])));
      set('citizen-attestation', '<p>' + esc(eco.citizenAttestation || eco.citizenBenefits || 'No attestation text available.') + '</p>');
      set('provenance-attestation', (eco.attestation && Object.keys(eco.attestation).length) ? buildCard('Data Provenance & Attestation', buildKV(Object.keys(eco.attestation).map(function (k) { return [k, esc(String(eco.attestation[k]))]; }))) : '<p class="activity-empty">No attestation data loaded.</p>');
      set('ecosystem-cross-references', (Array.isArray(eco.crossRepoPages) && eco.crossRepoPages.length) ? '<div class="activity-list">' + eco.crossRepoPages.map(function (p) { return '<div class="activity-item activity-governance"><div class="activity-label">' + esc(p) + '</div></div>'; }).join('') + '</div>' : '<p class="activity-empty">No cross-references loaded.</p>');
    }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
