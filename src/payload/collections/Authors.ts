import type { CollectionConfig } from "payload";
import { DEFAULT_AUTHOR, PATIENT_INFORMATION_WARNING } from "../../lib/insights";
import { anyone, authenticated } from "../access";
import { revalidateSupportingContent } from "../hooks/revalidateInsights";

/**
 * Clinicians who write or medically review Insights. The same record is used
 * for both roles so a psychiatrist is only entered once.
 */
export const Authors: CollectionConfig = {
  slug: "authors",
  labels: {
    singular: "Author",
    plural: "Authors",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "credentials"],
    description:
      "Authors and medical reviewers. Only record roles and credentials the clinician actually holds.",
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
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      defaultValue: DEFAULT_AUTHOR.name,
    },
    {
      name: "role",
      label: "Professional title",
      type: "text",
      required: true,
      defaultValue: DEFAULT_AUTHOR.role,
      admin: {
        description: "Public role, for example Psychiatrist. Do not invent titles.",
      },
    },
    {
      name: "credentials",
      type: "text",
      admin: {
        description:
          "Optional post-nominals, for example MD, FRCPC. Shown next to the name on the article.",
      },
    },
    {
      name: "bio",
      label: "Short biography",
      type: "textarea",
      admin: {
        description: "One or two sentences. Shown in the article authorship panel.",
      },
    },
    {
      name: "photo",
      label: "Photograph",
      type: "upload",
      relationTo: "media",
      admin: {
        description: PATIENT_INFORMATION_WARNING,
      },
    },
  ],
};
