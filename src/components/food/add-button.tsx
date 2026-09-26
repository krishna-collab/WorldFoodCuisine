import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Dish } from "@/lib/food/types";
import { defaultOptions, menuStatus, unitPrice } from "@/lib/ordering/zones";
import { useCart } from "@/lib/store/cart";
import { useAreaStatus } from "@/lib/store/delivery-area";
import { cn, formatPrice } from "@/lib/utils";
import { toastAdded } from "./toast-added";

/**
 * One-tap add on dish cards. Only shown where a kitchen (or the demo) serves
 * the visitor's ZIP code and the dish is on today's menu; otherwise the card
 * stays about the food, and the dish page handles location.
 */
export function QuickAdd({ dish, className }: { dish: Dish; className?: string }) {
  const area = useAreaStatus();
  const add = useCart((s) => s.add);
  if (area.kind !== "served") return null;
  const status = menuStatus(dish, area.zone);
  if (!status.available) {
    return <p className={cn("text-xs font-semibold text-subtle", className)}>{status.reason}</p>;
  }
  const options = defaultOptions(dish, area.zone);
  const price = unitPrice(dish, area.zone, options);
  return (
    <Button
      size="sm"
      variant="clay"
      className={cn("relative z-10", className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add(dish.id, options);
        toastAdded(`${dish.name} added${area.zone.demo ? " (demo)" : ""}`);
      }}
    >
      <Plus className="size-4" strokeWidth={2.5} aria-hidden="true" />
      <span className="nums">{formatPrice(price)}</span>
      <span className="sr-only">
        Add {dish.name} to your bag{area.zone.demo ? " (demo price)" : ""}
      </span>
    </Button>
  );
}

/** Price only where a delivery zone is active; prices aren't real anywhere else. */
export function DishPrice({ dish, className }: { dish: Dish; className?: string }) {
  const area = useAreaStatus();
  if (area.kind !== "served") return null;
  return (
    <p className={cn("nums shrink-0 font-semibold text-fg", className)}>
      {formatPrice(unitPrice(dish, area.zone, defaultOptions(dish, area.zone)))}
      {area.zone.demo ? <span className="ml-1 text-xs font-medium text-warn-fg">demo</span> : null}
    </p>
  );
}
