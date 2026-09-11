import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/SiteChrome";
import {
  ArticleBody,
  ArticleCta,
  articleWordCount,
  bodyContainsCta,
  extractHeadings,
} from "@/components/insights/ArticleBody";
import { ArticleToc } from "@/components/insights/ArticleToc";
import { AuthorshipPanel } from "@/components/insights/AuthorshipPanel";
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
  readingTimeMinutes,
} from "@/lib/insights";
import { automaticArticleCta } from "@/lib/insights-editorial";
import { articleJsonLd, articleMetadataRecord, breadcrumbJsonLd } from "@/lib/insights-seo";
import { IMG_SIZES } from "@/lib/image-sizes";
import {
  canShowArticle,
  getArticleBySlug,
  getPublishedArticles,
  getRelatedArticles,
  isDraftPreview,
} from "@/lib/payload/insights";
import type { Metadata } from "next";
import "../../insights-editorial.css";

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
  if (!article || !canShowArticle(article, preview)) notFound();
  return articleMetadataRecord(article);
}

export default async function InsightsArticlePage({ params }: Props) {
  const { slug } = await params;
  const preview = await isDraftPreview();
  const article = await getArticleBySlug(slug, preview);
  if (!article || !canShowArticle(article, preview)) notFound();

  const minutes = readingTimeMinutes(articleWordCount(article), article.readingTime);
  const published = formatInsightsDate(article.publishedAt);
  const reviewed = formatInsightsDate(article.lastReviewedAt);
  const headings = extractHeadings(article.body);
  const ctaHref = article.ctaHref || defaultCtaHref(article.topics, article.category?.slug);
  const hero = article.featuredImage;
  const related = await getRelatedArticles(article);
  const bodyHasCta = bodyContainsCta(article.body);
  const ctaKind = automaticArticleCta({
    topics: article.topics,
    categorySlug: article.category?.slug,
    bodyHasCta,
  });

  const authorLine = [article.author?.name || DEFAULT_AUTHOR.name, article.author?.credentials]
    .filter(Boolean)
    .join(", ");
  const reviewerLine = article.medicalReviewer
    ? [article.medicalReviewer.name, article.medicalReviewer.credentials]
        .filter(Boolean)
        .join(", ")
    : null;

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
              <li><Link href="/">Home</Link></li>
              <li><Link href="/insights/">Insights</Link></li>
              <li aria-current="page">{article.title}</li>
            </ol>
          </nav>
          {article.category?.title ? <p className="insights-kicker">{article.category.title}</p> : null}
          <h1>{article.title}</h1>
          {article.summary ? <p className="insights-article-summary">{article.summary}</p> : null}
          <div className="insights-editorial-meta" aria-label="Article details">
            <p className="insights-editorial-people">
              <span>Written by <strong>{authorLine}</strong>{article.author?.role ? `, ${article.author.role}` : ""}</span>
              {reviewerLine ? <span>Medically reviewed by <strong>{reviewerLine}</strong>{article.medicalReviewer?.role ? `, ${article.medicalReviewer.role}` : ""}</span> : null}
            </p>
            <p className="insights-editorial-dates">
              {published ? <time dateTime={article.publishedAt || undefined}>Published {published}</time> : null}
              {reviewed ? <time dateTime={article.lastReviewedAt || undefined}>Reviewed {reviewed}</time> : null}
              <span>{minutes} min read</span>
            </p>
          </div>
        </div>

        {hero ? (
          <figure className="insights-article-hero">
            <Image
              src={hero.url}
              alt={hero.alt}
              width={hero.width || 1400}
              height={hero.height || 900}
              sizes={IMG_SIZES.insightsHero}
              priority
            />
            {hero.caption ? <figcaption>{hero.caption}</figcaption> : null}
          </figure>
        ) : (
          <div className="insights-article-hero insights-article-hero-graphic">
            <InsightsCardImage article={article} featured />
          </div>
        )}

        {article.keyPoints?.length ? (
          <aside className="insights-keypoints" aria-labelledby="insights-keypoints-heading">
            <p id="insights-keypoints-heading" className="insights-box-label">Key points</p>
            <ul>
              {article.keyPoints.map((point) => <li key={point}>{point}</li>)}
            </ul>
          </aside>
        ) : null}

        <div className={`insights-reading-layout${headings.length >= 2 ? " has-toc" : ""}`}>
          <ArticleToc headings={headings} />
          <div className="insights-prose">
            <ArticleBody article={article} />
            {ctaKind === "generic" ? (
              <ArticleCta
                heading={DEFAULT_ARTICLE_CTA.heading}
                body={DEFAULT_ARTICLE_CTA.body}
                label={article.ctaLabel || DEFAULT_ARTICLE_CTA.label}
                href={ctaHref}
              />
            ) : null}
          </div>
        </div>

        <ReferencesList sources={article.references} />
        <AuthorshipPanel author={article.author} reviewer={article.medicalReviewer} />

        <p className="insights-review-statement">
          This article is educational and does not replace an individual psychiatric assessment.
          {article.medicalReviewer?.name
            ? ` It was medically reviewed by ${article.medicalReviewer.name}.`
            : " Medical review is recorded in the article details when completed."}
        </p>

        {related.length ? <RelatedInsights articles={related} /> : null}

        {ctaKind === "veterans" ? (
          <ArticleCta
            heading="Questions about VAC authorization?"
            body="The NeuroLinks team can help Veterans and referring clinicians understand next steps. Authorization and payment are not guaranteed."
            label={article.ctaLabel || "Contact the Veterans team"}
            href={article.ctaHref || "/veterans/#veterans-contact"}
          />
        ) : null}
      </article>
    </SiteChrome>
  );
}
