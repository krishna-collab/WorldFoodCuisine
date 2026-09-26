import type { Quantity, RecipeIngredient, Unit } from "./types.ts";

export type Measure = "metric" | "us";

const FRACTIONS: [number, string][] = [
  [0, ""],
  [0.125, "⅛"],
  [0.25, "¼"],
  [1 / 3, "⅓"],
  [0.5, "½"],
  [2 / 3, "⅔"],
  [0.75, "¾"],
  [1, ""],
];

/** 1.5 → "1½", 0.33 → "⅓", 2.9 → "3". Kitchen fractions for spoons, cups and pieces. */
export function formatFraction(value: number): string {
  if (value <= 0) return "0";
  const whole = Math.floor(value);
  const rest = value - whole;
  let best = FRACTIONS[0]!;
  for (const f of FRACTIONS) if (Math.abs(f[0] - rest) < Math.abs(best[0] - rest)) best = f;
  const w = best[0] === 1 ? whole + 1 : whole;
  const frac = best[0] === 1 ? "" : best[1];
  if (w === 0) return frac || "⅛";
  return `${w}${frac}`;
}

/** Grams and millilitres: whole numbers, rounded to 5 above 50 and to 25 above 500. */
function roundMetric(value: number): number {
  if (value >= 500) return Math.round(value / 25) * 25;
  if (value >= 50) return Math.round(value / 5) * 5;
  if (value >= 10) return Math.round(value);
  return Math.round(value * 2) / 2;
}

/** Keep spoons readable: 3 tsp → 1 tbsp, 4 tbsp → ¼ cup (US only). */
function normalizeSpoons(q: Quantity, measure: Measure): Quantity {
  if (q.unit === "tsp" && q.amount >= 3)
    return normalizeSpoons({ amount: q.amount / 3, unit: "tbsp" }, measure);
  if (measure === "us" && q.unit === "tbsp" && q.amount >= 4)
    return { amount: q.amount / 16, unit: "cup" };
  return q;
}

const UNIT_LABEL: Record<Unit, [string, string]> = {
  g: ["g", "g"],
  kg: ["kg", "kg"],
  ml: ["ml", "ml"],
  l: ["l", "l"],
  tsp: ["tsp", "tsp"],
  tbsp: ["tbsp", "tbsp"],
  cup: ["cup", "cups"],
  oz: ["oz", "oz"],
  lb: ["lb", "lb"],
  piece: ["", ""],
  clove: ["clove", "cloves"],
  pinch: ["pinch", "pinches"],
};

export function formatQuantity(q: Quantity): string {
  const { amount, unit } = q;
  if (unit === "g" || unit === "ml") {
    const r = roundMetric(amount);
    if (r >= 1000) return `${Math.round(r / 10) / 100} ${unit === "g" ? "kg" : "l"}`;
    return `${r} ${unit}`;
  }
  if (unit === "kg" || unit === "l") return `${Math.round(amount * 100) / 100} ${unit}`;
  if (unit === "lb" && amount < 1 && amount * 16 >= 1) return `${Math.round(amount * 16)} oz`;
  const text = formatFraction(amount);
  const [one, many] = UNIT_LABEL[unit];
  if (!one) return text;
  const plural = amount > 1.05 ? many : one;
  return `${text} ${plural}`;
}

/** The ingredient's quantity scaled by `factor`, before formatting; null for "to taste". */
export function scaledQuantity(
  ing: RecipeIngredient,
  factor: number,
  measure: Measure,
): Quantity | null {
  if (ing.toTaste) return null;
  const base = measure === "us" && ing.us ? ing.us : ing.metric;
  if (!base) return null;
  return { amount: base.amount * factor, unit: base.unit };
}

/** The ingredient's amount scaled by `factor`, in the chosen measure, or null for "to taste". */
export function ingredientAmount(
  ing: RecipeIngredient,
  factor: number,
  measure: Measure,
): string | null {
  const q = scaledQuantity(ing, factor, measure);
  return q ? formatQuantity(normalizeSpoons(q, measure)) : null;
}

/** Add quantities of the same unit (tsp and tbsp combine); null if they can't be added. */
export function addQuantities(a: Quantity, b: Quantity): Quantity | null {
  const toTsp = (q: Quantity) =>
    q.unit === "tsp" ? q.amount : q.unit === "tbsp" ? q.amount * 3 : null;
  if (a.unit === b.unit) return { amount: a.amount + b.amount, unit: a.unit };
  const ta = toTsp(a);
  const tb = toTsp(b);
  return ta !== null && tb !== null ? { amount: ta + tb, unit: "tsp" } : null;
}

export function formatScaled(q: Quantity, measure: Measure): string {
  return formatQuantity(normalizeSpoons(q, measure));
}

/** "Maida (all-purpose flour)" or the parts-list name. */
export function ingredientName(ing: RecipeIngredient): string {
  return ing.label ?? ing.item;
}

/** One line for lists and copied text: "300 g Maida (all-purpose flour), spooned and leveled". */
export function ingredientLine(ing: RecipeIngredient, factor: number, measure: Measure): string {
  const amount = ingredientAmount(ing, factor, measure);
  const name = ingredientName(ing);
  const prep = ing.prep ? `, ${ing.prep}` : "";
  return amount ? `${amount} ${name}${prep}` : `${name}${prep}, to taste`;
}

/** "1 hr 45 min", "25 min". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

/** "12:05" for a countdown. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0");
  const ss = String(sec).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Screen-reader form of a countdown: "12 minutes 5 seconds". */
export function spokenDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const parts = [];
  if (m) parts.push(`${m} ${m === 1 ? "minute" : "minutes"}`);
  if (sec || !m) parts.push(`${sec} ${sec === 1 ? "second" : "seconds"}`);
  return parts.join(" ");
}
