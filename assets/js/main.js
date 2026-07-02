(function () {
  'use strict';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  function init() {
    try {
      const loader = document.querySelector('.page-loader');
      if (loader) loader.classList.add('hidden');
    } catch {}
    initReadiness();
    initPathfinder();
    initDashboard();
  }

  // ── Readiness Calculator ──
  function initReadiness() {
    const form = document.getElementById('readiness');
    if (!form) return;
    const scoreEl = document.getElementById('readiness-score');
    const labelEl = document.getElementById('readiness-label');
    const guidance = {
      0: 'Begin with the Charter and Manifesto to ground your understanding.',
      1: 'Great start — keep exploring the core principles.',
      2: 'You are building solid context; continue with governance basics.',
      3: 'Strong foundation — consider joining a node or contributing.',
      4: 'You are close to active participation; review the contribution paths.',
      5: 'Near full readiness — find your first contribution and engage.',
      6: 'Full readiness — you are prepared to participate fully.'
    };
    function update() {
      const checked = form.querySelectorAll('input[type="checkbox"]:checked');
      const score = checked.length;
      if (scoreEl) scoreEl.textContent = String(score);
      if (labelEl) labelEl.textContent = guidance[score] || '';
    }
    form.addEventListener('change', update);
    form.addEventListener('input', update);
    update();
  }

  // ── Contribution Path Finder ──
  function initPathfinder() {
    var selectGroup = document.getElementById('path-interests');
    var button = document.getElementById('path-go');
    var output = document.getElementById('pathfinder-result');
    if (!selectGroup || !button || !output) return;
    function getRecommendations(value) {
      var map = {
        engineering: {
          title: 'Engineering Path',
          steps: [
            'Review the protocol specs and open issues.',
            'Fork the repository and propose a patch.',
            'Run a local node and report metrics.'
          ]
        },
        governance: {
          title: 'Governance Path',
          steps: [
            'Read the Charter and Manifesto carefully.',
            'Join the next Civic Assembly session.',
            'Propose or vote on an open referendum.'
          ]
        },
        outreach: {
          title: 'Outreach Path',
          steps: [
            'Share public documentation and explainers.',
            'Host an introductory discussion or AMA.',
            'Mentor a new contributor through their first task.'
          ]
        },
        node: {
          title: 'Node Operation Path',
          steps: [
            'Review node operator requirements.',
            'Provision a compliant public endpoint.',
            'Publish node status and uptime reports.'
          ]
        },
        security: {
          title: 'Security Path',
          steps: [
            'Audit public protocol interfaces.',
            'Submit responsible disclosures via the security channel.',
            'Assist with incident review and remediation.'
          ]
        },
        docs: {
          title: 'Documentation Path',
          steps: [
            'Identify gaps in the current docs.',
            'Submit a documentation PR with examples.',
            'Translate key pages into additional languages.'
          ]
        }
      };
      return map[value] || {
        title: 'General Path',
        steps: [
          'Explore the Charter and Manifesto to find your fit.',
          'Review open tasks in the repository.',
          'Join the onboarding conversation.'
        ]
      };
    }
    button.addEventListener('click', function () {
      var value = selectGroup.value;
      var rec = getRecommendations(value);
      output.innerHTML = '<strong>' + escapeHtml(rec.title) + '</strong>' +
        '<ol>' + rec.steps.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ol>';
    });
  }

  // ── Dashboard: animated counters, charts, activity filter/search ──
  function initDashboard() {
    animateCounters();
    renderSimpleBarChart();
    initActivityFilter();
    initDashboardCivicFeed();
  }

  function initDashboardCivicFeed() {
    const container = document.getElementById('dashboard-activity-feed');
    if (!container) return;

    // Try to load from civic data
    fetch('assets/data/civic.json')
      .then(response => response.json())
      .then(data => {
        renderDashboardActivityFeed(container, data);
      })
      .catch(err => {
        console.warn('Failed to load civic.json for dashboard:', err);
        container.innerHTML = '<p class="activity-empty">Activity feed unavailable.</p>';
      });
  }

  function renderDashboardActivityFeed(container, data) {
    const items = [];
    
    if (data.petitions) {
      data.petitions.forEach(p => items.push({ ...p, _type: 'petition', _sortDate: p.timestamp }));
    }
    if (data.feedback) {
      data.feedback.forEach(f => items.push({ ...f, _type: 'feedback', _sortDate: f.timestamp }));
    }
    if (data.governanceActions) {
      data.governanceActions.forEach(g => items.push({ ...g, _type: 'governance', _sortDate: g.timestamp }));
    }

    if (!items.length) {
      container.innerHTML = '<p class="activity-empty">No civic activity yet.</p>';
      return;
    }

    items.sort((a, b) => new Date(b._sortDate) - new Date(a._sortDate));
    const limited = items.slice(0, 10);

    const html = limited.map(item => renderDashboardActivityItem(item)).join('');
    container.innerHTML = html;
  }

  function renderDashboardActivityItem(item) {
    const date = new Date(item._sortDate);
    const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const statusClass = 'status-' + item.status;
    const typeLabel = item._type === 'petition' ? 'Petition' : item._type === 'feedback' ? 'Feedback' : 'Governance';

    let metaHtml = '';
    if (item._type === 'petition') {
      const progress = item.signatureGoal ? Math.min(100, Math.round((item.currentSignatures / item.signatureGoal) * 100)) : 0;
      metaHtml = `
        <div class="activity-meta">
          <span class="activity-type">${escapeHtml(typeLabel)}</span>
          <span class="activity-divider" aria-hidden="true">·</span>
          <span>Target: ${escapeHtml(item.target)}</span>
          <span class="activity-divider" aria-hidden="true">·</span>
          <span>${item.currentSignatures}/${item.signatureGoal} signatures (${progress}%)</span>
        </div>`;
    } else if (item._type === 'feedback') {
      metaHtml = `
        <div class="activity-meta">
          <span class="activity-type">${escapeHtml(typeLabel)}</span>
          <span class="activity-divider" aria-hidden="true">·</span>
          <span>Category: ${escapeHtml(item.category)}</span>
          ${item.subject ? `<span class="activity-divider" aria-hidden="true">·</span><span>${escapeHtml(item.subject)}</span>` : ''}
        </div>`;
    } else {
      metaHtml = `
        <div class="activity-meta">
          <span class="activity-type">${escapeHtml(typeLabel)}</span>
          ${item.metadata?.session ? `<span class="activity-divider" aria-hidden="true">·</span><span>${escapeHtml(item.metadata.session)}</span>` : ''}
          ${item.metadata?.ministry ? `<span class="activity-divider" aria-hidden="true">·</span><span>${escapeHtml(item.metadata.ministry)}</span>` : ''}
          ${item.metadata?.directiveId ? `<span class="activity-divider" aria-hidden="true">·</span><span>${escapeHtml(item.metadata.directiveId)}</span>` : ''}
        </div>`;
    }

    return `
      <div class="activity-item activity-${item._type}" role="listitem" data-id="${escapeHtml(item.id)}" data-type="${item._type}" data-status="${item.status}">
        <div>
          <div class="activity-label">${escapeHtml(item.title)}</div>
          ${metaHtml}
        </div>
        <div class="activity-state ${statusClass}">${escapeHtml(item.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()))}</div>
      </div>
    `;
  }
  function animateCounters() {
    var counters = document.querySelectorAll('.metric-value[data-count-to]');
    if (!counters.length) return;
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
      var start = 0;
      var startTime = null;
      el.textContent = '0';
      var duration = 900;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      }
      window.requestAnimationFrame(step);
    });
  }
  function renderSimpleBarChart() {
    var container = document.querySelector('.dashboard-chart');
    if (!container) return;
    var data = [
      { label: 'Citizens', value: 12 },
      { label: 'Nodes', value: 8 },
      { label: 'Governance Actions', value: 4 }
    ];
    var max = Math.max.apply(null, data.map(function (d) { return d.value; })) || 1;
    var html = '<div class="chart-wrap" role="img" aria-label="Participation bar chart">';
    data.forEach(function (row) {
      var pct = Math.round((row.value / max) * 100);
      html += '<div class="chart-row">' +
        '<div class="chart-label">' + escapeHtml(row.label) + '</div>' +
        '<div class="chart-bar" aria-hidden="true">' +
        '<div class="chart-fill" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<div class="chart-value">' + row.value + '</div>' +
        '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }
  function initActivityFilter() {
    var input = document.getElementById('activity-filter');
    if (!input) return;
    var items = document.querySelectorAll('.activity-list .activity-item');
    var pills = document.querySelectorAll('.activity-actions .pill');
    var activeFilter = 'all';
    function applyFilter(text) {
      var term = text.trim().toLowerCase();
      items.forEach(function (item) {
        var label = (item.querySelector('.activity-label') ? item.querySelector('.activity-label').textContent : '') + ' ' +
          (item.querySelector('.activity-meta') ? item.querySelector('.activity-meta').textContent : '') + ' ' +
          (item.querySelector('.activity-state') ? item.querySelector('.activity-state').textContent : '');
        var matchesText = !term || label.toLowerCase().indexOf(term) !== -1;
        var matchesPill = activeFilter === 'all' || (item.querySelector('.activity-state') && item.querySelector('.activity-state').textContent === activeFilter);
        item.style.display = (matchesText && matchesPill) ? '' : 'none';
      });
    }
    input.addEventListener('input', function () {
      var term = input.value.trim();
      if (!term) {
        activeFilter = 'all';
        pills.forEach(function (p) {
          p.setAttribute('aria-pressed', p.getAttribute('data-filter') === 'all' ? 'true' : 'false');
        });
      }
      applyFilter(term);
    });
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.setAttribute('aria-pressed', 'false'); });
        pill.setAttribute('aria-pressed', 'true');
        activeFilter = pill.getAttribute('data-filter') || 'all';
        applyFilter(input.value);
      });
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
