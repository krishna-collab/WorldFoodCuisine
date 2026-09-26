import { ChefHat, Clock, Leaf } from "lucide-react";
import { dietLabels, spiceLabel } from "@/lib/food/data";
import { formatDuration } from "@/lib/food/quantity";
import type { Dish } from "@/lib/food/types";
import { cn } from "@/lib/utils";

/** Heat as three pips plus words, so it never relies on color. */
export function SpiceMeter({ level, className }: { level: 0 | 1 | 2 | 3; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-2.5 w-1.5 rounded-full",
              i <= level ? "bg-accent" : "bg-border-strong",
            )}
          />
        ))}
      </span>
      {spiceLabel[level]}
    </span>
  );
}

/**
 * The quick facts under a dish name: time to cook at home, heat and diet.
 * `compact` drops the diet list for cards.
 */
export function DishFacts({
  dish,
  className,
  compact = false,
}: {
  dish: Dish;
  className?: string;
  compact?: boolean;
}) {
  const diet = dish.diet.includes("vegan")
    ? ["vegan" as const, ...dish.diet.filter((d) => d === "gluten-free")]
    : dish.diet;
  return (
    <ul
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-muted", className)}
      aria-label="Quick facts"
    >
      <li className="inline-flex items-center gap-1">
        <Clock className="size-3.5" aria-hidden="true" />
        <span>
          <span className="sr-only">Time to cook at home: </span>
          {formatDuration(dish.time.total)}
          {dish.time.note ? <span className="sr-only">, {dish.time.note}</span> : null}
          {dish.time.note && !compact ? "+" : null}
        </span>
      </li>
      <li>
        <span className="sr-only">Heat: </span>
        <SpiceMeter level={dish.spice} />
      </li>
      {diet.length > 0 ? (
        <li className="inline-flex items-center gap-1">
          <Leaf className="size-3.5" aria-hidden="true" />
          {compact ? dietLabels[diet[0]!] : diet.map((d) => dietLabels[d]).join(", ")}
        </li>
      ) : null}
      {dish.hasRecipe ? (
        <li className="inline-flex items-center gap-1 font-semibold text-herb">
          <ChefHat className="size-3.5" aria-hidden="true" />
          Guided recipe
        </li>
      ) : null}
    </ul>
  );
}
