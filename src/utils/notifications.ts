import { escapeHtml } from '../utils/html';

interface ApiErrorShape {
  erro?: string;
  codigo?: string;
  detalhes?: any;
}

type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

interface ShowToastOptions {
  timeout?: number;
  dedupeKey?: string;
  variantOverride?: ToastVariant;
}

const _toastCache = new Map<string, number>();

export function showToast(
  message: string,
  variant: ToastVariant = 'success',
  timeout = 3000,
  options: ShowToastOptions = {}
): void {
  const dedupeKey = options.dedupeKey || `${variant}:${message}`;
  const now = Date.now();
  const last = _toastCache.get(dedupeKey);
  if (last && (now - last) < 800) {
    return;
  }
  _toastCache.set(dedupeKey, now);

  const container = ensureToastContainer();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('aria-atomic', 'true');

  toast.innerHTML = `
    <div class="toast-header bg-${variant} text-white">
      <strong class="me-auto">Eco Doação</strong>
      <small class="ms-2">${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</small>
      <button 
        type="button" 
        class="btn-close btn-close-white ms-2 mb-1" 
        data-bs-dismiss="toast" 
        aria-label="Fechar"
      ></button>
    </div>
    <div class="toast-body small">
      ${escapeHtml(message)}
    </div>
  `;

  container.appendChild(toast);

  try {
    const ToastCtor = (window as any).bootstrap?.Toast;
    if (ToastCtor) {
      const bsToast = new ToastCtor(toast, { delay: options.timeout || timeout });
      bsToast.show();
      toast.addEventListener('hidden.bs.toast', () => toast.remove());
      return;
    }
  } catch {}

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.remove();
  }, (options.timeout || timeout) + 500);
}

export function showApiError(error: any, fallback = 'Erro na requisição'): void {
  const data: ApiErrorShape | undefined = error?.response?.data;
  let mensagem = fallback;
  let codigo = data?.codigo || '';
  let detalhes = data?.detalhes;

  if (data?.erro) mensagem = String(data.erro);
  else if (error?.message && !data) mensagem = error.message;

  const variant: ToastVariant = mapErrorCodeToVariant(codigo, mensagem);
  showToast(formatErrorMessage(mensagem, codigo, detalhes), variant, 4500, { dedupeKey: codigo || mensagem });
}

export function showApiSuccess(payload: any, fallback = 'Operação concluída'): void {
  if (!payload) {
    showToast(fallback, 'success');
    return;
  }
  const msg = payload.mensagem || payload.detail || fallback;
  showToast(String(msg), 'success');
}

function formatErrorMessage(msg: string, codigo?: string, detalhes?: any): string {
  if (!codigo && !detalhes) return msg;
  const extras: string[] = [];
  if (codigo) extras.push(`Código: ${codigo}`);
  if (detalhes && typeof detalhes === 'object') {
    const flat = Object.entries(detalhes)
      .slice(0, 3)
      .map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
      .join(' | ');
    if (flat) extras.push(flat);
  }
  return `${msg}${extras.length ? ' (' + extras.join(' / ') + ')' : ''}`;
}

function mapErrorCodeToVariant(codigo?: string, mensagem?: string): ToastVariant {
  const c = (codigo || '').toUpperCase();
  if (!c) {
    if (/\b(negad|denied|inval|erro|fail|insuf)\b/i.test(mensagem || '')) return 'danger';
    return 'warning';
  }
  if (/PERMIS|FORBID|NAO_AUTORIZ|INSUF/i.test(c)) return 'danger';
  if (/NOT_FOUND|INEXIST|NAO_ENCONTR/i.test(c)) return 'warning';
  if (/VALIDA|FORMAT|INPUT|PAYLOAD|PARAM/i.test(c)) return 'warning';
  return 'danger';
}

function ensureToastContainer(): HTMLElement {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1080';
    document.body.appendChild(container);
  }
  return container;
}

export function initNotifications(): void {
  window.addEventListener('ecodoacao:notification', (ev: any) => {
    const { title, message } = ev?.detail || {};
    showToast(`${title}: ${message}`, 'info');
  });
}

export function addNotification(title: string, message: string, link?: string): void {
  const event = new CustomEvent('ecodoacao:notification', {
    detail: { title, message, link }
  });
  window.dispatchEvent(event);
}

export function showErrorFromAxios(err: any, fallback?: string): void {
  showApiError(err, fallback);
}

export function showServiceResult(result: any): void {
  if (result?.sucesso === true) {
    showToast(result.mensagem || 'Sucesso', 'success');
  } else if (result?.sucesso === false) {
    const variant = mapErrorCodeToVariant(result.codigo, result.mensagem);
    showToast(formatErrorMessage(result.mensagem || 'Falha', result.codigo, result.detalhes), variant);
  }
}

export function displayErrorToast(err: any, fallback = 'Erro'): void {
  if (!err) { showToast(fallback, 'danger'); return; }
  const msg = err.message || err?.payload?.detail || fallback;
  showToast(msg, err.status && err.status >= 500 ? 'danger' : 'warning', 6000);
}

// Disponibiliza global
(window as any).showToast = showToast;
(window as any).showApiError = showApiError;
(window as any).showErrorFromAxios = showErrorFromAxios;