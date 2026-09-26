import { collectionById, dishes as allDishes, isCuisineId, searchDishes, TASTES, type SearchResult } from "./data.ts";
import type { CuisineId, DietTag, Dish, Taste } from "./types.ts";

/**
 * Menu filters, kept in the URL so a filtered menu can be shared or
 * bookmarked. Lists are comma-separated: ?cuisine=india,nepal&taste=smoky.
 */
export type MenuSearch = {
  q?: string;
  cuisine?: string;
  taste?: string;
  diet?: string;
  heat?: number;
  time?: number;
  ways?: string;
  collection?: string;
  sort?: SortKey;
};

export type SortKey = "menu" | "quickest" | "mildest" | "hottest";
export type Way = "recipe" | "order";
export type FilterGroup = "cuisine" | "taste" | "diet" | "heat" | "time" | "ways" | "collection";

export type MenuFilters = {
  q: string;
  cuisines: CuisineId[];
  tastes: Taste[];
  diets: DietTag[];
  /** Highest heat level to include, 0–3. */
  heat?: number;
  /** Longest total cooking time to include, in minutes. */
  time?: number;
  ways: Way[];
  collection?: string;
  sort: SortKey;
};

const DIETS: DietTag[] = ["vegetarian", "vegan", "gluten-free"];
const WAYS: Way[] = ["recipe", "order"];
const SORTS: SortKey[] = ["menu", "quickest", "mildest", "hottest"];

const list = <T extends string>(value: unknown, allowed: (v: string) => v is T): T[] =>
  typeof value === "string"
    ? [...new Set(value.split(",").map((v) => v.trim()).filter(allowed))]
    : [];

const isTaste = (v: string): v is Taste => (TASTES as string[]).includes(v);
const isDiet = (v: string): v is DietTag => (DIETS as string[]).includes(v);
const isWay = (v: string): v is Way => (WAYS as string[]).includes(v);

/** Validate raw URL search params; unknown values are dropped, not errors. */
export function validateMenuSearch(search: Record<string, unknown>): MenuSearch {
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
  const num = (v: unknown, allowed: number[]) => {
    const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
    return allowed.includes(n) ? n : undefined;
  };
  const joined = <T extends string>(values: T[]) => (values.length ? values.join(",") : undefined);
  return {
    q: str(search.q),
    cuisine: joined(list(search.cuisine, isCuisineId)),
    taste: joined(list(search.taste, isTaste)),
    diet: joined(list(search.diet, isDiet)),
    heat: num(search.heat, [0, 1, 2]),
    time: num(search.time, [30, 60, 120]),
    ways: joined(list(search.ways, isWay)),
    collection:
      typeof search.collection === "string" && search.collection in collectionById
        ? search.collection
        : undefined,
    sort: SORTS.includes(search.sort as SortKey) && search.sort !== "menu" ? (search.sort as SortKey) : undefined,
  };
}

export function parseFilters(search: MenuSearch): MenuFilters {
  return {
    q: search.q ?? "",
    cuisines: list(search.cuisine, isCuisineId),
    tastes: list(search.taste, isTaste),
    diets: list(search.diet, isDiet),
    heat: search.heat,
    time: search.time,
    ways: list(search.ways, isWay),
    collection: search.collection,
    sort: search.sort ?? "menu",
  };
}

/** How many filters are on (the search box doesn't count). */
export function activeFilterCount(f: MenuFilters): number {
  return (
    f.cuisines.length +
    f.tastes.length +
    f.diets.length +
    (f.heat !== undefined ? 1 : 0) +
    (f.time !== undefined ? 1 : 0) +
    f.ways.length +
    (f.collection ? 1 : 0)
  );
}

type Context = { orderable: (dish: Dish) => boolean };

function passes(dish: Dish, f: MenuFilters, ctx: Context, skip?: FilterGroup): boolean {
  if (skip !== "cuisine" && f.cuisines.length && !f.cuisines.includes(dish.cuisine)) return false;
  if (skip !== "taste" && f.tastes.length && !f.tastes.some((t) => dish.tastes.includes(t)))
    return false;
  if (skip !== "diet" && f.diets.some((d) => !dish.diet.includes(d))) return false;
  if (skip !== "heat" && f.heat !== undefined && dish.spice > f.heat) return false;
  if (skip !== "time" && f.time !== undefined && dish.time.total > f.time) return false;
  if (skip !== "ways") {
    if (f.ways.includes("recipe") && !dish.hasRecipe) return false;
    if (f.ways.includes("order") && !ctx.orderable(dish)) return false;
  }
  if (skip !== "collection" && f.collection) {
    const ids = collectionById[f.collection]?.dishIds ?? [];
    if (!ids.includes(dish.id)) return false;
  }
  return true;
}

function sortResults(results: SearchResult[], sort: SortKey): SearchResult[] {
  if (sort === "menu") return results;
  const copy = [...results];
  if (sort === "quickest") copy.sort((a, b) => a.dish.time.total - b.dish.time.total);
  if (sort === "mildest") copy.sort((a, b) => a.dish.spice - b.dish.spice);
  if (sort === "hottest") copy.sort((a, b) => b.dish.spice - a.dish.spice);
  return copy;
}

/** Dishes matching the search and every filter, in the chosen order. */
export function filterDishes(
  f: MenuFilters,
  ctx: Context,
  pool: Dish[] = allDishes,
): SearchResult[] {
  const kept = pool.filter((d) => passes(d, f, ctx));
  return sortResults(searchDishes(f.q, kept), f.sort);
}

/**
 * How many dishes an option would show, given every other filter: the
 * numbers beside each chip. Options within a group combine with "or"
 * (cuisine, flavor), except diet, which must all hold.
 */
export function facetCount(
  f: MenuFilters,
  ctx: Context,
  group: FilterGroup,
  test: (dish: Dish) => boolean,
): number {
  const base = allDishes.filter((d) => passes(d, f, ctx, group) && test(d));
  return searchDishes(f.q, base).length;
}
