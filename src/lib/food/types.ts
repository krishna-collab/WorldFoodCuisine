export type CuisineId = "india" | "nepal" | "thailand" | "mexico" | "italy";

/** Broad world regions used to group cuisines as the collection grows. */
export type RegionId =
  | "south-asia"
  | "southeast-asia"
  | "east-asia"
  | "west-asia"
  | "africa"
  | "europe"
  | "latin-america"
  | "caribbean"
  | "oceania";

export type DietTag = "vegetarian" | "vegan" | "gluten-free";

/** The nine major US food allergens (FALCPA + FASTER Act). */
export type Allergen =
  "milk" | "egg" | "wheat" | "soy" | "peanuts" | "tree-nuts" | "sesame" | "fish" | "shellfish";

export type Course = "main" | "rice" | "noodles" | "bread" | "small-plate" | "soup" | "dessert";

/** One component of a dish (dough, filling, sauce, side...) and what it's made of. */
export type RecipePart = {
  label: string;
  items: string[];
};

/**
 * Image metadata, stored on the dish it shows.
 * - `own`: a photo of our own plate of this dish.
 * - `representative`: a stock image of a typical version of the dish, always
 *   labeled on screen and never presented as our plate.
 * - `generated`: an AI-generated picture of a typical version of the dish,
 *   always labeled on screen as AI-generated and never presented as a photo.
 * - `placeholder`: no accurate image yet; the UI shows a labeled card.
 */
export type DishImage =
  | {
      kind: "own" | "representative" | "generated";
      src: string;
      alt: string;
      /** CSS object-position, e.g. "50% 40%". */
      focal: string;
      source: string;
      license: string;
      review: "needs-review" | "approved";
      /** Where the image differs from our recipe, shown on the dish page. */
      note?: string;
    }
  | {
      kind: "placeholder";
      alt: string;
      review: "awaiting-photo";
    };

/**
 * The menu record for a dish (src/lib/food/dishes.ts): what it is, what it's
 * made of and what it contains. The single identity shared by "Cook it" and
 * "Get it cooked".
 */
export type DishRecord = {
  id: string;
  cuisine: CuisineId;
  name: string;
  /** Name in the dish's own language and script. */
  localName: string;
  /** Regional or community tradition, e.g. "Newar", "Oaxacan", "Roman". */
  tradition?: string;
  course: Course;
  /** One or two editorial sentences on origin and preparation. */
  story: string;
  /** What the dish is made of, component by component. */
  parts: RecipePart[];
  /** Fats the dish is cooked in (olive oil, butter, ghee). */
  cookedIn: string[];
  allergens: Allergen[];
  diet: DietTag[];
  spice: 0 | 1 | 2 | 3;
  /** Planned price in US cents. Only shown where a delivery zone is active. */
  price: number;
  image: DishImage;
  featured?: boolean;
};

/** Flavor notes for browsing. Editorial: read from the ingredient list. */
export type Taste = "creamy" | "tangy" | "smoky" | "herby" | "sweet" | "earthy" | "rich" | "crisp";

/** How long a dish takes to cook at home, in minutes. An estimate until a recipe is tested. */
export type TimeEstimate = {
  /** Hands-on time. */
  active: number;
  /** Start to finish, not counting any step named in `note`. */
  total: number;
  /** A long unattended step outside `total`, e.g. "plus overnight soaking". */
  note?: string;
};

/**
 * Editorial layer on top of the menu record (src/lib/food/editorial.ts): the
 * one-line flavor description on cards, flavor filters and typical home
 * cooking time.
 */
export type DishEditorial = {
  /** One line on what it tastes like, for cards. Under 80 characters. */
  flavor: string;
  tastes: Taste[];
  time: TimeEstimate;
};

/** Where a piece of food content came from and who has checked it. */
export type ContentStatus = "draft" | "reviewed" | "verified";
export type ContentRecord = {
  status: ContentStatus;
  source: string;
  /** Who checked it, e.g. "Kitchen lead, Mission St." Required once reviewed or verified. */
  checkedBy?: string;
  /** ISO date of the check. */
  checkedOn?: string;
};

export type DishContent = {
  ingredients: ContentRecord;
  allergens: ContentRecord;
  story: ContentRecord;
  editorial: ContentRecord;
};

/** A dish as the app uses it: menu record + editorial layer + content status. */
export type Dish = DishRecord &
  DishEditorial & {
    content: DishContent;
    /** True when a guided recipe exists (src/lib/food/recipes.ts). */
    hasRecipe: boolean;
  };

/** Units a recipe can use. Spoons and pieces read the same in metric and US. */
export type Unit =
  | "g"
  | "kg"
  | "ml"
  | "l"
  | "tsp"
  | "tbsp"
  | "cup"
  | "oz"
  | "lb"
  | "piece"
  | "clove"
  | "pinch";

export type Quantity = { amount: number; unit: Unit };

export type Aisle = "produce" | "meat" | "dairy" | "spices" | "pantry";

/** A safer or easier ingredient swap, and what it changes. */
export type Substitute = {
  name: string;
  /** How much to use, if not the same amount. */
  amount?: string;
  /** What changes: flavor, texture, or that it's untested. Shown with the swap. */
  note: string;
  /** Where to find it in the shop, when that differs from the original. */
  aisle?: Aisle;
  /** Allergens the swap adds to or removes from the dish. */
  adds?: Allergen[];
  removes?: Allergen[];
};

export type RecipeIngredient = {
  id: string;
  /** The ingredient as named in the dish's parts list; the menu tests check the match. */
  item: string;
  /** Component it belongs to (a label from the dish's parts). */
  part: string;
  /** Name shown in the recipe, when it differs from `item` (e.g. "Maida (all-purpose flour)"). */
  label?: string;
  metric?: Quantity;
  /** US kitchen measure when it differs from `metric` (cups instead of grams). */
  us?: Quantity;
  /** Size or preparation: "finely chopped", "medium". */
  prep?: string;
  /** Salt "to taste" and the like: shown without an amount and never scaled. */
  toTaste?: boolean;
  aisle: Aisle;
  /** Major allergens this ingredient carries; together they must equal the dish's list. */
  allergens?: Allergen[];
  substitutes?: Substitute[];
};

export type RecipeStep = {
  id: string;
  /** Section shown in the progress bar: "Dough", "Filling", "Steam". */
  section: string;
  title: string;
  /** What to do. `{ingredient-id}` is replaced by the scaled amount. */
  text: string;
  /** Ingredient ids this step uses, listed above the instructions. */
  uses?: string[];
  timer?: { seconds: number; label: string };
  tip?: string;
  /** Food-safety or burn warnings. */
  caution?: string;
};

export type Recipe = {
  dishId: string;
  /** Servings the amounts are written for. */
  servings: number;
  /** What one batch makes, scaled with servings: "about {n} momos". */
  yields?: { amount: number; noun: string };
  time: TimeEstimate;
  difficulty: "Easy" | "Medium" | "Takes practice";
  equipment: string[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  content: ContentRecord;
};

export type Cuisine = {
  id: CuisineId;
  name: string;
  /** Name in the cuisine's own language and script. */
  native: string;
  region: RegionId;
  /** Regional traditions represented on the menu. */
  traditions: string[];
  blurb: string;
  /** Short editorial introduction for the cuisine page. */
  story: string;
  /** Accent color for placeholders and highlights. */
  accent: string;
  /** Dish whose photo represents the cuisine, if it has one. */
  coverDishId: string;
};

export type Collection = {
  id: string;
  title: string;
  blurb: string;
  dishIds: string[];
};

export type CartItem = {
  /** dishId plus chosen options, so the same dish with different choices is two lines. */
  key: string;
  dishId: string;
  qty: number;
  /** Option group id → choice id, from the delivery zone's menu. */
  options?: Record<string, string>;
};

export type DemoOrder = {
  id: string;
  createdAt: number;
  postalCode: string;
  zoneLabel: string;
  window: string;
  items: CartItem[];
  subtotal: number;
  delivery: number;
  tax: number;
  tip: number;
  total: number;
};
