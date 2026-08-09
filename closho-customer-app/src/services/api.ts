import axios from 'axios';
import { env } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: 'https://api-closho.onrender.com', // Using hardcoded URL per requirements
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from storage', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      // Add a custom message for cold start timeout
      error.message = 'The server is taking longer than usual to respond. It might be waking up, please try again.';
    } else if (error.response?.status === 401) {
      // Don't trigger logout loop if the 401 is from login/register/logout itself
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register') && !url.includes('/auth/logout')) {
        console.warn('API 401 Unauthorized on:', url, '-> Forcing logout');
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
