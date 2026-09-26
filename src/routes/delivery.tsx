import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dishById } from "@/lib/food/data";
import {
  DEMO_KITCHENS,
  type DeliveryZone,
  hoursLabel,
  LIVE_ZONES,
  ORDERING_LIVE,
  timeZoneName,
} from "@/lib/ordering/zones";
import { pageHead } from "@/lib/site";
import { useAreaStatus, useDeliveryArea } from "@/lib/store/delivery-area";
import { cn, formatPrice } from "@/lib/utils";

export const Route = createFileRoute("/delivery")({
  head: () =>
    pageHead({
      title: "Locations: our delivery-only kitchens",
      description:
        "WorldFoodCuisine kitchens are delivery-only: each cooks to order and delivers to its own area, with its own menu for the day. No kitchen is open yet; try ordering in demo mode.",
      path: "/delivery",
    }),
  component: LocationsPage,
});

/** One kitchen: where it delivers, when, and what it charges. */
function KitchenCard({ zone, current }: { zone: DeliveryZone; current: boolean }) {
  const soldOut = Object.keys(zone.unavailable ?? {}).map((id) => dishById[id]?.name).filter(Boolean);
  const localPrices = Object.entries(zone.priceOverrides ?? {}).flatMap(([id, cents]) => {
    const dish = dishById[id];
    return dish ? [`${dish.name} ${formatPrice(cents)} (menu ${formatPrice(dish.price)})`] : [];
  });
  return (
    <li
      className={cn(
        "rounded-2xl bg-surface p-5 shadow-[var(--shadow-hairline)] sm:p-6",
        current && "shadow-[inset_0_0_0_2px_var(--color-accent)]",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-display-s">{zone.label}</h3>
        {/* Always in the layout, shown once the visitor's ZIP is known: no shift. */}
        <span className={cn("text-sm font-semibold text-accent", !current && "invisible")} aria-hidden={!current}>
          Delivers to you
        </span>
      </div>
      <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold">Delivers to</dt>
          <dd className="text-muted">{zone.areaLabel}</dd>
        </div>
        <div>
          <dt className="font-semibold">Hours</dt>
          <dd className="text-muted">
            {hoursLabel(zone)} ({timeZoneName(zone)})
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Delivery</dt>
          <dd className="text-muted">
            {formatPrice(zone.deliveryFee)}
            {zone.freeDeliveryOver ? `, free over ${formatPrice(zone.freeDeliveryOver)}` : ""} · about{" "}
            {zone.etaMinutes[0]}–{zone.etaMinutes[1]} min
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Not on today’s menu</dt>
          <dd className="text-muted">{soldOut.length ? soldOut.join(", ") : "Everything is on"}</dd>
        </div>
        {localPrices.length ? (
          <div className="sm:col-span-2">
            <dt className="font-semibold">Local prices</dt>
            <dd className="text-muted">{localPrices.join("; ")}</dd>
          </div>
        ) : null}
      </dl>
    </li>
  );
}

function LocationsPage() {
  const area = useAreaStatus();
  const openDialog = useDeliveryArea((s) => s.openDialog);
  const setDemo = useDeliveryArea((s) => s.setDemo);
  const setPostalCode = useDeliveryArea((s) => s.setPostalCode);
  const currentId = area.kind === "served" ? area.zone.id : null;

  const tryZip = (zip: string) => {
    setDemo(true);
    setPostalCode(zip);
  };

  return (
    <div className="gutter mx-auto max-w-5xl pt-8 lg:pt-12">
      <p className="eyebrow text-accent">Locations</p>
      {/* A fixed line break keeps the fallback font and Fraunces on the same lines (no shift on swap). */}
      <h1 className="mt-3 text-display-xl">
        {ORDERING_LIVE ? (
          "Our kitchens"
        ) : (
          <>
            No kitchen
            <br />
            is open yet
          </>
        )}
      </h1>
      <p className="mt-5 max-w-2xl text-lede text-muted">
        WorldFoodCuisine is delivery-only. Every location is a kitchen with no dining room that
        cooks to order and delivers to the ZIP codes around it, with its own menu for the day, hours
        and delivery fee.
        {ORDERING_LIVE ? "" : " The first one hasn’t opened; when it does, it’s listed here with the area it covers."}
      </p>

      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-surface p-6 shadow-[var(--shadow-hairline)] sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-subtle">Your ZIP code</p>
          <p className="mt-1 text-display-s" aria-live="polite">
            {area.kind === "unset"
              ? "Not set"
              : area.kind === "served"
                ? `${area.postalCode}: ${area.zone.label}`
                : `${area.postalCode}: no kitchen delivers here yet`}
          </p>
        </div>
        <Button size="lg" variant="clay" onClick={openDialog}>
          <MapPin className="size-4" aria-hidden="true" />
          {area.kind === "unset" ? "Find your kitchen" : "Check another ZIP"}
        </Button>
      </div>

      {LIVE_ZONES.length > 0 ? (
        <section aria-labelledby="kitchens" className="mt-12">
          <h2 id="kitchens" className="text-display-m">
            Where we deliver
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {LIVE_ZONES.map((z) => (
              <KitchenCard key={z.id} zone={z} current={z.id === currentId} />
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="demo" className="mt-12 rounded-2xl border border-warn-border bg-warn-bg p-6 text-warn-fg lg:p-8">
        <h2 id="demo" className="text-display-m">
          Try ordering in demo mode
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed">
          Two example kitchens show how ordering works across locations: the ZIP code picks the
          kitchen, and each has its own menu for the day, prices, hours and fees. Nothing is sent or
          charged, and no card is ever asked for.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => tryZip("95112")}>
            Try ZIP 95112
          </Button>
          <Button variant="primary" onClick={() => tryZip("10001")}>
            Try ZIP 10001
          </Button>
          <Button asChild variant="secondary">
            <Link to="/menu">
              See the menu <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <ul className="mt-8 grid gap-4 text-fg md:grid-cols-2">
          {DEMO_KITCHENS.map((z) => (
            <KitchenCard key={z.id} zone={z} current={z.id === currentId} />
          ))}
        </ul>
      </section>
    </div>
  );
}
