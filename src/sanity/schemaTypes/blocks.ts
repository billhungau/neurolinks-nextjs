import { defineArrayMember, defineField, defineType } from "sanity";
import { PATIENT_INFORMATION_WARNING } from "@/lib/insights";

const linkAnnotation = defineArrayMember({
  name: "link",
  type: "object",
  title: "Link",
  fields: [
    defineField({
      name: "href",
      title: "URL",
      type: "url",
      validation: (rule) =>
        rule.uri({
          allowRelative: true,
          scheme: ["http", "https", "mailto", "tel"],
        }),
    }),
    defineField({
      name: "blank",
      title: "Open in a new tab",
      type: "boolean",
      initialValue: false,
    }),
  ],
});

const citationAnnotation = defineArrayMember({
  name: "citation",
  type: "object",
  title: "Numbered reference citation",
  fields: [
    defineField({
      name: "number",
      title: "Reference number",
      type: "number",
      description: "Matches the numbered item in the article references list.",
      validation: (rule) => rule.required().integer().min(1),
    }),
  ],
});

export const portableTextBlock = defineArrayMember({
  type: "block",
  styles: [
    { title: "Paragraph", value: "normal" },
    { title: "Heading", value: "h2" },
    { title: "Subheading", value: "h3" },
    { title: "Pull quote paragraph", value: "blockquote" },
  ],
  lists: [
    { title: "Bullet", value: "bullet" },
    { title: "Numbered", value: "number" },
  ],
  marks: {
    decorators: [
      { title: "Strong", value: "strong" },
      { title: "Emphasis", value: "em" },
    ],
    annotations: [linkAnnotation, citationAnnotation],
  },
});

export const simpleTextBlock = defineArrayMember({
  type: "block",
  styles: [{ title: "Paragraph", value: "normal" }],
  lists: [],
  marks: {
    decorators: [
      { title: "Strong", value: "strong" },
      { title: "Emphasis", value: "em" },
    ],
    annotations: [linkAnnotation],
  },
});

export const articleBodyMembers = [
  portableTextBlock,
  defineArrayMember({ type: "keyPointsBox" }),
  defineArrayMember({ type: "evidenceSummary" }),
  defineArrayMember({ type: "clinicalNote" }),
  defineArrayMember({ type: "importantLimitation" }),
  defineArrayMember({ type: "vacCoverageNote" }),
  defineArrayMember({ type: "processTimeline" }),
  defineArrayMember({ type: "comparisonTable" }),
  defineArrayMember({ type: "pullQuote" }),
  defineArrayMember({ type: "imageWithCaption" }),
  defineArrayMember({ type: "relatedReading" }),
  defineArrayMember({ type: "contextualCta" }),
  defineArrayMember({ type: "referencesSection" }),
  defineArrayMember({ type: "editorialDiagram" }),
];

export const keyPointsBox = defineType({
  name: "keyPointsBox",
  title: "Key-points box",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "string",
      initialValue: "Key points",
    }),
    defineField({
      name: "points",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { points: "points" },
    prepare: ({ points }: { points?: string[] }) => ({
      title: "Key-points box",
      subtitle: points?.[0],
    }),
  },
});

export const evidenceSummary = defineType({
  name: "evidenceSummary",
  title: "Evidence summary",
  type: "object",
  description:
    "Describe one study or review without promotional statistics. If the comparison is indirect, say so.",
  fields: [
    defineField({ name: "studyType", title: "Study type", type: "string" }),
    defineField({
      name: "population",
      title: "Population / sample size",
      type: "string",
    }),
    defineField({ name: "mainFinding", title: "Main finding", type: "text", rows: 3 }),
    defineField({
      name: "limitation",
      title: "Important limitation",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "doi",
      title: "DOI",
      type: "string",
      description: "DOI only, without https://doi.org/",
    }),
    defineField({
      name: "url",
      title: "Publication link",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
  ],
  preview: {
    select: { studyType: "studyType", mainFinding: "mainFinding" },
    prepare: ({ studyType, mainFinding }) => ({
      title: studyType || "Evidence summary",
      subtitle: mainFinding,
    }),
  },
});

export const clinicalNote = defineType({
  name: "clinicalNote",
  title: "Clinical note",
  type: "object",
  fields: [
    defineField({ name: "heading", type: "string", initialValue: "Clinical note" }),
    defineField({
      name: "body",
      type: "array",
      of: [simpleTextBlock],
      validation: (rule) => rule.required(),
    }),
  ],
});

export const importantLimitation = defineType({
  name: "importantLimitation",
  title: "Important limitation",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "string",
      initialValue: "Important limitation",
    }),
    defineField({
      name: "body",
      type: "array",
      of: [simpleTextBlock],
      validation: (rule) => rule.required(),
    }),
  ],
});

export const vacCoverageNote = defineType({
  name: "vacCoverageNote",
  title: "VAC coverage note",
  type: "object",
  description:
    "Distinguish clinical suitability, funding eligibility, preauthorization and treatment availability. Do not imply that VAC endorsement, authorization or payment is guaranteed.",
  fields: [
    defineField({
      name: "heading",
      type: "string",
      initialValue: "Coverage and authorization",
    }),
    defineField({
      name: "suitability",
      title: "Clinical suitability",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "funding",
      title: "Funding eligibility",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "preauthorization",
      title: "Preauthorization",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "availability",
      title: "Treatment availability",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
  ],
});

export const processTimeline = defineType({
  name: "processTimeline",
  title: "Process timeline",
  type: "object",
  fields: [
    defineField({ name: "heading", type: "string" }),
    defineField({
      name: "intro",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "steps",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "body", type: "text", rows: 3 }),
          ],
          preview: { select: { title: "title" } },
        },
      ],
      validation: (rule) => rule.min(2).max(6),
    }),
  ],
});

export const comparisonTable = defineType({
  name: "comparisonTable",
  title: "Comparison table",
  type: "object",
  description:
    "Do not rank treatments as universally superior. If evidence is from indirect comparison, say so in the caption or a limitation row.",
  fields: [
    defineField({ name: "caption", type: "string" }),
    defineField({
      name: "columns",
      title: "Column headings",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.min(2).max(4),
    }),
    defineField({
      name: "rows",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "heading",
              title: "Row heading",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "cells",
              title: "Cells (one per column)",
              type: "array",
              of: [{ type: "text" }],
            }),
          ],
          preview: { select: { title: "heading" } },
        },
      ],
    }),
    defineField({
      name: "footnote",
      type: "text",
      rows: 2,
    }),
  ],
});

export const pullQuote = defineType({
  name: "pullQuote",
  title: "Pull quote",
  type: "object",
  fields: [
    defineField({ name: "quote", type: "text", rows: 3, validation: (rule) => rule.required() }),
    defineField({ name: "attribution", type: "string" }),
  ],
});

export const imageWithCaption = defineType({
  name: "imageWithCaption",
  title: "Image with caption",
  type: "object",
  description: PATIENT_INFORMATION_WARNING,
  fields: [
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Alternative text",
      type: "string",
      validation: (rule) => rule.required().min(8),
    }),
    defineField({ name: "caption", type: "string" }),
  ],
});

export const relatedReading = defineType({
  name: "relatedReading",
  title: "Related reading",
  type: "object",
  fields: [
    defineField({ name: "heading", type: "string", initialValue: "Related reading" }),
    defineField({
      name: "articles",
      type: "array",
      of: [{ type: "reference", to: [{ type: "article" }] }],
    }),
    defineField({
      name: "links",
      title: "Additional internal links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
            defineField({
              name: "href",
              type: "url",
              validation: (rule) =>
                rule.required().uri({ allowRelative: true, scheme: ["http", "https"] }),
            }),
          ],
        },
      ],
    }),
  ],
});

export const contextualCta = defineType({
  name: "contextualCta",
  title: "Contextual CTA",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "string",
      initialValue: "Not sure how this information applies to you?",
    }),
    defineField({
      name: "body",
      type: "text",
      rows: 3,
      initialValue:
        "Treatment recommendations depend on diagnosis, previous treatment, medical history and individual priorities.",
    }),
    defineField({
      name: "label",
      type: "string",
      initialValue: "Start a confidential conversation",
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "url",
      description: "Leave blank to use the article’s topic default (contact, Veterans, or a treatment page).",
      validation: (rule) => rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
    }),
  ],
});

export const referencesSection = defineType({
  name: "referencesSection",
  title: "References section",
  type: "object",
  description:
    "Use this only if references should appear mid-article. The article’s References field is still rendered at the end.",
  fields: [
    defineField({ name: "heading", type: "string", initialValue: "References" }),
    defineField({
      name: "sources",
      type: "array",
      of: [{ type: "reference", to: [{ type: "citationSource" }] }],
    }),
  ],
});

export const editorialDiagram = defineType({
  name: "editorialDiagram",
  title: "Editorial diagram",
  type: "object",
  fields: [
    defineField({
      name: "diagram",
      type: "string",
      options: {
        list: [
          { title: "VAC authorization pathway", value: "vacPathway" },
          { title: "Symptom overlap (depression, trauma, anxiety)", value: "symptomOverlap" },
          { title: "Neural pathway motif", value: "neuralMotif" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      type: "string",
    }),
  ],
  preview: {
    select: { diagram: "diagram" },
    prepare: ({ diagram }) => ({
      title: "Editorial diagram",
      subtitle: diagram,
    }),
  },
});
