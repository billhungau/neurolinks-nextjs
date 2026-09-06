import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, pageMetadata, type SeoImage } from "@/lib/seo";
import {
  INSIGHTS_NAME,
  INSIGHTS_SUPPORTING,
  articleJsonLd as articleJsonLdBase,
  insightsArticlePath,
} from "@/lib/insights";
import {
  resolveMetaDescription,
  resolveSeoTitle,
  resolveSocialDescription,
  resolveSocialTitle,
} from "@/lib/insights-content";
import { productionUrl } from "@/lib/site";
import type { InsightsArticle } from "@/lib/payload/types";

export { breadcrumbJsonLd, doiHref, formatReference } from "@/lib/insights";

export const INSIGHTS_INDEX_TITLE = `${INSIGHTS_NAME} | Evidence-informed neuropsychiatric guidance`;
export const INSIGHTS_INDEX_DESCRIPTION = INSIGHTS_SUPPORTING;

export function insightsIndexMetadata(): Metadata {
  return pageMetadata({
    title: INSIGHTS_INDEX_TITLE,
    description: INSIGHTS_INDEX_DESCRIPTION,
    path: "/insights/",
  });
}

/** social image → featured image → NeuroLinks default share image. */
export function articleShareImage(article: InsightsArticle): SeoImage {
  const source = article.socialImage ?? article.featuredImage;
  if (!source) return DEFAULT_OG_IMAGE;
  return {
    path: source.url,
    width: source.width || 1200,
    height: source.height || 630,
    alt: source.alt || article.title,
  };
}

export function articleMetadataRecord(article: InsightsArticle): Metadata {
  const path = insightsArticlePath(article.slug);
  const canonical = article.canonicalUrl || productionUrl(path);
  const title = resolveSeoTitle(article, INSIGHTS_NAME);
  const description = resolveMetaDescription(article, INSIGHTS_INDEX_DESCRIPTION);
  const ogTitle = resolveSocialTitle(article, title);
  const ogDescription = resolveSocialDescription(article, description);
  const image = articleShareImage(article);
  const robots =
    article.indexable === false
      ? { index: false as const, follow: true as const }
      : undefined;

  const metadata = pageMetadata({
    title,
    description,
    path,
    image,
    robots,
  });

  return {
    ...metadata,
    alternates: { canonical },
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      url: canonical,
      title: ogTitle,
      description: ogDescription,
      publishedTime: article.publishedAt || undefined,
      modifiedTime: article.lastReviewedAt || article.publishedAt || undefined,
      authors: article.author?.name ? [article.author.name] : undefined,
    },
    twitter: {
      ...metadata.twitter,
      title: ogTitle,
      description: ogDescription,
    },
  };
}

export function articleJsonLd(article: InsightsArticle) {
  const image = articleShareImage(article);
  return articleJsonLdBase({
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    publishedAt: article.publishedAt,
    lastReviewedAt: article.lastReviewedAt,
    canonicalUrl: article.canonicalUrl,
    author: article.author,
    medicalReviewer: article.medicalReviewer,
    image: image.path.startsWith("http") ? image.path : productionUrl(image.path),
    topics: article.topics,
  });
}
