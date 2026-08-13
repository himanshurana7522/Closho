import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  size: string;
  colorName: string;
  quantity: number;
  image: string;
}

export interface OrderTimeline {
  status: string;
  date: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber?: string;
  date: string;
  status: string;
  total: number;
  trackingNumber?: string;
  itemsCount?: number;
  previewImage?: string;
  items: OrderItem[];
  timeline: OrderTimeline[];
}

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  createOrder: (payload: { storeId: string; addressId: string; paymentMethod: string; couponCode?: string | null }) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      error: null,
      fetchOrders: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/orders?status=all&page=1&limit=50');
          if (response.data.success) {
            const mappedOrders = response.data.data.orders.map((o: any) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              status: o.status,
              total: Number(o.amount) || Number(o.totalAmount),
              itemsCount: o.items?.length || 0,
              // Use first item's thumbnail or a placeholder
              previewImage: o.items?.[0]?.product?.thumbnail || 'https://via.placeholder.com/400x500?text=No+Image',
              items: o.items?.map((i: any) => ({
                id: i.id,
                name: i.product?.name || 'Unknown Product',
                price: Number(i.price),
                size: i.size || 'M',
                colorName: i.color || 'Default',
                quantity: i.quantity,
                image: i.product?.thumbnail || 'https://via.placeholder.com/400x500?text=No+Image',
              })) || [],
              timeline: o.timeline || [
                { status: 'Order Placed', date: new Date(o.createdAt).toLocaleString(), completed: true },
                { status: 'Processing', date: 'Pending', completed: false },
                { status: 'Shipped', date: 'Pending', completed: false },
                { status: 'Delivered', date: 'Pending', completed: false },
              ]
            }));
            set({ orders: mappedOrders, isLoading: false });
          } else {
            set({ error: response.data.message || 'Failed to fetch orders', isLoading: false });
          }
        } catch (error: any) {
          console.warn('Error fetching orders:', error.message || error);
          set({ error: error.message || 'Failed to connect to server', isLoading: false });
        }
      },
      createOrder: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/orders', payload);
          if (response.data.success) {
            // After creating, re-fetch orders
            await get().fetchOrders();
            set({ isLoading: false });
            return { success: true, data: response.data.data };
          } else {
            set({ isLoading: false, error: response.data.message });
            return { success: false, error: response.data.message };
          }
        } catch (error: any) {
          console.error('Error creating order:', error);
          const errorMsg = error.response?.data?.message || error.message || 'Failed to connect to server';
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      }
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
