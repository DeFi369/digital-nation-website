(function() {
  'use strict';
  function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }
  function buildCard(title, body) { return '<div class="card"><h3>' + esc(title) + '</h3>' + body + '</div>'; }
  function buildKV(rows) { return rows.map(function(r) { return '<p><strong>' + esc(r[0]) + ':</strong> ' + esc(r[1]) + '</p>'; }).join(''); }
  function dot(status) {
    var c = '#34d399';
    if (status === 'active') c = '#34d399';
    else if (status === 'scaffolding' || status === 'pre-v1.0') c = '#facc15';
    else if (status === 'active-release') c = '#7aa7ff';
    else if (status === 'experimental') c = '#f87171';
    return '<span class="status-dot" style="background:' + c + ';box-shadow:0 0 8px ' + c + '"></span>';
  }
  function loadJSON(path, fallback) {
    return fetch(path, { mode: 'cors' }).then(function(r) { return r.ok ? r.json() : fallback; }).catch(function() { return fallback; });
  }
  function init() {
    var base = (document.querySelector('base[href]') ? document.querySelector('base[href]').getAttribute('href') : './');
    if (base && !base.endsWith('/')) base = base + '/';
    var root = base || './';
    loadJSON(root + 'assets/data/ecosystem-status.json', {}).then(function(data) {
      renderSiteStatus(data);
      renderComponents(data);
      renderMetrics(data);
      renderIdentities(data);
      renderQuantum(data);
      renderAttestation(data);
      renderCitizenAttestation(data);
      renderCrossReferences(data);
    });
    loadJSON(root + 'assets/data/metrics.json', {}).then(function(m) {
      if (m && m.protocolVersion) {
        var el = document.getElementById('ecosystem-metrics');
        if (el) {
          el.innerHTML = '<div class="stats-grid"><div class="card"><h3>Protocol Version</h3><p>' + esc(m.protocolVersion) + '</p></div></div>';
        }
      }
    });
  }
  function renderSiteStatus(data) {
    var rows = [
      ['AEP', data.aepVersion || '—'],
      ['dynAEP', data.dynaepVersion || '—'],
      ['GAP', data.gapStatus || '—'],
      ['Status', data.status || '—']
    ];
    set('site-status', buildCard('Protocol Status', buildKV(rows)));
  }
  function renderComponents(data) {
    var comps = data.components || [];
    var html = comps.map(function(c) { return '<div class="activity-item activity-governance"><div class="activity-label">' + esc(c) + '</div></div>'; }).join('');
    set('ecosystem-components', html || '<p class="activity-empty">No components loaded.</p>');
  }
  function renderMetrics(data) {
    var m = data.metrics || {};
    var rows = [
      ['Members', String(m.members || '—')],
      ['Pages', String(m.pageCount || '—')],
      ['Protocol', m.protocolVersion || '—']
    ];
    set('ecosystem-metrics', buildCard('Ecosystem Metrics', buildKV(rows)));
  }
  function renderIdentities(data) {
    var ids = data.verifiedIdentities || [];
    var html = ids.map(function(id) { return '<div class="card"><h3>' + esc(id.name || id.id) + '</h3><p>' + esc(id.role || id.type || 'Agent') + '</p></div>'; }).join('');
    set('verified-identities', html || '<p class="activity-empty">No identities loaded.</p>');
    set('verification-feed', html || '');
  }
  function renderQuantum(data) {
    var q = (data && data.quantum) || {};
    var rows = [['Available', q.available === true ? 'Yes' : q.available === false ? 'No' : '—'], ['Mode', esc(q.mode || '—')], ['Note', esc(q.note || q.summary || '—')]];
    set('quantum-status', buildCard('Quantum Compute Signal', buildKV(rows)));
  }
  function renderAttestation(data) {
    var a = (data && data.attestation) || {};
    if (!Object.keys(a).length) { set('provenance-attestation', '<p class="activity-empty">No attestation data loaded.</p>'); return; }
    var rows = Object.keys(a).map(function(k) { return [k, esc(String(a[k]))]; });
    set('provenance-attestation', buildCard('Data Provenance & Attestation', buildKV(rows)));
  }
  function renderCitizenAttestation(data) {
    if (!data) { set('citizen-attestation', '<p class="activity-empty">Attestation unavailable.</p>'); return; }
    var text = data.citizenAttestation || data.citizenBenefits || 'No attestation text available.';
    set('citizen-attestation', '<p>' + esc(text) + '</p>');
  }
  function renderCrossReferences(data) {
    if (!data || !Array.isArray(data.crossRepoPages)) {
      set('ecosystem-cross-references', '<p class="activity-empty">No cross-references loaded.</p>'); return;
    }
    var items = data.crossRepoPages.map(function(p) {
      return '<div class="activity-item activity-governance"><div class="activity-label">' + esc(p) + '</div></div>';
    }).join('');
    set('ecosystem-cross-references', '<div class="activity-list">' + items + '</div>');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
