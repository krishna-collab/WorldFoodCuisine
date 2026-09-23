import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AddButton } from "@/components/food/add-button";
import { DishCard } from "@/components/food/dish-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cuisineById, dietLabels, dishById, dishesByCuisine, spiceLabel } from "@/lib/food/data";
import { formatPrice } from "@/lib/utils";

export const Route = createFileRoute("/dish/$id")({ component: DishPage });

function DishPage() {
  const { id } = Route.useParams();
  const dish = dishById[id];

  if (!dish) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Plate not on tonight’s line</h1>
        <Button asChild className="mt-8">
          <Link to="/menu">See the menu</Link>
        </Button>
      </div>
    );
  }

  const cuisine = cuisineById[dish.cuisine];
  const related = dishesByCuisine(dish.cuisine).filter((d) => d.id !== dish.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-6">
        <Link to="/menu/$cuisine" params={{ cuisine: dish.cuisine }}>
          <ArrowLeft className="size-4" />
          {cuisine.name}
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-2">
        <img
          src={dish.image ?? cuisine.image}
          alt={dish.name}
          className="food-frame aspect-[4/3] w-full rounded-2xl object-cover"
        />
        <div>
          <p className="text-xs font-medium tracking-widest text-subtle uppercase">{cuisine.name}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{dish.name}</h1>
          <p className="mt-1 text-muted">{dish.localName}</p>
          <p className="mt-6 text-base leading-relaxed text-muted">{dish.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {dish.tags.map((tag) => (
              <Badge key={tag}>{dietLabels[tag]}</Badge>
            ))}
            <Badge>{spiceLabel[dish.spice]}</Badge>
            <Badge>{dish.calories} kcal</Badge>
            <Badge>{dish.prepMinutes} min</Badge>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <p className="font-display text-3xl font-semibold tabular-nums">{formatPrice(dish.price)}</p>
            <AddButton dishId={dish.id} size="lg" />
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Traceable lots</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Origin spices and specialty goods from named co-ops. Produce, dairy, and meat from US
          partner farms. Every bag is stamped with these lots.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs tracking-wide text-subtle uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Ingredient</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Origin</th>
                <th className="px-4 py-3 font-medium">Lot</th>
              </tr>
            </thead>
            <tbody>
              {dish.ingredients.map((ing) => (
                <tr key={ing.lot} className="border-b border-border last:border-0">
                  <td className="px-4 py-4">
                    <p className="font-medium">{ing.name}</p>
                    <p className="text-xs text-muted sm:hidden">
                      {ing.origin} · {ing.region}
                    </p>
                    <p className="mt-1 text-xs text-subtle">{ing.note}</p>
                  </td>
                  <td className="hidden px-4 py-4 text-muted sm:table-cell">
                    <p>{ing.origin}</p>
                    <p className="text-xs">{ing.region}</p>
                  </td>
                  <td className="px-4 py-4 font-medium tabular-nums">{ing.lot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight">More from {cuisine.name}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((d) => (
              <DishCard key={d.id} dish={d} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
