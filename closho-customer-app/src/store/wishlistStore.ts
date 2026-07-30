import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../components/product/ProductCard';

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  fetchWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: async (product) => {
        const { items } = get();
        const exists = items.some(item => item.id === product.id);
        const api = require('../services/api').default;
        try {
          if (exists) {
            await api.delete(`/wishlist/${product.id}`);
            set({ items: items.filter(item => item.id !== product.id) });
          } else {
            await api.post('/wishlist', { productId: product.id });
            set({ items: [...items, product] });
          }
        } catch (error) {
          console.error('Toggle wishlist error', error);
        }
      },
      removeFromWishlist: async (id) => {
        try {
          const api = require('../services/api').default;
          await api.delete(`/wishlist/${id}`);
          set({ items: get().items.filter(item => item.id !== id) });
        } catch (error) {
          console.error('Remove from wishlist error', error);
        }
      },
      isInWishlist: (id) => {
        return get().items.some(item => item.id === id);
      },
      fetchWishlist: async () => {
        try {
          const api = require('../services/api').default;
          const res = await api.get('/wishlist');
          if (res.data.success && res.data.data.items) {
            set({ items: res.data.data.items });
          }
        } catch (error) {
          console.error('Fetch wishlist error', error);
        }
      }
    }),
    {
      name: 'closho-wishlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
