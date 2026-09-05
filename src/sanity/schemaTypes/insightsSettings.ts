import { defineField, defineType } from "sanity";
import {
  INSIGHTS_HEADING,
  INSIGHTS_SUPPORTING,
  MEDICAL_AUTHORSHIP_STATEMENT,
} from "@/lib/insights";

export const insightsSettings = defineType({
  name: "insightsSettings",
  title: "Insights site settings",
  type: "document",
  fields: [
    defineField({
      name: "introHeading",
      title: "Index heading",
      type: "string",
      initialValue: INSIGHTS_HEADING,
    }),
    defineField({
      name: "introBody",
      title: "Supporting introduction",
      type: "text",
      rows: 3,
      initialValue: INSIGHTS_SUPPORTING,
    }),
    defineField({
      name: "medicalAuthorship",
      title: "Medical authorship statement",
      type: "text",
      rows: 4,
      initialValue: MEDICAL_AUTHORSHIP_STATEMENT,
    }),
    defineField({
      name: "contactHeading",
      type: "string",
      initialValue: "A conversation can help you make sense of the options",
    }),
    defineField({
      name: "contactBody",
      type: "text",
      rows: 3,
      initialValue:
        "If you are considering specialist treatment, the NeuroLinks team can help you understand whether an assessment may be appropriate.",
    }),
  ],
});
