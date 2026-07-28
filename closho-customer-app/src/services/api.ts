import axios from 'axios';
import { env } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: env.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
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
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., logout user, clear token)
      await AsyncStorage.removeItem('userToken');
      // Here you could also trigger a global event or Zustand store update to redirect to Login
    }
    return Promise.reject(error);
  }
);

export default api;
