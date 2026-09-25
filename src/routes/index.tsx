import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CookingPot, Droplets, MapPin, Sprout } from "lucide-react";
import { DishCard } from "@/components/food/dish-card";
import { DishImage } from "@/components/food/dish-image";
import { Button } from "@/components/ui/button";
import {
  collections,
  cuisines,
  dishById,
  dishes,
  featuredDishes,
  regionLabels,
} from "@/lib/food/data";
import { KITCHEN_PROMISE, SITE_DESCRIPTION, pageHead } from "@/lib/site";
import { useDeliveryArea } from "@/lib/store/delivery-area";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "World food with nothing to hide",
      description: SITE_DESCRIPTION,
      path: "/",
    }),
  component: Home,
});

const PROMISE_ICONS = [Droplets, CookingPot, Sprout];
const HERO_DISHES = ["butter-chicken", "pad-thai", "margherita"] as const;

function Home() {
  const openDialog = useDeliveryArea((s) => s.openDialog);
  const hero = HERO_DISHES.map((id) => dishById[id]!);

  return (
    <div>
      {/* Hero: text first, food photos beside it, never a full-screen crop. */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:py-20 2xl:max-w-[1536px]">
        <div>
          <p className="rise text-sm font-medium tracking-widest text-accent uppercase">
            5 cuisines · 50 dishes · every ingredient listed
          </p>
          <h1 className="rise rise-2 mt-4 font-display text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.02] font-semibold tracking-tight">
            World food with nothing to hide.
          </h1>
          <p className="rise rise-3 mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Dishes from India, Nepal, Thailand, Mexico and Italy, cooked with olive oil, butter and
            whole spices. Every dish lists what it’s made of, down to the spices in the masala.
          </p>
          <div className="rise rise-4 mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/menu">
                Explore the food
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" onClick={openDialog}>
              <MapPin className="size-4" aria-hidden="true" />
              Order near me
            </Button>
          </div>
          <p className="mt-4 text-sm text-subtle">
            We’re not delivering yet. Check your ZIP code to see if we reach you.
          </p>
        </div>

        <div>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-2 lg:grid-rows-2">
            {hero.map((dish, i) => (
              <Link
                key={dish.id}
                to="/dish/$id"
                params={{ id: dish.id }}
                className={i === 0 ? "lg:row-span-2" : ""}
                aria-label={dish.name}
              >
                <DishImage
                  dish={dish}
                  label="none"
                  priority={i === 0}
                  sizes="(min-width: 1024px) 25vw, 33vw"
                  className={
                    i === 0
                      ? "aspect-square rounded-2xl lg:aspect-auto lg:h-full"
                      : "aspect-square rounded-2xl lg:aspect-[4/3]"
                  }
                />
              </Link>
            ))}
          </div>
          <p className="mt-2 text-xs text-subtle">
            Representative photos: typical versions of these dishes, not photos of our food.
          </p>
        </div>
      </section>

      <section aria-labelledby="promise" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 2xl:max-w-[1536px]">
          <h2 id="promise" className="font-display text-3xl font-semibold tracking-tight">
            What goes into the food
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {KITCHEN_PROMISE.map((p, i) => {
              const Icon = PROMISE_ICONS[i] ?? Sprout;
              return (
                <div key={p.title}>
                  <Icon className="size-6 text-accent" strokeWidth={1.5} aria-hidden="true" />
                  <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
                    {p.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-muted">{p.body}</p>
                </div>
              );
            })}
          </div>
          <Link
            to="/ingredients"
            className="mt-8 inline-flex items-center gap-2 font-medium text-fg underline-offset-4 hover:underline"
          >
            How we list ingredients
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="cuisines"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 2xl:max-w-[1536px]"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="cuisines"
              className="font-display text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Explore five cuisines
            </h2>
            <p className="mt-2 max-w-xl text-muted">
              Ten dishes from each, with the story behind them and everything they’re made of.
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/menu">
              All {dishes.length} dishes
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {cuisines.map((c) => {
            const cover = dishById[c.coverDishId]!;
            return (
              <Link
                key={c.id}
                to="/menu/$cuisine"
                params={{ cuisine: c.id }}
                className="group flex flex-col overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
              >
                <DishImage
                  dish={cover}
                  sizes="(min-width: 1280px) 20vw, (min-width: 640px) 50vw, 100vw"
                  className="aspect-[4/3]"
                  imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs text-subtle">{regionLabels[c.region]}</p>
                  <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                    {c.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{c.blurb}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="collections" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 2xl:max-w-[1536px]">
          <h2 id="collections" className="font-display text-3xl font-semibold tracking-tight">
            Collections
          </h2>
          <p className="mt-2 text-muted">Dishes grouped across the five cuisines.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {collections.map((col) => (
              <Link
                key={col.id}
                to="/menu"
                search={{ collection: col.id }}
                className="rounded-2xl bg-elevated p-5 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
              >
                <h3 className="font-display text-xl font-semibold tracking-tight">{col.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{col.blurb}</p>
                <p className="mt-4 text-sm font-medium text-accent">{col.dishIds.length} dishes</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="picks"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 2xl:max-w-[1536px]"
      >
        <h2 id="picks" className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          A few of the fifty
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredDishes().map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      </section>

      <section aria-labelledby="order" className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between 2xl:max-w-[1536px]">
          <div className="max-w-2xl">
            <h2 id="order" className="font-display text-3xl font-semibold tracking-tight">
              Order near me
            </h2>
            <p className="mt-2 leading-relaxed text-muted">
              We’re not delivering anywhere yet. When a kitchen opens, ordering will start from your
              ZIP code, with real prices, fees and delivery times for your area.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={openDialog}>
              <MapPin className="size-4" aria-hidden="true" />
              Check your ZIP
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/delivery">How ordering works</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
