import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types/auth.types';

interface AuthStore extends AuthState {
  setAuth: (user: User, token: string) => Promise<void>;
  login: (emailOrPhone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  fetchProfile: () => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false, 
      error: null,

      setAuth: async (user: User, token: string) => {
        try {
          set({ user, token, isAuthenticated: true, error: null });
        } catch (error) {
          console.warn('Error saving auth state', error);
          set({ error: 'Failed to save auth state' });
        }
      },

      login: async (emailOrPhone: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Import here to avoid circular dependencies if needed, or import at top
          const api = require('../services/api').default;
          const response = await api.post('/auth/login', { email: emailOrPhone, password });
          if (response.data.success) {
            const { user, accessToken } = response.data.data;
            set({ user, token: accessToken, isAuthenticated: true, error: null, isLoading: false });
            return { success: true };
          } else {
            set({ error: response.data.message || 'Login failed', isLoading: false });
            return { success: false, error: response.data.message };
          }
        } catch (error: any) {
          console.warn('Login error', error.message || error);
          const errorMsg = error.response?.data?.message || error.message || 'Network error. Please try again.';
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
          console.warn('Register error', error.message || error);
          const errorMsg = error.response?.data?.message || error.message || 'Network error. Please try again.';
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      updateUser: async (userData: Partial<User>) => {
        try {
          const api = require('../services/api').default;
          const res = await api.post('/user/profile', userData);
          if (res.data.success) {
            const currentUser = get().user;
            if (currentUser) {
              set({ user: { ...currentUser, ...userData } });
            }
            return { success: true };
          }
          return { success: false, message: res.data.message };
        } catch (error: any) {
          console.warn('Update profile error', error.message || error);
          return { success: false, message: error.response?.data?.message || error.message };
        }
      },

      fetchProfile: async () => {
        try {
          const api = require('../services/api').default;
          const response = await api.get('/auth/me');
          if (response.data.success && response.data.data) {
            set({ user: response.data.data });
          }
        } catch (error: any) {
          console.warn('Fetch profile error', error.message || error);
        }
      },

      logout: async () => {
        try {
          const api = require('../services/api').default;
          await api.post('/auth/logout').catch(() => {}); // Ignore logout errors
          set({ user: null, token: null, isAuthenticated: false, error: null });
        } catch (error: any) {
          console.warn('Error during logout', error.message || error);
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
