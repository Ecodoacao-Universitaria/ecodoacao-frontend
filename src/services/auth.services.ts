import { apiRequest, setTokens, getAccessToken, getRefreshToken, clearTokens } from './http';
import { API_ENDPOINTS, authHeaders } from '../config/api';

export async function login(data: { username: string; password: string; }) {
  const resp = await apiRequest(API_ENDPOINTS.auth.login, {
    method: 'POST',
    body: data,
    headers: authHeaders(),
    absolute: true
  });
  if (resp?.access || resp?.refresh) {
    setTokens({ access: resp.access, refresh: resp.refresh });
  }
  return resp;
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function requireAuth(): boolean {
  if (!isAuthenticated()) {
    window.location.href = '/src/pages/login.html';
    return false;
  }
  return true;
}

export function redirectIfAuthenticated(): boolean {
  if (isAuthenticated()) {
    window.location.href = '/src/pages/dashboard.html';
    return true;
  }
  return false;
}

export function logout(): void {
  clearTokens();
}

export function getUserClaims(): any | null {
  const t = getAccessToken();
  if (!t) return null;
  try {
    const [, payload] = t.split('.');
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return json || null;
  } catch {
    return null;
  }
}