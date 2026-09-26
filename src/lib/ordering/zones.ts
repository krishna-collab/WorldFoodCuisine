/**
 * Kitchens decide where ordering is possible and what it costs.
 *
 * WorldFoodCuisine is delivery-only: every location is a franchise kitchen
 * with no dining room. Each kitchen delivers to its own ZIP codes, keeps its
 * own hours and fees, sets its menu for the day (what's sold out) and may
 * price a dish differently from the menu's base price. One kitchen serves
 * each ZIP code.
 *
 * LIVE_ZONES is empty on purpose: no kitchen is open yet, so every ZIP code
 * gets an honest "no kitchen delivers here yet". When a real kitchen opens,
 * add it here with its real ZIP codes, hours, fees and tax.
 *
 * DEMO_KITCHENS are only used when a visitor turns on demo mode: two example
 * kitchens with different menus, prices, hours and fees, so ordering across
 * locations can be tried end to end. Nothing is sent or charged.
 */

export type OptionChoice = { id: string; label: string; priceDelta: number };

/** A choice the kitchen offers on some dishes, e.g. heat level. The first choice is the default. */
export type OptionGroup = {
  id: string;
  label: string;
  /** Short explanation shown with the choices. */
  help?: string;
  choices: OptionChoice[];
  /** Which dishes get it: those at or above a heat level, or a list of ids. */
  appliesTo: { minSpice?: number; dishIds?: string[] };
};

/** One kitchen (franchise location) and the area it delivers to. */
export type DeliveryZone = {
  id: string;
  /** The kitchen's name as customers see it, e.g. "Mission St. kitchen". */
  label: string;
  /** The delivery area in words, for the Locations page. */
  areaLabel: string;
  /** Exact 5-digit ZIP codes served, or "any" (demo only). */
  postalCodes: string[] | "any";
  /** Or every ZIP code starting with one of these, e.g. "951". */
  postalPrefixes?: string[];
  timeZone: string;
  /** Daily opening hours in the zone's time zone, 24-hour "HH:MM". */
  hours: { open: string; close: string };
  etaMinutes: [number, number];
  deliveryFee: number;
  freeDeliveryOver?: number;
  taxRate: number;
  /** Dishes this kitchen isn't making today, with the reason customers see. */
  unavailable?: Record<string, string>;
  /** This kitchen's price for a dish when it differs from the menu's base price, in cents. */
  priceOverrides?: Record<string, number>;
  optionGroups?: OptionGroup[];
  /** Tip choices as a percent of the subtotal. 0 means "no tip". */
  tipPercents?: number[];
  demo: boolean;
};

export const LIVE_ZONES: DeliveryZone[] = [];

const DEMO_HEAT: OptionGroup = {
  id: "heat",
  label: "Heat",
  help: "The kitchen can make it milder, never hotter than the dish is meant to be.",
  choices: [
    { id: "as-written", label: "As written", priceDelta: 0 },
    { id: "milder", label: "Milder", priceDelta: 0 },
  ],
  appliesTo: { minSpice: 2 },
};

export const DEMO_WEST: DeliveryZone = {
  id: "demo-west",
  label: "Demo kitchen West",
  areaLabel: "ZIP codes starting with 8 or 9",
  postalCodes: [],
  postalPrefixes: ["8", "9"],
  timeZone: "America/Los_Angeles",
  hours: { open: "11:00", close: "21:30" },
  etaMinutes: [35, 50],
  deliveryFee: 299,
  freeDeliveryOver: 3500,
  taxRate: 0.09,
  // A sold-out dish, so the demo shows how a kitchen's menu for the day looks.
  unavailable: { "osso-buco": "Sold out today" },
  optionGroups: [DEMO_HEAT],
  tipPercents: [0, 10, 15, 20],
  demo: true,
};

export const DEMO_EAST: DeliveryZone = {
  id: "demo-east",
  label: "Demo kitchen East",
  areaLabel: "Every other ZIP code",
  postalCodes: "any",
  timeZone: "America/New_York",
  hours: { open: "11:30", close: "22:00" },
  etaMinutes: [30, 45],
  deliveryFee: 349,
  freeDeliveryOver: 4000,
  taxRate: 0.08875,
  // A different menu for the day and two local prices, to show kitchens differ.
  unavailable: {
    "mole-poblano": "Sold out today",
    tiramisu: "Not on this kitchen’s menu",
  },
  priceOverrides: { "chicken-momo": 1350, "pad-thai": 1550 },
  optionGroups: [DEMO_HEAT],
  tipPercents: [0, 10, 15, 20],
  demo: true,
};

/** Specific kitchens first; the catch-all ("any") last. */
export const DEMO_KITCHENS: DeliveryZone[] = [DEMO_WEST, DEMO_EAST];

type MenuDish = { id: string; spice: number; price: number };

/** Whether the zone's kitchen can make this dish now, and why not. */
export function menuStatus(
  dish: MenuDish,
  zone: DeliveryZone,
): { available: true } | { available: false; reason: string } {
  const reason = zone.unavailable?.[dish.id];
  return reason ? { available: false, reason } : { available: true };
}

export function optionGroupsFor(dish: MenuDish, zone: DeliveryZone): OptionGroup[] {
  return (zone.optionGroups ?? []).filter(
    (g) =>
      (g.appliesTo.minSpice !== undefined && dish.spice >= g.appliesTo.minSpice) ||
      (g.appliesTo.dishIds?.includes(dish.id) ?? false),
  );
}

/** Default choice for every group that applies to the dish. */
export function defaultOptions(dish: MenuDish, zone: DeliveryZone): Record<string, string> {
  return Object.fromEntries(
    optionGroupsFor(dish, zone).map((g) => [g.id, g.choices[0]!.id] as const),
  );
}

/** Unit price with the chosen options, in cents. */
export function unitPrice(
  dish: MenuDish,
  zone: DeliveryZone,
  options: Record<string, string> = {},
): number {
  let price = zone.priceOverrides?.[dish.id] ?? dish.price;
  for (const group of optionGroupsFor(dish, zone)) {
    const choice = group.choices.find((c) => c.id === options[group.id]);
    price += choice?.priceDelta ?? 0;
  }
  return price;
}

/** "Heat: Milder" for choices that differ from the default; empty when all are defaults. */
export function describeOptions(
  dish: MenuDish,
  zone: DeliveryZone,
  options: Record<string, string> = {},
): string[] {
  return optionGroupsFor(dish, zone).flatMap((group) => {
    const choice = group.choices.find((c) => c.id === options[group.id]);
    return choice && choice.id !== group.choices[0]!.id ? [`${group.label}: ${choice.label}`] : [];
  });
}

/** True once at least one real kitchen is delivering. */
export const ORDERING_LIVE = LIVE_ZONES.length > 0;

/** "95112" or "95112-1234" → "95112"; anything else → null. */
export function normalizePostalCode(input: string): string | null {
  const match = input.trim().match(/^(\d{5})(?:-\d{4})?$/);
  return match ? match[1]! : null;
}

function serves(zone: DeliveryZone, postalCode: string): boolean {
  return (
    zone.postalCodes === "any" ||
    zone.postalCodes.includes(postalCode) ||
    (zone.postalPrefixes ?? []).some((prefix) => postalCode.startsWith(prefix))
  );
}

/** The kitchen that delivers to a ZIP code: a real one, else (in demo mode) a demo kitchen. */
export function zoneFor(postalCode: string, demo: boolean): DeliveryZone | null {
  const live = LIVE_ZONES.find((z) => serves(z, postalCode));
  if (live) return live;
  return demo ? (DEMO_KITCHENS.find((z) => serves(z, postalCode)) ?? null) : null;
}

export type AreaStatus =
  | { kind: "unset" }
  | { kind: "unserved"; postalCode: string }
  | { kind: "served"; postalCode: string; zone: DeliveryZone };

export function areaStatus(postalCode: string | null, demo: boolean): AreaStatus {
  if (!postalCode) return { kind: "unset" };
  const zone = zoneFor(postalCode, demo);
  return zone ? { kind: "served", postalCode, zone } : { kind: "unserved", postalCode };
}

function minutesIn(zone: DeliveryZone, date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function formatClock(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, "0")}${suffix}`;
}

export function hoursLabel(zone: DeliveryZone): string {
  return `${formatClock(toMinutes(zone.hours.open))}–${formatClock(toMinutes(zone.hours.close))} daily`;
}

/** Short name of the zone's time zone at a given moment, e.g. "PDT". */
export function timeZoneName(zone: DeliveryZone, date = new Date()): string {
  const part = new Intl.DateTimeFormat("en-US", { timeZone: zone.timeZone, timeZoneName: "short" })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName");
  return part?.value ?? zone.timeZone;
}

export function isOpenAt(zone: DeliveryZone, date = new Date()): boolean {
  const now = minutesIn(zone, date);
  return now >= toMinutes(zone.hours.open) && now < toMinutes(zone.hours.close);
}

export type DeliveryWindow = { value: string; label: string };

/**
 * "As soon as possible" while open, then half-hour windows for the rest of
 * today. When closed, windows for the next opening.
 */
export function deliveryWindows(zone: DeliveryZone, date = new Date()): DeliveryWindow[] {
  const open = toMinutes(zone.hours.open);
  const close = toMinutes(zone.hours.close);
  const now = minutesIn(zone, date);
  const windows: DeliveryWindow[] = [];
  let start: number;
  let day: "Today" | "Tomorrow";
  if (now >= open && now < close) {
    windows.push({
      value: "asap",
      label: `As soon as possible (about ${zone.etaMinutes[0]}–${zone.etaMinutes[1]} min)`,
    });
    start = Math.ceil((now + zone.etaMinutes[1]) / 30) * 30;
    day = "Today";
  } else {
    start = open + 30;
    day = now < open ? "Today" : "Tomorrow";
  }
  for (let t = start; t + 30 <= close && windows.length < 8; t += 30) {
    windows.push({
      value: `${day.toLowerCase()}-${t}`,
      label: `${day}, ${formatClock(t)}–${formatClock(t + 30)}`,
    });
  }
  return windows;
}

export type PriceSummary = {
  subtotal: number;
  delivery: number;
  tax: number;
  tip: number;
  total: number;
};

/** Everything the customer pays, in cents. The tip is a percent of the subtotal. */
export function priceSummary(subtotal: number, zone: DeliveryZone, tipPercent = 0): PriceSummary {
  const delivery =
    subtotal === 0 || (zone.freeDeliveryOver !== undefined && subtotal >= zone.freeDeliveryOver)
      ? 0
      : zone.deliveryFee;
  const tax = Math.round(subtotal * zone.taxRate);
  const tip = Math.round((subtotal * tipPercent) / 100);
  return { subtotal, delivery, tax, tip, total: subtotal + delivery + tax + tip };
}
