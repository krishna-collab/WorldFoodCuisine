import { MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Dish } from "@/lib/food/types";
import { useCart } from "@/lib/store/cart";
import { useAreaStatus, useDeliveryArea } from "@/lib/store/delivery-area";
import { cn, formatPrice } from "@/lib/utils";

type AddButtonProps = {
  dish: Dish;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Show the price inside the button (dish page). */
  withPrice?: boolean;
};

/**
 * Ordering starts from a ZIP code. Until the visitor has one, the button asks
 * for it; where nobody delivers yet it says so instead of pretending to add.
 */
export function AddButton({ dish, className, size = "sm", withPrice = false }: AddButtonProps) {
  const area = useAreaStatus();
  const add = useCart((s) => s.add);
  const openDialog = useDeliveryArea((s) => s.openDialog);

  if (area.kind === "served") {
    return (
      <Button
        size={size}
        className={cn("min-w-11 whitespace-nowrap", className)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          add(dish.id);
          toast.success(`${dish.name} added${area.zone.demo ? " (demo)" : ""}`);
        }}
      >
        <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
        {withPrice ? `Add · ${formatPrice(dish.price)}` : "Add"}
        <span className="sr-only"> {dish.name}</span>
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant="secondary"
      className={cn("min-w-11 whitespace-nowrap", className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openDialog();
      }}
    >
      <MapPin className="size-4" aria-hidden="true" />
      {area.kind === "unserved" ? `Not in ${area.postalCode} yet` : "Check delivery"}
    </Button>
  );
}

/** Price only where a delivery zone is active; prices aren't real anywhere else. */
export function DishPrice({ dish, className }: { dish: Dish; className?: string }) {
  const area = useAreaStatus();
  if (area.kind !== "served") return null;
  return (
    <p className={cn("shrink-0 font-medium tabular-nums text-fg", className)}>
      {formatPrice(dish.price)}
      {area.zone.demo ? <span className="ml-1 text-xs font-normal text-warn-fg">demo</span> : null}
    </p>
  );
}
