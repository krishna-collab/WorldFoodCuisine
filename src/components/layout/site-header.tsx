import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Heart, ListChecks, MapPin, Menu, Search, ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { Wordmark } from "@/components/brand/logo";
import { InstallButton } from "@/components/pwa/install";
import { Sheet } from "@/components/ui/sheet";
import { cuisineLang, cuisines, dishesByCuisine } from "@/lib/food/data";
import { cartCount, useCart } from "@/lib/store/cart";
import { useAreaStatus, useDeliveryArea } from "@/lib/store/delivery-area";
import { useSaved } from "@/lib/store/saved";
import { useUi } from "@/lib/store/ui";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/menu", label: "Dishes" },
  { to: "/cook", label: "Cook at home" },
  { to: "/delivery", label: "Get it cooked" },
] as const;

function useActive() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (to: string) => pathname === to || pathname.startsWith(`${to}/`);
}

export function LocationChip({ className }: { className?: string }) {
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
        "flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-fg shadow-[inset_0_0_0_1px_var(--color-border-strong)] hover:bg-sunken",
        className,
      )}
      aria-label={
        area.kind === "unset" ? "Set your ZIP code for delivery" : `Delivery ZIP ${label}. Change`
      }
    >
      <MapPin className="size-4 text-accent" aria-hidden="true" />
      <span className="nums">{label}</span>
    </button>
  );
}

function CuisinesMenu({ active }: { active: boolean }) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        className={cn(
          "flex h-10 items-center gap-1 rounded-full px-3.5 text-sm font-semibold transition-colors data-[state=open]:bg-sunken",
          active ? "text-fg" : "text-muted hover:text-fg",
        )}
      >
        Cuisines
        <ChevronDown className="size-4" aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-50 w-72 rounded-2xl bg-surface p-2 shadow-[var(--shadow-raised),0_0_0_1px_var(--color-border)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {cuisines.map((c) => (
            <DropdownMenu.Item key={c.id} asChild>
              <Link
                to="/menu/$cuisine"
                params={{ cuisine: c.id }}
                className="flex items-baseline justify-between gap-3 rounded-xl px-3 py-2.5 outline-none data-[highlighted]:bg-sunken"
              >
                <span>
                  <span className="font-display text-lg">{c.name}</span>{" "}
                  <span className="text-sm text-subtle" lang={cuisineLang[c.id]}>
                    {c.native}
                  </span>
                </span>
                <span className="nums text-xs text-subtle">{dishesByCuisine(c.id).length}</span>
              </Link>
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-2 h-px bg-border" />
          <p className="px-3 pb-2 text-xs leading-relaxed text-subtle">
            Five cuisines to start. More regions will join as we learn to cook them well.
          </p>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function IconLink({
  to,
  label,
  count,
  children,
  className,
}: {
  to: "/saved" | "/list";
  label: string;
  count?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      aria-label={count ? `${label}, ${count}` : label}
      className={cn(
        "relative flex size-11 items-center justify-center rounded-full text-fg hover:bg-sunken",
        className,
      )}
    >
      {children}
      {count ? (
        <span className="nums absolute top-1 right-1 flex min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] leading-4.5 font-bold text-accent-fg">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function SiteHeader() {
  const isActive = useActive();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = useCart((s) => s.items);
  const setBagOpen = useCart((s) => s.setOpen);
  const savedIds = useSaved((s) => s.ids);
  const openSearch = useUi((s) => s.openSearch);
  const navOpen = useUi((s) => s.navOpen);
  const setNavOpen = useUi((s) => s.setNavOpen);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;
  const saved = hydrated ? savedIds.length : 0;

  useEffect(() => {
    setNavOpen(false);
  }, [pathname, setNavOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/92 backdrop-blur-md supports-[backdrop-filter]:bg-bg/85">
      <div className="gutter mx-auto flex h-14 max-w-[90rem] items-center gap-1 md:h-16">
        <Link to="/" className="mr-2 shrink-0 rounded-md" aria-label="WorldFoodCuisine home">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center lg:flex">
          <Link
            to="/menu"
            aria-current={pathname === "/menu" ? "page" : undefined}
            className={cn(
              "flex h-10 items-center rounded-full px-3.5 text-sm font-semibold",
              pathname === "/menu" ? "text-fg" : "text-muted hover:text-fg",
            )}
          >
            Dishes
          </Link>
          <CuisinesMenu active={pathname.startsWith("/menu/")} />
          {NAV.slice(1).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive(item.to) ? "page" : undefined}
              className={cn(
                "flex h-10 items-center rounded-full px-3.5 text-sm font-semibold",
                isActive(item.to) ? "text-fg" : "text-muted hover:text-fg",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => openSearch()}
            className="hidden h-10 w-56 items-center gap-2 rounded-full bg-surface px-4 text-sm text-subtle shadow-[inset_0_0_0_1px_var(--color-border-strong)] hover:text-fg xl:flex"
          >
            <Search className="size-4" aria-hidden="true" />
            <span className="flex-1 text-left">Search dishes</span>
            <kbd className="rounded border border-border px-1.5 font-sans text-xs">/</kbd>
          </button>
          <button
            type="button"
            onClick={() => openSearch()}
            aria-label="Search dishes"
            className="flex size-11 items-center justify-center rounded-full text-fg hover:bg-sunken xl:hidden"
          >
            <Search className="size-5" aria-hidden="true" />
          </button>
          <LocationChip className="ml-1 hidden md:flex" />
          <IconLink to="/saved" label="Saved dishes" count={saved} className="hidden sm:flex">
            <Heart className="size-5" aria-hidden="true" />
          </IconLink>
          <button
            type="button"
            aria-label={count ? `Bag, ${count} ${count === 1 ? "item" : "items"}` : "Bag, empty"}
            onClick={() => setBagOpen(true)}
            className="relative flex size-11 items-center justify-center rounded-full text-fg hover:bg-sunken"
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            {count > 0 ? (
              <span className="nums absolute top-1 right-1 flex min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] leading-4.5 font-bold text-accent-fg">
                {count}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full text-fg hover:bg-sunken lg:hidden"
            aria-label="Open menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Sheet open={navOpen} onOpenChange={setNavOpen} title="Menu">
        <nav aria-label="Main" className="flex flex-col">
          {[
            { to: "/menu", label: "All dishes" },
            { to: "/cook", label: "Cook at home" },
            { to: "/delivery", label: "Get it cooked" },
            { to: "/ingredients", label: "What’s in our food" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex h-12 items-center rounded-xl px-3 font-display text-xl hover:bg-sunken"
            >
              {item.label}
            </Link>
          ))}
          <p className="eyebrow mt-6 px-3 text-subtle">Cuisines</p>
          <ul className="mt-1">
            {cuisines.map((c) => (
              <li key={c.id}>
                <Link
                  to="/menu/$cuisine"
                  params={{ cuisine: c.id }}
                  className="flex h-11 items-center justify-between rounded-xl px-3 font-semibold hover:bg-sunken"
                >
                  {c.name}
                  <span className="text-sm font-normal text-subtle" lang={cuisineLang[c.id]}>
                    {c.native}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="eyebrow mt-6 px-3 text-subtle">Yours, on this device</p>
          <Link
            to="/saved"
            className="flex h-11 items-center gap-3 rounded-xl px-3 font-semibold hover:bg-sunken"
          >
            <Heart className="size-4" aria-hidden="true" /> Saved dishes
            {saved ? <span className="nums text-sm text-subtle">{saved}</span> : null}
          </Link>
          <Link
            to="/list"
            className="flex h-11 items-center gap-3 rounded-xl px-3 font-semibold hover:bg-sunken"
          >
            <ListChecks className="size-4" aria-hidden="true" /> Shopping list
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2 px-3">
            <LocationChip />
            <InstallButton variant="secondary" size="sm" />
          </div>
        </nav>
      </Sheet>
    </header>
  );
}
