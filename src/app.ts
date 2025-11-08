// Entrypoint TypeScript para o frontend (sem React). Compilar com tsc -> dist/app.js

// Entrypoint TypeScript para o frontend (sem React). Compilar com tsc -> dist/app.js

interface Submission {
  id: number;
  tipo: string;
  descricao: string;
  arquivoNome?: string;
  data: string; // ISO
  status: string;
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

  // Use Bootstrap's Toast API if available
  try {
    const ToastCtor = (window as any).bootstrap?.Toast;
    if (ToastCtor) {
      const bsToast = new ToastCtor(toast, { delay: timeout });
      bsToast.show();
      toast.addEventListener('hidden.bs.toast', () => toast.remove());
      return;
    }
  } catch (err) {
    // fallthrough to simple show
  }

  // fallback: auto-remove
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.remove();
  }, timeout + 500);
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getSubmissions(): Submission[] {
  const raw = localStorage.getItem('ecodoacao_submissions');
  if (!raw) return [];
  try { return JSON.parse(raw) as Submission[]; } catch { return []; }
}

function saveSubmission(sub: Submission) {
  const arr = getSubmissions();
  arr.unshift(sub); // newest first
  localStorage.setItem('ecodoacao_submissions', JSON.stringify(arr));
}

async function postSubmissionToServer(sub: Submission): Promise<Submission | null> {
  // network removed: no-op when backend removed
  return null;
}

function populateHistorico() {
  const list = document.getElementById('historicoList') as HTMLUListElement | null;
  if (!list) return;
  const submissions = getSubmissions();
  renderSubmissions(list, submissions);
}

function renderSubmissions(list: HTMLUListElement, submissions: Submission[]) {
  list.innerHTML = '';
  if (!submissions || !submissions.length) {
    const li = document.createElement('li');
    li.className = 'list-group-item text-muted';
    li.innerText = 'Nenhuma doação registrada ainda.';
    list.appendChild(li);
    return;
  }
  submissions.forEach(s => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start';
    const left = document.createElement('div');
    left.innerHTML = `<div class="fw-bold">${escapeHtml(s.tipo)}</div><div class="text-muted small">${escapeHtml(s.descricao)}</div><div class="text-muted small">${new Date(s.data).toLocaleString()}</div>`;
    const right = document.createElement('div');
    const badgeClass = s.status.toLowerCase().includes('aprov') ? 'bg-success' : s.status.toLowerCase().includes('enviado') ? 'bg-warning text-dark' : 'bg-secondary';
    right.innerHTML = `<span class="badge ${badgeClass}">${escapeHtml(s.status)}</span>`;
    li.appendChild(left);
    li.appendChild(right);
    list.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // inject navbar for navigation across pages
  injectNavbar();

  function injectNavbar() {
    if (document.getElementById('ecodoacao-navbar')) return; // already injected
    const nav = document.createElement('nav');
    nav.id = 'ecodoacao-navbar';
    nav.className = 'navbar navbar-expand-lg navbar-light bg-white border-bottom fixed-top';
    nav.innerHTML = `
      <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2" href="index.html">
          <img src="imagem/logo-eco-doacao.png" alt="logo" style="height:34px;" />
          <span class="fw-bold text-success">Eco Doação</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#ecodoacaoNavMenu" aria-controls="ecodoacaoNavMenu" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="ecodoacaoNavMenu">
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
            <li class="nav-item"><a class="nav-link" href="index.html">Entrar</a></li>
            <li class="nav-item"><a class="nav-link" href="cadastro.html">Cadastro</a></li>
            <li class="nav-item"><a class="nav-link" href="dashboard.html">Painel</a></li>
            <li class="nav-item"><a class="nav-link" href="submissao.html">Nova Doação</a></li>
            <li class="nav-item"><a class="nav-link" href="historico.html">Histórico</a></li>
            <li class="nav-item"><a class="nav-link" href="admin.html">Admin</a></li>
          </ul>
        </div>
      </div>
    `;
    document.body.prepend(nav);

    // mark active link based on pathname
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#ecodoacao-navbar .nav-link').forEach(a => {
      const href = (a as HTMLAnchorElement).getAttribute('href') || '';
      if (href === path) a.classList.add('active');
    });
  }

  // Login
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
      setTimeout(() => (window.location.href = 'dashboard.html'), 700);
    });
  }

  // Cadastro
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
      setTimeout(() => (window.location.href = 'dashboard.html'), 700);
    });
  }

  // Submissão de doação
  const doacaoForm = document.getElementById('doacaoForm') as HTMLFormElement | null;
  if (doacaoForm) {
    // show selected filename in submissao.html
    const fotoInput = document.getElementById('foto') as HTMLInputElement | null;
    const fotoFilenameEl = document.getElementById('fotoFilename') as HTMLElement | null;
    if (fotoInput && fotoFilenameEl) {
      fotoInput.addEventListener('change', () => {
        const name = (fotoInput.files && fotoInput.files.length) ? fotoInput.files[0].name : 'Nenhum arquivo selecionado';
        fotoFilenameEl.textContent = 'Arquivo: ' + name;
        // ensure wrapping so long names are visible (redundant with CSS but safe)
        fotoFilenameEl.style.whiteSpace = 'normal';
        fotoFilenameEl.style.wordBreak = 'break-all';
        fotoFilenameEl.style.overflowWrap = 'anywhere';
      });
      // initialize
      if (fotoInput.files && fotoInput.files.length) fotoFilenameEl.textContent = 'Arquivo: ' + fotoInput.files[0].name;
    }

    doacaoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const foto = (document.getElementById('foto') as HTMLInputElement | null);
      if (!foto || !foto.files || foto.files.length === 0) {
        showToast('Envie uma foto da doação.', 'warning');
        return;
      }
      // No momento apenas notifica e redireciona; integrações server ficam para depois
      // create mock submission and save
      const tipo = ((document.getElementById('tipo') as HTMLSelectElement)?.value) || 'Outro';
      const descricao = ((document.getElementById('descricao') as HTMLInputElement)?.value) || '';
      const arquivoNome = (foto && foto.files && foto.files[0]) ? (foto.files[0].name) : undefined;
      const submission: Submission = {
        id: Date.now(),
        tipo,
        descricao,
        arquivoNome,
        data: new Date().toISOString(),
        status: 'Enviado para validação'
      };
      // save locally (no backend)
      saveSubmission(submission);
      showToast('Doação salva localmente e enviada para validação (simulado)', 'success');
      setTimeout(() => (window.location.href = 'historico.html'), 700);
    });
  }

  // Remapeia links com data-href (caso queira usar em vez de onclick inline)
  document.querySelectorAll('[data-href]').forEach((el) => {
    el.addEventListener('click', () => {
      const target = (el as HTMLElement).getAttribute('data-href');
      if (target) window.location.href = target;
    });
  });

  // populate donation types into submissao select
  populateDonationTypes();

  // Preenche histórico se estivermos na página
  populateHistorico();

  // Preenche painel de admin se estivermos na página
  populateAdminPanel();
});

function populateAdminPanel() {
  const panel = document.getElementById('adminPanel');
  if (!panel) return;
  const submissions = getSubmissions();
  // consideramos pendentes aqueles com status contendo 'enviado' ou 'validação' ou 'pend'
  const pending = submissions.filter(s => /enviado|valida|pend/i.test(s.status));
  renderAdminPanel(panel, pending);
}

function renderAdminPanel(container: HTMLElement, submissions: Submission[]) {
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card shadow-sm';
  const body = document.createElement('div');
  body.className = 'card-body p-3';

  const controls = document.createElement('div');
  controls.className = 'mb-3';
  // Responsive controls: checkbox on left, buttons take remaining space.
  controls.innerHTML = `
    <div class="d-flex align-items-center gap-3 w-100">
      <div class="form-check d-flex align-items-center">
        <input class="form-check-input me-2" type="checkbox" id="selectAllAdmin">
        <label class="form-check-label small mb-0" for="selectAllAdmin">Selecionar todos</label>
      </div>
      <div class="d-flex flex-column flex-md-row gap-2 ms-auto w-100 w-md-75">
        <button class="btn btn-success btn-sm flex-fill" id="approveSelected">Aprovar selecionados</button>
        <button class="btn btn-danger btn-sm flex-fill" id="rejectSelected">Rejeitar selecionados</button>
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
    submissions.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="checkbox" class="admin-select" data-id="${s.id}"></td>
        <td>${escapeHtml(s.tipo)}</td>
        <td class="small text-muted">${escapeHtml(s.descricao)}</td>
        <td class="small">${new Date(s.data).toLocaleString()}</td>
        <td><span class="badge bg-warning text-dark">${escapeHtml(s.status)}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-success me-1 admin-approve" data-id="${s.id}">Aprovar</button>
          <button class="btn btn-sm btn-outline-danger admin-reject" data-id="${s.id}">Rejeitar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  tableWrap.appendChild(table);
  body.appendChild(tableWrap);
  card.appendChild(body);
  container.appendChild(card);

  // append types management UI to the admin panel
  renderTypesManagement(container);

  // Wire up controls
  const selectAll = container.querySelector('#selectAllAdmin') as HTMLInputElement | null;
  selectAll?.addEventListener('change', (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    container.querySelectorAll<HTMLInputElement>('.admin-select').forEach(cb => cb.checked = checked);
  });

  container.querySelectorAll('.admin-approve').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).getAttribute('data-id'));
      updateSubmissionStatus(id, 'Aprovado');
    });
  });
  container.querySelectorAll('.admin-reject').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).getAttribute('data-id'));
      updateSubmissionStatus(id, 'Rejeitado');
    });
  });

  const approveSelected = container.querySelector('#approveSelected') as HTMLButtonElement | null;
  const rejectSelected = container.querySelector('#rejectSelected') as HTMLButtonElement | null;
  approveSelected?.addEventListener('click', () => {
    const ids = Array.from(container.querySelectorAll<HTMLInputElement>('.admin-select:checked')).map(cb => Number(cb.getAttribute('data-id')));
    ids.forEach(id => updateSubmissionStatus(id, 'Aprovado'));
  });
  rejectSelected?.addEventListener('click', () => {
    const ids = Array.from(container.querySelectorAll<HTMLInputElement>('.admin-select:checked')).map(cb => Number(cb.getAttribute('data-id')));
    ids.forEach(id => updateSubmissionStatus(id, 'Rejeitado'));
  });
}

function updateSubmissionStatus(id: number, newStatus: string) {
  const arr = getSubmissions();
  const idx = arr.findIndex(s => s.id === id);
  if (idx === -1) return;
  arr[idx].status = newStatus;
  // persist
  localStorage.setItem('ecodoacao_submissions', JSON.stringify(arr));
  showToast(`Doação ${id} marcada como ${newStatus}`, newStatus === 'Aprovado' ? 'success' : 'danger');
  // refresh panels
  populateAdminPanel();
  populateHistorico();
}

// === Donation Types Management (localStorage) ===
function getDonationTypes(): Array<{ id: number; name: string }> {
  const raw = localStorage.getItem('ecodoacao_types');
  if (!raw) return ensureDefaultDonationTypes();
  try {
    const parsed = JSON.parse(raw) as Array<{ id: number; name: string }>;
    if (!Array.isArray(parsed) || parsed.length === 0) return ensureDefaultDonationTypes();
    return parsed;
  } catch {
    return ensureDefaultDonationTypes();
  }
}

function saveDonationTypes(types: Array<{ id: number; name: string }>) {
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

function populateDonationTypes() {
  const selects = document.querySelectorAll<HTMLSelectElement>('select#tipo');
  if (!selects || selects.length === 0) return;
  const types = getDonationTypes();
  selects.forEach(sel => {
    // preserve a placeholder option if present
    const placeholder = Array.from(sel.options).find(o => o.value === '');
    sel.innerHTML = '';
    if (placeholder) sel.appendChild(placeholder);
    types.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.name;
      opt.textContent = t.name;
      sel.appendChild(opt);
    });
  });
}

function renderTypesManagement(container: HTMLElement) {
  const card = document.createElement('div');
  card.className = 'card mt-3';
  const body = document.createElement('div');
  body.className = 'card-body p-3';
  body.innerHTML = `
    <h5>Gerenciar Tipos de Doação</h5>
    <div class="d-flex gap-2 mb-2">
      <input id="novoTipoInput" class="form-control form-control-sm" placeholder="Novo tipo (ex: Materiais escolares)" />
      <button id="addTipoBtn" class="btn btn-sm btn-primary">Adicionar</button>
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
    types.forEach(t => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex align-items-center justify-content-between';
      li.innerHTML = `
        <div class="tipo-label small text-truncate" style="max-width:70%;">${escapeHtml(t.name)}</div>
        <div class="btns">
          <button class="btn btn-sm btn-outline-secondary me-1 tipo-edit" data-id="${t.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger tipo-delete" data-id="${t.id}">Excluir</button>
        </div>
      `;
      tiposList.appendChild(li);
    });
    // wire edits/deletes
    tiposList.querySelectorAll('.tipo-delete').forEach(b => {
      b.addEventListener('click', () => {
        const id = Number((b as HTMLElement).getAttribute('data-id'));
        const types = getDonationTypes().filter(x => x.id !== id);
        saveDonationTypes(types);
        refreshList();
        populateDonationTypes();
        showToast('Tipo excluído', 'warning');
      });
    });
      tiposList.querySelectorAll('.tipo-edit').forEach(b => {
      b.addEventListener('click', () => {
        const id = Number((b as HTMLElement).getAttribute('data-id'));
        const li = (b as HTMLElement).closest('li') as HTMLLIElement;
        const label = li.querySelector('.tipo-label') as HTMLElement;
        const current = label.textContent || '';
        // hide the edit/delete buttons while editing
        const btnsDiv = li.querySelector('.btns') as HTMLElement | null;
        if (btnsDiv) btnsDiv.style.display = 'none';
        // replace with input + save/cancel
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

        cancelBtn.addEventListener('click', () => refreshList());
        saveBtn.addEventListener('click', () => {
          const v = input.value.trim();
          if (!v) { showToast('Nome inválido', 'danger'); return; }
          const types = getDonationTypes().map(x => x.id === id ? { id: x.id, name: v } : x);
          saveDonationTypes(types);
          refreshList();
          populateDonationTypes();
          showToast('Tipo atualizado', 'success');
        });
      });
    });
  }

  addBtn.addEventListener('click', () => {
    const v = (novoInput.value || '').trim();
    if (!v) { showToast('Digite o nome do tipo', 'warning'); return; }
    const types = getDonationTypes();
    // avoid duplicates
    if (types.some(t => t.name.toLowerCase() === v.toLowerCase())) { showToast('Tipo já existe', 'warning'); return; }
    types.push({ id: Date.now(), name: v });
    saveDonationTypes(types);
    novoInput.value = '';
    refreshList();
    populateDonationTypes();
    showToast('Tipo adicionado', 'success');
  });

  refreshList();
}

