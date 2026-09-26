/**
 * Ordering rules: ZIP parsing, which areas are served, opening hours,
 * delivery windows and the price breakdown.
 *
 * Run: npm run test:menu
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  areaStatus,
  defaultOptions,
  DEMO_ZONE,
  deliveryWindows,
  describeOptions,
  hoursLabel,
  isOpenAt,
  LIVE_ZONES,
  menuStatus,
  normalizePostalCode,
  optionGroupsFor,
  priceSummary,
  timeZoneName,
  unitPrice,
  zoneFor,
} from "./zones.ts";

// DEMO_ZONE runs 11:00–21:30 in Los Angeles. September is PDT (UTC-7).
const la = (hhmm: string, day = "2026-09-24") => new Date(`${day}T${hhmm}:00-07:00`);

test("ZIP codes: five digits or ZIP+4, nothing else", () => {
  assert.equal(normalizePostalCode("95112"), "95112");
  assert.equal(normalizePostalCode(" 95112-1234 "), "95112");
  assert.equal(normalizePostalCode("9511"), null);
  assert.equal(normalizePostalCode("951123"), null);
  assert.equal(normalizePostalCode("abcde"), null);
  assert.equal(normalizePostalCode(""), null);
});

test("without demo mode, an area is only served by a real zone", () => {
  assert.deepEqual(areaStatus(null, false), { kind: "unset" });
  for (const zip of ["95112", "10001", "60601"]) {
    const live = LIVE_ZONES.find((z) => z.postalCodes !== "any" && z.postalCodes.includes(zip));
    const status = areaStatus(zip, false);
    if (live) assert.equal(status.kind === "served" && status.zone.id, live.id);
    else assert.deepEqual(status, { kind: "unserved", postalCode: zip });
  }
});

test("demo mode serves any ZIP from the clearly labeled demo zone", () => {
  const status = areaStatus("95112", true);
  assert.equal(status.kind, "served");
  if (status.kind === "served") {
    assert.equal(status.zone.demo, true);
    assert.equal(status.zone.label, "Demo area");
  }
  if (LIVE_ZONES.length === 0) assert.equal(zoneFor("00000", false), null);
});

test("real zones carry real data: exact ZIP codes, hours, fees and tax", () => {
  for (const zone of LIVE_ZONES) {
    assert.equal(zone.demo, false, zone.id);
    assert.ok(Array.isArray(zone.postalCodes) && zone.postalCodes.length > 0, zone.id);
    for (const zip of zone.postalCodes as string[]) assert.match(zip, /^\d{5}$/, zone.id);
    assert.match(zone.hours.open, /^\d{2}:\d{2}$/);
    assert.match(zone.hours.close, /^\d{2}:\d{2}$/);
    assert.ok(zone.etaMinutes[0] > 0 && zone.etaMinutes[1] >= zone.etaMinutes[0]);
    assert.ok(zone.taxRate >= 0 && zone.taxRate < 0.2);
    assert.doesNotThrow(() => new Intl.DateTimeFormat("en-US", { timeZone: zone.timeZone }));
  }
});

test("opening hours are checked in the zone's own time zone", () => {
  assert.equal(hoursLabel(DEMO_ZONE), "11am–9:30pm daily");
  assert.equal(isOpenAt(DEMO_ZONE, la("10:59")), false);
  assert.equal(isOpenAt(DEMO_ZONE, la("11:00")), true);
  assert.equal(isOpenAt(DEMO_ZONE, la("21:29")), true);
  assert.equal(isOpenAt(DEMO_ZONE, la("21:30")), false);
  assert.equal(timeZoneName(DEMO_ZONE, la("12:00")), "PDT");
  assert.equal(timeZoneName(DEMO_ZONE, new Date("2026-01-15T20:00:00Z")), "PST");
});

test("delivery windows: ASAP while open, then half-hour slots", () => {
  const open = deliveryWindows(DEMO_ZONE, la("12:00"));
  assert.equal(open[0]?.value, "asap");
  assert.match(open[0]!.label, /As soon as possible \(about 35–50 min\)/);
  // 12:00 + 50 min, rounded up to the half hour.
  assert.equal(open[1]?.label, "Today, 1pm–1:30pm");
  assert.ok(open.length <= 8);

  const early = deliveryWindows(DEMO_ZONE, la("09:00"));
  assert.equal(early[0]?.label, "Today, 11:30am–12pm");
  assert.ok(early.every((w) => w.value !== "asap"));

  const late = deliveryWindows(DEMO_ZONE, la("22:00"));
  assert.equal(late[0]?.label, "Tomorrow, 11:30am–12pm");

  const closing = deliveryWindows(DEMO_ZONE, la("21:00"));
  assert.deepEqual(
    closing.map((w) => w.value),
    ["asap"],
  );
});

test("price summary: delivery fee, free-delivery threshold and tax", () => {
  assert.deepEqual(priceSummary(2000, DEMO_ZONE), {
    subtotal: 2000,
    delivery: 299,
    tax: 180,
    tip: 0,
    total: 2479,
  });
  assert.equal(priceSummary(3500, DEMO_ZONE).delivery, 0);
  assert.deepEqual(priceSummary(0, DEMO_ZONE), {
    subtotal: 0,
    delivery: 0,
    tax: 0,
    tip: 0,
    total: 0,
  });
  assert.equal(priceSummary(1999, DEMO_ZONE).tax, 180);
});

test("tips are a percent of the subtotal and part of the total", () => {
  const withTip = priceSummary(2000, DEMO_ZONE, 15);
  assert.equal(withTip.tip, 300);
  assert.equal(withTip.total, 2000 + 299 + 180 + 300);
  assert.ok(DEMO_ZONE.tipPercents?.includes(0), "no tip is always a choice");
});

test("menu availability and options come from the zone", () => {
  const hot = { id: "tikka-masala", spice: 2, price: 1500 };
  const mild = { id: "butter-chicken", spice: 1, price: 1500 };
  assert.deepEqual(menuStatus(hot, DEMO_ZONE), { available: true });
  const gone = menuStatus({ id: "osso-buco", spice: 0, price: 2800 }, DEMO_ZONE);
  assert.equal(gone.available, false);
  assert.deepEqual(
    optionGroupsFor(hot, DEMO_ZONE).map((g) => g.id),
    ["heat"],
  );
  assert.deepEqual(optionGroupsFor(mild, DEMO_ZONE), []);
  assert.deepEqual(defaultOptions(hot, DEMO_ZONE), { heat: "as-written" });
  assert.equal(unitPrice(hot, DEMO_ZONE, { heat: "milder" }), 1500);
  assert.deepEqual(describeOptions(hot, DEMO_ZONE, { heat: "as-written" }), []);
  assert.deepEqual(describeOptions(hot, DEMO_ZONE, { heat: "milder" }), ["Heat: Milder"]);
});
