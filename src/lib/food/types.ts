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

export type Dish = {
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
  dishId: string;
  qty: number;
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
  total: number;
};
