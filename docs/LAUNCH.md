# Production launch — SEO, domains, and indexing

WordPress at `https://neurolinks.ca` remains the live site until DNS cutover. This app must not receive `neurolinks.ca` traffic until the owner approves cutover.

Canonical URLs, Open Graph URLs, MedicalClinic JSON-LD, and the sitemap always use `https://neurolinks.ca`. They are never taken from the request `Host` header or `VERCEL_URL`.

## Two URLs, two jobs

| | Value | Job |
| --- | --- | --- |
| `PRODUCTION_ORIGIN` (`src/lib/site.ts`) | `https://neurolinks.ca`, hard-coded | Canonicals, Open Graph, JSON-LD, sitemap. Identical in every environment so staging never advertises itself as the public site. |
| `NEXT_PUBLIC_SITE_URL` → `siteOrigin()` | staging: `https://neurolinks-nextjs.vercel.app` | Where this deployment answers requests: Payload `serverURL`, the CMS session-cookie allowlist, form CORS. Changes per environment. |

The staging deployment therefore serves the public site with canonicals pointing at `neurolinks.ca` while being fully noindex. That is intentional: it keeps the production SEO architecture verifiable before cutover without competing for the same URLs.

## Indexing strategy

Indexing requires **both** `ALLOW_SEARCH_INDEXING=true` **and** `NEXT_PUBLIC_SITE_URL` naming the production domain (`isSearchIndexable()` in `src/lib/site.ts`). The second gate means copying the flag into the staging project cannot expose it.

| Environment | `NEXT_PUBLIC_SITE_URL` | `ALLOW_SEARCH_INDEXING` | Host | HTML robots | `X-Robots-Tag` | robots.txt | sitemap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Preview / Development | any | unset | any | noindex, nofollow | noindex, nofollow, noarchive | `Disallow: /` | empty |
| Staging (`neurolinks-nextjs.vercel.app`) | staging URL | either | any | noindex, nofollow | noindex, nofollow, noarchive | `Disallow: /` | empty |
| Vercel production alias (`*.vercel.app`) | `https://neurolinks.ca` | `true` | not neurolinks.ca | index,follow (build-time) | **noindex, nofollow, noarchive** (proxy, host-based) | `Disallow: /` | production URLs |
| Public production | `https://neurolinks.ca` | `true` | `neurolinks.ca` | index,follow except ads | absent on public pages | `Allow: /` + sitemap | seven English pages, plus published indexable Insights |
| CMS `/admin/` and `/payload-api/` | any | any | any | noindex, nofollow | noindex, nofollow, noarchive | `Disallow:` both | excluded |
| Advertising landing `/neurolinks-psychiatry-nanaimo-bc/` | `https://neurolinks.ca` | `true` | `neurolinks.ca` | noindex, follow | noindex, follow | not blocked | excluded |

`VERCEL_ENV=production` is not used as the indexing switch. The Vercel production alias can serve the production deployment before the custom domain is live.

### Required Vercel environment variables

**All environments**

- `NEXT_PUBLIC_SITE_URL` — the deployment's own URL. Staging: `https://neurolinks-nextjs.vercel.app`. Payload's `serverURL`, the CMS session-cookie allowlist and preview links all follow it, so it is required, not optional. Leave it off Preview to fall back to that deployment's own `VERCEL_URL`.

**Staging and Preview**

- Do **not** set `ALLOW_SEARCH_INDEXING`

**All environments (Insights CMS)**

- `DATABASE_URL` — PostgreSQL connection string for Payload. Use a managed database; the build runs `payload migrate` before `next build`.
- `PAYLOAD_SECRET` — signs CMS sessions and preview links. Generate with `openssl rand -hex 32`. Use a different value per environment.
- `BLOB_READ_WRITE_TOKEN` — created automatically when a Vercel Blob store is connected. Without it, uploads fall back to the local filesystem, which is ephemeral on Vercel.

**Production (set only at DNS cutover)**

- `NEXT_PUBLIC_SITE_URL=https://neurolinks.ca` — change it from the staging URL. Indexing stays off until this is the production domain.
- `ALLOW_SEARCH_INDEXING=true`
- `NEXT_PUBLIC_INSIGHTS_ENABLED=true` once at least one medically reviewed article is published. The `/admin/` CMS works regardless of this flag; the flag only opens the public `/insights/` routes and their sitemap entries.
- Optional: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` if Search Console uses an HTML tag (do not invent a token)
- `NEXT_PUBLIC_TMS_VIDEO_URL` and `NEXT_PUBLIC_KETAMINE_VIDEO_URL` — Vercel Blob (or other CDN) URLs for the two treatment videos **before WordPress is retired**

### Required Vercel domain settings (at cutover, not before)

- Add `neurolinks.ca` as the production domain (apex).
- Add `www.neurolinks.ca` and redirect it to the apex. The app 301s `www` → `https://neurolinks.ca` with trailing slashes on HTML routes and keeps query strings in one hop. Do not add a Vercel `/:path*` redirect that strips the trailing slash.
- HTTPS is terminated by Vercel; do not point DNS here until cutover.
- Do **not** redirect `*.vercel.app` preview or production aliases to `neurolinks.ca` before launch.
- Keep Deployment Protection on Preview. Production must be publicly crawlable after launch (no Vercel Authentication wall for Googlebot).
- Confirm there is no project-level “Disable indexing” / extra `X-Robots-Tag` on Production once `ALLOW_SEARCH_INDEXING=true`. Preview-only platform noindex is expected.

The current preview header `x-robots-tag: noindex, nofollow, noarchive` matches the application `next.config.ts` / proxy value, not a distinct Vercel-only token. After the launch flag is set, re-check Production HTML and HTTP on both `neurolinks.ca` and `neurolinks-nextjs.vercel.app`.

## Redirects (repository-controlled)

Implemented in `src/lib/redirects.ts`, `next.config.ts`, and `src/proxy.ts`.

- Trailing slashes on HTML routes (308), query string preserved.
- Legacy English slugs already in the rebuild.
- French/Chinese pages → the matching English page (or 404 if there is no equivalent).
- `/wp-content/uploads/2024/04/physician_referral_form-2.pdf` → `/documents/physician-referral-form.pdf`
- Treatment MP4 paths → `/media/videos/...` (files must be hosted independently before WordPress retirement)

`/shop-2/` and `/2022/03/28/hello-world/` are not redirected.

## Search Console and analytics

Live WordPress homepage HTML (checked 2026-09-02) contained:

- No `google-site-verification` meta tag
- No Google Analytics / GTM / `gtag` / `G-` / `UA-` / `GTM-` snippets
- No Facebook pixel

Search Console may already be verified by **DNS TXT**. Preserve that DNS record at cutover. If verification is HTML-tag based, set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to the existing token — do not create a new property casually.

No analytics ID was present to migrate. Post-launch analytics is pending an owner decision; do not invent a measurement ID.

## Videos

The TMS (~225 MB) and ketamine (~196 MB) MP4s are too large for Git. Local/public copies can live at:

- `/media/videos/tms-introduction.mp4`
- `/media/videos/ketamine-introduction.mp4`

Until those files or Blob URLs exist, the app falls back to the current WordPress URLs. That fallback stops working when `neurolinks.ca` is this app and WordPress is gone.

## Production-launch checklist

1. Point `neurolinks.ca` (and www → apex) at this Vercel project. Do not blanket-redirect preview.
2. Set Production `ALLOW_SEARCH_INDEXING=true`. Keep it unset on Preview.
3. Confirm production HTML `robots` is index,follow on the seven main pages and **noindex, follow** on `/neurolinks-psychiatry-nanaimo-bc/`.
4. Confirm HTTP `X-Robots-Tag` is absent (or not noindex) on those seven pages, and `noindex, follow` on the ads landing page.
5. Confirm `https://neurolinks-nextjs.vercel.app` still sends noindex (host-based) and `Disallow: /`.
6. Check canonicals, Open Graph URLs, JSON-LD, and `https://neurolinks.ca/sitemap.xml`.
7. Confirm HTTPS, www → apex, and trailing-slash redirects have no loops; UTM/`gclid` survive.
8. Preserve Search Console verification (DNS TXT and/or HTML tag).
9. Submit `https://neurolinks.ca/sitemap.xml` in Search Console and inspect representative URLs. **Pending until cutover.**
10. Check analytics continuity if an ID is added later; inspect crawl errors after launch. **Pending.**
11. Host the two treatment videos on Blob/CDN and set the `NEXT_PUBLIC_*_VIDEO_URL` variables before retiring WordPress.
