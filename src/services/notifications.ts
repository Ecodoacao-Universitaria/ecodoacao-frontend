// Serviço simples de notificações (armazena em localStorage e renderiza dropdown)
const STORAGE_KEY = 'ecodoacao_notifications';

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  date: string; // ISO
  read?: boolean;
  link?: string;
};

export function initNotifications() {
  // renderizar ao inicializar
  renderNotifications();
  // o fechamento do dropdown ao clicar fora é tratado pelo Bootstrap
}

export function getNotifications(): NotificationItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function saveNotifications(items: NotificationItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addNotification(title: string, message: string, link?: string) {
  const items = getNotifications();
  const item: NotificationItem = {
    id: Date.now(),
    title,
    message,
    date: new Date().toISOString(),
    read: false,
    link
  };
  items.unshift(item);
  saveNotifications(items);
  renderNotifications();
  // Disparar um evento global para que a aplicação possa reagir (ex.: exibir um toast)
  try {
    const ev = new CustomEvent('ecodoacao:notification', { detail: { title, message, link } });
    window.dispatchEvent(ev);
  } catch (e) {
    // ignorar se o ambiente não suportar CustomEvent
  }
}

export function markAsRead(id: number) {
  const items = getNotifications();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return;
  items[idx].read = true;
  saveNotifications(items);
  renderNotifications();
}

export function clearNotifications() {
  saveNotifications([]);
  renderNotifications();
}

function renderNotifications() {
  const menu = document.getElementById('notificationMenu');
  const countEl = document.getElementById('notificationCount');
  if (!menu || !countEl) return;
  const items = getNotifications();
  // atualizar contador
  const unread = items.filter(i => !i.read).length;
  if (unread > 0) {
    countEl.style.display = 'inline-block';
    countEl.textContent = String(unread);
  } else {
    countEl.style.display = 'none';
  }

  menu.innerHTML = '';
  if (items.length === 0) {
    const li = document.createElement('li');
    li.className = 'dropdown-item text-muted small';
    li.textContent = 'Nenhuma notificação';
    menu.appendChild(li);
    return;
  }

  for (const it of items.slice(0, 20)) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = it.link || '#';
    a.className = 'dropdown-item d-flex align-items-start gap-2';
    a.dataset.id = String(it.id);
    if (!it.read) a.classList.add('fw-semibold');
    a.innerHTML = `
      <div style="flex:1">
        <div class="small text-truncate">${escapeHtml(it.title)}</div>
        <div class="small text-muted text-truncate">${escapeHtml(it.message)}</div>
        <div class="small text-muted">${new Date(it.date).toLocaleString()}</div>
      </div>
    `;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      // marcar como lida e navegar para o link, se existir
      markAsRead(it.id);
      if (it.link) location.href = it.link;
    });
    li.appendChild(a);
    menu.appendChild(li);
  }

  const hr = document.createElement('li');
  hr.innerHTML = '<hr class="dropdown-divider">';
  menu.appendChild(hr);

  const clearLi = document.createElement('li');
  clearLi.className = 'text-center';
  clearLi.innerHTML = '<button class="btn btn-sm btn-link text-danger">Limpar notificações</button>';
  clearLi.querySelector('button')?.addEventListener('click', (e) => {
    e.preventDefault();
    clearNotifications();
  });
  menu.appendChild(clearLi);
}

function escapeHtml(s: string) {
  const d = document.createElement('div'); d.textContent = s; return d.innerHTML;
}
