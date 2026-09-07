import path from "node:path";
import type { CollectionConfig } from "payload";
import { authenticated } from "../access";
import { cleanupExpiredAISourcesAfterUpload } from "../hooks/cleanupAISourceDocuments";

const SOURCE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Temporary source documents used by the Insights AI Article Assistant.
 *
 * Documents are grouped by an opaque session ID stored on the Insight draft.
 * They are deleted automatically after the Insight is published (and when the
 * Insight itself is deleted). A seven-day expiry provides a safety net for
 * sources uploaded to a brand-new article that is abandoned before it is ever
 * saved, because such a draft has no Insight record whose delete hook can run.
 */
export const AISourceDocuments: CollectionConfig = {
  slug: "ai-source-documents",
  labels: { singular: "AI source document", plural: "AI source documents" },
  admin: {
    hidden: true,
    useAsTitle: "filename",
  },
  lockDocuments: false,
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [cleanupExpiredAISourcesAfterUpload],
  },
  upload: {
    staticDir: path.resolve(process.cwd(), "private/ai-source-documents"),
    mimeTypes: [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    focalPoint: false,
    crop: false,
  },
  fields: [
    {
      name: "sessionId",
      type: "text",
      required: true,
      index: true,
      admin: { hidden: true },
    },
    {
      name: "expiresAt",
      type: "date",
      required: true,
      index: true,
      defaultValue: () => new Date(Date.now() + SOURCE_RETENTION_MS).toISOString(),
      admin: { hidden: true },
    },
  ],
};
