(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  let assemblyData = null;
  let localVotes = null;
  let currentFilter = { status: 'all', chamber: 'all', sort: 'date' };
  let selectedBillId = null;

  function init() {
    loadLocalVotes();
    loadAssemblyData();
    initFilters();
    initModal();
  }

  function loadLocalVotes() {
    try {
      const stored = localStorage.getItem('assembly-votes');
      if (stored) {
        localVotes = JSON.parse(stored);
      } else {
        localVotes = {};
      }
    } catch (e) {
      console.warn('Failed to parse localStorage assembly votes:', e);
      localVotes = {};
    }
  }

  function saveLocalVotes() {
    try {
      localStorage.setItem('assembly-votes', JSON.stringify(localVotes));
    } catch (e) {
      console.warn('Failed to save assembly votes to localStorage:', e);
    }
  }

  function loadAssemblyData() {
    fetch('assets/data/assembly.json')
      .then(response => response.json())
      .then(data => {
        assemblyData = data;
        mergeLocalVotes();
        renderTracker();
      })
      .catch(err => {
        console.warn('Failed to load assembly.json:', err);
        renderTracker();
      });
  }

  function mergeLocalVotes() {
    if (!assemblyData || !localVotes) return;

    assemblyData.bills.forEach(bill => {
      const localVote = localVotes[bill.id];
      if (localVote) {
        bill.voteCounts = { ...bill.voteCounts, ...localVote.counts };
        bill.userVote = localVote.vote;
      }
    });
  }

  function isCitizenReady() {
    try {
      const readiness = localStorage.getItem('citizenship-readiness');
      if (readiness) {
        const data = JSON.parse(readiness);
        return data.ready === true || data.score >= 4;
      }
    } catch (e) {}
    return false;
  }

  function getCitizenshipStatus() {
    try {
      const citizenship = localStorage.getItem('aetheria-citizenship');
      if (citizenship) {
        return JSON.parse(citizenship);
      }
    } catch (e) {}
    return null;
  }

  function renderTracker() {
    const container = document.getElementById('bill-tracker');
    if (!container || !assemblyData) return;

    let bills = [...assemblyData.bills];

    // Filter
    if (currentFilter.status !== 'all') {
      bills = bills.filter(b => b.status === currentFilter.status);
    }
    if (currentFilter.chamber !== 'all') {
      bills = bills.filter(b => b.chamber === currentFilter.chamber);
    }

    // Sort
    bills.sort((a, b) => {
      if (currentFilter.sort === 'date') {
        return new Date(b.timeline[0]?.date || 0) - new Date(a.timeline[0]?.date || 0);
      } else if (currentFilter.sort === 'title') {
        return a.title.localeCompare(b.title);
      } else if (currentFilter.sort === 'status') {
        const statusOrder = { 'Introduced': 0, 'Debate': 1, 'Vote': 2, 'Enacted': 3, 'Rejected': 4 };
        return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
      }
      return 0;
    });

    const citizenReady = isCitizenReady();
    const citizenship = getCitizenshipStatus();

    const html = `
      <div class="bill-tracker-header">
        <div class="tracker-stats">
          <span class="stat"><strong>${bills.length}</strong> bills</span>
          <span class="stat"><strong>${assemblyData.bills.filter(b => b.status === 'Debate' || b.status === 'Vote').length}</strong> active</span>
          <span class="stat"><strong>${assemblyData.bills.filter(b => b.status === 'Enacted').length}</strong> enacted</span>
        </div>
        ${!citizenReady ? `
          <div class="citizen-notice">
            <span class="notice-icon">🔒</span>
            <span>Complete the <a href="tools.html#readiness">Readiness Self-Check</a> on Tools to unlock voting rights.</span>
          </div>
        ` : citizenship ? `
          <div class="citizen-notice ready">
            <span class="notice-icon">✓</span>
            <span>Voting enabled for <strong>${escapeHtml(citizenship.id || 'verified citizen')}</strong></span>
          </div>
        ` : `
          <div class="citizen-notice ready">
            <span class="notice-icon">✓</span>
            <span>Voting enabled (readiness verified)</span>
          </div>
        `}
      </div>
      <table class="bill-table" role="grid" aria-label="Assembly bill tracker">
        <thead>
          <tr>
            <th scope="col">Bill</th>
            <th scope="col">Sponsor</th>
            <th scope="col">Chamber</th>
            <th scope="col">Status</th>
            <th scope="col">Vote Tally</th>
            <th scope="col">Timeline</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${bills.map(bill => renderBillRow(bill, citizenReady)).join('')}
        </tbody>
      </table>
      ${bills.length === 0 ? '<p class="activity-empty">No bills match the current filters.</p>' : ''}
    `;

    container.innerHTML = html;
    attachBillRowListeners();
  }

  function renderBillRow(bill, citizenReady) {
    const statusClass = 'status-' + bill.status.toLowerCase().replace(' ', '-');
    const totalVotes = bill.voteCounts.yea + bill.voteCounts.nay + bill.voteCounts.abstain;
    const latestEvent = bill.timeline[bill.timeline.length - 1];

    let voteHtml = `
      <div class="vote-tally">
        <span class="vote-yeas" title="Yea">${bill.voteCounts.yea}</span>
        <span class="vote-nays" title="Nay">${bill.voteCounts.nay}</span>
        <span class="vote-abstains" title="Abstain">${bill.voteCounts.abstain}</span>
        ${totalVotes > 0 ? `<span class="vote-total">${totalVotes} total</span>` : ''}
      </div>
    `;

    let actionsHtml = `
      <button class="button view-bill" data-bill-id="${bill.id}" aria-label="View details for ${escapeHtml(bill.title)}">View</button>
    `;

    if ((bill.status === 'Debate' || bill.status === 'Vote') && citizenReady) {
      const hasVoted = bill.userVote;
      actionsHtml += `
        <div class="vote-buttons" data-bill-id="${bill.id}">
          ${!hasVoted ? `
            <button class="button vote-btn vote-yea" data-vote="yea" aria-label="Vote Yea">Yea</button>
            <button class="button vote-btn vote-nay" data-vote="nay" aria-label="Vote Nay">Nay</button>
            <button class="button vote-btn vote-abstain" data-vote="abstain" aria-label="Abstain">Abstain</button>
          ` : `
            <span class="voted-badge">Voted: ${bill.userVote.toUpperCase()}</span>
          `}
        </div>
      `;
    }

    return `
      <tr class="bill-row" data-bill-id="${bill.id}">
        <td class="bill-title-cell">
          <strong>${escapeHtml(bill.title)}</strong>
          <span class="bill-id">${escapeHtml(bill.id)}</span>
        </td>
        <td>${escapeHtml(bill.sponsor)}</td>
        <td>${escapeHtml(bill.chamber)}</td>
        <td><span class="activity-status ${statusClass}">${escapeHtml(bill.status)}</span></td>
        <td>${voteHtml}</td>
        <td class="timeline-cell">
          <span class="timeline-date">${latestEvent ? formatDate(latestEvent.date) : '—'}</span>
          <span class="timeline-event">${latestEvent ? escapeHtml(latestEvent.event) : 'No events'}</span>
        </td>
        <td>${actionsHtml}</td>
      </tr>
    `;
  }

  function attachBillRowListeners() {
    document.querySelectorAll('.view-bill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const billId = e.currentTarget.dataset.billId;
        openBillModal(billId);
      });
    });

    document.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const billId = e.currentTarget.closest('.vote-buttons').dataset.billId;
        const vote = e.currentTarget.dataset.vote;
        castVote(billId, vote);
      });
    });
  }

  function castVote(billId, vote) {
    const bill = assemblyData.bills.find(b => b.id === billId);
    if (!bill) return;

    if (bill.userVote) {
      showToast('You have already voted on this bill.');
      return;
    }

    if (!localVotes[billId]) {
      localVotes[billId] = { vote: null, counts: {} };
    }

    // Update local vote record
    localVotes[billId].vote = vote;
    localVotes[billId].counts[vote] = (localVotes[billId].counts[vote] || 0) + 1;
    saveLocalVotes();

    // Update bill data
    bill.voteCounts[vote] = (bill.voteCounts[vote] || 0) + 1;
    bill.userVote = vote;

    // Re-render
    renderTracker();
    showToast(`Vote cast: ${vote.toUpperCase()}`);
  }

  function openBillModal(billId) {
    const bill = assemblyData.bills.find(b => b.id === billId);
    if (!bill) return;

    selectedBillId = billId;
    const modal = document.getElementById('bill-modal');
    const content = document.getElementById('bill-modal-content');

    const statusClass = 'status-' + bill.status.toLowerCase().replace(' ', '-');
    const citizenReady = isCitizenReady();
    const hasVoted = bill.userVote;

    content.innerHTML = `
      <div class="bill-modal-header">
        <h2>${escapeHtml(bill.title)}</h2>
        <span class="activity-status ${statusClass}">${escapeHtml(bill.status)}</span>
      </div>
      <div class="bill-modal-meta">
        <dl>
          <dt>Bill ID</dt><dd>${escapeHtml(bill.id)}</dd>
          <dt>Sponsor</dt><dd>${escapeHtml(bill.sponsor)}</dd>
          <dt>Chamber</dt><dd>${escapeHtml(bill.chamber)}</dd>
          <dt>Introduced</dt><dd>${formatDateTime(bill.timeline[0]?.date)}</dd>
          <dt>Current Status</dt><dd>${escapeHtml(bill.status)}</dd>
        </dl>
      </div>

      <div class="bill-modal-section">
        <h3>Vote Tally</h3>
        <div class="vote-tally-detail">
          <div class="vote-bar">
            <div class="vote-bar-fill vote-bar-yea" style="width: ${bill.voteCounts.yea + bill.voteCounts.nay + bill.voteCounts.abstain > 0 ? (bill.voteCounts.yea / (bill.voteCounts.yea + bill.voteCounts.nay + bill.voteCounts.abstain) * 100) : 0}%"></div>
            <div class="vote-bar-fill vote-bar-nay" style="width: ${bill.voteCounts.yea + bill.voteCounts.nay + bill.voteCounts.abstain > 0 ? (bill.voteCounts.nay / (bill.voteCounts.yea + bill.voteCounts.nay + bill.voteCounts.abstain) * 100) : 0}%"></div>
            <div class="vote-bar-fill vote-bar-abstain" style="width: ${bill.voteCounts.yea + bill.voteCounts.nay + bill.voteCounts.abstain > 0 ? (bill.voteCounts.abstain / (bill.voteCounts.yea + bill.voteCounts.nay + bill.voteCounts.abstain) * 100) : 0}%"></div>
          </div>
          <div class="vote-counts">
            <span class="vote-count yea">Yea: ${bill.voteCounts.yea}</span>
            <span class="vote-count nay">Nay: ${bill.voteCounts.nay}</span>
            <span class="vote-count abstain">Abstain: ${bill.voteCounts.abstain}</span>
          </div>
          ${(bill.status === 'Debate' || bill.status === 'Vote') && citizenReady && !hasVoted ? `
            <div class="modal-vote-actions">
              <button class="button primary vote-btn" data-vote="yea">Vote Yea</button>
              <button class="button vote-btn" data-vote="nay">Vote Nay</button>
              <button class="button vote-btn" data-vote="abstain">Abstain</button>
            </div>
          ` : hasVoted ? `<p class="voted-notice">You voted: <strong>${hasVoted.toUpperCase()}</strong></p>` : ''}
        </div>
      </div>

      <div class="bill-modal-section">
        <h3>Full Text</h3>
        <pre class="bill-full-text">${escapeHtml(bill.fullText)}</pre>
      </div>

      ${bill.amendments.length > 0 ? `
      <div class="bill-modal-section">
        <h3>Amendments (${bill.amendments.length})</h3>
        <div class="amendments-list">
          ${bill.amendments.map(amend => `
            <article class="amendment-card">
              <div class="amendment-header">
                <h4>${escapeHtml(amend.title)}</h4>
                <span class="activity-status status-${amend.status.toLowerCase()}">${escapeHtml(amend.status)}</span>
              </div>
              <p class="amendment-meta">Sponsored by ${escapeHtml(amend.sponsor)} · ${formatDate(amend.date)}</p>
              <p class="amendment-text">${escapeHtml(amend.text)}</p>
              <div class="amendment-votes">
                <span>Yea: ${amend.voteCounts.yea}</span>
                <span>Nay: ${amend.voteCounts.nay}</span>
                <span>Abstain: ${amend.voteCounts.abstain}</span>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${bill.debateLog.length > 0 ? `
      <div class="bill-modal-section">
        <h3>Debate Log (${bill.debateLog.length})</h3>
        <div class="debate-log">
          ${bill.debateLog.map(entry => `
            <article class="debate-entry" data-type="${entry.type}">
              <header>
                <span class="debate-speaker">${escapeHtml(entry.speaker)}</span>
                <time class="debate-time" datetime="${entry.timestamp}">${formatDateTime(entry.timestamp)}</time>
                <span class="debate-type">${escapeHtml(entry.type)}</span>
              </header>
              <p>${escapeHtml(entry.text)}</p>
            </article>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${bill.voteHistory.length > 0 ? `
      <div class="bill-modal-section">
        <h3>Vote History</h3>
        <table class="vote-history-table">
          <thead>
            <tr><th>Date</th><th>Vote Type</th><th>Result</th><th>Yea</th><th>Nay</th><th>Abstain</th></tr>
          </thead>
          <tbody>
            ${bill.voteHistory.map(v => `
              <tr>
                <td>${formatDate(v.date)}</td>
                <td>${escapeHtml(v.voteType)}</td>
                <td><span class="activity-status status-${v.result.toLowerCase()}">${escapeHtml(v.result)}</span></td>
                <td>${v.yea}</td>
                <td>${v.nay}</td>
                <td>${v.abstain}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
    `;

    // Attach modal vote listeners
    content.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const vote = e.currentTarget.dataset.vote;
        closeModal();
        castVote(billId, vote);
      });
    });

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const modal = document.getElementById('bill-modal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    selectedBillId = null;
  }

  function initModal() {
    const modal = document.getElementById('bill-modal');
    if (!modal) return;

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
    });
  }

  function initFilters() {
    const statusFilter = document.getElementById('filter-status');
    const chamberFilter = document.getElementById('filter-chamber');
    const sortSelect = document.getElementById('filter-sort');

    [statusFilter, chamberFilter, sortSelect].forEach(el => {
      if (el) {
        el.addEventListener('change', () => {
          currentFilter.status = statusFilter?.value || 'all';
          currentFilter.chamber = chamberFilter?.value || 'all';
          currentFilter.sort = sortSelect?.value || 'date';
          renderTracker();
        });
      }
    });
  }

  function formatDate(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function formatDateTime(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' +
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, "\\'");
    }

  function showToast(message) {
    const existing = document.querySelector('.assembly-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'assembly-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  window.AssemblyModule = {
    refresh: () => renderTracker(),
    getData: () => assemblyData
  };
})();