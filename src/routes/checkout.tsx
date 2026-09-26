import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MapPin, WifiOff } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useId, useMemo, useState } from "react";
import { DishImage } from "@/components/food/dish-image";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { allergenLabels, dishById } from "@/lib/food/data";
import type { Allergen, CartItem } from "@/lib/food/types";
import {
  type DeliveryZone,
  deliveryWindows,
  hoursLabel,
  isOpenAt,
  priceSummary,
  timeZoneName,
} from "@/lib/ordering/zones";
import { pageHead } from "@/lib/site";
import { cartSubtotal, useCart } from "@/lib/store/cart";
import { useAreaStatus, useDeliveryArea } from "@/lib/store/delivery-area";
import { makeDemoOrderId, useOrders } from "@/lib/store/orders";
import { useHydrated } from "@/lib/use-hydrated";
import { useOnline } from "@/lib/use-online";
import { formatPrice } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () =>
    pageHead({
      title: "Checkout",
      description: "Review your bag, choose a delivery time and place your order.",
      path: "/checkout",
      noindex: true,
    }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const area = useAreaStatus();
  const openDialog = useDeliveryArea((s) => s.openDialog);

  if (!hydrated) {
    return (
      <Shell>
        <p className="mt-6 text-muted">Loading your bag…</p>
      </Shell>
    );
  }

  if (items.length === 0) {
    return (
      <Notice title="Your bag is empty" body="Add a dish from the menu, then come back here.">
        <Button asChild>
          <Link to="/menu">Browse the menu</Link>
        </Button>
      </Notice>
    );
  }

  if (area.kind === "unset") {
    return (
      <Notice
        title="Where should we deliver?"
        body="Enter your ZIP code first. We’ll tell you whether we deliver there and what it costs."
      >
        <Button onClick={openDialog}>
          <MapPin className="size-4" aria-hidden="true" />
          Check your ZIP
        </Button>
      </Notice>
    );
  }

  if (area.kind === "unserved") {
    return (
      <Notice
        title={`We’re not delivering to ${area.postalCode} yet`}
        body="No kitchen delivers to that ZIP code yet, so this bag can’t be ordered. You can still browse every dish and see exactly what’s in it."
      >
        <Button onClick={openDialog}>Try another ZIP</Button>
        <Button asChild variant="secondary">
          <Link to="/delivery">See how ordering will work</Link>
        </Button>
      </Notice>
    );
  }

  if (!area.zone.demo) {
    // A real zone exists but payment isn't wired up: say so rather than take an order.
    return (
      <Notice
        title="Online ordering isn’t open yet"
        body={`We deliver to ${area.postalCode}, but online payment isn’t connected yet, so orders can’t be placed on the site.`}
      >
        <Button asChild variant="secondary">
          <Link to="/menu">Back to the menu</Link>
        </Button>
      </Notice>
    );
  }

  return <DemoCheckout zone={area.zone} postalCode={area.postalCode} items={items} />;
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Checkout</h1>
      {children}
    </div>
  );
}

function Notice({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:py-24">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 leading-relaxed text-muted">{body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}

type Fields = { name: string; phone: string; street: string; unit: string; notes: string };
type FieldName = "name" | "phone" | "street" | "window";
type Errors = Partial<Record<FieldName, string>>;

const EMPTY: Fields = { name: "", phone: "", street: "", unit: "", notes: "" };

/** Obviously fictional details (555-01xx numbers are reserved for fiction). */
const SAMPLE: Fields = {
  name: "Sample Customer",
  phone: "(555) 555-0100",
  street: "123 Example Street",
  unit: "Apt 4",
  notes: "Sample note: leave it at the door.",
};

function bagAllergens(items: CartItem[]): Allergen[] {
  const found = new Set<Allergen>();
  for (const item of items) for (const a of dishById[item.dishId]?.allergens ?? []) found.add(a);
  return (Object.keys(allergenLabels) as Allergen[]).filter((a) => found.has(a));
}

function DemoCheckout({
  zone,
  postalCode,
  items,
}: {
  zone: DeliveryZone;
  postalCode: string;
  items: CartItem[];
}) {
  const navigate = useNavigate();
  const clear = useCart((s) => s.clear);
  const setCartOpen = useCart((s) => s.setOpen);
  const openDialog = useDeliveryArea((s) => s.openDialog);
  const place = useOrders((s) => s.place);
  const online = useOnline();
  const uid = useId();
  const ids = {
    notice: `${uid}-notice`,
    name: `${uid}-name`,
    phone: `${uid}-phone`,
    street: `${uid}-street`,
    unit: `${uid}-unit`,
    window: `${uid}-window`,
    notes: `${uid}-notes`,
  };

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const windows = useMemo(() => deliveryWindows(zone, now), [zone, now]);
  const [windowValue, setWindowValue] = useState(() => windows[0]?.value ?? "");
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  const summary = priceSummary(cartSubtotal(items), zone);
  const allergens = bagAllergens(items);
  const openNow = isOpenAt(zone, now);

  const set = (key: keyof Fields) => (value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!online) return;
    const current = deliveryWindows(zone, new Date());
    const chosen = current.find((w) => w.value === windowValue);
    const next: Errors = {};
    if (!fields.name.trim()) next.name = "Enter a name for the delivery.";
    if (fields.phone.replace(/\D/g, "").length < 10)
      next.phone = "Enter a phone number with at least 10 digits.";
    if (!fields.street.trim()) next.street = "Enter a street address.";
    if (!chosen) {
      next.window = "That delivery time has passed. Pick another one.";
      setNow(new Date());
      setWindowValue(current[0]?.value ?? "");
    }
    setErrors(next);
    const firstError = (["name", "phone", "street", "window"] as const).find((k) => next[k]);
    if (firstError || !chosen) {
      if (firstError) document.getElementById(ids[firstError])?.focus();
      return;
    }

    const id = makeDemoOrderId();
    place({
      id,
      createdAt: Date.now(),
      postalCode,
      zoneLabel: zone.label,
      window: chosen.label,
      items,
      ...summary,
    });
    clear();
    void navigate({ to: "/order/$id", params: { id } });
  }

  const fieldProps = (name: FieldName) => ({
    id: ids[name],
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${ids[name]}-error` : undefined,
  });

  const error = (name: FieldName) =>
    errors[name] ? (
      <p id={`${ids[name]}-error`} className="mt-1.5 text-sm text-warn-fg">
        {errors[name]}
      </p>
    ) : null;

  return (
    <Shell>
      <section
        aria-labelledby={ids.notice}
        className="mt-6 rounded-2xl bg-warn-bg p-5 text-warn-fg sm:p-6"
      >
        <h2 id={ids.notice} className="font-display text-xl font-semibold tracking-tight">
          This is a demo checkout
        </h2>
        <p className="mt-2 max-w-3xl leading-relaxed">
          We’re not delivering yet. Nothing here is sent to a kitchen, no card is charged and no
          food will arrive. Prices, fees, tax and delivery times are examples. What you type below
          isn’t saved or sent anywhere, so please don’t use your real details.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => {
            setFields(SAMPLE);
            setErrors({});
          }}
        >
          Fill in sample details
        </Button>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
        <aside
          aria-label="Order summary"
          className="h-fit rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] lg:sticky lg:top-24 lg:order-2"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Your order</h2>
            <Button type="button" variant="ghost" size="sm" onClick={() => setCartOpen(true)}>
              Edit bag
            </Button>
          </div>
          <ul className="mt-3 space-y-3">
            {items.map((item) => {
              const dish = dishById[item.dishId];
              if (!dish) return null;
              return (
                <li key={item.dishId} className="flex items-center gap-3 text-sm">
                  <DishImage
                    dish={dish}
                    sizes="56px"
                    label="none"
                    className="size-14 shrink-0 rounded-md"
                  />
                  <span className="min-w-0 flex-1 text-muted">
                    <span className="text-fg">{dish.name}</span>
                    <br />
                    {item.qty} × {formatPrice(dish.price)}
                  </span>
                  <span className="tabular-nums">{formatPrice(dish.price * item.qty)}</span>
                </li>
              );
            })}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd className="tabular-nums text-fg">{formatPrice(summary.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>
                Delivery
                {zone.freeDeliveryOver && summary.delivery > 0
                  ? ` (free over ${formatPrice(zone.freeDeliveryOver)})`
                  : ""}
              </dt>
              <dd className="tabular-nums text-fg">
                {summary.delivery === 0 ? "Free" : formatPrice(summary.delivery)}
              </dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Tax ({Math.round(zone.taxRate * 1000) / 10}%)</dt>
              <dd className="tabular-nums text-fg">{formatPrice(summary.tax)}</dd>
            </div>
            <div className="flex justify-between pt-1 text-base font-medium">
              <dt>Demo total</dt>
              <dd className="tabular-nums">{formatPrice(summary.total)}</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-xl bg-elevated p-4 text-sm leading-relaxed">
            <p className="font-medium">Allergens in this order</p>
            <p className="mt-1 text-muted">
              {allergens.length > 0
                ? allergens.map((a) => allergenLabels[a]).join(", ")
                : "None of the nine major allergens are listed for these dishes."}
            </p>
            <p className="mt-2 text-subtle">
              Recipes are being finalized before launch. Each dish page lists every ingredient.
            </p>
          </div>
        </aside>

        <form onSubmit={onSubmit} noValidate className="space-y-10 lg:order-1">
          <fieldset>
            <legend className="font-display text-xl font-semibold tracking-tight">Delivery</legend>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
              <p className="text-sm">
                <span className="text-muted">Delivering to </span>
                <span className="font-medium">ZIP {postalCode}</span>
                <span className="text-muted"> · {zone.label}</span>
              </p>
              <Button type="button" variant="ghost" size="sm" onClick={openDialog}>
                Change
              </Button>
            </div>
            <div className="mt-5">
              <Label htmlFor={ids.window}>Delivery time</Label>
              {windows.length > 0 ? (
                <Select
                  {...fieldProps("window")}
                  value={windowValue}
                  onChange={(e) => {
                    setWindowValue(e.target.value);
                    setErrors((er) => ({ ...er, window: undefined }));
                  }}
                >
                  {windows.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <p className="text-sm text-muted">
                  No delivery times left today. Try again tomorrow.
                </p>
              )}
              {error("window")}
              <p className="mt-1.5 text-sm text-subtle">
                Kitchen hours {hoursLabel(zone)} ({timeZoneName(zone, now)}).{" "}
                {openNow ? "Open now." : "Closed now, so you can schedule for later."}
              </p>
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display text-xl font-semibold tracking-tight">Contact</legend>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor={ids.name}>Name</Label>
                <Input
                  {...fieldProps("name")}
                  value={fields.name}
                  onChange={(e) => set("name")(e.target.value)}
                  autoComplete="off"
                />
                {error("name")}
              </div>
              <div>
                <Label htmlFor={ids.phone}>Phone</Label>
                <Input
                  {...fieldProps("phone")}
                  type="tel"
                  inputMode="tel"
                  value={fields.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                  autoComplete="off"
                />
                {error("phone")}
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display text-xl font-semibold tracking-tight">Address</legend>
            <div className="mt-4 grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div>
                <Label htmlFor={ids.street}>Street address</Label>
                <Input
                  {...fieldProps("street")}
                  value={fields.street}
                  onChange={(e) => set("street")(e.target.value)}
                  autoComplete="off"
                />
                {error("street")}
              </div>
              <div>
                <Label htmlFor={ids.unit}>Apt, suite or floor (optional)</Label>
                <Input
                  id={ids.unit}
                  value={fields.unit}
                  onChange={(e) => set("unit")(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="mt-5">
              <Label htmlFor={ids.notes}>Notes for the driver (optional)</Label>
              <Textarea
                id={ids.notes}
                value={fields.notes}
                onChange={(e) => set("notes")(e.target.value)}
                placeholder="Gate code, where to leave it"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display text-xl font-semibold tracking-tight">Payment</legend>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              No payment is taken in demo mode, and there’s no card field on purpose.
            </p>
          </fieldset>

          <div>
            {!online ? (
              <p
                role="status"
                className="mb-4 flex items-center gap-2 rounded-xl bg-elevated p-4 text-sm"
              >
                <WifiOff className="size-4 shrink-0" aria-hidden="true" />
                You’re offline. Placing an order needs a connection.
              </p>
            ) : null}
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={!online || windows.length === 0}
            >
              Place demo order · {formatPrice(summary.total)}
            </Button>
            <p className="mt-3 text-sm text-subtle">Nothing is sent or charged.</p>
          </div>
        </form>
      </div>
    </Shell>
  );
}
