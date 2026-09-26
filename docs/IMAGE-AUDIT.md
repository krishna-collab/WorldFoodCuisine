# Dish photo audit

Checked by eye on 24 September 2026, against each dish's recipe in
`src/lib/food/dishes.ts`. Every photo in `public/food/` came with the site
template. Nobody knows who took these photos or what license they're under.

On 25 September 2026 the owner supplied AI-generated images for the 42 dishes
that had placeholders. Each was checked by eye against its recipe; see
[AI-generated images](#ai-generated-images) below.

## Summary

- **8 of 50 dishes keep a photo**, shown as a _representative photo_: a stock
  image of a typical version of the dish, labeled on every card, dish page and
  bag thumbnail as not being our food. Two of the eight are flagged because the
  garnish differs from our recipe.
- **42 dishes show an AI-generated image**, labeled "AI illustration" on
  every card and dish page and in the alt text, because the old photo showed a
  different dish. They replace the "Photo coming soon" placeholders. Under
  REDESIGN.md §6, AI images may only be labeled illustrations and temporary
  stand-ins: **replace them with photos of our own plates before we start
  delivering.**
- Where an image shows something our dish doesn't include (naan or rice on the
  side, cheese on the beans), the dish page says so under "About the image".
- The template reused photos across dishes. One chickpea-taco photo stood in
  for four Mexican dishes and the Mexico cover. Pad Thai photos stood in for
  Mango Sticky Rice and Tom Yum. One red-curry photo stood in for green,
  massaman and panang curry.
- **License and source are unknown for all 8 kept photos.** Before launch,
  confirm each license or replace the photo. Each photo's metadata records
  this as `review: "needs-review"`.
- **The tool that made the AI images isn't recorded.** Record it and confirm
  its terms allow commercial use. These are `review: "needs-review"` too.
- The share image (`public/og.jpg`) was a food collage that looks AI-generated. It's now
  a typographic card with no food photos. Dish pages don't use stock photos or
  AI images as share images, because a link preview can't show their label.

## Second look at the 8 stock photos (25 September 2026)

Checked again at the crops the redesigned pages use:

- **Lasagna** and **tiramisu** are portrait photos (1400 × 1867 px) shown in
  landscape frames, so every layout crops them hard. Their focal points keep
  the food in frame, but replace these two first.
- **Tiramisu** also shows someone's sleeve and arm at the edge of the frame,
  and a small plaque on the cake with writing on it (possibly a café's name).
- **Chicken biryani** and **masala dosa** have the very even lighting and
  styling common in AI-generated food images. We can't tell for sure. If
  either turns out to be AI-made, change it to `generated(...)` so it's labeled
  "AI illustration", or replace it.
- Butter chicken, pad thai, margherita and carbonara still match their dishes.

## No photo catalog

The 42 AI images arrived as JPEG files only, with no catalog: no prompts, tool
name, dates or license terms. Everything recorded here comes from looking at
each image. If a catalog exists, keep it next to this file and record the tool
and its commercial-use terms (see `docs/LAUNCH-CHECKLIST.md`, Photos).

## How photos are stored

Each dish's `image` field holds the photo and its metadata (`src/lib/food/types.ts`):

| Field               | Meaning                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| `kind`              | `own` (our plate), `representative` (labeled stock photo), `generated` (labeled AI image), or `placeholder` |
| `alt`               | What the photo actually shows. For a placeholder, what an accurate photo should show                        |
| `focal`             | CSS `object-position` so crops keep the food in frame                                                       |
| `source`, `license` | Where the photo came from and the license it's used under                                                   |
| `review`            | `needs-review` or `approved` for photos; `awaiting-photo` for placeholders                                  |
| `note`              | Optional. Where the image differs from our recipe; shown on the dish page                                   |

Cards, dish pages, the bag and checkout all render through one component
(`src/components/food/dish-image.tsx`), so every page shows the same image and
label for a dish. `npm run test:menu` fails if two dishes share a photo file,
if a photo file is missing, if metadata is empty, if an image that isn't our
own food has no on-screen label, if an AI image isn't named `<dish>-ai.jpg`, or
if a dish is missing from this audit.

**To add a photo of our own food:** put the file in `public/food/`, then set the
dish's image to `ownPhoto("/food/<file>.jpg", "<what it shows>", { source: "Photographed in our kitchen by <name>, <month year>" })`.
Change `review` to `"approved"` once someone has checked the plate matches the recipe.
The dish's AI image (`public/food/<dish>-ai.jpg`) can then be deleted.

**To add an AI-generated image:** save it as `public/food/<dish>-ai.jpg`, then set
the dish's image to `generated("/food/<dish>-ai.jpg", "<what it shows>", { note: "<where it differs from our recipe>" })`.
Leave out `note` if nothing differs.

## All 50 dishes

"Old photo" is the file the site used before this change (`public/food/<id>.jpg`).

| Dish                     | Cuisine  | Now                  | What the old photo shows                                                                                                             | Decision                                                                                             |
| ------------------------ | -------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `butter-chicken`         | India    | Representative photo | Butter chicken in a dark pan, cream drizzled over the orange gravy.                                                                  | Kept. Matches the dish.                                                                              |
| `chicken-biryani`        | India    | Representative photo | Chicken biryani in a dark pot, with raita on the side.                                                                               | Kept. Matches the dish.                                                                              |
| `masala-dosa`            | India    | Representative photo | A crisp rolled masala dosa with potato filling, coconut chutney and sambar.                                                          | Kept. Matches the dish.                                                                              |
| `palak-paneer`           | India    | AI illustration      | A small bowl of a rice or grain dish with tomato slices; no spinach.                                                                 | Replaced: the photo doesn't show Palak Paneer.                                                       |
| `tikka-masala`           | India    | AI illustration      | A dark brown chicken curry with naan (same scene as newari bara).                                                                    | Replaced: the sauce is dark brown, not the orange, cream-finished tikka masala on this menu.         |
| `tandoori-chicken`       | India    | AI illustration      | Boneless chicken skewers on a charcoal grill (same scene as chicken choila).                                                         | Replaced: boneless skewers on a grill, not bone-in tandoori chicken.                                 |
| `dal-makhani`            | India    | AI illustration      | The same thali photo as dal bhat (roti, vegetable curries, dal).                                                                     | Replaced: the photo doesn't show Dal Makhani.                                                        |
| `rogan-josh`             | India    | AI illustration      | Two North Indian curries in steel bowls with a cream drizzle, and rice. Identical file to `aloo-tama`.                               | Replaced: the photo doesn't show Kashmiri Rogan Josh.                                                |
| `chole-bhature`          | India    | AI illustration      | Pav bhaji: a bowl of mashed vegetable curry with butter, and pav buns.                                                               | Replaced: the photo doesn't show Chole Bhature.                                                      |
| `malai-kofta`            | India    | AI illustration      | An orange curry with cubes (paneer or chicken) in a copper bowl, with rice and naan; no kofta.                                       | Replaced: the photo doesn't show Malai Kofta.                                                        |
| `chicken-momo`           | Nepal    | AI illustration      | Assorted dumplings: green and white steamed ones and pan-fried gyoza-style ones with vegetables.                                     | Replaced: a mixed dumpling platter, not recognizably chicken momo with achar.                        |
| `dal-bhat`               | Nepal    | AI illustration      | An Indian steel thali with roti, vegetable curries and dal.                                                                          | Replaced: the photo doesn't show Dal Bhat Tarkari.                                                   |
| `newari-bara`            | Nepal    | AI illustration      | A brown chicken curry with naan.                                                                                                     | Replaced: the photo doesn't show Newari Bara.                                                        |
| `thukpa`                 | Nepal    | AI illustration      | The same ramen-style bowl as khao soi.                                                                                               | Replaced: the photo doesn't show Thukpa.                                                             |
| `sel-roti`               | Nepal    | AI illustration      | Samosas with green chili and chutney.                                                                                                | Replaced: the photo doesn't show Sel Roti & Aloo Dum.                                                |
| `chatamari`              | Nepal    | AI illustration      | A sliced Western-style pizza on a wooden board.                                                                                      | Replaced: the photo doesn't show Chatamari.                                                          |
| `chicken-choila`         | Nepal    | AI illustration      | Boneless chicken skewers on a charcoal grill.                                                                                        | Replaced: the photo doesn't show Chicken Choila.                                                     |
| `yomari`                 | Nepal    | AI illustration      | A chocolate layer cake with piped frosting.                                                                                          | Replaced: the photo doesn't show Yomari.                                                             |
| `aloo-tama`              | Nepal    | AI illustration      | Two North Indian curries in steel bowls with a cream drizzle, and rice. Identical file to `rogan-josh`.                              | Replaced: the photo doesn't show Aloo Tama.                                                          |
| `gundruk-dhido`          | Nepal    | AI illustration      | The same thali photo as dal bhat (roti, vegetable curries, dal).                                                                     | Replaced: the photo doesn't show Gundruk & Dhido.                                                    |
| `pad-thai`               | Thailand | Representative photo | Pad Thai with shrimp, egg and bean sprouts. Identical file to `mango-sticky-rice`.                                                   | Kept. Matches the dish.                                                                              |
| `green-curry`            | Thailand | AI illustration      | A red Thai curry in a white bowl with basil and dried chilies.                                                                       | Replaced: a red curry, not green.                                                                    |
| `tom-yum`                | Thailand | AI illustration      | Pad Thai with shrimp.                                                                                                                | Replaced: the photo doesn't show Tom Yum Goong.                                                      |
| `pad-kra-pao`            | Thailand | AI illustration      | Breaded fried chicken strips on lettuce with a dip.                                                                                  | Replaced: the photo doesn't show Pad Kra Pao.                                                        |
| `massaman`               | Thailand | AI illustration      | The same red Thai curry photo as green curry.                                                                                        | Replaced: a red curry; massaman is brown, with potato and peanuts.                                   |
| `som-tam`                | Thailand | AI illustration      | A pan of dark curry with herbs.                                                                                                      | Replaced: the photo doesn't show Som Tam.                                                            |
| `mango-sticky-rice`      | Thailand | AI illustration      | Pad Thai with shrimp. Identical file to `pad-thai`.                                                                                  | Replaced: the photo doesn't show Mango Sticky Rice.                                                  |
| `khao-pad`               | Thailand | AI illustration      | Plain fried rice with carrot and scallion; no crab.                                                                                  | Replaced: plain fried rice, not the crab fried rice on this menu.                                    |
| `panang-curry`           | Thailand | AI illustration      | The same red Thai curry photo as green curry.                                                                                        | Replaced: one red-curry photo was used for three different curries.                                  |
| `khao-soi`               | Thailand | AI illustration      | A ramen-style bowl: wheat noodles, soft-boiled eggs, shrimp and snow peas.                                                           | Replaced: the photo doesn't show Khao Soi.                                                           |
| `tacos-al-pastor`        | Mexico   | AI illustration      | Chickpea-and-avocado tacos being finished with lime; no pork. Identical file to `chiles-rellenos`, `chilaquiles`, `elote-guacamole`. | Replaced: the photo doesn't show Tacos al Pastor.                                                    |
| `mole-poblano`           | Mexico   | AI illustration      | Fish or shrimp tacos with slaw, held in a hand. Identical file to `tamales`.                                                         | Replaced: the photo doesn't show Mole Poblano.                                                       |
| `carne-asada`            | Mexico   | AI illustration      | Three loaded soft tacos with vegetable toppings; no grilled steak visible. Identical file to `enchiladas-verdes`.                    | Replaced: the photo doesn't show Carne Asada Plate.                                                  |
| `enchiladas-verdes`      | Mexico   | AI illustration      | Three loaded soft tacos with vegetable toppings. Identical file to `carne-asada`.                                                    | Replaced: the photo doesn't show Enchiladas Verdes.                                                  |
| `chiles-rellenos`        | Mexico   | AI illustration      | Chickpea-and-avocado tacos being finished with lime. Identical file to `tacos-al-pastor`, `chilaquiles`, `elote-guacamole`.          | Replaced: the photo doesn't show Chiles Rellenos.                                                    |
| `pozole-rojo`            | Mexico   | AI illustration      | A sliced pizza on a wooden board.                                                                                                    | Replaced: the photo doesn't show Pozole Rojo.                                                        |
| `tamales`                | Mexico   | AI illustration      | Fish or shrimp tacos with slaw, held in a hand. Identical file to `mole-poblano`.                                                    | Replaced: the photo doesn't show Tamales Oaxaqueños.                                                 |
| `huitlacoche-quesadilla` | Mexico   | AI illustration      | Quesadilla wedges with a vegetable filling and avocado; no huitlacoche visible.                                                      | Replaced: the photo doesn't show Huitlacoche Quesadilla.                                             |
| `chilaquiles`            | Mexico   | AI illustration      | Chickpea-and-avocado tacos being finished with lime. Identical file to `tacos-al-pastor`, `chiles-rellenos`, `elote-guacamole`.      | Replaced: the photo doesn't show Chilaquiles.                                                        |
| `elote-guacamole`        | Mexico   | AI illustration      | Chickpea-and-avocado tacos being finished with lime. Identical file to `tacos-al-pastor`, `chiles-rellenos`, `chilaquiles`.          | Replaced: the photo doesn't show Elote & Guacamole.                                                  |
| `margherita`             | Italy    | Representative photo | Neapolitan margherita pizza: blistered crust, tomato, mozzarella, basil. Identical file to `osso-buco`.                              | Kept. Matches the dish.                                                                              |
| `carbonara`              | Italy    | Representative photo | Spaghetti topped with crisp cured pork and grated cheese.                                                                            | Kept. Matches the dish.                                                                              |
| `lasagna`                | Italy    | Representative photo | A square of lasagna on tomato sauce, garnished with crisp cured ham, cherry tomatoes and herbs.                                      | Kept, flagged: the ham garnish isn't in our recipe, and our pasta is green (spinach). Replace first. |
| `cacio-e-pepe`           | Italy    | AI illustration      | Meatballs on a bed of greens.                                                                                                        | Replaced: the photo doesn't show Cacio e Pepe.                                                       |
| `osso-buco`              | Italy    | AI illustration      | Neapolitan margherita pizza (the margherita photo). Identical file to `margherita`.                                                  | Replaced: the photo doesn't show Osso Buco.                                                          |
| `risotto-milanese`       | Italy    | AI illustration      | A pale risotto with herbs, not saffron-yellow.                                                                                       | Replaced: a plain risotto, not saffron risotto alla milanese.                                        |
| `gnocchi-pesto`          | Italy    | AI illustration      | Penne in tomato sauce.                                                                                                               | Replaced: the photo doesn't show Gnocchi al Pesto.                                                   |
| `eggplant-parmigiana`    | Italy    | AI illustration      | Bruschetta: toasted bread topped with chopped tomato.                                                                                | Replaced: the photo doesn't show Eggplant Parmigiana.                                                |
| `tiramisu`               | Italy    | Representative photo | A square of tiramisu dusted with cocoa, garnished with pomegranate seeds and a small plaque.                                         | Kept, flagged: the pomegranate garnish isn't in our recipe.                                          |
| `burrata-caprese`        | Italy    | AI illustration      | Fusilli pasta with tomato.                                                                                                           | Replaced: the photo doesn't show Burrata Caprese.                                                    |

## AI-generated images

Supplied by the owner on 25 September 2026 and checked by eye against each
recipe. The files are `public/food/<dish>-ai.jpg`, compressed from the
originals (1448 × 1086 px). Every one is labeled "AI illustration" on
screen and "AI-generated illustration" in its alt text, and none is used as a share image.

"Differs from our recipe" lists things the image shows that the dish doesn't
include, or ingredients that look different. Where it matters to someone
ordering, the same note appears on the dish page under "About the image".

| Dish                     | What the image shows                                                                                                               | Differs from our recipe                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `palak-paneer`           | Cubes of paneer in a dark green spinach gravy, in a ceramic bowl, with naan behind.                                                | The naan behind the bowl isn't part of this dish.                                    |
| `tikka-masala`           | Charred chicken pieces in an orange cream sauce with cilantro, naan behind the bowl.                                               | The naan behind the bowl isn't part of this dish.                                    |
| `tandoori-chicken`       | Two charred, deep red bone-in chicken legs with sliced red onion and lemon wedges.                                                 | Nothing noticed.                                                                     |
| `dal-makhani`            | Dark black lentils in a copper pot with a swirl of cream and a pat of butter, naan and sliced onion beside it.                     | The naan and onion beside the pot aren't part of this dish.                          |
| `rogan-josh`             | Bone-in lamb pieces in a glossy deep red gravy in a copper pot, rice behind it.                                                    | The rice behind the pot isn't part of this dish.                                     |
| `chole-bhature`          | A bowl of spiced chickpea curry with two puffed fried breads, sliced onion and a green chili.                                      | Nothing noticed.                                                                     |
| `malai-kofta`            | Four golden dumplings in a pale orange cream gravy, garnished with cilantro.                                                       | Nothing noticed.                                                                     |
| `chicken-momo`           | Pleated steamed dumplings on a plate with a small bowl of orange tomato achar.                                                     | Nothing noticed.                                                                     |
| `dal-bhat`               | A brass plate of rice with a bowl of lentil soup, potato curry, greens, tomato achar and a papad.                                  | The papad (crisp lentil wafer) isn't part of our dal bhat.                           |
| `newari-bara`            | A dark lentil patty topped with a fried egg, with roasted tomato achar on the side.                                                | The patty is thicker than a typical bara.                                            |
| `thukpa`                 | Noodles in clear broth with shredded chicken, spinach, carrot, scallion and chili.                                                 | Nothing noticed.                                                                     |
| `sel-roti`               | Thick golden fried rings beside a brass bowl of spiced potatoes.                                                                   | The rings are much thicker than real sel roti. Regenerate or replace this one first. |
| `chatamari`              | A thin, round crepe topped with minced meat, a fried egg, tomato, onion, green chili and cilantro.                                 | Nothing noticed.                                                                     |
| `chicken-choila`         | Flame-charred chicken pieces tossed with spices, scallion and cilantro in a clay bowl.                                             | The beaten rice (chiura) served with it isn't shown.                                 |
| `yomari`                 | Five white, teardrop-shaped rice-flour dumplings on a brass plate, one cut open to show a dark sesame filling.                     | Nothing noticed.                                                                     |
| `aloo-tama`              | A brass bowl of brothy curry with potato, bamboo shoot strips and black-eyed peas, with rice, greens and pickle on the plate.      | The rice, greens and pickle beside the bowl aren't part of this dish.                |
| `gundruk-dhido`          | A mound of dark buckwheat dhido beside a bowl of fermented-greens soup and a small bowl of tomato pickle.                          | The small bowl of tomato pickle isn't part of this dish.                             |
| `green-curry`            | Chicken, round Thai eggplant and pea eggplant in a pale green coconut curry with Thai basil and chili, a bowl of rice beside it.   | The bowl of rice isn't part of this dish.                                            |
| `tom-yum`                | Red-orange broth with shrimp, mushrooms, lemongrass, galangal, lime leaf, chili and cilantro.                                      | The mushrooms shown look like button mushrooms; ours are straw mushrooms.            |
| `pad-kra-pao`            | Minced meat stir-fried with holy basil and chili, with jasmine rice and a crisp fried egg.                                         | Nothing noticed.                                                                     |
| `massaman`               | Beef, potato, shallots and roasted peanuts in a reddish-brown coconut curry, a bowl of rice beside it.                             | The bowl of rice isn't part of this dish.                                            |
| `som-tam`                | Shredded green papaya with long beans, cherry tomatoes, chili, carrot and peanuts, with a lime wedge.                              | Our som tam has no carrot; the picture shows some.                                   |
| `mango-sticky-rice`      | Sliced ripe mango beside a mound of sticky rice with coconut cream and toasted mung beans, on a banana leaf.                       | Nothing noticed.                                                                     |
| `khao-pad`               | Fried rice with egg and crab, cucumber slices, lime and a small bowl of chili fish sauce.                                          | Nothing noticed.                                                                     |
| `panang-curry`           | Sliced chicken in a thick red-orange coconut curry with Thai basil, lime leaf and red chili, beside rice.                          | The rice isn't part of this dish.                                                    |
| `khao-soi`               | Egg noodles and a chicken drumstick in golden curry broth, topped with crisp fried noodles, with lime, shallot and pickled greens. | Nothing noticed.                                                                     |
| `tacos-al-pastor`        | Three corn tortillas with red marinated pork, pineapple, onion and cilantro, with lime and a red salsa.                            | The salsa shown is red; ours is a green tomatillo salsa.                             |
| `mole-poblano`           | Pieces of poultry covered in dark mole and sesame seeds, beside red rice.                                                          | The red rice isn't part of this dish, and ours is made with bone-in turkey thigh.    |
| `carne-asada`            | Sliced grilled steak with red rice, beans topped with crumbled cheese, salsa roja, grilled spring onions, lime and corn tortillas. | Our beans aren't topped with cheese.                                                 |
| `enchiladas-verdes`      | Rolled tortillas filled with chicken under green tomatillo salsa, crema, crumbled cheese, onion and cilantro.                      | Nothing noticed.                                                                     |
| `chiles-rellenos`        | Two batter-fried poblano chilies in tomato broth, with rice on the plate.                                                          | The rice isn't part of this dish.                                                    |
| `pozole-rojo`            | Red chili broth with pork and hominy, topped with shredded cabbage, radish and oregano.                                            | Nothing noticed.                                                                     |
| `tamales`                | A tamal unwrapped on banana leaves, showing masa with shredded chicken and dark mole negro.                                        | Nothing noticed.                                                                     |
| `huitlacoche-quesadilla` | A folded blue-corn tortilla with dark huitlacoche and melted cheese, with a bowl of green salsa.                                   | The bowl of green salsa isn't part of this dish.                                     |
| `chilaquiles`            | Tortilla chips in green salsa topped with a fried egg, crema, crumbled cheese, onion and cilantro.                                 | Nothing noticed.                                                                     |
| `elote-guacamole`        | Grilled corn on the cob with crema, cotija and chili, beside a bowl of chunky guacamole and lime wedges.                           | The tortilla chips served with it aren't shown.                                      |
| `cacio-e-pepe`           | Long pasta coated in creamy pecorino sauce with coarse black pepper.                                                               | Nothing noticed.                                                                     |
| `osso-buco`              | A braised cross-cut veal shank with its marrow bone, topped with gremolata, beside golden saffron risotto.                         | Nothing noticed.                                                                     |
| `risotto-milanese`       | Golden saffron risotto with grated Parmigiano and saffron threads.                                                                 | Nothing noticed.                                                                     |
| `gnocchi-pesto`          | Potato gnocchi in bright green basil pesto with green beans, pine nuts and grated cheese.                                          | Nothing noticed.                                                                     |
| `eggplant-parmigiana`    | A baked square of layered eggplant, tomato sauce and melted mozzarella, topped with basil.                                         | Nothing noticed.                                                                     |
| `burrata-caprese`        | A whole burrata over sliced ripe tomatoes with basil, olive oil, salt and pepper.                                                  | Nothing noticed.                                                                     |

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
photos arrive. The AI images are the files ending in `-ai.jpg`.
