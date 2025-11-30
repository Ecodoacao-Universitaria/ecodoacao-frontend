import { apiRequest } from './http';
import { API_ENDPOINTS, authHeaders, multipartHeaders } from '../config/api';
import { Doacao, DoacaoListResponse, CriarDoacaoPayload, ValidarDoacaoPayload, ValidarDoacaoResponse, HistoricoDoacaoQuery } from '../types/api.types';

export async function criarDoacao(payload: CriarDoacaoPayload): Promise<Doacao> {
  const fd = new FormData();
  fd.append('tipo_doacao', String(Number(payload.tipo_doacao)));
  if (payload.descricao) fd.append('descricao', payload.descricao);
  fd.append('evidencia_foto', payload.evidencia_foto);
  return apiRequest<Doacao>(API_ENDPOINTS.doacoes.criar, {
    method: 'POST',
    body: fd,
    headers: multipartHeaders(),
    absolute: true
  });
}

export async function historicoUsuario(query?: HistoricoDoacaoQuery): Promise<DoacaoListResponse> {
  const params: Record<string, any> = {};
  if (query?.status) params.status = query.status;
  if (query?.page) params.page = query.page;
  const qs = new URLSearchParams(params).toString();
  const url = qs ? `${API_ENDPOINTS.doacoes.historico}?${qs}` : API_ENDPOINTS.doacoes.historico;
  return apiRequest<DoacaoListResponse>(url, {
    method: 'GET',
    headers: authHeaders(),
    absolute: true
  });
}

export async function listarDoacoesPendentes(page?: number): Promise<DoacaoListResponse> {
  const qs = page ? `?page=${page}` : '';
  return apiRequest<DoacaoListResponse>(`${API_ENDPOINTS.admin.pendentes}${qs}`, {
    method: 'GET',
    headers: authHeaders(),
    absolute: true
  });
}

export async function validarDoacao(id: number, payload: ValidarDoacaoPayload): Promise<ValidarDoacaoResponse> {
  return apiRequest<ValidarDoacaoResponse>(API_ENDPOINTS.admin.validar(id), {
    method: 'PATCH',
    body: payload,
    headers: authHeaders(),
    absolute: true
  });
}

export function getStatusInfo(status: string): { label: string; variant: 'secondary' | 'warning' | 'success' | 'danger' } {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'PENDENTE': return { label: 'Pendente', variant: 'secondary' };
    case 'APROVADA': return { label: 'Aprovada', variant: 'success' };
    case 'RECUSADA': return { label: 'Recusada', variant: 'danger' };
    default: return { label: s || 'Desconhecido', variant: 'warning' };
  }
}

export function validarImagemDoacao(file: File): true | string {
  const maxSize = 5 * 1024 * 1024;
  const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowed.includes(file.type)) return 'Formato inválido. Use JPG ou PNG.';
  if (file.size > maxSize) return 'A imagem deve ter no máximo 5MB.';
  return true;
}

export function formatarDataDoacao(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
}