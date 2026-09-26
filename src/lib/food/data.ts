import { cuisines, regionLabels } from "./cuisines.ts";
import { dishes } from "./dishes.ts";
import type { Allergen, Collection, Course, Cuisine, CuisineId, DietTag, Dish } from "./types.ts";

export { cuisines, dishes, regionLabels };

export const cuisineById = Object.fromEntries(cuisines.map((c) => [c.id, c])) as Record<
  CuisineId,
  Cuisine
>;

export const dishById = Object.fromEntries(dishes.map((d) => [d.id, d])) as Record<string, Dish>;

export function isCuisineId(value: string): value is CuisineId {
  return value in cuisineById;
}

export function dishesByCuisine(id: CuisineId) {
  return dishes.filter((d) => d.cuisine === id);
}

export function featuredDishes() {
  return dishes.filter((d) => d.featured);
}

/** Dishes with an image (photo or labeled AI image), for places where imagery leads. */
export function photographedDishes() {
  return dishes.filter((d) => d.image.kind !== "placeholder");
}

/** BCP 47 language of each cuisine's native name. */
export const cuisineLang: Record<CuisineId, string> = {
  india: "hi",
  nepal: "ne",
  thailand: "th",
  mexico: "es",
  italy: "it",
};

/** BCP 47 language of a dish's local name (Hyderabadi biryani is written in Urdu). */
export function localNameLang(dish: Dish): string {
  if (/[؀-ۿ]/.test(dish.localName)) return "ur";
  return cuisineLang[dish.cuisine];
}

export const dietLabels: Record<DietTag, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "gluten-free": "Gluten-free",
};

export const allergenLabels: Record<Allergen, string> = {
  milk: "Milk",
  egg: "Egg",
  wheat: "Wheat",
  soy: "Soy",
  peanuts: "Peanuts",
  "tree-nuts": "Tree nuts",
  sesame: "Sesame",
  fish: "Fish",
  shellfish: "Shellfish",
};

export const courseLabels: Record<Course, string> = {
  main: "Main",
  rice: "Rice",
  noodles: "Noodles",
  bread: "Bread",
  "small-plate": "Small plate",
  soup: "Soup",
  dessert: "Dessert",
};

export const spiceLabel = ["Not spicy", "Mild", "Medium", "Hot"] as const;

/** Editorial collections. Curated by hand; they say nothing about availability. */
export const collections: Collection[] = [
  {
    id: "filled-and-wrapped",
    title: "Filled and wrapped",
    blurb: "Dumplings, crepes and parcels: momo, yomari, tamales and more.",
    dishIds: [
      "chicken-momo",
      "yomari",
      "tamales",
      "masala-dosa",
      "chiles-rellenos",
      "huitlacoche-quesadilla",
      "enchiladas-verdes",
    ],
  },
  {
    id: "plant-based",
    title: "Plant-based",
    blurb: "Every vegan dish on the menu, cooked in olive oil.",
    dishIds: dishes.filter((d) => d.diet.includes("vegan")).map((d) => d.id),
  },
  {
    id: "noodles-and-soups",
    title: "Noodles and soups",
    blurb: "Bowls from the Himalaya to Jalisco.",
    dishIds: ["thukpa", "khao-soi", "tom-yum", "pozole-rojo", "pad-thai"],
  },
  {
    id: "slow-cooked",
    title: "Slow-cooked",
    blurb: "Dishes that take hours: dal makhani, mole, osso buco.",
    dishIds: ["dal-makhani", "rogan-josh", "mole-poblano", "osso-buco", "massaman", "lasagna"],
  },
];

export const collectionById = Object.fromEntries(collections.map((c) => [c.id, c])) as Record<
  string,
  Collection
>;

/** Lowercase and strip diacritics so "oaxaquenos" finds "Oaxaqueños". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

type SearchEntry = { dish: Dish; text: string; ingredients: string[] };

const searchIndex: SearchEntry[] = dishes.map((dish) => {
  const cuisine = cuisineById[dish.cuisine];
  const ingredients = dish.parts.flatMap((p) => p.items);
  const text = normalize(
    [
      dish.name,
      dish.localName,
      dish.tradition ?? "",
      cuisine.name,
      cuisine.native,
      regionLabels[cuisine.region],
      courseLabels[dish.course],
      ...dish.diet.map((d) => dietLabels[d]),
      ...dish.parts.map((p) => p.label),
      ...ingredients,
    ].join(" "),
  );
  return { dish, text, ingredients };
});

export type SearchResult = { dish: Dish; ingredientMatch?: string };

/**
 * Every word in the query must appear somewhere in the dish: its names, cuisine,
 * region, tradition, course, diet or ingredients. Reports the first matching
 * ingredient so results can say why they matched.
 */
export function searchDishes(query: string, pool: Dish[] = dishes): SearchResult[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const allowed = new Set(pool.map((d) => d.id));
  if (words.length === 0) return pool.map((dish) => ({ dish }));
  const results: SearchResult[] = [];
  for (const entry of searchIndex) {
    if (!allowed.has(entry.dish.id)) continue;
    if (!words.every((w) => entry.text.includes(w))) continue;
    const nameText = normalize(`${entry.dish.name} ${entry.dish.localName}`);
    const ingredientMatch = words.every((w) => nameText.includes(w))
      ? undefined
      : entry.ingredients.find((i) => words.some((w) => normalize(i).includes(w)));
    results.push({ dish: entry.dish, ingredientMatch });
  }
  return results;
}

/** Every ingredient on the menu, with the dishes that use it. */
export function ingredientIndex(): { name: string; dishIds: string[] }[] {
  const byKey = new Map<string, { name: string; dishIds: Set<string> }>();
  for (const dish of dishes) {
    for (const item of dish.parts.flatMap((p) => p.items)) {
      const base = item.replace(/\s*\(.*\)\s*$/, "").trim();
      const key = normalize(base);
      const entry = byKey.get(key) ?? { name: base, dishIds: new Set<string>() };
      entry.dishIds.add(dish.id);
      byKey.set(key, entry);
    }
  }
  return [...byKey.values()]
    .map((e) => ({ name: e.name, dishIds: [...e.dishIds] }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
