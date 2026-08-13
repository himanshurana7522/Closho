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
  variantId?: string;
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
          
          const payload = {
            storeId: currentStore?.id,
            productId: newItem.productId,
            variantId: newItem.variantId,
            quantity: newItem.quantity,
          };
          
          console.log('=== ADD TO CART REQUEST ===');
          console.log('URL: POST /cart/items');
          console.log('Headers (Authorization exists?):', !!api.defaults.headers.common['Authorization'] || 'Will be set by interceptor');
          console.log('Payload:', JSON.stringify(payload, null, 2));

          const res = await api.post('/cart/items', payload);
          
          if (res.data.success) {
            await get().fetchCart();
            return { success: true };
          }
          return { success: false, message: res.data.message || 'Failed to add to cart' };
        } catch (error: any) {
          console.warn('=== ADD TO CART ERROR ===');
          console.warn('Error Response Data:', JSON.stringify(error.response?.data, null, 2));
          console.warn('Error Message:', error.message);
          
          const errorMsg = error.response?.data?.message || error.message || 'Network error';
          return { success: false, message: errorMsg };
        }
      },
      removeFromCart: async (id) => {
        try {
          // Optimistic update for UI animations
          set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
          const api = require('../services/api').default;
          await api.delete(`/cart/items/${id}`);
        } catch (error) {
          console.warn('Remove from cart error', error);
          // Revert on error
          await get().fetchCart();
        }
      },
      updateQuantity: async (id, delta) => {
        try {
          const state = get();
          const item = state.items.find(i => i.id === id);
          if (!item) return;
          const newQty = Math.max(1, item.quantity + delta);
          
          // Optimistic update
          set((state) => ({
            items: state.items.map((item) => {
              if (item.id === id) {
                return { ...item, quantity: newQty };
              }
              return item;
            }),
          }));

          const api = require('../services/api').default;
          await api.patch(`/cart/items/${id}`, { quantity: newQty });
        } catch (error) {
          console.warn('Update quantity error', error);
          // Revert on error
          await get().fetchCart();
        }
      },
      applyCoupon: async (code) => {
        try {
          const api = require('../services/api').default;
          const storeId = require('./storeStore').useStoreStore.getState().currentStore?.id;
          const payload = storeId ? { code, storeId } : { code };
          const res = await api.post('/cart/apply-coupon', payload);
          if (res.data.success) {
            const discount = res.data.data?.discountAmount || 0; 
            set({ couponCode: code.toUpperCase(), discountAmount: discount });
            return { success: true, message: 'Coupon applied successfully!' };
          } else {
            return { success: false, message: res.data.message || 'Invalid coupon.' };
          }
        } catch (error: any) {
          console.warn('Apply coupon error', error?.message || error);
          const errorMsg = error.response?.data?.message || 'Failed to apply coupon.';
          return { success: false, message: errorMsg };
        }
      },
      removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),
      clearCart: async () => {
        try {
          // Optimistic update
          set({ items: [], couponCode: null, discountAmount: 0 });
          const api = require('../services/api').default;
          const storeId = require('./storeStore').useStoreStore.getState().currentStore?.id;
          const url = storeId ? `/cart?storeId=${storeId}` : '/cart';
          await api.delete(url);
        } catch (error) {
          console.warn('Clear cart error', error);
          await get().fetchCart();
        }
      },
      getCartTotal: () => {
        const subtotal = get().items.reduce((total, item) => total + item.price * item.quantity, 0);
        return Math.max(0, subtotal);
      },
      fetchCart: async () => {
        try {
          const api = require('../services/api').default;
          const storeId = require('./storeStore').useStoreStore.getState().currentStore?.id;
          const url = storeId ? `/cart?storeId=${storeId}` : '/cart';
          const res = await api.get(url);
          if (res.data.success && res.data.data.items) {
            const mappedItems = res.data.data.items.map((item: any) => ({
              id: item.id,
              productId: item.product?.id || '',
              name: item.product?.name || 'Unknown',
              price: Number(item.product?.price) || 0,
              size: item.variant?.size || 'M',
              colorName: item.variant?.color || 'Default',
              colorHex: item.variant?.colorHex || '#000000',
              quantity: item.quantity,
              image: item.product?.thumbnail || item.product?.images?.[0] || 'https://via.placeholder.com/150',
            }));
            set({ items: mappedItems });
          }
        } catch (error) {
          console.warn('Fetch cart error', error);
        }
      }
    }),
    {
      name: 'closho-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
