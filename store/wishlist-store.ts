// store/wishlist-store.ts
import { WishlistItem } from '@/types/wisthlist';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  items: WishlistItem[];
  loading: boolean;
  initialized: boolean;
  
  // Actions
  initializeWishlist: () => Promise<void>;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      initialized: false,

      initializeWishlist: async () => {
        const { initialized } = get();
        if (initialized) return;
        
        set({ loading: true });
        try {
          const response = await fetch('/api/wishlist');
          if (response.ok) {
            const data = await response.json();
            set({ items: data.items || [], initialized: true });
          }
        } catch (error) {
          console.error('Failed to initialize wishlist:', error);
        } finally {
          set({ loading: false });
        }
      },

      fetchWishlist: async () => {
        set({ loading: true });
        try {
          const response = await fetch('/api/wishlist');
          if (response.ok) {
            const data = await response.json();
            set({ items: data.items || [] });
          }
        } catch (error) {
          console.error('Failed to fetch wishlist:', error);
        } finally {
          set({ loading: false });
        }
      },

      addToWishlist: async (productId: string) => {
        const { items } = get();
        
        // التحقق أولاً إذا كان المنتج موجود بالفعل
        if (items.some(item => item.productId === productId)) {
          return;
        }

        set({ loading: true });
        try {
          const response = await fetch('/api/wishlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
          });

          if (response.ok) {
            const newItem = await response.json();
            set({ items: [...items, newItem] });
          } else {
            throw new Error('Failed to add to wishlist');
          }
        } catch (error) {
          console.error('Failed to add to wishlist:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      removeFromWishlist: async (productId: string) => {
        const { items } = get();
        set({ loading: true });
        
        try {
          const response = await fetch(`/api/wishlist?productId=${productId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            set({ items: items.filter(item => item.productId !== productId) });
          } else {
            throw new Error('Failed to remove from wishlist');
          }
        } catch (error) {
          console.error('Failed to remove from wishlist:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      isInWishlist: (productId: string) => {
        const { items } = get();
        return items.some(item => item.productId === productId);
      },

      getWishlistCount: () => {
        const { items } = get();
        return items.length;
      },
    }),
    {
      name: 'wishlist-store',
      partialize: (state) => ({ items: state.items }),
    }
  )
);