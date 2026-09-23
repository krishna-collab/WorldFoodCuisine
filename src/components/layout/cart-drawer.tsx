import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cityById, dishById } from "@/lib/food/data";
import { cartCount, cartDelivery, cartSubtotal, useCart } from "@/lib/store/cart";
import { useCity } from "@/lib/store/city";
import { cn, formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const city = cityById(useCity((s) => s.cityId));
  const subtotal = cartSubtotal(items);
  const delivery = cartDelivery(subtotal);
  const total = subtotal + delivery;
  const count = cartCount(items);

  return (
    <div
      className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!open}
      inert={!open ? true : undefined}
    >
      <button
        type="button"
        aria-label="Close bag"
        className={cn(
          "absolute inset-0 bg-bg/70 transition-opacity duration-200 ease-out",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-[var(--shadow-border)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div>
            <p className="font-display text-lg font-semibold">Your bag</p>
            <p className="text-xs text-muted">
              {count} {count === 1 ? "plate" : "plates"} · {city.name}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="font-display text-xl">Bag is empty</p>
              <p className="max-w-xs text-sm text-muted">
                Fifty plates. Five countries. Add something from the line.
              </p>
              <Button asChild variant="secondary">
                <Link to="/menu" onClick={() => setOpen(false)}>
                  Open the menu
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
                    <img
                      src={dish.image}
                      alt=""
                      className="food-frame size-20 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug">{dish.name}</p>
                        <p className="text-sm tabular-nums">{formatPrice(dish.price * item.qty)}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">{dish.localName}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex h-9 items-center rounded-md bg-elevated shadow-[var(--shadow-border)]">
                          <button
                            type="button"
                            className="flex size-9 items-center justify-center text-fg"
                            onClick={() => setQty(item.dishId, item.qty - 1)}
                            aria-label="Decrease"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm tabular-nums">{item.qty}</span>
                          <button
                            type="button"
                            className="flex size-9 items-center justify-center text-fg"
                            onClick={() => setQty(item.dishId, item.qty + 1)}
                            aria-label="Increase"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="text-xs text-muted hover:text-fg"
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
          <div className="border-t border-border p-4">
            <div className="mb-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="tabular-nums text-fg">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Delivery</span>
                <span className="tabular-nums text-fg">
                  {delivery === 0 ? "Free" : formatPrice(delivery)}
                </span>
              </div>
              <div className="flex justify-between pt-1 font-medium">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
            </div>
            <Button asChild className="w-full" size="lg">
              <Link to="/checkout" onClick={() => setOpen(false)}>
                Checkout · {formatPrice(total)}
              </Link>
            </Button>
            <p className="mt-2 text-center text-xs text-subtle">
              {city.hub} · about {city.eta} min · delivery only
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
