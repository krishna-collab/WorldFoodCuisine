import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cities } from "@/lib/food/data";

export const Route = createFileRoute("/partners")({ component: PartnersPage });

const APPS = [
  {
    id: "uber",
    name: "Uber Eats",
    blurb: "Same WorldFoodCuisine kitchen, Uber’s riders. Search us in any live city.",
    href: "https://www.ubereats.com",
  },
  {
    id: "doordash",
    name: "DoorDash",
    blurb: "Full menu on Dash. Useful when your office already has a DoorDash tab open.",
    href: "https://www.doordash.com",
  },
  {
    id: "grubhub",
    name: "Grubhub",
    blurb: "Listed in New York, San Francisco, and Los Angeles first.",
    href: "https://www.grubhub.com",
  },
] as const;

function PartnersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-xs font-medium tracking-widest text-subtle uppercase">Partners</p>
      <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Order here, or where you already tap.
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Our kitchens pack the same lots whether the ticket comes from this site, Uber Eats, DoorDash,
        or Grubhub. Still delivery only — those apps are riders, not a dining room. Direct orders skip
        marketplace fees.
      </p>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {APPS.map((app) => (
          <article key={app.id} className="flex flex-col rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-2xl font-semibold tracking-tight">{app.name}</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{app.blurb}</p>
            <Button asChild variant="secondary" className="mt-6">
              <a href={app.href} target="_blank" rel="noreferrer">
                Open {app.name}
              </a>
            </Button>
          </article>
        ))}
      </div>

      <h2 className="mt-16 font-display text-2xl font-semibold tracking-tight">Where we’re listed</h2>
      <div className="mt-6 overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs tracking-wide text-subtle uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Kitchen</th>
              <th className="px-4 py-3 font-medium">Apps</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">
                  {c.name}, {c.state}
                </td>
                <td className="px-4 py-3 text-muted">{c.hub}</td>
                <td className="px-4 py-3 text-muted">
                  {c.partners
                    .map((p) => APPS.find((a) => a.id === p)?.name)
                    .filter(Boolean)
                    .join(" · ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button asChild className="mt-10" size="lg">
        <Link to="/menu">Order direct — skip the fee</Link>
      </Button>
    </div>
  );
}
