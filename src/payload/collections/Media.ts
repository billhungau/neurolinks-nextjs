import path from "node:path";
import type { CollectionConfig } from "payload";
import { PATIENT_INFORMATION_WARNING } from "../../lib/insights";
import { anyone, authenticated } from "../access";
import { revalidateSupportingContent } from "../hooks/revalidateInsights";

/**
 * Uploads for Insights. Stored on Vercel Blob in production so the images
 * survive redeploys; width, height and mime type are captured by Payload so
 * `next/image` can render them without layout shift.
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "Image",
    plural: "Media",
  },
  admin: {
    useAsTitle: "alt",
    defaultColumns: ["filename", "alt", "updatedAt"],
    description: PATIENT_INFORMATION_WARNING,
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    readVersions: authenticated,
  },
  hooks: {
    afterChange: [revalidateSupportingContent],
  },
  upload: {
    // Vercel Blob serves the original in production; Next.js resizes on
    // request, so Payload stores a single file per image.
    staticDir: path.resolve(process.cwd(), "public/cms-media"),
    mimeTypes: ["image/*"],
    focalPoint: false,
    crop: false,
  },
  fields: [
    {
      name: "alt",
      label: "Alternative text",
      type: "text",
      required: true,
      minLength: 8,
      admin: {
        description:
          "Describe the image for screen readers and for readers whose images fail to load. Never describe an identifiable patient.",
      },
    },
    {
      name: "caption",
      type: "text",
      admin: {
        description: "Optional. Shown under the image on the public page.",
      },
    },
    {
      name: "credit",
      label: "Photo credit",
      type: "text",
      admin: {
        description: "Optional attribution, shown with the caption.",
      },
    },
  ],
};
