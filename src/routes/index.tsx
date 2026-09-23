import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bike, ChefHat, Clock3, Leaf, MapPinned, Package } from "lucide-react";
import { DishCard } from "@/components/food/dish-card";
import { Button } from "@/components/ui/button";
import { cities, cityById, cuisines, featuredDishes } from "@/lib/food/data";
import { useCity } from "@/lib/store/city";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const cityId = useCity((s) => s.cityId);
  const hydrated = useHydrated();
  const city = cityById(hydrated ? cityId : "sf");
  const featured = featuredDishes();

  return (
    <div>
      <section className="relative min-h-[88dvh] overflow-hidden">
        <img
          src="/food/hero.jpg"
          alt="WorldFoodCuisine kitchen line"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/75 to-bg/30" />
        <div className="relative mx-auto flex min-h-[88dvh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20">
          <p className="rise text-xs font-medium tracking-widest text-primary uppercase">
            We cook · Delivery only · No dining room
          </p>
          <h1 className="rise rise-2 mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight text-fg sm:text-6xl sm:leading-[1.05]">
            A kitchen. Not a restaurant.
          </h1>
          <p className="rise rise-3 mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Fifty authentic plates from India, Nepal, Thailand, Mexico, and Italy — cooked in our
            kitchens, packed with named lots, sent to the door. No tables. No walk-in. SF, San Jose,
            and ten more cities.
          </p>
          <div className="rise rise-4 mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/menu">
                Order delivery
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/kitchens">See the kitchens</Link>
            </Button>
            <p className="w-full text-sm text-muted sm:ml-2 sm:w-auto">
              {city.name} · {city.hub} · about {city.eta} min to the door
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              n: "01",
              icon: ChefHat,
              title: "We cook",
              body: "Five authentic lines on one pass. Tandoor, momo, wok, nixtamal, fire.",
            },
            {
              n: "02",
              icon: Package,
              title: "We pack",
              body: "Sealed bags, lot-stamped. Built to travel — not to sit on a table.",
            },
            {
              n: "03",
              icon: Bike,
              title: "We deliver",
              body: "Our kitchen, a rider, your door. No host stand. No pickup window.",
            },
            {
              n: "04",
              icon: MapPinned,
              title: "You don't come in",
              body: "Addresses are for riders. The dining room does not exist — on purpose.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-bg px-6 py-10">
              <p className="text-xs tabular-nums text-subtle">{item.n}</p>
              <item.icon className="mt-4 size-5 text-primary" strokeWidth={1.5} />
              <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-px sm:grid-cols-3">
          {[
            {
              icon: Leaf,
              title: "Named origins",
              body: "Every spice, farm, and mill is on the ticket. Lot codes you can actually read.",
            },
            {
              icon: Clock3,
              title: "Hub lunch money",
              body: "Weekday plates from $8.90. The desk order that replaces walking out for lunch.",
            },
            {
              icon: MapPinned,
              title: "Twelve US cities",
              body: "Same menu, same lots, same delivery promise — starting in SF and San Jose.",
            },
          ].map((item) => (
            <div key={item.title} className="px-6 py-10">
              <item.icon className="size-5 text-primary" strokeWidth={1.5} />
              <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-widest text-subtle uppercase">The line</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Five countries. Ten plates each.
            </h2>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/menu">
              Full menu
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cuisines.map((c) => (
            <Link
              key={c.id}
              to="/menu/$cuisine"
              params={{ cuisine: c.id }}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]"
            >
              <img
                src={c.image}
                alt=""
                className="food-frame size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-xs text-muted">{c.native}</p>
                <p className="font-display text-2xl font-semibold tracking-tight">{c.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{c.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-widest text-subtle uppercase">Kitchen picks</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              What the pass is sending tonight.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((dish) => (
              <DishCard key={dish.id} dish={dish} large />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-medium tracking-widest text-subtle uppercase">The hub box</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for SoMa, Diridon, and every floor that forgot to cook.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Weekday lunch 11:00–14:30. You order. We cook. A rider hits the lobby. No restaurant wait,
            no walking down the block — and you can still tap Uber Eats or DoorDash if that tab is
            already open.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-muted">
            <li>Delivery only — there is no pickup</li>
            <li>Hub lunch tags from $8.90–$14.90</li>
            <li>Free delivery over $35 · twelve cities</li>
          </ul>
          <Button asChild className="mt-8" size="lg">
            <Link to="/menu">
              Order the hub lunch
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <img
          src="/food/kitchen.jpg"
          alt="Dispatch kitchen at dusk"
          className="food-frame aspect-[4/3] w-full rounded-2xl object-cover"
        />
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-xs font-medium tracking-widest text-subtle uppercase">Cities</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">Live kitchens</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Ghost kitchens. Riders welcome. Guests are not — there is nowhere to sit.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((c) => (
              <Link
                key={c.id}
                to="/kitchens"
                className="flex items-center justify-between rounded-xl bg-surface px-4 py-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
              >
                <div>
                  <p className="font-medium">
                    {c.name}, {c.state}
                  </p>
                  <p className="text-xs text-muted">{c.hub}</p>
                </div>
                <p className="text-sm tabular-nums text-muted">{c.eta} min</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
