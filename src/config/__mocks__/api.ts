export const API_ENDPOINTS = {
  auth: {
    login: 'http://mock/api/contas/token/',
  },
};

export const authHeaders = () => ({ Accept: 'application/json', 'Content-Type': 'application/json' });
