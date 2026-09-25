import { createFileRoute, Outlet, useChildMatches, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { type ReactNode, useId, useMemo } from "react";
import { DishCard } from "@/components/food/dish-card";
import { Input } from "@/components/ui/input";
import {
  collectionById,
  collections,
  cuisines,
  dietLabels,
  dishes,
  isCuisineId,
  searchDishes,
} from "@/lib/food/data";
import type { CuisineId, DietTag } from "@/lib/food/types";
import { pageHead } from "@/lib/site";
import { cn } from "@/lib/utils";

type MenuSearch = {
  q?: string;
  cuisine?: CuisineId;
  diet?: DietTag;
  collection?: string;
};

const DIETS: DietTag[] = ["vegetarian", "vegan", "gluten-free"];

export const Route = createFileRoute("/menu")({
  validateSearch: (search: Record<string, unknown>): MenuSearch => ({
    q: typeof search.q === "string" && search.q.trim() ? search.q : undefined,
    cuisine:
      typeof search.cuisine === "string" && isCuisineId(search.cuisine)
        ? search.cuisine
        : undefined,
    diet:
      typeof search.diet === "string" && (DIETS as string[]).includes(search.diet)
        ? (search.diet as DietTag)
        : undefined,
    collection:
      typeof search.collection === "string" && search.collection in collectionById
        ? search.collection
        : undefined,
  }),
  head: () =>
    pageHead({
      title: "Menu: 50 dishes, every ingredient listed",
      description:
        "Search 50 dishes from India, Nepal, Thailand, Mexico and Italy by name, region or ingredient. Filter by vegetarian, vegan or gluten-free.",
      path: "/menu",
    }),
  component: MenuRoute,
});

/** /menu/$cuisine is nested under /menu; render it instead of the full menu. */
function MenuRoute() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) return <Outlet />;
  return <MenuPage />;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-11 shrink-0 rounded-full px-4 text-sm font-medium transition-colors duration-150",
        active
          ? "bg-primary text-primary-fg"
          : "bg-elevated text-muted shadow-[var(--shadow-border)] hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function ChipRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-3">
      <span className="hidden w-24 shrink-0 text-sm text-subtle md:block">{label}</span>
      <div className="no-scrollbar scroll-fade -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {children}
      </div>
    </div>
  );
}

function MenuPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const searchId = useId();
  const collection = search.collection ? collectionById[search.collection] : undefined;

  const update = (patch: Partial<MenuSearch>) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false });

  const results = useMemo(() => {
    let pool = dishes;
    if (collection) pool = pool.filter((d) => collection.dishIds.includes(d.id));
    if (search.cuisine) pool = pool.filter((d) => d.cuisine === search.cuisine);
    if (search.diet) pool = pool.filter((d) => d.diet.includes(search.diet!));
    return searchDishes(search.q ?? "", pool);
  }, [collection, search.cuisine, search.diet, search.q]);

  const filtered = Boolean(search.q || search.cuisine || search.diet || search.collection);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 2xl:max-w-[1536px]">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        {collection ? collection.title : "The menu"}
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        {collection
          ? `${collection.blurb} An editorial collection.`
          : "Fifty dishes from five cuisines. Search by name, region or anything they’re made of."}
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">
            Search dishes and ingredients
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-subtle"
            aria-hidden="true"
          />
          <Input
            id={searchId}
            type="search"
            value={search.q ?? ""}
            onChange={(e) => update({ q: e.target.value || undefined })}
            placeholder="Try paneer, momo or timur"
            className="pl-11"
            enterKeyHint="search"
          />
        </div>
        <ChipRow label="Cuisine">
          <Chip active={!search.cuisine} onClick={() => update({ cuisine: undefined })}>
            All cuisines
          </Chip>
          {cuisines.map((c) => (
            <Chip
              key={c.id}
              active={search.cuisine === c.id}
              onClick={() => update({ cuisine: c.id })}
            >
              {c.name}
            </Chip>
          ))}
        </ChipRow>
        <ChipRow label="Diet">
          <Chip active={!search.diet} onClick={() => update({ diet: undefined })}>
            Any diet
          </Chip>
          {DIETS.map((d) => (
            <Chip key={d} active={search.diet === d} onClick={() => update({ diet: d })}>
              {dietLabels[d]}
            </Chip>
          ))}
        </ChipRow>
        <ChipRow label="Collection">
          <Chip active={!search.collection} onClick={() => update({ collection: undefined })}>
            Any collection
          </Chip>
          {collections.map((c) => (
            <Chip
              key={c.id}
              active={search.collection === c.id}
              onClick={() => update({ collection: c.id })}
            >
              {c.title}
            </Chip>
          ))}
        </ChipRow>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm text-muted">
        <p aria-live="polite">
          {results.length} {results.length === 1 ? "dish" : "dishes"}
        </p>
        {filtered ? (
          <button
            type="button"
            onClick={() => void navigate({ search: {}, replace: true, resetScroll: false })}
            className="flex h-11 items-center gap-1.5 px-2 hover:text-fg"
          >
            <X className="size-4" aria-hidden="true" />
            Clear filters
          </button>
        ) : null}
      </div>

      {results.length === 0 ? (
        <div className="mt-12 rounded-2xl bg-surface p-8 text-center shadow-[var(--shadow-border)]">
          <p className="font-display text-xl">Nothing matches that yet</p>
          <p className="mt-2 text-muted">Try another ingredient, or clear the filters.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {results.map(({ dish, ingredientMatch }, i) => (
            <DishCard
              key={dish.id}
              dish={dish}
              ingredientMatch={ingredientMatch}
              priority={i < 3}
              headingLevel="h2"
            />
          ))}
        </div>
      )}
    </div>
  );
}
