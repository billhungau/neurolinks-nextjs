import type { PortableTextBlock } from "next-sanity";

export type InsightsTone = "navy" | "blue" | "gold" | "sage" | "teal";

export type InsightsImage = {
  alt?: string | null;
  caption?: string | null;
  asset?: {
    _id?: string;
    url?: string | null;
    metadata?: {
      lqip?: string | null;
      dimensions?: { width: number; height: number; aspectRatio?: number } | null;
    } | null;
  } | null;
} | null;

export type InsightsPerson = {
  _id?: string;
  name: string;
  role?: string | null;
  credentials?: string | null;
} | null;

export type InsightsCategory = {
  title: string;
  slug: string;
  tone?: InsightsTone | null;
} | null;

export type InsightsSource = {
  _id: string;
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
  editorialNote?: string | null;
};

export type InsightsArticleCard = {
  _id: string;
  title: string;
  slug: string;
  summary?: string | null;
  featured?: boolean | null;
  sortOrder?: number | null;
  publishedAt?: string | null;
  lastReviewedAt?: string | null;
  readingTime?: number | null;
  bodyWordCount?: number | null;
  topics?: string[] | null;
  indexable?: boolean | null;
  category?: InsightsCategory;
  featuredImage?: InsightsImage;
};

export type InsightsArticle = InsightsArticleCard & {
  keyPoints?: string[] | null;
  body?: PortableTextBlock[] | null;
  socialImage?: InsightsImage;
  seoTitle?: string | null;
  metaDescription?: string | null;
  socialTitle?: string | null;
  socialDescription?: string | null;
  canonicalUrl?: string | null;
  ctaHref?: string | null;
  ctaLabel?: string | null;
  author?: InsightsPerson;
  medicalReviewer?: InsightsPerson;
  relatedArticles?: InsightsArticleCard[] | null;
  references?: InsightsSource[] | null;
};

export type InsightsSettings = {
  introHeading?: string | null;
  introBody?: string | null;
  medicalAuthorship?: string | null;
  contactHeading?: string | null;
  contactBody?: string | null;
};
