import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChefHat,
  Lightbulb,
  ListChecks,
  RefreshCw,
  Settings2,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { canSpeak, speak, useTimerAlerts, useWakeLock } from "@/components/cook/use-cook-helpers";
import { StepTimer, TimerTray } from "@/components/cook/timers";
import { DishImage } from "@/components/food/dish-image";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Stepper } from "@/components/ui/stepper";
import { allergenLabels, dishById } from "@/lib/food/data";
import { formatDuration, ingredientAmount, ingredientName, type Measure } from "@/lib/food/quantity";
import {
  allergensWithSwaps,
  chosenSubstitute,
  scaledYield,
  stepPlainText,
  stepSegments,
} from "@/lib/food/recipe-text";
import { recipeFor } from "@/lib/food/recipes";
import type { Allergen, Recipe, RecipeIngredient, RecipeStep } from "@/lib/food/types";
import { pageHead } from "@/lib/site";
import { type CookSession, useCook } from "@/lib/store/cook";
import { useShoppingList } from "@/lib/store/shopping-list";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dish_/$id/cook")({
  beforeLoad: ({ params }) => {
    if (!dishById[params.id] || !recipeFor(params.id)) throw notFound();
  },
  head: ({ params }) => {
    const dish = dishById[params.id];
    if (!dish) return {};
    return pageHead({
      title: `Cook ${dish.name}: guided recipe`,
      description: `Step-by-step ${dish.name} with adjustable servings, timers, ingredient swaps and a shopping list. ${dish.flavor}.`,
      path: `/dish/${dish.id}/cook`,
    });
  },
  component: CookPage,
});

const allergenList = (list: Allergen[]) => list.map((a) => allergenLabels[a]).join(", ");

/* ─── Progress by section ─────────────────────────────────────────────── */

function SectionProgress({ recipe, step }: { recipe: Recipe; step: number }) {
  const sections = useMemo(() => {
    const out: { name: string; start: number; count: number }[] = [];
    recipe.steps.forEach((s, i) => {
      const last = out.at(-1);
      if (last && last.name === s.section) last.count++;
      else out.push({ name: s.section, start: i, count: 1 });
    });
    return out;
  }, [recipe]);
  const done = Math.max(0, Math.min(step, recipe.steps.length));
  return (
    <div className="flex gap-1" aria-hidden="true">
      {sections.map((sec) => {
        const filled = Math.max(0, Math.min(sec.count, done - sec.start + (step >= sec.start && step < recipe.steps.length ? 1 : 0)));
        return (
          <div key={sec.name} className="min-w-0" style={{ flex: sec.count }}>
            <div className="h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-herb transition-[width] duration-300"
                style={{ width: `${(filled / sec.count) * 100}%` }}
              />
            </div>
            <p
              className={cn(
                "mt-1 hidden truncate text-[0.6875rem] font-semibold tracking-wide uppercase sm:block",
                step >= sec.start && step < sec.start + sec.count ? "text-fg" : "text-subtle",
              )}
            >
              {sec.name}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Ingredient row with swaps ───────────────────────────────────────── */

function IngredientRow({
  ing,
  factor,
  measure,
  session,
  onToggle,
  onSwap,
}: {
  ing: RecipeIngredient;
  factor: number;
  measure: Measure;
  session: CookSession | undefined;
  onToggle: () => void;
  onSwap: (name: string | null) => void;
}) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const sub = chosenSubstitute(ing, session?.swaps ?? {});
  const checked = session?.ready.includes(ing.id) ?? false;
  const amount = sub?.amount ?? ingredientAmount(ing, factor, measure);
  return (
    <li className="border-b border-border py-2">
      <div className="flex items-start gap-3">
        <input
          id={`${uid}-check`}
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="peer mt-1 size-6 shrink-0 cursor-pointer rounded-md accent-[var(--color-herb)]"
        />
        <label htmlFor={`${uid}-check`} className="min-w-0 flex-1 cursor-pointer text-[1.0625rem] leading-snug peer-checked:text-subtle peer-checked:line-through">
          {amount ? <span className="nums font-bold">{amount} </span> : null}
          <span className={sub ? "font-semibold text-herb" : undefined}>{sub ? sub.name : ingredientName(ing)}</span>
          {!sub && ing.prep ? <span className="text-muted">, {ing.prep}</span> : null}
          {sub ? <span className="block text-sm text-muted">instead of {ingredientName(ing)}</span> : null}
        </label>
        {ing.substitutes?.length ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={`${uid}-swaps`}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-sm font-semibold shadow-[inset_0_0_0_1px_var(--color-border-strong)] hover:bg-sunken"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Swap<span className="sr-only"> {ingredientName(ing)}</span>
          </button>
        ) : null}
      </div>
      {open && ing.substitutes ? (
        <fieldset id={`${uid}-swaps`} className="mt-3 ml-9 space-y-2">
          <legend className="sr-only">Swap {ingredientName(ing)}</legend>
          {[{ name: null as string | null, note: "As written in the recipe." }, ...ing.substitutes].map((s) => {
            const full = s.name ? ing.substitutes!.find((x) => x.name === s.name) : undefined;
            const selected = (sub?.name ?? null) === s.name;
            return (
              <label
                key={s.name ?? "original"}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-xl p-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                  selected ? "bg-herb-soft" : "bg-surface shadow-[inset_0_0_0_1px_var(--color-border)]",
                )}
              >
                <input
                  type="radio"
                  name={`${uid}-swap`}
                  checked={selected}
                  onChange={() => {
                    onSwap(s.name);
                    setOpen(false);
                  }}
                  className="mt-1 size-5 shrink-0 accent-[var(--color-herb)]"
                />
                <span className="text-sm leading-relaxed">
                  <span className="block font-semibold">{s.name ?? `Keep ${ingredientName(ing).toLowerCase()}`}</span>
                  {full?.amount ? <span className="block text-muted">{full.amount}</span> : null}
                  <span className="block text-muted">{s.note}</span>
                  {full?.removes?.length ? (
                    <span className="mt-1 block font-semibold text-herb">
                      Removes {allergenList(full.removes).toLowerCase()} from this ingredient
                    </span>
                  ) : null}
                  {full?.adds?.length ? (
                    <span className="mt-1 block font-semibold text-danger">
                      Adds {allergenList(full.adds).toLowerCase()}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </fieldset>
      ) : null}
    </li>
  );
}

/* ─── Screens ─────────────────────────────────────────────────────────── */

function GetReady({
  recipe,
  session,
  measure,
  setMeasure,
}: {
  recipe: Recipe;
  session: CookSession | undefined;
  measure: Measure;
  setMeasure: (m: Measure) => void;
}) {
  const dish = dishById[recipe.dishId]!;
  const update = useCook((s) => s.update);
  const addRecipe = useShoppingList((s) => s.addRecipe);
  const navigate = useNavigate();
  const servings = session?.servings ?? recipe.servings;
  const factor = servings / recipe.servings;
  const swaps = session?.swaps ?? {};
  const allergens = allergensWithSwaps(recipe, swaps);
  const parts = [...new Set(recipe.ingredients.map((i) => i.part))];
  const ready = session?.ready ?? [];
  const yieldCount = scaledYield(recipe, factor);

  return (
    <div className="space-y-10">
      <header className="grid gap-5 sm:grid-cols-[10rem_1fr] sm:items-center">
        <DishImage dish={dish} sizes="10rem" className="hidden aspect-square rounded-2xl sm:block" />
        <div>
          <p className="eyebrow text-herb">Get ready</p>
          <h1 className="mt-2 text-display-l" tabIndex={-1} data-step-heading>
            {dish.name}
          </h1>
          <p className="mt-2 text-muted">
            {formatDuration(recipe.time.total)} in all, {formatDuration(recipe.time.active)} hands-on ·{" "}
            {recipe.difficulty}
          </p>
        </div>
      </header>

      <section aria-label="Servings and units" className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl bg-surface p-5 shadow-[var(--shadow-hairline)]">
        <div>
          <p className="mb-2 text-sm font-semibold">Servings</p>
          <Stepper
            size="lg"
            value={servings}
            min={1}
            max={12}
            label="servings"
            valueText={`${servings} ${servings === 1 ? "serving" : "servings"}`}
            onChange={(n) => update(recipe.dishId, { servings: n })}
          />
          {yieldCount && recipe.yields ? (
            <p className="mt-2 text-sm text-muted">
              Makes about {yieldCount} {recipe.yields.noun}
            </p>
          ) : null}
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Units</legend>
          <div className="inline-flex rounded-full p-1 shadow-[inset_0_0_0_1px_var(--color-control)]">
            {(["us", "metric"] as const).map((m) => (
              <label
                key={m}
                className={cn(
                  "inline-flex h-11 cursor-pointer items-center rounded-full px-5 text-sm font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                  measure === m ? "bg-primary text-primary-fg" : "hover:bg-sunken",
                )}
              >
                <input
                  type="radio"
                  name="measure"
                  value={m}
                  checked={measure === m}
                  onChange={() => setMeasure(m)}
                  className="sr-only"
                />
                {m === "us" ? "US cups" : "Metric"}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section
        aria-label="Allergens"
        className={cn(
          "rounded-2xl p-5",
          // Reassuring green only when swaps took allergens out and added none.
          allergens.removed.length && !allergens.added.length ? "bg-herb-soft" : "bg-warn-bg text-warn-fg",
        )}
      >
        <p className="font-semibold">
          Contains: {allergens.allergens.length ? allergenList(allergens.allergens) : "none of the nine major allergens"}
        </p>
        {allergens.removed.length ? (
          <p className="mt-1 text-sm">
            Your swaps remove {allergenList(allergens.removed).toLowerCase()}. Check the labels of what
            you buy: shared equipment and cross-contact aren’t covered here.
          </p>
        ) : null}
        {allergens.added.length ? (
          <p className="mt-1 text-sm font-semibold text-danger">
            Your swaps add {allergenList(allergens.added).toLowerCase()}.
          </p>
        ) : null}
        {!allergens.removed.length && !allergens.added.length ? (
          <p className="mt-1 text-sm">
            Worked out from the ingredients below. Swaps that change an allergen say so.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="ingredients-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="ingredients-heading" className="text-display-m">
            Ingredients
          </h2>
          <p className="nums text-sm text-muted" aria-live="polite">
            {ready.length} of {recipe.ingredients.length} set out
          </p>
        </div>
        <p className="mt-1 text-sm text-muted">Tick each one as you set it out.</p>
        {parts.map((part) => (
          <div key={part} className="mt-6">
            <h3 className="border-b-2 border-fg pb-1.5 font-sans text-sm font-bold tracking-wide uppercase">{part}</h3>
            <ul>
              {recipe.ingredients
                .filter((i) => i.part === part)
                .map((ing) => (
                  <IngredientRow
                    key={ing.id}
                    ing={ing}
                    factor={factor}
                    measure={measure}
                    session={session}
                    onToggle={() =>
                      update(recipe.dishId, {
                        ready: ready.includes(ing.id) ? ready.filter((x) => x !== ing.id) : [...ready, ing.id],
                      })
                    }
                    onSwap={(name) => {
                      const next = { ...swaps };
                      if (name) next[ing.id] = name;
                      else delete next[ing.id];
                      update(recipe.dishId, { swaps: next });
                    }}
                  />
                ))}
            </ul>
          </div>
        ))}
      </section>

      <section aria-labelledby="equipment-heading">
        <h2 id="equipment-heading" className="text-display-s">
          Equipment
        </h2>
        <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {recipe.equipment.map((e) => (
            <li key={e} className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-herb" aria-hidden="true" />
              {e}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          size="xl"
          onClick={() => {
            const n = addRecipe(recipe, factor, measure, swaps);
            toast.success(`${n} ingredients on your shopping list`, {
              action: { label: "Open list", onClick: () => void navigate({ to: "/list" }) },
            });
          }}
        >
          <ListChecks className="size-5" aria-hidden="true" />
          Add to shopping list
        </Button>
      </div>
      <p className="text-sm leading-relaxed text-subtle">
        Draft recipe, written with AI assistance from this dish’s ingredient list and not yet
        test-cooked. If something doesn’t look right, trust your eyes and a thermometer.
      </p>
    </div>
  );
}

function StepView({
  recipe,
  step,
  index,
  session,
  measure,
  now,
  autoRead,
}: {
  recipe: Recipe;
  step: RecipeStep;
  index: number;
  session: CookSession | undefined;
  measure: Measure;
  now: number;
  autoRead: boolean;
}) {
  const servings = session?.servings ?? recipe.servings;
  const factor = servings / recipe.servings;
  const swaps = session?.swaps ?? {};
  const segments = stepSegments(step, recipe, factor, measure, swaps);
  const byId = new Map(recipe.ingredients.map((i) => [i.id, i]));
  const timer = session?.timers.find((t) => t.id === step.id);
  const plain = `${step.title}. ${stepPlainText(step, recipe, factor, measure, swaps)}${step.caution ? ` Careful: ${step.caution}` : ""}`;

  useEffect(() => {
    if (!autoRead) return;
    return speak(plain);
    // Read each step once when it appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id, autoRead]);

  return (
    <div className="space-y-7">
      <header>
        <p className="eyebrow text-herb">
          {step.section} · Step {index + 1} of {recipe.steps.length}
        </p>
        <h1 className="mt-2 text-display-l" tabIndex={-1} data-step-heading>
          {step.title}
        </h1>
      </header>

      {step.uses?.length ? (
        <section aria-label="You’ll need">
          <ul className="flex flex-wrap gap-2">
            {step.uses.map((uid) => {
              const ing = byId.get(uid);
              if (!ing) return null;
              const sub = chosenSubstitute(ing, swaps);
              const amount = sub?.amount ? null : ingredientAmount(ing, factor, measure);
              return (
                <li
                  key={uid}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm",
                    sub ? "bg-herb-soft text-herb" : "bg-surface shadow-[inset_0_0_0_1px_var(--color-border-strong)]",
                  )}
                >
                  {amount ? <span className="nums font-bold">{amount} </span> : null}
                  {sub ? sub.name : ingredientName(ing)}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <p className="text-[1.3125rem] leading-[1.65] sm:text-[1.4375rem]">
        {segments.map((s, i) =>
          s.type === "text" ? (
            <span key={i}>{s.text}</span>
          ) : (
            <strong key={i} className={cn("font-bold", s.swapped && "text-herb")}>
              {s.amount ? <span className="nums">{s.amount} </span> : null}
              {s.name}
            </strong>
          ),
        )}
      </p>

      <StepTimer dishId={recipe.dishId} step={step} timer={timer} now={now} />

      {step.caution ? (
        <p className="flex gap-3 rounded-2xl bg-warn-bg p-4 text-warn-fg">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <span>
            <strong>Careful: </strong>
            {step.caution}
          </span>
        </p>
      ) : null}
      {step.tip ? (
        <p className="flex gap-3 rounded-2xl bg-surface p-4 shadow-[var(--shadow-hairline)]">
          <Lightbulb className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
          <span>
            <strong>Tip: </strong>
            {step.tip}
          </span>
        </p>
      ) : null}

      {canSpeak() ? (
        <Button variant="ghost" size="lg" onClick={() => speak(plain)}>
          <Volume2 className="size-5" aria-hidden="true" />
          Read this step aloud
        </Button>
      ) : null}
    </div>
  );
}

function Finished({ recipe, onRestart }: { recipe: Recipe; onRestart: () => void }) {
  const dish = dishById[recipe.dishId]!;
  const last = recipe.steps.at(-1);
  return (
    <div className="space-y-8 text-center">
      <DishImage dish={dish} sizes="(min-width: 640px) 36rem, 100vw" className="mx-auto aspect-[4/3] max-w-xl rounded-2xl" />
      <div>
        <p className="eyebrow text-herb">All {recipe.steps.length} steps done</p>
        <h1 className="mt-3 text-display-l" tabIndex={-1} data-step-heading>
          Time to eat
        </h1>
        <p className="mx-auto mt-3 max-w-md text-lede text-muted">
          Enjoy your {dish.name}.{last?.tip ? ` ${last.tip}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="primary" size="xl">
          <Link to="/dish/$id" params={{ id: dish.id }}>
            Back to {dish.name}
          </Link>
        </Button>
        <Button variant="secondary" size="xl" onClick={onRestart}>
          <RefreshCw className="size-5" aria-hidden="true" />
          Cook it again
        </Button>
      </div>
      <p className="text-sm text-muted">
        Rather have it made for you next time?{" "}
        <Link to="/dish/$id" params={{ id: dish.id }} search={{ path: "order" }} className="text-link font-semibold">
          Get it cooked
        </Link>
      </p>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────── */

function CookPage() {
  const { id } = Route.useParams();
  const dish = dishById[id]!;
  const recipe = recipeFor(id)!;
  const hydrated = useHydrated();
  const session = useCook((s) => s.sessions[id]);
  const start = useCook((s) => s.start);
  const update = useCook((s) => s.update);
  const end = useCook((s) => s.end);
  const measure = useCook((s) => s.measure);
  const setMeasure = useCook((s) => s.setMeasure);
  const keepAwake = useCook((s) => s.keepAwake);
  const setKeepAwake = useCook((s) => s.setKeepAwake);
  const [announcement, setAnnouncement] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const resumed = useRef(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Start (or pick up) the session once the browser's saved state is loaded.
  useEffect(() => {
    if (!hydrated) return;
    const s = start(id, recipe.servings);
    if (!resumed.current && s.step >= 0 && s.step < recipe.steps.length) {
      toast(`Picked up where you left off: step ${s.step + 1} of ${recipe.steps.length}`);
    }
    resumed.current = true;
  }, [hydrated, id, recipe, start]);

  // The server can't see this browser's saved progress, so the first render
  // (server and client alike) is the Get ready screen with the recipe's
  // defaults; saved servings, swaps, units and steps apply right after.
  // That keeps the page readable before the scripts load.
  const saved = hydrated ? session : undefined;
  const units = hydrated ? measure : "us";
  const step = saved?.step ?? -1;
  const timers = saved?.timers ?? [];
  const announce = useCallback((text: string) => setAnnouncement(text), []);
  const now = useTimerAlerts(id, timers, announce);
  const wake = useWakeLock(hydrated && keepAwake);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(-1, Math.min(recipe.steps.length, next));
      update(id, { step: clamped });
      if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      window.setTimeout(
        () => mainRef.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus(),
        30,
      );
    },
    [id, recipe.steps.length, update],
  );

  // Arrow keys move between steps (not while typing or inside a dialog).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t?.tagName ?? "") || t?.closest("[role=dialog]")) return;
      if (e.key === "ArrowRight") go(step + 1);
      if (e.key === "ArrowLeft") go(step - 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, step]);

  const current = step >= 0 && step < recipe.steps.length ? recipe.steps[step] : undefined;
  const nextStep = recipe.steps[step + 1];

  return (
    <div data-cook-mode className="flex min-h-dvh flex-col">
      <p className="sr-only" role="status" aria-live="assertive">
        {announcement}
      </p>

      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-border bg-bg/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-2 px-3 sm:px-6">
          <Button asChild variant="ghost" size="icon" aria-label={`Leave cook mode, back to ${dish.name}`}>
            <Link to="/dish/$id" params={{ id }}>
              <X className="size-5" aria-hidden="true" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg leading-tight">{dish.name}</p>
            <p className="truncate text-xs text-muted">
              {step < 0 ? "Get ready" : current ? `Step ${step + 1} of ${recipe.steps.length} · ${current.section}` : "Done"}
            </p>
          </div>
          <TimerTray
            dishId={id}
            timers={timers}
            now={now}
            onGoToStep={(stepId) => go(recipe.steps.findIndex((s) => s.id === stepId))}
          />
          <Button variant="ghost" size="icon" aria-label="Cooking settings" onClick={() => setSettingsOpen(true)}>
            <Settings2 className="size-5" aria-hidden="true" />
          </Button>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-2 sm:px-6">
          <SectionProgress recipe={recipe} step={step} />
        </div>
      </div>

      {/* Content */}
      <div ref={mainRef} className="mx-auto w-full max-w-3xl flex-1 px-4 pt-8 pb-40 sm:px-6">
        {step < 0 ? (
          <GetReady recipe={recipe} session={saved} measure={units} setMeasure={setMeasure} />
        ) : current ? (
          <StepView
            key={current.id}
            recipe={recipe}
            step={current}
            index={step}
            session={saved}
            measure={units}
            now={now}
            autoRead={autoRead}
          />
        ) : (
          <Finished
            recipe={recipe}
            onRestart={() => {
              end(id);
              start(id, recipe.servings);
              go(-1);
            }}
          />
        )}
      </div>

      {/* Bottom navigation, in thumb reach */}
      {step < recipe.steps.length ? (
        <nav
          aria-label="Steps"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 pb-safe backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 pt-3 sm:px-6">
            <Button
              variant="secondary"
              size="xl"
              onClick={() => go(step - 1)}
              disabled={step < 0}
              className="px-5"
              aria-label={step === 0 ? "Back to get ready" : "Previous step"}
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Button variant="herb" size="xl" className="min-w-0 flex-1" onClick={() => go(step + 1)}>
              <span className="truncate">
                {step < 0 ? "Start cooking" : nextStep ? `Next: ${nextStep.title}` : "Finish"}
              </span>
              <ArrowRight className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </nav>
      ) : null}

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen} title="Cooking settings">
        <div className="space-y-8">
          <div>
            <p className="mb-2 font-semibold">Servings</p>
            <Stepper
              size="lg"
              value={session?.servings ?? recipe.servings}
              min={1}
              max={12}
              label="servings"
              valueText={`${session?.servings ?? recipe.servings} servings`}
              onChange={(n) => update(id, { servings: n })}
            />
          </div>
          <fieldset>
            <legend className="mb-2 font-semibold">Units</legend>
            <div className="flex gap-2">
              {(["us", "metric"] as const).map((m) => (
                <Button key={m} variant={measure === m ? "primary" : "secondary"} onClick={() => setMeasure(m)} aria-pressed={measure === m}>
                  {m === "us" ? "US cups" : "Metric"}
                </Button>
              ))}
            </div>
          </fieldset>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={keepAwake}
              onChange={(e) => setKeepAwake(e.target.checked)}
              className="mt-1 size-6 shrink-0 accent-[var(--color-herb)]"
            />
            <span>
              <span className="block font-semibold">Keep the screen on</span>
              <span className="block text-sm text-muted">
                {wake === "unsupported"
                  ? "This browser can’t keep the screen on. Check your screen timeout while timers run."
                  : wake === "on"
                    ? "On: your screen won’t lock while this page is open."
                    : "Off."}
              </span>
            </span>
          </label>
          {canSpeak() ? (
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={autoRead}
                onChange={(e) => setAutoRead(e.target.checked)}
                className="mt-1 size-6 shrink-0 accent-[var(--color-herb)]"
              />
              <span>
                <span className="block font-semibold">Read each step aloud</span>
                <span className="block text-sm text-muted">Hands busy? Each new step is read out.</span>
              </span>
            </label>
          ) : null}
          <p className="text-sm text-muted">
            Tip: the left and right arrow keys move between steps. Your place, servings, swaps and
            timers are saved on this device, so you can leave and come back.
          </p>
          <div className="border-t border-border pt-6">
            <Button
              variant="secondary"
              onClick={() => {
                end(id);
                start(id, recipe.servings);
                setSettingsOpen(false);
                go(-1);
              }}
            >
              <ChefHat className="size-4" aria-hidden="true" />
              Start over
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
