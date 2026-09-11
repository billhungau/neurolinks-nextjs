import type { InsightsArticleCard } from "./payload/types";

export function selectInsightsLead(
  articles: InsightsArticleCard[],
  topic?: string | null,
): { lead: InsightsArticleCard | null; remaining: InsightsArticleCard[] } {
  if (topic || articles.length === 0) return { lead: null, remaining: articles };
  const lead = articles.find((article) => article.featured) || articles[0];
  return {
    lead,
    remaining: articles.filter((article) => String(article.id) !== String(lead.id)),
  };
}

export type AutomaticArticleCta = "none" | "generic" | "veterans";

export function automaticArticleCta(input: {
  topics?: readonly string[] | null;
  categorySlug?: string | null;
  bodyHasCta: boolean;
}): AutomaticArticleCta {
  if (input.bodyHasCta) return "none";
  return input.categorySlug === "veterans" || input.topics?.includes("veterans-and-coverage")
    ? "veterans"
    : "generic";
}
