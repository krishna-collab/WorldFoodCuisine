import { allergenLabels, dietLabels, spiceLabel } from "@/lib/food/data";
import type { Dish } from "@/lib/food/types";

/** "Timur (Nepali Sichuan pepper)" → name plus a quieter gloss. */
function Ingredient({ text }: { text: string }) {
  const match = text.match(/^(.*?)\s*\((.*)\)\s*$/);
  if (!match) return <>{text}</>;
  return (
    <>
      {match[1]} <span className="text-subtle">({match[2]})</span>
    </>
  );
}

export function WhatsInIt({ dish }: { dish: Dish }) {
  const allergens = dish.allergens.map((a) => allergenLabels[a]);
  const diet = dish.diet.map((d) => dietLabels[d]);

  return (
    <section aria-labelledby="whats-in-it" className="mt-14">
      <h2 id="whats-in-it" className="font-display text-2xl font-semibold tracking-tight">
        What’s in it
      </h2>
      <p className="mt-2 max-w-2xl text-muted">
        Every ingredient, component by component, including each spice in the blends.
      </p>

      <div className="mt-6 gap-4 md:columns-2">
        {dish.parts.map((part) => (
          <div
            key={part.label}
            className="mb-4 break-inside-avoid rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]"
          >
            <h3 className="text-sm font-semibold tracking-wide text-accent uppercase">
              {part.label}
            </h3>
            <ul className="mt-3 space-y-1.5 text-[0.9375rem] leading-relaxed">
              {part.items.map((item) => (
                <li key={item}>
                  <Ingredient text={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <dl className="grid gap-4 rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-sm text-subtle">Cooked in</dt>
          <dd className="mt-1 font-medium">
            {dish.cookedIn.length > 0 ? dish.cookedIn.join(", ") : "No added cooking fat"}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-subtle">Allergens</dt>
          <dd className="mt-1 font-medium">
            {allergens.length > 0 ? allergens.join(", ") : "None of the nine major allergens"}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-subtle">Diet</dt>
          <dd className="mt-1 font-medium">
            {diet.length > 0 ? diet.join(", ") : "Contains meat, poultry or seafood"}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-subtle">Heat</dt>
          <dd className="mt-1 font-medium">{spiceLabel[dish.spice]}</dd>
        </div>
      </dl>

      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-subtle">
        No preservatives or chemical additives. Recipes are still being finalized, and allergens
        will be confirmed with the kitchen before any dish goes on sale.
      </p>
    </section>
  );
}
