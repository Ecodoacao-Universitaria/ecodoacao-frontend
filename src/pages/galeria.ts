import {
  listarBadgesDisponiveis,
  comprarBadge,
  atualizarBadgeAdmin,
  excluirBadgeAdmin
} from '../services/badge.services';
import { setBalance, syncWalletFromDashboard } from '../services/wallet';
import { toAbsoluteUrl } from '../config/api';
import { isAdmin } from '../utils/permissions';
import { escapeHtml } from '../utils/html';
import { showToast, displayErrorToast, showApiSuccess } from '../utils/notifications';

let disponiveisCache: any[] = [];
let editingBadgeId: number | null = null;
let editingOriginal: any | null = null;
let isProcessingEdit = false;
let isProcessingDelete = false;

export async function initGaleria(): Promise<void> {
  await loadDisponiveis();
  renderDisponiveis();

  window.addEventListener('ecodoacao:badge-created', async () => {
    await loadDisponiveis();
    renderDisponiveis();
  });
}

async function loadDisponiveis(): Promise<void> {
  const grid = document.getElementById('galeriaDisponiveisGrid');
  if (grid) grid.innerHTML = '<div class="text-muted">Carregando...</div>';
  try {
    const results = await listarBadgesDisponiveis();
    disponiveisCache = Array.isArray(results) ? results : [];
  } catch (e) {
    disponiveisCache = [];
    if (grid) grid.innerHTML = '<div class="text-danger">Erro ao carregar badges.</div>';
    displayErrorToast(e);
  }
}

function renderDisponiveis(): void {
  const grid = document.getElementById('galeriaDisponiveisGrid');
  if (!grid) return;

  if (disponiveisCache.length === 0) {
    grid.innerHTML = '<div class="text-muted">Nenhuma badge disponível.</div>';
    return;
  }

  grid.innerHTML = '';
  const frag = document.createDocumentFragment();

  disponiveisCache.forEach(badge => {
    const card = document.createElement('div');
    card.className = 'text-center badge-card';
    card.dataset.badgeId = String(badge.id);

    const rawIconUrl = badge.icone_url || '';
    const iconUrl = rawIconUrl ? `${toAbsoluteUrl(String(rawIconUrl))}?v=${Date.now()}` : '';
    const iconHtml = iconUrl
      ? `<img src="${escapeHtml(iconUrl)}" alt="${escapeHtml(badge.nome)}" class="img-fluid rounded border" style="max-height:96px;max-width:96px;object-fit:cover;">`
      : `<div class="badge-icon mb-2" style="font-size:64px;">💎</div>`;

    card.innerHTML = `
      <div class="mb-2">${iconHtml}</div>
      <div class="small mt-2 fw-semibold">${escapeHtml(badge.nome || 'Badge')}</div>
      <div class="text-muted small">${escapeHtml(badge.descricao || '')}</div>
      <div class="mt-2 small text-success">Preço: <span>${badge.custo_moedas ?? 0}</span> Moedas</div>
      <div class="mt-2">
        <button class="btn btn-sm btn-outline-success buy-badge" data-badge-id="${badge.id}" data-custo="${badge.custo_moedas ?? 0}">Comprar</button>
      </div>
    `;
    frag.appendChild(card);
  });

  grid.appendChild(frag);
  initBuyButtons();
  initAdminEditBindings();
}

function initBuyButtons(): void {
  document.querySelectorAll('.buy-badge').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const target = e.currentTarget as HTMLButtonElement;
      const badgeId = Number(target.dataset.badgeId);
      const custo = Number(target.dataset.custo ?? 0);
      if (!badgeId) return;

      target.disabled = true;
      target.textContent = 'Processando...';

      try {
        const resp = await comprarBadge(badgeId);
        const ok = resp?.sucesso !== false;
        if (ok) {
          showApiSuccess(resp, 'Badge comprada!');
          if (typeof resp?.saldo_restante === 'number') {
            setBalance(resp.saldo_restante);
          } else if (typeof resp?.saldo_atual === 'number') {
            setBalance(resp.saldo_atual);
          } else {
            await syncWalletFromDashboard();
          }
          await loadDisponiveis();
          renderDisponiveis();
        } else {
          // Se o backend retornar sucesso=false, mostra a mensagem de erro
          showToast(resp?.mensagem || 'Falha na compra.', 'warning');
        }
      } catch (err: any) {
        displayErrorToast(err);
      } finally {
        target.disabled = false;
        target.textContent = 'Comprar';
      }
    });
  });
}

function initAdminEditBindings(): void {
  if (!isAdmin()) return;

  document.querySelectorAll('.badge-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = Number((card as HTMLElement).dataset.badgeId);
      const badge = disponiveisCache.find(b => Number(b.id) === id);
      if (badge) openEditBadgeModal(badge);
    });
  });

  const modalEl = document.getElementById('editBadgeModal');
  if (modalEl && !modalEl.hasAttribute('data-bound')) {
    modalEl.setAttribute('data-bound', 'true');

    modalEl.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;

      if (target.id === 'deleteBadgeBtn') {
        e.stopPropagation();
        const box = document.getElementById('deleteConfirmBox');
        box?.classList.toggle('d-none');
        return;
      }

      if (target.id === 'cancelDeleteBadgeBtn') {
        e.stopPropagation();
        const box = document.getElementById('deleteConfirmBox');
        box?.classList.add('d-none');
        return;
      }

      if (target.id === 'confirmDeleteBadgeBtn') {
        e.stopPropagation();
        await submitDeleteBadge();
        return;
      }
    });

    const form = document.getElementById('editBadgeForm') as HTMLFormElement | null;
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitEditBadge();
    });

    const tipoSelect = document.getElementById('badgeTypeEdit') as HTMLSelectElement | null;
    tipoSelect?.addEventListener('change', () => {
      const t = (tipoSelect.value || 'COMPRA').toUpperCase();
      const compra = document.getElementById('compraFieldsEdit');
      const conquista = document.getElementById('conquistaFieldsEdit');
      if (compra && conquista) {
        compra.style.display = t === 'COMPRA' ? '' : 'none';
        conquista.style.display = t === 'CONQUISTA' ? '' : 'none';
      }
    });

    const imgInput = document.getElementById('badgeImageEdit') as HTMLInputElement | null;
    const imgPreview = document.getElementById('badgePreviewEdit') as HTMLImageElement | null;
    imgInput?.addEventListener('change', () => {
      const f = imgInput.files?.[0];
      if (f && imgPreview) {
        const reader = new FileReader();
        reader.onload = () => { imgPreview.src = String(reader.result || ''); };
        reader.readAsDataURL(f);
      }
    });
  }
}

function openEditBadgeModal(badge: any): void {
  editingBadgeId = Number(badge.id) || null;
  editingOriginal = { ...badge };

  const idDisplay = document.getElementById('editBadgeIdDisplay');
  const tipoEl = document.getElementById('badgeTypeEdit') as HTMLSelectElement | null;
  const nomeEl = document.getElementById('badgeNameEdit') as HTMLInputElement | null;
  const descEl = document.getElementById('badgeDescriptionEdit') as HTMLTextAreaElement | null;
  const costEl = document.getElementById('badgeCostEdit') as HTMLInputElement | null;
  const doacoesEl = document.getElementById('criterioDoacoesEdit') as HTMLInputElement | null;
  const moedasEl = document.getElementById('criterioMoedasEdit') as HTMLInputElement | null;
  const imgPreview = document.getElementById('badgePreviewEdit') as HTMLImageElement | null;

  if (idDisplay) idDisplay.textContent = `ID: ${badge.id}`;
  if (tipoEl) tipoEl.value = (badge.tipo || 'COMPRA').toUpperCase();
  tipoEl?.dispatchEvent(new Event('change'));
  if (nomeEl) nomeEl.value = badge.nome || '';
  if (descEl) descEl.value = badge.descricao || '';
  if (costEl) costEl.value = String(badge.custo_moedas ?? 0);
  if (doacoesEl) doacoesEl.value = badge.criterio_doacoes != null ? String(badge.criterio_doacoes) : '';
  if (moedasEl) moedasEl.value = badge.criterio_moedas != null ? String(badge.criterio_moedas) : '';
  
  if (imgPreview) {
    if (badge.icone_url) {
      imgPreview.src = toAbsoluteUrl(String(badge.icone_url));
      imgPreview.style.display = 'block';
    } else {
      imgPreview.style.display = 'none';
    }
  }

  const deleteBox = document.getElementById('deleteConfirmBox') as HTMLElement | null;
  deleteBox?.classList.add('d-none');
  isProcessingEdit = false;
  isProcessingDelete = false;

  const editBtn = document.getElementById('editBadgeConfirmBtn') as HTMLButtonElement | null;
  const delBtn = document.getElementById('confirmDeleteBadgeBtn') as HTMLButtonElement | null;
  editBtn && (editBtn.disabled = false);
  delBtn && (delBtn.disabled = false);

  (window as any).bootstrap?.Modal.getOrCreateInstance(
    document.getElementById('editBadgeModal')!
  )?.show();
}

function isEditDirty(): boolean {
  if (!editingOriginal) return true;
  const tipoEl = document.getElementById('badgeTypeEdit') as HTMLSelectElement | null;
  const nomeEl = document.getElementById('badgeNameEdit') as HTMLInputElement | null;
  const descEl = document.getElementById('badgeDescriptionEdit') as HTMLTextAreaElement | null;
  const costEl = document.getElementById('badgeCostEdit') as HTMLInputElement | null;
  const doacoesEl = document.getElementById('criterioDoacoesEdit') as HTMLInputElement | null;
  const moedasEl = document.getElementById('criterioMoedasEdit') as HTMLInputElement | null;
  const imgInput = document.getElementById('badgeImageEdit') as HTMLInputElement | null;

  const tipo = (tipoEl?.value || '').toUpperCase();
  const nome = (nomeEl?.value || '').trim();
  const descricao = (descEl?.value || '').trim();
  const custo = Number(costEl?.value ?? 0);
  const doac = (doacoesEl?.value || '').trim();
  const moed = (moedasEl?.value || '').trim();
  const hasNewFile = !!(imgInput?.files?.length);

  const orig = editingOriginal;
  const changed =
    (orig.tipo || '').toUpperCase() !== tipo ||
    (orig.nome || '') !== nome ||
    (orig.descricao || '') !== descricao ||
    Number(orig.custo_moedas ?? 0) !== (tipo === 'COMPRA' ? custo : 0) ||
    String(orig.criterio_doacoes ?? '') !== (tipo === 'CONQUISTA' ? doac : '') ||
    String(orig.criterio_moedas ?? '') !== (tipo === 'CONQUISTA' ? moed : '') ||
    hasNewFile;

  return changed;
}

async function submitEditBadge(): Promise<void> {
  if (!isAdmin() || !editingBadgeId || isProcessingEdit) return;

  if (!isEditDirty()) {
    showToast('Nada para atualizar.', 'info');
    return;
  }

  const tipoEl = document.getElementById('badgeTypeEdit') as HTMLSelectElement | null;
  const nomeEl = document.getElementById('badgeNameEdit') as HTMLInputElement | null;
  const descEl = document.getElementById('badgeDescriptionEdit') as HTMLTextAreaElement | null;
  const costEl = document.getElementById('badgeCostEdit') as HTMLInputElement | null;
  const doacoesEl = document.getElementById('criterioDoacoesEdit') as HTMLInputElement | null;
  const moedasEl = document.getElementById('criterioMoedasEdit') as HTMLInputElement | null;
  const imgInput = document.getElementById('badgeImageEdit') as HTMLInputElement | null;
  const editBtn = document.getElementById('editBadgeConfirmBtn') as HTMLButtonElement | null;

  const tipo = (tipoEl?.value || 'COMPRA').toUpperCase() as 'COMPRA' | 'CONQUISTA';
  const nome = (nomeEl?.value || '').trim();
  const descricao = (descEl?.value || '').trim();

  if (!nome || !descricao) {
    showToast('Preencha nome e descrição.', 'warning');
    return;
  }

  let custo_moedas: number | null = null;
  let criterio_doacoes: number | null = null;
  let criterio_moedas: number | null = null;

  if (tipo === 'COMPRA') {
    custo_moedas = Number(costEl?.value ?? 0);
    if (Number.isNaN(custo_moedas) || custo_moedas < 0) {
      showToast('Custo inválido.', 'warning');
      return;
    }
  } else {
    const dv = (doacoesEl?.value || '').trim();
    const mv = (moedasEl?.value || '').trim();
    criterio_doacoes = dv ? Number(dv) : null;
    criterio_moedas = mv ? Number(mv) : null;
    if ((dv && Number.isNaN(criterio_doacoes)) || (mv && Number.isNaN(criterio_moedas))) {
      showToast('Critérios inválidos.', 'warning');
      return;
    }
  }

  const iconeFile = imgInput?.files?.[0] || null;

  try {
    isProcessingEdit = true;
    if (editBtn) editBtn.disabled = true;

    const payload: any = {
      nome,
      descricao,
      tipo,
      custo_moedas: tipo === 'COMPRA' ? custo_moedas : null,
      criterio_doacoes,
      criterio_moedas,
      ativo: true
    };
    if (iconeFile) payload.icone = iconeFile;

    const result = await atualizarBadgeAdmin(editingBadgeId, payload);

    (window as any).bootstrap?.Modal.getOrCreateInstance(
      document.getElementById('editBadgeModal')!
    )?.hide();

    showApiSuccess(result, 'Badge atualizada');
    await loadDisponiveis();
    renderDisponiveis();
  } catch (err) {
    displayErrorToast(err);
  } finally {
    isProcessingEdit = false;
    if (editBtn) editBtn.disabled = false;
  }
}

async function submitDeleteBadge(): Promise<void> {
  if (!isAdmin() || !editingBadgeId || isProcessingDelete) return;

  const delBtn = document.getElementById('confirmDeleteBadgeBtn') as HTMLButtonElement | null;

  try {
    isProcessingDelete = true;
    if (delBtn) delBtn.disabled = true;

    const result = await excluirBadgeAdmin(editingBadgeId);

    (window as any).bootstrap?.Modal.getOrCreateInstance(
      document.getElementById('editBadgeModal')!
    )?.hide();

    showApiSuccess(result, 'Badge excluída');
    await loadDisponiveis();
    renderDisponiveis();
  } catch (err) {
    displayErrorToast(err);
  } finally {
    isProcessingDelete = false;
    if (delBtn) delBtn.disabled = false;
  }
}