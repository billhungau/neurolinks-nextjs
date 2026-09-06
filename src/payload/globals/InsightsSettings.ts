import type { GlobalConfig } from "payload";
import {
  INSIGHTS_CONTACT_BODY,
  INSIGHTS_CONTACT_HEADING,
  INSIGHTS_HEADING,
  INSIGHTS_SUPPORTING,
  MEDICAL_AUTHORSHIP_STATEMENT,
} from "../../lib/insights";
import { anyone, authenticated } from "../access";
import { revalidateInsightsSettings } from "../hooks/revalidateInsights";

/**
 * Editable copy for the `/insights/` index. Every field has a code-level
 * default so the page is complete before anyone opens the CMS.
 */
export const InsightsSettings: GlobalConfig = {
  slug: "insights-settings",
  label: "Insights Settings",
  admin: {
    description: "Wording on the Insights index page.",
  },
  access: {
    read: anyone,
    update: authenticated,
    readVersions: authenticated,
  },
  hooks: {
    afterChange: [revalidateInsightsSettings],
  },
  fields: [
    {
      name: "introHeading",
      label: "Insights intro heading",
      type: "textarea",
      defaultValue: INSIGHTS_HEADING,
      admin: { description: "The main heading at the top of /insights/." },
    },
    {
      name: "introBody",
      label: "Intro text",
      type: "textarea",
      defaultValue: INSIGHTS_SUPPORTING,
    },
    {
      name: "medicalAuthorship",
      label: "Medical authorship text",
      type: "textarea",
      defaultValue: MEDICAL_AUTHORSHIP_STATEMENT,
      admin: {
        description:
          "The statement explaining who writes and reviews NeuroLinks Insights.",
      },
    },
    {
      name: "contactHeading",
      label: "Contact CTA heading",
      type: "text",
      defaultValue: INSIGHTS_CONTACT_HEADING,
    },
    {
      name: "contactBody",
      label: "Contact CTA text",
      type: "textarea",
      defaultValue: INSIGHTS_CONTACT_BODY,
    },
  ],
};
