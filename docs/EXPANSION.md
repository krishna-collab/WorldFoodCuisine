# Adding cuisines

How to grow the menu beyond India, Nepal, Thailand, Mexico and Italy without
token dishes, and what the site already supports.

## Rules

1. **Ten dishes or none.** A cuisine goes live with ten dishes that show its
   range: everyday food, a festival dish, a street snack, a sweet. Not one
   famous dish standing in for a whole country. `npm run test:menu` enforces
   ten dishes per cuisine.
2. **Regional, not national.** Name the tradition each dish comes from
   (Newar, Oaxacan, Roman). Ethiopia's food isn't Eritrea's, and Sichuan isn't
   Cantonese. Where one country has several distinct cuisines, treat them as
   separate cuisines.
3. **Someone who cooks it.** Develop each dish with a cook from that tradition,
   and have a native speaker check its name in its own script.
4. **Same promise.** Olive oil, butter or ghee; spice blends from whole
   spices; whole, minimally processed ingredients; no preservatives. Where a
   tradition relies on another fat (lard, mustard oil, palm oil, sesame oil),
   say so on the dish, or leave the dish out. Don't quietly change it.
5. **Honest stories.** One or two sentences of generally accepted history. Say
   so when an origin is disputed. No "authentic", "best" or "famous".
6. **Real photos or placeholders.** New dishes start with placeholders until
   they're photographed (see `docs/IMAGE-AUDIT.md`).

## What the site already supports

- **Regions:** South Asia, Southeast Asia, East Asia, West Asia, Africa,
  Europe, Latin America, the Caribbean and Oceania (`RegionId` in
  `src/lib/food/types.ts`). Cuisine pages show the region.
- **Native names** in any script, marked with the right language so screen
  readers and fonts handle them (`cuisineLang` in `src/lib/food/data.ts`).
  Right-to-left scripts work: Hyderabadi biryani's Urdu name already does.
- **Traditions** per cuisine and per dish, **courses**, **diet tags**, the
  **nine major US allergens**, and **ingredients by component**.
- **Search** ignores accents and case (`oaxaquenos` finds `oaxaqueños`) and
  matches names, cuisines, regions, traditions, courses, diets and every
  ingredient.
- **Collections** group dishes across cuisines. They're editorial, and the
  site says so.
- **Editorial vs for sale:** stories, collections and cuisine pages are
  editorial. A dish is only for sale where a delivery area covers the
  visitor's ZIP; everywhere else it says "Not on sale yet". If you want to
  write about dishes you'll never sell, add an on-sale flag per dish first.

## Proposed order

Each step is one cuisine with ten dishes, researched with cooks from it.
Suggested order, to spread across regions:

| Region        | Candidate                                       | Why it fits this menu                                                                                                                           |
| ------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| West Asia     | Lebanese (Levantine)                            | Olive oil and whole spices at its heart; many vegetarian dishes                                                                                 |
| Africa        | Ethiopian                                       | Spice blends made from whole spices (berbere, mitmita); strong vegan tradition. Niter kibbeh is spiced clarified butter, which fits the promise |
| East Asia     | Sichuan                                         | A distinct regional cuisine; check each dish, since many traditionally use rapeseed oil                                                         |
| South America | Peruvian                                        | Clear regional traditions (coastal, Andean, Nikkei, Chifa)                                                                                      |
| Caribbean     | Jamaican                                        | Whole-spice cooking (allspice, Scotch bonnet); jerk and curry traditions                                                                        |
| Oceania       | Pacific Islander (for example Fijian or Samoan) | Root crops, coconut and earth ovens. Needs cooks from the community; don't approximate                                                          |

## Checklist for one new cuisine

- [ ] Add its id to `CuisineId` and its language to `cuisineLang`.
- [ ] Add it to `src/lib/food/cuisines.ts`: name, native name, region,
      traditions, a one-line blurb, a short story, an accent color and a
      cover dish.
- [ ] Add ten dishes to `src/lib/food/dishes.ts`, with every ingredient by
      component, cooking fat, allergens, diet tags and a placeholder photo.
- [ ] Add each dish to the audit table in `docs/IMAGE-AUDIT.md`.
- [ ] Run `npm run sitemap` and `npm run test:menu`.
- [ ] Update copy that names the cuisines or counts them:
      `SITE_DESCRIPTION` and `SHARE_IMAGE_ALT` in `src/lib/site.ts`, the home
      page hero line and section headings in `src/routes/index.tsx`, the menu
      page description in `src/routes/menu.tsx`, and the share card
      (`public/og.jpg`).
