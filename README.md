# WorldFoodCuisine

Delivery-only kitchens. Fifty authentic plates from India, Nepal, Thailand, Mexico, and Italy — named farms, lot codes, no dining room.

## Run locally (Visual Studio / VS Code)

You need **Node.js 22** and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

| Script | What it does |
|---|---|
| `npm run dev` | Local server at `0.0.0.0:8080` |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |

No database or login is required. Cart and orders stay in the browser (`localStorage`).

## Open in Visual Studio

1. Unzip this folder.
2. File → Open → Folder (or Open a Local Folder).
3. Terminal → `npm install` then `npm run dev`.

VS Code: same steps. Optional: install the ESLint and Tailwind CSS extensions.

## What’s in the app

- Menu: 10 dishes each from India, Nepal, Thailand, Mexico, Italy
- Traceable ingredient lots on every plate
- Delivery-only checkout (no pickup, no walk-in)
- 12 US cities (SF, San Jose, and more)
- Uber Eats / DoorDash / Grubhub partner listings
