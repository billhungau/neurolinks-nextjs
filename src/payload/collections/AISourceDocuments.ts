import path from "node:path";
import type { CollectionConfig } from "payload";
import { authenticated } from "../access";

/**
 * Temporary source documents used by the Insights AI Article Assistant.
 *
 * Documents are grouped by an opaque session ID stored on the Insight draft.
 * They are deleted automatically after the Insight is published (and when the
 * Insight itself is deleted). This collection is intentionally hidden from the
 * admin navigation; files are managed only through the AI Article Assistant.
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
  ],
};
