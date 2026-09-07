import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { Reveal } from "@/components/Reveal";
import { SiteChrome } from "@/components/SiteChrome";
import { ArticleCard } from "@/components/insights/ArticleCard";
import { TopicFilters } from "@/components/insights/TopicFilters";
import { isInsightsTopicSlug, topicBySlug } from "@/lib/insights";
import { insightsIndexMetadata } from "@/lib/insights-seo";
import { getInsightsSettings, getPublicArticleCards, isDraftPreview, shouldExposeInsightsPublicly } from "@/lib/payload/insights";
import type { Metadata } from "next";
import "../insights-index.css";

export async function generateMetadata(): Promise<Metadata> {
  const preview = await isDraftPreview();
  if (!preview && !(await shouldExposeInsightsPublicly())) notFound();
  return insightsIndexMetadata();
}

export default async function InsightsIndexPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const preview = await isDraftPreview();
  if (!preview && !(await shouldExposeInsightsPublicly())) notFound();

  const { topic: topicParam } = await searchParams;
  const topic = isInsightsTopicSlug(topicParam ?? "") ? topicParam : null;
  const [settings, articles] = await Promise.all([getInsightsSettings(), getPublicArticleCards(topic)]);

  return (
    <SiteChrome>
      <header className="insights-index-intro">
        <div className="nl-wrap insights-index-intro-inner">
          <p className="eyebrow">NeuroLinks Insights</p>
          <h1>{settings.introHeading || "Insights"}</h1>
          {settings.introBody ? <p>{settings.introBody}</p> : null}
        </div>
      </header>

      <main className="insights-index-main">
        <div className="nl-wrap">
          <nav className="insights-index-topics" aria-label="Filter insights by topic"><TopicFilters active={topic} /></nav>
          <div className="insights-index-rule" />
          <div className="insights-index-section-heading">
            <div><p className="insights-index-label">{topic ? "Topic" : "Journal"}</p><h2>{topic ? topicBySlug(topic)?.title || "Insights" : "Latest articles"}</h2></div>
          </div>
          {articles.length ? (
            <div className="insights-editorial-grid">
              {articles.map((article, index) => <Reveal key={article.id} delayMs={Math.min(index, 4) * 55}><ArticleCard article={article} /></Reveal>)}
            </div>
          ) : <p className="insights-empty">No published articles in this topic yet.</p>}
        </div>
      </main>

      <section className="insights-index-cta">
        <div className="nl-wrap insights-index-cta-inner">
          <div><p className="insights-index-label">NeuroLinks · Nanaimo, BC</p><h2>{settings.contactHeading}</h2><p>{settings.contactBody}</p></div>
          <ButtonLink href="/contact/">Contact NeuroLinks</ButtonLink>
        </div>
      </section>
    </SiteChrome>
  );
}
