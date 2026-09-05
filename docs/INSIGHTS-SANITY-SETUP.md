# NeuroLinks Insights — Sanity setup

This document is for the Sanity account owner. The app can build and deploy without these values. Public Insights stays hidden until a reviewed article is published and `NEXT_PUBLIC_INSIGHTS_ENABLED` is set.

Do not commit tokens. Do not put `SANITY_API_READ_TOKEN` or `SANITY_REVALIDATE_SECRET` in `NEXT_PUBLIC_` variables.

## 1. Create the Sanity project

1. Sign in at [sanity.io/manage](https://www.sanity.io/manage).
2. Create a project named **NeuroLinks Insights**.
3. Create a dataset named `production`.
4. Copy the project ID.

## 2. Environment variables

Add these to local `.env.local` and to Vercel (Preview and Production as appropriate):

```text
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-01-01
SANITY_API_READ_TOKEN=
SANITY_REVALIDATE_SECRET=
NEXT_PUBLIC_INSIGHTS_ENABLED=
```

`NEXT_PUBLIC_INSIGHTS_ENABLED` must remain unset until at least one complete article has been medically reviewed and published.

Placeholders live in `.env.example`. Never paste real tokens into git.

## 3. API token

1. In the Sanity project: **API → Tokens**.
2. Create a token with **Viewer** access. This is `SANITY_API_READ_TOKEN`.
3. It is server-only. Draft Mode shares it with the browser only after an authenticated Studio preview handshake.

Do not create a write token for the Next.js app.

## 4. CORS

Add these origins with **Allow credentials** enabled:

- `http://localhost:3000`
- The Vercel preview origin(s)
- `https://neurolinks.ca`

In the CLI, after linking the project:

```bash
npx sanity cors add http://localhost:3000 --credentials
npx sanity cors add https://neurolinks.ca --credentials
```

## 5. Studio

The Studio is embedded at `/studio/`. It is not in the public menu or footer. It requires Sanity login. It is `noindex, nofollow` and excluded from the sitemap.

If environment variables are missing, `/studio/` shows a setup message instead of the editor.

## 6. Import editorial drafts

The repository includes draft shells only (not published articles):

```bash
npx sanity dataset import sanity/seed/insights.ndjson production --missing
```

Confirm in Studio that the three articles remain **drafts**. Do not publish them until medical content and references are reviewed.

## 7. Preview and publishing

- Create and edit articles in Studio. Sanity drafts are the status system.
- Use **Presentation** to preview the frontend. That route enables Next.js Draft Mode at `/api/draft-mode/enable`.
- Publish from Studio when medical review is complete. Unpublish to remove the public document while keeping the draft.
- Revision history, image upload, slug generation, featured flags and sort order are built into the article schema.

## 8. Webhook revalidation

Create a Sanity webhook (dataset `production`, trigger on create/update/delete):

- URL: `https://neurolinks.ca/api/revalidate/`
- Secret: the same value as `SANITY_REVALIDATE_SECRET`
- Filter: `_type in ["article", "category", "person", "citationSource", "insightsSettings"]`

The route uses signature verification and `revalidateTag('insights', 'max')`.

## 9. Enable the public section

Only after at least one complete, medically reviewed article is **published**:

1. Confirm the article has a published date, alt text, summary, author, and references as required.
2. Set `NEXT_PUBLIC_INSIGHTS_ENABLED=true` on Production (and Preview if you want to QA the public listing).
3. Confirm `/insights/` returns 200, the footer Quick links include Insights, and the sitemap lists the index plus indexable published articles.
4. Keep `/studio/` out of the sitemap.

To hide the section again, unset the flag. Studio and draft preview continue to work.

## 10. Production build without Sanity

`next build` must succeed when these variables are absent. Public Insights URLs 404. Studio shows the unconfigured message. Queries return empty arrays instead of throwing.
