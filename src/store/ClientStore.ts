import { create } from 'zustand';
import { endpoints } from '../config/urls';

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
        const selectionExists = clients.some(client => client.id === state.selectedClientId);
        const selectedClientId = selectionExists ? state.selectedClientId : '';
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
