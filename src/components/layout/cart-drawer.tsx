import { Link } from "@tanstack/react-router";
import { MapPin, ShoppingBag, Trash2, WifiOff } from "lucide-react";
import { DishImage } from "@/components/food/dish-image";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Stepper } from "@/components/ui/stepper";
import { allergenLabels, dishById } from "@/lib/food/data";
import { describeOptions, menuStatus, priceSummary, unitPrice } from "@/lib/ordering/zones";
import { bagAllergens, cartCount, cartSubtotal, useCart } from "@/lib/store/cart";
import { useAreaStatus, useDeliveryArea } from "@/lib/store/delivery-area";
import { useHydrated } from "@/lib/use-hydrated";
import { useOnline } from "@/lib/use-online";
import { formatPrice } from "@/lib/utils";

/**
 * The bag. Kept on this device, so it survives going offline; prices,
 * availability and delivery times are checked again at checkout.
 */
export function CartDrawer() {
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const rawItems = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const hydrated = useHydrated();
  const online = useOnline();
  const items = hydrated ? rawItems : [];
  const area = useAreaStatus();
  const openDialog = useDeliveryArea((s) => s.openDialog);
  const count = cartCount(items);
  const zone = area.kind === "served" ? area.zone : null;
  const summary = zone ? priceSummary(cartSubtotal(items, zone), zone) : null;
  const unavailable = zone ? items.filter((i) => !menuStatus(dishById[i.dishId]!, zone).available) : [];
  const allergens = bagAllergens(items);

  const footer =
    items.length === 0 ? null : summary && zone ? (
      <div className="space-y-3">
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between text-muted">
            <dt>Subtotal</dt>
            <dd className="nums text-fg">{formatPrice(summary.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Delivery</dt>
            <dd className="nums text-fg">{summary.delivery === 0 ? "Free" : formatPrice(summary.delivery)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Tax</dt>
            <dd className="nums text-fg">{formatPrice(summary.tax)}</dd>
          </div>
          <div className="flex justify-between pt-1 text-base font-semibold">
            <dt>Total before tip{zone.demo ? " (demo)" : ""}</dt>
            <dd className="nums">{formatPrice(summary.total)}</dd>
          </div>
        </dl>
        {!online ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <WifiOff className="size-4 shrink-0" aria-hidden="true" />
            You’re offline. Your bag is saved; checkout needs a connection.
          </p>
        ) : null}
        <Button asChild={online && unavailable.length === 0} size="lg" variant="clay" className="w-full" disabled={!online || unavailable.length > 0}>
          {online && unavailable.length === 0 ? (
            <Link to="/checkout" onClick={() => setOpen(false)}>
              Checkout{zone.demo ? " (demo)" : ""}
            </Link>
          ) : (
            <span>{unavailable.length ? "Remove unavailable dishes to continue" : "Checkout needs a connection"}</span>
          )}
        </Button>
      </div>
    ) : (
      <div className="space-y-3 text-sm text-muted">
        <p>
          {area.kind === "unserved"
            ? `We’re not delivering to ${area.postalCode} yet, so this bag can’t be ordered. It stays saved here.`
            : "Set your ZIP code to see prices and whether we deliver to you. Your bag stays saved here."}
        </p>
        <Button className="w-full" variant="secondary" size="lg" onClick={openDialog}>
          <MapPin className="size-4" aria-hidden="true" />
          {area.kind === "unserved" ? "Try another ZIP code" : "Check delivery"}
        </Button>
      </div>
    );

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title="Your bag"
      description={
        count
          ? `${count} ${count === 1 ? "dish" : "dishes"}${zone ? ` · ZIP ${area.kind === "served" ? area.postalCode : ""}${zone.demo ? " · demo" : ""}` : ""}`
          : undefined
      }
      footer={footer}
    >
      {items.length === 0 ? (
        <div className="flex h-full min-h-60 flex-col items-center justify-center gap-3 text-center">
          <ShoppingBag className="size-10 text-subtle" strokeWidth={1.5} aria-hidden="true" />
          <p className="text-display-s">Your bag is empty</p>
          <p className="max-w-xs text-sm text-muted">
            {zone ? "Add a dish from the menu." : "Ordering starts once a kitchen delivers to your ZIP code."}
          </p>
          <Button asChild variant="secondary">
            <Link to="/menu" onClick={() => setOpen(false)}>
              Browse dishes
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {zone?.demo ? (
            <p className="mb-4 rounded-xl bg-warn-bg px-4 py-3 text-sm text-warn-fg">
              Demo: prices are examples. Nothing is sent or charged.
            </p>
          ) : null}
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const dish = dishById[item.dishId];
              if (!dish) return null;
              const status = zone ? menuStatus(dish, zone) : null;
              const opts = zone ? describeOptions(dish, zone, item.options) : [];
              return (
                <li key={item.key} className="flex gap-3 py-4 first:pt-0">
                  <DishImage dish={dish} sizes="80px" label="none" className="size-20 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="leading-snug font-semibold">
                        <Link to="/dish/$id" params={{ id: dish.id }} onClick={() => setOpen(false)} className="hover:text-accent">
                          {dish.name}
                        </Link>
                      </p>
                      {zone ? (
                        <p className="nums text-sm font-semibold">
                          {formatPrice(unitPrice(dish, zone, item.options) * item.qty)}
                        </p>
                      ) : null}
                    </div>
                    {opts.length ? <p className="text-sm text-muted">{opts.join(" · ")}</p> : null}
                    {status && !status.available ? (
                      <p className="mt-1 text-sm font-semibold text-danger">{status.reason}</p>
                    ) : null}
                    <div className="mt-2 flex items-center gap-1">
                      <Stepper value={item.qty} onChange={(q) => setQty(item.key, q)} min={1} max={20} label={`portions of ${dish.name}`} />
                      <Button variant="ghost" size="icon" onClick={() => remove(item.key)} aria-label={`Remove ${dish.name}`}>
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 rounded-xl bg-sunken p-4 text-sm">
            <p className="font-semibold">Allergens in this bag</p>
            <p className="mt-1 text-muted">
              {allergens.length ? allergens.map((a) => allergenLabels[a]).join(", ") : "None of the nine major allergens."}{" "}
              From our draft recipes; confirmed by the kitchen before anything goes on sale.
            </p>
          </div>
        </>
      )}
    </Sheet>
  );
}
