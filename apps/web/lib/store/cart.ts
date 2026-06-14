import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  product_id: number;
  slug: string;
  title: string;
  image_url: string;
  price_inr: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (product_id: number) => void;
  setQty: (product_id: number, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.product_id === item.product_id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id
                  ? { ...i, qty: Math.min(99, i.qty + qty) }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, qty }] };
        }),
      remove: (product_id) =>
        set((state) => ({
          items: state.items.filter((i) => i.product_id !== product_id),
        })),
      setQty: (product_id, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === product_id
              ? { ...i, qty: Math.max(1, Math.min(99, qty)) }
              : i,
          ),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      subtotal: () => get().items.reduce((n, i) => n + i.price_inr * i.qty, 0),
    }),
    { name: "wallmeri.cart" },
  ),
);
