// Memory fallback
let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

export const getAccessToken = (): string | null => {
  if (memoryAccessToken) return memoryAccessToken;
  return localStorage.getItem('access_token');
};

export const getRefreshToken = (): string | null => {
  if (memoryRefreshToken) return memoryRefreshToken;
  return localStorage.getItem('refresh_token');
};

export const setTokens = (access: string, refresh: string) => {
  memoryAccessToken = access;
  memoryRefreshToken = refresh;
  
  try {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  } catch (e) {
    // Graceful degradation for restricted environments (e.g. strict incognito)
    console.warn('localStorage is not available, falling back to memory store.');
  }
};

export const clearSession = () => {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  } catch (e) {
    // Ignore error
  }
};
