# Vercel staging and preview (non-production)

WordPress at `https://neurolinks.ca` remains the live site. This app must not receive `neurolinks.ca` DNS until the owner approves cutover.

The stable staging deployment is `https://neurolinks-nextjs.vercel.app`. It is the current home of the Payload admin (`/admin/`) and the public Insights section, and it is configured with `NEXT_PUBLIC_SITE_URL=https://neurolinks-nextjs.vercel.app`.

Canonicals, Open Graph, JSON-LD and the sitemap always use `https://neurolinks.ca`, even on staging. Indexing is closed there (see below), so staging never competes with the production URLs it points at. Do not set `ALLOW_SEARCH_INDEXING=true` on Staging or Preview.

After DNS cutover, follow `docs/LAUNCH.md`.

## Indexing

Indexing needs `ALLOW_SEARCH_INDEXING=true`, `NEXT_PUBLIC_SITE_URL` naming `neurolinks.ca`, **and** a request host of `neurolinks.ca` or `www.neurolinks.ca`. Until all three hold:

- HTML `robots`: noindex, nofollow, noarchive
- `X-Robots-Tag: noindex, nofollow, noarchive`
- `robots.txt` disallows `/`
- sitemap is empty (populated only when the launch config is in place at build time)

`VERCEL_ENV=production` is not treated as “the custom domain is live”, and neither is the launch flag on its own.

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
| Env Production | `NEXT_PUBLIC_SITE_URL=https://neurolinks-nextjs.vercel.app` while staging; leave `ALLOW_SEARCH_INDEXING` unset until cutover |
| Env Preview | leave `NEXT_PUBLIC_SITE_URL` unset so each deployment uses its own `VERCEL_URL`; do not set `ALLOW_SEARCH_INDEXING` |

No SMTP, Formidable, or WordPress credentials are required for preview.
