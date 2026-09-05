import { draftMode } from "next/headers";
import {
  INSIGHTS_HEADING,
  INSIGHTS_SUPPORTING,
  MEDICAL_AUTHORSHIP_STATEMENT,
  isInsightsPublicEnabled,
} from "@/lib/insights";
import { client, isSanityConfigured } from "./client";
import {
  articleBySlugQuery,
  articleSlugsQuery,
  articlesByTopicQuery,
  featuredArticlesQuery,
  insightsSettingsQuery,
  publishedArticlesQuery,
} from "./queries";
import type { InsightsArticle, InsightsArticleCard, InsightsSettings } from "./types";

async function safeFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  fallback: T,
  preview = false,
): Promise<T> {
  if (!isSanityConfigured()) return fallback;
  try {
    if (preview) {
      const previewClient = client.withConfig({
        token: process.env.SANITY_API_READ_TOKEN,
        useCdn: false,
        perspective: "previewDrafts",
        stega: true,
      });
      const data = await previewClient.fetch<T>(query, params);
      return data ?? fallback;
    }
    const data = await client.fetch<T>(query, params, {
      next: { tags: ["insights"] },
    });
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

export async function isDraftPreview() {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

export async function getPublishedArticles(): Promise<InsightsArticleCard[]> {
  const data = await safeFetch<InsightsArticleCard[]>(publishedArticlesQuery, {}, []);
  return Array.isArray(data) ? data.filter((article) => article.slug) : [];
}

export async function getFeaturedArticles(): Promise<InsightsArticleCard[]> {
  const data = await safeFetch<InsightsArticleCard[]>(featuredArticlesQuery, {}, []);
  return Array.isArray(data) ? data.filter((article) => article.slug) : [];
}

export async function getArticlesByTopic(topic: string): Promise<InsightsArticleCard[]> {
  const data = await safeFetch<InsightsArticleCard[]>(articlesByTopicQuery, { topic }, []);
  return Array.isArray(data) ? data.filter((article) => article.slug) : [];
}

export async function getIndexableArticleSlugs(): Promise<string[]> {
  const data = await safeFetch<string[]>(articleSlugsQuery, {}, []);
  return Array.isArray(data) ? data.filter(Boolean) : [];
}

export async function getArticleBySlug(
  slug: string,
  preview = false,
): Promise<InsightsArticle | null> {
  return safeFetch<InsightsArticle | null>(
    articleBySlugQuery,
    { slug, preview },
    null,
    preview,
  );
}

export async function getInsightsSettings(): Promise<InsightsSettings> {
  const data = await safeFetch<InsightsSettings | null>(insightsSettingsQuery, {}, null);
  return {
    introHeading: data?.introHeading || INSIGHTS_HEADING,
    introBody: data?.introBody || INSIGHTS_SUPPORTING,
    medicalAuthorship: data?.medicalAuthorship || MEDICAL_AUTHORSHIP_STATEMENT,
    contactHeading: data?.contactHeading || "A conversation can help you make sense of the options",
    contactBody:
      data?.contactBody ||
      "If you are considering specialist treatment, the NeuroLinks team can help you understand whether an assessment may be appropriate.",
  };
}

export async function shouldExposeInsightsPublicly() {
  if (!isInsightsPublicEnabled() || !isSanityConfigured()) return false;
  const articles = await getPublishedArticles();
  return articles.length > 0;
}

export async function getPublicArticleCards(topic?: string | null) {
  if (topic) return getArticlesByTopic(topic);
  return getPublishedArticles();
}
