import Link from "next/link";
import { INSIGHTS_TOPICS, topicFilterHref } from "@/lib/insights";

export function TopicFilters({ active }: { active?: string | null }) {
  return (
    <nav className="insights-topics" aria-label="Insights topics">
      <Link href="/insights/" aria-current={!active ? "page" : undefined} className={!active ? "is-active" : undefined}>
        All topics
      </Link>
      {INSIGHTS_TOPICS.map((topic) => {
        const current = active === topic.slug;
        return (
          <Link
            key={topic.slug}
            href={topicFilterHref(topic.slug)}
            className={current ? "is-active" : undefined}
            aria-current={current ? "page" : undefined}
          >
            {topic.title}
          </Link>
        );
      })}
    </nav>
  );
}
