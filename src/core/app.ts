// Importar serviços compartilhados
import { injectNavbar } from '../services/navbar';
import { populateDonationTypes } from '../services/donationType';
import { initNotifications, addNotification } from '../services/notifications';
import { getBalance, setBalance } from '../services/wallet';

document.addEventListener('DOMContentLoaded', () => {
  // Injetar navbar para navegação entre páginas
  injectNavbar();

  // Initialize notifications (renders badge/dropdown)
  initNotifications();
  // Atualiza exibição do saldo na inicialização
  try { const b = getBalance(); setBalance(b); } catch (e) { /* ignore */ }
  // Show immediate toast when a notification is created elsewhere
  window.addEventListener('ecodoacao:notification', (ev: any) => {
    try {
      const d = ev?.detail || {};
      const title = d.title ? String(d.title) : 'Notificação';
      const message = d.message ? String(d.message) : '';
      // Use success variant for approval-like notifications; that can be adjusted if needed
      showToast(`${title}: ${message}`, 'success', 5000);
    } catch (e) {
      // ignore
    }
  });

  // Sincronização entre abas: atualizar saldo e badges quando localStorage mudar em outra aba
  window.addEventListener('storage', (e: StorageEvent) => {
    try {
      if (!e.key) return;
      if (e.key === 'ecodoacao_balance') {
        const val = Number(localStorage.getItem('ecodoacao_balance') || '0');
        const amount = document.getElementById('balanceAmount');
        if (amount) amount.textContent = String(val);
        const userBalance = document.getElementById('userBalance');
        if (userBalance) userBalance.innerHTML = `💰 <span id="balanceAmount">${val}</span> Moedas`;
      }
      if (e.key === 'ecodoacao_owned_badges') {
        const owned: number[] = JSON.parse(localStorage.getItem('ecodoacao_owned_badges') || '[]');
        for (const el of Array.from(document.querySelectorAll('[data-badge-id]'))) {
          const node = el as HTMLElement;
          const id = Number(node.dataset.badgeId);
          if (isNaN(id)) continue;
          if (owned.includes(id)) {
            node.classList.add('owned');
            if (!node.querySelector('.owned-overlay')) {
              const overlay = document.createElement('div');
              overlay.className = 'owned-overlay';
              overlay.innerHTML = '<span class="dot"></span><span style="margin-left:6px">Conquistada</span>';
              node.appendChild(overlay);
            }
          } else {
            node.classList.remove('owned');
            const o = node.querySelector('.owned-overlay');
            if (o) o.remove();
          }
        }
      }
    } catch (err) {
      // ignore
    }
  });

  // Configurar links com atributo data-href
  for (const el of document.querySelectorAll('[data-href]')) {
    el.addEventListener('click', () => {
      const target = (el as HTMLElement).dataset.href;
      if (target) globalThis.location.href = target;
    });
  }

  // Popular tipos de doação globalmente
  populateDonationTypes();

  // Configurar funcionalidades específicas por página
  setupPageSpecific();
});

function setupPageSpecific() {
  // Auth pages (login and cadastro)
  setupAuthPages();
  
  // Submissão page
  setupSubmissaoPage();
  
  // Histórico page
  setupHistoricoPage();
  
  // Admin page
  setupAdminPage();
}

// ============ PÁGINAS DE AUTENTICAÇÃO ============
function setupAuthPages() {
  setupLoginForm();
  setupCadastroForm();
}

function setupLoginForm() {
  const loginForm = document.getElementById('loginForm') as HTMLFormElement | null;
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = ((document.getElementById('email') as HTMLInputElement)?.value) || '';
      if (!email.endsWith('@ufrpe.br')) {
        showToast('Use seu e-mail institucional (@ufrpe.br)', 'danger');
        return;
      }
      showToast('Login realizado com sucesso!', 'success');
      setTimeout(() => (globalThis.location.href = 'dashboard.html'), 700);
    });
  }
}

function setupCadastroForm() {
  const cadastroForm = document.getElementById('cadastroForm') as HTMLFormElement | null;
  if (cadastroForm) {
    cadastroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = ((document.getElementById('email') as HTMLInputElement)?.value) || '';
      const senha = ((document.getElementById('senha') as HTMLInputElement)?.value) || '';
      const confirmar = ((document.getElementById('confirmar') as HTMLInputElement)?.value) || '';
      if (!email.endsWith('@ufrpe.br')) {
        showToast('O e-mail deve ser institucional (@ufrpe.br)', 'danger');
        return;
      }
      if (senha !== confirmar) {
        showToast('As senhas não coincidem!', 'warning');
        return;
      }
      showToast('Cadastro realizado com sucesso!', 'success');
      setTimeout(() => (globalThis.location.href = 'dashboard.html'), 700);
    });
  }
}

// ============ SUBMISSÃO PAGE ============
function setupSubmissaoPage() {
  const doacaoForm = document.getElementById('doacaoForm');
  if (!doacaoForm) return;

  // mostrar o nome do arquivo selecionado em submissao.html
  const fotoInput = document.getElementById('foto') as HTMLInputElement;
  const fotoFilenameEl = document.getElementById('fotoFilename');
  if (fotoInput && fotoFilenameEl) {
    fotoInput.addEventListener('change', () => {
      const name = fotoInput.files?.[0]?.name ?? 'Nenhum arquivo selecionado';
      fotoFilenameEl.textContent = 'Arquivo: ' + name;
      fotoFilenameEl.style.whiteSpace = 'normal';
      fotoFilenameEl.style.wordBreak = 'break-all';
      fotoFilenameEl.style.overflowWrap = 'anywhere';
    });
    if (fotoInput.files?.[0]) fotoFilenameEl.textContent = 'Arquivo: ' + fotoInput.files[0].name;
  }

  doacaoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const foto = document.getElementById('foto') as HTMLInputElement;
    if (!foto?.files?.[0]) {
      showToast('Envie uma foto da doação.', 'warning');
      return;
    }
    const tipo = (document.getElementById('tipo') as HTMLSelectElement)?.value ?? 'Outro';
    const descricao = (document.getElementById('descricao') as HTMLInputElement)?.value ?? '';
    const arquivoNome = foto.files[0].name;
    const submission = {
      id: Date.now(),
      tipo,
      descricao,
      arquivoNome,
      data: new Date().toISOString(),
      status: 'Enviado para validação'
    };
    saveSubmission(submission);
    showToast('Doação salva localmente e enviada para validação (simulado)', 'success');
    setTimeout(() => (globalThis.location.href = 'historico.html'), 700);
  });
}

// ============ PÁGINA DE HISTÓRICO ============
function setupHistoricoPage() {
  const list = document.getElementById('historicoList') as HTMLUListElement | null;
  if (!list) return;
  const submissions = getSubmissions();
  renderSubmissions(list, submissions);
}

function renderSubmissions(list: HTMLUListElement, submissions: any[]) {
  list.innerHTML = '';
  if (!submissions?.length) {
    const li = document.createElement('li');
    li.className = 'list-group-item text-muted';
    li.innerText = 'Nenhuma doação registrada ainda.';
    list.appendChild(li);
    return;
  }
  for (const s of submissions) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start';
    const left = document.createElement('div');
    left.innerHTML = `<div class="fw-bold">${escapeHtml(s.tipo)}</div><div class="text-muted small">${escapeHtml(s.descricao)}</div><div class="text-muted small">${new Date(s.data).toLocaleString()}</div>`;
    const right = document.createElement('div');
    let badgeClass = 'bg-secondary';
    if (s.status.toLowerCase().includes('aprov')) {
      badgeClass = 'bg-success';
    } else if (s.status.toLowerCase().includes('enviado')) {
      badgeClass = 'bg-warning text-dark';
    }
    right.innerHTML = `<span class="badge ${badgeClass}">${escapeHtml(s.status)}</span>`;
    li.appendChild(left);
    li.appendChild(right);
    list.appendChild(li);
  }
}

// ============ PÁGINA DE ADMIN ============
function setupAdminPage() {
  const panel = document.getElementById('adminPanel');
  if (!panel) return;
  const submissions = getSubmissions();
  const pending = submissions.filter((s: any) => /enviado|valida|pend/i.test(s.status));
  renderAdminPanel(panel, pending);
}

function renderAdminPanel(container: HTMLElement, submissions: any[]) {
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card shadow-sm';
  const body = document.createElement('div');
  body.className = 'card-body p-3';

  const controls = document.createElement('div');
  controls.className = 'mb-3';
  controls.innerHTML = `
    <div class="d-flex align-items-center gap-3 w-100">
      <div class="form-check form-switch d-flex align-items-center">
        <input class="form-check-input" type="checkbox" id="selectAllAdmin">
        <label class="form-check-label small text-muted ms-2 mb-0" for="selectAllAdmin">Selecionar todos</label>
      </div>
      <div class="d-flex gap-2 justify-content-center w-100 mx-auto" style="max-width:720px;">
        <button class="btn btn-success btn-sm px-3" id="approveSelected">Aprovar selecionados</button>
        <button class="btn btn-danger btn-sm px-3" id="rejectSelected">Rejeitar selecionados</button>
      </div>
    </div>
  `;

  body.appendChild(controls);

  const tableWrap = document.createElement('div');
  tableWrap.className = 'table-responsive';

  const table = document.createElement('table');
  table.className = 'table table-hover mb-0';
  table.innerHTML = `
    <thead>
      <tr>
        <th style="width:40px"></th>
        <th>Tipo</th>
        <th>Descrição</th>
        <th>Data</th>
        <th>Status</th>
        <th style="width:220px">Ações</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody') as HTMLTableSectionElement;
  if (!submissions || submissions.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="6" class="text-muted small">Nenhuma doação pendente.</td>`;
    tbody.appendChild(tr);
  } else {
      for (const s of submissions) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="checkbox" class="admin-select" data-id="${s.id}"></td>
        <td>${escapeHtml(s.tipo)}</td>
        <td class="small text-muted">${escapeHtml(s.descricao)}</td>
        <td class="small">${new Date(s.data).toLocaleString()}</td>
        <td><span class="badge bg-warning text-dark">${escapeHtml(s.status)}</span></td>
        <td>
          <button class="btn btn-sm btn-success me-1 admin-approve" data-id="${s.id}">Aprovar</button>
          <button class="btn btn-sm btn-danger admin-reject" data-id="${s.id}">Rejeitar</button>
        </td>
      `;
      tbody.appendChild(tr);
    }
  }

  tableWrap.appendChild(table);
  body.appendChild(tableWrap);
  card.appendChild(body);
  container.appendChild(card);

  renderTypesManagement(container);

  const selectAll = container.querySelector('#selectAllAdmin');
  selectAll?.addEventListener('change', (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    for (const cb of container.querySelectorAll<HTMLInputElement>('.admin-select')) {
      cb.checked = checked;
    }
  });

  for (const btn of container.querySelectorAll('.admin-approve')) {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).dataset.id);
      updateSubmissionStatus(id, 'Aprovado');
      setupAdminPage();
      setupHistoricoPage();
    });
  }

  for (const btn of container.querySelectorAll('.admin-reject')) {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).dataset.id);
      updateSubmissionStatus(id, 'Rejeitado');
      setupAdminPage();
      setupHistoricoPage();
    });
  }

  const approveSelected = container.querySelector('#approveSelected');
  const rejectSelected = container.querySelector('#rejectSelected');
  
  approveSelected?.addEventListener('click', () => {
    const ids = Array.from(container.querySelectorAll<HTMLInputElement>('.admin-select:checked')).map(cb =>
      Number(cb.dataset.id)
    );
    for (const id of ids) {
      updateSubmissionStatus(id, 'Aprovado');
    }
    setupAdminPage();
    setupHistoricoPage();
  });
  
  rejectSelected?.addEventListener('click', () => {
    const ids = Array.from(container.querySelectorAll<HTMLInputElement>('.admin-select:checked')).map(cb =>
      Number(cb.dataset.id)
    );
    for (const id of ids) {
      updateSubmissionStatus(id, 'Rejeitado');
    }
    setupAdminPage();
    setupHistoricoPage();
  });
}

function renderTypesManagement(container: HTMLElement) {
  const card = document.createElement('div');
  card.className = 'card mt-3';
  const body = document.createElement('div');
  body.className = 'card-body p-3';
  body.innerHTML = `
    <h5>Gerenciar Tipos de Doação</h5>
    <div class="admin-add-row mb-2">
      <div>
        <input id="novoTipoInput" class="form-control form-control-sm" placeholder="Novo tipo (ex: Materiais escolares)" />
      </div>
      <div style="display:flex;justify-content:center;">
        <button id="addTipoBtn" class="btn btn-primary btn-sm admin-btn-fixed">Adicionar</button>
      </div>
    </div>
    <ul id="tiposList" class="list-group list-group-flush"></ul>
  `;
  card.appendChild(body);
  container.appendChild(card);

  const tiposList = body.querySelector('#tiposList') as HTMLUListElement;
  const novoInput = body.querySelector('#novoTipoInput') as HTMLInputElement;
  const addBtn = body.querySelector('#addTipoBtn') as HTMLButtonElement;

  function refreshList() {
    tiposList.innerHTML = '';
    const types = getDonationTypes();
    if (!types.length) {
      const li = document.createElement('li');
      li.className = 'list-group-item text-muted small';
      li.textContent = 'Nenhum tipo configurado.';
      tiposList.appendChild(li);
      return;
    }
    for (const t of types) {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex align-items-center justify-content-between';
      li.innerHTML = `
        <div class="tipo-label small text-truncate" style="max-width:70%;">${escapeHtml(t.name)}</div>
        <div class="btns">
          <button class="btn btn-sm btn-outline-secondary admin-btn-fixed me-1 tipo-edit" data-id="${t.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger admin-btn-fixed tipo-delete" data-id="${t.id}">Excluir</button>
        </div>
      `;
      tiposList.appendChild(li);
    }
    
    attachTypeEventListeners(tiposList, refreshList);
  }

  function attachTypeEventListeners(tiposList: HTMLUListElement, refreshFn: () => void) {
    for (const b of tiposList.querySelectorAll('.tipo-delete')) {
      b.addEventListener('click', () => {
        const id = Number((b as HTMLElement).dataset.id);
        const types = getDonationTypes().filter((x: any) => x.id !== id);
        saveDonationTypes(types);
        refreshFn();
        populateDonationTypes();
        showToast('Tipo excluído', 'warning');
      });
    }
    
    for (const b of tiposList.querySelectorAll('.tipo-edit')) {
      b.addEventListener('click', () => {
        handleEditTipo(b as HTMLElement, refreshFn);
      });
    }
  }

  function handleEditTipo(btn: HTMLElement, refreshFn: () => void) {
    const id = Number(btn.dataset.id);
    const li = btn.closest('li') as HTMLLIElement;
    const label = li.querySelector('.tipo-label') as HTMLElement;
    const current = label.textContent || '';
    const btnsDiv = li.querySelector('.btns') as HTMLElement;
    if (btnsDiv) btnsDiv.style.display = 'none';
    
    const input = document.createElement('input');
    input.className = 'form-control form-control-sm me-2';
    input.value = current;
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-sm btn-primary me-1';
    saveBtn.textContent = 'Salvar';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-sm btn-secondary';
    cancelBtn.textContent = 'Cancelar';
    const holder = document.createElement('div');
    holder.className = 'd-flex w-100 align-items-center';
    holder.appendChild(input);
    holder.appendChild(saveBtn);
    holder.appendChild(cancelBtn);
    label.replaceWith(holder);

    cancelBtn.addEventListener('click', () => refreshFn());
    saveBtn.addEventListener('click', () => {
      const v = input.value.trim();
      if (!v) {
        showToast('Nome inválido', 'danger');
        return;
      }
      const types = getDonationTypes().map((x: any) => (x.id === id ? { id: x.id, name: v } : x));
      saveDonationTypes(types);
      refreshFn();
      populateDonationTypes();
      showToast('Tipo atualizado', 'success');
    });
  }

  addBtn.addEventListener('click', () => {
    const v = (novoInput.value || '').trim();
    if (!v) {
      showToast('Digite o nome do tipo', 'warning');
      return;
    }
    const types = getDonationTypes();
    if (types.some((t: any) => t.name.toLowerCase() === v.toLowerCase())) {
      showToast('Tipo já existe', 'warning');
      return;
    }
    types.push({ id: Date.now(), name: v });
    saveDonationTypes(types);
    novoInput.value = '';
    refreshList();
    populateDonationTypes();
    showToast('Tipo adicionado', 'success');
  });

  refreshList();
}

// ============ SERVIÇOS COMPARTILHADOS ============
function showToast(message: string, variant: 'success' | 'danger' | 'warning' = 'success', timeout = 3000) {
  const container = ensureToastContainer();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('aria-atomic', 'true');

  toast.innerHTML = `
    <div class="toast-header bg-${variant} text-white">
      <strong class="me-auto">Eco Doação</strong>
      <button type="button" class="btn-close btn-close-white ms-2 mb-1" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${escapeHtml(message)}
    </div>
  `;

  container.appendChild(toast);

  try {
    const ToastCtor = (globalThis as any).bootstrap?.Toast;
    if (ToastCtor) {
      const bsToast = new ToastCtor(toast, { delay: timeout });
      bsToast.show();
      toast.addEventListener('hidden.bs.toast', () => toast.remove());
      return;
    }
  } catch {
    // fallthrough to simple show
  }

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.remove();
  }, timeout + 500);
}

function ensureToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'position-fixed top-0 end-0 p-3';
    (container.style as any).zIndex = '1080';
    document.body.appendChild(container);
  }
  return container;
}

// Tornar showToast disponível globalmente para scripts simples no HTML
try {
  (globalThis as any).showToast = showToast;
} catch (_) {
  // ignore
}

function escapeHtml(s: string) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function getSubmissions() {
  const raw = localStorage.getItem('ecodoacao_submissions');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveSubmission(sub: any) {
  const arr = getSubmissions();
  arr.unshift(sub);
  localStorage.setItem('ecodoacao_submissions', JSON.stringify(arr));
}

function updateSubmissionStatus(id: number, newStatus: string) {
  const arr = getSubmissions();
  const idx = arr.findIndex((s: any) => s.id === id);
  if (idx === -1) return;
  arr[idx].status = newStatus;
  localStorage.setItem('ecodoacao_submissions', JSON.stringify(arr));
  showToast(
    `Doação ${id} marcada como ${newStatus}`,
    newStatus === 'Aprovado' ? 'success' : 'danger'
  );
  // Create a user notification when a submission is approved
  if (newStatus === 'Aprovado') {
    const s = arr[idx];
    const title = 'Doação aprovada';
    const message = s && s.tipo ? `Sua doação (${s.tipo}) foi aprovada.` : `Sua doação foi aprovada.`;
    try { addNotification(title, message, '/src/pages/historico.html'); } catch (e) { /* ignore */ }
  }
}

function getDonationTypes() {
  const raw = localStorage.getItem('ecodoacao_types');
  if (!raw) return ensureDefaultDonationTypes();
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return ensureDefaultDonationTypes();
    return parsed;
  } catch {
    return ensureDefaultDonationTypes();
  }
}

function saveDonationTypes(types: any[]) {
  localStorage.setItem('ecodoacao_types', JSON.stringify(types));
}

function ensureDefaultDonationTypes() {
  const defaults = [
    { id: 1, name: 'Reuso de Livros' },
    { id: 2, name: 'Descarte Eletrônico' },
    { id: 3, name: 'Doação de Roupas' },
    { id: 4, name: 'Doação de Alimentos' },
  ];
  saveDonationTypes(defaults);
  return defaults;
}

