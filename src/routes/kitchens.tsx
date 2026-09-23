import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cities } from "@/lib/food/data";
import { useCity } from "@/lib/store/city";

export const Route = createFileRoute("/kitchens")({ component: KitchensPage });

const PARTNER_LABEL = { uber: "Uber Eats", doordash: "DoorDash", grubhub: "Grubhub" } as const;

function KitchensPage() {
  const setCity = useCity((s) => s.setCity);

  return (
    <div>
      <section className="relative overflow-hidden">
        <img src="/food/kitchen.jpg" alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-bg/75" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-xs font-medium tracking-widest text-primary uppercase">
            Delivery kitchens · No dining room
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            We cook here. You never come in.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            No host stand. No tables. No pickup window. These are production kitchens for riders —
            SoMa, Diridon, LIC, Arts District — packing authentic plates for the door.
          </p>
        </div>
      </section>

      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="text-sm text-muted">
            Kitchen addresses are printed for couriers only. Walk-ins are turned away because there
            is nowhere to sit, and nothing to pick up.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          {cities.map((c) => (
            <article
              key={c.id}
              className="flex flex-col rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    {c.name}, {c.state}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{c.hub} · delivery only</p>
                </div>
                <p className="text-sm tabular-nums text-muted">{c.eta} min</p>
              </div>
              <p className="mt-4 text-sm text-muted">
                {c.kitchens} {c.kitchens === 1 ? "kitchen" : "kitchens"} · listed on{" "}
                {c.partners.map((p) => PARTNER_LABEL[p]).join(", ")}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setCity(c.id);
                  }}
                >
                  Deliver here
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link to="/menu">Order the menu</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
