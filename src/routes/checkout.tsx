import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Check, MapPin, Pencil, WifiOff } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { DishImage } from "@/components/food/dish-image";
import { Button } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label, Select, Textarea } from "@/components/ui/input";
import { describeRecord } from "@/lib/food/content";
import { allergenLabels, dishById } from "@/lib/food/data";
import type { CartItem } from "@/lib/food/types";
import {
  type DeliveryZone,
  deliveryWindows,
  describeOptions,
  hoursLabel,
  isOpenAt,
  menuStatus,
  priceSummary,
  timeZoneName,
  unitPrice,
} from "@/lib/ordering/zones";
import { pageHead } from "@/lib/site";
import { bagAllergens, cartSubtotal, useCart } from "@/lib/store/cart";
import { useAreaStatus, useDeliveryArea } from "@/lib/store/delivery-area";
import { makeDemoOrderId, useOrders } from "@/lib/store/orders";
import { useHydrated } from "@/lib/use-hydrated";
import { useOnline } from "@/lib/use-online";
import { cn, formatPrice } from "@/lib/utils";

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
        <div className="mt-8 space-y-3" aria-busy="true">
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-48 rounded-2xl" />
        </div>
      </Shell>
    );
  }

  if (items.length === 0) {
    return (
      <Notice title="Your bag is empty" body="Add a dish from the menu, then come back here.">
        <Button asChild>
          <Link to="/menu">Browse dishes</Link>
        </Button>
      </Notice>
    );
  }

  if (area.kind === "unset") {
    return (
      <Notice
        title="Where should it go?"
        body="Enter your ZIP code first. We’ll tell you whether we deliver there and what it costs. Your bag stays saved."
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
        body="No kitchen delivers to that ZIP code yet, so this bag can’t be ordered. It stays saved on this device."
      >
        <Button onClick={openDialog}>Try another ZIP</Button>
        <Button asChild variant="secondary">
          <Link to="/delivery">How ordering will work</Link>
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
          <Link to="/menu">Back to dishes</Link>
        </Button>
      </Notice>
    );
  }

  return <DemoCheckout zone={area.zone} postalCode={area.postalCode} items={items} />;
}

function Shell({ children, title = "Checkout" }: { children: ReactNode; title?: string }) {
  return (
    <div className="gutter mx-auto max-w-6xl pt-8 lg:pt-12">
      <h1 className="text-display-l" tabIndex={-1} id="checkout-title">
        {title}
      </h1>
      {children}
    </div>
  );
}

function Notice({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <div className="gutter mx-auto max-w-xl py-20 text-center sm:py-24">
      <h1 className="text-display-l">{title}</h1>
      <p className="mt-4 leading-relaxed text-muted">{body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}

type Fields = {
  name: string;
  phone: string;
  street: string;
  unit: string;
  city: string;
  notes: string;
};
type FieldName = "name" | "phone" | "street" | "city" | "window";
type Errors = Partial<Record<FieldName, string>>;

const EMPTY: Fields = { name: "", phone: "", street: "", unit: "", city: "", notes: "" };

/** Obviously fictional details (555-01xx numbers are reserved for fiction). */
const SAMPLE: Fields = {
  name: "Sample Customer",
  phone: "(555) 555-0100",
  street: "123 Example Street",
  unit: "Apt 4",
  city: "Sampletown",
  notes: "Sample note: leave it at the door.",
};

const FIELD_ORDER: FieldName[] = ["window", "street", "city", "name", "phone"];

function Steps({ stage }: { stage: "details" | "review" }) {
  const steps = [
    { id: "details", label: "Delivery details" },
    { id: "review", label: "Review and place" },
  ] as const;
  return (
    <ol className="mt-6 flex items-center gap-3 text-sm font-semibold" aria-label="Checkout steps">
      {steps.map((s, i) => {
        const current = s.id === stage;
        const done = stage === "review" && s.id === "details";
        return (
          <li key={s.id} className="flex items-center gap-3" aria-current={current ? "step" : undefined}>
            {i > 0 ? <span className="h-px w-6 bg-border-strong" aria-hidden="true" /> : null}
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs",
                current ? "bg-primary text-primary-fg" : done ? "bg-herb text-herb-fg" : "bg-sunken text-muted",
              )}
              aria-hidden="true"
            >
              {done ? <Check className="size-4" /> : i + 1}
            </span>
            <span className={current ? "text-fg" : "text-muted"}>
              {s.label}
              {done ? <span className="sr-only"> (done)</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderLines({ items, zone }: { items: CartItem[]; zone: DeliveryZone }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const dish = dishById[item.dishId];
        if (!dish) return null;
        const opts = describeOptions(dish, zone, item.options);
        const price = unitPrice(dish, zone, item.options);
        return (
          <li key={item.key} className="flex items-center gap-3 text-sm">
            <DishImage dish={dish} sizes="56px" label="none" className="size-14 shrink-0 rounded-lg" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{dish.name}</span>
              <span className="block text-muted">
                {item.qty} × {formatPrice(price)}
                {opts.length ? ` · ${opts.join(", ")}` : ""}
              </span>
            </span>
            <span className="nums font-semibold">{formatPrice(price * item.qty)}</span>
          </li>
        );
      })}
    </ul>
  );
}

function PriceLines({
  summary,
  zone,
  tipPercent,
}: {
  summary: ReturnType<typeof priceSummary>;
  zone: DeliveryZone;
  tipPercent: number;
}) {
  return (
    <dl className="space-y-1.5 text-sm">
      <div className="flex justify-between text-muted">
        <dt>Subtotal</dt>
        <dd className="nums text-fg">{formatPrice(summary.subtotal)}</dd>
      </div>
      <div className="flex justify-between text-muted">
        <dt>
          Delivery
          {zone.freeDeliveryOver && summary.delivery > 0 ? ` (free over ${formatPrice(zone.freeDeliveryOver)})` : ""}
        </dt>
        <dd className="nums text-fg">{summary.delivery === 0 ? "Free" : formatPrice(summary.delivery)}</dd>
      </div>
      <div className="flex justify-between text-muted">
        <dt>Tax ({Math.round(zone.taxRate * 1000) / 10}%)</dt>
        <dd className="nums text-fg">{formatPrice(summary.tax)}</dd>
      </div>
      <div className="flex justify-between text-muted">
        <dt>Tip{tipPercent ? ` (${tipPercent}%)` : ""}</dt>
        <dd className="nums text-fg">{summary.tip ? formatPrice(summary.tip) : "None"}</dd>
      </div>
      <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
        <dt>{zone.demo ? "Demo total" : "Total"}</dt>
        <dd className="nums">{formatPrice(summary.total)}</dd>
      </div>
    </dl>
  );
}

function DemoCheckout({ zone, postalCode, items }: { zone: DeliveryZone; postalCode: string; items: CartItem[] }) {
  const navigate = useNavigate();
  const clear = useCart((s) => s.clear);
  const setCartOpen = useCart((s) => s.setOpen);
  const openDialog = useDeliveryArea((s) => s.openDialog);
  const place = useOrders((s) => s.place);
  const online = useOnline();
  const uid = useId();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const ids = {
    name: `${uid}-name`,
    phone: `${uid}-phone`,
    street: `${uid}-street`,
    unit: `${uid}-unit`,
    city: `${uid}-city`,
    window: `${uid}-window`,
    notes: `${uid}-notes`,
    tip: `${uid}-tip`,
  };

  const [stage, setStage] = useState<"details" | "review">("details");
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const windows = useMemo(() => deliveryWindows(zone, now), [zone, now]);
  const [windowValue, setWindowValue] = useState(() => windows[0]?.value ?? "");
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [tipPercent, setTipPercent] = useState(0);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const summary = priceSummary(cartSubtotal(items, zone), zone, tipPercent);
  const allergens = bagAllergens(items);
  const unavailable = items.filter((i) => !menuStatus(dishById[i.dishId]!, zone).available);
  const openNow = isOpenAt(zone, now);
  const chosenWindow = windows.find((w) => w.value === windowValue);
  const anyDraft = items.some((i) => dishById[i.dishId]?.content.allergens.status === "draft");

  const set = (key: keyof Fields) => (value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const goTo = (next: "details" | "review") => {
    setStage(next);
    window.scrollTo({ top: 0 });
    window.setTimeout(() => document.getElementById("checkout-title")?.focus(), 30);
  };

  function validate(): Errors {
    const current = deliveryWindows(zone, new Date());
    const next: Errors = {};
    if (!current.some((w) => w.value === windowValue)) {
      next.window = "That delivery time has passed. Choose another one.";
      setNow(new Date());
      setWindowValue(current[0]?.value ?? "");
    }
    if (!fields.street.trim()) next.street = "Enter a street address.";
    if (!fields.city.trim()) next.city = "Enter a city.";
    if (!fields.name.trim()) next.name = "Enter a name for the delivery.";
    if (fields.phone.replace(/\D/g, "").length < 10) next.phone = "Enter a phone number with at least 10 digits.";
    return next;
  }

  function onContinue(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (FIELD_ORDER.some((k) => next[k])) {
      window.setTimeout(() => errorSummaryRef.current?.focus(), 0);
      return;
    }
    // Re-check prices, availability and delivery times before showing the review.
    setNow(new Date());
    setCheckedAt(new Date());
    goTo("review");
  }

  function onPlace() {
    if (!online) return;
    const next = validate();
    if (Object.values(next).some(Boolean) || unavailable.length) {
      setErrors(next);
      goTo("details");
      return;
    }
    const current = deliveryWindows(zone, new Date());
    const chosen = current.find((w) => w.value === windowValue)!;
    const id = makeDemoOrderId();
    place({
      id,
      createdAt: Date.now(),
      postalCode,
      zoneLabel: zone.label,
      window: chosen.label,
      items,
      ...priceSummary(cartSubtotal(items, zone), zone, tipPercent),
    });
    clear();
    void navigate({ to: "/order/$id", params: { id } });
  }

  const fieldProps = (name: FieldName) => ({
    id: ids[name],
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${ids[name]}-error` : undefined,
  });
  const errorList = FIELD_ORDER.filter((k) => errors[k]);

  const demoNotice = (
    <section aria-label="Demo checkout" className="mt-6 rounded-2xl border border-warn-border bg-warn-bg p-5 text-warn-fg">
      <p className="font-bold">This is a demo checkout.</p>
      <p className="mt-1 max-w-3xl text-sm leading-relaxed">
        We’re not delivering yet. Nothing is sent to a kitchen, nothing is charged and no food will
        arrive. Prices, fees, tax and delivery times are examples. What you type isn’t saved or
        sent, so please don’t use real details.
      </p>
    </section>
  );

  if (stage === "review") {
    return (
      <Shell title="Review your order">
        <Steps stage="review" />
        {demoNotice}
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
          <div className="space-y-8">
            <ReviewBlock title="Delivery" onEdit={() => goTo("details")}>
              <p>{chosenWindow?.label ?? "Choose a delivery time"}</p>
              <p className="text-muted">
                {fields.street}
                {fields.unit ? `, ${fields.unit}` : ""}, {fields.city} {postalCode}
              </p>
              {fields.notes ? <p className="text-muted">Note: {fields.notes}</p> : null}
            </ReviewBlock>
            <ReviewBlock title="Contact" onEdit={() => goTo("details")}>
              <p>{fields.name}</p>
              <p className="text-muted">{fields.phone}</p>
            </ReviewBlock>
            <ReviewBlock title="Your order" onEdit={() => setCartOpen(true)} editLabel="Edit bag">
              <OrderLines items={items} zone={zone} />
              {unavailable.length ? (
                <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-danger">
                  <AlertCircle className="size-4" aria-hidden="true" />
                  {unavailable.map((i) => dishById[i.dishId]!.name).join(", ")} isn’t available. Remove it to continue.
                </p>
              ) : null}
            </ReviewBlock>
            <section aria-labelledby="review-allergens" className="rounded-2xl bg-sunken p-5">
              <h2 id="review-allergens" className="font-sans text-base font-bold">
                Allergens in this order
              </h2>
              <p className="mt-1">
                {allergens.length ? allergens.map((a) => allergenLabels[a]).join(", ") : "None of the nine major allergens."}
              </p>
              <p className="mt-2 text-sm text-muted">
                {anyDraft
                  ? `${describeRecord({ status: "draft", source: "" })}: worked out from our recipes. A real kitchen confirms allergens and shared-equipment risks before taking orders.`
                  : "Confirmed by the kitchen for every dish in this order."}
              </p>
            </section>
          </div>

          <aside aria-label="Payment summary" className="h-fit space-y-5 rounded-2xl bg-surface p-5 shadow-[var(--shadow-hairline)] lg:sticky lg:top-24">
            <PriceLines summary={summary} zone={zone} tipPercent={tipPercent} />
            {checkedAt ? (
              <p className="text-xs text-subtle">
                Prices, availability and delivery times checked at{" "}
                {new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(checkedAt)}.
              </p>
            ) : null}
            <div>
              <p className="text-sm font-semibold">Payment</p>
              <p className="mt-1 text-sm text-muted">
                Demo: no payment is taken, and there’s no card field on purpose.
              </p>
            </div>
            {!online ? (
              <p role="status" className="flex items-center gap-2 rounded-xl bg-sunken p-3 text-sm">
                <WifiOff className="size-4 shrink-0" aria-hidden="true" />
                You’re offline. Placing an order needs a connection.
              </p>
            ) : null}
            <Button
              variant="clay"
              size="xl"
              className="w-full"
              onClick={onPlace}
              disabled={!online || unavailable.length > 0 || windows.length === 0}
            >
              Place demo order · <span className="nums">{formatPrice(summary.total)}</span>
            </Button>
            <p className="text-center text-sm text-subtle">Nothing is sent or charged.</p>
            <Button variant="ghost" className="w-full" onClick={() => goTo("details")}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to details
            </Button>
          </aside>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Steps stage="details" />
      {demoNotice}
      <Button
        type="button"
        variant="warn"
        className="mt-3"
        onClick={() => {
          setFields(SAMPLE);
          setErrors({});
        }}
      >
        Fill in sample details
      </Button>

      {errorList.length ? (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          className="mt-6 rounded-2xl border-2 border-danger bg-surface p-5"
        >
          <p className="flex items-center gap-2 font-bold text-danger">
            <AlertCircle className="size-5" aria-hidden="true" />
            {errorList.length === 1 ? "One thing to fix" : `${errorList.length} things to fix`}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {errorList.map((k) => (
              <li key={k}>
                <a href={`#${ids[k]}`} className="text-link">
                  {errors[k]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
        <aside aria-label="Order summary" className="h-fit space-y-4 rounded-2xl bg-surface p-5 shadow-[var(--shadow-hairline)] lg:sticky lg:top-24 lg:order-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-display-s">Your order</h2>
            <Button type="button" variant="ghost" size="sm" onClick={() => setCartOpen(true)}>
              Edit bag
            </Button>
          </div>
          <OrderLines items={items} zone={zone} />
          <PriceLines summary={summary} zone={zone} tipPercent={tipPercent} />
        </aside>

        <form onSubmit={onContinue} noValidate className="space-y-10 lg:order-1">
          <fieldset>
            <legend className="text-display-s">Delivery</legend>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-hairline)]">
              <p className="text-sm">
                <span className="text-muted">Delivering to </span>
                <span className="font-semibold">ZIP {postalCode}</span>
                <span className="text-muted"> · {zone.label}</span>
              </p>
              <Button type="button" variant="ghost" size="sm" onClick={openDialog}>
                Change ZIP
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
                <p className="text-sm text-muted">No delivery times left today. Try again tomorrow.</p>
              )}
              <FieldError id={`${ids.window}-error`}>{errors.window}</FieldError>
              <FieldHint>
                Kitchen hours {hoursLabel(zone)} ({timeZoneName(zone, now)}).{" "}
                {openNow ? "Open now." : "Closed now, so you can schedule for later."}
              </FieldHint>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div>
                <Label htmlFor={ids.street}>Street address</Label>
                <Input {...fieldProps("street")} value={fields.street} onChange={(e) => set("street")(e.target.value)} autoComplete="off" />
                <FieldError id={`${ids.street}-error`}>{errors.street}</FieldError>
              </div>
              <div>
                <Label htmlFor={ids.unit}>Apt, suite or floor (optional)</Label>
                <Input id={ids.unit} value={fields.unit} onChange={(e) => set("unit")(e.target.value)} autoComplete="off" />
              </div>
              <div>
                <Label htmlFor={ids.city}>City</Label>
                <Input {...fieldProps("city")} value={fields.city} onChange={(e) => set("city")(e.target.value)} autoComplete="off" />
                <FieldError id={`${ids.city}-error`}>{errors.city}</FieldError>
              </div>
              <div>
                <p className="mb-1.5 text-sm font-semibold">ZIP code</p>
                <p className="flex h-12 items-center rounded-lg bg-sunken px-3.5 text-muted">{postalCode}</p>
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
            <legend className="text-display-s">Contact</legend>
            <p className="mt-1 text-sm text-muted">No account needed.</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor={ids.name}>Name</Label>
                <Input {...fieldProps("name")} value={fields.name} onChange={(e) => set("name")(e.target.value)} autoComplete="off" />
                <FieldError id={`${ids.name}-error`}>{errors.name}</FieldError>
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
                <FieldError id={`${ids.phone}-error`}>{errors.phone}</FieldError>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-display-s">Tip for the courier</legend>
            <p className="mt-1 text-sm text-muted">Optional, and you can change it on the next step.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(zone.tipPercents ?? [0]).map((p) => (
                <label
                  key={p}
                  className={cn(
                    "inline-flex h-11 cursor-pointer items-center rounded-full px-5 text-sm font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                    tipPercent === p ? "bg-primary text-primary-fg" : "shadow-[inset_0_0_0_1px_var(--color-border-strong)] hover:bg-sunken",
                  )}
                >
                  <input type="radio" name={ids.tip} value={p} checked={tipPercent === p} onChange={() => setTipPercent(p)} className="sr-only" />
                  {p === 0 ? "No tip" : `${p}% · ${formatPrice(Math.round((summary.subtotal * p) / 100))}`}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" variant="primary" size="xl" disabled={windows.length === 0}>
              Review order
            </Button>
            <p className="text-sm text-subtle">You’ll see everything once more before placing it.</p>
          </div>
        </form>
      </div>
    </Shell>
  );
}

function ReviewBlock({
  title,
  onEdit,
  editLabel = "Edit",
  children,
}: {
  title: string;
  onEdit: () => void;
  editLabel?: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className="border-b border-border pb-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-display-s">{title}</h2>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="size-4" aria-hidden="true" />
          {editLabel}
          <span className="sr-only"> {title.toLowerCase()}</span>
        </Button>
      </div>
      <div className="mt-3 space-y-1">{children}</div>
    </section>
  );
}
