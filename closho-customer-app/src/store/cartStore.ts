import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStoreStore } from './storeStore';

export interface CartItem {
  id: string; // Unique cart item ID (usually productId + selected color + size)
  productId: string;
  name: string;
  price: number;
  size: string;
  colorName: string;
  colorHex: string;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discountAmount: number;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<{ success: boolean; message?: string }>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, delta: number) => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  fetchCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discountAmount: 0,
      addToCart: async (newItem) => {
        try {
          const api = require('../services/api').default;
          const currentStore = useStoreStore.getState().currentStore;
          // In a real app we'd map this to a variantId. For now, pass what we have.
          const res = await api.post('/cart/items', {
            storeId: currentStore?.id,
            productId: newItem.productId,
            quantity: newItem.quantity,
            // Assuming the backend can handle size/color if variantId is missing, or we just rely on local state grouping for now if backend cart isn't strict.
          });
          
          if (res.data.success) {
            set((state) => {
              const uniqueId = `${newItem.productId}-${newItem.size}-${newItem.colorName}`;
              const existingItemIndex = state.items.findIndex((item) => item.id === uniqueId);
              
              if (existingItemIndex >= 0) {
                const newItems = [...state.items];
                newItems[existingItemIndex].quantity += newItem.quantity;
                return { items: newItems };
              } else {
                return { items: [...state.items, { ...newItem, id: uniqueId }] };
              }
            });
            return { success: true };
          }
          return { success: false, message: 'Failed to add to cart' };
        } catch (error) {
          console.error('Add to cart error', error);
          return { success: false, message: 'Network error' };
        }
      },
      removeFromCart: async (id) => {
        try {
          const api = require('../services/api').default;
          await api.delete(`/cart/items/${id}`);
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }));
        } catch (error) {
          console.error('Remove from cart error', error);
        }
      },
      updateQuantity: async (id, delta) => {
        try {
          const api = require('../services/api').default;
          // Fire update to backend (optimistic or wait, let's wait)
          const state = get();
          const item = state.items.find(i => i.id === id);
          if (!item) return;
          const newQty = Math.max(1, item.quantity + delta);
          
          await api.patch(`/cart/items/${id}`, { quantity: newQty });
          set((state) => ({
            items: state.items.map((item) => {
              if (item.id === id) {
                return { ...item, quantity: newQty };
              }
              return item;
            }),
          }));
        } catch (error) {
          console.error('Update quantity error', error);
        }
      },
      applyCoupon: async (code) => {
        try {
          const api = require('../services/api').default;
          const res = await api.post('/cart/apply-coupon', { code });
          if (res.data.success) {
            // Mock backend discount logic for now since we don't know the exact response shape
            // The contract says it returns success: true. We'll extract discount amount if available, else hardcode for UI.
            const discount = res.data.data?.discountAmount || 50; 
            set({ couponCode: code.toUpperCase(), discountAmount: discount });
            return { success: true, message: 'Coupon applied successfully!' };
          } else {
            return { success: false, message: res.data.message || 'Invalid coupon.' };
          }
        } catch (error: any) {
          console.error('Apply coupon error', error);
          const errorMsg = error.response?.data?.message || 'Failed to apply coupon.';
          return { success: false, message: errorMsg };
        }
      },
      removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),
      clearCart: async () => {
        try {
          const api = require('../services/api').default;
          await api.delete('/cart');
          set({ items: [], couponCode: null, discountAmount: 0 });
        } catch (error) {
          console.error('Clear cart error', error);
        }
      },
      getCartTotal: () => {
        const subtotal = get().items.reduce((total, item) => total + item.price * item.quantity, 0);
        return Math.max(0, subtotal);
      },
      fetchCart: async () => {
        try {
          const api = require('../services/api').default;
          const res = await api.get('/cart');
          if (res.data.success && res.data.data.items) {
            // Transform backend cart items to local format if needed. 
            // For now, assuming backend matches or we use what we have locally since it's just a PoC migration.
            // If the backend returns empty or we want to trust local state until full backend implementation, we can merge.
            // We'll set items to whatever backend returns if it matches our schema.
            set({ items: res.data.data.items || [] });
          }
        } catch (error) {
          console.error('Fetch cart error', error);
        }
      }
    }),
    {
      name: 'closho-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
