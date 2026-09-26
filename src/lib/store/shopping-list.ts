import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildListItems, type ListItem } from "@/lib/food/shopping";
import type { Measure } from "@/lib/food/quantity";
import type { Recipe } from "@/lib/food/types";

export { AISLE_ORDER, aisleLabels, type ListItem } from "@/lib/food/shopping";

/**
 * Shopping list built from guided recipes. Kept in this browser, so it works
 * in the shop without a connection.
 */
type ListState = {
  items: ListItem[];
  addRecipe: (
    recipe: Recipe,
    factor: number,
    measure: Measure,
    swaps?: Record<string, string>,
  ) => number;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clearChecked: () => void;
  clearDish: (dishId: string) => void;
  clearAll: () => void;
};

export const useShoppingList = create<ListState>()(
  persist(
    (set, get) => ({
      items: [],
      addRecipe: (recipe, factor, measure, swaps = {}) => {
        const fresh = buildListItems(recipe, factor, measure, swaps);
        // Replace this recipe's lines (new servings or swaps), keep everything else.
        const others = get().items.filter((i) => i.dishId !== recipe.dishId);
        set({ items: [...others, ...fresh] });
        return fresh.length;
      },
      toggle: (id) =>
        set({ items: get().items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)) }),
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clearChecked: () => set({ items: get().items.filter((i) => !i.checked) }),
      clearDish: (dishId) => set({ items: get().items.filter((i) => i.dishId !== dishId) }),
      clearAll: () => set({ items: [] }),
    }),
    { name: "wfc-shopping-list" },
  ),
);
