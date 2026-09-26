import { dishContent } from "./content.ts";
import { cuisines, regionLabels } from "./cuisines.ts";
import { dishRecords } from "./dishes.ts";
import { editorial, tasteLabels } from "./editorial.ts";
import type {
  Allergen,
  Collection,
  Course,
  Cuisine,
  CuisineId,
  DietTag,
  Dish,
  Taste,
} from "./types.ts";

/**
 * Every dish as the app sees it: the menu record, its editorial layer, and
 * where each piece of content came from.
 */
export const dishes: Dish[] = dishRecords.map((record) => {
  const extra = editorial[record.id];
  if (!extra) throw new Error(`Missing editorial entry for ${record.id}`);
  return { ...record, ...extra, content: dishContent(record) };
});

export { cuisines, regionLabels, tasteLabels };

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

/** Dishes with an image (photo or labeled AI illustration), for places where imagery leads. */
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
export function localNameLang(dish: Pick<Dish, "localName" | "cuisine">): string {
  if (/[؀-ۿ]/.test(dish.localName)) return "ur";
  return cuisineLang[dish.cuisine];
}

/** The local name differs from the English one (Spanish and Italian names often don't). */
export function hasDistinctLocalName(dish: Pick<Dish, "name" | "localName">): boolean {
  return normalize(dish.name) !== normalize(dish.localName);
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

/** Plural headings for grouping a cuisine's dishes by course. */
export const courseGroups: { label: string; courses: Course[] }[] = [
  { label: "Mains", courses: ["main"] },
  { label: "Rice, noodles and bread", courses: ["rice", "noodles", "bread"] },
  { label: "Small plates and soups", courses: ["small-plate", "soup"] },
  { label: "Sweets", courses: ["dessert"] },
];

export const spiceLabel = ["Not spicy", "Mild", "Medium", "Hot"] as const;

export const TASTES = Object.keys(tasteLabels) as Taste[];

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
      dish.flavor,
      cuisine.name,
      cuisine.native,
      regionLabels[cuisine.region],
      courseLabels[dish.course],
      ...dish.tastes.map((t) => tasteLabels[t]),
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
 * region, tradition, course, flavor, diet or ingredients. Reports the first
 * matching ingredient so results can say why they matched.
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
  // Name matches first, then everything else in menu order.
  const q = normalize(query.trim());
  return results.sort((a, b) => {
    const an = normalize(`${a.dish.name} ${a.dish.localName}`).includes(q) ? 0 : 1;
    const bn = normalize(`${b.dish.name} ${b.dish.localName}`).includes(q) ? 0 : 1;
    return an - bn;
  });
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

/** Ingredients that appear across the whole menu and say little about a cuisine. */
const EVERYWHERE = new Set(["salt", "water", "garlic", "onion", "ginger", "tomato", "white onion"]);

/**
 * The ingredients that recur in one cuisine and are rare elsewhere on the
 * menu: timur for Nepal, fish sauce for Thailand. Counted from the data.
 */
export function signatureIngredients(id: CuisineId, limit = 6) {
  const count = new Map<
    string,
    { name: string; gloss?: string; here: Set<string>; elsewhere: Set<string> }
  >();
  for (const dish of dishes) {
    for (const item of new Set(dish.parts.flatMap((p) => p.items))) {
      const gloss = item.match(/\((.*)\)\s*$/)?.[1];
      const name = item.replace(/\s*\(.*\)\s*$/, "").replace(/,.*$/, "").trim();
      const key = normalize(name);
      if (EVERYWHERE.has(key)) continue;
      const entry = count.get(key) ?? { name, here: new Set(), elsewhere: new Set() };
      if (gloss && !entry.gloss) entry.gloss = gloss;
      (dish.cuisine === id ? entry.here : entry.elsewhere).add(dish.id);
      count.set(key, entry);
    }
  }
  return [...count.values()]
    .filter((e) => e.here.size >= 2)
    .map((e) => ({
      name: e.name,
      gloss: e.gloss,
      dishes: e.here.size,
      score: e.here.size / (1 + e.elsewhere.size),
    }))
    .sort((a, b) => b.score - a.score || b.dishes - a.dishes || a.name.localeCompare(b.name))
    .slice(0, limit);
}

const PAIR_WITH: Record<Course, Course[]> = {
  main: ["small-plate", "bread", "dessert", "soup", "rice"],
  rice: ["small-plate", "main", "dessert"],
  noodles: ["small-plate", "dessert", "main"],
  bread: ["main", "small-plate", "dessert"],
  "small-plate": ["main", "noodles", "soup", "dessert"],
  soup: ["small-plate", "rice", "main"],
  dessert: ["main", "small-plate", "noodles"],
};

/**
 * Dishes from the same cuisine that round out a meal: a different course,
 * one of each. Structural suggestions from the menu, not a claim about how
 * the dishes are traditionally eaten.
 */
export function pairingsFor(dish: Dish, limit = 3): Dish[] {
  const pool = dishesByCuisine(dish.cuisine).filter((d) => d.id !== dish.id);
  const picked: Dish[] = [];
  for (const course of PAIR_WITH[dish.course]) {
    const match = pool.find((d) => d.course === course && !picked.includes(d));
    if (match) picked.push(match);
    if (picked.length >= limit) break;
  }
  for (const d of pool) {
    if (picked.length >= limit) break;
    if (!picked.includes(d)) picked.push(d);
  }
  return picked;
}
