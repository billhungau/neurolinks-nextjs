export type InsightsBrief = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  topics: string[];
  category: string;
  outline: string[];
  graphic: string;
  published: false;
};

/** Internal editorial shells. Do not publish until medically reviewed. */
export const INSIGHTS_BRIEFS: readonly InsightsBrief[] = [
  {
    id: "drafts.article-vac-tms-bc",
    slug: "how-vac-authorization-for-tms-works-in-british-columbia",
    title: "How VAC authorization for TMS works in British Columbia",
    summary:
      "An outline of how Veterans, clinicians and the clinic typically move from a first conversation to documentation, preauthorization and a written decision. Clinical and coverage details remain pending medical review.",
    topics: ["veterans-and-coverage", "tms"],
    category: "veterans-and-coverage",
    outline: [
      "Initial conversation",
      "Psychiatric assessment",
      "Documentation and preauthorization",
      "Written decision and treatment scheduling",
    ],
    graphic: "vacPathway",
    published: false,
  },
  {
    id: "drafts.article-tms-depression-ptsd-anxiety",
    slug: "tms-for-depression-when-ptsd-and-anxiety-are-also-present",
    title: "TMS for depression when PTSD and anxiety are also present",
    summary:
      "A planned discussion of how depression, trauma-related symptoms and anxiety can overlap, and why TMS evidence is not the same for every condition. Medical content and references are not yet complete.",
    topics: ["tms", "depression", "ptsd-and-anxiety", "treatment-resistant-depression"],
    category: "tms",
    outline: [
      "Overlapping symptoms",
      "What is established for depression",
      "Where evidence is more limited",
      "How assessment holds the full picture",
    ],
    graphic: "symptomOverlap",
    published: false,
  },
  {
    id: "drafts.article-tms-spravato-im-ketamine",
    slug: "tms-spravato-and-im-ketamine-understanding-the-differences",
    title: "TMS, Spravato and IM ketamine: understanding the differences",
    summary:
      "A structured comparison of how these options are delivered, scheduled and supervised, without ranking one treatment as universally superior. Comparative evidence and references are pending medical review.",
    topics: ["tms", "ketamine-and-spravato", "treatment-resistant-depression"],
    category: "ketamine-and-spravato",
    outline: [
      "How treatment is delivered",
      "Typical schedule",
      "Treatment setting",
      "Sedation or dissociation considerations",
      "Established clinical role",
      "Coverage considerations",
      "Important limitations",
    ],
    graphic: "comparisonTable",
    published: false,
  },
] as const;

export const INSIGHTS_BRIEF_AUTHOR = {
  name: "Dr. Chi Hung Au",
  role: "Psychiatrist",
} as const;

export const BANNED_INSIGHTS_PHRASES = [
  "miracle",
  "cure",
  "revolutionary",
  "guaranteed",
  "works when everything else has failed",
  "transform your life",
] as const;
