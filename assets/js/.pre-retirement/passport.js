(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    renderStats();
    renderPillars();
    renderCredentials();
    renderVerifications();
    renderRecognitions();
  }

  /* ---- stats ---- */
  function renderStats() {
    var container = document.getElementById('passport-stats');
    if (!container) return;
    fetch('assets/data/passport.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var stats = data.stats || {};
        var html = '';
        Object.keys(stats).forEach(function (key) {
          html += '<div class="stat">' +
            '<span class="stat-value">' + escapeHtml(String(stats[key])) + '</span>' +
            '<span class="stat-label">' + escapeHtml(pascalToTitle(key)) + '</span>' +
          '</div>';
        });
        container.innerHTML = html;
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Passport summary is temporarily unavailable.</div>';
      });
  }

  function pascalToTitle(value) {
    return String(value)
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, function (s) { return s.toUpperCase(); })
      .trim();
  }

  /* ---- pillars ---- */
  function renderPillars() {
    var container = document.getElementById('passport-pillars');
    if (!container) return;
    fetch('assets/data/passport.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var items = Array.isArray(data.pillars) ? data.pillars.slice() : [];
        container.innerHTML = items.map(function (item) {
          return '<article class="activity-item pillar">' +
            '<div class="activity-content">' +
            '<h3 class="activity-title">' + escapeHtml(String(item.title || '')) + '</h3>' +
            '<p class="activity-description">' + escapeHtml(String(item.summary || '')) + '</p>' +
            '</div>' +
            '</article>';
        }).join('');
      })
      .catch(function () {
        container.innerHTML = '<div class="activity-empty">Pillar data is temporarily unavailable.</div>';
      });
  }

  /* ---- credentials ---- */
  function renderCredentials() {
    var feed = document.getElementById('passport-credentials-feed');
    if (!feed) return;
    fetch('assets/data/passport.json')
      .then(function (response) {
        if (!response.ok) throw new Error('passport data unavailable');
        return response.json();
      })
      .then(function (data) {
        var items = getSection(data, 'credentials');
        renderCredentialList(feed, items);
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Credentials are temporarily unavailable.</div>';
      });
  }

  function renderCredentialList(container, items) {
    if (!items.length) {
      container.innerHTML = '<div class="activity-empty">No credentials found.</div>';
      return;
    }
    container.innerHTML = items.map(function (item) {
      var statusClass = 'status-' + slugify(String(item.status || 'unknown'));
      var claims = Array.isArray(item.claims) ? item.claims.join(', ') : '';
      var extra = claims ? '<div class="activity-meta"><span class="metric">Claims: ' + escapeHtml(claims) + '</span></div>' : '';
      return '<article class="activity-item" role="article" aria-label="' + escapeHtml(String(item.id || '')) + '">' +
        '<div class="activity-content">' +
          '<h3 class="activity-title">' + escapeHtml(String(item.holder || 'Untitled')) + '</h3>' +
          '<p class="activity-description">' + escapeHtml(String(item.type || '')) + ' · ' + escapeHtml(String(item.authority || '')) + '</p>' +
          '<div class="activity-meta">' +
            '<span class="activity-type">' + escapeHtml(String(item.id || '')) + '</span>' +
            '<span class="activity-divider">·</span>' +
            '<span>' + escapeHtml(String(item.authority || '—')) + '</span>' +
          '</div>' +
          extra +
        '</div>' +
        '<div class="activity-sidebar">' +
          '<span class="activity-status ' + statusClass + '">' + escapeHtml(String(item.status || '—')) + '</span>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  /* ---- verifications ---- */
  function renderVerifications() {
    var feed = document.getElementById('passport-verifications-feed');
    if (!feed) return;
    fetch('assets/data/passport.json')
      .then(function (response) {
        if (!response.ok) throw new Error('passport data unavailable');
        return response.json();
      })
      .then(function (data) {
        var items = getSection(data, 'verifications');
        renderVerificationList(feed, items);
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Verification records are temporarily unavailable.</div>';
      });
  }

  function renderVerificationList(container, items) {
    if (!items.length) {
      container.innerHTML = '<div class="activity-empty">No verifications found.</div>';
      return;
    }
    container.innerHTML = items.map(function (item) {
      var statusClass = 'status-' + slugify(String(item.status || 'unknown'));
      return '<article class="activity-item" role="article" aria-label="' + escapeHtml(String(item.id || '')) + '">' +
        '<div class="activity-content">' +
          '<h3 class="activity-title">' + escapeHtml(String(item.verifier || 'Verification')) + '</h3>' +
          '<p class="activity-description">' + escapeHtml(String(item.type || '')) + ' · Disclosure: ' + escapeHtml(String(item.disclosure || '—')) + '</p>' +
          '<div class="activity-meta">' +
            '<span class="activity-type">' + escapeHtml(String(item.id || '')) + '</span>' +
            '<span class="activity-divider">·</span>' +
            '<span>Credential ' + escapeHtml(String(item.credentialId || '—')) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="activity-sidebar">' +
          '<span class="activity-status ' + statusClass + '">' + escapeHtml(String(item.status || '—')) + '</span>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  /* ---- recognitions ---- */
  function renderRecognitions() {
    var feed = document.getElementById('passport-recognitions-feed');
    if (!feed) return;
    fetch('assets/data/passport.json')
      .then(function (response) {
        if (!response.ok) throw new Error('passport data unavailable');
        return response.json();
      })
      .then(function (data) {
        var items = getSection(data, 'recognitions');
        renderRecognitionList(feed, items);
      })
      .catch(function () {
        feed.innerHTML = '<div class="activity-empty">Recognition records are temporarily unavailable.</div>';
      });
  }

  function renderRecognitionList(container, items) {
    if (!items.length) {
      container.innerHTML = '<div class="activity-empty">No recognition agreements found.</div>';
      return;
    }
    container.innerHTML = items.map(function (item) {
      var statusClass = 'status-' + slugify(String(item.status || 'unknown'));
      return '<article class="activity-item" role="article" aria-label="' + escapeHtml(String(item.id || '')) + '">' +
        '<div class="activity-content">' +
          '<h3 class="activity-title">' + escapeHtml(String(item.partner || 'Recognition Agreement')) + '</h3>' +
          '<p class="activity-description">' + escapeHtml(String(item.type || '')) + '</p>' +
          '<div class="activity-meta">' +
            '<span class="activity-type">' + escapeHtml(String(item.id || '')) + '</span>' +
            '<span class="activity-divider">·</span>' +
            '<span>Signed ' + escapeHtml(String(item.signed || '—')) + '</span>' +
          '</div>' +
          '<div class="activity-meta">' + escapeHtml(String(item.scope || '')) + '</div>' +
        '</div>' +
        '<div class="activity-sidebar">' +
          '<span class="activity-status ' + statusClass + '">' + escapeHtml(String(item.status || '—')) + '</span>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function getSection(data, section) {
    var entries = data.entries && data.entries[section];
    return Array.isArray(entries) ? entries.slice() : [];
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function slugify(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'unknown';
  }
})();
