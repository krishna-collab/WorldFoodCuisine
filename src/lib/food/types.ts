export type CuisineId = "india" | "nepal" | "thailand" | "mexico" | "italy";

export type DietTag =
  | "vegetarian"
  | "vegan"
  | "gluten-free"
  | "spicy"
  | "chef-pick"
  | "hub-lunch";

export type Ingredient = {
  name: string;
  origin: string;
  region: string;
  lot: string;
  note: string;
};

export type Dish = {
  id: string;
  cuisine: CuisineId;
  name: string;
  localName: string;
  description: string;
  price: number;
  spice: 0 | 1 | 2 | 3;
  calories: number;
  prepMinutes: number;
  tags: DietTag[];
  ingredients: Ingredient[];
  image?: string;
  featured?: boolean;
};

export type Cuisine = {
  id: CuisineId;
  name: string;
  native: string;
  blurb: string;
  kitchenNote: string;
  image: string;
};

export type City = {
  id: string;
  name: string;
  state: string;
  hub: string;
  eta: number;
  kitchens: number;
  partners: Array<"uber" | "doordash" | "grubhub">;
};

export type CartItem = {
  dishId: string;
  qty: number;
};

export type OrderStatus = "received" | "prepping" | "packed" | "enroute" | "delivered";

export type PlacedOrder = {
  id: string;
  createdAt: number;
  cityId: string;
  name: string;
  phone: string;
  address: string;
  unit: string;
  window: string;
  notes: string;
  items: CartItem[];
  subtotal: number;
  delivery: number;
  total: number;
};
