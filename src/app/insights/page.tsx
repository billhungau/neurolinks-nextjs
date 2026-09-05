import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { Reveal } from "@/components/Reveal";
import { SiteChrome } from "@/components/SiteChrome";
import { ArticleCard } from "@/components/insights/ArticleCard";
import { FeaturedArticle } from "@/components/insights/FeaturedArticle";
import { InsightsHero } from "@/components/insights/InsightsHero";
import { TopicFilters } from "@/components/insights/TopicFilters";
import { isInsightsTopicSlug, topicBySlug } from "@/lib/insights";
import { insightsIndexMetadata } from "@/lib/insights-seo";
import {
  getFeaturedArticles,
  getInsightsSettings,
  getPublicArticleCards,
  isDraftPreview,
  shouldExposeInsightsPublicly,
} from "@/sanity/fetch";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const preview = await isDraftPreview();
  if (!preview && !(await shouldExposeInsightsPublicly())) notFound();
  return insightsIndexMetadata();
}

export default async function InsightsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const preview = await isDraftPreview();
  if (!preview && !(await shouldExposeInsightsPublicly())) notFound();

  const { topic: topicParam } = await searchParams;
  const topic = isInsightsTopicSlug(topicParam ?? "") ? topicParam : null;
  const [settings, articles, featured] = await Promise.all([
    getInsightsSettings(),
    getPublicArticleCards(topic),
    getFeaturedArticles(),
  ]);

  const featuredArticle = !topic ? featured[0] || articles[0] : null;
  const latest = featuredArticle
    ? articles.filter((article) => article._id !== featuredArticle._id)
    : articles;
  const veterans = articles.filter((article) =>
    article.topics?.includes("veterans-and-coverage"),
  );

  return (
    <SiteChrome>
      <InsightsHero heading={settings.introHeading || ""} body={settings.introBody || ""} />

      {featuredArticle ? (
        <section className="insights-section">
          <div className="nl-wrap">
            <FeaturedArticle article={featuredArticle} />
          </div>
        </section>
      ) : null}

      <section className="insights-section insights-section-cream">
        <div className="nl-wrap">
          <TopicFilters active={topic} />
          {topic ? (
            <h2 className="insights-index-heading">
              {topicBySlug(topic)?.title || "Insights"}
            </h2>
          ) : (
            <h2 className="insights-index-heading">Latest articles</h2>
          )}
          {latest.length ? (
            <div className="insights-card-grid">
              {latest.map((article, index) => (
                <Reveal key={article._id} delayMs={Math.min(index, 4) * 60}>
                  <ArticleCard article={article} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="insights-empty">No published articles in this topic yet.</p>
          )}
        </div>
      </section>

      {!topic && veterans.length ? (
        <section className="insights-section">
          <div className="nl-wrap">
            <h2 className="insights-index-heading">Veterans information</h2>
            <div className="insights-card-grid">
              {veterans.map((article) => (
                <ArticleCard key={`vet-${article._id}`} article={article} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="insights-section insights-authorship">
        <div className="nl-wrap">
          <h2 className="insights-index-heading">Medical authorship</h2>
          <p>{settings.medicalAuthorship}</p>
        </div>
      </section>

      <section className="insights-section insights-invite">
        <div className="nl-wrap">
          <h2 className="insights-index-heading">{settings.contactHeading}</h2>
          <p>{settings.contactBody}</p>
          <ButtonLink href="/contact/">Start a confidential conversation</ButtonLink>
        </div>
      </section>
    </SiteChrome>
  );
}
