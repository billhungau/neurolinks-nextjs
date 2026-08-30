# Phase 2C — homepage refinement (local review)

Visual direction is unchanged. This pass tightens copy, navigation, hero, location, reviews, and footer. **Not deployed.**

Local production server used for QA: `http://127.0.0.1:3010/` (after `npm run build` + `npm run start -- -p 3010`). Dev may still occupy port 3000.

## 1. Development language removed

Removed from public homepage:

- Phase 1 / live WordPress widget / not a live API
- “From existing clinical information”
- “These points summarize wording already used on this site”
- “according to the clinic’s existing description”

Landing page (`/neurolinks-psychiatry-nanaimo-bc/`): replaced Formidable/rebuild commentary with a short preview-forms notice.

**Kept** (required): contact, referral, and adapter messages that forms are not connected and submissions are not stored or logged.

## 2. Homepage copy shortened

Same sections, shorter introductions. Full clinical detail remains on About TMS, About Ketamine, and Services. Suitability, MSP assessment coverage, VAC/WCB coverage, and “outcomes vary / do not change medication without guidance” remain.

TMS card no longer repeats the comparative “more effective / minimal side effects” sentence (that claim is still in Benefits 02 unchanged). Ketamine mechanism-of-action sentence moved off the homepage (still on the ketamine page).

## 3. Header and navigation

- Slightly shorter header (`py-2`, smaller logo).
- Desktop: About TMS, About Ketamine, Services, About Us, Location (`/#location`), Physician Referral (muted blue), yellow **Contact** only (no duplicate Contact text).
- Mobile: `<details>` menu (works without JavaScript) includes Home, all desktop items, Contact, and Physician Referral.

## 4. Hero refinements

- Height tied to `100svh` minus header, capped.
- Headline `max-w-[16ch]`; content vertically centred on small screens, lower on large screens.
- Crop: `object-[58%_30%]` mobile, `object-[72%_32%]` desktop so the coil stays visible beside the navy overlay.
- No carousel, autoplay, or extra hero messages.

## 5. Services and benefits

Services: equal-height cream cards, one short paragraph, title + Learn more → existing `#assessment` / `#tms` / `#ketamine` anchors.

Benefits: patient-facing eyebrow/intro; six numbered claims **not** rewritten.

Pathway: four columns on large screens; note that inquiry does not guarantee treatment.

## 6. Reviews

Intro: “Selected reviews from patients who shared their experiences on Google.”

**View all Google reviews** uses the existing project listing URL `https://maps.app.goo.gl/3JkQg4FfxhYx9Aaf6` (same as `SITE.mapsUrl`). No separate Google reviews URL was found in the WordPress extract. Three excerpts unchanged (including original “a integral”).

## 7. Location / map

Split layout: details + `tel:` + Get directions (`SITE.mapsUrl`, new tab) | embed iframe (`z=15`, lazy, fills a bounded box).

Embed HTTP 200 from `maps.google.com/...&output=embed`. Browser screenshot showed the Nanaimo pin and “6010 Brickyard Rd” card. Left column aligned to the top to reduce empty space beside the map.

## 8. Footer

Copyright `© NeuroLinks 2022–{current year}`. Address, phone, Contact, Physician Referral, Facebook, Instagram unchanged. No empty fourth column.

## 9. Responsive checks

Viewports exercised: 375 (screenshot), 1440 (hero + location/map). Intermediate widths use `clamp()`, single-column stacking, and wrap on nav from `lg` up. No horizontal overflow observed on 375/1440.

## 10. Accessibility

Skip link present; heading order h1 → h2 → h3; visible `:focus-visible`; Location `scroll-mt-24`; reduced-motion still disables image hover; yellow-on-navy CTAs retained.

## 11. Lint, typecheck, build

`npm run lint`, `npm run typecheck`, `npm run build`: **pass**.

- Homepage 200.
- Clinic photo `/media/images/0N4A2661-768x512.jpg` **200**.
- `POST /api/forms/contact/` **200** `ok: false` (preview adapter).
- Google listing short URL **302** (expected redirect).
- Map embed URL **200**.

## 12. Owner review

1. Clinical claims in `docs/CLINICAL_CLAIMS_REVIEW.md` (do not auto-rewrite).
2. Google reviews link is the maps listing, not a dedicated `/reviews` URL.
3. Homepage TMS card dropped the comparative-efficacy sentence (still in benefits).
4. Approve before Vercel deploy.

## 13. Screenshots

- `review-screenshots/phase2c-home-1440.png`
- `review-screenshots/phase2c-home-375.png`
- `review-screenshots/phase2c-location-1440.png`
