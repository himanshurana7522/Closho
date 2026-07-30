import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types/auth.types';

interface AuthStore extends AuthState {
  setAuth: (user: User, token: string) => Promise<void>;
  login: (emailOrPhone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

      login: async (emailOrPhone: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Import here to avoid circular dependencies if needed, or import at top
          const api = require('../services/api').default;
          const response = await api.post('/auth/login', { emailOrPhone, password });
          if (response.data.success) {
            const { user, accessToken } = response.data.data;
            set({ user, token: accessToken, isAuthenticated: true, error: null, isLoading: false });
            return { success: true };
          } else {
            set({ error: response.data.message || 'Login failed', isLoading: false });
            return { success: false, error: response.data.message };
          }
        } catch (error: any) {
          console.error('Login error', error);
          const errorMsg = error.response?.data?.message || 'Network error. Please try again.';
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      register: async (fullName: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const api = require('../services/api').default;
          const response = await api.post('/auth/register', { fullName, email, password });
          if (response.data.success) {
            set({ isLoading: false });
            return { success: true };
          } else {
            set({ error: response.data.message || 'Registration failed', isLoading: false });
            return { success: false, error: response.data.message };
          }
        } catch (error: any) {
          console.error('Register error', error);
          const errorMsg = error.response?.data?.message || 'Network error. Please try again.';
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      updateUser: async (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      logout: async () => {
        try {
          const api = require('../services/api').default;
          await api.post('/auth/logout').catch(() => {}); // Ignore logout errors
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
