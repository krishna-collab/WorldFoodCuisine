import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  children,
}: {
  className?: string;
  tone?: "neutral" | "accent" | "warn";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium tracking-wide",
        tone === "neutral" && "bg-elevated text-muted shadow-[var(--shadow-border)]",
        tone === "accent" && "bg-accent/15 text-accent shadow-[0_0_0_1px_rgba(226,161,58,0.35)]",
        tone === "warn" && "bg-warn-bg text-warn-fg shadow-[0_0_0_1px_rgba(243,201,105,0.3)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
