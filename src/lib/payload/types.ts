import type { LexicalState } from "../insights-content.ts";
import type { InsightsTopicSlug } from "../insights.ts";

/**
 * View models handed to the public Insights components.
 *
 * The presentational components never see a Payload document: this layer
 * resolves relationships, media URLs and word counts once, on the server.
 */

export type InsightsTone = "navy" | "blue" | "gold" | "sage" | "teal";

export type InsightsImage = {
  url: string;
  alt: string;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
} | null;

export type InsightsPerson = {
  id: number | string;
  name: string;
  role?: string | null;
  credentials?: string | null;
  bio?: string | null;
  photo?: InsightsImage;
} | null;

export type InsightsCategory = {
  title: string;
  slug: string;
  tone?: InsightsTone | null;
} | null;

export type InsightsSource = {
  id: number | string;
  title: string;
  authors?: string | null;
  publisher?: string | null;
  year?: number | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  doi?: string | null;
  pubmedUrl?: string | null;
  url?: string | null;
};

export type InsightsArticleCard = {
  id: number | string;
  title: string;
  slug: string;
  summary?: string | null;
  featured?: boolean | null;
  sortOrder?: number | null;
  publishedAt?: string | null;
  lastReviewedAt?: string | null;
  readingTime?: number | null;
  bodyWordCount?: number | null;
  topics?: InsightsTopicSlug[] | null;
  indexable?: boolean | null;
  category: InsightsCategory;
  featuredImage: InsightsImage;
};

export type InsightsArticle = InsightsArticleCard & {
  status: "draft" | "published";
  keyPoints?: string[] | null;
  body?: LexicalState;
  socialImage: InsightsImage;
  seoTitle?: string | null;
  metaDescription?: string | null;
  socialTitle?: string | null;
  socialDescription?: string | null;
  canonicalUrl?: string | null;
  ctaHref?: string | null;
  ctaLabel?: string | null;
  author: InsightsPerson;
  medicalReviewer: InsightsPerson;
  relatedArticles?: InsightsArticleCard[] | null;
  references?: InsightsSource[] | null;
};

export type InsightsSettings = {
  introHeading: string;
  introBody: string;
  medicalAuthorship: string;
  contactHeading: string;
  contactBody: string;
};
