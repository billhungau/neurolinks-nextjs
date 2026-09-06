This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## NeuroLinks Insights CMS

The Insights section is managed by [Payload](https://payloadcms.com) inside this same Next.js app. The editorial interface is at `/admin/`; everything else on the site is ordinary Next.js pages and is unaffected by the CMS.

The deployed CMS currently lives on the staging deployment, `https://neurolinks-nextjs.vercel.app`. `NEXT_PUBLIC_SITE_URL` is the one variable that says where a deployment answers requests, and Payload's `serverURL`, the CMS session-cookie allowlist and preview links all derive from it. Canonical URLs, Open Graph URLs, JSON-LD and the sitemap are separate and always use `https://neurolinks.ca`; see `docs/PREVIEW.md` and `docs/LAUNCH.md`.

### Local setup

1. Copy `.env.example` to `.env` and fill in `DATABASE_URL` and `PAYLOAD_SECRET`. Leave `NEXT_PUBLIC_SITE_URL` unset locally so it falls back to `http://localhost:3000`. `BLOB_READ_WRITE_TOKEN` is optional locally — without it, uploads are written to `public/cms-media/`, which is gitignored.
2. Create the database, then apply the migrations:

```bash
createdb neurolinks
npm run migrate
```

3. Start the app and open [http://localhost:3000/admin](http://localhost:3000/admin). The first visit asks you to create the first CMS user; there is no seeded account and no default password.
4. Set `NEXT_PUBLIC_INSIGHTS_ENABLED=true` to open the public `/insights/` routes. The admin works either way.

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run migrate` | Apply pending Payload migrations. Also runs before `next build` via `vercel-build`. |
| `npm run migrate:create` | Generate a migration after changing a collection, global or field. |
| `npm run migrate:status` | Show which migrations have run. |
| `npm run generate:types` | Regenerate `src/payload-types.ts` from the config. |
| `npm run generate:importmap` | Regenerate the admin import map after adding a custom admin component. |

The schema is owned by the migrations in `src/payload/migrations/`, not by dev push, so a collection change needs `npm run migrate:create` committed alongside it.

### Writing an article

`Admin → Insights → Create new → write → Preview → Publish`. The slug derives from the title, drafts autosave, and **Preview** opens the draft on the real article layout behind a signed link that also requires a CMS session. Publishing revalidates the public routes and the sitemap, so no redeploy is needed. Editorial standards are in `docs/INSIGHTS-EDITORIAL-GUIDANCE.md`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
