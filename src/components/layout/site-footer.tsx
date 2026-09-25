import { Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/brand/logo";
import { cuisines, dishes } from "@/lib/food/data";
import { KITCHEN_PROMISE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface pb-safe">
      <div className="mx-auto grid max-w-7xl gap-10 2xl:max-w-[1536px] px-4 py-14 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <Wordmark />
          <ul className="mt-5 space-y-2 text-sm leading-relaxed text-muted">
            {KITCHEN_PROMISE.map((p) => (
              <li key={p.title}>
                <span className="font-medium text-fg">{p.title}.</span> {p.body}
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Menu" className="md:col-span-3">
          <p className="text-sm font-medium text-fg">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/menu" className="text-muted hover:text-fg">
                All {dishes.length} dishes
              </Link>
            </li>
            {cuisines.map((c) => (
              <li key={c.id}>
                <Link
                  to="/menu/$cuisine"
                  params={{ cuisine: c.id }}
                  className="text-muted hover:text-fg"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="About" className="md:col-span-4">
          <p className="text-sm font-medium text-fg">Ordering</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/delivery" className="text-muted hover:text-fg">
                Order near me
              </Link>
            </li>
            <li>
              <Link to="/ingredients" className="text-muted hover:text-fg">
                What’s in our food
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-subtle">
            We’re not delivering yet. Photos marked “Representative photo” are stock images of a
            typical version of a dish, not photos of our food. “Photo coming soon” means we haven’t
            photographed that dish yet.
          </p>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-6 2xl:max-w-[1536px] text-xs text-subtle sm:px-6">
          © {new Date().getFullYear()} WorldFoodCuisine
        </p>
      </div>
    </footer>
  );
}
