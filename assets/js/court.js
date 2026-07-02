(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  let courtData = null;
  let currentFilter = { keyword: '', dateFrom: '', dateTo: '', rulingType: 'all', sort: 'date' };
  let selectedCaseNumber = null;

  function init() {
    loadCourtData();
    initFilters();
    initModal();
  }

  function loadCourtData() {
    fetch('assets/data/court.json')
      .then(response => response.json())
      .then(data => {
        courtData = data;
        renderDocket();
      })
      .catch(err => {
        console.warn('Failed to load court.json:', err);
        renderDocket();
      });
  }

  function renderDocket() {
    const container = document.getElementById('case-docket');
    if (!container || !courtData) return;

    let cases = [...courtData.cases];

    // Filter by keyword
    if (currentFilter.keyword) {
      const kw = currentFilter.keyword.toLowerCase();
      cases = cases.filter(c =>
        c.title.toLowerCase().includes(kw) ||
        c.caseNumber.toLowerCase().includes(kw) ||
        c.petitioner.toLowerCase().includes(kw) ||
        c.respondent.toLowerCase().includes(kw) ||
        (c.facts && c.facts.toLowerCase().includes(kw)) ||
        (c.precedentTags && c.precedentTags.some(t => t.toLowerCase().includes(kw)))
      );
    }

    // Filter by date range
    if (currentFilter.dateFrom) {
      const from = new Date(currentFilter.dateFrom);
      cases = cases.filter(c => new Date(c.filingDate) >= from);
    }
    if (currentFilter.dateTo) {
      const to = new Date(currentFilter.dateTo);
      to.setHours(23, 59, 59, 999);
      cases = cases.filter(c => new Date(c.filingDate) <= to);
    }

    // Filter by ruling type
    if (currentFilter.rulingType !== 'all') {
      cases = cases.filter(c => c.rulingType === currentFilter.rulingType);
    }

    // Sort
    cases.sort((a, b) => {
      if (currentFilter.sort === 'date') {
        return new Date(b.filingDate) - new Date(a.filingDate);
      } else if (currentFilter.sort === 'caseNumber') {
        return a.caseNumber.localeCompare(b.caseNumber);
      } else if (currentFilter.sort === 'status') {
        const statusOrder = { 'Under Review': 0, 'Pending': 1, 'Decided': 2 };
        return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
      }
      return 0;
    });

    const html = `
      <div class="docket-header">
        <div class="docket-stats">
          <span class="stat"><strong>${cases.length}</strong> cases</span>
          <span class="stat"><strong>${courtData.cases.filter(c => c.status === 'Decided').length}</strong> decided</span>
          <span class="stat"><strong>${courtData.cases.filter(c => c.status === 'Pending' || c.status === 'Under Review').length}</strong> pending</span>
        </div>
      </div>
      <table class="case-table" role="grid" aria-label="Court case docket">
        <thead>
          <tr>
            <th scope="col">Case Number</th>
            <th scope="col">Title</th>
            <th scope="col">Petitioner / Respondent</th>
            <th scope="col">Status</th>
            <th scope="col">Ruling</th>
            <th scope="col">Filing Date</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${cases.map(case_ => renderCaseRow(case_)).join('')}
        </tbody>
      </table>
      ${cases.length === 0 ? '<p class="activity-empty">No cases match the current filters.</p>' : ''}
    `;

    container.innerHTML = html;
    attachCaseRowListeners();
  }

  function renderCaseRow(case_) {
    const statusClass = 'status-' + case_.status.toLowerCase().replace(' ', '-');
    const rulingDisplay = case_.ruling ? `<span class="ruling-type">${escapeHtml(case_.rulingType || '—')}</span>` : '<span class="muted">—</span>';

    return `
      <tr class="case-row" data-case-number="${case_.caseNumber}">
        <td class="case-number-cell"><strong>${escapeHtml(case_.caseNumber)}</strong></td>
        <td class="case-title-cell">${escapeHtml(case_.title)}</td>
        <td class="case-parties-cell">
          <span class="petitioner">${escapeHtml(case_.petitioner)}</span>
          <span class="divider" aria-hidden="true">v.</span>
          <span class="respondent">${escapeHtml(case_.respondent)}</span>
        </td>
        <td><span class="activity-status ${statusClass}">${escapeHtml(case_.status)}</span></td>
        <td>${rulingDisplay}</td>
        <td>${formatDate(case_.filingDate)}</td>
        <td>
          <button class="button view-case" data-case-number="${case_.caseNumber}" aria-label="View details for ${escapeHtml(case_.title)}">View</button>
        </td>
      </tr>
    `;
  }

  function attachCaseRowListeners() {
    document.querySelectorAll('.view-case').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const caseNumber = e.currentTarget.dataset.caseNumber;
        openCaseModal(caseNumber);
      });
    });
  }

  function openCaseModal(caseNumber) {
    const case_ = courtData.cases.find(c => c.caseNumber === caseNumber);
    if (!case_) return;

    selectedCaseNumber = caseNumber;
    const modal = document.getElementById('case-modal');
    const content = document.getElementById('case-modal-content');

    const statusClass = 'status-' + case_.status.toLowerCase().replace(' ', '-');

    content.innerHTML = `
      <div class="case-modal-header">
        <h2>${escapeHtml(case_.title)}</h2>
        <span class="activity-status ${statusClass}">${escapeHtml(case_.status)}</span>
      </div>
      <div class="case-modal-meta">
        <dl>
          <dt>Case Number</dt><dd>${escapeHtml(case_.caseNumber)}</dd>
          <dt>Petitioner</dt><dd>${escapeHtml(case_.petitioner)}</dd>
          <dt>Respondent</dt><dd>${escapeHtml(case_.respondent)}</dd>
          <dt>Filing Date</dt><dd>${formatDateTime(case_.filingDate)}</dd>
          <dt>Status</dt><dd>${escapeHtml(case_.status)}</dd>
          ${case_.decisionDate ? `<dt>Decision Date</dt><dd>${formatDateTime(case_.decisionDate)}</dd>` : ''}
          ${case_.rulingType ? `<dt>Ruling Type</dt><dd>${escapeHtml(case_.rulingType)}</dd>` : ''}
        </dl>
      </div>

      <div class="case-modal-section">
        <h3>Facts</h3>
        <div class="case-facts">${escapeHtml(case_.facts).replace(/\n/g, '<br>')}</div>
      </div>

      <div class="case-modal-section">
        <h3>Legal Questions</h3>
        <ol class="legal-questions">
          ${case_.legalQuestions.map(q => `<li>${escapeHtml(q)}</li>`).join('')}
        </ol>
      </div>

      <div class="case-modal-section">
        <h3>Arguments</h3>
        <div class="arguments-grid">
          <div class="argument-panel petitioner">
            <h4>Petitioner (${escapeHtml(case_.petitioner)})</h4>
            <p>${escapeHtml(case_.arguments?.petitioner || 'No arguments recorded.')}</p>
          </div>
          <div class="argument-panel respondent">
            <h4>Respondent (${escapeHtml(case_.respondent)})</h4>
            <p>${escapeHtml(case_.arguments?.respondent || 'No arguments recorded.')}</p>
          </div>
        </div>
      </div>

      ${case_.opinion ? `
      <div class="case-modal-section">
        <h3>Court Opinion</h3>
        <div class="case-opinion">${escapeHtml(case_.opinion).replace(/\n/g, '<br>')}</div>
      </div>
      ` : case_.status !== 'Decided' ? `
      <div class="case-modal-section">
        <h3>Court Opinion</h3>
        <p class="muted">Opinion not yet issued. Case is ${case_.status.toLowerCase()}.</p>
      </div>
      ` : ''}

      ${case_.precedentTags && case_.precedentTags.length > 0 ? `
      <div class="case-modal-section">
        <h3>Precedent Tags</h3>
        <div class="precedent-tags">
          ${case_.precedentTags.map(tag => `<span class="pill precedent-tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
      ` : ''}
    `;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const modal = document.getElementById('case-modal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    selectedCaseNumber = null;
  }

  function initModal() {
    const modal = document.getElementById('case-modal');
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
    const keywordInput = document.getElementById('filter-keyword');
    const dateFromInput = document.getElementById('filter-date-from');
    const dateToInput = document.getElementById('filter-date-to');
    const rulingTypeSelect = document.getElementById('filter-ruling-type');
    const sortSelect = document.getElementById('filter-sort');

    [keywordInput, dateFromInput, dateToInput, rulingTypeSelect, sortSelect].forEach(el => {
      if (el) {
        el.addEventListener('change', () => {
          currentFilter.keyword = keywordInput?.value?.trim() || '';
          currentFilter.dateFrom = dateFromInput?.value || '';
          currentFilter.dateTo = dateToInput?.value || '';
          currentFilter.rulingType = rulingTypeSelect?.value || 'all';
          currentFilter.sort = sortSelect?.value || 'date';
          renderDocket();
        });
      }
    });

    // Also listen for input on keyword for live filtering
    if (keywordInput) {
      keywordInput.addEventListener('input', () => {
        currentFilter.keyword = keywordInput.value.trim();
        renderDocket();
      });
    }
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
    const _div = document.createElement('div');
    _div.textContent = str;
    return _div.innerHTML;
  }


  window.CourtModule = {
    refresh: () => renderDocket(),
    getData: () => courtData
  };
})();