# Design system

WorldFoodCuisine should feel like a good food magazine that works like an app.
Warm paper, dark ink and one terracotta accent. A warm serif for headlines, a
plain sans for everything you read or tap. The food carries the pages; the
controls stay quiet and predictable, because they're used with floury hands and
a phone propped against a jar.

Tokens live in `src/styles.css` (`@theme`), so every Tailwind utility
(`bg-surface`, `text-muted`, `text-display-l`, `shadow-[var(--shadow-raised)]`…)
uses them. Change a value there and the whole site follows.

## Principles

1. **Food first.** On a 390px phone, every discovery page shows a dish in the
   first screen. The chrome above it is one status line and one header.
2. **One dish, two ways to eat it.** Every dish page offers **Cook it** (herb
   green) and **Get it cooked** (clay). Both use the same dish record, image,
   ingredients and allergens, so the two paths can't disagree.
3. **Say only what's true.** Images that aren't our food are labeled on the
   image. Prices appear only where a kitchen (or the labeled demo) serves your
   ZIP code. Content shows whether it's a draft or confirmed. The site never
   invents chefs, kitchens, reviews, suppliers, allergens, nutrition, prices,
   delivery coverage or history.
4. **Quiet, large controls.** One primary action per screen, in thumb reach on
   phones. Most tap targets are 40–56px (swap buttons and filter pills are
   36px); nothing interactive is under 24px.

## Color

| Token                      | Light                 | Dark                  | Used for                                           |
| -------------------------- | --------------------- | --------------------- | -------------------------------------------------- |
| `bg`                       | `#f7f2ea`             | `#15120e`             | Page (warm paper)                                  |
| `surface`                  | `#fffdf8`             | `#1d1914`             | Cards, sheets, inputs                              |
| `sunken`                   | `#efe7da`             | `#27221b`             | Quiet panels ("Where this information comes from") |
| `fg`                       | `#1d1a16`             | `#f3ede3`             | Text, primary buttons                              |
| `muted`                    | `#574f45`             | `#c2b8a9`             | Secondary text                                     |
| `subtle`                   | `#6b6257`             | `#a89d8d`             | Captions, eyebrows, counts                         |
| `border`, `border-strong`  | `#e0d6c6`, `#c9bba6`  | `#3a332a`, `#51483c`  | Hairlines (decorative only)                        |
| `control`                  | `#857865`             | `#857a6a`             | Outlines of inputs, checkboxes, steppers           |
| `accent` = `clay` = `ring` | `#a63f1c`             | `#e58b62`             | Brand accent, Get it cooked, links, focus ring     |
| `herb`                     | `#2d5a41`             | `#8fc7a2`             | Cook it, recipe actions, "swap removes allergen"   |
| `warn-bg` / `warn-fg`      | `#fbefd0` / `#5e4100` | `#3a2c0f` / `#f4d07e` | Demo mode, drafts, "not yet"                       |
| `danger`                   | `#a3261b`             | `#f08a7e`             | Errors, "swap adds an allergen"                    |

Contrast, checked for every pair used (WCAG 2.2 AA needs 4.5:1 for text and
3:1 for control outlines):

| Pair                    | Light  | Dark   |
| ----------------------- | ------ | ------ |
| `fg` on `bg`            | 15.6:1 | 16.0:1 |
| `muted` on `sunken`     | 6.6:1  | 8.1:1  |
| `subtle` on `sunken`    | 4.9:1  | 5.9:1  |
| `accent` on `bg`        | 5.6:1  | 7.3:1  |
| `herb` on `herb-soft`   | 6.6:1  | 7.4:1  |
| `warn-fg` on `warn-bg`  | 8.2:1  | 9.2:1  |
| `danger` on `warn-bg`   | 6.4:1  | 5.6:1  |
| `control` on `sunken`   | 3.5:1  | 3.8:1  |
| Button text on `accent` | 6.2:1  | 7.3:1  |

Dark mode follows the system setting (`prefers-color-scheme`). Color never
carries meaning alone: selected chips also get a check mark, the spice meter
has a word next to the dots, and allergen changes are spelled out.

## Type

- **Fraunces** (display serif, optical-size axis, weight 560) for headings,
  prices and big numbers such as timers. A metric-matched fallback keeps the
  swap from shifting the layout.
- **Manrope** for body text and every control.
- Both are self-hosted (SIL Open Font License), preloaded, and kept offline by
  the service worker. No third-party font requests.

| Class             | Size (390px → 1440px) | Use                                 |
| ----------------- | --------------------- | ----------------------------------- |
| `text-display-xl` | 38 → 76px             | Home and cuisine headlines          |
| `text-display-l`  | 32 → 56px             | Page titles, dish names, cook steps |
| `text-display-m`  | 26 → 40px             | Section titles                      |
| `text-display-s`  | 20 → 26px             | Panel and card-group titles         |
| `text-lede`       | 17 → 20px             | Standfirsts, flavor lines           |
| `eyebrow`         | 12px, caps, tracked   | Cuisine · course, section labels    |
| body              | 16–17px, 1.6 leading  | Reading text; 21–23px in cook steps |

Headings wrap balanced, paragraphs wrap "pretty". Numbers that change or line
up (prices, counts, amounts, timers) use `.nums` (tabular figures). Local dish
names carry their `lang` and `dir="auto"`, so Devanagari, Thai, Kannada and
Urdu render with the right fonts and direction.

## Space and layout

- `gutter`: 16px side padding on phones, 24px from 640px, 40px from 1280px.
  Content stops at 90rem (1440px).
- Desktop pages use a 12-column grid: image 7 columns, text 5 on dish pages;
  text 5, images 7 on cuisine pages and the home hero.
- Card grids: 1 column on phones, 2 from 640px, 3 from 1024px (1280px on the
  menu, which has a filter sidebar), 4 on very wide screens.
- Pinned bars never hide what has focus: the page reserves space for the
  header (`scroll-padding-top`), the menu's pinned search row on phones, and
  cook mode's top bar and step buttons.

## Shape, depth and motion

- Radii: 6, 10, 14, 20, 28px. Photos use 14–28px; buttons and chips are pills.
- Depth is mostly hairlines. `shadow-raised` for popovers and dialogs,
  `shadow-sheet` for bottom sheets.
- Motion is short: 150ms for hover and color, about 240ms for sheets, 500ms
  for the slow zoom on a dish image under the pointer. Easing
  `--ease-out-quint`. With reduced motion, animations and transitions are
  effectively off.

## Components

| Component                   | File                                                                                           | Notes                                                                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Status line                 | `components/ordering/status-line.tsx`                                                          | One 32px line: "Not delivering yet" or "Demo mode: nothing is sent or charged", with the one action                                            |
| Header, search              | `components/layout/site-header.tsx`, `search-dialog.tsx`                                       | Search opens with `/` or ⌘K; arrow keys move through results                                                                                   |
| Dish image                  | `components/food/dish-image.tsx`                                                               | Every image of a dish goes through it: fixed aspect ratio, focal point, and the label on the image                                             |
| Dish card, dish row         | `components/food/dish-card.tsx`                                                                | Image, cuisine · course, name, local name, one flavor line, facts, one action. The story lives on the dish page                                |
| Dish facts                  | `components/food/dish-facts.tsx`                                                               | Time, heat (dots and a word), diet, guided recipe                                                                                              |
| Chip, stepper, sheet        | `components/ui/`                                                                               | Chips are `aria-pressed` toggles with counts. Sheets are bottom sheets on phones, side panels from 768px, and return focus to what opened them |
| Cook it / Get it cooked     | `routes/dish.$id.tsx`, `components/food/cook-panel.tsx`, `components/ordering/order-panel.tsx` | Tabs; the choice is in the URL (`?path=order`)                                                                                                 |
| What's in it                | `components/food/whats-in-it.tsx`                                                              | Ingredients by component, allergens, cooking fat, with the content's review status                                                             |
| Cook mode                   | `routes/dish_.$id.cook.tsx`, `components/cook/timers.tsx`                                      | Get ready (servings, units, allergens, swaps, equipment), one step per screen, timers, read aloud, keep screen on                              |
| Bag, checkout, confirmation | `components/layout/cart-drawer.tsx`, `routes/checkout.tsx`, `routes/order.$id.tsx`             | Details → review → place. Every cost before placing; demo wording throughout                                                                   |
| Install, offline            | `components/pwa/`, `public/sw.js`                                                              | Install only when asked; saved dishes and their recipes work offline                                                                           |

## Content rules

- **Image labels** (`IMAGE_LABELS` in `src/lib/food/images.ts`):
  "Representative photo" for stock photos of a typical version of the dish,
  "AI illustration" for AI-generated images. The label sits on the image and
  starts the alt text. Our own photos have no label. Stock and AI images are
  never used as share images, because a link preview can't show the label.
- **Provenance.** Ingredients, allergens, story, flavor notes and each guided
  recipe carry a `ContentRecord`: status (`draft`, `reviewed`, `verified`),
  source, and who checked it and when (`src/lib/food/content.ts`). Pages say
  "Draft, not yet confirmed by a kitchen" until someone signs a dish off.
- **Demo commerce** always says so: "demo price", "Checkout (demo)", "Place
  demo order", "Nothing is sent or charged". Checkout has no card fields.
- **Voice.** Plain words, sentence case, no exclamation marks. Say what a
  thing does ("Add to shopping list"), not what it is. When something isn't
  possible, say why and what to do instead.

## Accessibility (WCAG 2.2 AA)

- Skip link, landmarks, one `h1` per page, headings in order.
- Focus: 2px accent outline, 2px offset, on everything. Sheets and dialogs
  trap focus and return it on close. Cook mode moves focus to each new step's
  heading and supports ← and → keys.
- Live regions for things that change without a page load: the menu's result
  count, the step announcement and finished timers.
- Forms: visible labels, errors next to fields and in a summary at the top that
  takes focus and links to each field.
- Touch targets 40px or more for controls (24px minimum for inline links).
- Checked by `npm run qa` (axe-core WCAG 2.0–2.2 A/AA rules on every page,
  overlay and checkout stage at six widths, light and dark; sideways-scroll
  checks; keyboard focus checks).

## Performance

Targets: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at the 75th percentile of real
visits.

- The first dish image on each page is preloaded with `fetchpriority="high"`
  and a `srcset` from Vercel Image Optimization (AVIF/WebP, resized).
- Every image box has its aspect ratio before the image loads; fonts have
  metric-matched fallbacks. That keeps CLS near zero.
- Filtering and search run in the browser over 50 dishes; no network round
  trip on a tap.
- Lab numbers from `npm run qa` are a smoke test. Real Core Web Vitals need
  field data (for example Vercel Speed Insights).
