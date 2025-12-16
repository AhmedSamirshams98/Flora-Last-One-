// store/cart-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { CartItem } from "@/types/cart";

interface CartStore {
  items: CartItem[];
  totalItems: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,

      addToCart: (item) => {
        set((state) => {
          // ⚠️ التحديث: البحث باستخدام variantId إذا موجود
          const existingItem = state.items.find((i) => 
            item.variantId ? i.variantId === item.variantId : i.id === item.id
          );
          
          let newItems;

          if (existingItem) {
            newItems = state.items.map((i) =>
              (item.variantId ? i.variantId === item.variantId : i.id === item.id) 
                ? { ...i, quantity: i.quantity + (item.quantity || 1) } 
                : i
            );
            toast.success("تم تحديث الكمية");
          } else {
            newItems = [...state.items, { 
              ...item, 
              quantity: item.quantity || 1,
              isOffer: item.isOffer || false, // ⚠️ تأكيد قيمة isOffer
              variantId: item.variantId // ⚠️ حفظ variantId
            }];
            toast.success("تمت إضافة المنتج إلى السلة");
          }

          const newTotalItems = newItems.reduce(
            (total, item) => total + item.quantity,
            0
          );

          return {
            items: newItems,
            totalItems: newTotalItems,
          };
        });
      },

      removeFromCart: (id: string) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== id);
          const newTotalItems = newItems.reduce(
            (total, item) => total + item.quantity,
            0
          );

          toast.success("تم إزالة المنتج من السلة");
          return {
            items: newItems,
            totalItems: newTotalItems,
          };
        });
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }

        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          );
          const newTotalItems = newItems.reduce(
            (total, item) => total + item.quantity,
            0
          );

          return {
            items: newItems,
            totalItems: newTotalItems,
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
        });
        toast.success("تم تفريغ السلة");
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        return get().totalItems;
      },
    }),
    {
      name: "flora-cart-storage",
    }
  )
);