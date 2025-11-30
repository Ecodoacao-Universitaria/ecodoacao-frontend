import { apiRequest } from './http';
import { API_ENDPOINTS, authHeaders, multipartHeaders } from '../config/api';

export async function listarMinhasBadges() {
  return apiRequest(API_ENDPOINTS.badges.minhas, {
    method: 'GET',
    headers: authHeaders(),
    absolute: true
  });
}

export async function listarBadgesDisponiveis() {
  return apiRequest(API_ENDPOINTS.badges.disponiveis, {
    method: 'GET',
    headers: authHeaders(),
    absolute: true
  });
}

export async function comprarBadge(id: number) {
  return apiRequest(API_ENDPOINTS.badges.comprar, {
    method: 'POST',
    body: { badge_id: id },
    headers: authHeaders(),
    absolute: true
  });
}

export async function criarBadgeAdmin(data: {
  nome: string;
  descricao: string;
  tipo: 'COMPRA' | 'CONQUISTA';
  custo_moedas?: number;
  criterio_doacoes?: number | null;
  criterio_moedas?: number | null;
  ativo: boolean;
  icone: File | null;
}) {
  const fd = new FormData();
  fd.append('nome', data.nome);
  fd.append('descricao', data.descricao);
  fd.append('tipo', data.tipo);
  if (typeof data.custo_moedas === 'number') fd.append('custo_moedas', String(data.custo_moedas));
  if (data.criterio_doacoes != null) fd.append('criterio_doacoes', String(data.criterio_doacoes));
  if (data.criterio_moedas != null) fd.append('criterio_moedas', String(data.criterio_moedas));
  fd.append('ativo', String(data.ativo));
  if (data.icone) fd.append('icone', data.icone);

  return apiRequest(API_ENDPOINTS.badges.criar, {
    method: 'POST',
    body: fd,
    headers: multipartHeaders(),
    absolute: true
  });
}

export async function atualizarBadgeAdmin(id: number, data: {
  nome?: string;
  descricao?: string;
  tipo?: 'COMPRA' | 'CONQUISTA';
  custo_moedas?: number;
  criterio_doacoes?: number | null;
  criterio_moedas?: number | null;
  ativo?: boolean;
  icone?: File | null;
}) {
  if (data.icone instanceof File) {
    const fd = new FormData();
    if (data.nome) fd.append('nome', data.nome);
    if (data.descricao) fd.append('descricao', data.descricao);
    if (data.tipo) fd.append('tipo', data.tipo);
    if (typeof data.custo_moedas === 'number') fd.append('custo_moedas', String(data.custo_moedas));
    if (data.criterio_doacoes != null) fd.append('criterio_doacoes', String(data.criterio_doacoes));
    if (data.criterio_moedas != null) fd.append('criterio_moedas', String(data.criterio_moedas));
    if (typeof data.ativo === 'boolean') fd.append('ativo', String(data.ativo));
    fd.append('icone', data.icone);
    return apiRequest(API_ENDPOINTS.badges.atualizar(id), {
      method: 'PATCH',
      body: fd,
      headers: multipartHeaders(),
      absolute: true
    });
  }
  return apiRequest(API_ENDPOINTS.badges.atualizar(id), {
    method: 'PATCH',
    body: data,
    headers: authHeaders(),
    absolute: true
  });
}

export async function excluirBadgeAdmin(id: number) {
  return apiRequest(API_ENDPOINTS.badges.excluir(id), {
    method: 'DELETE',
    headers: authHeaders(),
    absolute: true
  });
}

export function formatarDataConquista(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString('pt-BR');
}