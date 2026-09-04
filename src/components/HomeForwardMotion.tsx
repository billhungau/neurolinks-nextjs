"use client";

import { useLayoutEffect, useRef } from "react";

/** Fail-open so nodes are never left hidden if the observer does not fire. */
export const HOME_FORWARD_FALLBACK_MS = 1600;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HomeForwardMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (prefersReducedMotion()) return undefined;
    if (typeof IntersectionObserver === "undefined") return undefined;

    let played = false;
    node.classList.add("home-forward-track--prepare");

    const finish = (animate: boolean) => {
      if (played) return;
      played = true;
      if (animate) {
        node.classList.add("home-forward-track--play");
      } else {
        node.classList.remove("home-forward-track--prepare");
      }
      observer.disconnect();
      window.clearTimeout(fallback);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) finish(true);
      },
      { threshold: 0.08, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);

    const onHash = () => {
      const id = window.location.hash.replace("#", "");
      if (!id) return;
      const target = document.getElementById(id);
      const section = node.closest(".home-forward");
      if (
        target &&
        section &&
        (section === target || section.contains(target) || target.contains(section))
      ) {
        finish(true);
      }
    };
    onHash();
    window.addEventListener("hashchange", onHash);

    const fallback = window.setTimeout(() => finish(false), HOME_FORWARD_FALLBACK_MS);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", onHash);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div ref={ref} className="home-forward-track">
      {children}
    </div>
  );
}
