import { create } from 'zustand';
import { Store } from '../types/store.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StoreState {
  currentStore: Store | null;
  setCurrentStore: (store: Store) => Promise<void>;
  loadSavedStore: () => Promise<void>;
  fetchNearestStore: (lat: number, lng: number) => Promise<void>;
}

export const useStoreStore = create<StoreState>((set) => ({
  currentStore: null,
  
  setCurrentStore: async (store: Store) => {
    try {
      await AsyncStorage.setItem('currentStore', JSON.stringify(store));
      set({ currentStore: store });
    } catch (error) {
      console.error('Error saving store', error);
    }
  },

  loadSavedStore: async () => {
    try {
      const saved = await AsyncStorage.getItem('currentStore');
      if (saved) {
        set({ currentStore: JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Error loading saved store', error);
    }
  },

  fetchNearestStore: async (lat: number, lng: number) => {
    try {
      const api = require('../services/api').default;
      const response = await api.get(`/stores/nearest?lat=${lat}&lng=${lng}&radius=10`);
      const responseData = response.data.data;
      const storesArray = Array.isArray(responseData) ? responseData : responseData?.stores;
      
      if (response.data.success && storesArray && storesArray.length > 0) {
        const store = storesArray[0];
        await AsyncStorage.setItem('currentStore', JSON.stringify(store));
        set({ currentStore: store });
      } else {
        // If no store is found, don't crash, just log softly
        console.log('No nearby store found, falling back to all products.');
      }
    } catch (error) {
      // Silently catch the error to prevent red error toasts globally
      console.log('Nearest store fetch skipped due to network/server issue.');
    }
  },
}));
