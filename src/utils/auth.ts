// Add this to your auth utility or call it from your logout function
import { useUserStore } from '../store/UserStore';

export const saveAuthFromResponse = (data: any, fallbackName = '') => {
  console.log('tokenExpiry found', data);
  const token = data?.token || data?.raw?.token || data?.raw?.accessToken || null;
  const tokenExpiry = data?.tokenExpiryTs || data?.raw?.tokenExpiryTs || data?.raw?.tokenExpiry || data?.expiresAt || null;
  const refreshToken = data?.refreshToken || data?.raw?.refreshToken || null;
  const userName = data?.userName || data?.raw?.userName || data?.name || fallbackName || '';
  const user = data?.user || data?.raw?.user || null;

  try {
    if (token) localStorage.setItem('token', token);
    if (tokenExpiry) localStorage.setItem('tokenExpiryTs', String(tokenExpiry));
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (userName) localStorage.setItem('userName', userName);
    if (user) localStorage.setItem('user', JSON.stringify(user));
  } catch (e) {
    console.warn('Failed to write auth to localStorage', e);
  }
};

export const isTokenValid = () => {
  if (typeof window === 'undefined') {
    console.log('isTokenValid window undefined');
    return false;
  }
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
    useUserStore.getState().logout(); // This clears the Zustand state
    localStorage.clear();             // This clears all tokens
    window.location.href = '/login';  // This forces the redirectry

  } catch (e) {
    console.warn('Failed to clear session', e);
  }
};
