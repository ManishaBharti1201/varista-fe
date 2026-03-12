import { create } from 'zustand';
import { endpoints } from '../config/urls';
import { saveAuthFromResponse } from '../utils/auth';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiRequest } from '../utils/apiClient';

// 1. Updated User interface to include joiningDate
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
  login: (credentials: any) => Promise<any>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateUserVisuals: () => void;
}

// Helper functions moved outside for cleanliness
const generateInitials = (firstName: string = '', lastName: string = '') =>
  `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '??';

const generateColor = () => {
  const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,

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
            user: { ...state.user, ...updatedUser },
            loading: false
          }));
        } catch (err) {
          console.error('Failed to update user', err);
          set({ loading: false });
          throw err;
        }
      },

      login: async (credentials: Partial<User>) => {
        set({ loading: true });
        try {
          const res = await fetch(endpoints.login(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });

          const data = await res.json();

          if (!res.ok) {
            // Throwing allows the component's catch block to handle the error message
            console.error('Login failed at store', data);
            throw new Error(data.message || 'Login failed');
          }

          // Store auth bits (Tokens, etc)
          saveAuthFromResponse(data.auth, data.user.firstName);

          // Update Zustand state
          set({
            user: data.user,
            loading: false
          });

          get().updateUserVisuals();

          // 2. RETURN the data so the LoginRegister page can access it
          return data;

        } catch (err: any) {
          set({ loading: false, user: null });
          // Re-throw so the UI knows an error occurred
          throw err;
        }
      },

      updateUserVisuals: () => {
        const { user } = get();
        if (!user) return;

        const dummyImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
        const avatar = user.avatar || dummyImageBase64;
        const color = user.color || generateColor();

        // Optional: Format joiningDate if it exists
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
      name: 'user-storage', // unique key for localStorage
      storage: createJSONStorage(() => localStorage), // defines where to save it
    }
  )
);
