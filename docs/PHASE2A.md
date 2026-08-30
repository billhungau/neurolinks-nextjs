# Phase 2A — content completeness and asset independence

WordPress remains read-only. No DNS, deploy, or form delivery.

## 1. Content added by route

- `/` — local images; body already matched published English home copy.
- `/about-tms-treatment-on-psychiatric-illness/` — Conditions We Treat, Age group, Coverage, Book an Appointment, 10 FAQs + FAQPage JSON-LD; local posters/images. Hosted TMS MP4 still from WordPress (size).
- `/ketamine-treatment-resistant-depression-nanaimo/` — Conditions We Treat, Book CTA, 10 FAQs + FAQPage JSON-LD; local media. Hosted ketamine MP4 still from WordPress (size).
- `/services-psychiatric-tms-ketamine-treatment/` — remaining ketamine protocol bullets; Fee / insurance coverage section; local images.
- `/psychiatrist-tms-nanaimo/` — local portraits and office photos (bios already complete).
- `/physician-referral/` — local PDF at `/media/pdfs/physician_referral_form-2.pdf`.
- `/contact/` — already complete vs WP fields; development-only form notice.
- `/neurolinks-psychiatry-nanaimo-bc/` — full canvas copy, YouTube embeds (`hIMYP1bC3UE`, `tbAN-E4iXzY`), Google-review quotes, 10-item accessible FAQ accordion, educational disclaimer. Landing header (not main Astra nav).

## 2. Still unavailable or ambiguous

- Live Google Reviews widget (static quotes used).
- Landing lead-capture form (not Formidable contact/referral); pointed to `/contact/` until a backend is chosen.
- Exact dollar **session prices** are not stated on the published TMS/ketamine pages (Fee explains MSP non-coverage and insurers only).
- Home WP uses `h4` for TMS/ketamine teasers; Next uses `h2` for hierarchy.
- Ketamine FAQ title misspelling **adminstered** preserved.
- Julie bio on WP appears cut off at “singin”; Next uses “singing”.
- Decorative contact page icons (phone/fax/email/map PNGs) omitted.
- Services timeline extra images beyond the four clinical photos not all duplicated.
- Rank Math robots on landing meta was empty via WP-CLI; live HTML still `follow, index`.

## 3. Media downloaded (`public/media/`)

Images under `public/media/images/`, posters under `public/media/posters/`, PDF under `public/media/pdfs/`. Mapping in `src/lib/media.ts`.

## 4. Remaining external media

| Asset | Size | Recommendation |
| --- | --- | --- |
| TMS MP4 on WP | 236,243,496 bytes (~225 MB) | Do not git; host on Blob/S3/Vimeo or keep WP until cutover |
| Ketamine MP4 on WP | 205,260,350 bytes (~196 MB) | Same |
| Landing YouTube | n/a | Keep as YouTube (already on WP) |
| Google Maps iframe | n/a | External map dependency |

## 5. Internal-link / redirect audit

**In scope (implemented):** eight approved routes; `/#location`; services `#assessment` `#tms` `#ketamine` `#psychometric`; landing `#treatment` `#faq`; tel; mailto; maps.

**Rank Math redirects already in `next.config.ts`:** `/about-ketamine/`, `/about-ketamine-for-drug-resistant-mental-illness/`, `/ketamine-treatment-depression-nanaimo/`, `/about-psychiatrist-transcranial-magnetic-stimulation/`, `/psychiatrist-tms-treatment-nanaimo/`, `/services-psychiatric-consultation-tms-treatment/`, `/neurolinks-psychiatry/`.

**Required redirect (if traffic exists):** confirm `/neurolinks-psychiatry-nanaimo-bc` without slash (Next `trailingSlash` handles).

**Intentionally out of scope:** `/fr/…`, `/zh/…`, author archives, `/feed/`, WP admin, other Formidable form pages, blog if any.

**External:** PubMed, ScienceDirect, Cambridge, Nature, Facebook, Instagram, Google Maps, YouTube, Medavie/WorkSafe mentions as text.

**Broken/obsolete:** `/about-ketamine/` 404 on live WP until Rank Math is active — Next already 301s.

## 6. Form logging

Adapter no longer logs payloads or keys. Preview responses are **failure** messages stating nothing was sent, stored, or logged. API does not persist bodies.

## 7. Build

See latest `npm run lint`, `typecheck`, `build` output after this phase.

## 8. Visual/functional differences

Astra/Elementor chrome, mega-menu, sticky landing header, review carousel, lead form, decorative icons, exact photo crops.

## 9. Decisions needed

- Video hosting vs remaining WP MP4s
- Landing lead form vs `/contact/`
- Whether to match WP `h4` teasers
- Dollar prices if they exist off-page
- When to enable real form delivery
