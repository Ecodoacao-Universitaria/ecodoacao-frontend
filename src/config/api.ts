const raw =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) ||
  (window as any).__API_BASE__ ||
  '';

const BASE = String(raw).trim().replace(/\/+$/, ''); 
const API_PREFIX = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_PREFIX) || 'api';

export const API_BASE_URL = BASE.replace(/\/+$/, '') + (API_PREFIX ? `/${API_PREFIX.replace(/^\/+|\/+$/g, '')}` : '');

if (!BASE) {
  console.warn('[API] VITE_API_BASE ausente. Configure em .env (ex: https://ecodoacao-backend-wgqq.onrender.com)');
}

export function buildApiUrl(path: string): string {
  const clean = path.replace(/^\/+/, '');
  const base = API_BASE_URL.replace(/\/+$/, '');
  return `${base}/${clean}`;
}

export const API_ENDPOINTS = {
  auth: {
    login: buildApiUrl('/contas/token/'),
    register: buildApiUrl('/contas/cadastrar/'),
    refresh: buildApiUrl('/contas/token/refresh/'),
    dashboard: buildApiUrl('/contas/dashboard/'),
  },
  usuario: {
    perfil: buildApiUrl('/contas/usuarios/meu-perfil/'),
    alterarSenha: buildApiUrl('/contas/usuarios/alterar-senha/'),
  },
  doacoes: {
    criar: buildApiUrl('/doacoes/submeter/'),
    historico: buildApiUrl('/doacoes/historico/'),
    tipos: buildApiUrl('/doacoes/tipos/'),
  },
  admin: {
    pendentes: buildApiUrl('/doacoes/admin/pendentes/'),
    validar: (id: number | string) => buildApiUrl(`/doacoes/admin/validar/${id}/`),
  },
  badges: {
    minhas: buildApiUrl('/doacoes/badges/minhas/'),
    disponiveis: buildApiUrl('/doacoes/badges/disponiveis/'),
    comprar: buildApiUrl('/doacoes/badges/comprar/'),
    criar: buildApiUrl('/doacoes/admin/badges/'),
    atualizar: (id: number | string) => buildApiUrl(`/doacoes/admin/badges/${id}/`),
    excluir: (id: number | string) => buildApiUrl(`/doacoes/admin/badges/${id}/`)
  }
};

export const getAuthToken = (): string | null =>
  localStorage.getItem('ecodoacao_access') || null;

export const authHeaders = (json = true): Record<string,string> => {
  const h: Record<string,string> = { Accept: 'application/json' };
  if (json) h['Content-Type'] = 'application/json';
  const t = getAuthToken();
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
};

export const multipartHeaders = (): Record<string,string> => {
  const h: Record<string,string> = { Accept: 'application/json' };
  const t = getAuthToken();
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
};