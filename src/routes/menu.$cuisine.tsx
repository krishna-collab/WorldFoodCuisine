import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DishCard } from "@/components/food/dish-card";
import { DishImage } from "@/components/food/dish-image";
import {
  courseGroups,
  cuisineById,
  cuisineLang,
  cuisines,
  dishById,
  dishesByCuisine,
  isCuisineId,
  regionLabels,
  signatureIngredients,
} from "@/lib/food/data";
import { imageSrcSet, imageUrl } from "@/lib/food/images";
import { pageHead } from "@/lib/site";

const COVER_SIZES = "(min-width: 1024px) 40vw, 100vw";

export const Route = createFileRoute("/menu/$cuisine")({
  beforeLoad: ({ params }) => {
    if (!isCuisineId(params.cuisine)) throw notFound();
  },
  head: ({ params }) => {
    const cuisine = isCuisineId(params.cuisine) ? cuisineById[params.cuisine] : undefined;
    if (!cuisine) return {};
    const head = pageHead({
      title: `${cuisine.name} (${cuisine.native}): ${dishesByCuisine(cuisine.id).length} dishes`,
      description: cuisine.story,
      path: `/menu/${cuisine.id}`,
    });
    const cover = dishById[cuisine.coverDishId]!.image;
    const preload =
      cover.kind === "placeholder"
        ? []
        : [
            {
              rel: "preload",
              as: "image",
              href: imageUrl(cover.src, 828),
              imageSrcSet: imageSrcSet(cover.src),
              imageSizes: COVER_SIZES,
              fetchPriority: "high",
            },
          ];
    return { ...head, links: [...head.links, ...preload] };
  },
  component: CuisinePage,
});

function CuisinePage() {
  const { cuisine: id } = Route.useParams();
  if (!isCuisineId(id)) return null;
  const cuisine = cuisineById[id];
  const list = dishesByCuisine(id);
  const cover = dishById[cuisine.coverDishId]!;
  const supporting = list.filter((d) => d.id !== cover.id && d.image.kind !== "placeholder").slice(0, 2);
  const signature = signatureIngredients(id);
  const index = cuisines.findIndex((c) => c.id === id);
  const next = cuisines[(index + 1) % cuisines.length]!;

  return (
    <div>
      <section className="mx-auto max-w-[90rem] lg:gutter lg:grid lg:grid-cols-12 lg:gap-12 lg:pt-10">
        <div className="lg:order-2 lg:col-span-7">
          <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr] lg:grid-rows-2">
            <DishImage
              dish={cover}
              priority
              sizes={COVER_SIZES}
              className="aspect-[4/3] sm:aspect-[16/10] lg:row-span-2 lg:aspect-auto lg:h-full lg:min-h-[30rem] lg:rounded-2xl"
              labelPosition="top-left"
            />
            {supporting.map((d) => (
              <DishImage
                key={d.id}
                dish={d}
                sizes="20vw"
                className="hidden aspect-[4/3] rounded-2xl lg:block"
              />
            ))}
          </div>
          <p className="gutter mt-2 text-sm text-muted lg:px-0">
            <span className="font-semibold text-fg">{cover.name}</span>
            {supporting.length ? (
              <span className="hidden lg:inline">
                , {supporting.map((d) => d.name).join(" and ")}
              </span>
            ) : null}
          </p>
        </div>
        <div className="gutter pt-6 pb-4 lg:order-1 lg:col-span-5 lg:px-0 lg:py-4">
          <Link
            to="/menu"
            className="hidden h-10 items-center gap-1.5 rounded-full text-sm font-semibold text-muted hover:text-fg lg:inline-flex"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All dishes
          </Link>
          <p className="eyebrow text-accent lg:mt-4">{regionLabels[cuisine.region]}</p>
          <h1 className="mt-3 text-display-xl">
            {cuisine.name}{" "}
            <span className="block text-display-m text-subtle" lang={cuisineLang[id]}>
              {cuisine.native}
            </span>
          </h1>
          <p className="mt-6 text-lede text-muted">{cuisine.story}</p>
          <p className="mt-6 text-sm text-muted">
            <span className="font-semibold text-fg">Traditions on this menu: </span>
            {cuisine.traditions.join(", ")}
          </p>
        </div>
      </section>

      {signature.length ? (
        <section aria-labelledby="signature" className="gutter mx-auto mt-10 max-w-[90rem]">
          <div className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-hairline)] lg:p-8">
            <h2 id="signature" className="text-display-s">
              Ingredients that recur here
            </h2>
            <p className="mt-1 text-sm text-muted">
              Counted from the {list.length} recipes: what shows up again and again in {cuisine.name}
              ’s dishes and rarely elsewhere on the menu.
            </p>
            <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {signature.map((s) => (
                <li key={s.name} className="flex items-baseline justify-between gap-3 border-b border-border pb-3">
                  <span>
                    <span className="font-semibold">{s.name}</span>
                    {s.gloss ? <span className="block text-sm text-subtle">{s.gloss}</span> : null}
                  </span>
                  <span className="nums shrink-0 text-sm text-muted">
                    {s.dishes} of {list.length}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <div className="gutter mx-auto max-w-[90rem]">
        {courseGroups.map((group) => {
          const items = list.filter((d) => group.courses.includes(d.course));
          if (items.length === 0) return null;
          const gid = `group-${group.label.replace(/\W+/g, "-").toLowerCase()}`;
          return (
            <section key={group.label} aria-labelledby={gid} className="mt-16">
              <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                <h2 id={gid} className="text-display-m">
                  {group.label}
                </h2>
                <span className="nums text-sm text-subtle">{items.length}</span>
              </div>
              <ul className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 min-[100rem]:grid-cols-4">
                {items.map((dish) => (
                  <li key={dish.id} className="flex">
                    <DishCard dish={dish} className="w-full" />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <Link
          to="/menu/$cuisine"
          params={{ cuisine: next.id }}
          className="group mt-20 flex items-center justify-between gap-6 border-y border-border py-8"
        >
          <span>
            <span className="eyebrow block text-subtle">Next cuisine</span>
            <span className="mt-2 block text-display-l group-hover:text-accent">
              {next.name}{" "}
              <span className="text-display-s text-subtle" lang={cuisineLang[next.id]}>
                {next.native}
              </span>
            </span>
          </span>
          <ArrowRight className="size-8 shrink-0 text-accent transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
