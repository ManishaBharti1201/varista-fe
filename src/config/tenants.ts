export interface Tenant {
  id: string;
  name: string;
}

interface RuntimeConfig {
  REACT_APP_TENANTS?: string;
}

const runtimeConfig = (window as Window & { _env_?: RuntimeConfig })._env_;
const tenantsConfig = runtimeConfig?.REACT_APP_TENANTS || process.env.REACT_APP_TENANTS;
const fallbackTenants: Tenant[] = [{ id: '101', name: 'Leadac' }];

function parseTenants(value?: string): Tenant[] {
  if (!value) return fallbackTenants;

  try {
    const tenants = JSON.parse(value);
    if (!Array.isArray(tenants)) return fallbackTenants;

    const validTenants = tenants.filter(
      (tenant): tenant is Tenant =>
        tenant && typeof tenant.id === 'string' && /^1\d{2}$/.test(tenant.id.trim()) &&
        typeof tenant.name === 'string' && tenant.name.trim()
    );

    return validTenants.length ? validTenants : fallbackTenants;
  } catch {
    return fallbackTenants;
  }
}

// Configure this as a JSON array with sequential 1xx IDs, e.g. [{"id":"101","name":"Leadac"}].
export const configuredTenants = parseTenants(tenantsConfig);
