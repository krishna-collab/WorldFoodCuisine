# WorldFoodCuisine

Fifty dishes from India, Nepal, Thailand, Mexico and Italy, with every
ingredient listed. Cooked with olive oil, butter or ghee; masalas from whole
spices; whole, minimally processed ingredients with no preservatives.

**Status:** not delivering yet. Ordering starts with a ZIP code, and no ZIP is
served until a real delivery area is added. A clearly labeled demo mode lets
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
| `npm run sitemap`   | Rebuild `public/sitemap.xml` after changing dishes or cuisines |

No database or login is required. The bag, delivery area and demo orders stay
in the browser (`localStorage`).

## Where things live

| What                                                                  | Where                                 |
| --------------------------------------------------------------------- | ------------------------------------- |
| Dishes: ingredients by component, cooking fat, allergens, diet, photo | `src/lib/food/dishes.ts`              |
| Cuisines, regions, traditions                                         | `src/lib/food/cuisines.ts`            |
| Search, collections, labels                                           | `src/lib/food/data.ts`                |
| Delivery areas, hours, fees, tax                                      | `src/lib/ordering/zones.ts`           |
| Site name, URL and the kitchen's promise                              | `src/lib/site.ts`                     |
| Offline support                                                       | `public/sw.js`, `public/offline.html` |

## Docs

- [docs/IMAGE-AUDIT.md](docs/IMAGE-AUDIT.md): every dish photo checked against its dish
- [docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md): real data and integrations still needed
- [docs/EXPANSION.md](docs/EXPANSION.md): adding cuisines without token dishes
- [REDESIGN.md](REDESIGN.md): the redesign brief and the decisions made
