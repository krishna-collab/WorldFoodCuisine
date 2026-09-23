import { Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Wordmark />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Fifty authentic plates from five kitchens. We cook, we pack, we deliver — no restaurant,
            no walk-in. Named farms. Twelve US cities.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-widest text-subtle uppercase">Kitchen</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/menu" className="text-muted hover:text-fg">
                Full menu
              </Link>
            </li>
            <li>
              <Link to="/trace" className="text-muted hover:text-fg">
                Ingredient lots
              </Link>
            </li>
            <li>
              <Link to="/kitchens" className="text-muted hover:text-fg">
                Cities
              </Link>
            </li>
            <li>
              <Link to="/partners" className="text-muted hover:text-fg">
                Uber Eats & DoorDash
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium tracking-widest text-subtle uppercase">Service</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>Delivery only — no dining room</li>
            <li>No walk-in · no pickup</li>
            <li>Lunch 11:00–14:30</li>
            <li>Dinner 17:00–22:00</li>
            <li>Free over $35</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} WorldFoodCuisine. Delivery kitchens, USA.</p>
          <p>Origin spices. American farms. One ticket.</p>
        </div>
      </div>
    </footer>
  );
}
