import { EDITORIAL_SOURCE } from "./editorial.ts";
import type { ContentRecord, ContentStatus, DishContent, DishRecord } from "./types.ts";

/**
 * Where each kind of food content comes from and who has checked it.
 *
 * Today everything is a draft: no kitchen is cooking yet, so nobody has
 * confirmed the ingredients or allergens against real plates. When a kitchen
 * signs a dish off, add it to CHECKED with who checked what and when; the
 * dish page and checkout then show "confirmed by …" instead of "draft".
 */
const DEFAULTS: DishContent = {
  ingredients: {
    status: "draft",
    source: "WorldFoodCuisine's draft ingredient list for this dish, September 2026",
  },
  allergens: {
    status: "draft",
    source:
      "Worked out from the ingredient list (the nine major US allergens); the menu tests check the two agree",
  },
  story: {
    status: "draft",
    source: "Editorial summary written for the menu; sources not yet cited",
  },
  editorial: {
    status: "draft",
    source: EDITORIAL_SOURCE,
  },
};

/**
 * Per-dish sign-offs, e.g.
 * "chicken-momo": { allergens: { status: "verified", source: "…", checkedBy: "Kitchen lead, Mission St.", checkedOn: "2026-11-02" } }
 */
const CHECKED: Record<string, Partial<DishContent>> = {};

export function dishContent(dish: Pick<DishRecord, "id">): DishContent {
  return { ...DEFAULTS, ...CHECKED[dish.id] };
}

export const contentStatusLabel: Record<ContentStatus, string> = {
  draft: "Draft",
  reviewed: "Reviewed",
  verified: "Confirmed by the kitchen",
};

/** "Draft · not yet confirmed by a kitchen" / "Confirmed by Kitchen lead on 2 Nov 2026". */
export function describeRecord(record: ContentRecord): string {
  if (record.status === "draft") return "Draft, not yet confirmed by a kitchen";
  const who = record.checkedBy ? ` by ${record.checkedBy}` : "";
  const when = record.checkedOn
    ? ` on ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(record.checkedOn))}`
    : "";
  return `${contentStatusLabel[record.status]}${who}${when}`;
}
