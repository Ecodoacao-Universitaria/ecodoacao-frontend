export const apiRequest = jest.fn();
export const setTokens = jest.fn();
export const getAccessToken = jest.fn<null | string, []>(() => null);
export const clearTokens = jest.fn();
export const tokenExpiresInMs = jest.fn<null | number, []>(() => null);
