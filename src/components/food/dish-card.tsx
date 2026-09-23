import { Link } from "@tanstack/react-router";
import { cuisineById, dietLabels } from "@/lib/food/data";
import type { Dish } from "@/lib/food/types";
import { formatPrice } from "@/lib/utils";
import { AddButton } from "./add-button";

export function DishCard({ dish, large = false }: { dish: Dish; large?: boolean }) {
  const cuisine = cuisineById[dish.cuisine];

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-200 ease-out hover:shadow-[var(--shadow-border-hover)]">
      <Link to="/dish/$id" params={{ id: dish.id }} className="block">
        <div className={large ? "relative aspect-[4/3] overflow-hidden" : "relative aspect-[4/3] overflow-hidden sm:aspect-[5/4]"}>
          <img
            src={dish.image ?? cuisine.image}
            alt={dish.name}
            className="food-frame size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
          <span className="absolute top-3 left-3 inline-flex h-7 items-center rounded-full bg-bg/80 px-2.5 text-xs font-medium text-fg backdrop-blur-sm">
            {cuisine.name}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to="/dish/$id"
              params={{ id: dish.id }}
              className="font-display text-lg font-semibold tracking-tight text-fg hover:opacity-80"
            >
              {dish.name}
            </Link>
            <p className="mt-0.5 text-xs text-muted">{dish.localName}</p>
          </div>
          <p className="shrink-0 font-medium tabular-nums text-fg">{formatPrice(dish.price)}</p>
        </div>
        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted">{dish.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {dish.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-subtle">
              {dietLabels[tag]}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-subtle">{dish.prepMinutes} min fire</p>
          <AddButton dishId={dish.id} />
        </div>
      </div>
    </article>
  );
}
