import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discountAmount: 0,
      addToCart: (newItem) => {
        set((state) => {
          // Generate a unique ID based on product, size, and color to group identical variants
          const uniqueId = `${newItem.productId}-${newItem.size}-${newItem.colorName}`;
          
          const existingItemIndex = state.items.findIndex((item) => item.id === uniqueId);
          
          if (existingItemIndex >= 0) {
            // If identical variant exists, increase quantity
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += newItem.quantity;
            return { items: newItems };
          } else {
            // Otherwise, add as new item
            return { items: [...state.items, { ...newItem, id: uniqueId }] };
          }
        });
      },
      removeFromCart: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      updateQuantity: (id, delta) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id) {
              const newQty = Math.max(1, item.quantity + delta);
              return { ...item, quantity: newQty };
            }
            return item;
          }),
        }));
      },
      applyCoupon: (code) => {
        const upperCode = code.toUpperCase();
        if (upperCode === 'WELCOME50') {
          set({ couponCode: upperCode, discountAmount: 50 });
          return { success: true, message: 'Coupon applied! ₹50 off.' };
        } else if (upperCode === 'SAVE100') {
          set({ couponCode: upperCode, discountAmount: 100 });
          return { success: true, message: 'Coupon applied! ₹100 off.' };
        }
        return { success: false, message: 'Invalid or expired coupon code.' };
      },
      removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),
      clearCart: () => set({ items: [], couponCode: null, discountAmount: 0 }),
      getCartTotal: () => {
        const subtotal = get().items.reduce((total, item) => total + item.price * item.quantity, 0);
        return Math.max(0, subtotal);
      },
    }),
    {
      name: 'closho-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
