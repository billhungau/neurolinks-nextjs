import Link from "next/link";
import { TextLink } from "@/components/TextLink";
import { Reveal } from "@/components/Reveal";
import { formatInsightsDate, insightsArticlePath, readingTimeMinutes } from "@/lib/insights";
import type { InsightsArticleCard } from "@/sanity/types";
import { InsightsCardImage } from "./InsightsCardImage";

export function FeaturedArticle({ article }: { article: InsightsArticleCard }) {
  const date = formatInsightsDate(article.lastReviewedAt || article.publishedAt);
  const minutes = readingTimeMinutes(article.bodyWordCount ?? 0, article.readingTime);
  return (
    <Reveal className="insights-featured">
      <InsightsCardImage article={article} featured />
      <div className="insights-featured-copy">
        {article.category?.title ? <p className="insights-kicker">{article.category.title}</p> : null}
        <h2 className="insights-featured-title">
          <Link href={insightsArticlePath(article.slug)}>{article.title}</Link>
        </h2>
        {article.summary ? <p className="insights-featured-summary">{article.summary}</p> : null}
        <p className="insights-meta">
          {date ? (
            <time dateTime={article.lastReviewedAt || article.publishedAt || undefined}>
              {article.lastReviewedAt ? `Reviewed ${date}` : date}
            </time>
          ) : null}
          <span>{minutes} min read</span>
        </p>
        <TextLink href={insightsArticlePath(article.slug)}>Read article</TextLink>
      </div>
    </Reveal>
  );
}
