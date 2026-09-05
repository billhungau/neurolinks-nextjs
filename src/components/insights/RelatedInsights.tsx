import type { InsightsArticleCard } from "@/sanity/types";
import { ArticleCard } from "./ArticleCard";

export function RelatedInsights({
  articles,
  heading = "Related Insights",
}: {
  articles: InsightsArticleCard[];
  heading?: string;
}) {
  if (!articles.length) return null;
  return (
    <section className="insights-related" aria-labelledby="related-insights-heading">
      <h2 id="related-insights-heading" className="insights-h2">
        {heading}
      </h2>
      <div className="insights-card-grid">
        {articles.slice(0, 3).map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
    </section>
  );
}
