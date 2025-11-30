import { apiRequest } from './http';
import { API_ENDPOINTS, authHeaders } from '../config/api';

export async function getDashboard() {
  return apiRequest(API_ENDPOINTS.auth.dashboard, {
    method: 'GET',
    headers: authHeaders(),
    absolute: true
  });
}

export async function registrarUsuario(data: { username: string; email: string; password: string; }) {
  return apiRequest(API_ENDPOINTS.auth.register, {
    method: 'POST',
    body: data,
    headers: authHeaders(),
    absolute: true
  });
}

export async function atualizarPerfil(data: { username: string; email: string; }) {
  return apiRequest(API_ENDPOINTS.usuario.perfil, {
    method: 'PATCH',
    body: data,
    headers: authHeaders(),
    absolute: true
  });
}

export async function alterarSenha(data: { senha_atual: string; nova_senha: string; }) {
  return apiRequest(API_ENDPOINTS.usuario.alterarSenha, {
    method: 'POST',
    body: data,
    headers: authHeaders(),
    absolute: true
  });
}