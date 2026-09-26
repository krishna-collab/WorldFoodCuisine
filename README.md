# WorldFoodCuisine

Fifty dishes from India, Nepal, Thailand, Mexico and Italy, with every
ingredient listed. Cooked with olive oil, butter or ghee; masalas from whole
spices; whole, minimally processed ingredients with no preservatives.

WorldFoodCuisine is delivery-only: franchise kitchens with no dining rooms,
each cooking to order for the ZIP codes around it. The visitor's ZIP code picks
the kitchen, and each kitchen has its own menu for the day, prices, hours and
delivery fee.

**Status:** not delivering yet. Ordering starts with a ZIP code, and no ZIP is
served until a real kitchen is added. A clearly labeled demo mode lets
people try the flow; nothing is sent or charged. What the business still needs
to provide is in [docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md).

## Run locally

You need **Node.js 22** and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

| Script              | What it does                                                   |
| ------------------- | -------------------------------------------------------------- |
| `npm run dev`       | Local server at `0.0.0.0:8080`                                 |
| `npm run build`     | Production build (Vercel output)                               |
| `npm run preview`   | Serve the production build at `127.0.0.1:8081`                 |
| `npm run typecheck` | TypeScript check                                               |
| `npm run lint`      | ESLint                                                         |
| `npm run test:menu` | Menu data, allergens, photos, sitemap and ordering rules       |
| `npm test`          | All tests                                                      |
| `npm run qa`        | Browser QA against `npm run preview`: flows, offline, a11y     |
| `npm run sitemap`   | Rebuild `public/sitemap.xml` after changing dishes or cuisines |

No database or login is required. The bag, ZIP code, saved dishes and demo
orders stay in the browser (`localStorage`).

`npm run qa` needs the production build running (`npm run build`, then
`npm run preview`) and Playwright's Chromium (`npx playwright install chromium`,
or point `CHROMIUM_PATH` at a Chromium binary). It runs the browse and order
flows (including switching between kitchens), the offline checks, axe-core
accessibility checks at six widths in light and dark, and lab performance
checks, and writes `.qa/qa-results.json`.

## Where things live

| What                                                                  | Where                                 |
| --------------------------------------------------------------------- | ------------------------------------- |
| Dishes: ingredients by component, cooking fat, allergens, diet, photo | `src/lib/food/dishes.ts`              |
| Flavor lines and flavor tags                                          | `src/lib/food/editorial.ts`           |
| Draft / reviewed / verified status of food content                    | `src/lib/food/content.ts`             |
| Cuisines, regions, traditions                                         | `src/lib/food/cuisines.ts`            |
| Search, collections, labels                                           | `src/lib/food/data.ts`                |
| Menu filters                                                          | `src/lib/food/filters.ts`             |
| Kitchens: delivery areas, hours, fees, tax, menu for the day, prices  | `src/lib/ordering/zones.ts`           |
| Site name, URL and the kitchen's promise                              | `src/lib/site.ts`                     |
| Colors, type, spacing                                                 | `src/styles.css`                      |
| Offline support                                                       | `public/sw.js`, `public/offline.html` |

## Docs

- [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md): visual direction, tokens, components, content and accessibility rules
- [docs/IMAGE-AUDIT.md](docs/IMAGE-AUDIT.md): every dish photo checked against its dish
- [docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md): real data and integrations still needed
- [docs/EXPANSION.md](docs/EXPANSION.md): adding cuisines without token dishes
- [REDESIGN.md](REDESIGN.md): the redesign brief and the decisions made
