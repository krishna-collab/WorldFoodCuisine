#!/usr/bin/env node
/**
 * Browser QA for WorldFoodCuisine, run against a production build:
 *
 *   npm run build && npm run preview     # serves http://127.0.0.1:8081
 *   npm run qa                           # in a second terminal
 *
 * Sections (QA_ONLY picks some, e.g. QA_ONLY=flows,a11y):
 *   flows    Browsing (search in local scripts and without accents, filters,
 *            dish pages that ask for a ZIP before showing prices) and the demo
 *            order across two kitchens (ZIP check, options, bag, switching to a
 *            kitchen with other prices and a sold-out dish, checkout details,
 *            review, place, confirmation), at 390px and 1440px.
 *   offline  A dish saved from the menu opens and works with the network off;
 *            the bag survives; checkout won't place an order.
 *   a11y     axe-core WCAG 2.0/2.1/2.2 A and AA rules on every page, overlay and
 *            checkout stage at 390, 768, 1024, 1280, 1440 and 1920px, in light
 *            and dark; sideways-scroll checks; keyboard focus checks.
 *   perf     Lab LCP, CLS and interaction latency (a stand-in for INP) on a
 *            throttled phone profile. Real Core Web Vitals come from field data.
 *
 * Env: BASE_URL (default http://127.0.0.1:8081), CHROMIUM_PATH (a Chromium
 * binary, when Playwright's own browser isn't installed), QA_OUT (default .qa).
 * Writes QA_OUT/qa-results.json and screenshots of failures; exits 1 on failure.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import http from "node:http";
import https from "node:https";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const BASE = (process.env.BASE_URL || "http://127.0.0.1:8081").replace(/\/$/, "");
const OUT = process.env.QA_OUT || ".qa";
const ONLY = new Set(
  (process.env.QA_ONLY || "flows,offline,a11y,perf").split(",").map((s) => s.trim()),
);
const AXE = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const WIDTHS = (process.env.QA_WIDTHS || "390,768,1024,1280,1440,1920").split(",").map(Number);
const SCHEMES = (process.env.QA_SCHEMES || "light,dark").split(",");
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
const DESKTOP = { viewport: { width: 1440, height: 900 } };

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  args: ["--disable-background-networking"],
});

/* ─── Helpers ─────────────────────────────────────────────────────────── */

const results = [];
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function record(section, name, ok, detail = "") {
  results.push({ section, name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${section} · ${name}${detail ? ` — ${detail}` : ""}`);
}

/** Run one check; a failure keeps a screenshot and doesn't stop the run. */
async function check(section, name, page, fn) {
  try {
    const detail = await fn();
    record(section, name, true, typeof detail === "string" ? detail : "");
    return true;
  } catch (error) {
    record(section, name, false, String(error?.message ?? error).split("\n")[0].slice(0, 300));
    await page?.screenshot({ path: `${OUT}/fail-${slug(section)}-${slug(name)}.png` }).catch(() => {});
    return false;
  }
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    // The not-found check asks for a missing page on purpose.
    if (/no-such-page/.test(m.location()?.url ?? "")) return;
    errors.push(`console: ${m.text().slice(0, 200)} (${m.location()?.url ?? ""})`);
  });
  return errors;
}

async function go(page, path) {
  await page.goto(BASE + path, { waitUntil: "load" });
  // Route code loads after "load"; wait for it so clicks reach a hydrated page.
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
}

const squash = (s) => s.replace(/\s+/g, " ").trim();
const textOf = async (locator) => squash(await locator.innerText());
const dollars = (s) => Number(String(s).replace(/[^0-9.]/g, ""));

/** Wait until a condition in the page holds. */
async function until(page, fn, arg, timeout = 5000) {
  await page.waitForFunction(fn, arg, { timeout });
}

/** Poll an async check in the page (waitForFunction doesn't await promises). */
async function poll(page, fn, arg, timeout = 10000) {
  const end = Date.now() + timeout;
  for (;;) {
    if (await page.evaluate(fn, arg).catch(() => false)) return;
    if (Date.now() > end) throw new Error(`timed out after ${timeout} ms`);
    await page.waitForTimeout(250);
  }
}

/**
 * A pass-through proxy in front of BASE that the offline check can cut, so
 * requests fail the way they do with no signal, including the service
 * worker's own requests (which browser offline emulation doesn't reach).
 */
async function startProxy() {
  const target = new URL(BASE);
  const client = target.protocol === "https:" ? https : http;
  let offline = false;
  const server = http.createServer((req, res) => {
    if (offline) return void req.socket.destroy();
    const upstream = client.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || undefined,
        method: req.method,
        path: req.url,
        headers: { ...req.headers, host: target.host },
      },
      (up) => {
        res.writeHead(up.statusCode ?? 502, up.headers);
        up.pipe(res);
      },
    );
    upstream.on("error", () => res.destroy());
    req.pipe(upstream);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    setOffline(value) {
      offline = value;
      if (value) server.closeAllConnections();
    },
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  };
}

/** A demo area and a two-dish bag, the way a returning visitor would have them. */
async function seedDemo(context) {
  await context.addInitScript(() => {
    try {
      if (sessionStorage.getItem("qa-seeded")) return;
      sessionStorage.setItem("qa-seeded", "1");
      localStorage.setItem(
        "wfc-delivery-area",
        JSON.stringify({ state: { postalCode: "95112", demo: true }, version: 0 }),
      );
      localStorage.setItem(
        "wfc-cart",
        JSON.stringify({
          state: { items: [{ dishId: "chicken-momo", qty: 2 }, { dishId: "palak-paneer", qty: 1 }] },
          version: 0,
        }),
      );
      localStorage.setItem("wfc-saved", JSON.stringify({ state: { ids: ["chicken-momo", "pad-thai"] }, version: 0 }));
    } catch {
      // Storage blocked: the pages still render.
    }
  });
}

/* ─── Flow 1: browse the menu ─────────────────────────────────────────── */

async function browseFlow(label, options) {
  const S = `browse ${label}`;
  const context = await browser.newContext({ ...options, serviceWorkers: "block" });
  const page = await context.newPage();
  const errors = watchErrors(page);
  const phone = options.viewport.width < 1024;

  await check(S, "home shows a dish in the first screen", page, async () => {
    await go(page, "/");
    const img = await page.evaluate(() => {
      const el = [...document.images].find(
        (i) => /food|_vercel\/image/.test(i.currentSrc || i.src) && i.getBoundingClientRect().height > 100,
      );
      if (!el) return null;
      return { top: el.getBoundingClientRect().top, loaded: el.complete && el.naturalWidth > 0 };
    });
    expect(img, "no dish image on the home page");
    expect(img.loaded, "the first dish image didn't load");
    expect(img.top < options.viewport.height / 2, `first dish image starts at ${Math.round(img.top)}px`);
    await page.getByRole("heading", { level: 1, name: /cooked to order and delivered/ }).waitFor();
    await page.getByRole("button", { name: "Find your kitchen" }).first().waitFor();
    return `first dish image ${Math.round(img.top)}px from the top`;
  });

  await check(S, "search: local scripts, no accents, ingredients", page, async () => {
    await go(page, "/menu");
    const box = page.getByRole("searchbox", { name: /Search dishes/ });
    const cases = [
      ["tamales oaxaquenos", "Tamales Oaxaqueños"],
      ["tiramisù", "Tiramisu"],
      ["पालक", "Palak Paneer"],
      ["ಮಸಾಲ", "Masala Dosa"],
    ];
    for (const [query, name] of cases) {
      await box.fill(query);
      await page.getByRole("heading", { level: 3, name, exact: true }).waitFor({ timeout: 5000 });
    }
    await box.fill("timur");
    await page.getByText(/^Has timur/).first().waitFor();
    const heading = await textOf(page.locator("#results-heading"));
    await box.fill("");
    return `4 name searches found their dish; “timur” → ${heading}`;
  });

  await check(S, "filters: cuisine + diet, counts, pills, URL; kitchen filter asks for a ZIP", page, async () => {
    await go(page, "/menu");
    let scope = page.getByRole("complementary", { name: "Filters" });
    if (phone) {
      await page.getByRole("button", { name: /^Filters/ }).click();
      scope = page.getByRole("dialog", { name: "Filters" });
      await scope.waitFor();
    }
    await scope.getByRole("button", { name: "Check your ZIP" }).waitFor();
    await scope.getByRole("button", { name: /^Nepal\b/ }).click();
    await scope.getByRole("button", { name: /^Vegetarian\b/ }).click();
    await until(page, () => new URL(location.href).searchParams.get("diet") === "vegetarian");
    let shown = null;
    if (phone) {
      const show = scope.getByRole("button", { name: /^Show \d+ dish/ });
      shown = Number((await show.innerText()).match(/\d+/)[0]);
      await show.click();
      await scope.waitFor({ state: "hidden" });
      const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
      expect(/^Filters/.test(focused ?? ""), `focus went to “${focused}” after closing the sheet`);
    }
    expect(new URL(page.url()).searchParams.get("cuisine") === "nepal", `URL is ${page.url()}`);
    const cards = page.locator('section[aria-labelledby="results-heading"] article');
    await until(page, (n) => document.querySelectorAll('section[aria-labelledby="results-heading"] article').length === n || n === null, shown);
    const n = await cards.count();
    expect(n > 0, "no dishes left");
    if (shown !== null) expect(shown === n, `sheet said ${shown}, page shows ${n}`);
    for (const eyebrow of await cards.locator("p.eyebrow").allInnerTexts()) {
      expect(/^nepal/i.test(eyebrow), `a non-Nepali dish is showing: ${eyebrow}`);
    }
    const pills = page.getByRole("list", { name: "Filters on" });
    await pills.getByRole("button", { name: /^Nepal/ }).click();
    await until(page, () => !new URL(location.href).searchParams.get("cuisine"));
    await pills.getByRole("button", { name: "Clear all" }).click();
    await until(page, () => !new URL(location.href).searchParams.get("diet"));
    return `${n} Nepali vegetarian dishes; pills and Clear all work`;
  });

  await check(S, "dish page: ordering asks for a ZIP before any price", page, async () => {
    await go(page, "/menu/nepal");
    await page.getByRole("link", { name: "Chicken Momo", exact: true }).first().click();
    await page.waitForURL(/\/dish\/chicken-momo$/);
    await page.getByRole("heading", { level: 1, name: "Chicken Momo" }).waitFor();
    const order = page.getByRole("region", { name: "Order Chicken Momo" });
    await order.getByText("No kitchen is open yet").waitFor();
    expect((await order.getByText(/\$\d/).count()) === 0, "a price shows with no kitchen");
    expect((await page.getByText(/Cook it|guided recipe|Start cooking/i).count()) === 0, "cooking UI is still on the page");
    const allergens = await textOf(page.locator('section[aria-labelledby="whats-in-it"]'));
    expect(/draft|not yet/i.test(allergens), "allergen status isn't shown");
    return "no price until a kitchen serves the ZIP; no cooking UI";
  });

  await check(S, "no console errors", page, async () => {
    expect(errors.length === 0, errors.slice(0, 3).join(" | "));
  });
  await context.close();
}

/* ─── Flow 2: demo order across two kitchens ─────────────────────────── */

async function setZip(page, zip) {
  const dialog = page.getByRole("dialog", { name: "Find your kitchen" });
  await dialog.waitFor();
  await dialog.getByLabel("ZIP code").fill(zip);
  await dialog.getByRole("button", { name: "Check" }).click();
  return dialog;
}

async function orderFlow(label, options) {
  const S = `order ${label}`;
  const context = await browser.newContext({ ...options, serviceWorkers: "block" });
  const page = await context.newPage();
  const errors = watchErrors(page);

  await check(S, "ZIP check: validation, demo kitchen, honest labels", page, async () => {
    await go(page, "/dish/chicken-momo");
    await page.getByRole("button", { name: "Try ordering in demo mode" }).click();
    const dialog = await setZip(page, "951");
    await dialog.getByText("Enter a 5-digit US ZIP code").waitFor();
    await setZip(page, "95112");
    await dialog.getByText("Demo kitchen West delivers to 95112").waitFor();
    await dialog.getByText(/Demo mode: these are example numbers/).waitFor();
    await dialog.getByRole("button", { name: "Continue" }).click();
    await dialog.waitFor({ state: "hidden" });
    await page.getByText("demo price").first().waitFor();
    await page.getByText(/From\s*Demo kitchen West\s*to 95112/).waitFor();
    await page.getByText(/Demo mode:\s*nothing is sent or charged/).first().waitFor();
    return "bad ZIP rejected; 95112 → Demo kitchen West; prices say demo";
  });

  await check(S, "options, quantity and add to bag (no pop-up bag)", page, async () => {
    await page.getByText("Milder", { exact: true }).click();
    await page.getByRole("button", { name: /More portions/ }).click();
    const add = page.getByRole("button", { name: /^Add to bag/ });
    const label = await textOf(add);
    await add.click();
    await page.getByText(/2 × Chicken Momo added \(demo\)/).waitFor();
    await page.getByRole("button", { name: "View bag" }).waitFor();
    await page.getByRole("button", { name: "Bag, 2 items" }).waitFor();
    expect((await page.getByRole("dialog").count()) === 0, "the bag popped open on add");
    await go(page, "/dish/mole-poblano");
    await page.getByRole("button", { name: /^Add to bag/ }).click();
    await page.getByRole("button", { name: "Bag, 3 items" }).waitFor();
    return `${label}; then Mole Poblano`;
  });

  await check(S, "a dish this kitchen isn't making can't be added", page, async () => {
    await go(page, "/dish/osso-buco");
    await page.getByText("Sold out today").first().waitFor();
    expect((await page.getByRole("button", { name: /^Add to bag/ }).count()) === 0, "Osso Buco can still be added");
    return "Osso Buco is sold out at Demo kitchen West, with no Add button";
  });

  await check(S, "switching kitchens: new prices, a sold-out dish blocks checkout", page, async () => {
    await go(page, "/dish/chicken-momo");
    await page.getByRole("button", { name: "Change ZIP code" }).click();
    const dialog = await setZip(page, "10001");
    await dialog.getByText("Demo kitchen East delivers to 10001").waitFor();
    await dialog.getByRole("button", { name: "Continue" }).click();
    await page.getByText(/From\s*Demo kitchen East\s*to 10001/).waitFor();
    await page.getByText("$13.50").first().waitFor();
    await page.getByRole("button", { name: "Bag, 3 items" }).click();
    const bag = page.getByRole("dialog", { name: "Your bag" });
    await bag.waitFor();
    await bag.getByText("Sold out today").waitFor();
    await bag.getByText(/isn’t making one dish in your bag today/).waitFor();
    expect((await bag.getByRole("link", { name: /^Checkout/ }).count()) === 0, "checkout offered with a sold-out dish");
    const body = await textOf(bag);
    expect(/Heat: Milder/.test(body), "the chosen option isn't shown");
    expect(/Demo kitchen East/.test(body), "the bag doesn't name the kitchen");
    await bag.getByRole("button", { name: "Remove Mole Poblano" }).click();
    await bag.getByRole("link", { name: /^Checkout/ }).click();
    await page.waitForURL(/\/checkout/);
    return "East prices Chicken Momo at $13.50; sold-out Mole blocks checkout until removed";
  });

  let total = 0;
  await check(S, "checkout details: no card fields, error summary, guest", page, async () => {
    await page.getByText("This is a demo checkout.").waitFor();
    const cardFields = await page.locator('input[autocomplete^="cc-"], input[name*="card" i], input[id*="card" i]').count();
    expect(cardFields === 0, `${cardFields} card fields on the page`);
    await page.getByRole("button", { name: "Review order" }).click();
    const summary = page.getByRole("alert").filter({ hasText: /things? to fix/ });
    await summary.waitFor();
    const links = await summary.getByRole("link").count();
    expect(links === 4, `${links} errors listed, expected 4`);
    const focusedIsSummary = await page.evaluate(() => document.activeElement?.getAttribute("role") === "alert");
    expect(focusedIsSummary, "focus didn't move to the error summary");
    await summary.getByRole("link").first().click();
    const focusedId = await page.evaluate(() => document.activeElement?.id);
    expect(Boolean(focusedId) && (await page.getByLabel("Street address").getAttribute("id")) === focusedId, "the error link didn't focus its field");
    await page.getByLabel("Street address").fill("1 Test Street");
    await page.getByLabel("City").fill("New York");
    await page.getByLabel("Name", { exact: true }).fill("Sam Test");
    await page.getByLabel("Phone").fill("(212) 555-0100");
    await page.getByText(/^15% ·/).click();
    await page.getByRole("button", { name: "Review order" }).click();
    await page.getByRole("button", { name: /^Place demo order/ }).waitFor();
    return "4 errors linked to their fields; guest details accepted";
  });

  await check(S, "review: every cost before placing, and they add up", page, async () => {
    const pay = page.getByRole("complementary", { name: "Payment summary" });
    const rows = Object.fromEntries(
      (await pay.locator("dt").allInnerTexts()).map((dt, i) => [squash(dt), i]),
    );
    const values = await pay.locator("dd").allInnerTexts();
    const get = (re) => {
      const key = Object.keys(rows).find((k) => re.test(k));
      expect(key !== undefined, `no ${re} line`);
      return values[rows[key]] === undefined ? NaN : /free/i.test(values[rows[key]]) ? 0 : dollars(values[rows[key]]);
    };
    const subtotal = get(/^Subtotal/);
    const delivery = get(/^Delivery/);
    const tax = get(/^Tax/);
    const tip = get(/^Tip/);
    total = get(/^(Demo )?total$/i);
    expect(Math.abs(subtotal - 27) < 0.011, `subtotal is ${subtotal}, expected 2 × $13.50 at East`);
    expect(Math.abs(subtotal + delivery + tax + tip - total) < 0.011, `${subtotal} + ${delivery} + ${tax} + ${tip} ≠ ${total}`);
    const button = dollars((await page.getByRole("button", { name: /^Place demo order/ }).innerText()).split("·")[1]);
    expect(Math.abs(button - total) < 0.011, `button says ${button}, total is ${total}`);
    const review = await textOf(page.locator("main"));
    const allergens = await textOf(page.locator('section[aria-labelledby="review-allergens"]'));
    expect(/Milk/.test(allergens) && /Wheat/.test(allergens), `allergens on the review step: ${allergens}`);
    expect(/delivery time|Today|Tomorrow|As soon as possible/i.test(review), "no delivery window on the review");
    await page.getByRole("button", { name: /^Edit\s+delivery/i }).click();
    await page.getByRole("button", { name: "Review order" }).click();
    await page.getByRole("button", { name: /^Place demo order/ }).waitFor();
    return `$${subtotal.toFixed(2)} + $${delivery.toFixed(2)} delivery + $${tax.toFixed(2)} tax + $${tip.toFixed(2)} tip = $${total.toFixed(2)}`;
  });

  await check(S, "place: confirmation names the kitchen, says demo, bag empties", page, async () => {
    await page.getByRole("button", { name: /^Place demo order/ }).click();
    await page.waitForURL(/\/order\/DEMO-\d+/);
    await page.getByText("This was a demo. Nothing was sent to a kitchen.").waitFor();
    await page.getByText(/No card was charged/).waitFor();
    await page.getByText("Demo kitchen East").first().waitFor();
    await page.getByRole("button", { name: "Bag, empty" }).waitFor();
    return new URL(page.url()).pathname;
  });

  await check(S, "no console errors", page, async () => {
    expect(errors.length === 0, errors.slice(0, 3).join(" | "));
  });
  await context.close();
}

/* ─── Offline ─────────────────────────────────────────────────────────── */

async function offlineFlow() {
  const S = "offline";
  const proxy = await startProxy();
  const at = (path) => proxy.url + path;
  const context = await browser.newContext({ ...PHONE, serviceWorkers: "allow" });
  // Someone who had set up demo ordering before losing signal.
  await context.addInitScript(() => {
    if (!localStorage.getItem("wfc-delivery-area")) {
      localStorage.setItem("wfc-delivery-area", JSON.stringify({ state: { postalCode: "95112", demo: true }, version: 0 }));
    }
  });
  const page = await context.newPage();
  const errors = watchErrors(page);

  const goOffline = async (value) => {
    proxy.setOffline(value);
    await context.setOffline(value);
  };

  await check(S, "service worker installs", page, async () => {
    await page.goto(at("/menu"), { waitUntil: "networkidle" });
    await poll(page, () => navigator.serviceWorker.ready.then(() => Boolean(navigator.serviceWorker.controller)), undefined, 15000);
    return "registered and controlling the page";
  });

  await check(S, "saving a dish from the menu keeps its page, image and scripts", page, async () => {
    await page.getByRole("button", { name: "Save Chicken Momo" }).first().click();
    await poll(
      page,
      async () => {
        const keys = (await (await caches.open("wfc-saved")).keys()).map((r) => new URL(r.url).pathname);
        // The image is saved last, so once it's there the page and its scripts are too.
        return (
          keys.includes("/dish/chicken-momo") &&
          keys.some((k) => k.startsWith("/assets/dish._id")) &&
          keys.some((k) => k.startsWith("/food/chicken-momo"))
        );
      },
      undefined,
      20000,
    );
    const kept = await page.evaluate(async () => (await (await caches.open("wfc-saved")).keys()).length);
    // A draft bag, the way it would be left before losing signal.
    await page.evaluate(() =>
      localStorage.setItem(
        "wfc-cart",
        JSON.stringify({ state: { items: [{ dishId: "chicken-momo", qty: 1 }] }, version: 0 }),
      ),
    );
    return `${kept} files kept, though the dish page was never opened`;
  });

  await goOffline(true);

  await check(S, "saved dish opens and works with no network; the bag is still there", page, async () => {
    await page.goto(at("/dish/chicken-momo"), { waitUntil: "load" });
    await page.getByRole("heading", { level: 1, name: "Chicken Momo" }).waitFor();
    const img = await page.evaluate(() => {
      const el = [...document.images].find((i) => /food|_vercel\/image/.test(i.currentSrc || i.src));
      return el ? el.complete && el.naturalWidth > 0 : false;
    });
    expect(img, "the dish image didn't load offline");
    await page.getByRole("button", { name: /More portions/ }).click();
    await page.getByRole("button", { name: /^Add to bag · \$25\.80/ }).waitFor();
    await page.getByRole("button", { name: /^Bag, 1 item/ }).click();
    await page.getByText("You’re offline. Your bag is saved; checkout needs a connection.").waitFor();
    expect((await page.getByRole("link", { name: /^Checkout/ }).count()) === 0, "checkout is still offered offline");
    await page.keyboard.press("Escape");
    return "page, image and ordering controls work; bag kept; checkout says it needs a connection";
  });

  await check(S, "checkout offline shows the offline page, not a form", page, async () => {
    await page.goto(at("/checkout"), { waitUntil: "load" });
    const body = await textOf(page.locator("body"));
    expect(/offline/i.test(body), `checkout offline shows: ${body.slice(0, 80)}`);
    expect((await page.getByRole("button", { name: /Place demo order/ }).count()) === 0, "an order can be placed offline");
    return body.slice(0, 60);
  });

  await goOffline(false);
  await check(S, "no errors apart from failed requests while offline", page, async () => {
    const real = errors.filter((e) => !/Failed to load resource|net::ERR|503|Failed to fetch/.test(e));
    expect(real.length === 0, real.slice(0, 3).join(" | "));
  });
  await context.close();
  await proxy.close();
}

/* ─── Accessibility and layout at every width, light and dark ─────────── */

async function axe(page) {
  if (!(await page.evaluate(() => Boolean(window.axe)))) await page.addScriptTag({ content: AXE });
  return page.evaluate(
    async (tags) => {
      const r = await window.axe.run(document, {
        runOnly: { type: "tag", values: tags },
        resultTypes: ["violations"],
      });
      return r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.slice(0, 4).map((n) => ({ target: n.target.join(" "), summary: n.failureSummary?.split("\n").slice(0, 3).join(" ") })),
        count: v.nodes.length,
      }));
    },
    WCAG,
  );
}

async function layout(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const clipped = (el) => {
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(a).overflowX)) return true;
      }
      return false;
    };
    const wide = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if ((r.right > vw + 1 || r.left < -1) && !clipped(el)) {
        wide.push(`${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}.${String(el.className).split(" ").slice(0, 3).join(".")}`);
      }
    }
    return { sideways: document.documentElement.scrollWidth > vw + 1, wide: wide.slice(0, 3) };
  });
}

/** Each state sets up the page; they run in order in one browser context. */
const STATES = [
  ["home", (p) => go(p, "/")],
  ["search dialog", async (p) => {
    await go(p, "/");
    await p.keyboard.press("/");
    await p.getByRole("dialog").waitFor();
    await p.keyboard.type("momo");
    await p.waitForTimeout(250);
  }],
  ["menu", (p) => go(p, "/menu")],
  ["menu, filtered", (p) => go(p, "/menu?cuisine=nepal&diet=vegetarian&taste=tangy")],
  ["menu, nothing matches", (p) => go(p, "/menu?q=zzzz")],
  ["menu, filter sheet", async (p, w) => {
    if (w >= 1024) return "skip";
    await go(p, "/menu");
    await p.getByRole("button", { name: /^Filters/ }).click();
    await p.getByRole("dialog", { name: "Filters" }).waitFor();
    await p.waitForTimeout(400);
  }],
  ["site menu sheet", async (p, w) => {
    if (w >= 1024) return "skip";
    await go(p, "/");
    await p.getByRole("button", { name: "Open menu" }).click();
    await p.getByRole("dialog").waitFor();
    await p.waitForTimeout(400);
  }],
  ["cuisines menu", async (p, w) => {
    if (w < 1024) return "skip";
    await go(p, "/");
    await p.getByRole("button", { name: /^Cuisines/ }).click();
    await p.getByRole("menu").waitFor();
  }],
  ["cuisine page", (p) => go(p, "/menu/nepal")],
  ["dish, ordering", (p) => go(p, "/dish/chicken-momo")],
  ["dish, sold out here", (p) => go(p, "/dish/osso-buco")],
  ["dish, other kitchen's price", async (p) => {
    await go(p, "/dish/pad-thai");
    await p.getByRole("button", { name: "Change ZIP code" }).click();
    const dialog = p.getByRole("dialog", { name: "Find your kitchen" });
    await dialog.getByLabel("ZIP code").fill("10001");
    await dialog.getByRole("button", { name: "Check" }).click();
    await dialog.getByText("Demo kitchen East delivers to 10001").waitFor();
  }],
  ["ZIP dialog with a result", async (p) => {
    await p.keyboard.press("Escape");
    await p.getByRole("button", { name: "Change ZIP code" }).click();
    const dialog = p.getByRole("dialog", { name: "Find your kitchen" });
    await dialog.getByLabel("ZIP code").fill("95112");
    await dialog.getByRole("button", { name: "Check" }).click();
    await dialog.getByText("Demo kitchen West delivers to 95112").waitFor();
  }],
  ["menu, today's menu at your kitchen", async (p) => {
    await p.keyboard.press("Escape");
    await go(p, "/menu?available=true&sort=price");
  }],
  ["bag", async (p) => {
    await go(p, "/menu/india");
    await p.getByRole("button", { name: /^Bag, / }).click();
    await p.getByRole("dialog").waitFor();
    await p.waitForTimeout(400);
  }],
  ["bag with a dish this kitchen isn't making", async (p) => {
    await p.keyboard.press("Escape");
    await go(p, "/dish/mole-poblano");
    await p.getByRole("button", { name: /^Add to bag/ }).click();
    await p.getByRole("button", { name: "Change ZIP code" }).click();
    const dialog = p.getByRole("dialog", { name: "Find your kitchen" });
    await dialog.getByLabel("ZIP code").fill("10001");
    await dialog.getByRole("button", { name: "Check" }).click();
    await dialog.getByRole("button", { name: "Continue" }).click();
    await p.getByRole("button", { name: /^Bag, / }).click();
    await p.getByRole("dialog", { name: "Your bag" }).getByText("Sold out today").waitFor();
    await p.waitForTimeout(400);
  }],
  ["locations", async (p) => {
    // Back to the seeded bag and kitchen for the checkout states that follow.
    await p.evaluate(() => {
      localStorage.setItem("wfc-delivery-area", JSON.stringify({ state: { postalCode: "95112", demo: true }, version: 0 }));
      localStorage.setItem(
        "wfc-cart",
        JSON.stringify({ state: { items: [{ dishId: "chicken-momo", qty: 2 }, { dishId: "palak-paneer", qty: 1 }] }, version: 0 }),
      );
    });
    await go(p, "/delivery");
  }],
  ["saved", (p) => go(p, "/saved")],
  ["checkout, errors", async (p) => {
    await go(p, "/checkout");
    await p.getByRole("button", { name: "Review order" }).click();
    await p.getByRole("alert").filter({ hasText: /to fix/ }).waitFor();
  }],
  ["checkout, review", async (p) => {
    await p.getByRole("button", { name: "Fill in sample details" }).click();
    await p.getByRole("button", { name: "Review order" }).click();
    await p.getByRole("button", { name: /^Place demo order/ }).waitFor();
  }],
  ["order confirmation", async (p) => {
    await p.getByRole("button", { name: /^Place demo order/ }).click();
    await p.waitForURL(/\/order\//);
    await p.getByText(/This was a demo/).waitFor();
  }],
  ["ingredients", (p) => go(p, "/ingredients")],
  ["not found", (p) => go(p, "/no-such-page")],
];

async function a11yRun(width, scheme) {
  const context = await browser.newContext({
    viewport: { width, height: width < 768 ? 844 : 900 },
    isMobile: width < 768,
    hasTouch: width < 1024,
    colorScheme: scheme,
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  await seedDemo(context);
  const page = await context.newPage();
  const errors = watchErrors(page);
  const out = [];
  for (const [name, setup] of STATES) {
    const row = { width, scheme, state: name };
    const t0 = Date.now();
    try {
      // One retry: a busy machine can make a single navigation time out.
      const skipped = await setup(page, width).catch(async () => {
        await page.keyboard.press("Escape").catch(() => {});
        return setup(page, width);
      });
      if (skipped === "skip") continue;
      await page.waitForTimeout(150);
      row.violations = await axe(page);
      Object.assign(row, await layout(page));
    } catch (error) {
      row.error = String(error?.message ?? error).split("\n")[0].slice(0, 200);
      await page.screenshot({ path: `${OUT}/a11y-error-${width}-${scheme}-${slug(name)}.png` }).catch(() => {});
    }
    row.ms = Date.now() - t0;
    if (process.env.QA_VERBOSE) console.log(`  ${width} ${scheme} ${name}: ${row.ms} ms, ${row.violations?.length ?? "?"} violations${row.error ? `, error: ${row.error}` : ""}`);
    out.push(row);
  }
  out.push({ width, scheme, state: "console", errors: errors.slice(0, 5) });
  await context.close();
  return out;
}

/** Tab through a page: the skip link comes first, focus is always visible and never hidden. */
async function focusRun(label, options, path, tabs = 40) {
  const context = await browser.newContext({ ...options, reducedMotion: "reduce", serviceWorkers: "block" });
  await seedDemo(context);
  const page = await context.newPage();
  await go(page, path);
  const problems = [];
  let first = "";
  for (let i = 0; i < tabs; i++) {
    await page.keyboard.press("Tab");
    // Let the focus style settle (the ring appears a frame after the key press).
    await page.waitForTimeout(50);
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const name = (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().replace(/\s+/g, " ").slice(0, 40);
      const s = getComputedStyle(el);
      const outline = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0;
      const shadow = s.boxShadow && s.boxShadow !== "none";
      // Cards draw their focus ring on an overlay span next to the link.
      const ring = [...(el.closest(".group")?.querySelectorAll("span[aria-hidden]") ?? [])].some(
        (sp) => getComputedStyle(sp).boxShadow !== "none",
      );
      // Labels around visually hidden radios show the ring on the label.
      const label = el.closest("label");
      const labelRing = label ? getComputedStyle(label).outlineStyle !== "none" : false;
      const r = el.getBoundingClientRect();
      const box = label && r.width <= 1 ? label.getBoundingClientRect() : r;
      const x = Math.min(Math.max(box.left + box.width / 2, 0), innerWidth - 1);
      const y = Math.min(Math.max(box.top + box.height / 2, 0), innerHeight - 1);
      const hit = document.elementFromPoint(x, y);
      const covered = hit && !(el.contains(hit) || hit.contains(el) || (label && (label.contains(hit) || hit.contains(label))));
      const coveredBy = covered ? `${hit.tagName.toLowerCase()}.${String(hit.className).split(" ").slice(0, 2).join(".")}` : "";
      return { name, visible: outline || shadow || ring || labelRing, covered: Boolean(covered), coveredBy };
    });
    if (!info) continue;
    if (i === 0) first = info.name;
    if (!info.visible) problems.push(`no visible focus on “${info.name}”`);
    if (info.covered) problems.push(`“${info.name}” is hidden under ${info.coveredBy}`);
  }
  await context.close();
  const S = `keyboard ${label}`;
  record(S, `${path}: skip link first`, /Skip to content/.test(first), `first stop: “${first}”`);
  record(S, `${path}: focus visible and not covered (${tabs} stops)`, problems.length === 0, [...new Set(problems)].slice(0, 4).join("; "));
}

/* ─── Performance (lab) ───────────────────────────────────────────────── */

async function perfRun(path, interact) {
  const context = await browser.newContext({ ...PHONE, deviceScaleFactor: 2, serviceWorkers: "block" });
  await seedDemo(context);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.addInitScript(() => {
    window.__vitals = { lcp: 0, cls: 0, events: [] };
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__vitals.lcp = e.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__vitals.cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (e.interactionId) window.__vitals.events.push(e.duration);
    }).observe({ type: "event", durationThreshold: 16, buffered: true });
  });
  await page.goto(BASE + path, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  let interaction = "";
  if (interact) {
    interaction = await interact(page);
    await page.waitForTimeout(800);
  }
  const v = await page.evaluate(() => ({
    ...window.__vitals,
    bytes: performance
      .getEntriesByType("resource")
      .concat(performance.getEntriesByType("navigation"))
      .reduce((n, e) => n + (e.transferSize || 0), 0),
  }));
  await context.close();
  const inp = v.events.length ? Math.max(...v.events) : null;
  return { path, lcp: Math.round(v.lcp), cls: Number(v.cls.toFixed(3)), inp, interaction, kb: Math.round(v.bytes / 1024) };
}

/* ─── Run ─────────────────────────────────────────────────────────────── */

const started = Date.now();
const report = { base: BASE, date: new Date().toISOString() };

if (ONLY.has("flows")) {
  await browseFlow("390px", PHONE);
  await browseFlow("1440px", DESKTOP);
  await orderFlow("390px", PHONE);
  await orderFlow("1440px", DESKTOP);
}

if (ONLY.has("offline")) await offlineFlow();

if (ONLY.has("a11y")) {
  const runs = WIDTHS.flatMap((w) => SCHEMES.map((scheme) => [w, scheme]));
  const rows = [];
  const queue = [...runs];
  await Promise.all(
    Array.from({ length: Number(process.env.QA_PARALLEL || 3) }, async () => {
      for (let job = queue.shift(); job; job = queue.shift()) rows.push(...(await a11yRun(...job)));
    }),
  );
  report.a11y = rows;
  for (const [w, scheme] of runs) {
    const mine = rows.filter((r) => r.width === w && r.scheme === scheme && r.state !== "console");
    const violations = mine.flatMap((r) => (r.violations ?? []).map((v) => `${r.state}: ${v.id} (${v.count}) ${v.nodes[0]?.target ?? ""}`));
    const broken = mine.filter((r) => r.error).map((r) => `${r.state}: ${r.error}`);
    const sideways = mine.filter((r) => r.sideways || r.wide?.length).map((r) => `${r.state}: ${r.wide?.join(", ") || "page scrolls sideways"}`);
    const S = `a11y ${w}px ${scheme}`;
    record(S, `axe WCAG 2.2 AA on ${mine.length} states`, violations.length === 0, violations.slice(0, 4).join(" | "));
    record(S, "every state could be set up", broken.length === 0, broken.slice(0, 3).join(" | "));
    record(S, "nothing wider than the screen", sideways.length === 0, sideways.slice(0, 3).join(" | "));
    const consoleRow = rows.find((r) => r.width === w && r.scheme === scheme && r.state === "console");
    record(S, "no console errors", !consoleRow?.errors?.length, consoleRow?.errors?.slice(0, 2).join(" | ") ?? "");
  }
  for (const [label, options] of [
    ["390px", PHONE],
    ["1440px", DESKTOP],
  ]) {
    for (const path of ["/", "/menu", "/dish/chicken-momo", "/delivery", "/checkout"]) {
      await focusRun(label, options, path);
    }
  }
}

if (ONLY.has("perf")) {
  const pages = [
    ["/", null],
    ["/menu", async (p) => {
      await p.getByRole("button", { name: /^Nepal/ }).first().click();
      return "tap Nepal chip";
    }],
    ["/menu/nepal", null],
    ["/dish/chicken-momo", async (p) => {
      await p.getByRole("button", { name: /More portions/ }).click();
      return "tap More portions";
    }],
    ["/delivery", null],
  ];
  report.perf = [];
  for (const [path, interact] of pages) {
    const r = await perfRun(path, interact);
    report.perf.push(r);
    record(
      "perf (throttled phone, local build)",
      `${path}: LCP ${r.lcp} ms, CLS ${r.cls}${r.inp !== null ? `, ${r.interaction} ${Math.round(r.inp)} ms` : ""}, ${r.kb} KB`,
      r.lcp <= 2500 && r.cls <= 0.1 && (r.inp === null || r.inp <= 200),
    );
  }
}

await browser.close();
report.results = results;
report.seconds = Math.round((Date.now() - started) / 1000);
writeFileSync(`${OUT}/qa-results.json`, JSON.stringify(report, null, 1));
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed in ${report.seconds}s → ${OUT}/qa-results.json`);
process.exit(failed.length ? 1 : 0);
