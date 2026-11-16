async function renderTasks() {
  await window.currentUser;
  const res = await fetch('/api/tasks');
  if (!res.ok) return;
  const tasks = await res.json();

  const grid = document.getElementById('tasksGrid');
  if (!tasks.length) {
    grid.innerHTML = `<p style="color:var(--muted);">Задач пока нет.</p>`;
    return;
  }

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

  // Статистика
  const stats = { todo: 0, in_progress: 0, review: 0, done: 0 };
  tasks.forEach(t => stats[t.status]++);
  document.getElementById('stats').innerHTML = Object.entries(stats)
    .map(([k, v]) => `
      <div style="background:#fff; border:1px solid var(--border); border-radius:12px; padding:1rem;">
        <div style="font-size:.75rem; color:var(--muted); text-transform:uppercase;">${k}</div>
        <div style="font-size:1.75rem; font-weight:700;">${v}</div>
      </div>
    `).join('');
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'"', "'":'&#39;'
  }[c]));
}

renderTasks();