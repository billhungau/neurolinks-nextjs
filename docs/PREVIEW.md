# Vercel preview (non-production)

WordPress at `https://neurolinks.ca` remains the live site. This app must not receive `neurolinks.ca` DNS until the owner approves cutover.

Canonicals, Open Graph, JSON-LD and the sitemap always use `https://neurolinks.ca`, even on preview. Indexing is still closed on preview (see below). Do not set `ALLOW_SEARCH_INDEXING=true` on Preview.

After DNS cutover, follow `docs/LAUNCH.md`.

## Indexing

Until `ALLOW_SEARCH_INDEXING=true` **and** the request host is `neurolinks.ca` or `www.neurolinks.ca`:

- HTML `robots`: noindex, nofollow, noarchive
- `X-Robots-Tag: noindex, nofollow, noarchive`
- `robots.txt` disallows `/`
- sitemap is empty (populated only when the launch flag is set at build time)

`VERCEL_ENV=production` is not treated as “the custom domain is live”.

## Forms

Contact and physician referral stay preview-only unless Jotform keys are configured. See `.env.example`.

## Videos

| File | Replacement path | Approx. size |
| --- | --- | --- |
| TMS | `/media/videos/tms-introduction.mp4` | ~225 MB |
| Ketamine | `/media/videos/ketamine-introduction.mp4` | ~196 MB |

Do not commit the MP4s. Host them on Vercel Blob or another CDN and set `NEXT_PUBLIC_TMS_VIDEO_URL` / `NEXT_PUBLIC_KETAMINE_VIDEO_URL` before WordPress is retired. Until then the app may fall back to the live WordPress URLs.

## Proposed Vercel settings

| Setting | Value |
| --- | --- |
| Project name | `neurolinks-nextjs` |
| Framework | Next.js |
| Root directory | `.` |
| Build command | `next build` (default) |
| Output | Next.js (default) |
| Production branch | `main` |
| Preview | Vercel-generated `*.vercel.app` only until cutover |
| Domains | none until cutover — then `neurolinks.ca` apex + `www` redirect to apex |
| Env Preview | do not set `ALLOW_SEARCH_INDEXING` |
| Env Production | leave `ALLOW_SEARCH_INDEXING` unset until cutover |

No SMTP, Formidable, or WordPress credentials are required for preview.
