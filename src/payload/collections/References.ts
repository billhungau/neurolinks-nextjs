import type { CollectionConfig } from "payload";
import { normalizeDoi } from "../../lib/doi";
import { anyone, authenticated, authenticatedFieldAccess } from "../access";
import { revalidateSupportingContent } from "../hooks/revalidateInsights";

/**
 * Structured medical and scientific citations. Articles link to these rather
 * than repeating free text, so the same study is formatted identically
 * everywhere it appears.
 */
export const References: CollectionConfig = {
  slug: "references",
  labels: {
    singular: "Reference",
    plural: "References",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "authors", "publisher", "year"],
    description:
      "Studies, reviews and official documents cited by Insights articles.",
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
      label: "Citation title",
      type: "text",
      required: true,
      admin: {
        description: "The article, chapter or document title.",
      },
    },
    {
      name: "authors",
      label: "Authors or organization",
      type: "text",
    },
    {
      name: "publisher",
      label: "Journal or source",
      type: "text",
    },
    {
      type: "row",
      fields: [
        {
          name: "year",
          type: "number",
          min: 1800,
          max: 2100,
          admin: { width: "25%", step: 1 },
        },
        { name: "volume", type: "text", admin: { width: "25%" } },
        { name: "issue", type: "text", admin: { width: "25%" } },
        { name: "pages", type: "text", admin: { width: "25%" } },
      ],
    },
    {
      name: "doi",
      label: "DOI",
      type: "text",
      hooks: {
        beforeValidate: [({ value }) => normalizeDoi(value) || null],
      },
      admin: {
        description: "DOI only, without https://doi.org/.",
      },
    },
    {
      name: "pubmedUrl",
      label: "PubMed URL",
      type: "text",
    },
    {
      name: "url",
      label: "External URL",
      type: "text",
      admin: {
        description: "Used when there is no DOI or PubMed record.",
      },
    },
    {
      name: "editorialNote",
      label: "Editorial note",
      type: "textarea",
      access: {
        read: authenticatedFieldAccess,
        create: authenticatedFieldAccess,
        update: authenticatedFieldAccess,
      },
      admin: {
        description: "Internal context for editors. Never shown on the public page.",
      },
    },
  ],
};
