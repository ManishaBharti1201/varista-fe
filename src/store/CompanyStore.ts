import { create } from 'zustand';

export interface Company {
  id: string;
  name: string;
  industry: string;
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
  updateCompanyVisuals: () => void;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  loading: false,

  fetchCompanies: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/company/all');
      const data = await res.json();
      set({ companies: data, loading: false });
    } catch (err) {
      console.error('Failed to fetch companies', err);
      set({ loading: false });
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
