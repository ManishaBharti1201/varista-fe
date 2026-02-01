import { create } from 'zustand';
import { endpoints } from '../config/urls';

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
}

interface CompanyState {
  companies: Company[];
  loading: boolean;
  fetchCompanies: () => Promise<void>;
  createCompany: (company: Partial<Company>) => Promise<void>;
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
      const res = await fetch(endpoints.companies());
      const data = await res.json();
      set({ companies: data, loading: false });
    } catch (err) {
      console.error('Failed to fetch companies', err);
      set({ loading: false });
    }
  },

  createCompany: async (companyData: Partial<Company>) => {
    const { companies } = get();

    // Logic for ID generation moved here
    const maxId = companies.reduce((max, c) => {
      const num = parseInt(c.id.replace('EMP', '')) || 0;
      return num > max ? num : max;
    }, 0);
    const newId = `EMP${String(maxId + 1).padStart(3, '0')}`;

    const payload = {
      ...companyData,
      avatar: generateInitials(companyData.name || ''),
      color: generateColor(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    set({ loading: true });
    try {
      const res = await fetch(endpoints.companyCreate(), {
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
