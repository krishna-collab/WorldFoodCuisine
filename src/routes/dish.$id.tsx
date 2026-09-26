import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { DishCard } from "@/components/food/dish-card";
import { DishFacts } from "@/components/food/dish-facts";
import { DishImage } from "@/components/food/dish-image";
import { SaveButton } from "@/components/food/save-button";
import { WhatsInIt } from "@/components/food/whats-in-it";
import { OrderPanel } from "@/components/ordering/order-panel";
import { describeRecord } from "@/lib/food/content";
import {
  courseLabels,
  cuisineById,
  dishById,
  hasDistinctLocalName,
  localNameLang,
  pairingsFor,
  regionLabels,
} from "@/lib/food/data";
import { IMAGE_LABELS, imageSrcSet, imageUrl } from "@/lib/food/images";
import type { Dish } from "@/lib/food/types";
import { pageHead } from "@/lib/site";

const IMAGE_SIZES = "(min-width: 1024px) 55vw, 100vw";

export const Route = createFileRoute("/dish/$id")({
  beforeLoad: ({ params }) => {
    if (!dishById[params.id]) throw notFound();
  },
  head: ({ params }) => {
    const dish = dishById[params.id];
    if (!dish) return {};
    const head = pageHead({
      title: `${dish.name}${hasDistinctLocalName(dish) ? ` (${dish.localName})` : ""}`,
      description: `${dish.flavor}. ${dish.story}`,
      // Share previews use the brand card: a stock photo or AI image there
      // would carry no label and could pass for our food.
      path: `/dish/${dish.id}`,
    });
    const image = dish.image;
    const preload =
      image.kind === "placeholder"
        ? []
        : [
            {
              rel: "preload",
              as: "image",
              href: imageUrl(image.src, 828),
              imageSrcSet: imageSrcSet(image.src),
              imageSizes: IMAGE_SIZES,
              fetchPriority: "high",
            },
          ];
    return { ...head, links: [...head.links, ...preload] };
  },
  component: DishPage,
});

function AboutThisInformation({ dish }: { dish: Dish }) {
  const image = dish.image;
  const rows = [
    { label: "Ingredients", record: dish.content.ingredients },
    { label: "Allergens", record: dish.content.allergens },
    { label: "Story", record: dish.content.story },
    { label: "Flavor notes", record: dish.content.editorial },
  ];
  return (
    <section aria-labelledby="about-info" className="rounded-2xl bg-sunken p-6 lg:p-8">
      <h2 id="about-info" className="text-display-s">
        Where this information comes from
      </h2>
      <dl className="mt-5 grid gap-5 md:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="font-semibold">{row.label}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">
              {describeRecord(row.record)}. {row.record.source}.
            </dd>
          </div>
        ))}
        {image.kind !== "placeholder" ? (
          <div>
            <dt className="font-semibold">
              Image{image.kind !== "own" ? ` · ${IMAGE_LABELS[image.kind].text}` : ""}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">
              {image.kind === "generated"
                ? `An AI-generated illustration of a typical ${dish.name}, not a photo of our food.`
                : image.kind === "representative"
                  ? `A stock photo of a typical ${dish.name}, not a photo of our food. Source and license are still being confirmed.`
                  : "A photo of our own plate."}
              {image.note ? ` ${image.note}` : ""}
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}

function DishPage() {
  const { id } = Route.useParams();
  const dish = dishById[id];
  if (!dish) return null;
  const cuisine = cuisineById[dish.cuisine];
  const pairings = pairingsFor(dish);
  const image = dish.image;

  return (
    <article>
      <div className="mx-auto max-w-[90rem] lg:gutter lg:grid lg:grid-cols-12 lg:gap-12 lg:pt-8">
        {/* Image first on phones (full width), left column on desktop. */}
        <div className="relative lg:col-span-7">
          <div className="relative lg:sticky lg:top-24">
            <DishImage
              dish={dish}
              priority
              sizes={IMAGE_SIZES}
              className="aspect-[4/3] lg:rounded-2xl"
              labelPosition="top-left"
            />
            <SaveButton dish={dish} className="absolute top-3 right-3 z-10" />
            {image.kind !== "placeholder" && image.note ? (
              <p className="gutter mt-2 text-sm text-muted lg:px-0">
                <span className="font-semibold text-fg">About the image: </span>
                {image.note}
              </p>
            ) : null}
          </div>
        </div>

        <div className="gutter pt-5 lg:col-span-5 lg:px-0 lg:pt-2">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
              <li>
                <Link to="/menu" className="inline-flex min-h-6 items-center hover:text-fg">
                  Menu
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <Link
                  to="/menu/$cuisine"
                  params={{ cuisine: dish.cuisine }}
                  className="inline-flex min-h-6 items-center hover:text-fg"
                >
                  {cuisine.name}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li aria-current="page">{courseLabels[dish.course]}</li>
            </ol>
          </nav>
          <h1 className="mt-3 text-display-l">{dish.name}</h1>
          {hasDistinctLocalName(dish) ? (
            <p className="mt-1 text-display-s text-subtle">
              <span lang={localNameLang(dish)} dir="auto">
                {dish.localName}
              </span>
            </p>
          ) : null}
          <p className="mt-4 text-lede text-muted">{dish.flavor}.</p>
          <DishFacts dish={dish} className="mt-4 text-sm" />
          <section
            aria-label={`Order ${dish.name}`}
            className="mt-7 rounded-2xl bg-surface p-5 shadow-[var(--shadow-hairline)] sm:p-6"
          >
            <OrderPanel dish={dish} />
          </section>
        </div>
      </div>

      <div className="gutter mx-auto mt-16 max-w-[90rem] space-y-16 lg:mt-24">
        <section aria-labelledby="story" className="grid gap-6 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-accent">
              {[cuisine.name, dish.tradition].filter(Boolean).join(" · ")}
            </p>
            <h2 id="story" className="mt-3 text-display-m">
              The story
            </h2>
          </div>
          <div className="lg:col-span-8">
            <p className="max-w-3xl font-display text-[1.375rem] leading-relaxed font-normal">
              {dish.story}
            </p>
            <p className="mt-4 text-sm text-subtle">
              {regionLabels[cuisine.region]} · {courseLabels[dish.course]}
            </p>
          </div>
        </section>

        <WhatsInIt dish={dish} />

        {pairings.length ? (
          <section aria-labelledby="pairings">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="pairings" className="text-display-m">
                Round out the meal
              </h2>
              <p className="text-sm text-muted">Other courses from {cuisine.name}</p>
            </div>
            <ul className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {pairings.map((d) => (
                <li key={d.id} className="flex">
                  <DishCard dish={d} className="w-full" />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <AboutThisInformation dish={dish} />
      </div>
    </article>
  );
}
