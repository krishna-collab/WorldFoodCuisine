/**
 * Guards for the menu data: what each dish is made of, its allergen and
 * diet labels, its photo metadata, and the sitemap built from it.
 *
 * Run: npm run test:menu
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { sitemapPaths, sitemapXml } from "../sitemap.ts";
import { SITE_URL } from "../site.ts";
import {
  collections,
  cuisineById,
  cuisines,
  dishById,
  dishes,
  ingredientIndex,
  normalize,
  searchDishes,
} from "./data.ts";
import type { Allergen, Dish } from "./types.ts";

const root = new URL("../../../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

const ALLOWED_FATS = new Set(["Olive oil", "Butter", "Ghee (clarified butter)"]);

/** Everything a dish is made of, including the fat it's cooked in. */
function contents(dish: Dish): string[] {
  return [...dish.parts.flatMap((p) => p.items), ...dish.cookedIn];
}

/**
 * Ingredient words that mean an allergen is present. Deliberately excludes
 * look-alikes: coconut milk and cream (not dairy), buckwheat and rice flour
 * (not wheat), eggplant (not egg), nutmeg (not a nut).
 */
const ALLERGEN_WORDS: Record<Allergen, RegExp> = {
  milk: /\b(milk|cream|crema|butter|ghee|yogh?urt|paneer|cheese|mozzarella|fior di latte|parmigiano|pecorino|mascarpone|stracciatella|queso|cotija|curd)\b/i,
  egg: /\beggs?\b|\begg yolk/i,
  wheat: /\b(wheat|maida|semolina|spaghetti|bolillo)\b/i,
  soy: /\bsoy/i,
  peanuts: /\bpeanuts?\b/i,
  "tree-nuts":
    /\b(almonds?|cashews?|pine nuts?|pistachios?|walnuts?|hazelnuts?|pecans?|macadamias?)\b/i,
  sesame: /\bsesame\b/i,
  fish: /\b(fish|anchov(y|ies))\b/i,
  shellfish: /\b(shrimp|prawns?|crab|lobster)\b/i,
};

function mentions(dish: Dish, allergen: Allergen): boolean {
  return contents(dish).some((item) => {
    const text = allergen === "milk" ? item.replace(/coconut (milk|cream)/gi, "") : item;
    // Mozzarella and ricotta "curd" is dairy; soybean curd (tofu) is not.
    if (allergen === "milk" && /soybean curd/i.test(text)) return false;
    return ALLERGEN_WORDS[allergen].test(text);
  });
}

const MEAT_OR_SEAFOOD =
  /\b(beef|chicken|pork|lamb|mutton|goat|turkey|veal|steak|pancetta|guanciale|bacon|prosciutto|chorizo|lard|gelatin|fish|anchov(y|ies)|shrimp|prawns?|crab)\b/i;

test("unique ids, and ten dishes from every cuisine (no token dishes)", () => {
  assert.equal(new Set(dishes.map((d) => d.id)).size, dishes.length);
  assert.equal(dishes.length, cuisines.length * 10);
  for (const c of cuisines) {
    assert.equal(dishes.filter((d) => d.cuisine === c.id).length, 10, c.id);
    assert.equal(dishById[c.coverDishId]?.cuisine, c.id, `${c.id} cover dish`);
  }
});

test("every dish says what it is made of, component by component", () => {
  for (const d of dishes) {
    assert.ok(d.name && d.localName && d.story, d.id);
    assert.ok(d.parts.length >= 2, `${d.id} has at least two components`);
    for (const part of d.parts) {
      assert.ok(part.label.trim(), `${d.id} part label`);
      assert.ok(part.items.length > 0, `${d.id} ${part.label} lists ingredients`);
    }
    assert.ok(Number.isInteger(d.price) && d.price > 0, `${d.id} price in cents`);
  }
});

test("dishes are cooked only in olive oil, butter or ghee", () => {
  for (const d of dishes) {
    for (const fat of d.cookedIn) assert.ok(ALLOWED_FATS.has(fat), `${d.id}: ${fat}`);
    const oils = contents(d).filter((i) => /\boil\b/i.test(i) && !/olive oil/i.test(i));
    assert.deepEqual(oils, [], `${d.id} uses no other oils`);
  }
});

test("no preservatives or additives are listed as ingredients", () => {
  const additive = /\b(preservative|msg|monosodium|artificial|benzoate|sorbate|nitrite|e\d{3})\b/i;
  for (const d of dishes) {
    for (const item of contents(d)) assert.doesNotMatch(item, additive, `${d.id}: ${item}`);
  }
});

test("allergen labels match the ingredients, both ways", () => {
  for (const d of dishes) {
    for (const allergen of Object.keys(ALLERGEN_WORDS) as Allergen[]) {
      const listed = d.allergens.includes(allergen);
      if (mentions(d, allergen))
        assert.ok(listed, `${d.id} contains ${allergen} but doesn't list it`);
    }
  }
  // Allergens that come from a named ingredient must be traceable to one.
  const traceable: Allergen[] = ["milk", "egg", "peanuts", "tree-nuts", "sesame", "shellfish"];
  for (const d of dishes) {
    for (const allergen of d.allergens.filter((a) => traceable.includes(a))) {
      assert.ok(mentions(d, allergen), `${d.id} lists ${allergen} but no ingredient explains it`);
    }
  }
});

test("diet tags agree with the ingredients", () => {
  for (const d of dishes) {
    const meat = contents(d).filter((i) => MEAT_OR_SEAFOOD.test(i));
    if (d.diet.includes("vegetarian")) assert.deepEqual(meat, [], `${d.id} is vegetarian`);
    if (d.diet.includes("vegan")) {
      assert.ok(d.diet.includes("vegetarian"), `${d.id}: vegan implies vegetarian`);
      for (const a of ["milk", "egg", "fish", "shellfish"] as const) {
        assert.ok(!d.allergens.includes(a), `${d.id} is vegan but contains ${a}`);
      }
    }
    if (d.diet.includes("gluten-free")) {
      assert.ok(!d.allergens.includes("wheat"), `${d.id} is gluten-free but contains wheat`);
    }
  }
});

test("photos: real metadata, files that exist, and no photo reused across dishes", () => {
  const seen = new Map<string, string>();
  for (const d of dishes) {
    const image = d.image;
    assert.ok(image.alt.trim().length > 10, `${d.id} alt text`);
    if (image.kind === "placeholder") {
      assert.equal(image.review, "awaiting-photo", d.id);
      continue;
    }
    assert.match(image.src, /^\/food\/[a-z0-9-]+\.(jpg|jpeg|png|webp|avif)$/, d.id);
    assert.ok(existsSync(new URL(`public${image.src}`, root)), `${d.id}: ${image.src} exists`);
    assert.match(image.focal, /^\d{1,3}% \d{1,3}%$/, `${d.id} focal point`);
    assert.ok(image.source.trim() && image.license.trim(), `${d.id} source and license`);
    assert.ok(["needs-review", "approved"].includes(image.review), d.id);
    const bytes = readFileSync(new URL(`public${image.src}`, root)).toString("base64");
    const other = seen.get(bytes);
    assert.equal(other, undefined, `${d.id} reuses the photo of ${other}`);
    seen.set(bytes, d.id);
  }
});

test("the image audit covers every dish", () => {
  const audit = read("docs/IMAGE-AUDIT.md");
  for (const d of dishes)
    assert.ok(audit.includes(`\`${d.id}\``), `${d.id} is in docs/IMAGE-AUDIT.md`);
});

test("collections point at real dishes; plant-based means vegan", () => {
  for (const c of collections) {
    assert.ok(c.dishIds.length >= 3, c.id);
    for (const id of c.dishIds) assert.ok(dishById[id], `${c.id}: ${id}`);
  }
  const plant = collections.find((c) => c.id === "plant-based");
  assert.ok(plant);
  for (const id of plant.dishIds) assert.ok(dishById[id]?.diet.includes("vegan"), id);
});

test("search ignores accents and case, and finds dishes by ingredient", () => {
  assert.equal(normalize("Oaxaqueños CAFÉ"), "oaxaquenos cafe");
  const paneer = searchDishes("paneer").map((r) => r.dish.id);
  assert.ok(paneer.includes("palak-paneer"));
  for (const id of paneer) {
    assert.ok(
      contents(dishById[id]!).some((i) => /paneer/i.test(i)) || /paneer/i.test(dishById[id]!.name),
      id,
    );
  }
  assert.ok(searchDishes("momo").some((r) => r.dish.id === "chicken-momo"));
  assert.ok(searchDishes("nepal").length === 10);
  const timur = searchDishes("timur");
  assert.ok(
    timur.length > 0 && timur.every((r) => r.ingredientMatch?.toLowerCase().includes("timur")),
  );
  assert.deepEqual(searchDishes("zzzz-not-food"), []);
  assert.equal(searchDishes("").length, dishes.length);
});

test("the ingredient index lists each ingredient once, with the dishes that use it", () => {
  const index = ingredientIndex();
  assert.equal(new Set(index.map((i) => i.name)).size, index.length);
  for (const entry of index) {
    assert.ok(entry.dishIds.length > 0, entry.name);
    for (const id of entry.dishIds) assert.ok(dishById[id], id);
  }
});

test("every cuisine page and dish page is in the committed sitemap", () => {
  const paths = sitemapPaths();
  for (const c of cuisines) assert.ok(paths.includes(`/menu/${c.id}`), c.id);
  for (const d of dishes) assert.ok(paths.includes(`/dish/${d.id}`), d.id);
  assert.ok(!paths.some((p) => p.startsWith("/checkout") || p.startsWith("/order")));
  assert.equal(read("public/sitemap.xml"), sitemapXml(), "run `npm run sitemap`");
  assert.match(read("public/robots.txt"), new RegExp(`Sitemap: ${SITE_URL}/sitemap.xml`));
  assert.ok(cuisineById.india);
});
