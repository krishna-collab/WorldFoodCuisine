/**
 * Guards for guided recipes: a recipe cooks the dish the menu describes (same
 * ingredients, same allergens), swaps tell the truth about allergens, amounts
 * scale and read like a cook would write them, and the shopping list adds up.
 *
 * Run: npm run test:menu
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { dishById } from "./data.ts";
import { formatFraction, formatQuantity, ingredientAmount } from "./quantity.ts";
import { allergensWithSwaps, scaledYield, stepPlainText } from "./recipe-text.ts";
import { recipes } from "./recipes.ts";
import { buildListItems } from "./shopping.ts";

const momo = recipes["chicken-momo"]!;

test("every guided recipe cooks the dish the menu describes", () => {
  for (const recipe of Object.values(recipes)) {
    const dish = dishById[recipe.dishId];
    assert.ok(dish, `${recipe.dishId} is on the menu`);
    assert.ok(dish.hasRecipe, `${recipe.dishId} is marked as having a recipe`);

    // Each recipe ingredient is an item of the named component...
    for (const ing of recipe.ingredients) {
      const part = dish.parts.find((p) => p.label === ing.part);
      assert.ok(part, `${recipe.dishId}/${ing.id}: component "${ing.part}" exists`);
      assert.ok(part.items.includes(ing.item), `${recipe.dishId}/${ing.id}: "${ing.item}" is in ${ing.part}`);
      assert.ok(ing.metric || ing.toTaste, `${recipe.dishId}/${ing.id} has an amount`);
    }
    // ...and every listed item is in the recipe: nothing added, nothing left out.
    for (const part of dish.parts) {
      for (const item of part.items) {
        assert.ok(
          recipe.ingredients.some((i) => i.part === part.label && i.item === item),
          `${recipe.dishId}: "${item}" (${part.label}) is used in the recipe`,
        );
      }
    }

    const ids = new Set(recipe.ingredients.map((i) => i.id));
    assert.equal(ids.size, recipe.ingredients.length, `${recipe.dishId}: ingredient ids are unique`);
    for (const step of recipe.steps) {
      for (const id of step.uses ?? []) assert.ok(ids.has(id), `${step.id} uses ${id}`);
      for (const [, id] of step.text.matchAll(/\{([a-z0-9-]+)\}/g)) {
        assert.ok(id === "yield" || ids.has(id!), `${step.id}: {${id}} is an ingredient`);
      }
      if (step.timer) assert.ok(step.timer.seconds > 0 && step.timer.label.trim(), step.id);
    }

    // The recipe's allergens, ingredient by ingredient, are the dish's allergens.
    const { allergens } = allergensWithSwaps(recipe, {});
    assert.deepEqual([...allergens].sort(), [...dish.allergens].sort(), `${recipe.dishId} allergens`);

    assert.ok(recipe.time.active <= recipe.time.total, `${recipe.dishId} time`);
    assert.ok(["draft", "reviewed", "verified"].includes(recipe.content.status));
    if (recipe.content.status !== "draft") assert.ok(recipe.content.checkedBy && recipe.content.checkedOn);
  }
});

test("swaps only remove an allergen when nothing else in the recipe has it", () => {
  const onlyFilling = allergensWithSwaps(momo, { ghee: "Olive oil" });
  assert.ok(onlyFilling.allergens.includes("milk"), "the steamer ghee still has milk");
  assert.deepEqual(onlyFilling.removed, []);

  const both = allergensWithSwaps(momo, { ghee: "Olive oil", "ghee-tray": "Olive oil" });
  assert.ok(!both.allergens.includes("milk"));
  assert.deepEqual(both.removed, ["milk"]);

  const sesameFree = allergensWithSwaps(momo, { sesame: "Pumpkin seeds (pepitas)" });
  assert.deepEqual(sesameFree.removed, ["sesame"]);

  // Every swap that claims to change allergens names real ones.
  for (const ing of momo.ingredients) {
    for (const sub of ing.substitutes ?? []) {
      for (const a of sub.removes ?? []) {
        assert.ok(ing.allergens?.includes(a), `${ing.id} → ${sub.name} can only remove what ${ing.id} has`);
      }
      assert.ok(sub.note.trim().length > 5, `${ing.id} → ${sub.name} says what changes`);
    }
  }
});

test("amounts scale and read like a cook would write them", () => {
  assert.equal(formatFraction(0.5), "½");
  assert.equal(formatFraction(1.34), "1⅓");
  assert.equal(formatFraction(2.25), "2¼");
  assert.equal(formatFraction(0.95), "1");
  assert.equal(formatQuantity({ amount: 3.2, unit: "g" }), "3 g");
  assert.equal(formatQuantity({ amount: 452, unit: "g" }), "450 g");
  assert.equal(formatQuantity({ amount: 1250, unit: "g" }), "1.25 kg");
  assert.equal(formatQuantity({ amount: 0.5, unit: "lb" }), "8 oz");
  assert.equal(formatQuantity({ amount: 2, unit: "clove" }), "2 cloves");

  const flour = momo.ingredients.find((i) => i.id === "flour")!;
  assert.equal(ingredientAmount(flour, 1, "metric"), "300 g");
  assert.equal(ingredientAmount(flour, 1, "us"), "2½ cups");
  assert.equal(ingredientAmount(flour, 0.5, "us"), "1¼ cups");
  const salt = momo.ingredients.find((i) => i.id === "salt-filling")!;
  assert.equal(ingredientAmount(salt, 3, "us"), "1 tbsp", "3 tsp reads as 1 tbsp");

  assert.equal(scaledYield(momo, 1), 30);
  assert.equal(scaledYield(momo, 0.5), 15);
  const divide = momo.steps.find((s) => s.id === "divide")!;
  assert.match(stepPlainText(divide, momo, 2, "metric", {}), /into 60 equal pieces/);
  const dough = momo.steps.find((s) => s.id === "dough")!;
  assert.match(stepPlainText(dough, momo, 1, "us", {}), /Mix 2½ cups maida \(all-purpose flour\) with ½ tsp salt/);
});

test("the shopping list merges repeats, scales with servings and records swaps", () => {
  const items = buildListItems(momo, 2, "metric", { sesame: "Pumpkin seeds (pepitas)" });
  const byName = (name: string) => items.find((i) => i.name.toLowerCase().startsWith(name));
  assert.equal(byName("garlic")?.amount, "14 cloves", "4 + 3 cloves, doubled");
  assert.equal(items.filter((i) => i.name.startsWith("Salt")).length, 1, "salt is one line");
  assert.ok(!items.some((i) => i.name === "Water"), "nobody buys water");
  const seeds = items.find((i) => i.name.startsWith("Pumpkin"));
  assert.equal(seeds?.swappedFrom, "Sesame seeds");
  assert.equal(seeds?.amount, "6 tbsp", "a swap keeps the original amount unless it says otherwise");
  assert.equal(new Set(items.map((i) => i.id)).size, items.length, "ids are unique");
});
