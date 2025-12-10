import { historicoUsuario, getStatusInfo, formatarDataDoacao } from '../services/doacoes.services';
import { escapeHtml } from '../utils/html';
import { displayErrorToast } from '../utils/notifications';

type HistoricoItem = {
  id: number;
  status: string;
  descricao?: string;
  data_submissao: string;
  tipo_doacao?: { id: number; nome: string };
  evidencia_foto?: string;
  motivo_recusa?: string;
};

type HistoricoResponse = {
  results: HistoricoItem[];
  count: number;
  page_size?: number;
  next?: string | null;
  previous?: string | null;
};

let currentPage = 1;
let currentStatus: string | undefined;
let loading = false;
let cachedItems: HistoricoItem[] = []; // cache para modal

export async function initHistorico(): Promise<void> {
  bindFilters();
  await loadHistorico();
}

function bindFilters(): void {
  const statusSelect = document.getElementById('historicoStatus') as HTMLSelectElement | null;
  const prevBtn = document.getElementById('historicoPrev') as HTMLButtonElement | null;
  const nextBtn = document.getElementById('historicoNext') as HTMLButtonElement | null;

  statusSelect?.addEventListener('change', async () => {
    currentStatus = statusSelect.value || undefined;
    currentPage = 1;
    await loadHistorico();
  });

  prevBtn?.addEventListener('click', async () => {
    if (currentPage > 1) {
      currentPage--;
      await loadHistorico();
    }
  });

  nextBtn?.addEventListener('click', async () => {
    currentPage++;
    await loadHistorico();
  });
}

async function loadHistorico(): Promise<void> {
  if (loading) return;
  loading = true;

  const list = document.getElementById('historicoList') as HTMLUListElement | null;
  const pager = document.getElementById('historicoPager');

  if (list) list.innerHTML = '<li class="list-group-item text-muted">Carregando...</li>';

  try {
    const raw = await historicoUsuario({ status: (currentStatus as unknown) as any, page: currentPage });
    const resp = raw as unknown as Partial<HistoricoResponse> & { results?: any[] };
    const rawItems = Array.isArray(resp?.results) ? resp.results : [];
    const items: HistoricoItem[] = rawItems.map(r => ({
      id: Number(r?.id ?? 0),
      status: String(r?.status ?? ''),
      descricao: r?.descricao ?? undefined,
      data_submissao: String(r?.data_submissao ?? ''),
      evidencia_foto: r?.evidencia_foto ?? undefined,
      motivo_recusa: r?.motivo_recusa ?? undefined,
      tipo_doacao: typeof r?.tipo_doacao === 'string'
        ? { id: 0, nome: r.tipo_doacao }
        : (r?.tipo_doacao && typeof r.tipo_doacao === 'object'
           ? { id: Number(r.tipo_doacao.id ?? 0), nome: String(r.tipo_doacao.nome ?? '') }
           : undefined)
    }));
    const count = Number(resp?.count ?? items.length);
    const pageSize = Number(resp?.page_size ?? 10);
    const hasNext = !!resp?.next;
    const hasPrev = !!resp?.previous;

    if (currentPage > 1 && !hasPrev && items.length === 0) {
      currentPage = Math.max(1, currentPage - 1);
    }

    cachedItems = items; // guarda para usar no modal
    if (list) renderHistorico(list, items);
    renderPager(pager, hasPrev, hasNext, count, pageSize);
  } catch (err: any) {
    if (list) list.innerHTML = '<li class="list-group-item text-danger">Falha ao carregar histórico.</li>';
    displayErrorToast(err);
  } finally {
    loading = false;
  }
}

export function renderHistorico(listEl: HTMLUListElement, items: HistoricoItem[]): void {
  if (!listEl) return;

  if (!items || items.length === 0) {
    listEl.innerHTML = '<li class="list-group-item text-muted">Nenhuma doação encontrada.</li>';
    return;
  }

  const frag = document.createDocumentFragment();
  items.forEach(it => {
    const info = getStatusInfo(it.status);
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.style.cursor = 'pointer';
    li.dataset.doacaoId = String(it.id);
    li.innerHTML = `
      <div>
        <div class="fw-semibold">${escapeHtml(it?.tipo_doacao?.nome || 'Doação')}</div>
        <div class="text-muted small">${escapeHtml(it?.descricao || '')}</div>
        <div class="small">Submetida em: ${escapeHtml(formatarDataDoacao(it?.data_submissao))}</div>
      </div>
      <span class="badge bg-${info.variant}">${escapeHtml(info.label)}</span>
    `;
    
    // Clique abre modal com dados já carregados
    li.addEventListener('click', () => abrirDetalhesDoacao(it));
    
    frag.appendChild(li);
  });

  listEl.innerHTML = '';
  listEl.appendChild(frag);
}

function abrirDetalhesDoacao(doacao: HistoricoItem): void {
  const modalBody = document.getElementById('doacaoDetalhesBody');
  if (!modalBody) return;

  const info = getStatusInfo(doacao.status);
  const tipoNome = doacao?.tipo_doacao?.nome || 'Desconhecido';

  modalBody.innerHTML = `
    <div class="row g-3">
      <div class="col-md-6">
        <h6>Informações da Doação</h6>
        <p><strong>ID:</strong> ${doacao.id}</p>
        <p><strong>Tipo:</strong> ${escapeHtml(tipoNome)}</p>
        <p><strong>Status:</strong> <span class="badge bg-${info.variant}">${info.label}</span></p>
        <p><strong>Data de Submissão:</strong> ${formatarDataDoacao(doacao.data_submissao)}</p>
        ${doacao.descricao ? `<p><strong>Descrição:</strong><br>${escapeHtml(doacao.descricao)}</p>` : ''}
        ${doacao.motivo_recusa ? `
          <div class="alert alert-danger mt-3">
            <strong>Motivo da Recusa:</strong><br>
            ${escapeHtml(doacao.motivo_recusa)}
          </div>
        ` : ''}
      </div>
      <div class="col-md-6">
        <h6>Evidência</h6>
        ${doacao.evidencia_foto 
          ? `<img src="${escapeHtml(doacao.evidencia_foto)}" alt="Evidência da doação" class="img-fluid rounded border" style="max-height:400px;width:100%;object-fit:contain;">`
          : '<p class="text-muted">Sem imagem disponível</p>'
        }
      </div>
    </div>
  `;

  const modal = document.getElementById('doacaoDetalhesModal');
  if (modal) {
    const bsModal = new (window as any).bootstrap.Modal(modal);
    bsModal.show();
  }
}

function renderPager(
  pager: HTMLElement | null,
  hasPrev: boolean,
  hasNext: boolean,
  count: number,
  pageSize: number
): void {
  if (!pager) return;
  const prevBtn = pager.querySelector('#historicoPrev') as HTMLButtonElement | null;
  const nextBtn = pager.querySelector('#historicoNext') as HTMLButtonElement | null;
  const infoEl = pager.querySelector('#historicoInfo') as HTMLElement | null;

  prevBtn && (prevBtn.disabled = !hasPrev || currentPage <= 1);
  nextBtn && (nextBtn.disabled = !hasNext);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  if (infoEl) infoEl.textContent = `Página ${currentPage} de ${totalPages}`;
}