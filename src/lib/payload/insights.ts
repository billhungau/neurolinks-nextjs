import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import type { Where } from "payload";
import {
  INSIGHTS_CACHE_TAG,
  INSIGHTS_CONTACT_BODY,
  INSIGHTS_CONTACT_HEADING,
  INSIGHTS_HEADING,
  INSIGHTS_SUPPORTING,
  MEDICAL_AUTHORSHIP_STATEMENT,
  isInsightsPublicEnabled,
  isPublishedArticle,
} from "../insights.ts";
import { isCmsConfigured, safeCmsRead } from "./client.ts";
import { mapArticle, mapArticleCards, type InsightsDoc } from "./map.ts";
import type {
  InsightsArticle,
  InsightsArticleCard,
  InsightsSettings,
} from "./types.ts";

/**
 * Server-side data access for the public Insights section.
 *
 * Every public query is constrained to published documents in the database
 * query itself — never filtered afterwards — and cached under a single tag so
 * publishing in Payload refreshes the site without a redeploy.
 */

const PUBLISHED: Where = {
  and: [{ _status: { equals: "published" } }, { publishedAt: { exists: true } }],
};

/** Featured first, then editorial order, then newest. */
const PUBLIC_SORT = ["sortOrder", "-publishedAt"];

const cacheOptions = { revalidate: 3600, tags: [INSIGHTS_CACHE_TAG] };

async function queryPublished(
  where: Where | null = null,
  limit = 100,
): Promise<InsightsArticleCard[]> {
  return safeCmsRead(
    "published insights query",
    async (payload) => {
      const result = await payload.find({
        collection: "insights",
        where: where ? { and: [PUBLISHED, where] } : PUBLISHED,
        sort: PUBLIC_SORT,
        limit,
        depth: 1,
        draft: false,
        overrideAccess: true,
        pagination: false,
      });
      return mapArticleCards(result.docs as unknown as InsightsDoc[]);
    },
    [],
  );
}

const cachedPublishedArticles = unstable_cache(
  async () => queryPublished(),
  ["insights", "published"],
  cacheOptions,
);

const cachedFeaturedArticles = unstable_cache(
  async () => queryPublished({ featured: { equals: true } }),
  ["insights", "featured"],
  cacheOptions,
);

const cachedArticlesByTopic = unstable_cache(
  async (topic: string) => queryPublished({ topics: { contains: topic } }),
  ["insights", "by-topic"],
  cacheOptions,
);

const cachedIndexableSlugs = unstable_cache(
  async () => {
    const articles = await queryPublished({ indexable: { not_equals: false } });
    return articles.map((article) => article.slug);
  },
  ["insights", "indexable-slugs"],
  cacheOptions,
);

const cachedArticleBySlug = unstable_cache(
  async (slug: string) =>
    safeCmsRead(
      `published article ${slug}`,
      async (payload) => {
        const result = await payload.find({
          collection: "insights",
          where: { and: [PUBLISHED, { slug: { equals: slug } }] },
          limit: 1,
          depth: 2,
          draft: false,
          overrideAccess: true,
          pagination: false,
        });
        const doc = result.docs[0] as unknown as InsightsDoc | undefined;
        return doc ? mapArticle(doc) : null;
      },
      null,
    ),
  ["insights", "article"],
  cacheOptions,
);

const cachedSettings = unstable_cache(
  async () =>
    safeCmsRead(
      "insights settings",
      async (payload) => {
        const settings = await payload.findGlobal({
          slug: "insights-settings",
          depth: 0,
          overrideAccess: true,
        });
        return settings as Partial<InsightsSettings> | null;
      },
      null,
    ),
  ["insights", "settings"],
  cacheOptions,
);

/** True while the CMS editor is previewing unpublished work. */
export async function isDraftPreview(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

export async function getInsightsSettings(): Promise<InsightsSettings> {
  const settings = await cachedSettings();
  return {
    introHeading: settings?.introHeading?.trim() || INSIGHTS_HEADING,
    introBody: settings?.introBody?.trim() || INSIGHTS_SUPPORTING,
    medicalAuthorship: settings?.medicalAuthorship?.trim() || MEDICAL_AUTHORSHIP_STATEMENT,
    contactHeading: settings?.contactHeading?.trim() || INSIGHTS_CONTACT_HEADING,
    contactBody: settings?.contactBody?.trim() || INSIGHTS_CONTACT_BODY,
  };
}

export async function getPublishedArticles(): Promise<InsightsArticleCard[]> {
  return cachedPublishedArticles();
}

export async function getFeaturedArticles(): Promise<InsightsArticleCard[]> {
  return cachedFeaturedArticles();
}

export async function getArticlesByTopic(topic: string): Promise<InsightsArticleCard[]> {
  return cachedArticlesByTopic(topic);
}

/** Topic-filtered listing for `/insights/`, or everything when no filter is set. */
export async function getPublicArticleCards(
  topic?: string | null,
): Promise<InsightsArticleCard[]> {
  if (topic) return getArticlesByTopic(topic);
  return getPublishedArticles();
}

export async function getIndexableArticleSlugs(): Promise<string[]> {
  return cachedIndexableSlugs();
}

/**
 * A single article. `preview` is only ever true for an authenticated CMS
 * editor who came through the signed preview route, and is the only path that
 * reads Payload's draft version.
 */
export async function getArticleBySlug(
  slug: string,
  preview = false,
): Promise<InsightsArticle | null> {
  if (!preview) return cachedArticleBySlug(slug);

  return safeCmsRead(
    `draft article ${slug}`,
    async (payload) => {
      const result = await payload.find({
        collection: "insights",
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
        draft: true,
        overrideAccess: true,
        pagination: false,
      });
      const doc = result.docs[0] as unknown as InsightsDoc | undefined;
      return doc ? mapArticle(doc) : null;
    },
    null,
  );
}

/**
 * Related articles for the bottom of an article page: the editor's picks
 * first, then published articles sharing a topic.
 */
export async function getRelatedArticles(
  article: Pick<InsightsArticle, "id" | "slug" | "topics" | "relatedArticles">,
  limit = 3,
): Promise<InsightsArticleCard[]> {
  const picked = (article.relatedArticles ?? []).filter(
    (related) => related.slug !== article.slug,
  );
  if (picked.length >= limit) return picked.slice(0, limit);

  const topics = article.topics ?? [];
  if (!topics.length) return picked;

  const candidates = await getPublishedArticles();
  const seen = new Set([article.slug, ...picked.map((related) => related.slug)]);
  const byTopic = candidates.filter((candidate) => {
    if (seen.has(candidate.slug)) return false;
    return (candidate.topics ?? []).some((topic) => topics.includes(topic));
  });

  return [...picked, ...byTopic].slice(0, limit);
}

/**
 * The public section stays hidden until the launch flag is set, the CMS is
 * connected and at least one article is genuinely published.
 */
export async function shouldExposeInsightsPublicly(): Promise<boolean> {
  if (!isInsightsPublicEnabled() || !isCmsConfigured()) return false;
  const articles = await getPublishedArticles();
  return articles.length > 0;
}

/** Guard used by the article route before rendering anything. */
export function canShowArticle(
  article: Pick<InsightsArticle, "slug" | "status" | "publishedAt">,
  preview: boolean,
): boolean {
  if (preview) return Boolean(article.slug);
  if (!isInsightsPublicEnabled()) return false;
  return isPublishedArticle({
    slug: article.slug,
    _status: article.status,
    publishedAt: article.publishedAt,
  });
}
