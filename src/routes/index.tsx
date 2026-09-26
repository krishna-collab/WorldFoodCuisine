import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChefHat, Droplets, MapPin, Search, Sprout } from "lucide-react";
import { DishCard } from "@/components/food/dish-card";
import { DishImage } from "@/components/food/dish-image";
import { Button } from "@/components/ui/button";
import {
  collections,
  cuisineById,
  cuisineLang,
  cuisines,
  dishById,
  dishes,
  dishesByCuisine,
  featuredDishes,
  regionLabels,
} from "@/lib/food/data";
import { imageSrcSet, imageUrl } from "@/lib/food/images";
import { ORDERING_LIVE } from "@/lib/ordering/zones";
import { KITCHEN_PROMISE, SITE_DESCRIPTION, pageHead } from "@/lib/site";
import { useAreaStatus, useDeliveryArea } from "@/lib/store/delivery-area";
import { useUi } from "@/lib/store/ui";

const HERO_ID = "chicken-momo";
const SPREAD = ["khao-soi", "tacos-al-pastor"] as const;
const HERO_SIZES = "(min-width: 1024px) 40vw, 100vw";

export const Route = createFileRoute("/")({
  head: () => {
    const head = pageHead({
      title: "World food, cooked to order and delivered",
      description: SITE_DESCRIPTION,
      path: "/",
    });
    const hero = dishById[HERO_ID]!.image;
    // Start the hero image download with the HTML: it is the largest paint.
    const preload =
      hero.kind === "placeholder"
        ? []
        : [
            {
              rel: "preload",
              as: "image",
              href: imageUrl(hero.src, 828),
              imageSrcSet: imageSrcSet(hero.src),
              imageSizes: HERO_SIZES,
              fetchPriority: "high",
            },
          ];
    return { ...head, links: [...head.links, ...preload] };
  },
  component: Home,
});

const PROMISE_ICONS = [Droplets, ChefHat, Sprout];

const HOW = [
  {
    title: "Enter your ZIP code",
    body: "It finds the WorldFoodCuisine kitchen that delivers to you. Each kitchen sets its own menu for the day, prices and delivery times.",
  },
  {
    title: "Order from its menu",
    body: "Every dish lists its ingredients and allergens. You see the full price, with delivery, tax and tip, before you place the order.",
  },
  {
    title: "It’s cooked and delivered",
    body: "The kitchen cooks your order and sends it to your door. Our kitchens are delivery-only: there are no dining rooms.",
  },
];

function Home() {
  const openDialog = useDeliveryArea((s) => s.openDialog);
  const area = useAreaStatus();
  const openSearch = useUi((s) => s.openSearch);
  const hero = dishById[HERO_ID]!;

  return (
    <div>
      {/* ── Hero: food first on phones; words beside a three-dish spread on desktop. ── */}
      <section className="mx-auto max-w-[90rem] lg:gutter lg:grid lg:grid-cols-12 lg:gap-10 lg:pt-10">
        <div className="lg:order-2 lg:col-span-7">
          <div className="grid gap-3 lg:grid-cols-[1.55fr_1fr] lg:grid-rows-2">
            <figure className="relative lg:row-span-2 lg:flex lg:flex-col">
              <Link
                to="/dish/$id"
                params={{ id: hero.id }}
                className="block lg:min-h-0 lg:flex-1"
                aria-label={`${hero.name}, ${cuisineById[hero.cuisine].name}`}
              >
                <DishImage
                  dish={hero}
                  priority
                  sizes={HERO_SIZES}
                  className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[28rem] lg:rounded-2xl"
                  labelPosition="top-left"
                />
              </Link>
              <figcaption className="gutter mt-2 text-sm text-muted lg:px-0">
                <span className="font-semibold text-fg">{hero.name}</span> ·{" "}
                {cuisineById[hero.cuisine].name}
              </figcaption>
            </figure>
            {SPREAD.map((id) => {
              const d = dishById[id]!;
              return (
                <figure key={id} className="hidden lg:block">
                  <Link to="/dish/$id" params={{ id }} className="block" aria-label={d.name}>
                    <DishImage dish={d} sizes="22vw" className="aspect-[4/3] rounded-2xl" />
                  </Link>
                  <figcaption className="mt-2 text-sm text-muted">
                    <span className="font-semibold text-fg">{d.name}</span> ·{" "}
                    {cuisineById[d.cuisine].name}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>

        <div className="gutter pt-5 pb-10 lg:order-1 lg:col-span-5 lg:flex lg:flex-col lg:justify-center lg:px-0 lg:py-6">
          <p className="eyebrow hidden text-accent lg:block">
            {dishes.length} dishes · 5 cuisines · delivery only
          </p>
          {/* Fixed line breaks: the headline wraps the same way in the fallback
              serif and in Fraunces, so the font swap doesn't move the page (CLS). */}
          <h1 className="rise text-display-xl lg:mt-5">
            World food,
            <br />
            <span className="text-accent">
              cooked to order
              <br />
              and delivered.
            </span>
          </h1>
          <p className="rise rise-2 mt-4 max-w-md text-lede text-muted">
            Dishes from India, Nepal, Thailand, Mexico and Italy, every ingredient listed. Each
            WorldFoodCuisine kitchen cooks when you order and delivers to your door; there’s no
            dining room.
          </p>
          <div className="rise rise-3 mt-6 grid grid-cols-2 gap-2.5 sm:max-w-md">
            {area.kind === "served" ? (
              <>
                <Button asChild variant="clay" size="xl" className="px-4">
                  <Link to="/menu" search={{ available: true }}>
                    Today’s menu
                  </Link>
                </Button>
                <Button variant="secondary" size="xl" className="px-4" onClick={openDialog}>
                  <MapPin className="size-5" aria-hidden="true" />
                  {area.postalCode}
                  <span className="sr-only">: change ZIP code</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="clay" size="xl" className="px-4" onClick={openDialog}>
                  <MapPin className="size-5" aria-hidden="true" />
                  Find your kitchen
                </Button>
                <Button asChild variant="secondary" size="xl" className="px-4">
                  <Link to="/menu">See the menu</Link>
                </Button>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => openSearch()}
            className="rise rise-4 mt-3 flex h-12 w-full items-center gap-3 rounded-full bg-surface px-5 text-left text-subtle shadow-[inset_0_0_0_1px_var(--color-control)] hover:text-fg sm:max-w-md"
          >
            <Search className="size-5 shrink-0" aria-hidden="true" />
            <span className="truncate">Search by dish or ingredient</span>
          </button>
        </div>
      </section>

      {/* ── How ordering works: a real sequence, so it's numbered. ── */}
      <section aria-labelledby="how" className="border-y border-border bg-surface">
        <div className="gutter mx-auto max-w-[90rem] py-14 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="how" className="max-w-2xl text-display-m">
              From the kitchen near you, to your door
            </h2>
            {!ORDERING_LIVE ? (
              <p className="max-w-sm text-sm leading-relaxed text-muted">
                No kitchen is open yet. Until one is, the whole flow works as a clearly marked demo;
                nothing is sent or charged.
              </p>
            ) : null}
          </div>
          <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {HOW.map((step, i) => (
              <li key={step.title} className="border-t-2 border-fg pt-4">
                <span className="nums font-display text-lg text-accent" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="mt-2 text-display-s">{step.title}</h3>
                <p className="mt-2 max-w-md leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button variant="clay" size="lg" onClick={openDialog}>
              <MapPin className="size-4" aria-hidden="true" />
              Check your ZIP
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/delivery">
                Our kitchens and the demo <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Cuisines as a table of contents, not a card grid. ── */}
      <section aria-labelledby="cuisines" className="gutter mx-auto max-w-[90rem] py-16 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-subtle">Where to start</p>
            <h2 id="cuisines" className="mt-3 text-display-l">
              Five cuisines, ten dishes each
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            A starting collection, not the whole world. More regions will join as we learn to cook
            them well.
          </p>
        </div>
        <ol className="mt-10 border-t border-border">
          {cuisines.map((c, i) => {
            const picks = [c.coverDishId, ...dishesByCuisine(c.id).map((d) => d.id)]
              .filter((id, idx, all) => all.indexOf(id) === idx)
              .slice(0, 3)
              .map((id) => dishById[id]!);
            return (
              <li key={c.id} className="group relative border-b border-border">
                <div className="grid items-center gap-4 py-6 md:grid-cols-[4rem_minmax(0,1.1fr)_minmax(0,1fr)] md:gap-8 lg:py-8">
                  <span className="nums font-display text-lg text-subtle" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-display-m">
                      <Link
                        to="/menu/$cuisine"
                        params={{ cuisine: c.id }}
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-hover:text-accent"
                      >
                        {c.name}
                      </Link>{" "}
                      <span className="text-display-s text-subtle" lang={cuisineLang[c.id]}>
                        {c.native}
                      </span>
                    </h3>
                    <p className="mt-2 max-w-xl leading-relaxed text-muted">{c.blurb}</p>
                    <p className="mt-2 text-sm text-subtle">
                      {regionLabels[c.region]} · {c.traditions.slice(0, 3).join(", ")}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2" aria-hidden="true">
                    {picks.map((d) => (
                      <DishImage key={d.id} dish={d} sizes="12rem" label="none" className="aspect-square rounded-lg" />
                    ))}
                  </div>
                </div>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 inset-y-1 rounded-xl ring-ring group-has-[a:focus-visible]:ring-2"
                />
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-xs text-subtle">
          Images here are labeled on each dish page: AI illustrations and representative stock
          photos, not photos of our food.
        </p>
      </section>

      {/* ── Editorial picks: one lead dish, then a quieter grid. ── */}
      <section aria-labelledby="picks" className="border-t border-border bg-surface">
        <div className="gutter mx-auto max-w-[90rem] py-16 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="picks" className="text-display-l">
              Six to start with
            </h2>
            <Button asChild variant="ghost">
              <Link to="/menu">
                All {dishes.length} dishes <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {featuredDishes().map((dish, i) => (
              <DishCard
                key={dish.id}
                dish={dish}
                variant={i === 0 ? "feature" : "tile"}
                className={i === 0 ? "md:col-span-2 xl:row-span-2" : undefined}
                sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 1280px) 22rem, (min-width: 768px) 45vw, 100vw"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── What goes into the food. ── */}
      <section aria-labelledby="promise" className="gutter mx-auto max-w-[90rem] py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div>
            <p className="eyebrow text-subtle">The kitchen’s promise</p>
            <h2 id="promise" className="mt-3 text-display-l">
              What goes into the food
            </h2>
            <Link to="/ingredients" className="text-link mt-6 inline-flex items-center gap-2 font-semibold">
              Every ingredient on the menu
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ol className="grid gap-8 sm:grid-cols-3">
            {KITCHEN_PROMISE.map((p, i) => {
              const Icon = PROMISE_ICONS[i] ?? Sprout;
              return (
                <li key={p.title} className="border-t-2 border-fg pt-4">
                  <Icon className="size-6 text-accent" strokeWidth={1.5} aria-hidden="true" />
                  <h3 className="mt-4 text-display-s">{p.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{p.body}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── Collections. ── */}
      <section aria-labelledby="collections" className="border-t border-border">
        <div className="gutter mx-auto max-w-[90rem] py-16 lg:py-20">
          <h2 id="collections" className="text-display-m">
            Collections across the cuisines
          </h2>
          <ul className="mt-8 grid gap-x-8 gap-y-2 md:grid-cols-2">
            {collections.map((col) => (
              <li key={col.id}>
                <Link
                  to="/menu"
                  search={{ collection: col.id }}
                  className="group flex items-center gap-4 border-b border-border py-4"
                >
                  <span className="flex -space-x-3" aria-hidden="true">
                    {col.dishIds.slice(0, 3).map((id) => (
                      <DishImage
                        key={id}
                        dish={dishById[id]!}
                        sizes="48px"
                        label="none"
                        className="size-12 rounded-full ring-2 ring-bg"
                      />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-display-s group-hover:text-accent">{col.title}</span>
                    <span className="mt-0.5 block text-sm text-muted">{col.blurb}</span>
                  </span>
                  <span className="nums shrink-0 text-sm text-subtle">{col.dishIds.length}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
