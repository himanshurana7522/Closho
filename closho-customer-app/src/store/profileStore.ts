import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Address {
  id: string;
  type: string;
  address: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp: string;
  isDefault: boolean;
}

interface ProfileState {
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  addPaymentMethod: (payment: PaymentMethod) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      addresses: [
        { id: '1', type: 'Home', address: '123 Fashion Avenue, Suite 4B\nNew York, NY 10001', isDefault: true },
        { id: '2', type: 'Work', address: '99 Tech Park Road, Floor 12\nSan Francisco, CA 94105', isDefault: false },
      ],
      paymentMethods: [
        { id: '1', brand: 'Visa', last4: '4242', exp: '12/28', isDefault: true },
        { id: '2', brand: 'Mastercard', last4: '8811', exp: '08/26', isDefault: false },
      ],
      addAddress: (address) => {
        set((state) => {
          let newAddresses = [...state.addresses];
          if (address.isDefault || newAddresses.length === 0) {
            address.isDefault = true;
            newAddresses = newAddresses.map(a => ({ ...a, isDefault: false }));
          }
          return { addresses: [...newAddresses, address] };
        });
      },
      removeAddress: (id) => {
        set((state) => {
          let newAddresses = state.addresses.filter((a) => a.id !== id);
          if (newAddresses.length > 0 && !newAddresses.some(a => a.isDefault)) {
            newAddresses[0].isDefault = true;
          }
          return { addresses: newAddresses };
        });
      },
      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        }));
      },
      addPaymentMethod: (payment) => {
        set((state) => {
          let newPayments = [...state.paymentMethods];
          if (payment.isDefault || newPayments.length === 0) {
            payment.isDefault = true;
            newPayments = newPayments.map(p => ({ ...p, isDefault: false }));
          }
          return { paymentMethods: [...newPayments, payment] };
        });
      },
      removePaymentMethod: (id) => {
        set((state) => {
          let newPayments = state.paymentMethods.filter((p) => p.id !== id);
          if (newPayments.length > 0 && !newPayments.some(p => p.isDefault)) {
            newPayments[0].isDefault = true;
          }
          return { paymentMethods: newPayments };
        });
      },
      setDefaultPaymentMethod: (id) => {
        set((state) => ({
          paymentMethods: state.paymentMethods.map((p) => ({
            ...p,
            isDefault: p.id === id,
          })),
        }));
      },
    }),
    {
      name: 'closho-profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
