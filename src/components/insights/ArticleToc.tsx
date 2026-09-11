"use client";

import { useEffect, useState } from "react";

export function ArticleToc({
  headings,
}: {
  headings: { id: string; text: string }[];
}) {
  const [activeId, setActiveId] = useState(headings[0]?.id || "");

  useEffect(() => {
    let frame = 0;
    const updateActiveHeading = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const readingLine = Math.min(window.innerHeight * 0.28, 190);
        let current = headings[0]?.id || "";
        for (const heading of headings) {
          const element = document.getElementById(heading.id);
          if (element && element.getBoundingClientRect().top <= readingLine) current = heading.id;
        }
        setActiveId(current);
      });
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading);
    window.addEventListener("hashchange", updateActiveHeading);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
      window.removeEventListener("hashchange", updateActiveHeading);
    };
  }, [headings]);

  if (headings.length < 2) return null;
  return (
    <nav className="insights-toc" aria-label="In this article">
      <div className="insights-toc-desktop">
        <p className="insights-toc-title">In this article</p>
        <ol>
          {headings.map((heading) => (
            <li key={heading.id}>
              <a href={`#${heading.id}`} aria-current={activeId === heading.id ? "location" : undefined}>{heading.text}</a>
            </li>
          ))}
        </ol>
      </div>
      <details className="insights-toc-mobile">
        <summary>In this article</summary>
        <ol>
          {headings.map((heading) => (
            <li key={heading.id}>
              <a href={`#${heading.id}`} aria-current={activeId === heading.id ? "location" : undefined}>{heading.text}</a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}
