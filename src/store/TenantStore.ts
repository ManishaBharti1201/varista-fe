import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { configuredTenants, Tenant } from '../config/tenants';

export type { Tenant } from '../config/tenants';

interface TenantState {
  tenants: Tenant[];
  selectedTenantId: string | null;
  loading: boolean;
  error: string | null;
  loadTenants: () => Promise<Tenant[]>;
  selectTenant: (tenantId: string) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      tenants: configuredTenants,
      selectedTenantId: null,
      loading: false,
      error: null,

      loadTenants: async () => {
        const selectedTenantId = get().selectedTenantId;
        const validSelection = configuredTenants.some(tenant => tenant.id === selectedTenantId) ? selectedTenantId : null;
        set({ tenants: configuredTenants, loading: false, error: null, selectedTenantId: validSelection });
        return configuredTenants;
      },

      selectTenant: (tenantId) => {
        if (!get().tenants.some(tenant => tenant.id === tenantId)) throw new Error('Invalid tenant');
        set({ selectedTenantId: tenantId });
      },

      clearTenant: () => set({ selectedTenantId: null }),
    }),
    { name: 'tenant-storage', storage: createJSONStorage(() => localStorage), partialize: state => ({ selectedTenantId: state.selectedTenantId }) }
  )
);
