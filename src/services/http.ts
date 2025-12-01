const API_BASE =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) ||
  (window as any).__API_BASE__ ||
  'http://localhost:8000';

const API_BASE_NORMALIZED = String(API_BASE).trim().replace(/\/+$/,'');
const API_ROOT = `${API_BASE_NORMALIZED}/api`;

const ACCESS_KEY = 'ecodoacao_access';
const REFRESH_KEY = 'ecodoacao_refresh';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}
export function setTokens(tokens: { access?: string; refresh?: string }) {
  if (tokens.access) localStorage.setItem(ACCESS_KEY, tokens.access);
  if (tokens.refresh) localStorage.setItem(REFRESH_KEY, tokens.refresh);
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function decode(token: string): any | null {
  try {
    const [, payload] = token.split('.');
    const txt = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(txt));
  } catch {
    return null;
  }
}

export function tokenExpiresInMs(): number | null {
  const t = getAccessToken();
  if (!t) return null;
  const d = decode(t);
  if (!d?.exp) return null;
  return d.exp * 1000 - Date.now();
}

let refreshing: Promise<string> | null = null;
async function ensureFreshToken(): Promise<void> {
  const ms = tokenExpiresInMs();
  if (ms !== null && ms < 60_000) {
    if (!refreshing) {
      const r = getRefreshToken();
      if (!r) return;
      refreshing = fetch(`${API_ROOT}/contas/token/refresh/`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: r })
      })
        .then(async (resp) => {
          const json = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(json?.detail || 'Falha ao atualizar token.');
          if (json?.access) setTokens({ access: json.access });
          return json?.access || '';
        })
        .finally(() => { refreshing = null; });
    }
    await refreshing;
  }
}

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<TBody> {
  method?: ApiMethod;
  body?: TBody;
  headers?: Record<string,string>;
  timeoutMs?: number;
  credentials?: RequestCredentials;
  absolute?: boolean;
}

export async function apiRequest<TResp = any, TBody = any>(
  url: string,
  opts: RequestOptions<TBody> = {}
): Promise<TResp> {
  const {
    method = 'GET',
    body,
    headers = {},
    timeoutMs = 10000,
    credentials,
    absolute = false
  } = opts;

  await ensureFreshToken();

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  const finalHeaders: Record<string,string> = { 'Accept': 'application/json', ...headers };
  const access = getAccessToken();
  if (access && !finalHeaders['Authorization']) {
    finalHeaders['Authorization'] = `Bearer ${access}`;
  }

  let fetchBody: any;
  if (body instanceof FormData) {
    delete finalHeaders['Content-Type'];
    fetchBody = body;
  } else if (body && typeof body === 'object') {
    if (!finalHeaders['Content-Type']) finalHeaders['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(body);
  }

  const fullUrl = absolute
    ? url
    : `${API_ROOT.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;

  let resp: Response;
  try {
    resp = await fetch(fullUrl, {
      method,
      headers: finalHeaders,
      body: fetchBody,
      signal: ctrl.signal,
      credentials
    });
  } catch (e: any) {
    clearTimeout(timer);
    throw new Error(e?.name === 'AbortError' ? 'Requisição expirada.' : 'Falha de conexão.');
  }
  clearTimeout(timer);

  const txt = await resp.text();
  let json: any;
  try { json = txt ? JSON.parse(txt) : null; } catch { json = txt; }

  if (!resp.ok) {
    if (resp.status === 401) {
      clearTokens();
    }
    const detail = json?.detail || json?.erro || resp.statusText || 'Erro na requisição';
    const error: any = new Error(detail);
    error.status = resp.status;
    error.payload = json;
    throw error;
  }
  return json as TResp;
}