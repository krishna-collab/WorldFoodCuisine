import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChefHat, Clock, Droplets, MapPin, Search, Sprout, Truck, Users } from "lucide-react";
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
import { formatDuration } from "@/lib/food/quantity";
import { recipeFor } from "@/lib/food/recipes";
import { KITCHEN_PROMISE, SITE_DESCRIPTION, pageHead } from "@/lib/site";
import { useDeliveryArea } from "@/lib/store/delivery-area";
import { useUi } from "@/lib/store/ui";

const HERO_ID = "chicken-momo";
const SPREAD = ["khao-soi", "tacos-al-pastor"] as const;
const HERO_SIZES = "(min-width: 1024px) 40vw, 100vw";

export const Route = createFileRoute("/")({
  head: () => {
    const head = pageHead({
      title: "Cook it, or get it cooked",
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

function Home() {
  const openDialog = useDeliveryArea((s) => s.openDialog);
  const openSearch = useUi((s) => s.openSearch);
  const hero = dishById[HERO_ID]!;
  const recipe = recipeFor(HERO_ID)!;

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
              <figcaption className="gutter mt-2 flex items-baseline justify-between gap-3 text-sm text-muted lg:px-0">
                <span>
                  <span className="font-semibold text-fg">{hero.name}</span> ·{" "}
                  {cuisineById[hero.cuisine].name}
                </span>
                <span className="inline-flex items-center gap-1 text-herb">
                  <ChefHat className="size-3.5" aria-hidden="true" /> Guided recipe
                </span>
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
            {dishes.length} dishes · 5 cuisines · every ingredient listed
          </p>
          <h1 className="rise text-display-xl lg:mt-5">
            Cook it, or <span className="text-accent">get it cooked.</span>
          </h1>
          <p className="rise rise-2 mt-4 max-w-md text-lede text-muted">
            Dishes from India, Nepal, Thailand, Mexico and Italy, each with its story and every
            ingredient listed. Make one tonight, or order it once our first kitchen opens.
          </p>
          <div className="rise rise-3 mt-6 grid grid-cols-2 gap-2.5 sm:max-w-md">
            <Button asChild variant="herb" size="xl" className="px-4">
              <Link to="/cook">
                <ChefHat className="size-5" aria-hidden="true" />
                Cook it
              </Link>
            </Button>
            <Button asChild variant="clay" size="xl" className="px-4">
              <Link to="/delivery">
                <Truck className="size-5" aria-hidden="true" />
                Get it cooked
              </Link>
            </Button>
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

      {/* ── The two paths, honestly described. ── */}
      <section aria-labelledby="paths" className="border-y border-border bg-surface">
        <div className="gutter mx-auto max-w-[90rem] py-14 lg:py-20">
          <h2 id="paths" className="max-w-2xl text-display-m">
            One dish, two ways to eat it.
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-0 md:divide-x md:divide-border">
            <div className="md:pr-10">
              <p className="eyebrow text-herb">Cook it · available now</p>
              <h3 className="mt-3 text-display-s">A recipe that cooks with you</h3>
              <p className="mt-3 max-w-lg leading-relaxed text-muted">
                Scale the servings, swap what you can’t find (with a warning when a swap changes
                an allergen), run timers side by side and tick off a shopping list in the shop. It
                keeps your place if you leave. The first guided recipe is {hero.name}; more are
                being written and tested.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild variant="herb" size="lg">
                  <Link to="/dish/$id/cook" params={{ id: hero.id }}>
                    Cook {hero.name}
                  </Link>
                </Button>
                <p className="flex items-center gap-4 text-sm text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-4" aria-hidden="true" /> {formatDuration(recipe.time.total)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-4" aria-hidden="true" /> Serves {recipe.servings}
                  </span>
                </p>
              </div>
            </div>
            <div className="md:pl-10">
              <p className="eyebrow text-clay">Get it cooked · not yet</p>
              <h3 className="mt-3 text-display-s">Ordering starts with your ZIP code</h3>
              <p className="mt-3 max-w-lg leading-relaxed text-muted">
                No kitchen is open yet, so we don’t deliver anywhere. When one opens, you’ll see
                what it is making today, the full price with fees and tax, and real delivery
                windows before you pay. Until then, the whole flow works as a clearly marked demo.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="secondary" size="lg" onClick={openDialog}>
                  <MapPin className="size-4" aria-hidden="true" />
                  Check your ZIP
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link to="/delivery">
                    Try the demo <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
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
