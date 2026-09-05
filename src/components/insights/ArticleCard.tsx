import Link from "next/link";
import { TextLink } from "@/components/TextLink";
import { formatInsightsDate, insightsArticlePath, readingTimeMinutes } from "@/lib/insights";
import type { InsightsArticleCard } from "@/sanity/types";
import { InsightsCardImage } from "./InsightsCardImage";

export function ArticleCard({ article }: { article: InsightsArticleCard }) {
  const date = formatInsightsDate(article.lastReviewedAt || article.publishedAt);
  const href = insightsArticlePath(article.slug);
  const minutes = readingTimeMinutes(article.bodyWordCount ?? 0, article.readingTime);
  return (
    <article className="insights-card">
      <InsightsCardImage article={article} />
      <div className="insights-card-copy">
        {article.category?.title ? <p className="insights-kicker">{article.category.title}</p> : null}
        <h3 className="insights-card-title">
          <Link href={href}>{article.title}</Link>
        </h3>
        {article.summary ? <p className="insights-card-summary">{article.summary}</p> : null}
        <p className="insights-meta">
          {date ? <time dateTime={article.lastReviewedAt || article.publishedAt || undefined}>{date}</time> : null}
          <span>{minutes} min read</span>
        </p>
        <TextLink href={href}>Read article</TextLink>
      </div>
    </article>
  );
}
