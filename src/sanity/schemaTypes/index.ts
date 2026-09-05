import { article } from "./article";
import {
  clinicalNote,
  comparisonTable,
  contextualCta,
  editorialDiagram,
  evidenceSummary,
  imageWithCaption,
  importantLimitation,
  keyPointsBox,
  processTimeline,
  pullQuote,
  referencesSection,
  relatedReading,
  vacCoverageNote,
} from "./blocks";
import { category } from "./category";
import { citationSource } from "./citationSource";
import { insightsSettings } from "./insightsSettings";
import { person } from "./person";

export const schemaTypes = [
  article,
  person,
  category,
  citationSource,
  insightsSettings,
  keyPointsBox,
  evidenceSummary,
  clinicalNote,
  importantLimitation,
  vacCoverageNote,
  processTimeline,
  comparisonTable,
  pullQuote,
  imageWithCaption,
  relatedReading,
  contextualCta,
  referencesSection,
  editorialDiagram,
];
