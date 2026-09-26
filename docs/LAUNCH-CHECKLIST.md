# Launch checklist

What the site still needs from the business before it can take real orders.
Code can't supply any of it: each item is a real fact or a decision. Until
then the site says plainly that it isn't delivering yet. Demo mode lets people
try the ordering flow; it's clearly labeled, and nothing is sent or charged.

Items marked **Blocks ordering** must be done before the first real order.

## 1. Kitchens and delivery areas (Blocks ordering)

WorldFoodCuisine is delivery-only: each franchise location is a kitchen with no
dining room, and one kitchen serves each ZIP code. For each kitchen:

- [ ] Its name as customers should see it (e.g. "Mission St. kitchen")
- [ ] Kitchen address (used for delivery range and sales tax; not shown unless you want it shown)
- [ ] The exact ZIP codes it delivers to, and a one-line description of the area for the Locations page
- [ ] Opening hours and time zone. The zone model assumes the same hours every
      day; if hours differ by weekday, that's a small code change
- [ ] Delivery fee, any free-delivery minimum, and the usual delivery time range
- [ ] Sales tax rate for the area, and whether the delivery fee is taxed

Where it goes: add a zone to `LIVE_ZONES` in `src/lib/ordering/zones.ts`.
`npm run test:menu` checks each zone is complete: 5-digit ZIPs, valid hours,
time zone and tax rate. Once a zone exists:

- those ZIP codes see real prices, fees, tax and delivery times;
- every other ZIP still gets "not delivering here yet";
- the Locations page lists the kitchen and its area;
- the "Not delivering yet" status line disappears.

Also per kitchen, for the dish page and checkout:

- [ ] Which dishes it makes each day, and how it will tell the site when one
      sells out (today that's `unavailable` on the zone, edited by hand)
- [ ] Any dish it prices differently from the menu (`priceOverrides` on the zone)
- [ ] Options it really offers (the demo offers "milder" for spicy dishes)
- [ ] Tip choices, and whether tips go to couriers in full

## 2. Prices (Blocks ordering)

- [ ] Confirm or change each dish's price in `src/lib/food/dishes.ts` (`price`, in cents).
      Today's prices came with the template and only appear in demo mode.
- [ ] Decide which dishes are on sale at launch. Every dish in a delivery
      area can be ordered right now; if some should stay "coming soon", that's
      a small change (an on-sale flag per dish).

## 3. Ingredients and allergens (Blocks ordering)

Each dish lists its ingredients component by component, its cooking fat (olive
oil, butter or ghee), its allergens and its diet tags. The kitchen needs to
confirm all of it against the real recipes, and every franchise kitchen has
to cook to the same list. Points to check first:

- [ ] **Asafoetida** is listed as "pure dried resin, no flour added". Most store-bought
      asafoetida contains wheat flour, which would make those dishes not gluten-free.
- [ ] **Soy sauce** contains wheat and soy: thukpa, khao pad, pad kra pao and
      khao soi list both. Pad Thai is gluten-free because it uses no soy sauce.
- [ ] **Shrimp paste** in the green, panang and massaman curry pastes, so they
      list shellfish. Tom yum's roasted chili paste (nam prik pao) usually
      contains dried shrimp and fish sauce: the dish lists both allergens, but
      the paste's own ingredients should be listed too.
- [ ] **Parmigiano Reggiano and pecorino** are made with animal rennet. The
      dishes are tagged vegetarian; some vegetarians avoid animal rennet.
- [ ] **Swapped traditional fats**, to keep to olive oil, butter and ghee: tamales
      use butter instead of lard; chicken choila uses ghee instead of mustard oil.
- [ ] **No added cooking fat:** yomari, som tam, mango sticky rice, carbonara
      (the pork renders its own fat), cacio e pepe and tiramisu.
- [ ] **Tamales** list wheat because the mole negro traditionally contains bread.
- [ ] **Chicken choila** is traditionally made with water buffalo; this menu uses chicken, and the story says so.
- [ ] **Cross-contact:** write the statement for a shared kitchen (for example,
      "prepared in a kitchen that also handles wheat, milk, tree nuts…").
      The site can't be honest about allergies without it.
- [ ] Check local rules for allergen and ingredient disclosure on online menus.
- [ ] **Native names:** have a native speaker check each dish's name in its own
      script (Devanagari, Thai, Urdu for Hyderabadi biryani, Spanish, Italian).
- [ ] **Sign content off.** Ingredients, allergens, stories and flavor notes
      are all marked _draft_ on the site ("not yet confirmed by a kitchen"). When the kitchen confirms a dish, record who checked what
      and when in `src/lib/food/content.ts`; the dish page and checkout then
      say so. Stories need their sources cited before they're marked reviewed.

## 4. Photos

See `docs/IMAGE-AUDIT.md`.

- [ ] Photograph your own dishes, starting with the six featured ones and the
      cuisine cover dishes. Add them with `ownPhoto(...)`.
- [ ] **Replace the 42 AI-generated images before you start delivering.**
      REDESIGN.md §6 allows AI images only as labeled stand-ins; once you're
      operating, dish photos must show what customers actually receive. Start
      with sel roti, whose image doesn't look like real sel roti.
- [ ] Until then, record which tool made the AI images and confirm its terms
      allow commercial use.
- [ ] For the 8 stock photos still in use, confirm the license or replace them.
      Nobody knows where they came from.

## 5. Payments and order handling (Blocks ordering)

- [ ] Payment provider (for example Stripe Checkout): account, and API keys
      stored as Vercel environment variables, never in the code
- [ ] Where orders go: kitchen tablet, POS, email or SMS
- [ ] Order confirmation for customers (email or SMS) and a support contact
- [ ] Cancellation and refund policy
- [ ] Privacy policy and terms of sale. Checkout will collect names, phone
      numbers and addresses.

Until this is built, checkout refuses to take orders in a real delivery area
and says online payment isn't connected. It won't pretend to take one. The
demo checkout already shows what a real one needs: delivery window, fees, tax,
tip and total before placing, a review step, guest checkout, and no card
fields. A real checkout must check availability, prices, fees and delivery
windows with the server again at the moment of payment.

## 6. Integrations

What real ordering has to connect to. None of it can be faked on the site.

| Need                               | For example                                     | Replaces in the demo                                    |
| ---------------------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| Kitchen menu and stock (POS)       | Square, Toast or Clover APIs, or a kitchen app  | `unavailable` and prices in `zones.ts` and `dishes.ts`  |
| Payments                           | Stripe Checkout or Payment Element              | "Place demo order" (no card fields today)               |
| Sales tax                          | Stripe Tax or Avalara                           | One `taxRate` per zone                                  |
| Address check and delivery range   | Google Places or Mapbox, plus the kitchen's own radius or ZIP list | ZIP code only              |
| Couriers and live tracking         | DoorDash Drive or Uber Direct, or own drivers   | The "How tracking will look" timeline                   |
| Order messages                     | Email (Postmark, Resend) and SMS (Twilio)       | Nothing is sent                                         |
| Order store and admin              | A database and a small admin, or the POS        | Demo orders kept in the browser                         |
| Order routing to each kitchen      | Each franchise's POS or a kitchen tablet app    | Nothing reaches a kitchen                               |
| Order-status notifications         | Web Push with VAPID keys and a small sender     | Nothing: the confirmation page shows a preview          |
| Real-user performance              | Vercel Speed Insights                           | Lab checks in `npm run qa`                              |

## 7. Delivery apps

- [ ] If you're on Uber Eats, DoorDash or Grubhub, send the store-page links
      for each area. The old site linked to the apps' home pages, which proved
      nothing, so those claims were removed.

## 8. Contact and company details

- [ ] A contact email or phone for allergy questions and order problems
- [ ] Legal business name and address. Needed for terms and receipts, and for
      restaurant structured data in search results. Only verified facts go in
      the structured data, so today it holds just the site's name and URL.

## 9. Domain and hosting

- [ ] **Custom domain:** connect it in Vercel. Then change `SITE_URL` in
      `src/lib/site.ts` and the `Sitemap:` line in `public/robots.txt`, and run
      `npm run sitemap`.
- [ ] **Vercel plan:** Hobby is for non-commercial use only. A business taking
      orders needs Pro; see https://vercel.com/pricing for current prices.
- [x] Production is public; preview deployments stay behind Vercel Authentication.
- [x] Dish photos go through Vercel Image Optimization (resized, AVIF/WebP).
      The plan includes a monthly quota; 8 photos use very little of it.

## 10. After launch

- [ ] Hide the demo-mode switch once real ordering works (or keep it for staff training).
- [ ] Watch Core Web Vitals from real visits (LCP ≤ 2.5s, INP ≤ 200ms,
      CLS ≤ 0.1) and run `npm run qa` before each release.
- [ ] Bring back a kitchens page if you want one, with real addresses and photos.
