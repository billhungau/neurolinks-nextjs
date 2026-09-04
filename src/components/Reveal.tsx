"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { shouldRevealImmediately } from "@/lib/motion-policy";

export { shouldRevealImmediately };

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isScrolledPast(node: Element) {
  return node.getBoundingClientRect().bottom < 0;
}

function targetsReveal(node: Element) {
  const id = window.location.hash.replace("#", "");
  if (!id) return false;
  const target = document.getElementById(id);
  return Boolean(target && (node === target || node.contains(target) || target.contains(node)));
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
    let frame = 0;
    const revealAfterPaint = () => {
      frame = window.requestAnimationFrame(() => {
        setVisible(true);
      });
    };

    if (
      shouldRevealImmediately({
        reducedMotion: prefersReducedMotion(),
        observerSupported: typeof IntersectionObserver !== "undefined",
      })
    ) {
      reveal();
      return undefined;
    }

    if (targetsReveal(node) || isScrolledPast(node)) {
      reveal();
      return undefined;
    }

    let observer: IntersectionObserver;
    try {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          revealAfterPaint();
          observer.disconnect();
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );
    } catch {
      reveal();
      return undefined;
    }

    observer.observe(node);

    const onHash = () => {
      if (targetsReveal(node)) reveal();
    };
    window.addEventListener("hashchange", onHash);

    const revealIfPast = () => {
      if (isScrolledPast(node)) reveal();
    };
    window.addEventListener("scroll", revealIfPast, { passive: true });
    window.addEventListener("pageshow", revealIfPast);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("scroll", revealIfPast);
      window.removeEventListener("pageshow", revealIfPast);
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
