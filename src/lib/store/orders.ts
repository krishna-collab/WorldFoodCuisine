import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OrderStatus, PlacedOrder } from "@/lib/food/types";

type OrderState = {
  orders: PlacedOrder[];
  place: (order: PlacedOrder) => void;
};

export const useOrders = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      place: (order) => set({ orders: [order, ...get().orders].slice(0, 20) }),
    }),
    { name: "wfc-orders" },
  ),
);

const STAGES: { status: OrderStatus; after: number; label: string; detail: string }[] = [
  { status: "received", after: 0, label: "Ticket in", detail: "Kitchen has your order." },
  { status: "prepping", after: 2 * 60_000, label: "On the line", detail: "Chefs are cooking your plates." },
  { status: "packed", after: 12 * 60_000, label: "Packed", detail: "Sealed, lot-stamped, ready for the rider." },
  { status: "enroute", after: 16 * 60_000, label: "On the way", detail: "A rider has your bag." },
  { status: "delivered", after: 28 * 60_000, label: "Delivered", detail: "Enjoy it hot." },
];

export function orderStatus(order: PlacedOrder, now = Date.now()) {
  const elapsed = now - order.createdAt;
  let current = STAGES[0]!;
  for (const stage of STAGES) {
    if (elapsed >= stage.after) current = stage;
  }
  return current;
}

export function orderStages() {
  return STAGES;
}

export function makeOrderId() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `WFC-${n}`;
}
