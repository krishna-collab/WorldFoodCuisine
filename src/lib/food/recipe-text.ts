import { ingredientAmount, ingredientName, type Measure } from "./quantity.ts";
import type { Allergen, Recipe, RecipeIngredient, RecipeStep, Substitute } from "./types.ts";

/** A piece of a step's instructions: plain text, or an ingredient with its scaled amount. */
export type Segment =
  | { type: "text"; text: string }
  | { type: "ingredient"; id: string; amount: string | null; name: string; swapped: boolean };

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** The order allergens are always listed in (the FALCPA list). */
const ALLERGEN_ORDER: Allergen[] = [
  "milk",
  "egg",
  "wheat",
  "soy",
  "peanuts",
  "tree-nuts",
  "sesame",
  "fish",
  "shellfish",
];

export function chosenSubstitute(
  ing: RecipeIngredient,
  swaps: Record<string, string>,
): Substitute | undefined {
  const name = swaps[ing.id];
  return name ? ing.substitutes?.find((s) => s.name === name) : undefined;
}

/** How many the recipe makes at this scale: "about 45 momos". */
export function scaledYield(recipe: Recipe, factor: number): number | null {
  return recipe.yields ? Math.max(1, Math.round(recipe.yields.amount * factor)) : null;
}

/** The ingredient as it reads in a sentence: "2½ cups maida (all-purpose flour)". */
export function ingredientPhrase(
  ing: RecipeIngredient,
  factor: number,
  measure: Measure,
  swaps: Record<string, string>,
): { amount: string | null; name: string; swapped: boolean } {
  const sub = chosenSubstitute(ing, swaps);
  const amount = sub?.amount ? null : ingredientAmount(ing, factor, measure);
  const name = lowerFirst(sub ? sub.name : ingredientName(ing));
  return { amount, name, swapped: Boolean(sub) };
}

/** Split a step's text into text and ingredient segments, with `{yield}` filled in. */
export function stepSegments(
  step: RecipeStep,
  recipe: Recipe,
  factor: number,
  measure: Measure,
  swaps: Record<string, string>,
): Segment[] {
  const byId = new Map(recipe.ingredients.map((i) => [i.id, i]));
  const yieldCount = scaledYield(recipe, factor);
  const segments: Segment[] = [];
  const pattern = /\{([a-z0-9-]+)\}/g;
  let last = 0;
  for (const match of step.text.matchAll(pattern)) {
    const [token, id] = match;
    const index = match.index ?? 0;
    if (index > last) segments.push({ type: "text", text: step.text.slice(last, index) });
    if (id === "yield") {
      segments.push({ type: "text", text: String(yieldCount ?? "") });
    } else {
      const ing = byId.get(id!);
      if (ing) segments.push({ type: "ingredient", id: ing.id, ...ingredientPhrase(ing, factor, measure, swaps) });
      else segments.push({ type: "text", text: token });
    }
    last = index + token.length;
  }
  if (last < step.text.length) segments.push({ type: "text", text: step.text.slice(last) });
  return segments;
}

/** The step as one sentence string, for reading aloud and for tests. */
export function stepPlainText(
  step: RecipeStep,
  recipe: Recipe,
  factor: number,
  measure: Measure,
  swaps: Record<string, string>,
): string {
  return stepSegments(step, recipe, factor, measure, swaps)
    .map((s) => (s.type === "text" ? s.text : s.amount ? `${s.amount} ${s.name}` : s.name))
    .join("");
}

/**
 * Allergens in the recipe as cooked with the chosen swaps, and what the swaps
 * changed. An allergen only goes away when no remaining ingredient has it.
 */
export function allergensWithSwaps(
  recipe: Recipe,
  swaps: Record<string, string>,
): { allergens: Allergen[]; removed: Allergen[]; added: Allergen[] } {
  const base = new Set<Allergen>();
  const now = new Set<Allergen>();
  for (const ing of recipe.ingredients) {
    for (const a of ing.allergens ?? []) base.add(a);
    const sub = chosenSubstitute(ing, swaps);
    const mine = new Set(ing.allergens ?? []);
    for (const a of sub?.removes ?? []) mine.delete(a);
    for (const a of sub?.adds ?? []) mine.add(a);
    for (const a of mine) now.add(a);
  }
  const order = (list: Iterable<Allergen>) =>
    ALLERGEN_ORDER.filter((a) => new Set(list).has(a));
  return {
    allergens: order(now),
    removed: order([...base].filter((a) => !now.has(a))),
    added: order([...now].filter((a) => !base.has(a))),
  };
}
