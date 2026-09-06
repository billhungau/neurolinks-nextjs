import type { CollectionConfig } from "payload";
import { anyone, authenticated } from "../access";
import { revalidateSupportingContent } from "../hooks/revalidateInsights";
import { slugField } from "../fields/slug";

/**
 * The editorial section an article belongs to. Categories drive the kicker
 * above article titles and the accent colour used by the card design. Topic
 * filters on `/insights/` are a separate, fixed taxonomy (see
 * `INSIGHTS_TOPICS`) so public filter URLs cannot change by accident.
 */
export const Categories: CollectionConfig = {
  slug: "categories",
  labels: {
    singular: "Category",
    plural: "Categories",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "tone"],
    description:
      "Sections such as TMS or Veterans. The category name appears above the article title.",
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
      name: "title",
      type: "text",
      required: true,
    },
    ...slugField(),
    {
      name: "description",
      type: "textarea",
      admin: {
        description: "Internal note about what belongs in this category.",
      },
    },
    {
      name: "tone",
      label: "Editorial colour",
      type: "select",
      defaultValue: "navy",
      options: [
        { label: "Navy", value: "navy" },
        { label: "Blue (TMS)", value: "blue" },
        { label: "Gold (ketamine)", value: "gold" },
        { label: "Sage (Veterans)", value: "sage" },
        { label: "Teal (pathways)", value: "teal" },
      ],
    },
  ],
};
