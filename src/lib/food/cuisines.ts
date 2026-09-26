import type { Cuisine, RegionId } from "./types.ts";

export const regionLabels: Record<RegionId, string> = {
  "south-asia": "South Asia",
  "southeast-asia": "Southeast Asia",
  "east-asia": "East Asia",
  "west-asia": "West Asia",
  africa: "Africa",
  europe: "Europe",
  "latin-america": "Latin America",
  caribbean: "Caribbean",
  oceania: "Oceania",
};

export const cuisines: Cuisine[] = [
  {
    id: "india",
    name: "India",
    native: "भारत",
    region: "south-asia",
    traditions: ["Punjabi", "Hyderabadi", "Kashmiri", "South Indian", "Mughlai"],
    blurb: "Tandoor, slow dals and whole-spice masalas from five regions.",
    story:
      "India's cooking changes every few hundred kilometres: Punjabi tandoor and dal, Hyderabadi dum biryani, Kashmiri curries built on dried chilies and fennel, South Indian batters of fermented rice and lentils. Most start the same way, with whole spices bloomed in hot fat and ground into masalas.",
    accent: "#d99a2b",
    coverDishId: "butter-chicken",
  },
  {
    id: "nepal",
    name: "Nepal",
    native: "नेपाल",
    region: "south-asia",
    traditions: ["Newar", "Tibetan", "Everyday Nepali"],
    blurb: "Dumplings, Newar feast plates and the everyday dal bhat.",
    story:
      "Nepali food runs from Himalayan noodle soups to the Kathmandu Valley's Newar feasts of rice crepes, lentil patties and spiced grilled meat, and the dal bhat eaten every day. Timur (Nepali Sichuan pepper) and fermented greens give it a sharp, tingling brightness.",
    accent: "#c24a3b",
    coverDishId: "chicken-momo",
  },
  {
    id: "thailand",
    name: "Thailand",
    native: "ประเทศไทย",
    region: "southeast-asia",
    traditions: ["Central Thai", "Northern Thai", "Isan", "Thai Muslim"],
    blurb: "Pounded pastes, wok heat and coconut: sour, salty, sweet and hot.",
    story:
      "Thai cooking balances sour, salty, sweet and hot in almost every dish. Curry pastes are pounded from chilies, lemongrass, galangal and makrut lime; the north adds curry-noodle soups like khao soi, and the northeast (Isan) its pounded salads.",
    accent: "#6fa35b",
    coverDishId: "pad-thai",
  },
  {
    id: "mexico",
    name: "Mexico",
    native: "México",
    region: "latin-america",
    traditions: ["Mexico City", "Poblano", "Oaxacan", "Norteño", "Jaliscan"],
    blurb: "Nixtamal corn, dried chilies and moles built over hours.",
    story:
      "Mexican cooking rests on nixtamalized corn, ground into masa for tortillas and tamales, and on chilies used fresh, dried and toasted. Moles from Puebla and Oaxaca, northern grilled beef and Mexico City's al pastor show how far one cuisine stretches.",
    accent: "#c6703e",
    coverDishId: "mole-poblano",
  },
  {
    id: "italy",
    name: "Italy",
    native: "Italia",
    region: "europe",
    traditions: ["Neapolitan", "Roman", "Milanese", "Bolognese", "Ligurian", "Venetian"],
    blurb: "Few ingredients, regional rules: pizza, pasta, risotto, ragù.",
    story:
      "Italian food is regional first: Neapolitan pizza, Roman pasta with pecorino, Milanese saffron risotto and braised veal shanks, Ligurian pesto, Bolognese ragù. Few ingredients, handled carefully, cooked in olive oil or butter depending on the region.",
    accent: "#5c86b8",
    coverDishId: "margherita",
  },
];
