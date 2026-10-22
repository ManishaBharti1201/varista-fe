import { create } from 'zustand';
import { endpoints } from '../config/urls';
import { saveAuthFromResponse } from '../utils/auth';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiRequest } from '../utils/apiClient';

// 1. User interface
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  color?: string;
  joiningDate?: string;
  password: string;
  company: {
    id: string,
    name: string
  }
}

interface UserState {
  user: User | null;
  loading: boolean;
  login: (credentials: { username: string; password: string; clientId: string }) => Promise<any>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateUserVisuals: () => void;
  logout: () => void; // Added logout to interface
}

// Helper functions
const generateColor = () => {
  const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,

      // Resets the state and clears the persisted storage
      logout: () => {
        set({ user: null, loading: false });
      },

      updateUser: async (userData: Partial<User>) => {
        set({ loading: true });
        try {
          const res = await apiRequest(endpoints.updateUser(), {
            method: 'PUT',
            body: JSON.stringify(userData)
          });
          if (!res.ok) throw new Error('Update failed');

          const updatedUser = await res.json();
          set((state) => ({
            user: state.user ? { ...state.user, ...updatedUser } : updatedUser,
            loading: false
          }));
          
          // Refresh visuals in case name/color changed
          get().updateUserVisuals();
        } catch (err) {
          console.error('Failed to update user', err);
          set({ loading: false });
          throw err;
        }
      },

      login: async (credentials: { username: string; password: string; clientId: string }) => {
        set({ loading: true });
        try {
          const res = await fetch(endpoints.login(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });

          const data = await res.json();

          if (!res.ok) {
            console.error('Login failed at store', data);
            throw new Error(data.message || 'Login failed');
          }

          // 1. Store auth tokens in localStorage via your utility
          saveAuthFromResponse(data.auth, data.user.firstName);

          // 2. Update Zustand state
          set({
            user: data.user,
            loading: false
          });

          // 3. Apply visual formatting (avatar, colors, dates)
          get().updateUserVisuals();

          return data;
        } catch (err: any) {
          set({ loading: false, user: null });
          throw err;
        }
      },

      updateUserVisuals: () => {
        const { user } = get();
        if (!user) return;

        const dummyImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
        const avatar = user.avatar || dummyImageBase64;
        const color = user.color || generateColor();

        let joiningDate = user.joiningDate;
        if (joiningDate) {
          joiningDate = new Date(joiningDate).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }

        set({ user: { ...user, avatar, color, joiningDate } });
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);