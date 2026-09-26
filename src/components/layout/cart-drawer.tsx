import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { DishImage } from "@/components/food/dish-image";
import { Button } from "@/components/ui/button";
import { dishById } from "@/lib/food/data";
import { priceSummary } from "@/lib/ordering/zones";
import { cartCount, cartSubtotal, useCart } from "@/lib/store/cart";
import { useAreaStatus, useDeliveryArea } from "@/lib/store/delivery-area";
import { useHydrated } from "@/lib/use-hydrated";
import { cn, formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const rawItems = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const hydrated = useHydrated();
  const items = hydrated ? rawItems : [];
  const area = useAreaStatus();
  const openDialog = useDeliveryArea((s) => s.openDialog);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const count = cartCount(items);
  const summary = area.kind === "served" ? priceSummary(cartSubtotal(items), area.zone) : null;

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      returnFocus.current?.focus?.();
    };
  }, [open, setOpen]);

  return (
    <div
      className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!open}
      inert={!open ? true : undefined}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close bag"
        className={cn(
          "absolute inset-0 bg-bg/70 transition-opacity duration-200 ease-out",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-[var(--shadow-border)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div>
            <h2 id={titleId} className="font-display text-lg font-semibold">
              Your bag
            </h2>
            <p className="text-xs text-muted">
              {count} {count === 1 ? "dish" : "dishes"}
              {area.kind === "served"
                ? ` · ${area.zone.demo ? "demo, " : ""}ZIP ${area.postalCode}`
                : ""}
            </p>
          </div>
          <Button
            ref={closeRef}
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="Close bag"
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="font-display text-xl">Your bag is empty</p>
              <p className="max-w-xs text-sm text-muted">
                {area.kind === "served"
                  ? "Add a dish from the menu."
                  : "Check your ZIP code first to see if we deliver to you."}
              </p>
              <Button asChild variant="secondary">
                <Link to="/menu" onClick={() => setOpen(false)}>
                  Browse the menu
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const dish = dishById[item.dishId];
                if (!dish) return null;
                return (
                  <li key={item.dishId} className="flex gap-3">
                    <DishImage
                      dish={dish}
                      sizes="80px"
                      label="none"
                      className="size-20 shrink-0 rounded-md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm leading-snug font-medium">{dish.name}</p>
                        {summary ? (
                          <p className="text-sm tabular-nums">
                            {formatPrice(dish.price * item.qty)}
                          </p>
                        ) : null}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex h-11 items-center rounded-md bg-elevated shadow-[var(--shadow-border)]">
                          <button
                            type="button"
                            className="flex size-11 items-center justify-center text-fg"
                            onClick={() => setQty(item.dishId, item.qty - 1)}
                            aria-label={`One fewer ${dish.name}`}
                          >
                            <Minus className="size-4" aria-hidden="true" />
                          </button>
                          <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            className="flex size-11 items-center justify-center text-fg"
                            onClick={() => setQty(item.dishId, item.qty + 1)}
                            aria-label={`One more ${dish.name}`}
                          >
                            <Plus className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="h-11 px-2 text-sm text-muted hover:text-fg"
                          onClick={() => remove(item.dishId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-border p-4 pb-safe">
            {summary ? (
              <>
                <dl className="mb-4 space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted">
                    <dt>Subtotal</dt>
                    <dd className="tabular-nums text-fg">{formatPrice(summary.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-muted">
                    <dt>Delivery</dt>
                    <dd className="tabular-nums text-fg">
                      {summary.delivery === 0 ? "Free" : formatPrice(summary.delivery)}
                    </dd>
                  </div>
                  <div className="flex justify-between text-muted">
                    <dt>Tax</dt>
                    <dd className="tabular-nums text-fg">{formatPrice(summary.tax)}</dd>
                  </div>
                  <div className="flex justify-between pt-1 font-medium">
                    <dt>Total{area.kind === "served" && area.zone.demo ? " (demo)" : ""}</dt>
                    <dd className="tabular-nums">{formatPrice(summary.total)}</dd>
                  </div>
                </dl>
                <Button asChild className="w-full" size="lg">
                  <Link to="/checkout" onClick={() => setOpen(false)}>
                    Continue to checkout
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-sm text-muted">
                <p>
                  {area.kind === "unserved"
                    ? `We’re not delivering to ${area.postalCode} yet, so these dishes can’t be ordered.`
                    : "Set your ZIP code to see prices and whether we deliver to you."}
                </p>
                <Button className="mt-3 w-full" variant="secondary" onClick={openDialog}>
                  {area.kind === "unserved" ? "Try another ZIP code" : "Check delivery"}
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
