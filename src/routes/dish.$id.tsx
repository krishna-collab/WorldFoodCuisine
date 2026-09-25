import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AddButton } from "@/components/food/add-button";
import { DishCard } from "@/components/food/dish-card";
import { DishImage } from "@/components/food/dish-image";
import { WhatsInIt } from "@/components/food/whats-in-it";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  courseLabels,
  cuisineById,
  dietLabels,
  dishById,
  dishesByCuisine,
  localNameLang,
  spiceLabel,
} from "@/lib/food/data";
import { pageHead } from "@/lib/site";
import { useAreaStatus } from "@/lib/store/delivery-area";
import { formatPrice } from "@/lib/utils";
import type { Dish } from "@/lib/food/types";

export const Route = createFileRoute("/dish/$id")({
  beforeLoad: ({ params }) => {
    if (!dishById[params.id]) throw notFound();
  },
  head: ({ params }) => {
    const dish = dishById[params.id];
    if (!dish) return {};
    return pageHead({
      title: `${dish.name} (${dish.localName})`,
      description: dish.story,
      // Share previews use the brand card: a stock photo there would carry no
      // "representative photo" label and could pass for our food.
      path: `/dish/${dish.id}`,
    });
  },
  component: DishPage,
});

function Availability({ dish }: { dish: Dish }) {
  const area = useAreaStatus();
  return (
    <div className="mt-8 rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      {area.kind === "served" ? (
        <>
          <p className="font-display text-3xl font-semibold tabular-nums">
            {formatPrice(dish.price)}
            {area.zone.demo ? (
              <span className="ml-2 align-middle text-sm font-normal text-warn-fg">demo price</span>
            ) : null}
          </p>
          <p className="mt-1 text-sm text-muted">
            Delivering to {area.postalCode} in about {area.zone.etaMinutes[0]}–
            {area.zone.etaMinutes[1]} min.
          </p>
        </>
      ) : (
        <>
          <p className="font-medium">
            {area.kind === "unserved"
              ? `Not delivering to ${area.postalCode} yet`
              : "Not on sale yet"}
          </p>
          <p className="mt-1 text-sm text-muted">
            We’re not delivering yet. Prices and delivery times appear once your ZIP code is in a
            delivery area.
          </p>
        </>
      )}
      <AddButton
        dish={dish}
        size="lg"
        withPrice={area.kind === "served"}
        className="mt-4 w-full sm:w-auto"
      />
    </div>
  );
}

function DishPage() {
  const { id } = Route.useParams();
  const dish = dishById[id];
  if (!dish) return null;
  const cuisine = cuisineById[dish.cuisine];
  const related = dishesByCuisine(dish.cuisine)
    .filter((d) => d.id !== dish.id)
    .sort((a, b) => Number(b.image.kind !== "placeholder") - Number(a.image.kind !== "placeholder"))
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-28 sm:px-6 sm:pb-16 2xl:max-w-[1536px]">
      <Button asChild variant="ghost" size="sm" className="-ml-3">
        <Link to="/menu/$cuisine" params={{ cuisine: dish.cuisine }}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          {cuisine.name}
        </Link>
      </Button>

      <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <DishImage
          dish={dish}
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-[4/3] rounded-2xl"
        />
        <div>
          <p className="text-sm text-subtle">
            {[cuisine.name, dish.tradition, courseLabels[dish.course]].filter(Boolean).join(" · ")}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {dish.name}
          </h1>
          <p className="mt-1 text-xl text-muted" lang={localNameLang(dish)} dir="auto">
            {dish.localName}
          </p>
          <p className="mt-6 text-lg leading-relaxed text-muted">{dish.story}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Diet and heat">
            {dish.diet.map((d) => (
              <li key={d}>
                <Badge tone="accent">{dietLabels[d]}</Badge>
              </li>
            ))}
            <li>
              <Badge>{spiceLabel[dish.spice]}</Badge>
            </li>
          </ul>
          <Availability dish={dish} />
        </div>
      </div>

      <WhatsInIt dish={dish} />

      {dish.image.kind === "representative" ? (
        <p className="mt-6 text-sm text-subtle">
          About the photo: a stock image of a typical {dish.name}, not a photo of our food. Source
          and license are still being confirmed.
        </p>
      ) : null}

      <section aria-labelledby="more" className="mt-16">
        <h2 id="more" className="font-display text-2xl font-semibold tracking-tight">
          More from {cuisine.name}
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((d) => (
            <DishCard key={d.id} dish={d} />
          ))}
        </div>
      </section>

      {/* Phones: keep the next step in reach while reading the ingredients. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 px-4 pt-3 pb-safe backdrop-blur-md sm:hidden">
        <AddButton dish={dish} size="lg" withPrice className="w-full" />
      </div>
    </div>
  );
}
