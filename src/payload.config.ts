import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";
import { CMS_ADMIN_PATH, CMS_API_PATH } from "./lib/site";
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
  // `/admin/` is the editorial interface. The REST surface is moved off `/api`
  // so it cannot shadow the existing NeuroLinks form handlers.
  routes: {
    admin: CMS_ADMIN_PATH.replace(/\/$/, ""),
    api: CMS_API_PATH,
  },
  admin: {
    user: Users.slug,
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
  collections: [Insights, Media, Categories, Authors, References, Users],
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
      },
      token: blobToken ?? "",
    }),
  ],
});
