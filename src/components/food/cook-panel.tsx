import { Link, useNavigate } from "@tanstack/react-router";
import { ChefHat, Clock, Gauge, ListChecks, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/food/quantity";
import { recipeFor } from "@/lib/food/recipes";
import type { Dish } from "@/lib/food/types";
import { useCook } from "@/lib/store/cook";
import { useShoppingList } from "@/lib/store/shopping-list";
import { useHydrated } from "@/lib/use-hydrated";

/** "Cook it" on the dish page: start or resume the guided recipe, or say honestly that it isn't written yet. */
export function CookPanel({ dish }: { dish: Dish }) {
  const recipe = recipeFor(dish.id);
  const hydrated = useHydrated();
  const session = useCook((s) => s.sessions[dish.id]);
  const measure = useCook((s) => s.measure);
  const end = useCook((s) => s.end);
  const addRecipe = useShoppingList((s) => s.addRecipe);
  const navigate = useNavigate();

  if (!recipe) {
    return (
      <div className="space-y-4">
        <p className="text-display-s">Guided recipe coming</p>
        <p className="leading-relaxed text-muted">
          We haven’t written and tested a home recipe for {dish.name} yet. Everything it’s made of
          is listed below, and cooking it at home typically takes about{" "}
          {formatDuration(dish.time.total)}
          {dish.time.note ? `, ${dish.time.note}` : ""}.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="lg">
            <a href="#whats-in-it">See what’s in it</a>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link to="/cook">Recipes you can cook now</Link>
          </Button>
        </div>
      </div>
    );
  }

  const resuming = hydrated && session && session.step >= 0 && session.step < recipe.steps.length;
  const factor = (session?.servings ?? recipe.servings) / recipe.servings;

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
        {[
          { icon: Clock, label: "Total", value: formatDuration(recipe.time.total) },
          { icon: ChefHat, label: "Hands-on", value: formatDuration(recipe.time.active) },
          {
            icon: Users,
            label: "Serves",
            value: `${recipe.servings}${recipe.yields ? ` · ${recipe.yields.amount} ${recipe.yields.noun}` : ""}`,
          },
          { icon: Gauge, label: "Level", value: recipe.difficulty },
        ].map((f) => (
          <div key={f.label}>
            <dt className="flex items-center gap-1 text-subtle">
              <f.icon className="size-3.5" aria-hidden="true" />
              {f.label}
            </dt>
            <dd className="mt-0.5 font-semibold">{f.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="herb" size="xl" className="flex-1 sm:flex-none">
          <Link to="/dish/$id/cook" params={{ id: dish.id }}>
            <ChefHat className="size-5" aria-hidden="true" />
            {resuming ? `Resume at step ${session.step + 1} of ${recipe.steps.length}` : "Start cooking"}
          </Link>
        </Button>
        <Button
          variant="secondary"
          size="xl"
          className="flex-1 sm:flex-none"
          onClick={() => {
            const n = addRecipe(recipe, factor, measure, session?.swaps);
            toast.success(`${n} ingredients added to your shopping list`, {
              action: { label: "Open list", onClick: () => void navigate({ to: "/list" }) },
            });
          }}
        >
          <ListChecks className="size-5" aria-hidden="true" />
          Shopping list
        </Button>
      </div>
      {resuming ? (
        <button
          type="button"
          onClick={() => end(dish.id)}
          className="text-sm font-semibold text-muted underline underline-offset-2 hover:text-fg"
        >
          Start over instead
        </button>
      ) : null}
      <p className="text-sm leading-relaxed text-subtle">
        Scale servings, swap ingredients and run timers as you go. Works offline once opened. Draft
        recipe: not yet test-cooked in our kitchen.
      </p>
    </div>
  );
}
