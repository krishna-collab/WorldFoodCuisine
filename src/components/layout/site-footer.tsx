import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/logo";
import { InstallButton } from "@/components/pwa/install";
import { cuisines } from "@/lib/food/data";

const linkClass =
  "inline-flex min-h-10 items-center text-[0.9375rem] font-medium text-fg hover:text-accent";

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <nav aria-label={title}>
      <h2 className="eyebrow font-sans text-subtle">{title}</h2>
      <ul className="mt-3 space-y-1">{children}</ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-sunken">
      <div className="gutter mx-auto grid max-w-[90rem] gap-10 py-14 sm:grid-cols-3 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-sm sm:col-span-3 md:col-span-1">
          <Wordmark />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Dishes from five cuisines to start, each with its story and every ingredient listed.
            Cook them at home, or have them cooked for you once our first kitchen opens.
          </p>
          <InstallButton className="mt-5" />
        </div>
        <Column title="Explore">
          <li>
            <Link to="/menu" className={linkClass}>
              All dishes
            </Link>
          </li>
          {cuisines.map((c) => (
            <li key={c.id}>
              <Link to="/menu/$cuisine" params={{ cuisine: c.id }} className={linkClass}>
                {c.name}
              </Link>
            </li>
          ))}
        </Column>
        <Column title="Cook at home">
          <li>
            <Link to="/cook" className={linkClass}>
              Guided recipes
            </Link>
          </li>
          <li>
            <Link to="/list" className={linkClass}>
              Shopping list
            </Link>
          </li>
          <li>
            <Link to="/saved" className={linkClass}>
              Saved dishes
            </Link>
          </li>
        </Column>
        <Column title="Get it cooked">
          <li>
            <Link to="/delivery" className={linkClass}>
              Where we deliver
            </Link>
          </li>
          <li>
            <Link to="/ingredients" className={linkClass}>
              What’s in our food
            </Link>
          </li>
        </Column>
      </div>
      <div className="border-t border-border">
        <div className="gutter mx-auto flex max-w-[90rem] flex-col gap-2 py-6 text-xs leading-relaxed text-subtle md:flex-row md:justify-between md:gap-8">
          <p className="max-w-3xl">
            We’re not delivering yet; ordering on this site is a demo. Images marked
            “Representative photo” are stock photos and images marked “AI illustration” were
            generated with AI. Neither shows our food. Recipes and allergens are drafts until a
            kitchen confirms them.
          </p>
          <p className="shrink-0">© {new Date().getFullYear()} WorldFoodCuisine</p>
        </div>
      </div>
    </footer>
  );
}
