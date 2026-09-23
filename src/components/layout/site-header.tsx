import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cities, cityById } from "@/lib/food/data";
import { cartCount, useCart } from "@/lib/store/cart";
import { useCity } from "@/lib/store/city";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/menu", label: "Menu" },
  { to: "/kitchens", label: "Kitchens" },
  { to: "/trace", label: "Trace" },
  { to: "/partners", label: "Partners" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const cityId = useCity((s) => s.cityId);
  const setCity = useCity((s) => s.setCity);
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;
  const city = cityById(cityId);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:h-[4.5rem] sm:px-6">
        <Link to="/" className="shrink-0" onClick={() => setMenuOpen(false)}>
          <Wordmark compact />
        </Link>
        <span className="hidden shrink-0 rounded-full bg-elevated px-2.5 py-1 text-xs font-medium text-muted shadow-[var(--shadow-border)] md:inline">
          Delivery only
        </span>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                pathname === item.to || pathname.startsWith(`${item.to}/`)
                  ? "text-fg"
                  : "text-muted hover:text-fg",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <label className="sr-only" htmlFor="city">
            Delivery city
          </label>
          <select
            id="city"
            value={hydrated ? cityId : "sf"}
            onChange={(e) => setCity(e.target.value)}
            className="hidden h-11 max-w-40 rounded-md bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)] outline-none sm:block"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            size="icon"
            aria-label={count ? `Bag, ${count} ${count === 1 ? "item" : "items"}` : "Bag"}
            onClick={() => setOpen(true)}
            className="relative"
          >
            <ShoppingBag className="size-4" />
            {count > 0 ? (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[0.625rem] font-semibold text-primary-fg tabular-nums">
                {count}
              </span>
            ) : null}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-border bg-bg px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="flex h-11 items-center rounded-md px-3 text-sm font-medium text-fg hover:bg-elevated"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <label className="mt-4 mb-1.5 block text-xs text-muted" htmlFor="city-m">
            Delivering to
          </label>
          <select
            id="city-m"
            value={hydrated ? cityId : "sf"}
            onChange={(e) => setCity(e.target.value)}
            className="h-11 w-full rounded-md bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)]"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}, {c.state}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-subtle">
            {city.hub} · {city.eta} min
          </p>
        </div>
      ) : null}
    </header>
  );
}
