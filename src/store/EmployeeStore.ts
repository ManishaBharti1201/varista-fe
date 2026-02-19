import { create } from 'zustand';
import { endpoints } from '../config/urls';
import { get } from 'https';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  adhaar: string;
  avatar: string;
  role: string;
  joiningDate: string;
  email: string;
  phone: string;
  color: string;
}

interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  fetchEmployees: () => Promise<void>;
  createEmployee: (employee: Partial<Employee>) => Promise<void>;
  updateEmployeeVisuals: () => void;
  deleteEmployee: (id: string) => Promise<void>;
}

const generateInitials = (firstname: string, lastname: string) =>
  firstname?.[0].toUpperCase() + lastname?.[0].toUpperCase() || '??';

const generateColor = () => {
  const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  loading: false,

  fetchEmployees: async () => {
    set({ loading: true });
    try {
      const res = await fetch(endpoints.employeesList());
      const data = await res.json();
      set({ employees: data, loading: false });
    } catch (err) {
      console.error('Failed to fetch employees', err);
      set({ loading: false });
    }
  },

  createEmployee: async (employeeData: Partial<Employee>) => {
    const { employees } = get();

    const payload = {
      ...employeeData,
      avatar: generateInitials(employeeData.firstName || '', employeeData.lastName || ''),
      color: generateColor(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    set({ loading: true });
    try {
      const res = await fetch(endpoints.employeeCreate(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to create employee');
      const data = await res.json();
      data.color = payload.color;
      data.avatar = payload.avatar;
      data.joiningDate = payload.createdAt;
      set(state => ({ employees: [...state.employees, data], loading: false }));
      
    } catch (err) {
      console.error('Failed to create employee', err);
      set({ loading: false });
      throw err;
    }
  },

  updateEmployeeVisuals: () => {
    const { employees } = get();

    const generateInitials = (firstname: string, lastname: string) =>
      firstname?.[0].toUpperCase() + lastname?.[0].toUpperCase() || '??';

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
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    const updated = employees.map(c => ({
      ...c,
      avatar: c.avatar || generateInitials(c.firstName, c.lastName),
      color: c.color || generateColor(),
      joiningDate: formatDate(c.joiningDate)
    }));

    set({ employees: updated });
  },

  deleteEmployee: async (id: string) => {
    const { employees } = get();
    set({ loading: true });
    try {
      await fetch(endpoints.employeeDelete(undefined, id), {
        method: 'DELETE',
      });
      const updatedEmployees = employees.filter(e => e.id !== id);
      set({ employees: updatedEmployees, loading: false });
    } catch (err) {
      console.error('Failed to delete employee', err);
      set({ loading: false });
      throw err;
    }
  },  
}));
