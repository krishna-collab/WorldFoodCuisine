import { describeRecord } from "@/lib/food/content";
import { allergenLabels, dietLabels } from "@/lib/food/data";
import type { Dish } from "@/lib/food/types";
import { SpiceMeter } from "./dish-facts";

/** "Timur (Nepali Sichuan pepper)" → name plus a quieter gloss. */
export function Ingredient({ text }: { text: string }) {
  const match = text.match(/^(.*?)\s*\((.*)\)\s*$/);
  if (!match) return <>{text}</>;
  return (
    <>
      {match[1]} <span className="text-subtle">({match[2]})</span>
    </>
  );
}

/**
 * Everything a dish is made of, component by component, plus the facts
 * people check before eating: allergens, cooking fat, diet and heat, and
 * whether those have been confirmed.
 */
export function WhatsInIt({ dish }: { dish: Dish }) {
  const allergens = dish.allergens.map((a) => allergenLabels[a]);
  const diet = dish.diet.map((d) => dietLabels[d]);

  return (
    <section aria-labelledby="whats-in-it" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="whats-in-it" className="text-display-m">
          What’s in it
        </h2>
        <p className="text-sm text-muted">Every ingredient, including each spice in the blends</p>
      </div>

      <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-border shadow-[var(--shadow-hairline)] sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-surface p-5 sm:col-span-2 lg:col-span-1">
          <dt className="eyebrow text-subtle">Allergens</dt>
          <dd className="mt-2 font-semibold">
            {allergens.length > 0 ? allergens.join(", ") : "None of the nine major allergens"}
          </dd>
          <dd className="mt-1 text-xs leading-relaxed text-subtle">
            {describeRecord(dish.content.allergens)}. Worked out from the ingredient list.
          </dd>
        </div>
        <div className="bg-surface p-5">
          <dt className="eyebrow text-subtle">Cooked in</dt>
          <dd className="mt-2 font-semibold">
            {dish.cookedIn.length > 0 ? dish.cookedIn.join(", ") : "No added cooking fat"}
          </dd>
        </div>
        <div className="bg-surface p-5">
          <dt className="eyebrow text-subtle">Diet</dt>
          <dd className="mt-2 font-semibold">
            {diet.length > 0 ? diet.join(", ") : "Contains meat, poultry or seafood"}
          </dd>
        </div>
        <div className="bg-surface p-5">
          <dt className="eyebrow text-subtle">Heat</dt>
          <dd className="mt-2 font-semibold">
            <SpiceMeter level={dish.spice} />
          </dd>
        </div>
      </dl>

      <div className="mt-8 gap-x-10 md:columns-2 xl:columns-3">
        {dish.parts.map((part) => (
          <div key={part.label} className="mb-8 break-inside-avoid">
            <h3 className="border-b border-fg pb-2 font-sans text-sm font-bold tracking-wide uppercase">
              {part.label}
            </h3>
            <ul className="mt-2 divide-y divide-border text-[0.9375rem] leading-relaxed">
              {part.items.map((item) => (
                <li key={item} className="py-1.5">
                  <Ingredient text={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="max-w-3xl text-sm leading-relaxed text-subtle">
        No preservatives or chemical additives. Ingredients: {describeRecord(dish.content.ingredients).toLowerCase()}.
        Allergens will be confirmed with the kitchen before any dish goes on sale, together with a
        statement on shared equipment.
      </p>
    </section>
  );
}
