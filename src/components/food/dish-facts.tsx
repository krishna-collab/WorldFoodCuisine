import { Droplet, Leaf } from "lucide-react";
import { dietLabels, spiceLabel } from "@/lib/food/data";
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
 * The quick facts under a dish name: heat, diet and the fat it's cooked in.
 * `compact` (cards) shows heat and the main diet tag only.
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
      {!compact && dish.cookedIn.length ? (
        <li className="inline-flex items-center gap-1">
          <Droplet className="size-3.5" aria-hidden="true" />
          Cooked in {dish.cookedIn.join(" and ").toLowerCase()}
        </li>
      ) : null}
    </ul>
  );
}
