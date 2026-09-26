import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BellRing, ChefHat, ListChecks, RefreshCw, Scale, Smartphone, WifiOff } from "lucide-react";
import { DishCard } from "@/components/food/dish-card";
import { DishImage } from "@/components/food/dish-image";
import { InstallButton } from "@/components/pwa/install";
import { Button } from "@/components/ui/button";
import { cookableDishes, dishById, dishes } from "@/lib/food/data";
import { formatDuration } from "@/lib/food/quantity";
import { recipeFor } from "@/lib/food/recipes";
import { pageHead } from "@/lib/site";
import { useCook } from "@/lib/store/cook";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/cook")({
  head: () =>
    pageHead({
      title: "Cook at home: guided recipes",
      description:
        "Guided recipes that cook with you: adjustable servings, ingredient swaps with allergen warnings, timers, a shopping list, and your place saved if you leave.",
      path: "/cook",
    }),
  component: CookIndex,
});

const FEATURES = [
  { icon: Scale, title: "Any number of servings", body: "Every amount rescales, in US cups or metric." },
  { icon: RefreshCw, title: "Swaps that tell the truth", body: "Each swap says what changes, including allergens." },
  { icon: BellRing, title: "Timers side by side", body: "Rest the dough while the tomatoes char." },
  { icon: ListChecks, title: "A shopping list", body: "Grouped by aisle, and it works in the shop offline." },
  { icon: Smartphone, title: "Made for the kitchen", body: "Big buttons, screen stays on, steps read aloud." },
  { icon: WifiOff, title: "Keeps your place", body: "Leave mid-recipe and pick up at the same step." },
];

function CookIndex() {
  const hydrated = useHydrated();
  const sessions = useCook((s) => s.sessions);
  const inProgress = hydrated
    ? Object.values(sessions).filter((s) => s.step >= 0 && dishById[s.dishId] && recipeFor(s.dishId))
    : [];
  const ready = cookableDishes();
  const lead = ready[0];
  const leadRecipe = lead ? recipeFor(lead.id) : undefined;

  return (
    <div className="gutter mx-auto max-w-[90rem] pt-8 lg:pt-12">
      <p className="eyebrow text-herb">Cook it</p>
      <h1 className="mt-3 max-w-3xl text-display-xl">Recipes that cook with you</h1>
      <p className="mt-5 max-w-2xl text-lede text-muted">
        Each guided recipe makes the same dish our menu describes, with the same ingredients. We’re
        writing and testing them one at a time, starting with {lead?.name ?? "our first dish"}.
      </p>

      {inProgress.length ? (
        <section aria-labelledby="continue" className="mt-10">
          <h2 id="continue" className="text-display-s">
            Pick up where you left off
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {inProgress.map((s) => {
              const dish = dishById[s.dishId]!;
              const recipe = recipeFor(s.dishId)!;
              return (
                <li key={s.dishId}>
                  <Link
                    to="/dish/$id/cook"
                    params={{ id: s.dishId }}
                    className="flex items-center gap-4 rounded-2xl bg-herb-soft p-3 pr-5 hover:opacity-90"
                  >
                    <DishImage dish={dish} sizes="80px" label="none" className="size-20 shrink-0 rounded-xl" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-xl">{dish.name}</span>
                      <span className="block text-sm text-muted">
                        {s.step >= recipe.steps.length
                          ? "Finished"
                          : `Step ${s.step + 1} of ${recipe.steps.length}: ${recipe.steps[s.step]?.title}`}
                      </span>
                    </span>
                    <ArrowRight className="size-5 shrink-0 text-herb" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {lead && leadRecipe ? (
        <section aria-labelledby="ready" className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-7">
            <DishImage dish={lead} sizes="(min-width: 1024px) 55vw, 100vw" className="aspect-[4/3] rounded-2xl" priority />
          </div>
          <div className="lg:col-span-5">
            <p className="eyebrow text-subtle">Guided recipe · ready now</p>
            <h2 id="ready" className="mt-3 text-display-l">
              {lead.name}
            </h2>
            <p className="mt-3 text-lede text-muted">{lead.flavor}.</p>
            <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-border py-4 text-sm">
              <div>
                <dt className="text-subtle">Total</dt>
                <dd className="mt-0.5 font-semibold">{formatDuration(leadRecipe.time.total)}</dd>
              </div>
              <div>
                <dt className="text-subtle">Serves</dt>
                <dd className="mt-0.5 font-semibold">{leadRecipe.servings}</dd>
              </div>
              <div>
                <dt className="text-subtle">Level</dt>
                <dd className="mt-0.5 font-semibold">{leadRecipe.difficulty}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="herb" size="xl">
                <Link to="/dish/$id/cook" params={{ id: lead.id }}>
                  <ChefHat className="size-5" aria-hidden="true" />
                  Start cooking
                </Link>
              </Button>
              <Button asChild variant="secondary" size="xl">
                <Link to="/dish/$id" params={{ id: lead.id }}>
                  About the dish
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="how" className="mt-20 border-t border-border pt-12">
        <h2 id="how" className="text-display-m">
          What a guided recipe does
        </h2>
        <ul className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="flex gap-4">
              <f.icon className="size-6 shrink-0 text-herb" strokeWidth={1.75} aria-hidden="true" />
              <span>
                <span className="block font-semibold">{f.title}</span>
                <span className="mt-1 block text-muted">{f.body}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <InstallButton variant="secondary" size="md" label="Install for offline cooking" />
        </div>
      </section>

      <section aria-labelledby="next" className="mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="next" className="text-display-m">
              Everything else, for now
            </h2>
            <p className="mt-2 max-w-2xl text-muted">
              The other {dishes.length - ready.length} dishes list every ingredient but don’t have a
              guided recipe yet. Save the ones you want to cook and they’ll be waiting.
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/menu" search={{ sort: "quickest" }}>
              Quickest dishes first <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <ul className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {["pad-kra-pao", "khao-pad", "chatamari", "burrata-caprese"].map((id) => (
            <li key={id} className="flex">
              <DishCard dish={dishById[id]!} className="w-full" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
