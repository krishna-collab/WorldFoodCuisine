import { Link } from "@tanstack/react-router";
import { memo } from "react";
import { courseLabels, cuisineById, hasDistinctLocalName, localNameLang } from "@/lib/food/data";
import type { Dish } from "@/lib/food/types";
import { cn } from "@/lib/utils";
import { QuickAdd } from "./add-button";
import { DishFacts } from "./dish-facts";
import { DishImage } from "./dish-image";
import { SaveButton } from "./save-button";

type DishCardProps = {
  dish: Dish;
  /** Ingredient that made this dish match a search, shown under the flavor line. */
  ingredientMatch?: string;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
  /** "feature" is the large editorial version used for the lead dish of a section. */
  variant?: "tile" | "feature";
  sizes?: string;
  className?: string;
};

/**
 * A dish in a grid: photo first, then name, a one-line flavor, quick facts
 * and one action. The whole card opens the dish; the long story lives on the
 * dish page. No box around it: the image and a hairline carry the structure.
 * Memoized: the menu re-renders its grid on every filter change, and cards
 * whose dish didn't change shouldn't re-render.
 */
export const DishCard = memo(function DishCard({
  dish,
  ingredientMatch,
  priority,
  headingLevel = "h3",
  variant = "tile",
  sizes = "(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 100vw",
  className,
}: DishCardProps) {
  const cuisine = cuisineById[dish.cuisine];
  const Heading = headingLevel;
  const feature = variant === "feature";

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative">
        <DishImage
          dish={dish}
          className={cn("rounded-xl", feature ? "aspect-[4/3] lg:aspect-[3/2]" : "aspect-[4/3]")}
          imgClassName="transition-transform duration-500 ease-[var(--ease-out-quint)] [@media(hover:hover)]:group-hover:scale-[1.025]"
          sizes={sizes}
          priority={priority}
        />
        <SaveButton dish={dish} className="absolute top-2 right-2 z-10" />
      </div>
      <div className={cn("flex flex-1 flex-col", feature ? "pt-5" : "pt-3.5")}>
        <p className="eyebrow text-subtle">
          {cuisine.name}
          <span aria-hidden="true"> · </span>
          <span className="sr-only">, </span>
          {courseLabels[dish.course]}
        </p>
        <Heading
          className={cn(
            "mt-1.5 leading-tight tracking-[-0.01em]",
            feature ? "text-display-m" : "text-[1.3125rem]",
          )}
        >
          <Link
            to="/dish/$id"
            params={{ id: dish.id }}
            className="rounded-sm text-fg after:absolute after:inset-0 after:content-[''] focus-visible:outline-none [@media(hover:hover)]:group-hover:text-accent"
          >
            {dish.name}
          </Link>
        </Heading>
        {hasDistinctLocalName(dish) ? (
          <p className="mt-0.5 text-sm text-subtle">
            <span lang={localNameLang(dish)} dir="auto">
              {dish.localName}
            </span>
          </p>
        ) : null}
        <p className={cn("mt-2 leading-relaxed text-muted", feature ? "text-lede" : "text-[0.9375rem]")}>
          {dish.flavor}
        </p>
        {ingredientMatch ? (
          <p className="mt-1.5 text-sm font-semibold text-accent">
            Has {ingredientMatch.replace(/\s*\(.*\)$/, "").toLowerCase()}
          </p>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <DishFacts dish={dish} compact />
          <QuickAdd dish={dish} />
        </div>
      </div>
      {/* Group-focus ring for keyboard users, drawn around image and text. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-2xl ring-ring group-has-[a:focus-visible]:ring-2"
      />
    </article>
  );
});

/** Compact row for lists: thumbnail, name, flavor. */
export function DishRow({ dish, className }: { dish: Dish; className?: string }) {
  return (
    <article className={cn("group relative flex items-center gap-4 py-3", className)}>
      <DishImage dish={dish} sizes="96px" label="none" className="size-20 shrink-0 rounded-lg sm:size-24" />
      <div className="min-w-0 flex-1">
        <h3 className="text-[1.1875rem] leading-tight">
          <Link
            to="/dish/$id"
            params={{ id: dish.id }}
            className="text-fg after:absolute after:inset-0 after:content-[''] focus-visible:outline-none [@media(hover:hover)]:group-hover:text-accent"
          >
            {dish.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{dish.flavor}</p>
        <DishFacts dish={dish} compact className="mt-1.5" />
      </div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-2 inset-y-0 rounded-xl ring-ring group-has-[a:focus-visible]:ring-2"
      />
    </article>
  );
}
