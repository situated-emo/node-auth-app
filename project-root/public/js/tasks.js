let searchTimeout = null;

function getFilterParams() {
  const params = new URLSearchParams();
  const q = document.getElementById('filterSearch')?.value.trim();
  const status = document.getElementById('filterStatus')?.value;
  const priority = document.getElementById('filterPriority')?.value;
  const assigneeId = document.getElementById('filterAssignee')?.value;

  if (q) params.set('q', q);
  if (status) params.set('status', status);
  if (priority) params.set('priority', priority);
  if (assigneeId) params.set('assignee_id', assigneeId);

  return params;
}

function syncFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const searchEl = document.getElementById('filterSearch');
  const statusEl = document.getElementById('filterStatus');
  const priorityEl = document.getElementById('filterPriority');
  const assigneeEl = document.getElementById('filterAssignee');

  if (searchEl && params.has('q')) searchEl.value = params.get('q');
  if (statusEl && params.has('status')) statusEl.value = params.get('status');
  if (priorityEl && params.has('priority')) priorityEl.value = params.get('priority');
  if (assigneeEl && params.has('assignee_id')) assigneeEl.value = params.get('assignee_id');
}

function updateBrowserUrl(params) {
  const query = params.toString();
  const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState({}, '', newUrl);
}

async function initFilters() {
  const user = await window.currentUser;
  const assigneeSelect = document.getElementById('filterAssignee');

  // Фильтр по исполнителю доступен только manager и admin
  if (assigneeSelect && user && (user.role === 'manager' || user.role === 'admin')) {
    assigneeSelect.style.display = 'inline-block';
    const res = await fetch('/api/auth/users');
    if (res.ok) {
      const users = await res.json();
      assigneeSelect.innerHTML += users
        .map(u => `<option value="${u.id}">${escapeHtml(u.username)} (${escapeHtml(u.role)})</option>`)
        .join('');
    }
  }

  syncFiltersFromUrl();

  document.getElementById('filterSearch')?.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => renderTasks(), 300);
  });

  ['filterStatus', 'filterPriority', 'filterAssignee'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => renderTasks());
  });

  document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
    if (document.getElementById('filterSearch')) document.getElementById('filterSearch').value = '';
    if (document.getElementById('filterStatus')) document.getElementById('filterStatus').value = '';
    if (document.getElementById('filterPriority')) document.getElementById('filterPriority').value = '';
    if (document.getElementById('filterAssignee')) document.getElementById('filterAssignee').value = '';
    renderTasks();
  });
}
async function renderTasks() {
  await window.currentUser;
  const params = getFilterParams();
  updateBrowserUrl(params);
  const query = params.toString();
  const url = query ? `/api/tasks?${query}` : '/api/tasks';
  const res = await fetch(url);
  if (!res.ok) return;
  const tasks = await res.json();

  const grid = document.getElementById('tasksGrid');
  if (!tasks.length) {
    grid.innerHTML = `<p style="color:var(--muted);">Задачи не найдены.</p>`;
  } else {
    grid.innerHTML = tasks.map(t => `
      <article class="task-card" onclick="location.href='/task.html?id=${t.id}'">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:.5rem;">
          <h3>${escapeHtml(t.title)}</h3>
          <span class="badge-status ${t.status}">${t.status}</span>
        </div>
        <div class="task-meta">
          <span class="badge-priority ${t.priority}">${t.priority}</span>
          <span>📁 ${escapeHtml(t.project_title)}</span>
          ${t.assignee_name ? `<span>👤 ${escapeHtml(t.assignee_name)}</span>` : ''}
          ${t.due_date ? `<span>📅 ${t.due_date}</span>` : ''}
        </div>
        ${t.description ? `<p style="font-size:.85rem; color:var(--muted); margin:0;">${escapeHtml(t.description.slice(0,120))}...</p>` : ''}
      </article>
    `).join('');
    }
  // Статистика
  const statsEl = document.getElementById('stats');
  if (StatsEl) {
    const stats = { todo: 0, in_progress: 0, review: 0, done: 0 };
    tasks.forEach(t => { if (stats[t.status] !== undefined) stats[t.status]++; })
    statsEl.innerHTML = Object.entries(stats)
      .map(([k, v]) => `
        <div style="background:#fff; border:1px solid var(--border); border-radius:12px; padding:1rem;">
          <div style="font-size:.75rem; color:var(--muted); text-transform:uppercase;">${k}</div>
          <div style="font-size:1.75rem; font-weight:700;">${v}</div>
        </div>
      `).join('');
  }
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'"', "'":'&#39;'
  }[c]));
}

initFilters().then(() => renderTasks());