// Загружаем данные пользователя из сессии (добавим эндпоинт /api/auth/me)
async function loadCurrentUser() {
  const res = await fetch('/api/auth/me');
  if (!res.ok) { window.location.href = '/index.html'; return null; }
  const user = await res.json();
  document.querySelectorAll('#userInfo').forEach(el => {
    el.innerHTML = `<strong style="color:#fff;">${user.username}</strong><br>
                    <span style="color:#94a3b8; font-size:.8rem;">${user.role}</span>`;
  });
  if (user.role === 'admin') {
    document.getElementById('adminLink').style.display = 'block';
  }
  return user;
}

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/index.html';
});

window.currentUser = loadCurrentUser();