import type { Metadata } from "next";
import { pageMetadata, type SeoImage } from "@/lib/seo";
import {
  INSIGHTS_NAME,
  INSIGHTS_SUPPORTING,
  articleJsonLd as articleJsonLdBase,
  insightsArticlePath,
} from "@/lib/insights";
import { productionUrl } from "@/lib/site";
import type { InsightsArticle } from "@/sanity/types";
import { insightsImageUrl } from "@/sanity/image";

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

export function articleShareImage(article: InsightsArticle): SeoImage | undefined {
  const source = article.socialImage?.asset ? article.socialImage : article.featuredImage;
  const url = insightsImageUrl(source, 1200, 630);
  if (!url) return undefined;
  return {
    path: url,
    width: 1200,
    height: 630,
    alt: source?.alt || article.title,
  };
}

export function articleMetadataRecord(article: InsightsArticle): Metadata {
  const path = insightsArticlePath(article.slug);
  const canonical = article.canonicalUrl || productionUrl(path);
  const title = article.seoTitle || `${article.title} | ${INSIGHTS_NAME}`;
  const description = article.metaDescription || article.summary || INSIGHTS_INDEX_DESCRIPTION;
  const ogTitle = article.socialTitle || title;
  const ogDescription = article.socialDescription || description;
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
  const image = insightsImageUrl(
    article.socialImage?.asset ? article.socialImage : article.featuredImage,
    1200,
    630,
  );
  return articleJsonLdBase({ ...article, image });
}
