# Dish photo audit

Checked by eye on 24 September 2026, against each dish's recipe in
`src/lib/food/dishes.ts`. Every photo in `public/food/` came with the site
template. Nobody knows who took these photos or what license they're under.

## Summary

- **8 of 50 dishes keep a photo**, shown as a _representative photo_: a stock
  image of a typical version of the dish, labeled on every card, dish page and
  bag thumbnail as not being our food. Two of the eight are flagged because the
  garnish differs from our recipe.
- **42 dishes show a labeled placeholder** ("Photo coming soon", with the
  dish's name in its own script) because the old photo showed a different dish.
- The template reused photos across dishes. One chickpea-taco photo stood in
  for four Mexican dishes and the Mexico cover. Pad Thai photos stood in for
  Mango Sticky Rice and Tom Yum. One red-curry photo stood in for green,
  massaman and panang curry.
- **License and source are unknown for all 8 kept photos.** Before launch,
  confirm each license or replace the photo. Each photo's metadata records
  this as `review: "needs-review"`.
- The share image (`public/og.jpg`) was a food collage that looks AI-generated. It's now
  a typographic card with no food photos. Dish pages no longer use stock photos
  as share images, because a link preview can't show the "representative" label.

## How photos are stored

Each dish's `image` field holds the photo and its metadata (`src/lib/food/types.ts`):

| Field               | Meaning                                                                              |
| ------------------- | ------------------------------------------------------------------------------------ |
| `kind`              | `own` (our plate), `representative` (labeled stock photo), or `placeholder`          |
| `alt`               | What the photo actually shows. For a placeholder, what an accurate photo should show |
| `focal`             | CSS `object-position` so crops keep the food in frame                                |
| `source`, `license` | Where the photo came from and the license it's used under                            |
| `review`            | `needs-review` or `approved` for photos; `awaiting-photo` for placeholders           |

Cards, dish pages, the bag and checkout all render through one component
(`src/components/food/dish-image.tsx`), so every page shows the same image and
label for a dish. `npm run test:menu` fails if two dishes share a photo file,
if a photo file is missing, if metadata is empty, or if a dish is missing from
this audit.

**To add a photo of our own food:** put the file in `public/food/`, then set the
dish's image to `ownPhoto("/food/<file>.jpg", "<what it shows>", { source: "Photographed in our kitchen by <name>, <month year>" })`.
Change `review` to `"approved"` once someone has checked the plate matches the recipe.

## All 50 dishes

"Old photo" is the file the site used before this change (`public/food/<id>.jpg`).

| Dish                     | Cuisine  | Now                  | What the old photo shows                                                                                                             | Decision                                                                                             |
| ------------------------ | -------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `butter-chicken`         | India    | Representative photo | Butter chicken in a dark pan, cream drizzled over the orange gravy.                                                                  | Kept. Matches the dish.                                                                              |
| `chicken-biryani`        | India    | Representative photo | Chicken biryani in a dark pot, with raita on the side.                                                                               | Kept. Matches the dish.                                                                              |
| `masala-dosa`            | India    | Representative photo | A crisp rolled masala dosa with potato filling, coconut chutney and sambar.                                                          | Kept. Matches the dish.                                                                              |
| `palak-paneer`           | India    | Placeholder          | A small bowl of a rice or grain dish with tomato slices; no spinach.                                                                 | Placeholder: the photo doesn't show Palak Paneer.                                                    |
| `tikka-masala`           | India    | Placeholder          | A dark brown chicken curry with naan (same scene as newari bara).                                                                    | Placeholder: the sauce is dark brown, not the orange, cream-finished tikka masala on this menu.      |
| `tandoori-chicken`       | India    | Placeholder          | Boneless chicken skewers on a charcoal grill (same scene as chicken choila).                                                         | Placeholder: boneless skewers on a grill, not bone-in tandoori chicken.                              |
| `dal-makhani`            | India    | Placeholder          | The same thali photo as dal bhat (roti, vegetable curries, dal).                                                                     | Placeholder: the photo doesn't show Dal Makhani.                                                     |
| `rogan-josh`             | India    | Placeholder          | Two North Indian curries in steel bowls with a cream drizzle, and rice. Identical file to `aloo-tama`.                               | Placeholder: the photo doesn't show Kashmiri Rogan Josh.                                             |
| `chole-bhature`          | India    | Placeholder          | Pav bhaji: a bowl of mashed vegetable curry with butter, and pav buns.                                                               | Placeholder: the photo doesn't show Chole Bhature.                                                   |
| `malai-kofta`            | India    | Placeholder          | An orange curry with cubes (paneer or chicken) in a copper bowl, with rice and naan; no kofta.                                       | Placeholder: the photo doesn't show Malai Kofta.                                                     |
| `chicken-momo`           | Nepal    | Placeholder          | Assorted dumplings: green and white steamed ones and pan-fried gyoza-style ones with vegetables.                                     | Placeholder: a mixed dumpling platter, not recognizably chicken momo with achar.                     |
| `dal-bhat`               | Nepal    | Placeholder          | An Indian steel thali with roti, vegetable curries and dal.                                                                          | Placeholder: the photo doesn't show Dal Bhat Tarkari.                                                |
| `newari-bara`            | Nepal    | Placeholder          | A brown chicken curry with naan.                                                                                                     | Placeholder: the photo doesn't show Newari Bara.                                                     |
| `thukpa`                 | Nepal    | Placeholder          | The same ramen-style bowl as khao soi.                                                                                               | Placeholder: the photo doesn't show Thukpa.                                                          |
| `sel-roti`               | Nepal    | Placeholder          | Samosas with green chili and chutney.                                                                                                | Placeholder: the photo doesn't show Sel Roti & Aloo Dum.                                             |
| `chatamari`              | Nepal    | Placeholder          | A sliced Western-style pizza on a wooden board.                                                                                      | Placeholder: the photo doesn't show Chatamari.                                                       |
| `chicken-choila`         | Nepal    | Placeholder          | Boneless chicken skewers on a charcoal grill.                                                                                        | Placeholder: the photo doesn't show Chicken Choila.                                                  |
| `yomari`                 | Nepal    | Placeholder          | A chocolate layer cake with piped frosting.                                                                                          | Placeholder: the photo doesn't show Yomari.                                                          |
| `aloo-tama`              | Nepal    | Placeholder          | Two North Indian curries in steel bowls with a cream drizzle, and rice. Identical file to `rogan-josh`.                              | Placeholder: the photo doesn't show Aloo Tama.                                                       |
| `gundruk-dhido`          | Nepal    | Placeholder          | The same thali photo as dal bhat (roti, vegetable curries, dal).                                                                     | Placeholder: the photo doesn't show Gundruk & Dhido.                                                 |
| `pad-thai`               | Thailand | Representative photo | Pad Thai with shrimp, egg and bean sprouts. Identical file to `mango-sticky-rice`.                                                   | Kept. Matches the dish.                                                                              |
| `green-curry`            | Thailand | Placeholder          | A red Thai curry in a white bowl with basil and dried chilies.                                                                       | Placeholder: a red curry, not green.                                                                 |
| `tom-yum`                | Thailand | Placeholder          | Pad Thai with shrimp.                                                                                                                | Placeholder: the photo doesn't show Tom Yum Goong.                                                   |
| `pad-kra-pao`            | Thailand | Placeholder          | Breaded fried chicken strips on lettuce with a dip.                                                                                  | Placeholder: the photo doesn't show Pad Kra Pao.                                                     |
| `massaman`               | Thailand | Placeholder          | The same red Thai curry photo as green curry.                                                                                        | Placeholder: a red curry; massaman is brown, with potato and peanuts.                                |
| `som-tam`                | Thailand | Placeholder          | A pan of dark curry with herbs.                                                                                                      | Placeholder: the photo doesn't show Som Tam.                                                         |
| `mango-sticky-rice`      | Thailand | Placeholder          | Pad Thai with shrimp. Identical file to `pad-thai`.                                                                                  | Placeholder: the photo doesn't show Mango Sticky Rice.                                               |
| `khao-pad`               | Thailand | Placeholder          | Plain fried rice with carrot and scallion; no crab.                                                                                  | Placeholder: plain fried rice, not the crab fried rice on this menu.                                 |
| `panang-curry`           | Thailand | Placeholder          | The same red Thai curry photo as green curry.                                                                                        | Placeholder: one red-curry photo was used for three different curries.                               |
| `khao-soi`               | Thailand | Placeholder          | A ramen-style bowl: wheat noodles, soft-boiled eggs, shrimp and snow peas.                                                           | Placeholder: the photo doesn't show Khao Soi.                                                        |
| `tacos-al-pastor`        | Mexico   | Placeholder          | Chickpea-and-avocado tacos being finished with lime; no pork. Identical file to `chiles-rellenos`, `chilaquiles`, `elote-guacamole`. | Placeholder: the photo doesn't show Tacos al Pastor.                                                 |
| `mole-poblano`           | Mexico   | Placeholder          | Fish or shrimp tacos with slaw, held in a hand. Identical file to `tamales`.                                                         | Placeholder: the photo doesn't show Mole Poblano.                                                    |
| `carne-asada`            | Mexico   | Placeholder          | Three loaded soft tacos with vegetable toppings; no grilled steak visible. Identical file to `enchiladas-verdes`.                    | Placeholder: the photo doesn't show Carne Asada Plate.                                               |
| `enchiladas-verdes`      | Mexico   | Placeholder          | Three loaded soft tacos with vegetable toppings. Identical file to `carne-asada`.                                                    | Placeholder: the photo doesn't show Enchiladas Verdes.                                               |
| `chiles-rellenos`        | Mexico   | Placeholder          | Chickpea-and-avocado tacos being finished with lime. Identical file to `tacos-al-pastor`, `chilaquiles`, `elote-guacamole`.          | Placeholder: the photo doesn't show Chiles Rellenos.                                                 |
| `pozole-rojo`            | Mexico   | Placeholder          | A sliced pizza on a wooden board.                                                                                                    | Placeholder: the photo doesn't show Pozole Rojo.                                                     |
| `tamales`                | Mexico   | Placeholder          | Fish or shrimp tacos with slaw, held in a hand. Identical file to `mole-poblano`.                                                    | Placeholder: the photo doesn't show Tamales Oaxaqueños.                                              |
| `huitlacoche-quesadilla` | Mexico   | Placeholder          | Quesadilla wedges with a vegetable filling and avocado; no huitlacoche visible.                                                      | Placeholder: the photo doesn't show Huitlacoche Quesadilla.                                          |
| `chilaquiles`            | Mexico   | Placeholder          | Chickpea-and-avocado tacos being finished with lime. Identical file to `tacos-al-pastor`, `chiles-rellenos`, `elote-guacamole`.      | Placeholder: the photo doesn't show Chilaquiles.                                                     |
| `elote-guacamole`        | Mexico   | Placeholder          | Chickpea-and-avocado tacos being finished with lime. Identical file to `tacos-al-pastor`, `chiles-rellenos`, `chilaquiles`.          | Placeholder: the photo doesn't show Elote & Guacamole.                                               |
| `margherita`             | Italy    | Representative photo | Neapolitan margherita pizza: blistered crust, tomato, mozzarella, basil. Identical file to `osso-buco`.                              | Kept. Matches the dish.                                                                              |
| `carbonara`              | Italy    | Representative photo | Spaghetti topped with crisp cured pork and grated cheese.                                                                            | Kept. Matches the dish.                                                                              |
| `lasagna`                | Italy    | Representative photo | A square of lasagna on tomato sauce, garnished with crisp cured ham, cherry tomatoes and herbs.                                      | Kept, flagged: the ham garnish isn't in our recipe, and our pasta is green (spinach). Replace first. |
| `cacio-e-pepe`           | Italy    | Placeholder          | Meatballs on a bed of greens.                                                                                                        | Placeholder: the photo doesn't show Cacio e Pepe.                                                    |
| `osso-buco`              | Italy    | Placeholder          | Neapolitan margherita pizza (the margherita photo). Identical file to `margherita`.                                                  | Placeholder: the photo doesn't show Osso Buco.                                                       |
| `risotto-milanese`       | Italy    | Placeholder          | A pale risotto with herbs, not saffron-yellow.                                                                                       | Placeholder: a plain risotto, not saffron risotto alla milanese.                                     |
| `gnocchi-pesto`          | Italy    | Placeholder          | Penne in tomato sauce.                                                                                                               | Placeholder: the photo doesn't show Gnocchi al Pesto.                                                |
| `eggplant-parmigiana`    | Italy    | Placeholder          | Bruschetta: toasted bread topped with chopped tomato.                                                                                | Placeholder: the photo doesn't show Eggplant Parmigiana.                                             |
| `tiramisu`               | Italy    | Representative photo | A square of tiramisu dusted with cocoa, garnished with pomegranate seeds and a small plaque.                                         | Kept, flagged: the pomegranate garnish isn't in our recipe.                                          |
| `burrata-caprese`        | Italy    | Placeholder          | Fusilli pasta with tomato.                                                                                                           | Placeholder: the photo doesn't show Burrata Caprese.                                                 |

## Other images in `public/`

| File                                                                     | What it shows                                                                                                                              | Status                                                      |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `og.jpg`                                                                 | Was a collage of dishes that looks AI-generated. Now a typographic card: wordmark, headline, the five cuisines' names in their own scripts | Replaced                                                    |
| `food/hero.jpg`                                                          | People cooking together in a home kitchen                                                                                                  | No longer used                                              |
| `food/kitchen.jpg`                                                       | A chef flambéing in a restaurant kitchen; the old Kitchens page implied it was ours                                                        | No longer used                                              |
| `food/trace.jpg`                                                         | Whole spices laid out on a table (the old lot-code page)                                                                                   | No longer used                                              |
| `food/india.jpg`, `nepal.jpg`, `thailand.jpg`, `mexico.jpg`, `italy.jpg` | Old cuisine covers, all copies of dish photos above                                                                                        | No longer used; cuisine cards use each cuisine's cover dish |

The files marked "no longer used" and the 42 replaced dish photos are still in
`public/food/` so this audit can be checked against them. Delete them when real
photos arrive.
