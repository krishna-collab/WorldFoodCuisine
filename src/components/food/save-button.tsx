import { Heart } from "lucide-react";
import { toast } from "sonner";
import type { Dish } from "@/lib/food/types";
import { useSaved } from "@/lib/store/saved";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

/**
 * Save a dish for later. Saved dishes live on this device and stay
 * available offline (their page and image are kept).
 */
export function SaveButton({
  dish,
  variant = "overlay",
  className,
}: {
  dish: Pick<Dish, "id" | "name">;
  /** "overlay" sits on an image; "inline" is a normal button with a label. */
  variant?: "overlay" | "inline";
  className?: string;
}) {
  const hydrated = useHydrated();
  const saved = useSaved((s) => s.ids.includes(dish.id)) && hydrated;
  const toggle = useSaved((s) => s.toggle);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = toggle(dish.id);
    toast(now ? `Saved ${dish.name}` : `Removed ${dish.name} from saved`, {
      description: now ? "It stays on this device and works offline." : undefined,
    });
  };

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold shadow-[inset_0_0_0_1px_var(--color-border-strong)] hover:bg-sunken",
          className,
        )}
      >
        <Heart className={cn("size-4", saved && "fill-accent text-accent")} aria-hidden="true" />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={`Save ${dish.name}`}
      className={cn(
        "flex size-11 items-center justify-center rounded-full bg-surface/90 text-fg shadow-[0_1px_3px_rgb(0_0_0/0.18)] backdrop-blur-sm transition-transform hover:scale-105",
        className,
      )}
    >
      <Heart className={cn("size-5", saved && "fill-accent text-accent")} aria-hidden="true" />
    </button>
  );
}
