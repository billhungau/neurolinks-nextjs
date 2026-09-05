import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/SiteChrome";
import { ArticleBody, ArticleCta, articleWordCount, bodyContainsCta, extractHeadings } from "@/components/insights/ArticleBody";
import { ArticleToc } from "@/components/insights/ArticleToc";
import { InsightsCardImage } from "@/components/insights/InsightsCardImage";
import { JsonLd, PreviewBanner } from "@/components/insights/JsonLd";
import { ReferencesList } from "@/components/insights/ReferencesList";
import { RelatedInsights } from "@/components/insights/RelatedInsights";
import {
  DEFAULT_ARTICLE_CTA,
  DEFAULT_AUTHOR,
  defaultCtaHref,
  formatInsightsDate,
  insightsArticlePath,
  isInsightsPublicEnabled,
  isPublishedArticle,
  readingTimeMinutes,
} from "@/lib/insights";
import { articleJsonLd, articleMetadataRecord, breadcrumbJsonLd } from "@/lib/insights-seo";
import { IMG_SIZES } from "@/lib/image-sizes";
import { getArticleBySlug, getPublishedArticles, isDraftPreview } from "@/sanity/fetch";
import { insightsImageUrl } from "@/sanity/image";
import type { InsightsArticle } from "@/sanity/types";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const preview = await isDraftPreview();
  const article = await getArticleBySlug(slug, preview);
  if (!article || !(await canShowArticle(article, preview))) notFound();
  return articleMetadataRecord(article);
}

async function canShowArticle(article: InsightsArticle, preview: boolean) {
  if (preview) return Boolean(article.slug);
  if (!isInsightsPublicEnabled()) return false;
  return isPublishedArticle(article);
}

export default async function InsightsArticlePage({ params }: Props) {
  const { slug } = await params;
  const preview = await isDraftPreview();
  const article = await getArticleBySlug(slug, preview);
  if (!article || !(await canShowArticle(article, preview))) notFound();

  const minutes = readingTimeMinutes(articleWordCount(article), article.readingTime);
  const published = formatInsightsDate(article.publishedAt);
  const reviewed = formatInsightsDate(article.lastReviewedAt);
  const headings = extractHeadings(article.body);
  const ctaHref = article.ctaHref || defaultCtaHref(article.topics);
  const heroUrl = insightsImageUrl(article.featuredImage, 1400);
  const heroAlt = article.featuredImage?.alt;

  return (
    <SiteChrome>
      {preview ? <PreviewBanner slug={article.slug} /> : null}
      <JsonLd data={articleJsonLd(article)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Insights", path: "/insights/" },
          { name: article.title, path: insightsArticlePath(article.slug) },
        ])}
      />
      <article className="insights-article">
        <div className="insights-article-header">
          <nav className="insights-breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/insights/">Insights</Link>
              </li>
              <li aria-current="page">{article.title}</li>
            </ol>
          </nav>
          {article.category?.title ? <p className="insights-kicker">{article.category.title}</p> : null}
          <h1>{article.title}</h1>
          {article.summary ? <p className="insights-article-summary">{article.summary}</p> : null}
          <p className="insights-bylines">
            <span>
              Written by {article.author?.name || DEFAULT_AUTHOR.name}
              {article.author?.role ? `, ${article.author.role}` : ""}
            </span>
            {article.medicalReviewer?.name ? (
              <span>
                Medically reviewed by {article.medicalReviewer.name}
                {article.medicalReviewer.role ? `, ${article.medicalReviewer.role}` : ""}
              </span>
            ) : null}
          </p>
          <p className="insights-meta">
            {published ? <time dateTime={article.publishedAt || undefined}>Published {published}</time> : null}
            {reviewed ? (
              <time dateTime={article.lastReviewedAt || undefined}>Reviewed {reviewed}</time>
            ) : null}
            <span>{minutes} min read</span>
          </p>
        </div>

        {heroUrl && heroAlt ? (
          <figure className="insights-article-hero">
            <Image
              src={heroUrl}
              alt={heroAlt}
              width={1400}
              height={900}
              sizes={IMG_SIZES.insightsHero}
              priority
            />
            {article.featuredImage?.caption ? <figcaption>{article.featuredImage.caption}</figcaption> : null}
          </figure>
        ) : (
          <div className="insights-article-hero insights-article-hero-graphic">
            <InsightsCardImage article={article} featured />
          </div>
        )}

        {article.keyPoints?.length ? (
          <aside className="insights-keypoints">
            <p className="insights-box-label">Key points</p>
            <ul>
              {article.keyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </aside>
        ) : null}

        <ArticleToc headings={headings} />

        <div className="insights-prose">
          <ArticleBody article={article} />
          {bodyContainsCta(article.body) ? null : (
            <ArticleCta
              heading={DEFAULT_ARTICLE_CTA.heading}
              body={DEFAULT_ARTICLE_CTA.body}
              label={article.ctaLabel || DEFAULT_ARTICLE_CTA.label}
              href={ctaHref}
            />
          )}
        </div>

        <ReferencesList sources={article.references} />

        <p className="insights-review-statement">
          This article is educational and does not replace an individual psychiatric assessment.
          {article.medicalReviewer?.name
            ? ` It was medically reviewed by ${article.medicalReviewer.name}.`
            : " Medical review is recorded in the article details when completed."}
        </p>

        {article.relatedArticles?.length ? <RelatedInsights articles={article.relatedArticles} /> : null}

        {article.topics?.includes("veterans-and-coverage") ? (
          <ArticleCta
            heading="Questions about VAC authorization?"
            body="The NeuroLinks team can help Veterans and referring clinicians understand next steps. Authorization and payment are not guaranteed."
            label="Contact the Veterans team"
            href="/veterans/#veterans-contact"
          />
        ) : null}
      </article>
    </SiteChrome>
  );
}
