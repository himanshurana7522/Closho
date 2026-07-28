import { create } from 'zustand';
import { Store } from '../types/store.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StoreState {
  currentStore: Store | null;
  setCurrentStore: (store: Store) => Promise<void>;
  loadSavedStore: () => Promise<void>;
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
}));
