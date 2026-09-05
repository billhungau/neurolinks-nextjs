import { defineField, defineType } from "sanity";

export const citationSource = defineType({
  name: "citationSource",
  title: "Reference",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Article or document title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "authors",
      title: "Authors or organization",
      type: "string",
    }),
    defineField({
      name: "publisher",
      title: "Journal or publisher",
      type: "string",
    }),
    defineField({
      name: "year",
      type: "number",
      validation: (rule) => rule.integer().min(1800).max(2100),
    }),
    defineField({ name: "volume", type: "string" }),
    defineField({ name: "issue", type: "string" }),
    defineField({ name: "pages", type: "string" }),
    defineField({
      name: "doi",
      title: "DOI",
      type: "string",
    }),
    defineField({
      name: "pubmedUrl",
      title: "PubMed URL",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "url",
      title: "Source URL",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "editorialNote",
      title: "Editorial note",
      type: "text",
      rows: 3,
      description: "Internal context for editors. Not shown on the public page.",
    }),
  ],
  preview: {
    select: { title: "title", authors: "authors", year: "year" },
    prepare: ({ title, authors, year }) => ({
      title,
      subtitle: [authors, year].filter(Boolean).join(" · "),
    }),
  },
});
