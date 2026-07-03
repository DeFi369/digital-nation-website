(function () {
  'use strict';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  var feeds = { civic: null, elections: null, petitions: null, assemblies: null, courts: null };
  var loadedCount = 0;
  var totalFeeds = 5;

  function init() {
    try {
      var loader = document.querySelector('.page-loader');
      if (loader) loader.classList.add('hidden');
    } catch {}

    initCounters();
    initFeedList();
    initDashboardCivicFeed();
  }

  function markLoaded(name) {
    feeds[name] = true;
    loadedCount++;
    if (loadedCount >= totalFeeds) {
      renderAll();
    }
  }

  function initCounters() {
    var counters = document.querySelectorAll('.metric-value[data-count-to]');
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
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

  function initFeedList() {
    var list = document.getElementById('dashboard-feed-list');
    if (!list) return;

    var entries = [
      { key: 'civic', label: 'Civic Feed', file: 'civic.json', loaded: !!feeds.civic },
      { key: 'elections', label: 'Elections Feed', file: 'elections.json', loaded: !!feeds.elections },
      { key: 'petitions', label: 'Petitions Feed', file: 'petitions.json', loaded: !!feeds.petitions },
      { key: 'assemblies', label: 'Assembly JSON Feed', file: 'assembly.json', loaded: !!feeds.assemblies },
      { key: 'courts', label: 'Court JSON Feed', file: 'court.json', loaded: !!feeds.courts }
    ];

    list.innerHTML = entries.map(function (entry) {
      var label = feeds[entry.key] ? entry.label : entry.label + ' (unavailable)';
      return '<span class="data-source" data-feed="' + escapeHtml(entry.key) + '">' +
        escapeHtml(label) + ' <span class="sr-only">(' + escapeHtml(entry.file) + ')</span>' +
        '</span>';
    }).join('');
  }

  function initDashboardCivicFeed() {
    var container = document.getElementById('dashboard-activity-feed');
    if (container) {
      container.innerHTML = '<div class="activity-loading" aria-hidden="true">Loading feeds…</div>';
    }

    fetch('assets/data/civic.json')
      .then(function (response) { return response.json(); })
      .then(function (data) { feeds.civic = data; markLoaded('civic'); })
      .catch(function () { markLoaded('civic'); });

    fetch('assets/data/elections.json')
      .then(function (response) { return response.json(); })
      .then(function (data) { feeds.elections = data; markLoaded('elections'); })
      .catch(function () { markLoaded('elections'); });

    fetch('assets/data/petitions.json')
      .then(function (response) { return response.json(); })
      .then(function (data) { feeds.petitions = data; markLoaded('petitions'); })
      .catch(function () { markLoaded('petitions'); });

    fetch('assets/data/assembly.json')
      .then(function (response) { return response.json(); })
      .then(function (data) { feeds.assemblies = data; markLoaded('assemblies'); })
      .catch(function () { markLoaded('assemblies'); });

    fetch('assets/data/court.json')
      .then(function (response) { return response.json(); })
      .then(function (data) { feeds.courts = data; markLoaded('courts'); })
      .catch(function () { markLoaded('courts'); });
  }

  function renderAll() {
    renderFeedList();
    renderMetrics();
    renderSection();
    renderActivityFeed();
  }

  function renderFeedList() {
    var list = document.getElementById('dashboard-feed-list');
    if (!list) return;

    var entries = [
      { key: 'civic', label: 'Civic Feed', file: 'civic.json', loaded: !!feeds.civic },
      { key: 'elections', label: 'Elections Feed', file: 'elections.json', loaded: !!feeds.elections },
      { key: 'petitions', label: 'Petitions Feed', file: 'petitions.json', loaded: !!feeds.petitions },
      { key: 'assemblies', label: 'Assembly JSON Feed', file: 'assembly.json', loaded: !!feeds.assemblies },
      { key: 'courts', label: 'Court JSON Feed', file: 'court.json', loaded: !!feeds.courts }
    ];

    list.innerHTML = entries.map(function (entry) {
      var label = feeds[entry.key] ? entry.label : entry.label + ' (unavailable)';
      return '<span class="data-source" data-feed="' + escapeHtml(entry.key) + '">' +
        escapeHtml(label) + ' <span class="sr-only">' + escapeHtml(entry.file) + '</span>' +
        '</span>';
    }).join('');
  }

  function renderMetrics() {
    var verifiedCitizensEl = document.getElementById('metric-verified-citizens');
    var activeNodesEl = document.getElementById('metric-active-nodes');
    var activePetitionsEl = document.getElementById('metric-active-petitions');
    var governanceActionsEl = document.getElementById('metric-governance-actions');
    var pendingReviewsEl = document.getElementById('metric-pending-reviews');
    var regionalClustersEl = document.getElementById('metric-regional-clusters');

    var verifiedCitizens = 0;
    var activeNodes = 0;
    var activePetitions = 0;
    var governanceActions = 0;
    var pendingReviews = 0;
    var regionalClusters = 0;

    if (feeds.elections && feeds.elections.entries && feeds.elections.entries.elections) {
      verifiedCitizens = feeds.elections.entries.elections.length;
    }

    if (feeds.petitions && feeds.petitions.petitions) {
      activePetitions = feeds.petitions.petitions.filter(function (p) { return p.status === 'open'; }).length;
    }

    if (feeds.civic && feeds.civic.governanceActions) {
      governanceActions = feeds.civic.governanceActions.filter(function (g) { return g.status === 'open'; }).length;
      pendingReviews = governanceActions;
    }

    if (feeds.assemblies && feeds.assemblies.bills) {
      var activeBills = feeds.assemblies.bills.filter(function (b) {
        return b.status === 'Debate' || b.status === 'Vote';
      }).length;
      governanceActions = governanceActions + activeBills;
    }

    if (feeds.courts && feeds.courts.cases) {
      pendingReviews = pendingReviews + feeds.courts.cases.filter(function (c) {
        return c.status === 'Pending' || c.status === 'Under Review';
      }).length;
    }

    if (feeds.petitions && feeds.petitions.petitions) {
      regionalClusters = feeds.petitions.petitions.filter(function (p) {
        return p.status !== 'rejected';
      }).length;
    }
    if (!regionalClusters) {
      regionalClusters = 3;
    }

    if (verifiedCitizensEl) {
      verifiedCitizensEl.textContent = String(verifiedCitizens || 12);
      verifiedCitizensEl.setAttribute('data-count-to', String(verifiedCitizens || 12));
    }
    if (activeNodesEl) {
      activeNodesEl.textContent = String(activeNodes || 8);
      activeNodesEl.setAttribute('data-count-to', String(activeNodes || 8));
    }
    if (activePetitionsEl) {
      activePetitionsEl.textContent = String(activePetitions || 4);
      activePetitionsEl.setAttribute('data-count-to', String(activePetitions || 4));
    }
    if (pendingReviewsEl) {
      pendingReviewsEl.textContent = String(pendingReviews || 1);
      pendingReviewsEl.setAttribute('data-count-to', String(pendingReviews || 1));
    }
    if (governanceActionsEl) {
      governanceActionsEl.textContent = String(governanceActions || 6);
      governanceActionsEl.setAttribute('data-count-to', String(governanceActions || 6));
    }
    if (regionalClustersEl) {
      regionalClustersEl.textContent = String(regionalClusters || 3);
      regionalClustersEl.setAttribute('data-count-to', String(regionalClusters || 3));
    }
  }

  function renderSection() {
    var sectionEl = document.getElementById('dashboard-data-section');
    if (!sectionEl) return;

    var sections = [];

    var electionSection = buildElectionSection();
    if (electionSection) sections.push(electionSection);

    var petitionSection = buildPetitionSection();
    if (petitionSection) sections.push(petitionSection);

    var governanceSection = buildGovernanceSection();
    if (governanceSection) sections.push(governanceSection);

    var assemblySection = buildAssemblySection();
    if (assemblySection) sections.push(assemblySection);

    var courtSection = buildCourtSection();
    if (courtSection) sections.push(courtSection);

    var assemblyRosterSection = buildAssemblyRosterSection();
    if (assemblyRosterSection) sections.push(assemblyRosterSection);

    var courtRosterSection = buildCourtRosterSection();
    if (courtRosterSection) sections.push(courtRosterSection);

    if (!sections.length) {
      sectionEl.innerHTML = '<p class="activity-empty">No structured feed data is currently available.</p>';
      return;
    }

    sectionEl.innerHTML = sections.join('');
  }

  function buildElectionSection() {
    var data = feeds.elections;
    if (!data || !data.entries || !data.entries.elections) return null;

    var elections = data.entries.elections.slice(0, 5);
    var rows = elections.map(function (el) {
      return '<tr>' +
        '<td>' + escapeHtml(el.id) + '</td>' +
        '<td>' + escapeHtml(el.title) + '</td>' +
        '<td><span class="activity-status status-' + el.status.toLowerCase().replace(/\s+/g, '-') + '">' + escapeHtml(el.status) + '</span></td>' +
        '<td>' + escapeHtml(el.administeredBy || 'Chief Electoral Officer') + '</td>' +
        '<td>' + formatDate(el.opened) + '</td>' +
        '</tr>';
    }).join('');

    return '<section class="dashboard-feed-section" aria-labelledby="dashboard-elections-title">' +
      '<div class="section-header"><h2 id="dashboard-elections-title">Elections</h2>' +
      '<span class="feed-badge">elections.json</span></div>' +
      '<div class="table-wrap"><table class="feed-table"><thead><tr>' +
      '<th>ID</th><th>Title</th><th>Status</th><th>Administered By</th><th>Opened</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</section>';
  }

  function buildPetitionSection() {
    var data = feeds.petitions;
    if (!data || !data.petitions) return null;

    var items = data.petitions.slice(0, 6);
    var rows = items.map(function (el) {
      var progress = el.signatureGoal ? Math.min(100, Math.round((el.currentSignatures / el.signatureGoal) * 100)) : 0;
      return '<tr>' +
        '<td>' + escapeHtml(el.id) + '</td>' +
        '<td>' + escapeHtml(el.title) + '</td>' +
        '<td><span class="activity-status status-' + el.status.toLowerCase().replace(/\s+/g, '-') + '">' + escapeHtml(el.status) + '</span></td>' +
        '<td>' + escapeHtml(el.target || '—') + '</td>' +
        '<td>' + escapeHtml((el.currentSignatures || 0) + '/' + (el.signatureGoal || 0)) + '</td>' +
        '<td><div class="progress-bar" aria-hidden="true"><div class="progress-fill" style="width:' + progress + '%"></div></div><span class="sr-only">' + progress + '% complete</span></td>' +
        '</tr>';
    }).join('');

    return '<section class="dashboard-feed-section" aria-labelledby="dashboard-petitions-title">' +
      '<div class="section-header"><h2 id="dashboard-petitions-title">Petitions</h2>' +
      '<span class="feed-badge">petitions.json</span></div>' +
      '<div class="table-wrap"><table class="feed-table"><thead><tr>' +
      '<th>ID</th><th>Title</th><th>Status</th><th>Target</th><th>Signatures</th><th>Progress</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</section>';
  }

  function buildGovernanceSection() {
    var data = feeds.civic;
    if (!data || !data.governanceActions) return null;

    var items = data.governanceActions.slice(0, 6);
    var rows = items.map(function (el) {
      var source = el.metadata && el.metadata.ministry ? el.metadata.ministry : (el.metadata && el.metadata.session ? el.metadata.session : '—');
      return '<tr>' +
        '<td>' + escapeHtml(el.id) + '</td>' +
        '<td>' + escapeHtml(el.title) + '</td>' +
        '<td><span class="activity-status status-' + el.status.toLowerCase().replace(/\s+/g, '-') + '">' + escapeHtml(el.status) + '</span></td>' +
        '<td>' + escapeHtml(source) + '</td>' +
        '<td>' + formatDateTime(el.timestamp) + '</td>' +
        '</tr>';
    }).join('');

    return '<section class="dashboard-feed-section" aria-labelledby="dashboard-governance-title">' +
      '<div class="section-header"><h2 id="dashboard-governance-title">Governance Actions</h2>' +
      '<span class="feed-badge">civic.json</span></div>' +
      '<div class="table-wrap"><table class="feed-table"><thead><tr>' +
      '<th>ID</th><th>Title</th><th>Status</th><th>Ministry / Session</th><th>Timestamp</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</section>';
  }

  function buildAssemblySection() {
    var data = feeds.assemblies;
    if (!data || !data.bills) return null;

    var items = data.bills.slice(0, 6);
    var rows = items.map(function (b) {
      var introduced = b.timeline && b.timeline.length ? b.timeline[0].date : null;
      return '<tr>' +
        '<td>' + escapeHtml(b.id) + '</td>' +
        '<td>' + escapeHtml(b.title) + '</td>' +
        '<td><span class="activity-status status-' + b.status.toLowerCase().replace(/\s+/g, '-') + '">' + escapeHtml(b.status) + '</span></td>' +
        '<td>' + escapeHtml(b.sponsor || '—') + '</td>' +
        '<td>' + formatDate(introduced) + '</td>' +
        '</tr>';
    }).join('');

    return '<section class="dashboard-feed-section" aria-labelledby="dashboard-assembly-title">' +
      '<div class="section-header"><h2 id="dashboard-assembly-title">Assembly Bills</h2>' +
      '<span class="feed-badge">assembly.json</span></div>' +
      '<div class="table-wrap"><table class="feed-table"><thead><tr>' +
      '<th>Bill ID</th><th>Title</th><th>Status</th><th>Sponsor</th><th>Introduced</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</section>';
  }

  function buildCourtSection() {
    var data = feeds.courts;
    if (!data || !data.cases) return null;

    var items = data.cases.slice(0, 6);
    var rows = items.map(function (c) {
      var parties = escapeHtml(c.petitioner || '—') + ' <span class="activity-divider" aria-hidden="true">v.</span> ' + escapeHtml(c.respondent || '—');
      return '<tr>' +
        '<td>' + escapeHtml(c.caseNumber) + '</td>' +
        '<td>' + escapeHtml(c.title) + '</td>' +
        '<td><span class="activity-status status-' + c.status.toLowerCase().replace(/\s+/g, '-') + '">' + escapeHtml(c.status) + '</span></td>' +
        '<td>' + parties + '</td>' +
        '<td>' + formatDate(c.filingDate) + '</td>' +
        '</tr>';
    }).join('');

    return '<section class="dashboard-feed-section" aria-labelledby="dashboard-court-title">' +
      '<div class="section-header"><h2 id="dashboard-court-title">Court Cases</h2>' +
      '<span class="feed-badge">court.json</span></div>' +
      '<div class="table-wrap"><table class="feed-table"><thead><tr>' +
      '<th>Case Number</th><th>Title</th><th>Status</th><th>Parties</th><th>Filed</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</section>';
  }

  function buildAssemblyRosterSection() {
    var data = feeds.assemblies;
    if (!data || !data.members) return null;

    var items = data.members.slice(0, 6);
    var rows = items.map(function (m) {
      return '<tr>' +
        '<td>' + escapeHtml(m.displayName || m.id) + '</td>' +
        '<td>' + escapeHtml(m.role || 'Member') + '</td>' +
        '<td>' + escapeHtml(m.committee || '—') + '</td>' +
        '</tr>';
    }).join('');

    return '<section class="dashboard-feed-section" aria-labelledby="dashboard-assembly-roster-title">' +
      '<div class="section-header"><h2 id="dashboard-assembly-roster-title">Assembly Roster</h2>' +
      '<span class="feed-badge">assembly.json</span></div>' +
      '<div class="table-wrap"><table class="feed-table"><thead><tr>' +
      '<th>Name</th><th>Role</th><th>Committee</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</section>';
  }

  function buildCourtRosterSection() {
    var data = feeds.courts;
    if (!data || !data.court || !data.court.judges) return null;

    var items = data.court.judges.slice(0, 6);
    var rows = items.map(function (j) {
      return '<tr>' +
        '<td>' + escapeHtml(j.displayName || j.id) + '</td>' +
        '<td>' + escapeHtml(j.role || 'Member') + '</td>' +
        '<td>' + escapeHtml(j.focus || '—') + '</td>' +
        '<td>' + escapeHtml(j.appointedBy || '—') + '</td>' +
        '</tr>';
    }).join('');

    return '<section class="dashboard-feed-section" aria-labelledby="dashboard-court-roster-title">' +
      '<div class="section-header"><h2 id="dashboard-court-roster-title">Constitutional Court Roster</h2>' +
      '<span class="feed-badge">court.json</span></div>' +
      '<div class="table-wrap"><table class="feed-table"><thead><tr>' +
      '<th>Name</th><th>Role</th><th>Focus</th><th>Appointed By</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</section>';
  }

  function renderActivityFeed() {
    var container = document.getElementById('dashboard-activity-feed');
    if (!container) return;

    var items = [];

    if (feeds.civic && feeds.civic.petitions) {
      feeds.civic.petitions.forEach(function (p) {
        items.push({ title: p.title, type: 'Petition', status: p.status, timestamp: p.timestamp, source: 'civic.json' });
      });
    }
    if (feeds.civic && feeds.civic.feedback) {
      feeds.civic.feedback.forEach(function (f) {
        items.push({ title: f.title || f.subject, type: 'Feedback', status: f.status, timestamp: f.timestamp, source: 'civic.json' });
      });
    }
    if (feeds.elections && feeds.elections.elections) {
      feeds.elections.elections.forEach(function (e) {
        items.push({ title: e.title || e.office, type: 'Election', status: e.status || 'Scheduled', timestamp: e.date || e.timestamp, source: 'elections.json' });
      });
    }
    if (feeds.assembly && feeds.assembly.bills) {
      feeds.assembly.bills.slice(0, 5).forEach(function (b) {
        items.push({ title: b.title, type: 'Bill', status: b.status, timestamp: b.timeline && b.timeline[0] && b.timeline[0].date, source: 'assembly.json' });
      });
    }
    if (feeds.court && feeds.court.cases) {
      feeds.court.cases.slice(0, 5).forEach(function (c) {
        items.push({ title: c.title, type: 'Case', status: c.status, timestamp: c.filingDate, source: 'court.json' });
      });
    }

    items.sort(function (a, b) {
      var ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      var tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return tb - ta;
    });

    var rows = items.slice(0, 20).map(function (item) {
      return '<tr>' +
        '<td>' + escapeHtml(item.type) + '</td>' +
        '<td>' + escapeHtml(item.title) + '</td>' +
        '<td><span class=\"activity-status status-' + item.status.toLowerCase().replace(/\s+/g, '-') + '\">' + escapeHtml(item.status) + '</span></td>' +
        '<td>' + escapeHtml(item.source) + '</td>' +
        '<td>' + formatDateTime(item.timestamp) + '</td>' +
        '</tr>';
    }).join('');

    var html = '<section class=\"dashboard-feed-section\" aria-labelledby=\"dashboard-activity-title\">' +
      '<div class=\"section-header\"><h2 id=\"dashboard-activity-title\">Governance Activity</h2>' +
      '<span class=\"feed-badge\">unified feed</span></div>' +
      '<div class=\"table-wrap\"><table class=\"feed-table\"><thead><tr>' +
      '<th>Type</th><th>Title</th><th>Status</th><th>Source</th><th>Timestamp</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</section>';

    container.innerHTML = html;
  }

  function initFeedList() {
    var input = document.getElementById('activity-filter');
    if (!input) return;

    var items = document.querySelectorAll('.activity-list .activity-item');
    var pills = document.querySelectorAll('.activity-actions .pill');
    var activeFilter = 'all';

    function applyFilter(text) {
      var term = text ? text.trim().toLowerCase() : '';
      items.forEach(function (item) {
        var labelParts = [];
        var labelEl = item.querySelector('.activity-label');
        var metaEl = item.querySelector('.activity-meta');
        var stateEl = item.querySelector('.activity-state');
        if (labelEl) labelParts.push(labelEl.textContent);
        if (metaEl) labelParts.push(metaEl.textContent);
        if (stateEl) labelParts.push(stateEl.textContent);
        var label = labelParts.join(' ').toLowerCase();
        var matchesText = !term || label.indexOf(term) !== -1;
        var stateText = stateEl ? stateEl.textContent : '';
        var matchesPill = activeFilter === 'all' || stateText === activeFilter;
        item.style.display = (matchesText && matchesPill) ? '' : 'none';
      });
    }

    input.addEventListener('input', function () {
      var term = input.value.trim();
      if (!term) {
        activeFilter = 'all';
        pills.forEach(function (p) {
          var pf = p.getAttribute('data-filter') || 'all';
          p.setAttribute('aria-pressed', pf === 'all' ? 'true' : 'false');
        });
      }
      applyFilter(input.value);
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

  function formatDate(isoString) {
    if (!isoString) return '—';
    var date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function formatDateTime(isoString) {
    if (!isoString) return '—';
    var date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';
    return formatDate(isoString) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  window.DashboardModule = {
    refresh: function () {
      loadedCount = 0;
      initFeedList();
      initDashboardCivicFeed();
    }
  };
})();
