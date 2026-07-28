import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types/auth.types';

interface AuthStore extends AuthState {
  setAuth: (user: User, token: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false, 
      error: null,

      setAuth: async (user: User, token: string) => {
        try {
          set({ user, token, isAuthenticated: true, error: null });
        } catch (error) {
          console.error('Error saving auth state', error);
          set({ error: 'Failed to save auth state' });
        }
      },

      updateUser: async (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      logout: async () => {
        try {
          set({ user: null, token: null, isAuthenticated: false, error: null });
        } catch (error) {
          console.error('Error during logout', error);
        }
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
