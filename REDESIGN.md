# REDESIGN.md — WorldFoodCuisine: World-Class Upgrade (App-Ready)

> **How to use:** keep this file in the repo root. Fill in §0.3 ("What only you can answer"), then tell your coding agent:
> *"Read REDESIGN.md and start Phase 0."* In later sessions: *"Continue with the next phase in REDESIGN.md."*

## Status (24 Sep 2026)

Phases 0–2 and the trust, ordering, responsive, PWA and SEO work were done in
one pass. Decisions that change the brief below:

- **No ingredient traceability.** The owner's direction: the point isn't lot
  codes or suppliers. It's that dishes are cooked in olive oil, butter or ghee,
  masalas start from whole spices, and ingredients are whole, minimally
  processed and free of preservatives and chemical additives. Every dish lists
  what it's made of, component by component. Lot codes, supplier names, farms
  and the `/trace` page are gone (`/trace` redirects to `/ingredients`).
- **No invented business facts.** The 12 cities, named kitchens, ETAs and
  Uber Eats / DoorDash / Grubhub listings weren't real, so they're gone
  (`/kitchens` and `/partners` redirect to `/delivery`). Ordering starts with a
  ZIP code; no ZIP is served until a real delivery zone is added. A clearly
  labeled demo mode lets people try the flow. Nothing is sent or charged.
- **Photos:** see `docs/IMAGE-AUDIT.md`. Only 8 photos match their dish, and
  they're labeled as representative stock photos. The other 42 dishes show
  AI-generated images, labeled as such, until we photograph our own plates.
- **What's still needed from the business:** `docs/LAUNCH-CHECKLIST.md`.
  **Adding cuisines:** `docs/EXPANSION.md`.

## 0 · Brief

### 0.1 What the repo already tells us (first pass, 24 Sep 2026 — confirm in Phase 0)
- **What it is:** a delivery-only food brand in preparation. 50 dishes, 10 each from India, Nepal, Thailand, Mexico and Italy, with every ingredient listed per dish. No dining room, no pickup, and not delivering yet.
- **Who it's for (from the old copy):** office workers ordering weekday lunch and people ordering dinner at home. They want regional food and want to know what's in it. (The old copy named kitchen hubs and 12 US cities; none of those exist yet.)
- **The ONE action:** order delivery (add to bag → checkout).
- **Voice to keep:** terse, confident, kitchen-insider ("A kitchen. Not a restaurant."). It's the strongest thing on the site. Sharpen it; don't replace it.
- **Pages:** `/`, `/menu`, `/menu/$cuisine`, `/dish/$id`, `/ingredients`, `/delivery`, `/checkout`, `/order/$id`. Old URLs redirect: `/kitchens` and `/partners` → `/delivery`, `/trace` → `/ingredients`.
- **Stack:**
  - TanStack Start (React 19, file routes in `src/routes/`) on Vite 8
  - Tailwind CSS v4, with tokens in `src/styles.css` (`@theme`)
  - Radix + shadcn-style components in `src/components/ui/`
  - Zustand stores for the bag, delivery area and demo orders, saved in the browser's localStorage (`src/lib/store/`)
  - All menu data is static, in `src/lib/food/` (`dishes.ts`, `cuisines.ts`, helpers in `data.ts`); delivery zones in `src/lib/ordering/zones.ts`
  - Production build: Nitro with the Vercel preset
- **Origin:** scaffolded by Grok's app builder. The site doesn't use these template modules:
  - auth (better-auth + PGLite + `migrations/`)
  - multiplayer
  - app-data connectors
  - the Grok preview bridge
  - the `/__grok` PWA install page

  `AGENTS.md` is gitignored in this repo, so put agent instructions in `CLAUDE.md`.
- **Commands:** `npm install` · `npm run dev` (port 8080) · `npm run build` · `npm run typecheck` · `npm run lint` · `npm test`. Playwright is already a dev dependency; use it for screenshots.

### 0.2 Known problems (found 24 Sep 2026 — verify, then fix in the phases below)
1. **Wrong and duplicate dish photos.** This is the biggest credibility problem. There are 58 photo files but only 46 unique images, and about 30 of the 50 dishes show another dish's photo or the wrong food. Examples:
   - One taco photo is used for Tacos al Pastor, Chiles Rellenos, Chilaquiles and Elote & Guacamole, and for the Mexico card.
   - Mango Sticky Rice uses Pad Thai's photo, and Tom Yum is a recrop of it.
   - Osso Buco, Pozole Rojo and Chatamari all show pizza.
   - Yomari shows a chocolate cake, Sel Roti shows samosas, Cacio e Pepe shows meatballs, and Gnocchi al Pesto shows penne in tomato sauce.
   - Green, Massaman and Panang Curry share one red-curry photo. Khao Soi and Thukpa share one ramen photo.

   The Nepal line is hit hardest: 8 of its 10 dishes are affected.
2. **Off-brand hero.** Under "A kitchen. Not a restaurant." sits a stock-style photo of two people cooking in a home kitchen. Its alt text says "kitchen line".
3. **Broken cuisine pages.** `/menu/india`, `/menu/nepal` and the other cuisine pages all render the full menu. The cause: `src/routes/menu.tsx` is a parent layout with no `<Outlet />`. One fix is to make it an index route, `menu.index.tsx`.
4. **Image weight.** 17.8 MB of JPGs, with no lazy loading, no width/height and no AVIF/WebP or srcset. The menu page downloads about 15.7 MB of images on a phone.
5. **Home-screen identity.**
   - The web manifest names the app "Grok App" on any domain except `*.grok.me`.
   - The icon is a generic Grok placeholder, 180 px only; there are no 192/512 or maskable icons.
   - There's no service worker and no offline page.
   - The theme colors disagree (`#09090b` vs `#000000`).
6. **iPhone zoom.** Inputs and selects use 14 px text, so Safari zooms in when you tap into search or checkout.
7. **Mobile.**
   - No safe-area handling (no `viewport-fit=cover`).
   - No bottom navigation.
   - The dish page's Add button isn't sticky.
   - The home page runs about 15 phone screens long.
   - Checkout errors appear as gray text without `aria-live`.
8. **SEO.**
   - Every page has the same title.
   - There are no per-page descriptions, no sitemap.xml, no robots.txt and no JSON-LD.
   - Unknown URLs show a bare "Not Found", and the error screen uses unrelated gray styling.
9. **Fonts.** Syne and Manrope load through a render-blocking CSS `@import` from Google Fonts.
10. **Checkout is a demo.** There's no payment, orders live only in the visitor's browser, and the order-status timeline runs on timers.
11. **Repo hygiene.**
    - `package-lock.json` is out of sync: `npm ci` fails, though `npm install` works.
    - Lint shows 1 error and 1 warning in template code.
    - The main JS bundle is 404 KB (122 KB gzipped).
    - Type-check and the production build pass.
12. **Claims to verify before launch.** Anything you can't confirm becomes a clearly marked placeholder. To check:
    - 12 cities, each with a named kitchen and an ETA.
    - Uber Eats, DoorDash and Grubhub listings. The buttons open the apps' homepages, not store pages.
    - Real companies named as suppliers: Mary's Free Range, Straus Family Creamery, Rancho Gordo, Weiser Family Farms, Dirty Girl Produce, Five Dot Ranch and others.
    - 109 ingredient lot codes.
    - Lines like "The plate Bay Area orders twice a week."

### 0.3 What only you can answer (fill in before Phase 0)
- Stage: [operating today / launching soon / concept or prototype]
- Which claims in 0.2 #12 are true:
- Ordering: [keep the demo checkout, clearly labeled / real payments (e.g., Stripe) / send people to our Uber Eats or DoorDash store pages / waitlist]
- Dish photos: [I'll shoot real photos of our plates / AI-generated for now, replaced with real ones before launch]
- Brand personality, 3 adjectives: [suggested from the current copy: confident, transparent, precise — consider adding "warm"]
- Brand freedom: [keep the name and wordmark, refresh everything else / open to a full rebrand]
- Color mode: [dark only, as now / light + dark / warm light by default]
- 2–3 sites I admire (for craft, not copying):
- Must NOT change: menu items and prices, the URLs in 0.1, cart and order logic, the Vercel deploy setup [edit this list]
- App plan: [installable web app (PWA) first, then iOS + Android via Capacitor / PWA only / not sure]
- Reviews: [stop after every phase (recommended) / stop only after the audit]

## 1 · Role and quality bar
Act as a principal product designer, senior front-end engineer, conversion copywriter, and photography art director working as one, joining a live product. Match the craft level (not the look) of Stripe, Linear, Apple, and Aesop. Understand before you change, keep what works, leave everything better, and never break what already works. If something wouldn't survive a demanding design lead's review, fix it before showing me. This is a food brand: every screen should make people hungry and make the sourcing story feel real.

## 2 · Ground rules (non-negotiable)
- Git: work on a new branch (e.g., redesign/world-class) created from the default branch. Small commits, one logical change each, clear messages. Never commit directly to the default branch, force-push, or rewrite history. Ask me before pushing or opening a pull request.
- The app must build and run after every commit. After each phase, run the build, lint, type-check, and tests, and fix anything you broke.
- Preserve behavior: no changes to business logic, data models, APIs, payments, analytics, environment variables, or URLs without my approval. If a URL must change, add a redirect. Fixing the bugs in §0.2 is approved.
- Follow the existing stack and conventions (TanStack Start, Tailwind v4 tokens, the existing component patterns, folder structure, naming, lint/format rules). Don't switch frameworks, add a second styling system, or add heavy dependencies without asking; justify each new dependency in one line.
- Before changing a shared component or style, find every usage and update them all. Remove code your changes make obsolete; list any whole files or template modules you want to delete and wait for approval.
- Never print, change, or commit secrets; .env files stay untouched and out of git.
- Keep real content real: preserve existing claims in meaning, tighten the wording, never invent or inflate, and follow §0.3 for every claim in §0.2 #12.
- If you can't run something (missing env vars, services, tools), tell me exactly what to run and what to look for instead of guessing.

## 3 · Phase 0 — Audit (no code changes, then STOP)
- Start from §0.1 and §0.2: confirm or correct each point, and add anything missed.
- Map the repo: rendering mode, every route, styling system, components, stores, data, build and deploy setup, tests.
- Run it: install, build, and start it locally; note errors and warnings. Record a baseline: mobile Lighthouse scores for key pages, an accessibility scan (e.g., axe), bundle size, and Playwright screenshots of key pages at 390px and 1440px in docs/screenshots/before/.
- Design audit: inventory the colors, font sizes, spacing values, radii, shadows, and near-duplicate components actually used in the code.
- App-readiness audit: what needs a server at runtime? Can TanStack Start's SPA mode or static prerendering produce a build Capacitor can wrap (menu data is static and the cart is client-side)?
- Write AUDIT.md with:
  - what's already good (keep)
  - the top 10 problems, ranked by impact
  - risks
  - a proposed design direction (one paragraph tied to the audience) with ONE signature element that makes the site memorable. The chosen one: the ingredient list itself, shown component by component on every dish.
  - a phased plan listing the files each phase touches

  Then stop and wait for my go-ahead.

## 4 · Phase 1 — Design system foundation
Turn the inventory into tokens in `src/styles.css` (`@theme` + CSS variables), then refactor the base components (buttons, inputs, selects, badges, cards, navigation, the cart drawer) to use them.
- Type: a distinctive display face + a highly readable text face, max 2 families, self-hosted (replace the Google Fonts `@import`), modular scale; body 16–18px, line-height 1.5–1.7, 60–75 characters per line; text-wrap: balance on headings.
- Color: semantic variables (background, surface, text, muted, primary, accent, border, success, warning, danger); one dominant brand color, one sharp accent (food needs warmth), a full neutral scale; light and dark themes unless §0.3 says dark only; contrast ≥ 4.5:1 for body text and ≥ 3:1 for large text and UI.
- Layout: 4/8px spacing scale, consistent grid and max width, generous whitespace; consistent vertical rhythm, varied section layouts.
- Surfaces and motion: one radius scale, subtle layered shadows, hairline borders; 150–300ms ease-out on transform/opacity only; hover effects only on devices that hover; full prefers-reduced-motion support.
- Craft: one icon set with a consistent stroke (Lucide is already installed; never emoji), branded focus rings, tabular numbers for prices, a designed 404 page, and an error screen that matches the brand.
- Banned clichés: purple-to-blue gradients on white; Inter/Roboto/Arial as the only typeface; everything centered; glassmorphism and blobs everywhere; unmodified component-library defaults; generic "Revolutionize your workflow" copy.
Write DESIGN.md (tokens, components, usage rules, do's and don'ts) and add a short pointer to it in `CLAUDE.md` (create it) so future sessions stay consistent.

## 5 · Phase 2+ — Page-by-page redesign
Order:
1. Bug fixes from §0.2 (#3 cuisine pages, #6 iPhone zoom).
2. Layout shell: header, navigation, footer, cart drawer.
3. Home.
4. Menu, cuisine, and dish pages.
5. Checkout and order tracking.
6. Order near me (`/delivery`) and What's in our food (`/ingredients`), which replaced Kitchens, Trace and Partners.

For each page, define its job and section order, then fix hierarchy, copy, states, and responsiveness. Reuse components before creating new ones. Shorten the phone home page.
- Check 360, 390, 430, 768, 1024, and 1440px: no horizontal scroll, nothing overlapping.
- Touch targets ≥ 44×44px with ≥ 8px gaps; nothing works only on hover.
- viewport-fit=cover with env(safe-area-inset-*) padding; dvh instead of vh.
- App-like phone navigation: a bottom tab bar (≤ 5 items, e.g., Home, Menu, Ingredients, Bag); a sticky "Add to bag · $price" bar on dish pages and a sticky checkout bar when the bag has items.
- Forms: input and select text ≥ 16px, correct type/inputmode/autocomplete, inline validation, errors announced with aria-live in plain language.
- Every state designed: hover, focus-visible, pressed, disabled, loading (skeletons), empty, error, success.
- Copy: keep the voice from §0.1. Headline ≤ 10 words stating the customer's outcome; specific CTA verbs; short paragraphs, benefits before features. Never invent testimonials, reviews, stats, logos, or awards; use placeholders like [REAL CUSTOMER QUOTE].

## 6 · Realistic photography

> **Rule (24 Sep 2026):** a dish photo must be a real photo of our own plate, or
> a stock photo labeled "Representative photo". Generated images may only be
> used as labeled illustrations, never as a dish photo or anything that could
> pass for our food or kitchen. The prompts below are for briefing a
> photographer or for labeled illustrations.

A) Inventory existing images. Keep the strong, correct ones and optimize them. List every wrong or duplicate photo from §0.2 #1 as a slot to replace, with the Nepal line first.
B) Style guide: one paragraph on mood, lighting, lens feel, subjects, and a color grade matched to the palette, plus a one-sentence STYLE ANCHOR added to every prompt so all images look like one shoot (e.g., "soft natural light, warm neutral grade, muted earth tones, subtle film grain, calm and unposed").
C) Slots to cover:
   - 50 dish photos, one per plate, each showing that exact dish
   - 5 cuisine cards
   - the home hero: a real production kitchen or plates leaving the pass, not a home kitchen
   - the 1200×630 share image (currently a typographic card; see `docs/IMAGE-AUDIT.md`)

   This is a delivery-only brand, so shoot some plates in the actual packaging.
D) For each slot, give:
   - file name
   - aspect ratios (desktop + mobile crop, e.g., 16:9 and 4:5; dish cards 4:3)
   - minimum size (heroes ≥ 2400px wide)
   - where text will overlay (leave clean negative space there) and a crop-safe zone for the subject
   - alt text
   - a prompt in this order:
     [shot type] of [the exact dish, with its defining ingredients, garnish, and serving vessel] in [specific setting with 2–3 concrete details], [time of day + light direction and quality], shot on a full-frame camera with a [focal length] lens at [aperture], [composition + negative space], [depth of field], [color grade tied to the brand palette], natural textures and small real-world imperfections, candid editorial photograph, [aspect ratio]. + STYLE ANCHOR
   Avoid: text, letters, logos, watermarks, distorted hands or extra fingers, waxy or plastic textures, over-smoothing, HDR look, oversaturation, CGI/3D-render look, stock-photo posing.
   Example: 45-degree shot of Nepali chicken momo, twelve hand-pleated dumplings in a steel steamer tray beside a small bowl of orange sesame-tomato achar, on a worn wooden prep counter with a folded linen towel, soft morning light from a window camera-left, shot on a full-frame camera with a 100mm macro lens at f/4, dumplings on the right third with clean negative space on the left, shallow depth of field, warm neutral grade with muted brass accents, visible dough folds and steam, candid editorial photograph, 4:3.
E) Recipes:
   - plated food: 45° or overhead, window light, 50–100mm
   - packaging and bags: seamless backdrop, softbox at 45° + rim light, grounded shadow
   - kitchen and people: 35mm, f/2–2.8, available light, candid motion
F) Until the images exist, use local placeholders at the exact final dimensions (no hotlinked stock photos). Export AVIF/WebP at several widths for srcset, with explicit width/height. Keep large originals out of git.
G) Honesty rules:
   - If the business is operating, dish photos must show what customers actually receive. AI images are temporary placeholders only.
   - Never generate photos presented as real staff, customers, or reviewers.

## 7 · App readiness
- Move toward this incrementally, with no big rewrites without approval:
  - presentational components
  - logic in hooks/stores
  - one typed data layer, so a future API can replace `data.ts`
  - browser features (storage, share, location, notifications) behind small adapters
  - routes that map 1:1 to future app screens
- PWA: replace the Grok plumbing (`/__grok` manifest, placeholder icon, install page) with the app's own web manifest, and ask before removing template modules. The manifest needs:
  - name "WorldFoodCuisine", short_name, start_url, display: standalone, matching theme/background colors
  - 192/512px + maskable icons
  - a service worker caching the app shell and menu, and an offline fallback page
  - a 180×180 Apple touch icon
- If a static/SPA build isn't feasible without restructuring, don't restructure now. In MOBILE.md, recommend a path with trade-offs:
  - a static front-end + separate API
  - Capacitor loading the hosted site (weakest: offline and App Store risk)
  - React Native/Expo later, reusing the tokens and data layer
- MOBILE.md needs:
  - exact beginner steps for Capacitor: build, add iOS/Android, sync
  - icons and splash screens via @capacitor/assets, from a 1024×1024 icon with no transparency
  - status bar, haptics on Add to bag, native share for dishes, and push notifications for order status
  - which native features take it beyond a wrapped website, since Apple may reject apps that are just repackaged sites (App Store guideline 4.2)

## 8 · Performance, accessibility, SEO (beat the Phase 0 baseline)
- Mobile Core Web Vitals: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1; Lighthouse ≥ 90 in all four categories.
- Images sized with explicit width/height, lazy-loaded below the fold, hero prioritized; fonts self-hosted, subset, font-display: swap.
- WCAG 2.2 AA: landmarks, one H1 per page, logical headings, visible focus, full keyboard use (including the cart drawer), labeled inputs, meaningful alt text.
- SEO:
  - a unique title and description per page (per dish and per cuisine, too)
  - Open Graph tags with a 1200×630 share image
  - JSON-LD for the business type and menu
  - sitemap.xml, robots.txt, canonical URLs
  - no broken existing URLs

## 9 · QA checklist (after every phase: fix failures, then report)
- [ ] Everything that worked before still works; build, lint, type-check, and tests pass
- [ ] Every dish shows its own correct photo; `/menu/<cuisine>` shows that cuisine
- [ ] Looks intentional and ownable, and makes you hungry; nobody would guess it came from a template
- [ ] Squint test: one clear focal point per section; "Order delivery" obvious within 3 seconds
- [ ] Only tokens used; no leftover one-off colors, sizes, or spacing
- [ ] Flawless at 360px and 1440px; no iPhone zoom on inputs; safe areas respected
- [ ] Keyboard, focus, contrast, labels, and alt text pass; no layout shift
- [ ] Scores beat the baseline; no console errors; no broken URLs
- [ ] No unverified claims left except marked placeholders

## 10 · Deliverables
1. AUDIT.md (Phase 0), then stop.
2. One phase at a time on the branch, each ending with: what changed, files touched, how to check it, and before/after screenshots.
3. DESIGN.md + the pointer in `CLAUDE.md`.
4. IMAGES.md: style guide, STYLE ANCHOR, and the full shot list with prompts (all 50 dishes).
5. MOBILE.md.
6. An updated README.md with beginner-friendly commands to run, build, and deploy.
7. A final report: before/after scores, what's left, and the top 5 next improvements.
