import { create } from 'zustand';
import { endpoints } from '../config/urls';
import { apiRequest } from '../utils/apiClient';

export interface Employee {
  id: string;
  dob: string;
  esic: string;
  eip: string;
  firstName: string;
  lastName: string;
  adhaar: string;
  avatar: string;
  role: string;
  joiningDate: string;
  email: string;
  phone: string;
  color: string;
  timesheetPresent: boolean;
  fatherName: string;
  gender: string;
  uan: string;
  category: string;
  weeklyOff: string[];
}

interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  fetchEmployees: () => Promise<void>;
  upsertEmployee: (employee: Partial<Employee>) => Promise<void>;
  updateEmployeeVisuals: () => void;
  deleteEmployee: (id: string) => Promise<void>;
}

// Helper Utilities (Outside store to keep it clean)
const getInitials = (f: string = '', l: string = '') => 
  (f?.[0] || '') + (l?.[0] || '') || '??';

const getRandomColor = () => {
  const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-indigo-500', 'bg-orange-500'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  loading: false,

  fetchEmployees: async () => {
    set({ loading: true });
    try {
      const res = await apiRequest(endpoints.employeesList(), { method: 'GET' });
      const data = await res.json();
      
      set({ employees: data, loading: false });
      // Apply visuals immediately after fetch
      get().updateEmployeeVisuals();
    } catch (err) {
      console.error('Fetch error:', err);
      set({ loading: false });
    }
  },

  upsertEmployee: async (employeeData: Partial<Employee>) => {
    const isUpdate = !!employeeData.id;
    
    // 1. Prepare visual properties locally
    const visualProps = {
      avatar: getInitials(employeeData.firstName, employeeData.lastName),
      color: employeeData.color || getRandomColor(),
    };

    const payload = { ...employeeData, ...visualProps };

    set({ loading: true });
    try {
      const res = await apiRequest(endpoints.employeeUpsert(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const serverData = await res.json();

      // 2. Merge server data with our generated visuals & formatted date
      const finalEmployee = {
        ...serverData,
        ...visualProps,
        joiningDate: formatDate(serverData.joiningDate || payload.joiningDate)
      };

      set(state => ({
        employees: isUpdate 
          ? state.employees.map(e => e.id === finalEmployee.id ? finalEmployee : e)
          : [...state.employees, finalEmployee],
        loading: false
      }));
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  updateEmployeeVisuals: () => {
    const { employees } = get();
    
    const updated = employees.map(emp => ({
      ...emp,
      avatar: emp.avatar || getInitials(emp.firstName, emp.lastName),
      color: emp.color || getRandomColor(),
      // Check if date is already formatted (contains letters like 'Mar') 
      // otherwise format it.
      joiningDate: /[a-zA-Z]/.test(emp.joiningDate) 
        ? emp.joiningDate 
        : formatDate(emp.joiningDate),
      timesheetPresent: emp.timesheetPresent || false
    }));

    set({ employees: updated });
  },

  deleteEmployee: async (id: string) => {
    set({ loading: true });
    try {
      await apiRequest(endpoints.employeeDelete(undefined, id), { method: 'DELETE' });
      set(state => ({
        employees: state.employees.filter(e => e.id !== id),
        loading: false
      }));
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },
}));