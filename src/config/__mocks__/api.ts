export const API_ENDPOINTS = {
  auth: {
    login: 'http://mock/api/contas/token/',
  },
  doacoes: {
    tipos: 'http://mock/api/doacoes/tipos/',
  },
};

export const authHeaders = () => ({ Accept: 'application/json', 'Content-Type': 'application/json' });
