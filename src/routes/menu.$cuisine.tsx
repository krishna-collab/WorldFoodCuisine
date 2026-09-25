import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { DishCard } from "@/components/food/dish-card";
import { DishImage } from "@/components/food/dish-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  cuisineById,
  cuisineLang,
  dishById,
  dishesByCuisine,
  isCuisineId,
  regionLabels,
} from "@/lib/food/data";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/menu/$cuisine")({
  beforeLoad: ({ params }) => {
    if (!isCuisineId(params.cuisine)) throw notFound();
  },
  head: ({ params }) => {
    const cuisine = isCuisineId(params.cuisine) ? cuisineById[params.cuisine] : undefined;
    if (!cuisine) return {};
    return pageHead({
      title: `${cuisine.name} (${cuisine.native}): 10 dishes`,
      description: cuisine.story,
      path: `/menu/${cuisine.id}`,
    });
  },
  component: CuisinePage,
});

function CuisinePage() {
  const { cuisine: id } = Route.useParams();
  if (!isCuisineId(id)) return null;
  const cuisine = cuisineById[id];
  const cover = dishById[cuisine.coverDishId]!;
  const list = dishesByCuisine(id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 2xl:max-w-[1536px]">
      <Button asChild variant="ghost" size="sm" className="-ml-3">
        <Link to="/menu">
          <ArrowLeft className="size-4" aria-hidden="true" />
          All dishes
        </Link>
      </Button>

      <section className="mt-4 grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-sm text-subtle">{regionLabels[cuisine.region]}</p>
          <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
            {cuisine.name}
          </h1>
          <p className="mt-1 text-xl text-muted" lang={cuisineLang[id]}>
            {cuisine.native}
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{cuisine.story}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Traditions on this menu">
            {cuisine.traditions.map((t) => (
              <li key={t}>
                <Badge>{t}</Badge>
              </li>
            ))}
          </ul>
        </div>
        <DishImage
          dish={cover}
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="aspect-[4/3] rounded-2xl"
        />
      </section>

      <h2 className="mt-16 font-display text-3xl font-semibold tracking-tight">
        Ten dishes from {cuisine.name}
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {list.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </div>
  );
}
