"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HOME_REVIEWS } from "@/content/home-reviews";
import { SITE } from "@/lib/site";
import { TextLink } from "./TextLink";

function pageSizeFromWidth(width: number) {
  if (width >= 1024) return 3;
  if (width >= 768) return 2;
  return 1;
}

function StarRow() {
  return (
    <p className="review-stars" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <svg key={index} viewBox="0 0 20 20" width="14" height="14">
          <path
            fill="currentColor"
            d="M10 1.6 12.4 7l5.9.5-4.5 3.8 1.4 5.7L10 13.8 4.8 17l1.4-5.7L1.7 7.5 7.6 7 10 1.6Z"
          />
        </svg>
      ))}
    </p>
  );
}

export function HomeReviews() {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [pageSize, setPageSize] = useState(1);
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(HOME_REVIEWS.length / pageSize);

  useEffect(() => {
    const update = () => setPageSize(pageSizeFromWidth(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scrollToPage = useCallback((next: number, smooth: boolean) => {
    const root = scrollerRef.current;
    if (!root) return;
    const bounded = Math.max(0, Math.min(next, pageCount - 1));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.scrollTo({
      left: bounded * root.clientWidth,
      behavior: reduced || !smooth ? "auto" : "smooth",
    });
  }, [pageCount]);

  useEffect(() => {
    scrollToPage(Math.min(page, pageCount - 1), false);
  }, [pageCount, page, scrollToPage]);

  function onScroll() {
    const root = scrollerRef.current;
    if (!root) return;
    const next = Math.round(root.scrollLeft / Math.max(root.clientWidth, 1));
    setPage(Math.max(0, Math.min(next, pageCount - 1)));
  }

  return (
    <section className="home-reviews home-section" aria-labelledby="home-reviews-heading">
      <div className="nl-wrap">
        <p className="eyebrow">Patient reviews</p>
        <h2 id="home-reviews-heading" className="home-h2 mt-3 text-[var(--nl-navy)]">
          What our patients say
        </h2>
        <p className="prose-measure mt-4 leading-relaxed text-[var(--nl-muted)]">
          Curated excerpts from published Google reviews. Individual experiences and treatment
          outcomes vary.
        </p>
        <p className="mt-3">
          <TextLink href={SITE.googleReviewsUrl}>View more Google reviews</TextLink>
        </p>

        <div className="reviews-shell">
          <ul
            ref={scrollerRef}
            className="reviews-track"
            onScroll={onScroll}
            aria-label="Patient review excerpts"
          >
            {HOME_REVIEWS.map((review) => (
              <li key={review.initials} className="reviews-slide">
                <blockquote className="review-card">
                  <StarRow />
                  <span className="sr-only">Five-star Google review. </span>
                  <p className="review-quote">{review.text}</p>
                  <footer className="review-meta">
                    <cite>{review.initials}</cite>
                    <span>
                      {review.familyMember ? "Family member · Google review" : "Google review"}
                    </span>
                  </footer>
                </blockquote>
              </li>
            ))}
          </ul>

          <div className="reviews-controls">
            <button
              type="button"
              className="reviews-nav"
              aria-label="Previous reviews"
              disabled={page <= 0}
              onClick={() => scrollToPage(page - 1, true)}
            >
              Previous
            </button>
            <div className="reviews-dots" role="group" aria-label="Review pages">
              {Array.from({ length: pageCount }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Show reviews page ${index + 1}`}
                  aria-current={page === index ? "true" : undefined}
                  className={page === index ? "is-active" : undefined}
                  onClick={() => scrollToPage(index, true)}
                />
              ))}
            </div>
            <button
              type="button"
              className="reviews-nav"
              aria-label="Next reviews"
              disabled={page >= pageCount - 1}
              onClick={() => scrollToPage(page + 1, true)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
