import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types/auth.types';

interface AuthStore extends AuthState {
  setAuth: (user: User, token: string) => Promise<void>;
  login: (emailOrPhone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (idToken: string) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  fetchProfile: () => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  sendPasswordResetOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyPasswordResetOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string; resetToken?: string }>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  fetchSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  logoutAll: () => Promise<{ success: boolean; error?: string }>;
}

const safeStorage = {
  getItem: async (name: string) => {
    try {
      console.log(`[App Startup] Reading storage key: ${name}`);
      return await AsyncStorage.getItem(name);
    } catch (err) {
      console.error('[App Startup] FATAL ERROR reading from storage:', err);
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (err) {
      console.error('[App Startup] FATAL ERROR writing to storage:', err);
    }
  },
  removeItem: async (name: string) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (err) {
      console.error('[App Startup] FATAL ERROR removing from storage:', err);
    }
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      sessionId: null,
      sessions: [],
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
            const { user, accessToken, refreshToken, sessionId } = response.data.data;
            set({ user, token: accessToken, refreshToken, sessionId, isAuthenticated: true, error: null, isLoading: false });
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

      googleLogin: async (idToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const api = require('../services/api').default;
          // Typical endpoint structure: POST /auth/google with idToken
          const response = await api.post('/auth/google', { idToken: idToken });
          if (response.data.success) {
            const { user, accessToken, refreshToken, sessionId } = response.data.data;
            set({ user, token: accessToken, refreshToken, sessionId, isAuthenticated: true, error: null, isLoading: false });
            return { success: true };
          } else {
            set({ error: response.data.message || 'Google Login failed', isLoading: false });
            return { success: false, error: response.data.message };
          }
        } catch (error: any) {
          console.warn('Google Login error', error.message || error);
          const errorMsg = error.response?.data?.message || error.message || 'Network error. Please try again.';
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      sendOtp: async (phone: string) => {
        set({ isLoading: true, error: null });
        try {
          const api = require('../services/api').default;
          const response = await api.post('/auth/send-verification-otp', { phone });
          if (response.data.success) {
            set({ isLoading: false });
            return { success: true };
          } else {
            set({ error: response.data.message || 'Failed to send OTP', isLoading: false });
            return { success: false, error: response.data.message };
          }
        } catch (error: any) {
          console.warn('Send OTP error', error.message || error);
          const errorMsg = error.response?.data?.message || error.message || 'Failed to send OTP';
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      verifyOtp: async (phone: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const api = require('../services/api').default;
          const response = await api.post('/auth/verify-otp', { phone, otp });
          if (response.data.success) {
            const { user, accessToken, refreshToken, sessionId } = response.data.data;
            set({ user, token: accessToken, refreshToken, sessionId, isAuthenticated: true, error: null, isLoading: false });
            return { success: true };
          } else {
            set({ error: response.data.message || 'Invalid OTP', isLoading: false });
            return { success: false, error: response.data.message };
          }
        } catch (error: any) {
          console.warn('Verify OTP error', error.message || error);
          const errorMsg = error.response?.data?.message || error.message || 'Verification failed';
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      sendPasswordResetOtp: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const api = require('../services/api').default;
          const response = await api.post('/auth/forgot-password', { email });
          if (response.data.success) {
            set({ isLoading: false });
            return { success: true };
          } else {
            set({ error: response.data.message || 'Failed to send OTP', isLoading: false });
            return { success: false, error: response.data.message };
          }
        } catch (error: any) {
          console.warn('Send Password Reset OTP error', error.message || error);
          const errorMsg = error.response?.data?.message || error.message || 'Failed to send OTP';
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      verifyPasswordResetOtp: async (email: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const api = require('../services/api').default;
          const response = await api.post('/auth/verify-otp', { email, otp, purpose: 'password_reset' });
          if (response.data.success) {
            set({ isLoading: false });
            return { success: true, resetToken: response.data.data.resetToken || response.data.data };
          } else {
            set({ error: response.data.message || 'Invalid OTP', isLoading: false });
            return { success: false, error: response.data.message };
          }
        } catch (error: any) {
          console.warn('Verify Password Reset OTP error', error.message || error);
          const errorMsg = error.response?.data?.message || error.message || 'Verification failed';
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      resetPassword: async (resetToken: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          const api = require('../services/api').default;
          const response = await api.post('/auth/reset-password', { resetToken, newPassword, confirmPassword: newPassword });
          if (response.data.success) {
            set({ isLoading: false });
            return { success: true };
          } else {
            set({ error: response.data.message || 'Failed to reset password', isLoading: false });
            return { success: false, error: response.data.message };
          }
        } catch (error: any) {
          console.warn('Reset password error', error.message || error);
          const errorMsg = error.response?.data?.message || error.message || 'Failed to reset password';
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
          set({ user: null, token: null, refreshToken: null, sessionId: null, sessions: [], isAuthenticated: false, error: null });
        } catch (error: any) {
          console.warn('Error during logout', error.message || error);
        }
      },

      fetchSessions: async () => {
        try {
          const api = require('../services/api').default;
          const response = await api.get('/auth/sessions');
          if (response.data.success && response.data.data) {
            set({ sessions: response.data.data });
          }
        } catch (error: any) {
          console.warn('Fetch sessions error', error.message || error);
        }
      },

      revokeSession: async (sessionIdToRevoke: string) => {
        try {
          const api = require('../services/api').default;
          const response = await api.delete(`/auth/sessions/${sessionIdToRevoke}`);
          if (response.data.success) {
            const currentSessions = get().sessions;
            set({ sessions: currentSessions.filter(s => s.id !== sessionIdToRevoke) });
            return { success: true };
          }
          return { success: false, error: response.data.message };
        } catch (error: any) {
          console.warn('Revoke session error', error.message || error);
          return { success: false, error: error.response?.data?.message || error.message };
        }
      },

      logoutAll: async () => {
        try {
          const api = require('../services/api').default;
          const response = await api.post('/auth/logout-all');
          if (response.data.success) {
            set({ user: null, token: null, refreshToken: null, sessionId: null, sessions: [], isAuthenticated: false, error: null });
            return { success: true };
          }
          return { success: false, error: response.data.message };
        } catch (error: any) {
          console.warn('Logout all error', error.message || error);
          return { success: false, error: error.response?.data?.message || error.message };
        }
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => safeStorage),
      onRehydrateStorage: () => (state) => {
        console.log('[App Startup] Zustand hydration complete. Auth state:', state?.isAuthenticated);
      },
    }
  )
);
