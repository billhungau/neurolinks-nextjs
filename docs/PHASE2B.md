# Phase 2B — visual, responsive, and accessibility QA

WordPress remained read-only. No deploy, DNS, production forms, or CMS writes.

## 1. Landing hero asset identified and localized

Live page: WordPress ID **5932**, route `/neurolinks-psychiatry-nanaimo-bc/`.

| Field | Value |
| --- | --- |
| Implementation | Elementor **image widget** (`wp-image-5946`), not a CSS background |
| Media library ID | **5946** |
| Original URL | `https://neurolinks.ca/wp-content/uploads/2026/01/hero-treatment-modalities-CnTkU5m8.webp` |
| Dimensions | 1920 × 960 |
| File size | 81,090 bytes |
| REST `alt_text` | empty |
| HTML `alt` | `hero treatment modalities CnTkU5m8` |
| Overlay | Photo overlay is **not** a page-background gradient. Treatment chips sit on the image. Hero copy sits on cream (`#F1EEEA` family) in a **two-column** layout (copy left, photo right). |
| Desktop crop | Image fills the right column; `object-fit: cover`, center |
| Mobile crop | Stacked: copy then photo; `object-position: center 18%` to keep the TMS coil in frame |

Localized file: `public/media/images/hero-treatment-modalities-CnTkU5m8.webp`  
Next.js markup uses `MEDIA.landingHero` with `priority`. The live WordPress URL is **not** referenced in the landing page.

Meaningful Next.js `alt` (REST was empty): “Clinician preparing TMS treatment equipment in a NeuroLinks clinic room”.

## 2. Hero implementation and responsive crop

- Two-column grid from `md` up; stacked on small screens.
- Headline remains one semantic **h1** (live WP splits the same sentence across two **h2**s — improved for a11y).
- Primary CTA goes to `/contact/` (decision). Secondary in-page link `#treatment`.
- Yellow accent on the primary landing CTA; navy text on cream for contrast.
- Overlay chips: TMS → `#treatment`, Ketamine → ketamine route.

Image optimization is **enabled**. See §12 for the trailing-slash 308 root cause and fix.

## 3. Other missing hero assets found or restored

Confirmed from Elementor CSS (`post-{id}.css`), then downloaded:

| Route | WP ID | Asset | Position (live CSS) | Local file |
| --- | --- | --- | --- | --- |
| `/` | 1318 | Media **5546** JPEG `Orange-And-Blue-Modern-Professional-Construction-Banner-Design-2.jpg` (1920×960). Full original GET was intercepted as WebP 5946; **1536×768 derivative** (116,907 bytes, JPEG magic `FF D8`) was stored instead. Overlay on WP is white at **opacity 0**; Next uses **navy 55%** so type meets contrast. REST alt on 5546 used. | `center left` / cover / min-height 605px | `home-hero-banner.jpg` |
| About TMS | 1827 | `splashing-splash-aqua-165192.jpg` | `bottom left` | `tms-banner.jpg` |
| Ketamine | 4760 | `blossoms-white-flowers-blossom-8647234-1024x682.jpg` | `center left` | `ketamine-banner.jpg` |
| Services | 1320 | Brickyard office photo; overlay black **0.1** | `bottom center` | `services-banner.jpg` |
| About Us | 2197 | `beach-birds-sea-1852945.jpg` | `1px -230px` | `about-banner.jpg` |
| Contact | 1457 | sakura stock | `0px -414px` | `contact-banner.jpg` |
| Referral | 1428 | mountain stock | `0px -487px` | `referral-banner.jpg` |

Nature banners use empty `alt` (decorative page chrome). Services uses a clinic-building alt.

## 4. Visual changes

- Sticky headers; navy footer with yellow phone link.
- Landing uses compact header (not Astra main menu).
- Cards/FAQ: borders, serif headings, yellow CTAs on conversion paths.
- Homepage TMS/ketamine teasers remain **h2**.
- No session prices; Google excerpts remain static lists (not the WP carousel).
- “singing” in Julie’s biography unchanged.

## 5. Responsive checks

Target widths **375 / 430 / 768 / 1024 / 1440**. Automated HTTP 200 on all eight routes. Browser: landing at wide desktop (hero photo + two-column confirmed vs live WP same photograph) and a phone-width pass (hamburger “Open menu”, stacked CTAs). Device-metrics override did not always persist across navigations; owners should still spot-check 430 / 768 / 1024 in DevTools.

At each width, CSS uses `overflow-x-hidden` on `body`, wrapping buttons (`flex-wrap`), `scroll-padding-top` + `scroll-mt-24` for sticky header vs anchors.

## 6. Accessibility corrections

- Skip to `#main-content`
- One h1 per rebuilt page; landing video titles demoted to **h3**
- Pillar labels on landing are paragraphs, not extra h3s
- `:focus-visible` outline; menu `aria-expanded` / `aria-controls` / `aria-label`
- FAQ `aria-expanded` + `aria-controls` (native `<button>`)
- Forms: native `required`, preview banners, no ARIA extras
- `prefers-reduced-motion` in `globals.css`
- Footer / social link names remain “Facebook” / “Instagram”

## 7. Functional test results

| Check | Result |
| --- | --- |
| Eight routes | 200 |
| `/robots.txt`, `/sitemap.xml` | 200 |
| Unknown path | 404 (`not-found.tsx`) |
| `/about-ketamine/` | 308 → ketamine route |
| `/neurolinks-psychiatry/` | 308 → landing |
| Referral PDF | 200 |
| Contact POST `{preview:true}` | 200, `ok: false`, preview copy |
| FAQ markup | collapsed buttons present |
| Videos | still WP-hosted; `preload="none"` + posters |
| Maps | `loading="lazy"` |
| YouTube | click-to-load, `youtube-nocookie` |

Preview adapters never log payloads. API routes **ignore the body**.

## 8. Performance

- Hero `priority`; below-fold maps/YouTube lazy or click-to-play
- Video `preload="none"`
- Fonts: existing `next/font` (Playfair + Source Sans 3)
- `next/image` optimizer restored (`formats`: avif, webp)
- Accurate `sizes` on responsive images (`src/lib/image-sizes.ts`)
- Landing hero uses `priority` + reserved `aspect-[1920/960]` / `min-h` to limit CLS
- Below-fold photos omit `priority` (default lazy)
- YouTube posters stay as click-to-load `<img>` (not next/image) until play
- Unused scaffold SVGs in `/public` are not passed through `next/image` (`dangerouslyAllowSVG` remains off)

## 9. Remaining WordPress dependencies

- TMS and ketamine **MP4s** (~225 MB / ~196 MB) — cutover: host on CDN or object storage; **do not commit to Git**
- Live site still WordPress until DNS cutover
- Landing **lead form** still only on WP; Next CTAs use `/contact/`
- Preview deployments: `noindex, nofollow, noarchive` until `ALLOW_SEARCH_INDEXING=true` (see `docs/PREVIEW.md`)

## 10. Remaining launch blockers

- Production form backend (Formidable or replacement) + CAPTCHA
- Video hosting independent of `neurolinks.ca`
- Rank Math / SEO plugin still inactive on WP; Next metadata is local
- Owner approval for DNS and go-live

## 11. Items requiring owner review

1. Home banner is a “construction” filename used live; Next adds a navy overlay WP does not (contrast).
2. Landing WP headline is two h2s; Next is one h1.
3. Landing WP form vs `/contact/` only.
4. Google reviews: static grid vs WP carousel.
5. Footer year line still “© NeuroLinks 2022 –” vs WP “© 2026”.
6. Whether to restore Elementor-style treatment bullet lists on the landing treatment cards.

## Visual comparison (landing hero)

**Before (Phase 2A):** navy full-bleed text block, no photograph.  
**After:** same WebP as WP 5946 on the right; cream copy column; yellow contact CTA.

**Live WP differences kept on purpose:** Elementor chrome, cookie UI, lead form, review carousel, dual h2 headline, “Check If You're a Candidate” in-page form.

## 12. Image optimizer 308 — root cause and resolution

**Cause:** Not a custom `redirects()` entry and not middleware (none existed). With `trailingSlash: true`, Next.js injects an **internal** redirect in `node_modules/next/dist/lib/load-custom-routes.js`:

```
source: '/:notfile((?!\\.well-known(?:/.*)?)(?:[^/]+/)*[^/\\.]+)'
destination: '/:notfile/'
permanent: true
```

That pattern is “path with no file extension.” `/_next/image` matches (`_next/` + `image`), so the optimizer received **308** to `/_next/image/`. Files with extensions and `.well-known` are excluded; `/_next/image` is not.

**Resolution:**

1. `skipTrailingSlashRedirect: true` and `skipProxyUrlNormalize: true` so Next does not rewrite `/_next/image` or strip slashes we add.
2. `src/proxy.ts` (Next 16; formerly middleware) — 308 trailing slashes **only** on public page routes. Matcher and handlers skip `/_next/*`, `/api/*`, and paths with a file extension.
3. Keep `trailingSlash: true` so `next/link` and static pages still use slashed public URLs. Markup uses `/_next/image/?url=…`; that URL returns **200**, as does `/_next/image?url=…`.
4. Remove `images.unoptimized`.

Legacy Rank Math page redirects remain in `next.config.ts` and do not match `/_next/image`.
