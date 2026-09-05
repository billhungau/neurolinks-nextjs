import { getArticlesByTopic, shouldExposeInsightsPublicly } from "@/sanity/fetch";
import { RelatedInsights } from "./RelatedInsights";

export async function VeteransRelatedInsights() {
  if (!(await shouldExposeInsightsPublicly())) return null;
  const articles = await getArticlesByTopic("veterans-and-coverage");
  if (!articles.length) return null;
  return (
    <section className="tms-section insights-veterans-related bg-[var(--nl-cream)]">
      <div className="tms-wrap">
        <RelatedInsights articles={articles} heading="Related Insights" />
      </div>
    </section>
  );
}
