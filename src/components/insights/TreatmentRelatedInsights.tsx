import { RelatedInsights } from "./RelatedInsights";
import { getArticlesByTopic, shouldExposeInsightsPublicly } from "@/sanity/fetch";

/** Ready for TMS and ketamine treatment pages when published articles exist. */
export async function TreatmentRelatedInsights({
  topic,
  heading,
}: {
  topic: string;
  heading: string;
}) {
  if (!(await shouldExposeInsightsPublicly())) return null;
  const articles = await getArticlesByTopic(topic);
  if (!articles.length) return null;
  return <RelatedInsights articles={articles} heading={heading} />;
}
