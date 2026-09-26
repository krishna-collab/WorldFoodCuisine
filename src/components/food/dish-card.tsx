import { Link } from "@tanstack/react-router";
import { cuisineById, dietLabels, localNameLang, spiceLabel } from "@/lib/food/data";
import type { Dish } from "@/lib/food/types";
import { AddButton, DishPrice } from "./add-button";
import { DishImage } from "./dish-image";

type DishCardProps = {
  dish: Dish;
  /** Ingredient that made this dish match a search, shown under the story. */
  ingredientMatch?: string;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
};

export function DishCard({ dish, ingredientMatch, priority, headingLevel = "h3" }: DishCardProps) {
  const cuisine = cuisineById[dish.cuisine];
  const Heading = headingLevel;
  const facts = [
    cuisine.name,
    ...dish.diet.map((d) => dietLabels[d]),
    dish.spice > 0 ? spiceLabel[dish.spice] : null,
  ].filter(Boolean);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)] transition-shadow duration-200 ease-out [@media(hover:hover)]:hover:shadow-[var(--shadow-border-hover)]">
      <Link to="/dish/$id" params={{ id: dish.id }} tabIndex={-1} aria-hidden="true">
        <DishImage
          dish={dish}
          className="aspect-[4/3]"
          imgClassName="transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:scale-[1.03]"
          sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw"
          priority={priority}
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Heading className="font-display text-lg leading-snug font-semibold tracking-tight">
              <Link
                to="/dish/$id"
                params={{ id: dish.id }}
                className="text-fg after:absolute after:inset-0 after:content-[''] focus-visible:outline-none [@media(hover:hover)]:hover:opacity-85"
              >
                {dish.name}
              </Link>
            </Heading>
            <p className="mt-0.5 text-sm text-muted" lang={localNameLang(dish)} dir="auto">
              {dish.localName}
            </p>
          </div>
          <DishPrice dish={dish} />
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{dish.story}</p>
        {ingredientMatch ? (
          <p className="text-sm text-accent">Contains {ingredientMatch.toLowerCase()}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <p className="min-w-0 text-xs text-subtle">{facts.join(" · ")}</p>
          <div className="relative z-10 shrink-0">
            <AddButton dish={dish} />
          </div>
        </div>
      </div>
    </article>
  );
}
