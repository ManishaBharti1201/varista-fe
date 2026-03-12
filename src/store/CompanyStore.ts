import { create } from 'zustand';
import { endpoints } from '../config/urls';
import { apiRequest } from '../utils/apiClient';

export interface Company {
  id: string;
  name: string;
  gstin: string;
  avatar: string;
  createdAt: string;
  email: string;
  phone: string;
  color: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    cityStateZip: string;
  };
  ledgerBalance: number;
}

interface CompanyState {
  companies: Company[];
  loading: boolean;
  fetchCompanies: () => Promise<void>;
  createCompany: (company: Partial<Company>) => Promise<void>;
  updateCompany: (company: Partial<Company>) => Promise<void>;
  updateCompanyVisuals: () => void;
}

const generateInitials = (name: string) =>
  name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';

const generateColor = () => {
  const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  loading: false,

  fetchCompanies: async () => {
    set({ loading: true });
    try {
      const res = await apiRequest(endpoints.companiesList(), {
        method: 'GET',
      });
      const data = await res.json();
      set({ companies: data, loading: false });
    } catch (err) {
      console.error('Failed to fetch companies', err);
      set({ loading: false });
    }
  },

  createCompany: async (companyData: Partial<Company>) => {
    get();

    const payload = {
      ...companyData,
      avatar: generateInitials(companyData.name || ''),
      color: generateColor(),
      createdAt: new Date().toISOString().split('T')[0],
    };


    set({ loading: true });
    try {
      const res = await apiRequest(endpoints.companyCreate(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      data.color = payload.color;
      data.avatar = payload.avatar;
      data.createdAt = payload.createdAt;
      set(state => ({ companies: [...state.companies, data], loading: false }));

    } catch (err) {
      console.error('Failed to create company', err);
      set({ loading: false });
      throw err;
    }
  },

  updateCompany: async (companyData: Partial<Company>) => {
    if (!companyData.id) {
      console.error("Cannot update company: Missing ID");
      return;
    }

    set({ loading: true });
    try {
      const res = await apiRequest(
        endpoints.companyUpdate(undefined, companyData.id.toString()),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(companyData)
        }
      );

      if (!res.ok) throw new Error('Failed to update company on server');

      const data = await res.json();

      set(state => ({
        companies: state.companies.map(c => c.id === data.id ? data : c),
        loading: false
      }));
    } catch (err) {
      console.error('Failed to update company', err);
      set({ loading: false });
      throw err; // Re-throw so the UI 'catch' block can see it
    }
  },

  updateCompanyVisuals: () => {
    const { companies } = get();

    const generateInitials = (name: string) =>
      name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const generateColor = () => {
      const colors = [
        'bg-blue-500',
        'bg-cyan-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-green-500',
        'bg-orange-500',
        'bg-red-500',
        'bg-indigo-500'
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const formatDate = (createdAt: string) => {
      const date = new Date(createdAt);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    const updated = companies.map(c => ({
      ...c,
      avatar: c.avatar || generateInitials(c.name),
      color: c.color || generateColor(),
      createdAt: formatDate(c.createdAt)
    }));

    set({ companies: updated });
  }
}));
