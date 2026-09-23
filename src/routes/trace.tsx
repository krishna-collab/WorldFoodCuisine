import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cuisines, dishes } from "@/lib/food/data";

export const Route = createFileRoute("/trace")({ component: TracePage });

function TracePage() {
  const lots = dishes.flatMap((d) =>
    d.ingredients.map((ing) => ({
      dish: d.name,
      cuisine: d.cuisine,
      ...ing,
    })),
  );

  return (
    <div>
      <section className="relative overflow-hidden">
        <img src="/food/trace.jpg" alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-bg/80" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-xs font-medium tracking-widest text-primary uppercase">Trace</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Origin spices. American farms. A lot code on the bag.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Kashmiri chili from Shopian. Nixtamal milled in SoMa. Straus cream from Petaluma.
            We do not hide the supply chain behind a “locally sourced” line.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Specialty from origin",
              body: "Saffron, timur, makrut, chilhuacle, pecorino — bought from named co-ops, lot-dated on arrival.",
            },
            {
              title: "Farms in the US",
              body: "Chicken, produce, dairy, and beef from California and partner ranches. The kitchen is American. The recipes are not diluted.",
            },
            {
              title: "Stamped at pack",
              body: "Every bag carries the lots used on that ticket. Open a plate — the same codes are on the dish page.",
            },
          ].map((b) => (
            <article key={b.title} className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <h2 className="font-display text-xl font-semibold tracking-tight">{b.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{b.body}</p>
            </article>
          ))}
        </div>

        <h2 className="mt-16 font-display text-2xl font-semibold tracking-tight">Live lots</h2>
        <p className="mt-2 text-sm text-muted">
          A sample of what is in the kitchens this week. Full lists sit on each plate.
        </p>
        <div className="mt-6 overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-border)]">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-border text-xs tracking-wide text-subtle uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Lot</th>
                <th className="px-4 py-3 font-medium">Ingredient</th>
                <th className="px-4 py-3 font-medium">Origin</th>
                <th className="px-4 py-3 font-medium">Plate</th>
              </tr>
            </thead>
            <tbody>
              {lots.slice(0, 24).map((row) => (
                <tr key={`${row.lot}-${row.dish}`} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium tabular-nums">{row.lot}</td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3 text-muted">
                    {row.origin}, {row.region}
                  </td>
                  <td className="px-4 py-3 text-muted">{row.dish}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {cuisines.map((c) => (
            <Button key={c.id} asChild variant="secondary" size="sm">
              <Link to="/menu/$cuisine" params={{ cuisine: c.id }}>
                {c.name} kitchen
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
