import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { DishCard } from "@/components/food/dish-card";
import { Button } from "@/components/ui/button";
import { cuisineById, dishesByCuisine } from "@/lib/food/data";
import type { CuisineId } from "@/lib/food/types";

export const Route = createFileRoute("/menu/$cuisine")({ component: CuisinePage });

const IDS: CuisineId[] = ["india", "nepal", "thailand", "mexico", "italy"];

function CuisinePage() {
  const { cuisine } = Route.useParams();
  const id = cuisine as CuisineId;
  const meta = IDS.includes(id) ? cuisineById[id] : undefined;

  if (!meta) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Kitchen not on the line</h1>
        <Button asChild className="mt-8">
          <Link to="/menu">See the menu</Link>
        </Button>
      </div>
    );
  }

  const list = dishesByCuisine(id);

  return (
    <div>
      <section className="relative h-72 overflow-hidden sm:h-96">
        <img src={meta.image} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-bg/20" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3">
            <Link to="/menu">
              <ArrowLeft className="size-4" />
              All kitchens
            </Link>
          </Button>
          <p className="text-sm text-muted">{meta.native}</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{meta.name}</h1>
          <p className="mt-2 max-w-xl text-muted">{meta.blurb}</p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">{meta.kitchenNote}</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      </div>
    </div>
  );
}
