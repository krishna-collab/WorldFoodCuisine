import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M8 14.5c0-3.2 3.6-6 8-6s8 2.8 8 6v1.2c0 4.4-3.6 7.3-8 7.3s-8-2.9-8-7.3z"
        className="fill-primary-fg"
      />
      <path
        d="M10.2 15.2c.5 3.2 2.7 5.1 5.8 5.1s5.3-1.9 5.8-5.1"
        fill="none"
        stroke="currentColor"
        className="stroke-primary"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 text-fg">
      <Mark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[0.9375rem] font-semibold tracking-tight">
          WorldFoodCuisine
        </span>
        {!compact ? (
          <span className="mt-0.5 text-[0.625rem] font-medium tracking-[0.16em] text-muted uppercase">
            Delivery kitchens
          </span>
        ) : null}
      </span>
    </span>
  );
}
