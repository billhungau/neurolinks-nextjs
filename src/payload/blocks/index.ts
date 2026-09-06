import type { Block } from "payload";
import { PATIENT_INFORMATION_WARNING } from "../../lib/insights";

/**
 * Structured editorial blocks available inside the Insights rich text editor.
 *
 * These reproduce the content capabilities NeuroLinks designed for its
 * previous CMS — key points, evidence summaries, clinical notes, coverage
 * notes, timelines, comparison tables, pull quotes, captioned images, related
 * reading, contextual CTAs and mid-article references — as native Payload
 * blocks. Presentation stays in the website components; the CMS only supplies
 * the content, so no block offers colour, font or layout controls.
 */

export const KeyPointsBlock: Block = {
  slug: "keyPointsBox",
  interfaceName: "KeyPointsBox",
  labels: { singular: "Key-points box", plural: "Key-points boxes" },
  fields: [
    {
      name: "heading",
      type: "text",
      defaultValue: "Key points",
    },
    {
      name: "points",
      type: "array",
      minRows: 1,
      labels: { singular: "Point", plural: "Points" },
      fields: [{ name: "text", type: "text", required: true }],
    },
  ],
};

export const EvidenceSummaryBlock: Block = {
  slug: "evidenceSummary",
  interfaceName: "EvidenceSummaryBlock",
  labels: { singular: "Evidence summary", plural: "Evidence summaries" },
  admin: {
    group: "Clinical",
  },
  fields: [
    {
      name: "studyType",
      type: "text",
      admin: { description: "For example: randomized controlled trial, meta-analysis." },
    },
    {
      name: "population",
      label: "Population / sample size",
      type: "text",
    },
    {
      name: "mainFinding",
      type: "textarea",
    },
    {
      name: "limitation",
      label: "Important limitation",
      type: "textarea",
      required: true,
      admin: {
        description:
          "Required. If the comparison is indirect rather than head-to-head, say so here.",
      },
    },
    {
      name: "doi",
      label: "DOI",
      type: "text",
      admin: { description: "DOI only, without https://doi.org/." },
    },
    {
      name: "url",
      label: "Publication link",
      type: "text",
    },
  ],
};

export const ClinicalNoteBlock: Block = {
  slug: "clinicalNote",
  interfaceName: "ClinicalNoteBlock",
  labels: { singular: "Clinical note", plural: "Clinical notes" },
  admin: { group: "Clinical" },
  fields: [
    { name: "heading", type: "text", defaultValue: "Clinical note" },
    { name: "body", type: "textarea", required: true },
  ],
};

export const ImportantLimitationBlock: Block = {
  slug: "importantLimitation",
  interfaceName: "ImportantLimitationBlock",
  labels: { singular: "Important limitation", plural: "Important limitations" },
  admin: { group: "Clinical" },
  fields: [
    { name: "heading", type: "text", defaultValue: "Important limitation" },
    { name: "body", type: "textarea", required: true },
  ],
};

export const VacCoverageNoteBlock: Block = {
  slug: "vacCoverageNote",
  interfaceName: "VacCoverageNoteBlock",
  labels: { singular: "VAC coverage note", plural: "VAC coverage notes" },
  admin: {
    group: "Clinical",
  },
  fields: [
    {
      name: "heading",
      type: "text",
      defaultValue: "Coverage and authorization",
      admin: {
        description:
          "Keep clinical suitability, funding eligibility, preauthorization and availability separate. Never imply that VAC authorization or payment is guaranteed.",
      },
    },
    { name: "suitability", label: "Clinical suitability", type: "textarea", required: true },
    { name: "funding", label: "Funding eligibility", type: "textarea", required: true },
    { name: "preauthorization", label: "Preauthorization", type: "textarea", required: true },
    { name: "availability", label: "Treatment availability", type: "textarea", required: true },
  ],
};

export const ProcessTimelineBlock: Block = {
  slug: "processTimeline",
  interfaceName: "ProcessTimelineBlock",
  labels: { singular: "Process timeline", plural: "Process timelines" },
  fields: [
    { name: "heading", type: "text" },
    { name: "intro", type: "textarea" },
    {
      name: "steps",
      type: "array",
      minRows: 2,
      maxRows: 6,
      labels: { singular: "Step", plural: "Steps" },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea" },
      ],
    },
  ],
};

export const ComparisonTableBlock: Block = {
  slug: "comparisonTable",
  interfaceName: "ComparisonTableBlock",
  labels: { singular: "Comparison table", plural: "Comparison tables" },
  fields: [
    {
      name: "caption",
      type: "text",
      admin: {
        description:
          "Do not rank treatments as universally superior. Note indirect comparisons here or in the footnote.",
      },
    },
    {
      name: "columns",
      label: "Column headings",
      type: "array",
      minRows: 2,
      maxRows: 4,
      labels: { singular: "Column", plural: "Columns" },
      fields: [{ name: "label", type: "text", required: true }],
    },
    {
      name: "rows",
      type: "array",
      labels: { singular: "Row", plural: "Rows" },
      fields: [
        { name: "heading", label: "Row heading", type: "text", required: true },
        {
          name: "cells",
          label: "Cells (one per column)",
          type: "array",
          labels: { singular: "Cell", plural: "Cells" },
          fields: [{ name: "text", type: "textarea" }],
        },
      ],
    },
    { name: "footnote", type: "textarea" },
  ],
};

export const PullQuoteBlock: Block = {
  slug: "pullQuote",
  interfaceName: "PullQuoteBlock",
  labels: { singular: "Pull quote", plural: "Pull quotes" },
  fields: [
    { name: "quote", type: "textarea", required: true },
    { name: "attribution", type: "text" },
  ],
};

export const ImageWithCaptionBlock: Block = {
  slug: "imageWithCaption",
  interfaceName: "ImageWithCaptionBlock",
  labels: { singular: "Image", plural: "Images" },
  fields: [
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: PATIENT_INFORMATION_WARNING },
    },
    {
      name: "caption",
      type: "text",
      admin: {
        description: "Leave blank to use the caption stored with the image.",
      },
    },
  ],
};

export const RelatedReadingBlock: Block = {
  slug: "relatedReading",
  interfaceName: "RelatedReadingBlock",
  labels: { singular: "Related reading", plural: "Related reading" },
  fields: [
    { name: "heading", type: "text", defaultValue: "Related reading" },
    {
      name: "articles",
      label: "Other Insights articles",
      type: "relationship",
      relationTo: "insights",
      hasMany: true,
    },
    {
      name: "links",
      label: "Additional NeuroLinks pages",
      type: "array",
      labels: { singular: "Link", plural: "Links" },
      fields: [
        { name: "title", type: "text", required: true },
        {
          name: "href",
          label: "Link",
          type: "text",
          required: true,
          admin: { description: "For example /veterans/ or /contact/." },
        },
      ],
    },
  ],
};

export const ContextualCtaBlock: Block = {
  slug: "contextualCta",
  interfaceName: "ContextualCtaBlock",
  labels: { singular: "Contact invitation", plural: "Contact invitations" },
  fields: [
    {
      name: "heading",
      type: "text",
      defaultValue: "Not sure how this information applies to you?",
    },
    {
      name: "body",
      type: "textarea",
      defaultValue:
        "Treatment recommendations depend on diagnosis, previous treatment, medical history and individual priorities.",
    },
    {
      name: "label",
      label: "Button label",
      type: "text",
      defaultValue: "Start a confidential conversation",
    },
    {
      name: "href",
      label: "Button link",
      type: "text",
      admin: {
        description:
          "Leave blank to use the article's topic default (contact, Veterans, or a treatment page).",
      },
    },
  ],
};

export const ReferencesSectionBlock: Block = {
  slug: "referencesSection",
  interfaceName: "ReferencesSectionBlock",
  labels: { singular: "References section", plural: "References sections" },
  fields: [
    {
      name: "heading",
      type: "text",
      defaultValue: "References",
      admin: {
        description:
          "Use only when references belong mid-article. The article's own References list still renders at the end.",
      },
    },
    {
      name: "sources",
      type: "relationship",
      relationTo: "references",
      hasMany: true,
    },
  ],
};

export const EditorialDiagramBlock: Block = {
  slug: "editorialDiagram",
  interfaceName: "EditorialDiagramBlock",
  labels: { singular: "Editorial diagram", plural: "Editorial diagrams" },
  fields: [
    {
      name: "diagram",
      type: "select",
      required: true,
      options: [
        { label: "VAC authorization pathway", value: "vacPathway" },
        { label: "Symptom overlap (depression, trauma, anxiety)", value: "symptomOverlap" },
        { label: "Neural pathway motif", value: "neuralMotif" },
      ],
    },
    { name: "caption", type: "text" },
  ],
};

/** Inline reference marker, equivalent to the old numbered citation mark. */
export const CitationInlineBlock: Block = {
  slug: "citation",
  interfaceName: "CitationInlineBlock",
  labels: { singular: "Reference number", plural: "Reference numbers" },
  fields: [
    {
      name: "number",
      label: "Reference number",
      type: "number",
      required: true,
      min: 1,
      admin: {
        description: "Matches the numbered item in the article references list.",
        step: 1,
      },
    },
  ],
};

export const insightsBodyBlocks: Block[] = [
  KeyPointsBlock,
  EvidenceSummaryBlock,
  ClinicalNoteBlock,
  ImportantLimitationBlock,
  VacCoverageNoteBlock,
  ProcessTimelineBlock,
  ComparisonTableBlock,
  PullQuoteBlock,
  ImageWithCaptionBlock,
  RelatedReadingBlock,
  ContextualCtaBlock,
  ReferencesSectionBlock,
  EditorialDiagramBlock,
];

export const insightsInlineBlocks: Block[] = [CitationInlineBlock];
