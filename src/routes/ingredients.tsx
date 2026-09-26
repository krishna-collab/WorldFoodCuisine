import { createFileRoute, Link } from "@tanstack/react-router";
import { useId, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { allergenLabels, dishById, dishes, ingredientIndex, normalize } from "@/lib/food/data";
import { KITCHEN_PROMISE, pageHead } from "@/lib/site";

export const Route = createFileRoute("/ingredients")({
  head: () =>
    pageHead({
      title: "What’s in our food",
      description:
        "Olive oil, butter and whole spices; whole, minimally processed ingredients; no preservatives. Every ingredient on the menu and the dishes that use it.",
      path: "/ingredients",
    }),
  component: IngredientsPage,
});

function IngredientsPage() {
  const all = useMemo(() => ingredientIndex(), []);
  const [q, setQ] = useState("");
  const filterId = useId();
  const shown = useMemo(() => {
    const words = normalize(q).split(/\s+/).filter(Boolean);
    return words.length === 0
      ? all
      : all.filter((i) => words.every((w) => normalize(i.name).includes(w)));
  }, [all, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 2xl:max-w-[1536px]">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        What’s in our food
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        You should know what you’re eating. Every dish lists its ingredients component by component,
        including each spice in the blends, the fat it’s cooked in and its allergens.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {KITCHEN_PROMISE.map((p) => (
          <div key={p.title} className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-xl font-semibold tracking-tight">{p.title}</h2>
            <p className="mt-2 leading-relaxed text-muted">{p.body}</p>
          </div>
        ))}
      </div>

      <section aria-labelledby="allergens" className="mt-14 max-w-3xl">
        <h2 id="allergens" className="font-display text-2xl font-semibold tracking-tight">
          Allergens
        </h2>
        <p className="mt-2 leading-relaxed text-muted">
          Each dish lists which of the nine major US allergens it contains:{" "}
          {Object.values(allergenLabels).join(", ")}. Recipes are still being finalized, and
          allergens will be confirmed with the kitchen before any dish goes on sale.
        </p>
      </section>

      <section aria-labelledby="index" className="mt-14">
        <h2 id="index" className="font-display text-2xl font-semibold tracking-tight">
          Every ingredient on the menu
        </h2>
        <p className="mt-2 text-muted">
          {all.length} ingredients across {dishes.length} dishes. Pick one to see the dishes that
          use it.
        </p>
        <div className="mt-5 max-w-md">
          <label htmlFor={filterId} className="sr-only">
            Filter ingredients
          </label>
          <Input
            id={filterId}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter, e.g. timur, ghee, tamarind"
          />
        </div>
        <ul className="mt-6 columns-1 gap-8 sm:columns-2 lg:columns-3 2xl:columns-4">
          {shown.map((ing) => (
            <li key={ing.name} className="break-inside-avoid py-1">
              <Link
                to="/menu"
                search={{ q: ing.name }}
                className="text-fg underline-offset-4 hover:underline"
              >
                {ing.name}
              </Link>{" "}
              <span className="text-sm text-subtle">
                {ing.dishIds.length === 1
                  ? dishById[ing.dishIds[0]!]?.name
                  : `${ing.dishIds.length} dishes`}
              </span>
            </li>
          ))}
        </ul>
        {shown.length === 0 ? <p className="mt-6 text-muted">No ingredient matches that.</p> : null}
      </section>
    </div>
  );
}
