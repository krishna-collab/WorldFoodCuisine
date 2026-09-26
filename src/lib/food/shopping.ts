import { normalize } from "./data.ts";
import {
  addQuantities,
  formatScaled,
  ingredientName,
  type Measure,
  scaledQuantity,
} from "./quantity.ts";
import type { Aisle, Quantity, Recipe } from "./types.ts";

/**
 * Turns a guided recipe into shopping-list lines. An ingredient used twice
 * (garlic in the filling and the achar) becomes one line with the total.
 * Kept free of React and storage so the menu tests can check it.
 */
export type ListItem = {
  /** dishId:ingredient */
  id: string;
  dishId: string;
  name: string;
  amount: string | null;
  prep?: string;
  aisle: Aisle;
  /** Substitute chosen in cook mode, bought instead of the original. */
  swappedFrom?: string;
  checked: boolean;
};

/** Things nobody needs to buy. */
const BASICS = new Set(["water"]);

/** "Timur (Nepali Sichuan pepper)" and "Timur" are the same thing to buy. */
const baseName = (item: string) => normalize(item.replace(/\s*\(.*\)\s*$/, "").trim());

export function buildListItems(
  recipe: Recipe,
  factor: number,
  measure: Measure,
  swaps: Record<string, string> = {},
): ListItem[] {
  type Line = Omit<ListItem, "amount"> & { qty: Quantity | null; text?: string; merged: boolean };
  const lines = new Map<string, Line>();
  for (const ing of recipe.ingredients) {
    if (BASICS.has(baseName(ing.item))) continue;
    const sub = swaps[ing.id] ? ing.substitutes?.find((s) => s.name === swaps[ing.id]) : undefined;
    const key = sub ? `swap:${ing.id}` : baseName(ing.item);
    // A swap uses the original amount unless it says otherwise.
    const qty = scaledQuantity(ing, factor, measure);
    const existing = lines.get(key);
    if (existing && !sub) {
      const sum = existing.qty && qty ? addQuantities(existing.qty, qty) : null;
      if (sum) {
        existing.qty = sum;
        existing.merged = true;
        existing.prep = undefined;
        continue;
      }
    }
    lines.set(existing ? `${key}:${ing.id}` : key, {
      id: `${recipe.dishId}:${existing ? ing.id : key}`,
      dishId: recipe.dishId,
      name: sub ? sub.name : existing ? ingredientName(ing) : (ing.label ?? ing.item),
      qty,
      text: sub?.amount,
      prep: sub ? undefined : ing.prep,
      aisle: sub?.aisle ?? ing.aisle,
      ...(sub ? { swappedFrom: ingredientName(ing) } : {}),
      checked: false,
      merged: false,
    });
  }
  return [...lines.values()].map(({ qty, text, merged, ...line }) => ({
    ...line,
    // A merged line is bought as one thing: drop component-specific wording.
    name: merged ? line.name.replace(/,.*$/, "") : line.name,
    amount: text ?? (qty ? formatScaled(qty, measure) : null),
  }));
}

export const aisleLabels: Record<Aisle, string> = {
  produce: "Fruit and vegetables",
  meat: "Meat and fish",
  dairy: "Dairy and eggs",
  spices: "Spices",
  pantry: "Pantry",
};

export const AISLE_ORDER: Aisle[] = ["produce", "meat", "dairy", "spices", "pantry"];
