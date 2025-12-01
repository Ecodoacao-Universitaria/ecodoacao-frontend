/**
 * Aplicação principal - EcoDoação
 * Gerencia inicialização e eventos globais
 */
import { initGaleria } from '../pages/galeria';
import { injectNavbar, setNavbarUser } from '../utils/navbar';
import { initNotifications, showToast, displayErrorToast } from '../utils/notifications';
import { confirmAction, confirmWithInput } from '../utils/modals';
import { getBalance, setBalance, updateBalanceUI, syncWalletFromDashboard } from '../services/wallet';
import { isAdmin } from '../utils/permissions'; 
import { renderHistorico } from '../pages/historico';
import { escapeHtml } from '../utils/html';

// ===== IMPORTS DA API =====
import { login, isAuthenticated, requireAuth, redirectIfAuthenticated } from '../services/auth.services';
import { registrarUsuario, getDashboard, atualizarPerfil, alterarSenha } from '../services/userService';
import {
  criarDoacao,
  historicoUsuario,
  listarDoacoesPendentes,
  validarDoacao,
  formatarDataDoacao,
  validarImagemDoacao
} from '../services/doacoes.services';
import {
  listarMinhasBadges,
  listarBadgesDisponiveis,
  comprarBadge,
  formatarDataConquista,
  criarBadgeAdmin 
} from '../services/badge.services';
import { populateDonationTypesSelects } from '../services/donationType';
import type { Doacao, Badge, UsuarioBadge } from '../types/api.types';
import { toAbsoluteUrl } from '../config/api';

// ===== INICIALIZAÇÃO =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}


function initRouting() {
  const path = window.location.pathname;
  const file = path.split('/').pop() || '';

  const protectedPages = [
    'dashboard.html',
    'admin.html',
    'submissao.html',
    'historico.html',
    'galeria.html',
    'badges.html',
    'perfil.html'
  ];

  const publicPages = [
    '',
    '/',
    'index.html',
    'login.html',
    'cadastro.html'
  ];

  if (protectedPages.includes(file)) {
    if (!requireAuth()) return;
    // proteção extra para admin
    if (file === 'admin.html' && !isAdmin()) {
      window.location.href = '/src/pages/dashboard.html';
      return;
    }
  } else if (publicPages.includes(file)) {
    if (redirectIfAuthenticated()) return;
  }
}

async function initApp(): Promise<void> {
  // Primeiro decide rota (evita executar setups da página errada)
  initRouting();

  // Componentes visuais
  injectNavbar();
  initNotifications();
  
  // Sincronizar saldo
  await syncBalance();
  
  // Hidratar nome do usuário na navbar
  await hydrateNavbarUser();
  
  // Links com data-href
  setupDataHrefLinks();
  
  // Setup específico da página
  await setupPageSpecific();
}

async function hydrateNavbarUser(): Promise<void> {
  try {
    if (!isAuthenticated()) return;
    const dash: any = await getDashboard();
    const nome = dash?.username || dash?.user?.username || dash?.nome || '';
    if (nome) setNavbarUser(nome);
  } catch {}
}

function setupDataHrefLinks(): void {
  document.querySelectorAll('[data-href]').forEach(el => {
    el.addEventListener('click', () => {
      const target = (el as HTMLElement).dataset.href;
      if (target) location.href = target;
    });
  });
}

// ===== SETUP POR PÁGINA =====
async function setupPageSpecific(): Promise<void> {
  const pathname = location.pathname;

  // Autenticação
  if (pathname.includes('login.html')) setupLoginPage();
  if (pathname.includes('cadastro.html')) setupCadastroPage();
  
  // Usuário
  if (pathname.includes('submissao.html')) await setupSubmissaoPage();
  if (pathname.includes('historico.html')) await setupHistoricoPage();
  if (pathname.includes('dashboard.html')) await setupDashboardPage();
  if (pathname.includes('badges.html')) await setupBadgesPage();
  if (pathname.includes('perfil.html')) await setupPerfilPage();
   if (pathname.includes('galeria.html')) { 
    const adminBanner = document.getElementById('adminBanner');
    const newBadgeBtn = document.getElementById('newBadgeBtn') as HTMLButtonElement | null;
    const admin = isAdmin(); 
    if (adminBanner) adminBanner.style.display = admin ? 'block' : 'none';
    if (newBadgeBtn) newBadgeBtn.style.display = admin ? 'inline-block' : 'none';

    // Admin handlers para criação de badge
    if (admin) initCreateBadgeHandlers();

    await initGaleria();
  }

  // Admin
  if (pathname.includes('admin.html')) await setupAdminPage();
}

// ============================================================================
// AUTENTICAÇÃO
// ============================================================================

function setupLoginPage(): void {
  const form = document.getElementById('loginForm') as HTMLFormElement;
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = (document.getElementById('username') as HTMLInputElement)?.value.trim();
    const senha = (document.getElementById('senha') as HTMLInputElement)?.value || '';
    if (!username) { showToast('Informe seu username.', 'warning'); return; }
    try {
      await login({ username, password: senha });
      showToast('Login realizado.', 'success');
      setTimeout(() => location.href = '/src/pages/dashboard.html', 500);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Falha no login.';
      showToast(msg, 'danger', 5000);
    }
  });
}

function setupCadastroPage(): void {
  const form = document.getElementById('cadastroForm') as HTMLFormElement;
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = (document.getElementById('username') as HTMLInputElement)?.value.trim();
    const email = (document.getElementById('email') as HTMLInputElement)?.value.trim().toLowerCase();
    const senha = (document.getElementById('senha') as HTMLInputElement)?.value;
    const confirmar = (document.getElementById('confirmar') as HTMLInputElement)?.value;
    if (!username) { showToast('Informe username.', 'warning'); return; }
    if (!email.endsWith('@ufrpe.br')) { showToast('E-mail deve ser @ufrpe.br.', 'warning'); return; }
    if (senha !== confirmar) { showToast('Senhas não coincidem.', 'warning'); return; }
    if (senha.length < 6) { showToast('Senha mínima 6 caracteres.', 'warning'); return; }
    try {
      const novo = await registrarUsuario({ username, email, password: senha });
      showToast('Conta criada.', 'success');
      // Login direto
      await login({ username: novo.username, password: senha });
      showToast('Autenticado.', 'success');
      setTimeout(() => location.href = '/src/pages/dashboard.html', 600);
    } catch (err: any) {
      const data = err?.response?.data;
      const userErr = Array.isArray(data?.username) ? data.username.join(', ') : '';
      const msg = userErr
        ? 'Username já existe. Faça login.'
        : data?.detail
          || Object.keys(data || {}).map(k => `${k}: ${Array.isArray(data[k]) ? data[k].join(', ') : data[k]}`).join(' | ')
          || 'Falha no cadastro.';
      showToast(msg, 'danger', 6000);
      //if (userErr) setTimeout(() => location.href = '/src/pages/login.html', 1000);
    }
  });
}

// ============================================================================
// DASHBOARD
// ============================================================================

async function setupDashboardPage(): Promise<void> {
  const container = document.getElementById('dashboardContent');
  if (!container) return;

  try {
    const dashboard = await getDashboard();
    const minhasBadges = await listarMinhasBadges();

    // Atualiza estado e UI do saldo
    setBalance(dashboard.saldo_moedas);
    updateBalanceUI(dashboard.saldo_moedas);

    container.innerHTML = '';

    renderDashboardStats(container, dashboard, minhasBadges.length);
    renderDashboardBadges(container, minhasBadges);
  } catch (error) {
    showToast('Erro ao carregar dashboard', 'danger');
    console.error(error);
  }
}

function renderDashboardStats(container: HTMLElement, data: any, badgesCount?: number): void {
  const qtdBadges = typeof badgesCount === 'number'
    ? badgesCount
    : (data.badges_conquistados?.length || 0);

  const statsHTML = `
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card text-center">
          <div class="card-body">
            <h3 class="text-success">${data.saldo_moedas}</h3>
            <p class="text-muted mb-0">Moedas</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card text-center">
          <div class="card-body">
            <h3 class="text-primary">${qtdBadges}</h3>
            <p class="text-muted mb-0">Badges</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card text-center">
          <div class="card-body">
            <h3 class="text-info">${data.role}</h3>
            <p class="text-muted mb-0">Nível</p>
          </div>
        </div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('afterbegin', statsHTML);
}

function renderDashboardBadges(container: HTMLElement, badges: any[]): void {
  const section = document.createElement('div');
  section.className = 'mb-4';
  section.innerHTML = '<h5 class="mb-3">Badges Conquistadas Recentemente</h5>';

  if (!Array.isArray(badges) || badges.length === 0) {
    section.innerHTML += '<p class="text-muted">Nenhuma badge conquistada ainda.</p>';
    container.appendChild(section);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'row g-3';

  badges.slice(0, 6).forEach((raw: any) => {
    const b = raw?.badge ? raw.badge : raw; 
    const iconeHtml = renderBadgeIcone(b);
    const nome = b?.nome || 'Badge';
    const desc = b?.descricao || '';
    grid.innerHTML += `
      <div class="col-md-4">
        <div class="card">
          <div class="card-body text-center">
            <div class="mb-2">${iconeHtml}</div>  
            <h6>${escapeHtml(nome)}</h6>
            <p class="small text-muted mb-0">${escapeHtml(desc)}</p>
          </div>
        </div>
      </div>
    `;
  });

  section.appendChild(grid);
  container.appendChild(section);
}

// ============================================================================
// PERFIL
// ============================================================================

async function setupPerfilPage(): Promise<void> {
  const formPerfil = document.getElementById('perfilForm') as HTMLFormElement | null;
  const formSenha = document.getElementById('senhaForm') as HTMLFormElement | null;
  const inputUsername = document.getElementById('perfilUsername') as HTMLInputElement | null;
  const inputEmail = document.getElementById('perfilEmail') as HTMLInputElement | null;
  const displayUsername = document.getElementById('perfilUsernameDisplay');
  const displayEmail = document.getElementById('perfilEmailDisplay');
  const btnSalvar = document.querySelector('#perfilForm button[type="submit"]') as HTMLButtonElement | null;

  let originalUsername = '';
  let originalEmail = '';

  // Preload
  try {
    const dash: any = await getDashboard();
    const username = dash?.username || dash?.user?.username || '';
    const email = (dash?.email || dash?.user?.email || '').toLowerCase();
    originalUsername = username || '';
    originalEmail = email || '';

    if (inputUsername && username) inputUsername.value = username;
    if (inputEmail && email) inputEmail.value = email;
    if (displayUsername && username) displayUsername.textContent = username;
    if (displayEmail && email) displayEmail.textContent = email;
    if (username) setNavbarUser(username);
  } catch (e) {
    console.warn('Falha preload perfil', e);
  }

  const updateSubmitState = () => {
    const curUser = (inputUsername?.value || '').trim();
    const curEmail = (inputEmail?.value || '').trim().toLowerCase();
    const changed = (curUser !== originalUsername) || (curEmail !== originalEmail);
    if (btnSalvar) btnSalvar.disabled = !changed;
  };

  inputUsername?.addEventListener('input', updateSubmitState);
  inputEmail?.addEventListener('input', updateSubmitState);
  updateSubmitState();

  if (formPerfil) {
    formPerfil.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = inputUsername?.value.trim();
      const email = (inputEmail?.value?.trim()?.toLowerCase()) || '';

      // Bloqueia se nada mudou
      if (username === originalUsername && email === originalEmail) {
        showToast('Nenhuma alteração detectada.', 'info');
        return;
      }

      if (!username) { showToast('Informe username.', 'warning'); return; }
      if (!email.endsWith('@ufrpe.br')) { showToast('E-mail deve terminar com @ufrpe.br', 'warning'); return; }
      try {
        const user = await atualizarPerfil({ username, email });
        showToast('Perfil atualizado.', 'success');
        if (displayUsername) displayUsername.textContent = user.username;
        if (displayEmail) displayEmail.textContent = user.email.toLowerCase();
        setNavbarUser(user.username);

        // Atualiza baseline e estado do botão
        originalUsername = user.username;
        originalEmail = user.email.toLowerCase();
        updateSubmitState();
      } catch (err: any) {
        const data = err?.response?.data || {};
        const msg = data?.detail
          || Object.keys(data).map(k => `${k}: ${Array.isArray(data[k]) ? data[k].join(', ') : data[k]}`).join(' | ')
          || 'Erro ao atualizar.';
        showToast(msg, 'danger', 6000);
      }
    });
  }

  if (formSenha) {
    formSenha.addEventListener('submit', async (e) => {
      e.preventDefault();
      const atual = (document.getElementById('senhaAtual') as HTMLInputElement)?.value || '';
      const nova = (document.getElementById('novaSenha') as HTMLInputElement)?.value || '';
      const confirmar = (document.getElementById('confirmarNovaSenha') as HTMLInputElement)?.value || '';
      if (nova !== confirmar) { showToast('Senhas não coincidem.', 'warning'); return; }
      if (nova.length < 6 || !/[A-Za-z]/.test(nova) || !/\d/.test(nova)) {
        showToast('Senha fraca (>=6, letra e número).', 'warning'); return;
      }
      try {
        const resp = await alterarSenha({ senha_atual: atual, nova_senha: nova });
        showToast(resp.detail || 'Senha alterada.', 'success');
        ['senhaAtual','novaSenha','confirmarNovaSenha'].forEach(id => {
          const el = document.getElementById(id) as HTMLInputElement | null;
          if (el) el.value = '';
        });
      } catch (err: any) {
        const data = err?.response?.data || {};
        const msg = data?.detail
          || Object.keys(data).map(k => `${k}: ${Array.isArray(data[k]) ? data[k].join(', ') : data[k]}`).join(' | ')
          || 'Erro ao alterar senha.';
        showToast(msg, 'danger', 6000);
      }
    });
  }
}

// ============================================================================
// SUBMISSÃO DE DOAÇÃO
// ============================================================================

async function setupSubmissaoPage(): Promise<void> {
  const form = document.getElementById('doacaoForm') as HTMLFormElement;
  if (!form) return;

  const fotoInput = document.getElementById('foto') as HTMLInputElement;
  const tipoSelect = document.getElementById('tipo') as HTMLSelectElement;
  const descInput = document.getElementById('descricao') as HTMLInputElement;
  const fotoFilename = document.getElementById('fotoFilename');

  try {
    await populateDonationTypesSelects();
    if (tipoSelect) tipoSelect.disabled = false;
  } catch (err) {
    console.error('Falha ao carregar tipos de doação:', err);
    showToast('Erro ao carregar tipos de doação.', 'warning');
    if (tipoSelect) {
      tipoSelect.innerHTML = '<option value="">Erro ao carregar</option>';
      tipoSelect.disabled = true;
    }
  }

  // pré-visualização
  const previewImgId = 'doacaoPreviewImg';
  let previewImg = document.getElementById(previewImgId) as HTMLImageElement | null;
  if (!previewImg) {
    previewImg = document.createElement('img');
    previewImg.id = previewImgId;
    previewImg.className = 'img-fluid rounded border mt-2';
    previewImg.style.maxHeight = '220px';
    fotoFilename?.insertAdjacentElement('afterend', previewImg);
  }
  fotoInput?.addEventListener('change', () => {
    const file = fotoInput.files?.[0];
    if (file) {
      fotoFilename && (fotoFilename.textContent = `Arquivo: ${file.name}`);
      const url = URL.createObjectURL(file);
      if (previewImg) {
        previewImg.src = url;
        previewImg.alt = 'Pré-visualização da doação';
        previewImg.style.display = 'block';
      }
    } else {
      fotoFilename && (fotoFilename.textContent = 'Nenhum arquivo selecionado');
      if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
      }
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fotoInput?.files?.[0];
    if (!file) { showToast('Envie uma foto da doação.', 'warning'); return; }
    const valid = validarImagemDoacao(file);
    if (valid !== true) { showToast(valid, 'warning'); return; }

    const tipoId = Number(tipoSelect?.value);
    if (!tipoId || Number.isNaN(tipoId)) { showToast('Selecione um tipo de doação válido.', 'warning'); return; }

    const desc = (descInput?.value || '').trim();
    if (desc && (desc.length < 10 || desc.length > 240)) {
      showToast('A descrição deve ter entre 10 e 240 caracteres.', 'warning');
      return;
    }

    try {
      await criarDoacao({
        tipo_doacao: tipoId,
        descricao: descInput?.value?.trim() || '',
        evidencia_foto: file,
      });
      showToast('Doação enviada para validação!', 'success');
      setTimeout(() => location.href = 'historico.html', 700);
    } catch (error) {
      displayErrorToast(error, 'Erro ao enviar doação.');
    }
  });
}

// ============================================================================
// HISTÓRICO
// ============================================================================

async function setupHistoricoPage(): Promise<void> {
  const list = document.getElementById('historicoList') as HTMLUListElement;
  if (!list) return;

  list.innerHTML = '<li class="list-group-item">Carregando...</li>';

  try {
    const response = await historicoUsuario();
    const historicoItems = (response.results || []).map((r: any) => {
      const tipo = r?.tipo_doacao;
      return {
        ...r,
        tipo_doacao: typeof tipo === 'string' ? { id: 0, nome: tipo } : tipo
      };
    });
    renderHistorico(list, historicoItems);
  } catch (error) {
    list.innerHTML = '<li class="list-group-item text-danger">Erro ao carregar histórico.</li>';
    displayErrorToast(error, 'Erro ao carregar histórico.');
  }
}


// ============================================================================
// BADGES
// ============================================================================

async function setupBadgesPage(): Promise<void> {
  const container = document.getElementById('badgesContainer');
  if (!container) return;

  try {
    const [minhas, disponiveis] = await Promise.all([
      listarMinhasBadges(),
      listarBadgesDisponiveis(),
    ]);

    renderMinhasBadges(container, minhas);
    renderBadgesDisponiveis(container, disponiveis);
  } catch (error) {
    showToast('Erro ao carregar badges', 'danger');
    console.error(error);
  }
}

function renderMinhasBadges(container: HTMLElement, badges: UsuarioBadge[]): void {
  const section = document.createElement('div');
  section.className = 'mb-5';
  section.innerHTML = `
    <h4 class="mb-3">🏆 Minhas Badges (${badges.length})</h4>
    <div class="row g-3" id="minhasBadgesGrid"></div>
  `;

  const grid = section.querySelector('#minhasBadgesGrid')!;

  if (badges.length === 0) {
    grid.innerHTML = '<div class="col-12"><p class="text-muted">Você ainda não conquistou nenhuma badge.</p></div>';
  } else {
    badges.forEach(ub => {
      const iconeHtml = renderBadgeIcone(ub.badge);
      grid.innerHTML += `
        <div class="col-md-4">
          <div class="card badge-card owned">
            <div class="card-body text-center">
              <div class="badge-icon mb-2">${iconeHtml}</div>  
              <h6>${escapeHtml(ub.badge.nome)}</h6>
              <p class="small text-muted">${escapeHtml(ub.badge.descricao)}</p>
              <p class="small text-success mb-0">Conquistada em: ${formatarDataConquista(ub.data_conquista)}</p>
            </div>
          </div>
        </div>
      `;
    });
  }

  container.appendChild(section);
}

function renderBadgesDisponiveis(container: HTMLElement, badges: Badge[]): void {
  const section = document.createElement('div');
  section.innerHTML = `
    <h4 class="mb-3">💎 Badges Disponíveis (${badges.length})</h4>
    <div class="row g-3" id="badgesDisponiveisGrid"></div>
  `;

  const grid = section.querySelector('#badgesDisponiveisGrid')!;

  if (badges.length === 0) {
    grid.innerHTML = '<div class="col-12"><p class="text-muted">Você já possui todas as badges disponíveis!</p></div>';
  } else {
   badges.forEach(badge => {
      const iconeHtml = renderBadgeIcone(badge);
      grid.innerHTML += `
        <div class="col-md-4">
          <div class="card badge-card">
            <div class="card-body text-center">
              <div class="badge-icon mb-2">${iconeHtml}</div>  
              <h6>${escapeHtml(badge.nome)}</h6>
              <p class="small text-muted">${escapeHtml(badge.descricao)}</p>
              <p class="fw-bold text-primary">${badge.custo_moedas} moedas</p>
              <button class="btn btn-sm btn-primary comprar-badge" data-badge-id="${badge.id}" data-custo="${badge.custo_moedas}">
                Comprar
              </button>
            </div>
          </div>
        </div>
      `;
    });

    // Event listeners para compra
    grid.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.comprar-badge') as HTMLButtonElement | null;
      if (!btn) return;
      const badgeId = Number(btn.dataset.badgeId);
      comprarBadge(badgeId);
    });
  }
  container.appendChild(section);
}

// ===== CRIAÇÃO DE BADGE (ADMIN) =====
function initCreateBadgeHandlers(): void {
  const form = document.getElementById('createBadgeForm') as HTMLFormElement | null;
  const imgInput = document.getElementById('badgeImage') as HTMLInputElement | null;
  const preview = document.getElementById('badgePreview') as HTMLImageElement | null;
  const warn = document.getElementById('badgeSizeWarning') as HTMLElement | null;

  const typeEl = document.getElementById('badgeType') as HTMLSelectElement | null;
  const compraFields = document.getElementById('compraFields');
  const conquistaFields = document.getElementById('conquistaFields');

  // Toggle campos por tipo
  typeEl?.addEventListener('change', () => {
    const tipo = (typeEl.value || 'COMPRA').toUpperCase();
    if (compraFields && conquistaFields) {
      const isCompra = tipo === 'COMPRA';
      compraFields.style.display = isCompra ? '' : 'none';
      conquistaFields.style.display = isCompra ? 'none' : '';
    }
  });

  // Pré-visualização
  imgInput?.addEventListener('change', () => {
    const file = imgInput.files?.[0] || null;
    if (!file || !preview) {
      if (preview) preview.style.display = 'none';
      return;
    }
    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.alt = 'Pré-visualização';
    preview.style.cssText = 'max-width:160px;max-height:160px;border-radius:12px;display:block;border:1px solid #e9e9e9;padding:8px;';
    warn && (warn.style.display = 'none');

    const img = new Image();
    img.onload = () => {
      if ((img.width < 200 || img.height < 200) && warn) {
        warn.textContent = 'Imagem pequena (recomendado mínimo 200×200).';
        warn.style.display = 'block';
      }
    };
    img.src = url;
  });

  // Submit do formulário (corrige o id do botão)
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameEl = document.getElementById('badgeName') as HTMLInputElement | null;
    const descEl = document.getElementById('badgeDescription') as HTMLTextAreaElement | null;
    const tipoEl = document.getElementById('badgeType') as HTMLSelectElement | null;

    const nome = (nameEl?.value || '').trim();
    const descricao = (descEl?.value || '').trim();
    const tipo = (tipoEl?.value || 'COMPRA').toUpperCase() as 'COMPRA' | 'CONQUISTA';
    const iconeFile = imgInput?.files?.[0] || null;

    if (!nome) { showToast('Informe o nome da badge.', 'warning'); return; }
    if (!descricao) { showToast('Informe a descrição.', 'warning'); return; }

    // Campos por tipo
    let custo_moedas: number | undefined;
    let criterio_doacoes: number | undefined;
    let criterio_moedas: number | undefined;

    if (tipo === 'COMPRA') {
      const custoEl = document.getElementById('badgeCost') as HTMLInputElement | null;
      custo_moedas = Number(custoEl?.value ?? 0);
      if (Number.isNaN(custo_moedas) || custo_moedas < 0) {
        showToast('Custo inválido.', 'warning'); return;
      }
      // REMOVIDO: prompt feioso de confirmação
    } else {
      const doacoesEl = document.getElementById('criterioDoacoes') as HTMLInputElement | null;
      const moedasEl = document.getElementById('criterioMoedas') as HTMLInputElement | null;
      const doacoesVal = doacoesEl?.value?.trim() || '';
      const moedasVal = moedasEl?.value?.trim() || '';

      criterio_doacoes = doacoesVal ? Number(doacoesVal) : undefined;
      criterio_moedas = moedasVal ? Number(moedasVal) : undefined;

      if (doacoesVal && Number.isNaN(criterio_doacoes)) {
        showToast('Critério de doações inválido.', 'warning'); return;
      }
      if (moedasVal && Number.isNaN(criterio_moedas)) {
        showToast('Critério de moedas inválido.', 'warning'); return;
      }
      // REMOVIDO: prompt feioso de confirmação
    }

    try {
      const created = await criarBadgeAdmin({
        nome,
        descricao,
        tipo,
        custo_moedas,
        criterio_doacoes: criterio_doacoes ?? null,
        criterio_moedas: criterio_moedas ?? null,
        ativo: true,
        icone: iconeFile || null,
      });
      showToast(`Badge criada: ${created.nome}`, 'success');
      (window as any).bootstrap?.Modal.getOrCreateInstance(
        document.getElementById('createBadgeModal')!
      )?.hide();
      setTimeout(() => location.reload(), 600);
    } catch (err: any) {
      const data = err?.response?.data || {};
      const msg = data?.detail
        || Object.keys(data).map(k => `${k}: ${Array.isArray(data[k]) ? data[k].join(', ') : data[k]}`).join(' | ')
        || 'Erro ao criar badge.';
      showToast(msg, 'danger', 6000);
    }
  });
}

// ============================================================================
// ADMIN
// ============================================================================

async function setupAdminPage(): Promise<void> {
  const panel = document.getElementById('adminPanel');
  if (!panel) return;

  panel.innerHTML = '<div class="text-muted">Carregando doações pendentes...</div>';

  try {
    const response = await listarDoacoesPendentes();
    renderAdminPanel(panel, response.results);
  } catch (error) {
    panel.innerHTML = '<div class="text-danger">Erro ao carregar doações pendentes.</div>';
    displayErrorToast(error, 'Erro ao carregar doações pendentes.');
  }
}

function renderAdminPanel(container: HTMLElement, doacoes: Doacao[]): void {
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card shadow-sm';
  card.innerHTML = `
    <div class="card-body">
      <h5 class="card-title mb-3">Doações Pendentes (${doacoes.length})</h5>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Doador</th>
              <th>Tipo</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="adminTableBody"></tbody>
        </table>
      </div>
    </div>
  `;

  const tbody = card.querySelector('#adminTableBody')!;

  if (doacoes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhuma doação pendente</td></tr>';
  } else {
    doacoes.forEach(doacao => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${doacao.id}</td>
        <td>${escapeHtml(doacao.doador)}</td>
        <td>${escapeHtml(doacao.tipo_doacao)}</td>
        <td class="small">${formatarDataDoacao(doacao.data_submissao)}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary me-2 detalhes-btn" data-id="${doacao.id}">
            Detalhes
          </button>
          <button class="btn btn-sm btn-success me-1 aprovar-btn" data-id="${doacao.id}">
            Aprovar
          </button>
          <button class="btn btn-sm btn-danger recusar-btn" data-id="${doacao.id}">
            Recusar
          </button>
        </td>
      `;
      tbody.appendChild(tr);

      // bind detalhes com closure do objeto completo
      const detBtn = tr.querySelector('.detalhes-btn') as HTMLButtonElement | null;
      detBtn?.addEventListener('click', () => openPendenteDetalhes(doacao));
    });

    // Event listeners
    tbody.querySelectorAll('.aprovar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number((e.target as HTMLElement).dataset.id);
        handleValidarDoacao(id, 'APROVADA');
      });
    });

    tbody.querySelectorAll('.recusar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number((e.target as HTMLElement).dataset.id);
        handleValidarDoacao(id, 'RECUSADA');
      });
    });
  }

  container.appendChild(card);
}

function openPendenteDetalhes(doacao: Doacao): void {
  const modal = document.getElementById('pendenteDetalhesModal');
  const body = document.getElementById('pendenteDetalhesBody');
  if (!modal || !body) return;

  const fotoUrl = doacao.evidencia_foto ? toAbsoluteUrl(String(doacao.evidencia_foto)) : '';
  const tipoNome = typeof doacao.tipo_doacao === 'string' ? doacao.tipo_doacao : (doacao as any)?.tipo_doacao?.nome || '—';
  const conteudo = `
    <div class="row g-3">
      <div class="col-md-6">
        <p><strong>ID:</strong> ${doacao.id}</p>
        <p><strong>Doador:</strong> ${escapeHtml(doacao.doador || '')}</p>
        <p><strong>Tipo:</strong> ${escapeHtml(String(tipoNome))}</p>
        <p><strong>Data:</strong> ${formatarDataDoacao(doacao.data_submissao)}</p>
        ${(doacao as any).descricao ? `<p class="mb-0"><strong>Descrição:</strong><br>${escapeHtml((doacao as any).descricao)}</p>` : ''}
        ${doacao.motivo_recusa ? `<div class="alert alert-danger mt-3 mb-0"><strong>Motivo:</strong><br>${escapeHtml(String(doacao.motivo_recusa))}</div>` : ''}
      </div>
      <div class="col-md-6">
        <div class="border rounded p-2 bg-light text-center">
          ${fotoUrl
            ? `<img src="${escapeHtml(fotoUrl)}" alt="Evidência" class="img-fluid" style="max-height:360px;object-fit:contain;">`
            : '<span class="text-muted">Sem imagem</span>'}
        </div>
      </div>
    </div>
  `;
  body.innerHTML = conteudo;
  const bsModal = new (window as any).bootstrap.Modal(modal);
  bsModal.show();
}

async function handleValidarDoacao(id: number, status: 'APROVADA' | 'RECUSADA'): Promise<void> {
  let motivo_recusa: string | undefined;

  if (status === 'RECUSADA') {
    const motivo = await confirmWithInput({
      title: 'Recusar doação',
      message: 'Informe o motivo da recusa. Esta ação é definitiva.',
      label: 'Motivo da recusa',
      placeholder: 'Ex: Foto ilegível, item não corresponde...',
      confirmText: 'Recusar',
      cancelText: 'Cancelar',
      variant: 'danger',
      required: true,
      minLength: 5
    });
    if (!motivo) {
      showToast('Recusa cancelada.', 'info');
      return;
    }
    motivo_recusa = motivo;
  } else {
    const ok = await confirmAction({
      title: 'Aprovar doação?',
      message: 'Confirma aprovação desta doação?',
      confirmText: 'Aprovar',
      cancelText: 'Cancelar',
      variant: 'success'
    });
    if (!ok) {
      showToast('Aprovação cancelada.', 'info');
      return;
    }
  }

  try {
    const resultado = await validarDoacao(id, { status, motivo_recusa });
    showToast(resultado.mensagem, status === 'APROVADA' ? 'success' : 'warning');
    if (status === 'APROVADA') {
      const anyRes: any = resultado as any;
      if (typeof anyRes.saldo_restante === 'number') {
        setBalance(anyRes.saldo_restante);
      } else if (typeof anyRes.saldo_atual === 'number') {
        setBalance(anyRes.saldo_atual);
      } else {
        await syncWalletFromDashboard();
      }
    }
    if (resultado.badges_conquistadas?.length) {
      showToast(`Badges: ${resultado.badges_conquistadas.join(', ')}`, 'success', 5000);
    }
    await setupAdminPage();
  } catch (error) {
    displayErrorToast(error, 'Erro ao carregar validação de doação.');
  }
}

// ============================================================================
// UTILIDADES
// ============================================================================

async function syncBalance(): Promise<void> {
  try {
    if (isAuthenticated()) {
      await syncWalletFromDashboard();
    }
  } finally {
    updateBalanceUI(getBalance());
  }
}

function renderBadgeIcone(badge: any): string {
  const url = badge?.icone_url;
  
  if (!url) {
    return '<span class="badge-icon-emoji" style="font-size:48px;">🏆</span>';
  }
  
  if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
    return `<img src="${escapeHtml(url)}" alt="Badge" class="badge-icon-img" style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px;" />`;
  }
  
  return '<span class="badge-icon-emoji" style="font-size:48px;">🏆</span>';
}

// Exportar showToast globalmente (para uso em outros scripts)
(window as any).showToast = showToast;