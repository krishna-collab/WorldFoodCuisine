import { create } from "zustand";
import { persist } from "zustand/middleware";
import { allergenLabels, dishById } from "@/lib/food/data";
import type { Allergen, CartItem } from "@/lib/food/types";
import { type DeliveryZone, unitPrice } from "@/lib/ordering/zones";

/**
 * The bag. Kept in this browser (it survives going offline and coming back);
 * prices, availability and delivery times are re-checked against the zone at
 * checkout, never trusted from here.
 */
type CartState = {
  items: CartItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (dishId: string, options?: Record<string, string>, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

export function cartKey(dishId: string, options?: Record<string, string>): string {
  const opts = Object.entries(options ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return opts ? `${dishId}?${opts}` : dishId;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      setOpen: (open) => set({ open }),
      add: (dishId, options, qty = 1) => {
        const key = cartKey(dishId, options);
        const items = [...get().items];
        const idx = items.findIndex((i) => i.key === key);
        if (idx >= 0) {
          const current = items[idx]!;
          items[idx] = { ...current, qty: Math.min(current.qty + qty, 20) };
        } else {
          items.push({ key, dishId, qty, ...(options && Object.keys(options).length ? { options } : {}) });
        }
        // The bag doesn't pop open: adding several dishes in a row stays quick.
        // The toast after adding offers "View bag".
        set({ items });
      },
      setQty: (key, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.key !== key) });
          return;
        }
        set({ items: get().items.map((i) => (i.key === key ? { ...i, qty: Math.min(qty, 20) } : i)) });
      },
      remove: (key) => set({ items: get().items.filter((i) => i.key !== key) }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "wfc-cart",
      version: 1,
      partialize: (s) => ({ items: s.items }),
      // Version 0 stored { dishId, qty } without a key or options.
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as { items?: Partial<CartItem>[] };
        if (version < 1) {
          state.items = (state.items ?? [])
            .filter((i): i is { dishId: string; qty: number } => Boolean(i.dishId && i.qty))
            .map((i) => ({ key: i.dishId, dishId: i.dishId, qty: i.qty }));
        }
        return state as { items: CartItem[] };
      },
    },
  ),
);

export function cartCount(items: CartItem[]) {
  return items.reduce((n, i) => n + i.qty, 0);
}

/** Subtotal in cents, priced by the zone (options included). */
export function cartSubtotal(items: CartItem[], zone: DeliveryZone) {
  return items.reduce((n, i) => {
    const dish = dishById[i.dishId];
    return n + (dish ? unitPrice(dish, zone, i.options) * i.qty : 0);
  }, 0);
}

/** Every allergen in the bag, in the standard order. */
export function bagAllergens(items: CartItem[]): Allergen[] {
  const found = new Set<Allergen>();
  for (const item of items) for (const a of dishById[item.dishId]?.allergens ?? []) found.add(a);
  return (Object.keys(allergenLabels) as Allergen[]).filter((a) => found.has(a));
}
