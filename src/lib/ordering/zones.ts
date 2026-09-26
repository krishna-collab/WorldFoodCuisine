/**
 * Delivery zones decide where ordering is possible and what it costs.
 *
 * LIVE_ZONES is empty on purpose: no kitchen is delivering yet, so every
 * ZIP code gets an honest "not delivering here yet". When a real kitchen
 * opens, add its zone here with real postal codes, hours, fees and tax.
 *
 * DEMO_ZONE is only used when a visitor turns on demo mode. It exists so the
 * ordering flow can be tried end to end; nothing is sent or charged.
 */

export type DeliveryZone = {
  id: string;
  label: string;
  /** Exact 5-digit ZIP codes served, or "any" (demo only). */
  postalCodes: string[] | "any";
  timeZone: string;
  /** Daily opening hours in the zone's time zone, 24-hour "HH:MM". */
  hours: { open: string; close: string };
  etaMinutes: [number, number];
  deliveryFee: number;
  freeDeliveryOver?: number;
  taxRate: number;
  demo: boolean;
};

export const LIVE_ZONES: DeliveryZone[] = [];

export const DEMO_ZONE: DeliveryZone = {
  id: "demo",
  label: "Demo area",
  postalCodes: "any",
  timeZone: "America/Los_Angeles",
  hours: { open: "11:00", close: "21:30" },
  etaMinutes: [35, 50],
  deliveryFee: 299,
  freeDeliveryOver: 3500,
  taxRate: 0.09,
  demo: true,
};

/** True once at least one real kitchen is delivering. */
export const ORDERING_LIVE = LIVE_ZONES.length > 0;

/** "95112" or "95112-1234" → "95112"; anything else → null. */
export function normalizePostalCode(input: string): string | null {
  const match = input.trim().match(/^(\d{5})(?:-\d{4})?$/);
  return match ? match[1]! : null;
}

export function zoneFor(postalCode: string, demo: boolean): DeliveryZone | null {
  const live = LIVE_ZONES.find(
    (z) => z.postalCodes === "any" || z.postalCodes.includes(postalCode),
  );
  if (live) return live;
  return demo ? DEMO_ZONE : null;
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

export type PriceSummary = { subtotal: number; delivery: number; tax: number; total: number };

export function priceSummary(subtotal: number, zone: DeliveryZone): PriceSummary {
  const delivery =
    subtotal === 0 || (zone.freeDeliveryOver !== undefined && subtotal >= zone.freeDeliveryOver)
      ? 0
      : zone.deliveryFee;
  const tax = Math.round(subtotal * zone.taxRate);
  return { subtotal, delivery, tax, total: subtotal + delivery + tax };
}
