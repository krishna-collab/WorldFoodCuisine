import { Link, useRouterState } from "@tanstack/react-router";
import { MapPin, Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cartCount, useCart } from "@/lib/store/cart";
import { useAreaStatus, useDeliveryArea } from "@/lib/store/delivery-area";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/menu", label: "Menu" },
  { to: "/ingredients", label: "What’s in our food" },
  { to: "/delivery", label: "Order near me" },
] as const;

function LocationChip({ className }: { className?: string }) {
  const area = useAreaStatus();
  const openDialog = useDeliveryArea((s) => s.openDialog);
  const label =
    area.kind === "unset"
      ? "Set ZIP"
      : area.kind === "served"
        ? `${area.postalCode}${area.zone.demo ? " · demo" : ""}`
        : `${area.postalCode} · not yet`;
  return (
    <button
      type="button"
      onClick={openDialog}
      className={cn(
        "flex h-11 items-center gap-1.5 rounded-md bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
        className,
      )}
      aria-label={area.kind === "unset" ? "Set your ZIP code" : `Delivery area ${label}. Change`}
    >
      <MapPin className="size-4 text-accent" aria-hidden="true" />
      <span className="tabular-nums">{label}</span>
    </button>
  );
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center 2xl:max-w-[1536px] gap-3 px-4 sm:px-6">
        <Link to="/" className="shrink-0" aria-label="WorldFoodCuisine home">
          <Wordmark compact />
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                  active ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LocationChip className="hidden sm:flex" />
          <Button
            variant="secondary"
            size="icon"
            aria-label={count ? `Bag, ${count} ${count === 1 ? "item" : "items"}` : "Bag, empty"}
            onClick={() => setOpen(true)}
            className="relative"
          >
            <ShoppingBag className="size-4" aria-hidden="true" />
            {count > 0 ? (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-accent text-[0.625rem] font-semibold text-accent-fg tabular-nums">
                {count}
              </span>
            ) : null}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <div id="mobile-nav" className="border-t border-border bg-bg px-4 py-4 lg:hidden">
          <nav aria-label="Main" className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex h-12 items-center rounded-md px-3 text-base font-medium text-fg hover:bg-elevated"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <LocationChip className="mt-3 w-full justify-center sm:hidden" />
        </div>
      ) : null}
    </header>
  );
}
