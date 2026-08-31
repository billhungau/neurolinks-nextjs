"use client";

import { useLayoutEffect, useRef, useState } from "react";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isInView(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  return rect.top < window.innerHeight + 24 && rect.bottom > -24;
}

export function Reveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const reveal = () => {
      setPending(false);
      setVisible(true);
    };

    if (prefersReducedMotion() || isInView(node)) {
      reveal();
      return undefined;
    }

    setPending(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: "80px 0px 80px 0px" },
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

    const onPageShow = () => {
      if (isInView(node)) reveal();
    };
    window.addEventListener("pageshow", onPageShow);

    const fallback = window.setTimeout(reveal, 1600);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("pageshow", onPageShow);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${pending ? " reveal-pending" : ""}${visible ? " is-visible" : ""} ${className}`.trim()}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
