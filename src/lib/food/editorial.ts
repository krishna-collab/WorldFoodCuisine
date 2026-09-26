import type { DishEditorial, Taste } from "./types.ts";

/**
 * Editorial layer for each dish: a one-line flavor description for cards,
 * flavor filters, and how long the dish typically takes to cook at home.
 *
 * Status: draft. Written from each dish's ingredient list (src/lib/food/dishes.ts)
 * and a typical home method, September 2026; not yet checked by a cook.
 * Times include marinating and resting; anything overnight is named in `note`
 * instead of hidden. Guided recipes (src/lib/food/recipes.ts) replace these
 * estimates with their own tested times.
 */
export const EDITORIAL_SOURCE =
  "Written for the menu from each dish's ingredient list and a typical home method, September 2026";

export const tasteLabels: Record<Taste, string> = {
  creamy: "Creamy",
  tangy: "Tangy & sour",
  smoky: "Smoky & charred",
  herby: "Herby & fresh",
  sweet: "Sweet",
  earthy: "Earthy",
  rich: "Rich & slow-cooked",
  crisp: "Crisp & crunchy",
};

const CORN =
  "plus a day to nixtamalize the corn, or start from fresh masa";

export const editorial: Record<string, DishEditorial> = {
  // ─── India ────────────────────────────────────────────────────────────────
  "butter-chicken": {
    flavor: "Charred chicken in a mild, buttery tomato gravy with fenugreek",
    tastes: ["creamy", "rich"],
    time: { active: 40, total: 120 },
  },
  "chicken-biryani": {
    flavor: "Saffron basmati layered with spiced chicken, fried onion and mint",
    tastes: ["rich", "herby"],
    time: { active: 60, total: 180 },
  },
  "masala-dosa": {
    flavor: "A thin, crisp fermented crepe around spiced potato, with sambar",
    tastes: ["crisp", "tangy"],
    time: { active: 60, total: 90, note: "plus soaking and an overnight ferment for the batter" },
  },
  "palak-paneer": {
    flavor: "Soft paneer in a smooth, gently spiced spinach gravy",
    tastes: ["creamy", "earthy"],
    time: { active: 45, total: 90 },
  },
  "tikka-masala": {
    flavor: "Char-grilled chicken in a creamy, tangy tomato-onion sauce",
    tastes: ["creamy", "smoky", "tangy"],
    time: { active: 45, total: 120 },
  },
  "tandoori-chicken": {
    flavor: "Yogurt-marinated chicken legs, charred, with a sharp mint chutney",
    tastes: ["smoky", "tangy", "herby"],
    time: { active: 25, total: 180 },
  },
  "dal-makhani": {
    flavor: "Black lentils simmered for hours with butter and cream",
    tastes: ["creamy", "rich", "earthy"],
    time: { active: 40, total: 240, note: "plus soaking the lentils overnight" },
  },
  "rogan-josh": {
    flavor: "Slow-braised lamb in a deep red, fennel-scented Kashmiri gravy",
    tastes: ["rich", "earthy"],
    time: { active: 30, total: 150 },
  },
  "chole-bhature": {
    flavor: "Dark, tangy spiced chickpeas with big puffed fried breads",
    tastes: ["tangy", "crisp", "earthy"],
    time: { active: 75, total: 180, note: "plus soaking the chickpeas overnight" },
  },
  "malai-kofta": {
    flavor: "Paneer and potato dumplings in a mild, sweet cashew-cream gravy",
    tastes: ["creamy", "rich", "sweet"],
    time: { active: 75, total: 120 },
  },

  // ─── Nepal ────────────────────────────────────────────────────────────────
  "chicken-momo": {
    flavor: "Juicy spiced chicken dumplings with a tingly tomato-sesame achar",
    tastes: ["tangy", "herby"],
    time: { active: 75, total: 105 },
  },
  "dal-bhat": {
    flavor: "The everyday plate: lentils, rice, vegetable curry, greens, relish",
    tastes: ["earthy", "herby"],
    time: { active: 60, total: 75 },
  },
  "newari-bara": {
    flavor: "Savory black-lentil patty with an egg on top and smoky relish",
    tastes: ["earthy", "smoky"],
    time: { active: 40, total: 60, note: "plus soaking the lentils for at least 4 hours" },
  },
  thukpa: {
    flavor: "Hand-cut noodles in warming chicken broth with vegetables and timur",
    tastes: ["herby", "earthy"],
    time: { active: 50, total: 105 },
  },
  "sel-roti": {
    flavor: "Crisp, lightly sweet rice rings with spiced baby potatoes",
    tastes: ["crisp", "sweet"],
    time: { active: 60, total: 90, note: "plus soaking the rice overnight" },
  },
  chatamari: {
    flavor: "Thin rice crepe topped with spiced chicken, egg and fresh herbs",
    tastes: ["crisp", "herby"],
    time: { active: 30, total: 45 },
  },
  "chicken-choila": {
    flavor: "Flame-charred chicken tossed with chili, garlic and tingling timur",
    tastes: ["smoky", "tangy"],
    time: { active: 35, total: 60 },
  },
  yomari: {
    flavor: "Steamed rice-flour dumplings filled with molasses and sesame",
    tastes: ["sweet", "earthy"],
    time: { active: 60, total: 80 },
  },
  "aloo-tama": {
    flavor: "Sour, brothy curry of potato, fermented bamboo and black-eyed peas",
    tastes: ["tangy", "earthy"],
    time: { active: 20, total: 50 },
  },
  "gundruk-dhido": {
    flavor: "Sour fermented-greens soup with a smooth mound of buckwheat",
    tastes: ["tangy", "earthy"],
    time: { active: 35, total: 45 },
  },

  // ─── Thailand ─────────────────────────────────────────────────────────────
  "pad-thai": {
    flavor: "Rice noodles, shrimp and tofu, sweet and sour with tamarind",
    tastes: ["tangy", "sweet"],
    time: { active: 25, total: 60 },
  },
  "green-curry": {
    flavor: "Chicken and Thai eggplant in a fragrant, spicy green coconut curry",
    tastes: ["creamy", "herby"],
    time: { active: 45, total: 60 },
  },
  "tom-yum": {
    flavor: "Hot and sour shrimp soup with lemongrass, galangal and lime leaf",
    tastes: ["tangy", "herby"],
    time: { active: 40, total: 60 },
  },
  "pad-kra-pao": {
    flavor: "Peppery holy-basil chicken, chili-hot, over rice with a crisp egg",
    tastes: ["herby", "crisp"],
    time: { active: 20, total: 30 },
  },
  massaman: {
    flavor: "Mild, spice-warm beef and potato curry with coconut and peanuts",
    tastes: ["rich", "creamy", "sweet"],
    time: { active: 45, total: 150 },
  },
  "som-tam": {
    flavor: "Crunchy green papaya salad, pounded hot, sour and salty",
    tastes: ["tangy", "crisp"],
    time: { active: 20, total: 20 },
  },
  "mango-sticky-rice": {
    flavor: "Ripe mango with coconut-sweet sticky rice and toasted mung beans",
    tastes: ["sweet", "creamy"],
    time: { active: 30, total: 60, note: "plus soaking the rice for at least 4 hours" },
  },
  "khao-pad": {
    flavor: "Wok-fried jasmine rice with egg and crab, lime and chili fish sauce",
    tastes: ["tangy"],
    time: { active: 20, total: 25 },
  },
  "panang-curry": {
    flavor: "Thick, rich red coconut curry with chicken and lime leaf",
    tastes: ["creamy", "rich"],
    time: { active: 40, total: 55 },
  },
  "khao-soi": {
    flavor: "Coconut curry noodle soup with chicken, crisp noodles and pickles",
    tastes: ["creamy", "crisp", "tangy"],
    time: { active: 45, total: 90 },
  },

  // ─── Mexico ───────────────────────────────────────────────────────────────
  "tacos-al-pastor": {
    flavor: "Achiote and chili pork with roasted pineapple on corn tortillas",
    tastes: ["smoky", "tangy", "sweet"],
    time: { active: 60, total: 300, note: CORN },
  },
  "mole-poblano": {
    flavor: "Turkey in a dark, silky mole of chilies, chocolate, nuts and spice",
    tastes: ["rich", "sweet", "smoky"],
    time: { active: 120, total: 240 },
  },
  "carne-asada": {
    flavor: "Citrus-marinated grilled skirt steak with rice, beans and salsa roja",
    tastes: ["smoky", "tangy"],
    time: { active: 60, total: 180, note: "plus soaking the beans overnight" },
  },
  "enchiladas-verdes": {
    flavor: "Chicken enchiladas under tangy tomatillo salsa, crema and cheese",
    tastes: ["tangy", "creamy"],
    time: { active: 45, total: 70, note: CORN },
  },
  "chiles-rellenos": {
    flavor: "Roasted poblanos stuffed with melting cheese, in light tomato broth",
    tastes: ["rich", "smoky"],
    time: { active: 60, total: 80 },
  },
  "pozole-rojo": {
    flavor: "Red chili pork and hominy stew with crunchy fresh garnishes",
    tastes: ["earthy", "rich"],
    time: { active: 45, total: 180, note: "plus a day if you cook the hominy from dried corn" },
  },
  tamales: {
    flavor: "Soft masa with chicken and mole negro, steamed in banana leaf",
    tastes: ["rich", "earthy"],
    time: { active: 150, total: 300, note: CORN },
  },
  "huitlacoche-quesadilla": {
    flavor: "Blue-corn quesadilla of earthy corn mushroom and melted cheese",
    tastes: ["earthy", "creamy"],
    time: { active: 30, total: 35, note: CORN },
  },
  chilaquiles: {
    flavor: "Tortilla chips in green salsa, topped with egg, crema and cheese",
    tastes: ["tangy", "crisp"],
    time: { active: 35, total: 40, note: CORN },
  },
  "elote-guacamole": {
    flavor: "Grilled corn with crema, cotija and chili, plus chunky guacamole",
    tastes: ["smoky", "creamy", "tangy"],
    time: { active: 35, total: 40 },
  },

  // ─── Italy ────────────────────────────────────────────────────────────────
  margherita: {
    flavor: "Blistered Neapolitan crust with tomato, mozzarella and basil",
    tastes: ["crisp", "tangy"],
    time: { active: 25, total: 150, note: "best with a 24-hour dough rise" },
  },
  carbonara: {
    flavor: "Spaghetti with crisp guanciale, egg and pecorino, lots of pepper",
    tastes: ["rich", "creamy"],
    time: { active: 20, total: 25 },
  },
  lasagna: {
    flavor: "Spinach pasta layered with slow-cooked ragù and béchamel",
    tastes: ["rich", "creamy"],
    time: { active: 90, total: 300 },
  },
  "cacio-e-pepe": {
    flavor: "Fresh pasta in a creamy pecorino sauce with toasted black pepper",
    tastes: ["creamy", "rich"],
    time: { active: 45, total: 75 },
  },
  "osso-buco": {
    flavor: "Braised veal shank with lemony gremolata and saffron risotto",
    tastes: ["rich", "herby"],
    time: { active: 60, total: 150 },
  },
  "risotto-milanese": {
    flavor: "Creamy saffron risotto finished with butter and Parmigiano",
    tastes: ["creamy", "rich"],
    time: { active: 35, total: 45, note: "plus about 3 hours for the beef broth" },
  },
  "gnocchi-pesto": {
    flavor: "Soft potato gnocchi in bright basil pesto with green beans",
    tastes: ["herby"],
    time: { active: 60, total: 90 },
  },
  "eggplant-parmigiana": {
    flavor: "Layers of fried eggplant, tomato and melting mozzarella",
    tastes: ["rich", "tangy"],
    time: { active: 60, total: 130 },
  },
  tiramisu: {
    flavor: "Espresso-soaked ladyfingers with mascarpone cream and cocoa",
    tastes: ["sweet", "creamy"],
    time: { active: 60, total: 90, note: "plus at least 6 hours in the fridge" },
  },
  "burrata-caprese": {
    flavor: "Creamy burrata over ripe tomatoes with basil and olive oil",
    tastes: ["creamy", "herby"],
    time: { active: 10, total: 10 },
  },
};
