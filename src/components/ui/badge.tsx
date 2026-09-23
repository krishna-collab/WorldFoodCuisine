import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full bg-elevated px-2.5 text-[0.6875rem] font-medium tracking-wide text-muted shadow-[var(--shadow-border)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
