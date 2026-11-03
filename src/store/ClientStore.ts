import { create } from 'zustand';
import { endpoints } from '../config/urls';
import { useTenantStore } from './TenantStore';

export interface ClientConfig {
  id: string;
  name: string;
  domain?: string;
  theme: {
    appName: string;
    primaryColor: string;
    logoUrl: string;
  };
  menuItems: string[];
}

interface ClientState {
  clients: ClientConfig[];
  selectedClientId: string;
  loading: boolean;
  error: string | null;
  loadClients: () => Promise<void>;
  selectClient: (clientId: string) => void;
}

const CLIENT_STORAGE_KEY = 'selected-client-id';

export const useClientStore = create<ClientState>((set) => ({
  clients: [],
  selectedClientId: localStorage.getItem(CLIENT_STORAGE_KEY) || '',
  loading: false,
  error: null,

  loadClients: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(endpoints.clients());
      if (!response.ok) throw new Error('Unable to load available clients');

      const clients = await response.json() as ClientConfig[];
      if (!Array.isArray(clients) || clients.length === 0) {
        throw new Error('No clients are currently configured');
      }

      set((state) => {
        const selectedTenantId = useTenantStore.getState().selectedTenantId;
        const selectedTenant = useTenantStore.getState().tenants.find(tenant => tenant.id === selectedTenantId);
        const mappedClientId = selectedTenant?.clientId || selectedTenant?.id;
        const savedSelectionExists = clients.some(client => client.id === state.selectedClientId);
        const mappedClient = clients.find(client => client.id === mappedClientId);
        const selectedClientId = savedSelectionExists
          ? state.selectedClientId
          : mappedClient?.id || (!selectedTenant?.clientId && clients.length === 1 ? clients[0].id : '');
        if (selectedClientId) localStorage.setItem(CLIENT_STORAGE_KEY, selectedClientId);
        else localStorage.removeItem(CLIENT_STORAGE_KEY);
        return { clients, selectedClientId, loading: false, error: null };
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to load available clients'
      });
      throw error;
    }
  },

  selectClient: (clientId) => {
    if (localStorage.getItem(CLIENT_STORAGE_KEY) !== clientId) {
      ['token', 'tokenExpiryTs', 'refreshToken', 'userName', 'user', 'user-storage'].forEach(key => localStorage.removeItem(key));
    }
    localStorage.setItem(CLIENT_STORAGE_KEY, clientId);
    set({ selectedClientId: clientId });
  }
}));
