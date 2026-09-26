import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Buttons. Pill-shaped and at least 40px tall (44px from `md`) so they are
 * easy to hit with a thumb. `clay` is the ordering action (find your kitchen,
 * add to bag, checkout); `herb` marks confirmations; everything else is ink on
 * paper.
 */
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[opacity,transform,background-color,color,box-shadow] duration-150 ease-out disabled:pointer-events-none disabled:opacity-45 active:not-disabled:scale-[0.97] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg hover:opacity-90",
        secondary:
          "bg-surface text-fg shadow-[inset_0_0_0_1px_var(--color-border-strong)] hover:bg-sunken",
        ghost: "bg-transparent text-fg hover:bg-sunken",
        outline: "bg-transparent text-fg shadow-[inset_0_0_0_1px_var(--color-control)] hover:bg-sunken",
        herb: "bg-herb text-herb-fg hover:opacity-90",
        clay: "bg-clay text-clay-fg hover:opacity-90",
        warn: "bg-warn-bg text-warn-fg shadow-[inset_0_0_0_1px_var(--color-warn-border)] hover:opacity-90",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-[0.9375rem]",
        xl: "h-14 px-7 text-base",
        icon: "size-11",
        "icon-sm": "size-10",
        "icon-xl": "size-16",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  type,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...(asChild ? {} : { type: type ?? "button" })}
      {...props}
    />
  );
}
