import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LIVE_ZONES, ORDERING_LIVE, hoursLabel } from "@/lib/ordering/zones";
import { pageHead } from "@/lib/site";
import { useAreaStatus, useDeliveryArea } from "@/lib/store/delivery-area";

export const Route = createFileRoute("/delivery")({
  head: () =>
    pageHead({
      title: "Get it cooked: where we deliver",
      description:
        "Where WorldFoodCuisine delivers. We're not delivering yet; check your ZIP code, or try the ordering flow in demo mode.",
      path: "/delivery",
    }),
  component: DeliveryPage,
});

const STEPS = [
  { title: "Enter your ZIP code", body: "We check it against the areas a real kitchen delivers to." },
  { title: "See today’s menu", body: "What that kitchen is making, with its prices and any options." },
  { title: "Choose a delivery time", body: "As soon as possible while it’s open, or a later window." },
  { title: "Review, then pay", body: "Every fee, tax and tip before you pay. Then a confirmation and live status." },
];

function DeliveryPage() {
  const area = useAreaStatus();
  const openDialog = useDeliveryArea((s) => s.openDialog);
  const setDemo = useDeliveryArea((s) => s.setDemo);

  return (
    <div className="gutter mx-auto max-w-5xl pt-8 lg:pt-12">
      <p className="eyebrow text-clay">Get it cooked</p>
      <h1 className="mt-3 text-display-xl">
        {ORDERING_LIVE ? "Order near you" : "Not delivering yet"}
      </h1>
      <p className="mt-5 max-w-2xl text-lede text-muted">
        {ORDERING_LIVE
          ? "Enter your ZIP code to see what we deliver to you."
          : "No kitchen is open yet, so there are no delivery areas, real prices or delivery times to show. When the first kitchen opens, this page lists the areas it covers."}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface p-6 shadow-[var(--shadow-hairline)]">
        <div>
          <p className="text-sm text-subtle">Your ZIP code</p>
          <p className="mt-1 text-display-s" aria-live="polite">
            {area.kind === "unset"
              ? "Not set"
              : area.kind === "served"
                ? `${area.postalCode}: ${area.zone.demo ? "demo delivery" : `delivering (${area.zone.label})`}`
                : `${area.postalCode}: not delivering here yet`}
          </p>
        </div>
        <Button size="lg" variant="clay" onClick={openDialog}>
          <MapPin className="size-4" aria-hidden="true" />
          {area.kind === "unset" ? "Check your ZIP" : "Check another ZIP"}
        </Button>
      </div>

      {LIVE_ZONES.length > 0 ? (
        <section aria-labelledby="areas" className="mt-12">
          <h2 id="areas" className="text-display-m">
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

      <section aria-labelledby="demo" className="mt-12 rounded-2xl border border-warn-border bg-warn-bg p-6 text-warn-fg lg:p-8">
        <h2 id="demo" className="text-display-m">
          Try the ordering flow (demo)
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed">
          Demo mode treats any ZIP code as a delivery area with example prices, fees and times, so
          you can go from a dish to a confirmed demo order. Nothing is sent or charged, and no card
          is ever asked for.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {area.demo ? (
            <Button variant="secondary" onClick={() => setDemo(false)}>
              Turn off demo
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                setDemo(true);
                openDialog();
              }}
            >
              Turn on demo
            </Button>
          )}
          <Button asChild variant="secondary">
            <Link to="/menu">
              Browse dishes <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <section aria-labelledby="how" className="mt-16">
        <h2 id="how" className="text-display-m">
          How ordering will work
        </h2>
        <ol className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t-2 border-fg pt-4">
              <p className="nums font-display text-lg text-clay">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-display-s">{step.title}</h3>
              <p className="mt-1 leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="cook-instead" className="mt-16 border-t border-border pt-10">
        <h2 id="cook-instead" className="text-display-s">
          Hungry now?
        </h2>
        <p className="mt-2 max-w-xl text-muted">
          Every dish lists what it’s made of, and our first guided recipe is ready to cook at home.
        </p>
        <Button asChild variant="herb" className="mt-5">
          <Link to="/cook">Cook it yourself</Link>
        </Button>
      </section>
    </div>
  );
}
