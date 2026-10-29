import { logout, isTokenValid } from './auth';

const getSelectedTenantId = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('tenant-storage') || '{}');
    return stored?.state?.selectedTenantId || null;
  } catch {
    return null;
  }
};

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  if (!isTokenValid()) {
    logout();
    throw new Error('Session expired');
  }

  const token = localStorage.getItem('token');
  const tenantId = getSelectedTenantId();
  if (!tenantId) throw new Error('Tenant is required');

  const headers: Record<string, string> = {
    ...(token ? { Authorization: 'Bearer ' + token } : {}),
    'X-Tenant-ID': tenantId,
    ...((options.headers as Record<string, string>) || {}),
  };
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    logout();
    throw new Error('Unauthorized');
  }
  return response;
};
