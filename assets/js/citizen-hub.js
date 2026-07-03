(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    try {
      setupMenu();
      liveYear();
      loadHubData();
    } catch {}
  }

  function loadHubData() {
    const electionsPromise = fetchAssets('assets/data/elections.json');
    const civicPromise = fetchAssets('assets/data/civic.json');
    const petitionsPromise = fetchAssets('assets/data/petitions.json');
    const transparencyPromise = fetchAssets('assets/data/transparency.json');

    Promise.all([electionsPromise, civicPromise, petitionsPromise, transparencyPromise])
      .then(function (results) {
        const elections = results[0] || {};
        const civic = results[1] || {};
        const petitions = results[2] || {};
        const transparency = results[3] || {};

        const localSigned = loadSignedPetitions();
        const localFeedback = loadLocalFeedback();
        const localRecords = loadLocalRecords();

        renderSignedPetitions(localSigned, petitions.petitions || []);
        renderLocalFeedback(localFeedback);
        renderUpcomingElections(elections.entries || {});
        renderRecordsRequests(localRecords, transparency.entries || {});
        updateHubStatus(localSigned, localRecords);
      })
      .catch(function () {
        renderHubError('Hub data is temporarily unavailable.');
      });
  }

  function fetchAssets(url) {
    if (!url) return Promise.resolve(null);
    return fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .catch(function () {
        return null;
      });
  }

  // ----- localStorage helpers -----

  function loadSignedPetitions() {
    try {
      const raw = localStorage.getItem('hub-signed-petitions');
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  function saveSignedPetition(petitionId) {
    const existing = loadSignedPetitions();
    existing[petitionId] = {
      signedAt: new Date().toISOString(),
      status: 'Signed'
    };
    localStorage.setItem('hub-signed-petitions', JSON.stringify(existing));
    return existing;
  }

  function loadLocalFeedback() {
    try {
      const raw = localStorage.getItem('hub-feedback-queue');
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  function saveLocalFeedback(feedback) {
    const existing = loadLocalFeedback();
    existing.unshift(feedback);
    localStorage.setItem('hub-feedback-queue', JSON.stringify(existing));
    return existing;
  }

  function loadLocalRecords() {
    try {
      const raw = localStorage.getItem('hub-records-requests');
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  function saveLocalRecord(request) {
    const existing = loadLocalRecords();
    existing.unshift(request);
    localStorage.setItem('hub-records-requests', JSON.stringify(existing));
    return existing;
  }

  // ----- renderers -----

  function renderSignedPetitions(localSignedIds, remotePetitions) {
    const container = document.getElementById('hub-signed-petitions');
    const emptyEl = document.getElementById('hub-signed-empty');
    if (!container) return;

    const signedRemote = (remotePetitions || []).filter(function (p) {
      return localSignedIds[p.id];
    });

    if (!signedRemote.length) {
      if (emptyEl) emptyEl.style.display = '';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    container.innerHTML = signedRemote.map(function (p) {
      const meta = localSignedIds[p.id];
      const signedDate = meta?.signedAt ? new Date(meta.signedAt).toLocaleDateString() : '';
      const progress = p.signatureGoal ? Math.min(100, Math.round((p.currentSignatures / p.signatureGoal) * 100)) : 0;
      return (
        '<article class="hub-card" data-id="' + escapeHtml(String(p.id)) + '">' +
          '<div class="hub-card-header">' +
            '<h3>' + escapeHtml(p.title || 'Untitled petition') + '</h3>' +
            '<span class="hub-status">Signed · ' + escapeHtml(signedDate) + '</span>' +
          '</div>' +
          '<p class="hub-card-description">' + escapeHtml(p.description || '') + '</p>' +
          '<div class="hub-card-meta">' +
            '<span class="hub-target">Target: ' + escapeHtml(p.target || '') + '</span>' +
            '<span class="hub-progress">' + p.currentSignatures + '/' + p.signatureGoal + ' signatures (' + progress + '%)</span>' +
            '<span class="hub-deadline">Deadline: ' + new Date(p.deadline).toLocaleDateString() + '</span>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderLocalFeedback(items) {
    const container = document.getElementById('hub-feedback-list');
    const emptyEl = document.getElementById('hub-feedback-empty');
    if (!container) return;

    if (!items.length) {
      if (emptyEl) emptyEl.style.display = '';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    container.innerHTML = items.map(function (item) {
      const date = new Date(item.timestamp).toLocaleString();
      return (
        '<article class="hub-card" data-id="' + escapeHtml(String(item.id)) + '">' +
          '<div class="hub-card-header">' +
            '<h3>' + escapeHtml(item.title || 'Untitled feedback') + '</h3>' +
            '<span class="hub-status">' + escapeHtml(item.status || 'Open') + '</span>' +
          '</div>' +
          '<p class="hub-card-description">' + escapeHtml(item.description || '') + '</p>' +
          '<div class="hub-card-meta">' +
            '<span class="hub-category">Category: ' + escapeHtml(item.category || 'General') + '</span>' +
            '<span class="hub-timestamp">Submitted: ' + escapeHtml(date) + '</span>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderUpcomingElections(entries) {
    const container = document.getElementById('hub-elections-list');
    if (!container) return;

    const elections = (entries.elections || []).filter(function (e) {
      return /scheduled|certified|open|vote/i.test(String(e.status || ''));
    });
    const referendums = (entries.referendums || []).filter(function (r) {
      return /scheduled|certified|open|vote/i.test(String(r.status || ''));
    });
    const items = [
      { _type: 'election', title: 'Elections', data: elections },
      { _type: 'referendum', title: 'Referendums', data: referendums }
    ].filter(function (group) { return group.data.length; });

    if (!items.length) {
      container.innerHTML = '<div class="hub-empty">No upcoming elections or referendums are currently open or scheduled.</div>';
      return;
    }

    const html = items.map(function (group) {
      const cards = group.data.map(function (entry) {
        const metaItems = [];
        if (entry.administeredBy) metaItems.push('Administered by: ' + escapeHtml(entry.administeredBy));
        if (entry.reportsTo) metaItems.push('Reports to: ' + escapeHtml(entry.reportsTo));
        if (entry.opened) metaItems.push('Opens: ' + escapeHtml(entry.opened));
        if (entry.closed) metaItems.push('Closes: ' + escapeHtml(entry.closed));
        if (entry.certified) metaItems.push('Certified: ' + escapeHtml(entry.certified));

        return (
          '<article class="hub-card">' +
            '<div class="hub-card-header">' +
              '<h3>' + escapeHtml(entry.title || 'Untitled election') + '</h3>' +
              '<span class="hub-status">' + escapeHtml(entry.status || '') + '</span>' +
            '</div>' +
            '<p class="hub-card-description">' + escapeHtml(entry.summary || '') + '</p>' +
            '<div class="hub-card-meta">' + metaItems.map(function (m) { return '<span>' + m + '</span>'; }).join('') + '</div>' +
          '</article>'
        );
      }).join('');

      return '<div class="hub-subsection">' +
        '<h3 class="hub-subsection-title">' + escapeHtml(group.title) + '</h3>' +
        cards +
      '</div>';
    }).join('');

    container.innerHTML = html;
  }

  function renderRecordsRequests(localRequests, transparencyEntries) {
    const container = document.getElementById('hub-records-list');
    const emptyEl = document.getElementById('hub-records-empty');
    if (!container) return;

    const disclosures = (transparencyEntries.disclosures || []).slice(0, 4);
    const all = [].concat(localRequests || [], disclosures || []);

    if (!all.length) {
      if (emptyEl) emptyEl.style.display = '';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    container.innerHTML = all.map(function (item) {
      const isLocal = !!localRequests && localRequests.indexOf(item) !== -1 || (item.savedAt || item.local === true);
      const date = isLocal ? new Date(item.timestamp).toLocaleString() : new Date(item.effective || item.completed || '').toLocaleDateString();
      return (
        '<article class="hub-card">' +
          '<div class="hub-card-header">' +
            '<h3>' + escapeHtml(item.title || 'Records request') + '</h3>' +
            '<span class="hub-status">' + escapeHtml(String(item.status || 'Saved')) + '</span>' +
          '</div>' +
          '<p class="hub-card-description">' + escapeHtml(item.summary || '') + '</p>' +
          '<div class="hub-card-meta">' +
            '<span class="hub-category">Category: ' + escapeHtml(item.category || 'General') + '</span>' +
            '<span class="hub-timestamp">' + escapeHtml(date || '') + '</span>' +
          '</div>' +
          (isLocal ? '<div class="hub-card-actions"><button class="button secondary remove-record" data-record-id="' + escapeHtml(String(item.id)) + '">Remove</button></div>' : '') +
        '</article>'
      );
    }).join('');

    container.querySelectorAll('.remove-record').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        const id = e.currentTarget.dataset.recordId;
        removeLocalRecord(id);
      });
    });
  }

  function removeLocalRecord(id) {
    let existing;
    try {
      const raw = localStorage.getItem('hub-records-requests');
      if (raw) existing = JSON.parse(raw);
    } catch {
      existing = [];
    }

    if (existing) {
      const next = existing.filter(function (item) { return String(item.id) !== String(id); });
      localStorage.setItem('hub-records-requests', JSON.stringify(next));
    }

    // refresh list using previously cached data direction
    loadHubData();
  }

  function updateHubStatus(signedPetitions, localRecords) {
    const signedCountEl = document.getElementById('hub-signed-count');
    const recordsCountEl = document.getElementById('hub-records-count');

    const signedIds = signedPetitions || {};
    const records = localRecords || [];

    if (signedCountEl) signedCountEl.textContent = Object.keys(signedIds).length;
    if (recordsCountEl) recordsCountEl.textContent = records.length;
  }

  // ----- attachments for quick actions -----

  function attachHubActions() {
    document.querySelectorAll('.hub-action-card').forEach(function (card) {
      card.addEventListener('click', function () {
        // page links are anchors, keep default behavior.
      });
    });
  }

  // ----- menu / year -----

  function setupMenu() {
    const menuButton = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    if (!menuButton || !menu) return;

    menuButton.addEventListener('click', function () {
      const open = menu.dataset.open === 'true';
      menu.dataset.open = String(!open);
      menu.setAttribute('aria-hidden', String(open));
      menuButton.setAttribute('aria-expanded', String(!open));
      if (!open) {
        const firstLink = menu.querySelector('a');
        if (firstLink) setTimeout(function () { firstLink.focus(); }, 0);
      }
    });

    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.dataset.open === 'true') {
        menu.dataset.open = 'false';
        menu.setAttribute('aria-hidden', 'true');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.focus();
      }
    });
  }

  function liveYear() {
    try {
      const yearEl = document.querySelector('[data-year]');
      if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    } catch {}
  }

  function renderHubError(message) {
    const selectors = [
      '#hub-signed-petitions',
      '#hub-feedback-list',
      '#hub-elections-list',
      '#hub-records-list'
    ];
    selectors.forEach(function (sel) {
      const el = document.querySelector(sel);
      if (el) el.innerHTML = '<div class="hub-empty">' + escapeHtml(message) + '</div>';
    });
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  attachHubActions();
})();
