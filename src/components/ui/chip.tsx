import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Toggle chip for filters. Selected state is ink-filled with a check mark, so
 * it doesn't rely on color alone.
 */
export function Chip({
  active,
  onClick,
  children,
  disabled,
  className,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  /** Number of matching dishes, shown after the label. */
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors duration-150 disabled:opacity-45",
        active
          ? "bg-primary text-primary-fg"
          : "bg-surface text-fg shadow-[inset_0_0_0_1px_var(--color-border-strong)] hover:bg-sunken",
        className,
      )}
    >
      {active ? <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" /> : null}
      {children}
      {count !== undefined ? (
        <span className={cn("nums font-medium", active ? "opacity-75" : "text-subtle")}>
          {count}
        </span>
      ) : null}
    </button>
  );
}
