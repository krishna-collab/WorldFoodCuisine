import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DemoOrder } from "@/lib/food/types";

/**
 * Demo orders only. Real ordering does not exist yet, so nothing here is
 * sent anywhere; the confirmation page reads the last few from this store.
 */
type OrderState = {
  orders: DemoOrder[];
  place: (order: DemoOrder) => void;
};

export const useOrders = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      place: (order) => set({ orders: [order, ...get().orders].slice(0, 10) }),
    }),
    { name: "wfc-demo-orders" },
  ),
);

export function makeDemoOrderId() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `DEMO-${n}`;
}
