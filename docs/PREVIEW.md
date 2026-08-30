# Vercel preview (non-production)

WordPress at `https://neurolinks.ca` remains the live site. This app must not receive `neurolinks.ca` DNS until the owner approves cutover.

## Canonical URLs (preview strategy)

- Production WordPress URLs are **not** used as canonicals on preview.
- If `NEXT_PUBLIC_SITE_URL` is unset, `siteOrigin()` uses `https://$VERCEL_URL` so Open Graph and JSON-LD self-point at the Vercel preview host.
- Do **not** set `NEXT_PUBLIC_SITE_URL=https://neurolinks.ca` on Preview. That would claim the live domain while WordPress still serves it.
- After DNS cutover, set `NEXT_PUBLIC_SITE_URL=https://neurolinks.ca` and only then consider `ALLOW_SEARCH_INDEXING=true`.

## Indexing

Until `ALLOW_SEARCH_INDEXING=true`:

- HTML `robots`: noindex, nofollow, noarchive
- `X-Robots-Tag: noindex, nofollow, noarchive`
- `robots.txt` disallows `/`
- sitemap is empty

## Forms

Contact and physician referral stay preview-only: no delivery, storage, or payload logging. API routes ignore the request body.

## Temporary WordPress video URLs (not in Git)

| File | URL | Approx. size |
| --- | --- | --- |
| TMS | `https://neurolinks.ca/wp-content/uploads/2025/05/TMS-FINAL-COPYYYY-JULIE-USE.mp4` | ~225 MB |
| Ketamine | `https://neurolinks.ca/wp-content/uploads/2025/05/KETAMINE-VIDEO-JULIE-USE.mp4` | ~196 MB |

Cutover: host these on a CDN or object storage. Do not commit them.

## Proposed GitHub repository

Name: `neurolinks-nextjs`  
Visibility: private recommended (clinic content, unpublished rebuild).

## Proposed Vercel settings

| Setting | Value |
| --- | --- |
| Project name | `neurolinks-nextjs` |
| Framework | Next.js |
| Root directory | `.` |
| Build command | `next build` (default) |
| Output | Next.js (default) |
| Production branch | `main` |
| Preview | Vercel-generated `*.vercel.app` only |
| Domains | **none** — do not add `neurolinks.ca` or `www` |
| Analytics / Speed Insights | off |
| Env Preview | do not set `ALLOW_SEARCH_INDEXING`; do not set `NEXT_PUBLIC_SITE_URL` |
| Env Production | leave empty until cutover |

No SMTP, Formidable, or WordPress credentials are required for preview.
