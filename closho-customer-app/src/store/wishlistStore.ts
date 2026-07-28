import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../components/product/ProductCard';

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (product) => {
        const { items } = get();
        const exists = items.some(item => item.id === product.id);
        if (exists) {
          set({ items: items.filter(item => item.id !== product.id) });
        } else {
          // Store product without the isWishlisted boolean property if we want, but it doesn't hurt.
          set({ items: [...items, product] });
        }
      },
      removeFromWishlist: (id) => {
        set({ items: get().items.filter(item => item.id !== id) });
      },
      isInWishlist: (id) => {
        return get().items.some(item => item.id === id);
      }
    }),
    {
      name: 'closho-wishlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
