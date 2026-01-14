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
  publicPrice?: number; // Added for displaying crossed-out public price
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size?: string, isSubscription?: boolean) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, isSubscription?: boolean) => void;
  toggleSubscription: (productId: string, size?: string) => void;
  updateSize: (productId: string, oldSize?: string, newSize?: string, isSubscription?: boolean) => void;
  updateItemWithPrices: (productId: string, oldSize: string | undefined, newSize: string, isSubscription: boolean, unitPrice: number, subscriptionPrice?: number, publicPrice?: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getSubtotal: () => number;
  getSubscriptionSavings: () => number;
  getPublicPriceSavings: () => number;
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

      updateSize: (productId, oldSize, newSize, isSubscription) => {
        set((state) => {
          // Check if item with new size already exists
          const existingIndex = state.items.findIndex(
            item => item.productId === productId && 
                   item.size === newSize && 
                   item.isSubscription === isSubscription
          );

          if (existingIndex > -1) {
            // Merge quantities
            const oldItem = state.items.find(
              item => item.productId === productId && 
                     item.size === oldSize && 
                     item.isSubscription === isSubscription
            );
            if (!oldItem) return state;

            const updatedItems = state.items.filter(
              item => !(item.productId === productId && 
                       item.size === oldSize && 
                       item.isSubscription === isSubscription)
            );
            updatedItems[existingIndex > 0 ? existingIndex - 1 : 0].quantity += oldItem.quantity;
            return { items: updatedItems };
          }

          // Just update size
          return {
            items: state.items.map(item =>
              item.productId === productId && 
              item.size === oldSize && 
              item.isSubscription === isSubscription
                ? { ...item, size: newSize }
                : item
            )
          };
        });
      },

      updateItemWithPrices: (productId, oldSize, newSize, isSubscription, unitPrice, subscriptionPrice, publicPrice) => {
        set((state) => {
          // Check if item with new size already exists
          const existingIndex = state.items.findIndex(
            item => item.productId === productId && 
                   item.size === newSize && 
                   item.isSubscription === isSubscription
          );

          if (existingIndex > -1) {
            // Merge quantities
            const oldItem = state.items.find(
              item => item.productId === productId && 
                     item.size === oldSize && 
                     item.isSubscription === isSubscription
            );
            if (!oldItem) return state;

            const updatedItems = state.items.filter(
              item => !(item.productId === productId && 
                       item.size === oldSize && 
                       item.isSubscription === isSubscription)
            );
            const targetIndex = existingIndex > updatedItems.length - 1 ? updatedItems.length - 1 : existingIndex;
            if (targetIndex >= 0) {
              updatedItems[targetIndex].quantity += oldItem.quantity;
            }
            return { items: updatedItems };
          }

          // Update size and prices
          return {
            items: state.items.map(item =>
              item.productId === productId && 
              item.size === oldSize && 
              item.isSubscription === isSubscription
                ? { 
                    ...item, 
                    size: newSize,
                    unitPrice,
                    subscriptionPrice,
                    publicPrice 
                  }
                : item
            )
          };
        });
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

      getPublicPriceSavings: () => {
        return get().items.reduce((savings, item) => {
          if (item.publicPrice && item.publicPrice > item.unitPrice) {
            const actualPrice = item.isSubscription && item.subscriptionPrice 
              ? item.subscriptionPrice 
              : item.unitPrice;
            return savings + ((item.publicPrice - actualPrice) * item.quantity);
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
