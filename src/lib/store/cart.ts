import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/food/types";
import { dishById } from "@/lib/food/data";

type CartState = {
  items: CartItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (dishId: string, qty?: number) => void;
  setQty: (dishId: string, qty: number) => void;
  remove: (dishId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      setOpen: (open) => set({ open }),
      add: (dishId, qty = 1) => {
        const items = [...get().items];
        const idx = items.findIndex((i) => i.dishId === dishId);
        if (idx >= 0) {
          const current = items[idx];
          if (current) items[idx] = { ...current, qty: current.qty + qty };
        } else {
          items.push({ dishId, qty });
        }
        set({ items, open: true });
      },
      setQty: (dishId, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.dishId !== dishId) });
          return;
        }
        set({
          items: get().items.map((i) => (i.dishId === dishId ? { ...i, qty } : i)),
        });
      },
      remove: (dishId) => set({ items: get().items.filter((i) => i.dishId !== dishId) }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "wfc-cart",
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

export function cartCount(items: CartItem[]) {
  return items.reduce((n, i) => n + i.qty, 0);
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((n, i) => {
    const dish = dishById[i.dishId];
    return n + (dish ? dish.price * i.qty : 0);
  }, 0);
}
