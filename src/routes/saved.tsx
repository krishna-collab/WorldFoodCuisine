import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, WifiOff } from "lucide-react";
import { DishCard } from "@/components/food/dish-card";
import { InstallButton } from "@/components/pwa/install";
import { Button } from "@/components/ui/button";
import { dishById } from "@/lib/food/data";
import { pageHead } from "@/lib/site";
import { useSaved } from "@/lib/store/saved";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/saved")({
  head: () =>
    pageHead({
      title: "Saved dishes",
      description: "Dishes you saved, kept on this device and available offline.",
      path: "/saved",
      noindex: true,
    }),
  component: SavedPage,
});

function SavedPage() {
  const hydrated = useHydrated();
  const ids = useSaved((s) => s.ids);
  const saved = hydrated ? ids.map((id) => dishById[id]).filter((d) => d !== undefined) : [];

  return (
    <div className="gutter mx-auto max-w-[90rem] pt-8 lg:pt-12">
      <h1 className="text-display-l">Saved dishes</h1>
      <p className="mt-3 flex max-w-2xl items-start gap-2 text-muted">
        <WifiOff className="mt-1 size-4 shrink-0" aria-hidden="true" />
        Kept on this device, so your favorites are one tap from ordering again. Saved dish pages
        also open without a connection.
      </p>
      {!hydrated ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton aspect-[4/3] rounded-xl" />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border-strong px-6 py-12 text-center">
          <Heart className="mx-auto size-10 text-subtle" strokeWidth={1.5} aria-hidden="true" />
          <p className="mt-4 text-display-s">Nothing saved yet</p>
          <p className="mx-auto mt-2 max-w-sm text-muted">
            Tap the heart on any dish to keep it here for your next order.
          </p>
          <Button asChild className="mt-6">
            <Link to="/menu">See the menu</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {saved.map((dish) => (
            <li key={dish.id} className="flex">
              <DishCard dish={dish} className="w-full" />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-10">
        <InstallButton size="md" label="Install the app" />
      </div>
    </div>
  );
}
