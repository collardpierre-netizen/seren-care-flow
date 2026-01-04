import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  productName: string;
  productImage?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  isSubscription: boolean;
  subscriptionPrice?: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size?: string, isSubscription?: boolean) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, isSubscription?: boolean) => void;
  toggleSubscription: (productId: string, size?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getSubtotal: () => number;
  getSubscriptionSavings: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            item => item.productId === newItem.productId && 
                   item.size === newItem.size && 
                   item.isSubscription === newItem.isSubscription
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += newItem.quantity;
            return { items: updatedItems };
          }

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId, size, isSubscription) => {
        set((state) => ({
          items: state.items.filter(
            item => !(item.productId === productId && 
                     item.size === size && 
                     item.isSubscription === isSubscription)
          )
        }));
      },

      updateQuantity: (productId, quantity, size, isSubscription) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, isSubscription);
          return;
        }

        set((state) => ({
          items: state.items.map(item =>
            item.productId === productId && 
            item.size === size && 
            item.isSubscription === isSubscription
              ? { ...item, quantity }
              : item
          )
        }));
      },

      toggleSubscription: (productId, size) => {
        set((state) => ({
          items: state.items.map(item =>
            item.productId === productId && item.size === size
              ? { ...item, isSubscription: !item.isSubscription }
              : item
          )
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.isSubscription && item.subscriptionPrice 
            ? item.subscriptionPrice 
            : item.unitPrice;
          return total + (price * item.quantity);
        }, 0);
      },

      getSubscriptionSavings: () => {
        return get().items.reduce((savings, item) => {
          if (item.isSubscription && item.subscriptionPrice) {
            return savings + ((item.unitPrice - item.subscriptionPrice) * item.quantity);
          }
          return savings;
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'serencare-cart',
    }
  )
);
