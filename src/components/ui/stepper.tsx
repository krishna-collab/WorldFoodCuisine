import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * − value + control for quantities and servings. The value is announced when
 * it changes; the buttons name what they change ("One fewer Chicken Momo").
 */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 20,
  label,
  valueText,
  size = "md",
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** What is being counted, e.g. "Chicken Momo" or "servings". */
  label: string;
  /** Visible value, e.g. "4 servings". Defaults to the number. */
  valueText?: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const big = size === "lg";
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center rounded-full bg-surface shadow-[inset_0_0_0_1px_var(--color-control)]",
        big ? "h-14" : "h-11",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Fewer ${label}`}
        className={cn(
          "flex items-center justify-center rounded-full text-fg hover:bg-sunken disabled:opacity-35",
          big ? "size-14" : "size-11",
        )}
      >
        <Minus className={big ? "size-5" : "size-4"} aria-hidden="true" />
      </button>
      <span
        className={cn("nums text-center font-semibold", big ? "min-w-24 text-lg" : "min-w-8 text-sm")}
        aria-live="polite"
      >
        {valueText ?? value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`More ${label}`}
        className={cn(
          "flex items-center justify-center rounded-full text-fg hover:bg-sunken disabled:opacity-35",
          big ? "size-14" : "size-11",
        )}
      >
        <Plus className={big ? "size-5" : "size-4"} aria-hidden="true" />
      </button>
    </div>
  );
}
