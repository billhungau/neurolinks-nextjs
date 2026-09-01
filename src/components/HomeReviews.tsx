"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { HOME_REVIEWS, reviewRange, reviewStatusText } from "@/content/home-reviews";
import { SITE } from "@/lib/site";
import { TextLink } from "./TextLink";

const TOTAL = HOME_REVIEWS.length;

function pageSizeFromWidth(width: number) {
  if (width >= 1024) return 3;
  if (width >= 768) return 2;
  return 1;
}

function navLabel(direction: "previous" | "next", pageSize: number) {
  const noun = pageSize === 1 ? "review" : "reviews";
  return direction === "previous" ? `Previous ${noun}` : `Next ${noun}`;
}

function slideStride(root: HTMLElement) {
  const slide = root.querySelector<HTMLElement>(".reviews-slide");
  if (!slide) return root.clientWidth;
  const styles = getComputedStyle(root);
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
  return slide.getBoundingClientRect().width + gap;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  const pageCount = Math.ceil(TOTAL / pageSize);
  const safePage = Math.min(page, pageCount - 1);
  const { start, end } = reviewRange(safePage, pageSize, TOTAL);
  const status = reviewStatusText(safePage, pageSize, TOTAL);
  const statusId = useId();
  const trackId = useId();

  useEffect(() => {
    const update = () => setPageSize(pageSizeFromWidth(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const goTo = useCallback(
    (next: number, smooth: boolean) => {
      const root = scrollerRef.current;
      if (!root) return;
      const bounded = Math.max(0, Math.min(next, Math.ceil(TOTAL / pageSize) - 1));
      const slides = root.querySelectorAll<HTMLElement>(".reviews-slide");
      const target = slides[bounded * pageSize];
      const left = target
        ? target.getBoundingClientRect().left - root.getBoundingClientRect().left + root.scrollLeft
        : bounded * pageSize * slideStride(root);
      const useSmooth = smooth && pageSize === 1 && !prefersReducedMotion();
      if (!useSmooth) {
        root.scrollLeft = left;
      } else {
        root.scrollTo({ left, behavior: "smooth" });
      }
      setPage(bounded);
    },
    [pageSize],
  );

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const syncFromScroll = () => {
      const stride = Math.max(slideStride(root) * pageSize, 1);
      const next = Math.round(root.scrollLeft / stride);
      const bounded = Math.max(0, Math.min(next, Math.ceil(TOTAL / pageSize) - 1));
      setPage((current) => (current === bounded ? current : bounded));
    };

    root.addEventListener("scroll", syncFromScroll, { passive: true });
    return () => root.removeEventListener("scroll", syncFromScroll);
  }, [pageSize]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    root.scrollLeft = Math.min(page, Math.ceil(TOTAL / pageSize) - 1) * pageSize * slideStride(root);
    // Align only when the visible page size changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- navigation already moves the track
  }, [pageSize]);

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

        <div className="reviews-shell" role="region" aria-roledescription="carousel" aria-labelledby="home-reviews-heading">
          <ul id={trackId} ref={scrollerRef} className="reviews-track" aria-label="Patient review excerpts">
            {HOME_REVIEWS.map((review, index) => {
              const visible = index >= start - 1 && index <= end - 1;
              return (
                <li
                  key={review.initials}
                  className="reviews-slide"
                  aria-hidden={visible ? undefined : true}
                >
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
              );
            })}
            {Array.from({ length: (pageSize - (TOTAL % pageSize)) % pageSize }, (_, index) => (
              <li key={`spacer-${index}`} className="reviews-slide reviews-spacer" aria-hidden="true" />
            ))}
          </ul>

          <div className="reviews-controls">
            <button
              type="button"
              className="reviews-nav"
              aria-label={navLabel("previous", pageSize)}
              aria-controls={trackId}
              aria-describedby={statusId}
              disabled={safePage <= 0}
              onClick={() => goTo(safePage - 1, true)}
            >
              Previous
            </button>
            <p className="reviews-status" id={statusId} aria-live="polite" aria-atomic="true">
              {status}
            </p>
            <button
              type="button"
              className="reviews-nav"
              aria-label={navLabel("next", pageSize)}
              aria-controls={trackId}
              aria-describedby={statusId}
              disabled={safePage >= pageCount - 1}
              onClick={() => goTo(safePage + 1, true)}
            >
              Next
            </button>
            <div className="reviews-dots" role="group" aria-label="Review pages">
              {Array.from({ length: pageCount }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={reviewStatusText(index, pageSize, TOTAL)}
                  aria-current={safePage === index ? "true" : undefined}
                  aria-controls={trackId}
                  className={safePage === index ? "is-active" : undefined}
                  onClick={() => goTo(index, true)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
