import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DpiBand } from "@/lib/types";

export interface CartItem {
  kind: "product" | "custom";
  // product lines
  product_id?: number;
  slug?: string;
  // custom lines — a fresh CustomUpload row per upload, so no natural dedup key
  custom_upload_id?: number;
  // size — set on product lines (chosen poster size) and custom lines
  // (baked in at upload time)
  size_code?: string;
  size_label?: string;
  dpi_band?: DpiBand;
  // shared
  title: string;
  image_url: string;
  price_inr: number;
  qty: number;
}

// Stable per-line identity for dedupe/remove/setQty — a product line keys on
// product_id + size_code (same design at a different size is a separate
// line; bump qty on an exact repeat add), a custom line keys on its unique
// custom_upload_id (each "Create your own" design is its own line).
export function lineId(item: Pick<CartItem, "kind" | "product_id" | "custom_upload_id" | "size_code">): string {
  return item.kind === "custom"
    ? `custom:${item.custom_upload_id}`
    : `product:${item.product_id}:${item.size_code ?? ""}`;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
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
          if (item.kind === "product") {
            const id = lineId(item);
            const existing = state.items.find((i) => lineId(i) === id);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  lineId(i) === id ? { ...i, qty: Math.min(99, i.qty + qty) } : i,
                ),
              };
            }
          }
          return { items: [...state.items, { ...item, qty }] };
        }),
      remove: (id) =>
        set((state) => ({
          items: state.items.filter((i) => lineId(i) !== id),
        })),
      setQty: (id, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            lineId(i) === id ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i,
          ),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      subtotal: () => get().items.reduce((n, i) => n + i.price_inr * i.qty, 0),
    }),
    { name: "wallmeri.cart" },
  ),
);
