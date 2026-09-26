import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LIVE_ZONES, ORDERING_LIVE, hoursLabel } from "@/lib/ordering/zones";
import { pageHead } from "@/lib/site";
import { useAreaStatus, useDeliveryArea } from "@/lib/store/delivery-area";

export const Route = createFileRoute("/delivery")({
  head: () =>
    pageHead({
      title: "Order near me",
      description:
        "Where WorldFoodCuisine delivers. We're not delivering yet; check your ZIP code to see whether we reach you.",
      path: "/delivery",
    }),
  component: DeliveryPage,
});

const STEPS = [
  {
    title: "Enter your ZIP code",
    body: "We check it against the areas a kitchen actually delivers to.",
  },
  {
    title: "See what’s available",
    body: "Prices, delivery fee, tax and delivery time for your area, and which dishes are on.",
  },
  {
    title: "Choose a delivery time",
    body: "As soon as possible while the kitchen is open, or a later window.",
  },
  { title: "Check out", body: "Pay online, then get a confirmation with your order details." },
];

function DeliveryPage() {
  const area = useAreaStatus();
  const openDialog = useDeliveryArea((s) => s.openDialog);
  const setDemo = useDeliveryArea((s) => s.setDemo);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Order near me
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        {ORDERING_LIVE
          ? "Enter your ZIP code to see what we deliver to you."
          : "We’re not delivering anywhere yet. No kitchen is open, so there are no delivery areas, prices or delivery times to show. When that changes, this page will list the real areas we cover."}
      </p>

      <div className="mt-8 rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)]">
        <p className="text-sm text-subtle">Your ZIP code</p>
        <p className="mt-1 font-display text-2xl font-semibold" aria-live="polite">
          {area.kind === "unset"
            ? "Not set"
            : area.kind === "served"
              ? `${area.postalCode}: ${area.zone.demo ? "demo delivery" : `delivering (${area.zone.label})`}`
              : `${area.postalCode}: not delivering here yet`}
        </p>
        <Button size="lg" className="mt-5" onClick={openDialog}>
          <MapPin className="size-4" aria-hidden="true" />
          {area.kind === "unset" ? "Check your ZIP" : "Check another ZIP"}
        </Button>
      </div>

      {LIVE_ZONES.length > 0 ? (
        <section aria-labelledby="areas" className="mt-12">
          <h2 id="areas" className="font-display text-2xl font-semibold tracking-tight">
            Where we deliver
          </h2>
          <ul className="mt-4 space-y-2 text-muted">
            {LIVE_ZONES.map((z) => (
              <li key={z.id}>
                {z.label} · {hoursLabel(z)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="how" className="mt-12">
        <h2 id="how" className="font-display text-2xl font-semibold tracking-tight">
          How ordering will work
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]"
            >
              <p className="text-sm font-medium text-accent tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="demo" className="mt-12 rounded-2xl bg-warn-bg p-6 text-warn-fg">
        <h2 id="demo" className="font-display text-2xl font-semibold tracking-tight">
          Try the ordering flow (demo)
        </h2>
        <p className="mt-2 max-w-2xl leading-relaxed">
          Demo mode treats any ZIP code as a delivery area with example prices, fees and times, so
          you can walk from the menu to checkout. Nothing is sent or charged, and no order is
          placed.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {area.demo ? (
            <Button variant="secondary" onClick={() => setDemo(false)}>
              Turn off demo
            </Button>
          ) : (
            <Button
              onClick={() => {
                setDemo(true);
                openDialog();
              }}
            >
              Turn on demo
            </Button>
          )}
          <Button asChild variant="secondary">
            <Link to="/menu">Browse the menu</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
