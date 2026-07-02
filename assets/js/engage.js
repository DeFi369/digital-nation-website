(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initPetitionForm();
    initFeedbackForm();
    initCivicFeed();
    loadCivicData();
  }

  let civicData = null;
  let localData = null;

  function loadCivicData() {
    try {
      const stored = localStorage.getItem('civic-data');
      if (stored) {
        localData = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse localStorage civic data:', e);
    }

    fetch('assets/data/civic.json')
      .then(response => response.json())
      .then(data => {
        civicData = data;
        mergeAndRender();
      })
      .catch(err => {
        console.warn('Failed to load civic.json:', err);
        if (localData) {
          mergeAndRender();
        } else {
          renderFeed([]);
        }
      });
  }

  function mergeAndRender() {
    const merged = {
      petitions: [...(civicData?.petitions || []), ...(localData?.petitions || [])],
      feedback: [...(civicData?.feedback || []), ...(localData?.feedback || [])],
      governanceActions: [...(civicData?.governanceActions || []), ...(localData?.governanceActions || [])]
    };
    renderFeed(merged);
    initFeedFilters();
  }

  function getAllItems(data) {
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
    return items;
  }

  function renderFeed(data) {
    const container = document.getElementById('civic-activity-feed');
    if (!container) return;

    const items = getAllItems(data);
    if (!items.length) {
      container.innerHTML = '<p class="activity-empty">No civic activity yet. Be the first to create a petition or submit feedback!</p>';
      return;
    }

    const typeFilter = document.getElementById('feed-filter-type')?.value || 'all';
    const statusFilter = document.getElementById('feed-filter-status')?.value || 'all';
    const sortBy = document.getElementById('civic-feed-sort')?.value || 'date';

    let filtered = items.filter(item => {
      if (typeFilter !== 'all' && item._type !== typeFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      return true;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b._sortDate) - new Date(a._sortDate);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'status') {
        const statusOrder = { open: 0, 'in-progress': 1, scheduled: 2, complete: 3, closed: 4 };
        return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
      }
      return 0;
    });

    const html = filtered.map(item => renderActivityItem(item)).join('');
    container.innerHTML = html;
  }

  function renderActivityItem(item) {
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
          <span class="activity-target">Target: ${escapeHtml(item.target)}</span>
          <span class="activity-progress">${item.currentSignatures}/${item.signatureGoal} signatures (${progress}%)</span>
          <span class="activity-deadline">Deadline: ${new Date(item.deadline).toLocaleDateString()}</span>
        </div>`;
    } else if (item._type === 'feedback') {
      metaHtml = `
        <div class="activity-meta">
          <span class="activity-type">${escapeHtml(typeLabel)}</span>
          <span class="activity-category">Category: ${escapeHtml(item.category)}</span>
          ${item.metadata?.contact ? `<span class="activity-contact">Contact: ${escapeHtml(item.metadata.contact)}</span>` : ''}
        </div>`;
    } else {
      metaHtml = `
        <div class="activity-meta">
          <span class="activity-type">${escapeHtml(typeLabel)}</span>
          ${item.metadata?.session ? `<span class="activity-session">Session: ${escapeHtml(item.metadata.session)}</span>` : ''}
          ${item.metadata?.ministry ? `<span class="activity-ministry">Ministry: ${escapeHtml(item.metadata.ministry)}</span>` : ''}
          ${item.metadata?.directiveId ? `<span class="activity-directive">Directive: ${escapeHtml(item.metadata.directiveId)}</span>` : ''}
        </div>`;
    }

    return `
      <article class="activity-item activity-${item._type}" data-id="${escapeHtml(item.id)}" data-type="${item._type}" data-status="${item.status}">
        <div class="activity-content">
          <h3 class="activity-title">${escapeHtml(item.title)}</h3>
          ${item.description ? `<p class="activity-description">${escapeHtml(item.description)}</p>` : ''}
          ${metaHtml}
        </div>
        <div class="activity-sidebar">
          <span class="activity-status ${statusClass}">${escapeHtml(item.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()))}</span>
          <time class="activity-timestamp" datetime="${item._sortDate}">${formattedDate} at ${formattedTime}</time>
        </div>
      </article>
    `;
  }

  function initFeedFilters() {
    const typeFilter = document.getElementById('feed-filter-type');
    const statusFilter = document.getElementById('feed-filter-status');
    const sortSelect = document.getElementById('civic-feed-sort');

    [typeFilter, statusFilter, sortSelect].forEach(el => {
      if (el) {
        el.addEventListener('change', () => {
          if (civicData || localData) {
            mergeAndRender();
          }
        });
      }
    });
  }

  function initCivicFeed() {
    const container = document.getElementById('civic-activity-feed');
    if (!container) return;
    renderFeed({ petitions: [], feedback: [], governanceActions: [] });
  }

  function initPetitionForm() {
    const form = document.getElementById('petition-form');
    if (!form) return;

    const deadlineInput = document.getElementById('petition-deadline');
    if (deadlineInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      deadlineInput.min = tomorrow.toISOString().split('T')[0];
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const petition = {
        id: 'pet-' + Date.now().toString(36),
        type: 'petition',
        title: formData.get('title').trim(),
        description: formData.get('description').trim(),
        target: formData.get('target'),
        signatureGoal: parseInt(formData.get('signatureGoal'), 10),
        currentSignatures: 1,
        deadline: formData.get('deadline') + 'T23:59:59Z',
        status: 'open',
        timestamp: new Date().toISOString(),
        metadata: {
          category: 'citizen-initiative',
          initiator: 'local-user'
        }
      };

      saveLocalPetition(petition);
      form.reset();
      showToast('Petition submitted successfully! It will appear in the activity feed.');
      mergeAndRender();
    });
  }

  function initFeedbackForm() {
    const form = document.getElementById('feedback-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const feedback = {
        id: 'fb-' + Date.now().toString(36),
        type: 'feedback',
        title: formData.get('title').trim(),
        subject: formData.get('subject').trim(),
        description: formData.get('description').trim(),
        category: formData.get('category'),
        status: 'open',
        timestamp: new Date().toISOString(),
        metadata: {}
      };

      const contact = formData.get('contact')?.trim();
      if (contact) {
        feedback.metadata.contact = contact;
      }

      saveLocalFeedback(feedback);
      form.reset();
      showToast('Feedback submitted successfully! It will appear in the activity feed.');
      mergeAndRender();
    });
  }

  function saveLocalPetition(petition) {
    try {
      const stored = localStorage.getItem('civic-data');
      const data = stored ? JSON.parse(stored) : { petitions: [], feedback: [], governanceActions: [] };
      data.petitions = data.petitions || [];
      data.petitions.unshift(petition);
      localStorage.setItem('civic-data', JSON.stringify(data));
      localData = data;
    } catch (e) {
      console.warn('Failed to save petition to localStorage:', e);
    }
  }

  function saveLocalFeedback(feedback) {
    try {
      const stored = localStorage.getItem('civic-data');
      const data = stored ? JSON.parse(stored) : { petitions: [], feedback: [], governanceActions: [] };
      data.feedback = data.feedback || [];
      data.feedback.unshift(feedback);
      localStorage.setItem('civic-data', JSON.stringify(data));
      localData = data;
    } catch (e) {
      console.warn('Failed to save feedback to localStorage:', e);
    }
  }

  function showToast(message) {
    const existing = document.querySelector('.civic-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'civic-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, ''');
  }

  window.CivicEngagement = {
    refreshFeed: () => mergeAndRender(),
    getData: () => ({ civic: civicData, local: localData })
  };
})();
