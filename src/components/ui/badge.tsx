import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "outline" | "accent" | "herb" | "warn" | "ink";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-sunken text-muted",
  outline: "text-muted shadow-[inset_0_0_0_1px_var(--color-border-strong)]",
  accent: "bg-clay-soft text-clay",
  herb: "bg-herb-soft text-herb",
  warn: "bg-warn-bg text-warn-fg shadow-[inset_0_0_0_1px_var(--color-warn-border)]",
  ink: "bg-primary text-primary-fg",
};

export function Badge({
  className,
  tone = "neutral",
  children,
}: {
  className?: string;
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-semibold tracking-wide [&_svg]:size-3.5",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
