"use client";

import { useLayoutEffect, useRef, useState } from "react";

/** Fail-open if the observer never fires so essential copy is not left hidden. */
export const REVEAL_FALLBACK_MS = 1200;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isInOrPastView(node: Element) {
  const rect = node.getBoundingClientRect();
  return rect.top < window.innerHeight + 80 && rect.bottom > 0;
}

export function Reveal({
  children,
  className = "",
  delayMs = 0,
  as: Comp = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  as?: "div" | "li";
}) {
  const ref = useRef<HTMLDivElement | HTMLLIElement>(null);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const reveal = () => setVisible(true);

    if (prefersReducedMotion()) {
      reveal();
      return undefined;
    }

    if (typeof IntersectionObserver === "undefined" || isInOrPastView(node)) {
      reveal();
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);

    const onHash = () => {
      const id = window.location.hash.replace("#", "");
      if (!id) return;
      const target = document.getElementById(id);
      if (target && (node === target || node.contains(target) || target.contains(node))) {
        reveal();
      }
    };
    onHash();
    window.addEventListener("hashchange", onHash);

    const revealIfPast = () => {
      if (node.getBoundingClientRect().bottom < 0) reveal();
    };
    window.addEventListener("scroll", revealIfPast, { passive: true });
    window.addEventListener("pageshow", revealIfPast);

    const fallback = window.setTimeout(reveal, REVEAL_FALLBACK_MS);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("scroll", revealIfPast);
      window.removeEventListener("pageshow", revealIfPast);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <Comp
      ref={ref as never}
      className={`reveal${visible ? " is-visible" : ""} ${className}`.trim()}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Comp>
  );
}
