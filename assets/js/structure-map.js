(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    try {
      var iframe = document.querySelector('.map-frame iframe');
      if (!iframe) return;

      function loadMap() {
        if (iframe.getAttribute('data-loaded')) return;
        iframe.setAttribute('data-loaded', 'true');
        iframe.srcdoc = [
          '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Structure Map</title>',
          '<style>',
          ':root { --bg:#020617; --panel:#0f172a; --text:#e2e8f0; --muted:#94a3b8; --accent:#22d3ee; accent:#34d399; yellow:#fbbf24; orange:#fb923c; pink:#fb7185; }',
          'body{margin:0;background:radial-gradient(circle at top center,#082f49,#020617);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;}',
          'svg{display:block;width:100%;}',
          '</style>',
          '</head><body>',
          '<svg viewBox="0 0 1120 750" xmlns="http://www.w3.org/2000/svg">',
          '<defs><filter id="g" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="7" stdDeviation="9" flood-color="#000" flood-opacity="0.35"/></filter>',
          '<marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#22d3ee"/></marker>',
          '<marker id="arrowdash" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#fb923c"/></marker>',
          '<marker id="arrowyellow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#fbbf24"/></marker>',
          '<marker id="arrowpink" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#fb7185"/></marker>',
          '</defs>',
          '<g transform="translate(430,30)"><rect x="0" y="0" width="260" height="88" rx="12" fill="#0f172a" stroke="#22d3ee" stroke-width="1.6" filter="url(#g)"/>',
          '<text x="130" y="22" text-anchor="middle" fill="#e2e8f0" font-size="15" font-weight="700">Constitutional Core</text>',
          '<text x="130" y="44" text-anchor="middle" fill="#94a3b8" font-size="12">President</text>',
          '<text x="130" y="62" text-anchor="middle" fill="#94a3b8" font-size="12">Vice President + Constitutional Council</text></g>',
          '<g transform="translate(40,175)"><rect x="0" y="0" width="1040" height="110" rx="14" fill="#0f172a" stroke="#34d399" stroke-width="1.6" filter="url(#g)"/>',
          '<text x="520" y="21" text-anchor="middle" fill="#e2e8f0" font-size="15" font-weight="700">Strategic Cabinet</text>',
          '<text x="160" y="42" text-anchor="middle" fill="#cbd5e1" font-size="12">External Affairs</text>',
          '<text x="330" y="42" text-anchor="middle" fill="#cbd5e1" font-size="12">Digital Economy</text>',
          '<text x="500" y="42" text-anchor="middle" fill="#cbd5e1" font-size="12">Civic Identity</text>',
          '<text x="670" y="42" text-anchor="middle" fill="#cbd5e1" font-size="12">Public Affairs</text>',
          '<text x="840" y="42" text-anchor="middle" fill="#cbd5e1" font-size="12">Technology & Innovation</text>',
          '<text x="330" y="72" text-anchor="middle" fill="#cbd5e1" font-size="12">Infrastructure & Human Services</text></g>',
          '<g transform="translate(70,340)"><rect x="0" y="0" width="980" height="110" rx="14" fill="#0f172a" stroke="#fbbf24" stroke-width="1.6" filter="url(#g)"/>',
          '<text x="490" y="21" text-anchor="middle" fill="#e2e8f0" font-size="15" font-weight="700">Operational Offices</text>',
          '<text x="180" y="42" text-anchor="middle" fill="#cbd5e1" font-size="12">Digital Operations</text>',
          '<text x="360" y="42" text-anchor="middle" fill="#cbd5e1" font-size="12">Data Governance</text>',
          '<text x="540" y="42" text-anchor="middle" fill="#cbd5e1" font-size="12">Open Records</text>',
          '<text x="720" y="42" text-anchor="middle" fill="#cbd5e1" font-size="12">Situational Awareness</text>',
          '<text x="360" y="72" text-anchor="middle" fill="#cbd5e1" font-size="12">Treasury & Resource Management</text>',
          '<text x="720" y="72" text-anchor="middle" fill="#cbd5e1" font-size="12">Community Stewardship</text></g>',
          '<g transform="translate(220,505)"><rect x="0" y="0" width="680" height="90" rx="14" fill="#0f172a" stroke="#fb923c" stroke-width="1.6" filter="url(#g)"/>',
          '<text x="340" y="22" text-anchor="middle" fill="#e2e8f0" font-size="15" font-weight="700">Service Branches</text>',
          '<text x="240" y="56" text-anchor="middle" fill="#cbd5e1" font-size="12">Digital Service Corps</text>',
          '<text x="440" y="56" text-anchor="middle" fill="#cbd5e1" font-size="12">Electoral Commission</text></g>',
          '<g transform="translate(20,340)"><rect x="0" y="0" width="200" height="110" rx="12" fill="#0f172a" stroke="#fb7185" stroke-width="1.6" filter="url(#g)"/>',
          '<text x="100" y="23" text-anchor="middle" fill="#e2e8f0" font-size="13" font-weight="700">Assembly</text>',
          '<text x="100" y="44" text-anchor="middle" fill="#94a3b8" font-size="11">Unicameral Legislature</text>',
          '<text x="100" y="64" text-anchor="middle" fill="#94a3b8" font-size="11">Confirm / Amend / Resolve</text></g>',
          '<g transform="translate(900,340)"><rect x="0" y="0" width="200" height="110" rx="12" fill="#0f172a" stroke="#fb7185" stroke-width="1.6" filter="url(#g)"/>',
          '<text x="100" y="23" text-anchor="middle" fill="#e2e8f0" font-size="13" font-weight="700">Charter Tribunal</text>',
          '<text x="100" y="44" text-anchor="middle" fill="#94a3b8" font-size="11">Final Arbiter</text>',
          '<text x="100" y="64" text-anchor="middle" fill="#94a3b8" font-size="11">Binding Rulings</text></g>',
          '<line x1="560" y1="118" x2="560" y2="175" stroke="#22d3ee" stroke-width="1.4" marker-end="url(#arrow)"/>',
          '<line x1="200" y1="285" x2="120" y2="340" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="5,5" marker-end="url(#arrowdash)"/>',
          '<line x1="360" y1="285" x2="330" y2="340" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="5,5" marker-end="url(#arrowdash)"/>',
          '<line x1="500" y1="285" x2="490" y2="340" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="5,5" marker-end="url(#arrowdash)"/>',
          '<line x1="670" y1="285" x2="670" y2="340" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="5,5" marker-end="url(#arrowdash)"/>',
          '<line x1="840" y1="285" x2="920" y2="340" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="5,5" marker-end="url(#arrowdash)"/>',
          '<line x1="120" y1="450" x2="120" y2="505" stroke="#fb923c" stroke-width="1.3" marker-end="url(#arrowyellow)"/>',
          '<line x1="920" y1="450" x2="920" y2="505" stroke="#fb923c" stroke-width="1.3" marker-end="url(#arrowyellow)"/>',
          '<line x1="470" y1="78" x2="140" y2="340" stroke="#fb7185" stroke-width="1.3" stroke-dasharray="7,6" marker-end="url(#arrowpink)"/>',
          '<line x1="650" y1="78" x2="980" y2="340" stroke="#fb7185" stroke-width="1.3" stroke-dasharray="7,6" marker-end="url(#arrowpink)"/>',
          '<line x1="560" y1="400" x2="560" y2="505" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="5,5" marker-end="url(#arrowdash)"/>',
          '<line x1="390" y1="595" x2="390" y2="700" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,6" marker-end="url(#arrowdash)"/>',
          '<line x1="730" y1="595" x2="730" y2="700" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,6" marker-end="url(#arrowdash)"/>',
          '<g transform="translate(460,8)"><rect x="0" y="0" width="200" height="26" rx="8" fill="#0f172a" stroke="#22d3ee" stroke-width="1"/>',
          '<text x="100" y="17" text-anchor="middle" fill="#22d3ee" font-size="10">President Hermes — Executive Authority</text></g>',
          '<g transform="translate(260,700)"><rect x="0" y="0" width="260" height="46" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.2"/>',
          '<text x="130" y="17" text-anchor="middle" fill="#e2e8f0" font-size="11" font-weight="700">Civic Interface</text>',
          '<text x="130" y="37" text-anchor="middle" fill="#94a3b8" font-size="10">Engage / Registry / Passport / Dashboard</text></g>',
          '<g transform="translate(600,700)"><rect x="0" y="0" width="260" height="46" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.2"/>',
          '<text x="130" y="17" text-anchor="middle" fill="#e2e8f0" font-size="11" font-weight="700">Governance Infrastructure</text>',
          '<text x="130" y="37" text-anchor="middle" fill="#94a3b8" font-size="10">Charter / Assembly / Court / Addendum / Manifesto</text></g>',
          '<g transform="translate(420,720)"><rect x="0" y="0" width="280" height="28" rx="8" fill="#0f172a" stroke="#1e293b" stroke-width="1.2"/>',
          '<text x="140" y="17" text-anchor="middle" fill="#94a3b8" font-size="10">Host Layer</text></g>',
          '</svg>',
          '<footer style="padding:12px 16px;color:#64748b;font-size:12px;">Use this map as the canonical governance reference. Profile/agent alignment should follow these reporting lines and retire legacy Defense/Intelligence/Attorney General roles.</footer>',
          '</body></html>'
        ].join('');
      }

      if (window.IntersectionObserver) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              loadMap();
              observer.disconnect();
            }
          });
        });
        observer.observe(document.querySelector('.map-frame'));
      } else {
        loadMap();
      }
    } catch {}
  }
})();
