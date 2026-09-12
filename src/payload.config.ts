import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig, type PayloadRequest } from "payload";
import { CMS_ADMIN_PATH, CMS_API_PATH, cmsTrustedOrigins, siteOrigin } from "./lib/site";
import { AISourceDocuments } from "./payload/collections/AISourceDocuments";
import { Authors } from "./payload/collections/Authors";
import { Categories } from "./payload/collections/Categories";
import { Insights } from "./payload/collections/Insights";
import { Media } from "./payload/collections/Media";
import { References } from "./payload/collections/References";
import { InsightsSettings } from "./payload/globals/InsightsSettings";
import { Users } from "./payload/collections/Users";
import { insightsBodyEditor } from "./payload/lexical";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

export default buildConfig({
  // Where this deployment answers requests, from NEXT_PUBLIC_SITE_URL. Staging
  // is https://neurolinks-nextjs.vercel.app; it becomes https://neurolinks.ca
  // at cutover by changing that one variable. This is not the canonical SEO
  // origin, which stays on neurolinks.ca in every environment.
  serverURL: siteOrigin(),
  // `/admin/` is the editorial interface. The REST surface is moved off `/api`
  // so it cannot shadow the existing NeuroLinks form handlers.
  routes: {
    admin: CMS_ADMIN_PATH.replace(/\/$/, ""),
    api: CMS_API_PATH,
  },
  // The admin and the REST surface are served from this same origin, so no
  // cross-origin browser access is needed. Kept empty on purpose: adding an
  // origin here is what would start returning Access-Control-Allow-Origin.
  cors: [],
  // Payload drops the session cookie when a request presents an Origin outside
  // this list. Cookies are already SameSite=Lax, so this is a second line of
  // defence rather than the only one.
  csrf: cmsTrustedOrigins(),
  admin: {
    user: Users.slug,
    // Keep editorial scheduling aligned with the clinic's local Pacific time.
    timezones: {
      defaultTimezone: "America/Vancouver",
    },
    meta: {
      titleSuffix: " — NeuroLinks Insights",
      robots: "noindex, nofollow",
    },
    components: {
      beforeNavLinks: ["@/payload/components/AdminIntro#AdminIntro"],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Insights, Media, AISourceDocuments, Categories, Authors, References, Users],
  globals: [InsightsSettings],
  editor: insightsBodyEditor,
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
    // The checked-in migrations are the only source of schema truth, in
    // development as well as production, so local and Vercel cannot drift.
    push: false,
    migrationDir: path.resolve(dirname, "payload/migrations"),
  }),
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true;
        const secret = process.env.CRON_SECRET?.trim();
        if (!secret) return false;
        return req.headers.get("authorization") === `Bearer ${secret}`;
      },
    },
  },
  // Nothing in NeuroLinks consumes GraphQL, and disabling it keeps the public
  // API surface as small as possible.
  graphQL: {
    disable: true,
  },
  upload: {
    limits: {
      fileSize: 8 * 1024 * 1024,
    },
  },
  plugins: [
    vercelBlobStorage({
      // Without a token (local development) Payload keeps using the local
      // upload directory, so the admin still works offline.
      enabled: Boolean(blobToken),
      collections: {
        [Media.slug]: true,
        // Keep temporary AI source objects on the default Blob namespace while
        // debugging the upload adapter. Older Payload/Vercel Blob combinations
        // have had prefix-related upload failures, and the prefix is not part of
        // the source-document lifecycle or security model.
        [AISourceDocuments.slug]: true,
      },
      // The connected Blob store is currently public. Payload still enforces
      // collection read access on its proxy URLs, and random suffixes make the
      // backing object names non-guessable. Do not treat this as private
      // storage or upload PHI; private editorial sources require a private
      // Vercel Blob store.
      addRandomSuffix: true,
      token: blobToken ?? "",
    }),
  ],
});
