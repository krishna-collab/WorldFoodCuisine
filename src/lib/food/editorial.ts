import type { DishEditorial, Taste } from "./types.ts";

/**
 * Editorial layer for each dish: a one-line flavor description for cards and
 * the flavor filters.
 *
 * Status: draft. Written from each dish's ingredient list (src/lib/food/dishes.ts),
 * September 2026; not yet checked by a kitchen.
 */
export const EDITORIAL_SOURCE =
  "Written for the menu from each dish's ingredient list, September 2026";

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

export const editorial: Record<string, DishEditorial> = {
  // ─── India ────────────────────────────────────────────────────────────────
  "butter-chicken": {
    flavor: "Charred chicken in a mild, buttery tomato gravy with fenugreek",
    tastes: ["creamy", "rich"],
  },
  "chicken-biryani": {
    flavor: "Saffron basmati layered with spiced chicken, fried onion and mint",
    tastes: ["rich", "herby"],
  },
  "masala-dosa": {
    flavor: "A thin, crisp fermented crepe around spiced potato, with sambar",
    tastes: ["crisp", "tangy"],
  },
  "palak-paneer": {
    flavor: "Soft paneer in a smooth, gently spiced spinach gravy",
    tastes: ["creamy", "earthy"],
  },
  "tikka-masala": {
    flavor: "Char-grilled chicken in a creamy, tangy tomato-onion sauce",
    tastes: ["creamy", "smoky", "tangy"],
  },
  "tandoori-chicken": {
    flavor: "Yogurt-marinated chicken legs, charred, with a sharp mint chutney",
    tastes: ["smoky", "tangy", "herby"],
  },
  "dal-makhani": {
    flavor: "Black lentils simmered for hours with butter and cream",
    tastes: ["creamy", "rich", "earthy"],
  },
  "rogan-josh": {
    flavor: "Slow-braised lamb in a deep red, fennel-scented Kashmiri gravy",
    tastes: ["rich", "earthy"],
  },
  "chole-bhature": {
    flavor: "Dark, tangy spiced chickpeas with big puffed fried breads",
    tastes: ["tangy", "crisp", "earthy"],
  },
  "malai-kofta": {
    flavor: "Paneer and potato dumplings in a mild, sweet cashew-cream gravy",
    tastes: ["creamy", "rich", "sweet"],
  },

  // ─── Nepal ────────────────────────────────────────────────────────────────
  "chicken-momo": {
    flavor: "Juicy spiced chicken dumplings with a tingly tomato-sesame achar",
    tastes: ["tangy", "herby"],
  },
  "dal-bhat": {
    flavor: "The everyday plate: lentils, rice, vegetable curry, greens, relish",
    tastes: ["earthy", "herby"],
  },
  "newari-bara": {
    flavor: "Savory black-lentil patty with an egg on top and smoky relish",
    tastes: ["earthy", "smoky"],
  },
  thukpa: {
    flavor: "Hand-cut noodles in warming chicken broth with vegetables and timur",
    tastes: ["herby", "earthy"],
  },
  "sel-roti": {
    flavor: "Crisp, lightly sweet rice rings with spiced baby potatoes",
    tastes: ["crisp", "sweet"],
  },
  chatamari: {
    flavor: "Thin rice crepe topped with spiced chicken, egg and fresh herbs",
    tastes: ["crisp", "herby"],
  },
  "chicken-choila": {
    flavor: "Flame-charred chicken tossed with chili, garlic and tingling timur",
    tastes: ["smoky", "tangy"],
  },
  yomari: {
    flavor: "Steamed rice-flour dumplings filled with molasses and sesame",
    tastes: ["sweet", "earthy"],
  },
  "aloo-tama": {
    flavor: "Sour, brothy curry of potato, fermented bamboo and black-eyed peas",
    tastes: ["tangy", "earthy"],
  },
  "gundruk-dhido": {
    flavor: "Sour fermented-greens soup with a smooth mound of buckwheat",
    tastes: ["tangy", "earthy"],
  },

  // ─── Thailand ─────────────────────────────────────────────────────────────
  "pad-thai": {
    flavor: "Rice noodles, shrimp and tofu, sweet and sour with tamarind",
    tastes: ["tangy", "sweet"],
  },
  "green-curry": {
    flavor: "Chicken and Thai eggplant in a fragrant, spicy green coconut curry",
    tastes: ["creamy", "herby"],
  },
  "tom-yum": {
    flavor: "Hot and sour shrimp soup with lemongrass, galangal and lime leaf",
    tastes: ["tangy", "herby"],
  },
  "pad-kra-pao": {
    flavor: "Peppery holy-basil chicken, chili-hot, over rice with a crisp egg",
    tastes: ["herby", "crisp"],
  },
  massaman: {
    flavor: "Mild, spice-warm beef and potato curry with coconut and peanuts",
    tastes: ["rich", "creamy", "sweet"],
  },
  "som-tam": {
    flavor: "Crunchy green papaya salad, pounded hot, sour and salty",
    tastes: ["tangy", "crisp"],
  },
  "mango-sticky-rice": {
    flavor: "Ripe mango with coconut-sweet sticky rice and toasted mung beans",
    tastes: ["sweet", "creamy"],
  },
  "khao-pad": {
    flavor: "Wok-fried jasmine rice with egg and crab, lime and chili fish sauce",
    tastes: ["tangy"],
  },
  "panang-curry": {
    flavor: "Thick, rich red coconut curry with chicken and lime leaf",
    tastes: ["creamy", "rich"],
  },
  "khao-soi": {
    flavor: "Coconut curry noodle soup with chicken, crisp noodles and pickles",
    tastes: ["creamy", "crisp", "tangy"],
  },

  // ─── Mexico ───────────────────────────────────────────────────────────────
  "tacos-al-pastor": {
    flavor: "Achiote and chili pork with roasted pineapple on corn tortillas",
    tastes: ["smoky", "tangy", "sweet"],
  },
  "mole-poblano": {
    flavor: "Turkey in a dark, silky mole of chilies, chocolate, nuts and spice",
    tastes: ["rich", "sweet", "smoky"],
  },
  "carne-asada": {
    flavor: "Citrus-marinated grilled skirt steak with rice, beans and salsa roja",
    tastes: ["smoky", "tangy"],
  },
  "enchiladas-verdes": {
    flavor: "Chicken enchiladas under tangy tomatillo salsa, crema and cheese",
    tastes: ["tangy", "creamy"],
  },
  "chiles-rellenos": {
    flavor: "Roasted poblanos stuffed with melting cheese, in light tomato broth",
    tastes: ["rich", "smoky"],
  },
  "pozole-rojo": {
    flavor: "Red chili pork and hominy stew with crunchy fresh garnishes",
    tastes: ["earthy", "rich"],
  },
  tamales: {
    flavor: "Soft masa with chicken and mole negro, steamed in banana leaf",
    tastes: ["rich", "earthy"],
  },
  "huitlacoche-quesadilla": {
    flavor: "Blue-corn quesadilla of earthy corn mushroom and melted cheese",
    tastes: ["earthy", "creamy"],
  },
  chilaquiles: {
    flavor: "Tortilla chips in green salsa, topped with egg, crema and cheese",
    tastes: ["tangy", "crisp"],
  },
  "elote-guacamole": {
    flavor: "Grilled corn with crema, cotija and chili, plus chunky guacamole",
    tastes: ["smoky", "creamy", "tangy"],
  },

  // ─── Italy ────────────────────────────────────────────────────────────────
  margherita: {
    flavor: "Blistered Neapolitan crust with tomato, mozzarella and basil",
    tastes: ["crisp", "tangy"],
  },
  carbonara: {
    flavor: "Spaghetti with crisp guanciale, egg and pecorino, lots of pepper",
    tastes: ["rich", "creamy"],
  },
  lasagna: {
    flavor: "Spinach pasta layered with slow-cooked ragù and béchamel",
    tastes: ["rich", "creamy"],
  },
  "cacio-e-pepe": {
    flavor: "Fresh pasta in a creamy pecorino sauce with toasted black pepper",
    tastes: ["creamy", "rich"],
  },
  "osso-buco": {
    flavor: "Braised veal shank with lemony gremolata and saffron risotto",
    tastes: ["rich", "herby"],
  },
  "risotto-milanese": {
    flavor: "Creamy saffron risotto finished with butter and Parmigiano",
    tastes: ["creamy", "rich"],
  },
  "gnocchi-pesto": {
    flavor: "Soft potato gnocchi in bright basil pesto with green beans",
    tastes: ["herby"],
  },
  "eggplant-parmigiana": {
    flavor: "Layers of fried eggplant, tomato and melting mozzarella",
    tastes: ["rich", "tangy"],
  },
  tiramisu: {
    flavor: "Espresso-soaked ladyfingers with mascarpone cream and cocoa",
    tastes: ["sweet", "creamy"],
  },
  "burrata-caprese": {
    flavor: "Creamy burrata over ripe tomatoes with basil and olive oil",
    tastes: ["creamy", "herby"],
  },
};
