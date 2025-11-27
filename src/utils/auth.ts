export const saveAuthFromResponse = (data: any, fallbackName = '') => {
  const token = data?.token || data?.raw?.token || data?.raw?.accessToken || null;
  const tokenExpiry = data?.tokenExpiryTs || data?.raw?.tokenExpiryTs || data?.raw?.tokenExpiry || data?.raw?.expiresAt || null;
  const refreshToken = data?.refreshToken || data?.raw?.refreshToken || null;
  const userName = data?.userName || data?.raw?.userName || data?.name || fallbackName || '';

  try {
    if (token) localStorage.setItem('token', token);
    if (tokenExpiry) localStorage.setItem('tokenExpiryTs', String(tokenExpiry));
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (userName) localStorage.setItem('userName', userName);
  } catch (e) {
    console.warn('Failed to write auth to localStorage', e);
  }
};

export const isTokenValid = () => {
  if (typeof window === 'undefined') return false;
  try {
    const token = localStorage.getItem('token');
    const expiry = parseInt(localStorage.getItem('tokenExpiryTs') || '0', 10);
    if (!token || !expiry) return false;
    return expiry > Date.now();
  } catch (e) {
    console.warn('isTokenValid error', e);
    return false;
  }
};

export const logout = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiryTs');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
  } catch (e) {
    console.warn('logout error', e);
  }
};
