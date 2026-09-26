import { createFileRoute, Outlet, useChildMatches, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { type ReactNode, useDeferredValue, useId, useMemo, useState } from "react";
import { DishCard } from "@/components/food/dish-card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Sheet } from "@/components/ui/sheet";
import {
  collectionById,
  collections,
  cuisines,
  dietLabels,
  dishes,
  TASTES,
  tasteLabels,
  TIME_LIMITS,
} from "@/lib/food/data";
import {
  activeFilterCount,
  facetCount,
  type FilterGroup,
  filterDishes,
  type MenuFilters,
  type MenuSearch,
  parseFilters,
  type SortKey,
  validateMenuSearch,
} from "@/lib/food/filters";
import type { DietTag, Dish } from "@/lib/food/types";
import { menuStatus } from "@/lib/ordering/zones";
import { pageHead } from "@/lib/site";
import { useAreaStatus } from "@/lib/store/delivery-area";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  validateSearch: (search: Record<string, unknown>): MenuSearch => validateMenuSearch(search),
  head: () =>
    pageHead({
      title: "Dishes: find something to cook or order",
      description:
        "Search 50 dishes from India, Nepal, Thailand, Mexico and Italy by name, local name or ingredient. Filter by cuisine, flavor, heat, diet and time to cook.",
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

const DIETS: DietTag[] = ["vegetarian", "vegan", "gluten-free"];
const HEAT = [
  { value: 0, label: "Not spicy" },
  { value: 1, label: "Mild or less" },
  { value: 2, label: "Medium or less" },
] as const;
const SORT_LABELS: Record<SortKey, string> = {
  menu: "Menu order",
  quickest: "Quickest to cook",
  mildest: "Mildest first",
  hottest: "Hottest first",
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
const join = <T extends string>(values: T[]) => (values.length ? values.join(",") : undefined);

function FilterSection({ title, children, hint }: { title: string; children: ReactNode; hint?: string }) {
  return (
    <fieldset className="border-t border-border pt-4 first:border-t-0 first:pt-0">
      <legend className="eyebrow float-left mb-3 w-full text-subtle">{title}</legend>
      <div className="clear-left flex flex-wrap gap-2">{children}</div>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-subtle">{hint}</p> : null}
    </fieldset>
  );
}

function FilterPanel({
  f,
  update,
  orderable,
  servedLabel,
}: {
  f: MenuFilters;
  update: (patch: Partial<MenuSearch>) => void;
  orderable: (d: Dish) => boolean;
  servedLabel: string | null;
}) {
  const ctx = { orderable };
  const count = (group: FilterGroup, test: (d: Dish) => boolean) => facetCount(f, ctx, group, test);
  return (
    <div className="flex flex-col gap-5">
      <FilterSection title="Ways to get it">
        <Chip
          active={f.ways.includes("recipe")}
          onClick={() => update({ ways: join(toggle(f.ways, "recipe")) })}
          count={count("ways", (d) => d.hasRecipe && (!f.ways.includes("order") || orderable(d)))}
        >
          Guided recipe
        </Chip>
        <Chip
          active={f.ways.includes("order")}
          disabled={!servedLabel && !f.ways.includes("order")}
          onClick={() => update({ ways: join(toggle(f.ways, "order")) })}
          count={servedLabel ? count("ways", (d) => orderable(d) && (!f.ways.includes("recipe") || d.hasRecipe)) : undefined}
        >
          {servedLabel ?? "Order to your door"}
        </Chip>
      </FilterSection>
      <FilterSection title="Cuisine">
        {cuisines.map((c) => (
          <Chip
            key={c.id}
            active={f.cuisines.includes(c.id)}
            onClick={() => update({ cuisine: join(toggle(f.cuisines, c.id)) })}
            count={count("cuisine", (d) => d.cuisine === c.id)}
          >
            {c.name}
          </Chip>
        ))}
      </FilterSection>
      <FilterSection title="Flavor">
        {TASTES.map((t) => (
          <Chip
            key={t}
            active={f.tastes.includes(t)}
            onClick={() => update({ taste: join(toggle(f.tastes, t)) })}
            count={count("taste", (d) => d.tastes.includes(t))}
          >
            {tasteLabels[t]}
          </Chip>
        ))}
      </FilterSection>
      <FilterSection title="Heat">
        {HEAT.map((h) => (
          <Chip
            key={h.value}
            active={f.heat === h.value}
            onClick={() => update({ heat: f.heat === h.value ? undefined : h.value })}
            count={count("heat", (d) => d.spice <= h.value)}
          >
            {h.label}
          </Chip>
        ))}
      </FilterSection>
      <FilterSection title="Diet">
        {DIETS.map((d) => (
          <Chip
            key={d}
            active={f.diets.includes(d)}
            onClick={() => update({ diet: join(toggle(f.diets, d)) })}
            count={count("diet", (dish) =>
              [...f.diets.filter((x) => x !== d), d].every((x) => dish.diet.includes(x)),
            )}
          >
            {dietLabels[d]}
          </Chip>
        ))}
      </FilterSection>
      <FilterSection
        title="Time to cook at home"
        hint="Start to finish, including marinating. Overnight soaking isn’t counted; each dish says if it needs it."
      >
        {TIME_LIMITS.map((t) => (
          <Chip
            key={t.value}
            active={f.time === t.value}
            onClick={() => update({ time: f.time === t.value ? undefined : t.value })}
            count={count("time", (d) => d.time.total <= t.value)}
          >
            {t.label}
          </Chip>
        ))}
      </FilterSection>
      <FilterSection title="Collections">
        {collections.map((c) => (
          <Chip
            key={c.id}
            active={f.collection === c.id}
            onClick={() => update({ collection: f.collection === c.id ? undefined : c.id })}
            count={count("collection", (d) => c.dishIds.includes(d.id))}
          >
            {c.title}
          </Chip>
        ))}
      </FilterSection>
    </div>
  );
}

function MenuPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const area = useAreaStatus();
  const searchId = useId();
  const sortId = useId();
  const [sheetOpen, setSheetOpen] = useState(false);

  const f = useMemo(() => parseFilters(search), [search]);
  const orderable = useMemo(
    () => (d: Dish) => area.kind === "served" && menuStatus(d, area.zone).available,
    [area],
  );
  const servedLabel =
    area.kind === "served" ? `Order to ${area.postalCode}${area.zone.demo ? " (demo)" : ""}` : null;

  const update = (patch: Partial<MenuSearch>) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false });
  const clearAll = () =>
    void navigate({ search: { q: search.q }, replace: true, resetScroll: false });

  const results = useMemo(() => filterDishes(f, { orderable }), [f, orderable]);
  // Chips, counts and pills update at once; the grid of cards follows a moment
  // later without blocking the tap (keeps interactions fast on slower phones).
  const shown = useDeferredValue(results);
  const catchingUp = shown !== results;
  const filterCount = activeFilterCount(f);
  const collection = f.collection ? collectionById[f.collection] : undefined;

  // Active filters as removable pills.
  const pills: { key: string; label: string; remove: () => void }[] = [
    ...f.ways.map((w) => ({
      key: `w-${w}`,
      label: w === "recipe" ? "Guided recipe" : (servedLabel ?? "Order to your door"),
      remove: () => update({ ways: join(f.ways.filter((x) => x !== w)) }),
    })),
    ...f.cuisines.map((c) => ({
      key: `c-${c}`,
      label: cuisines.find((x) => x.id === c)!.name,
      remove: () => update({ cuisine: join(f.cuisines.filter((x) => x !== c)) }),
    })),
    ...f.tastes.map((t) => ({
      key: `t-${t}`,
      label: tasteLabels[t],
      remove: () => update({ taste: join(f.tastes.filter((x) => x !== t)) }),
    })),
    ...(f.heat !== undefined
      ? [{ key: "heat", label: HEAT.find((h) => h.value === f.heat)!.label, remove: () => update({ heat: undefined }) }]
      : []),
    ...f.diets.map((d) => ({
      key: `d-${d}`,
      label: dietLabels[d],
      remove: () => update({ diet: join(f.diets.filter((x) => x !== d)) }),
    })),
    ...(f.time !== undefined
      ? [{ key: "time", label: TIME_LIMITS.find((t) => t.value === f.time)!.label, remove: () => update({ time: undefined }) }]
      : []),
    ...(collection ? [{ key: "col", label: collection.title, remove: () => update({ collection: undefined }) }] : []),
  ];

  return (
    <div className="gutter mx-auto max-w-[90rem] pt-6 md:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <h1 className="text-display-l">{collection ? collection.title : "Dishes"}</h1>
        <p className="text-sm text-muted">
          {collection ? collection.blurb : `${dishes.length} dishes from five cuisines`}
        </p>
      </div>

      {/* Search + filters bar: sticky under the header on phones. */}
      <div
        data-sticky-search
        className="sticky top-14 z-30 -mx-4 mt-4 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 md:top-16 lg:static lg:mx-0 lg:border-b-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <label htmlFor={searchId} className="sr-only">
              Search dishes, local names and ingredients
            </label>
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-subtle"
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              value={search.q ?? ""}
              onChange={(e) => update({ q: e.target.value || undefined })}
              placeholder="Search: momo, paneer, timur…"
              enterKeyHint="search"
              autoComplete="off"
              className="h-12 w-full rounded-full bg-surface pr-4 pl-12 text-base shadow-[inset_0_0_0_1px_var(--color-control)] placeholder:text-subtle focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring"
            />
          </div>
          <Button
            variant={filterCount ? "primary" : "secondary"}
            size="lg"
            className="px-4 lg:hidden"
            onClick={() => setSheetOpen(true)}
            aria-label={filterCount ? `Filters, ${filterCount} on` : "Filters"}
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Filters</span>
            {filterCount ? <span className="nums">{filterCount}</span> : null}
          </Button>
        </div>
      </div>
      {/* Quick cuisine chips on phones and tablets. They scroll away so only the
          search row stays pinned; the sidebar has them on desktop. */}
      <div
        role="group"
        aria-label="Cuisine"
        className="no-scrollbar scroll-fade -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:hidden"
      >
        {cuisines.map((c) => (
          <Chip
            key={c.id}
            active={f.cuisines.includes(c.id)}
            onClick={() => update({ cuisine: join(toggle(f.cuisines, c.id)) })}
          >
            {c.name}
          </Chip>
        ))}
      </div>

      <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[18.5rem_minmax(0,1fr)]">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2 pb-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-display-s">Filters</h2>
              {filterCount ? (
                <button type="button" onClick={clearAll} className="text-link text-sm font-semibold">
                  Clear all
                </button>
              ) : null}
            </div>
            <FilterPanel f={f} update={update} orderable={orderable} servedLabel={servedLabel} />
          </div>
        </aside>

        <section aria-labelledby="results-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="results-heading" className="font-sans text-sm font-semibold text-muted" aria-live="polite">
              {results.length} {results.length === 1 ? "dish" : "dishes"}
              {search.q ? ` for “${search.q}”` : ""}
            </h2>
            <div className="flex items-center gap-2">
              <label htmlFor={sortId} className="text-sm text-muted">
                Sort
              </label>
              <select
                id={sortId}
                value={f.sort}
                onChange={(e) => update({ sort: e.target.value === "menu" ? undefined : (e.target.value as SortKey) })}
                className="h-10 rounded-full bg-surface pr-8 pl-4 text-sm font-semibold shadow-[inset_0_0_0_1px_var(--color-control)] focus-visible:outline-2 focus-visible:outline-ring"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((s) => (
                  <option key={s} value={s}>
                    {SORT_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {pills.length ? (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Filters on">
              {pills.map((p) => (
                <li key={p.key}>
                  <button
                    type="button"
                    onClick={p.remove}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-sunken px-3 text-sm font-semibold hover:bg-border"
                  >
                    {p.label}
                    <X className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">(remove filter)</span>
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={clearAll} className="h-9 px-2 text-sm font-semibold text-muted hover:text-fg">
                  Clear all
                </button>
              </li>
            </ul>
          ) : null}

          {shown.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border-strong px-6 py-12 text-center">
              <p className="text-display-s">Nothing matches all of that</p>
              <p className="mx-auto mt-2 max-w-md text-muted">
                {pills.length
                  ? "Try removing a filter. Each option shows how many dishes it would leave."
                  : "Try an ingredient, a local name or a cuisine."}
              </p>
              {pills.length ? (
                <Button className="mt-6" variant="secondary" onClick={pills.at(-1)!.remove}>
                  Remove “{pills.at(-1)!.label}”
                </Button>
              ) : null}
            </div>
          ) : (
            <ul
              className={cn(
                "mt-5 grid gap-x-5 gap-y-10 transition-opacity duration-150 sm:grid-cols-2 xl:grid-cols-3 min-[110rem]:grid-cols-4",
                catchingUp && "opacity-60",
              )}
            >
              {shown.map(({ dish, ingredientMatch }, i) => (
                <li key={dish.id} className="flex">
                  <DishCard
                    dish={dish}
                    ingredientMatch={ingredientMatch}
                    priority={i < 2}
                    className="w-full"
                    sizes="(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 100vw"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Filters"
        description="Numbers show how many dishes each choice leaves."
        footer={
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={clearAll} disabled={!filterCount}>
              Clear all
            </Button>
            <Button className="flex-1" size="lg" onClick={() => setSheetOpen(false)}>
              Show {results.length} {results.length === 1 ? "dish" : "dishes"}
            </Button>
          </div>
        }
      >
        <FilterPanel f={f} update={update} orderable={orderable} servedLabel={servedLabel} />
      </Sheet>
    </div>
  );
}
