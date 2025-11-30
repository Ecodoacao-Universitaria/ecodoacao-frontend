import { apiRequest } from './http';
import { API_ENDPOINTS, authHeaders } from '../config/api';
import { escapeHtml } from '../utils/html';

let _typesCache: any[] = [];

export async function listarTiposDoacao(): Promise<any[]> {
  const data = await apiRequest<any>(API_ENDPOINTS.doacoes.tipos, {
    method: 'GET',
    headers: authHeaders(),
    absolute: true
  });
  _typesCache = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
  return _typesCache;
}

export function getTiposCache(): any[] {
  return _typesCache.slice();
}

export async function populateDonationTypesSelects(): Promise<void> {
  try {
    const tipos = await listarTiposDoacao();
    document.querySelectorAll('select#tipo, select[data-tipo-doacao]').forEach(sel => {
      sel.innerHTML = '<option value="">Selecione...</option>' +
        tipos.map(t => `<option value="${t.id}">${escapeHtml(t.nome)}</option>`).join('');
    });
  } catch (err) {
    console.error('Erro ao popular tipos:', err);
    throw err;
  }
}