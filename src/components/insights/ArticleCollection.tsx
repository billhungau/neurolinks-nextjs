"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/Reveal";
import type { InsightsArticleCard } from "@/lib/payload/types";
import { ArticleCard } from "./ArticleCard";

type ViewMode = "grid" | "list";

const VIEW_PREFERENCE_KEY = "neurolinks-insights-view";

export function ArticleCollection({ articles }: { articles: InsightsArticleCard[] }) {
  const [view, setView] = useState<ViewMode>("grid");

  useEffect(() => {
    const saved = window.localStorage.getItem(VIEW_PREFERENCE_KEY);
    if (saved === "grid" || saved === "list") setView(saved);
  }, []);

  function chooseView(next: ViewMode) {
    setView(next);
    window.localStorage.setItem(VIEW_PREFERENCE_KEY, next);
  }

  return (
    <>
      <div className="insights-collection-tools">
        <p aria-live="polite">{articles.length} {articles.length === 1 ? "article" : "articles"}</p>
        <div className="insights-view-toggle" role="group" aria-label="Article view">
          <button type="button" className={view === "grid" ? "is-active" : undefined} aria-pressed={view === "grid"} onClick={() => chooseView("grid")}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2h5v5H2V2Zm7 0h5v5H9V2ZM2 9h5v5H2V9Zm7 0h5v5H9V9Z" /></svg>
            <span>Grid</span>
          </button>
          <button type="button" className={view === "list" ? "is-active" : undefined} aria-pressed={view === "list"} onClick={() => chooseView("list")}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3h2v2H2V3Zm4 0h8v2H6V3ZM2 7h2v2H2V7Zm4 0h8v2H6V7Zm-4 4h2v2H2v-2Zm4 0h8v2H6v-2Z" /></svg>
            <span>List</span>
          </button>
        </div>
      </div>
      <div className={`insights-editorial-grid is-${view}`}>
        {articles.map((article, index) => (
          <Reveal key={article.id} delayMs={Math.min(index, 4) * 55}>
            <ArticleCard article={article} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
