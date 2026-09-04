"use client";

import { useLayoutEffect, useRef } from "react";
import {
  PATHWAY_DESKTOP_MQ,
  PATHWAY_DESKTOP_OBSERVER,
  PATHWAY_MOBILE_OBSERVER,
  shouldSkipPathwayPrepare,
} from "@/lib/motion-policy";

export {
  PATHWAY_DESKTOP_MQ,
  PATHWAY_DESKTOP_OBSERVER,
  PATHWAY_MOBILE_OBSERVER,
  shouldSkipPathwayPrepare,
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function sectionTargetsHash(node: Element) {
  const id = window.location.hash.replace("#", "");
  if (!id) return false;
  const target = document.getElementById(id);
  const section = node.closest(".home-forward");
  return Boolean(
    target &&
      section &&
      (section === target || section.contains(target) || target.contains(section)),
  );
}

export function HomeForwardMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (
      shouldSkipPathwayPrepare({
        reducedMotion: prefersReducedMotion(),
        observerSupported: typeof IntersectionObserver !== "undefined",
      })
    ) {
      return undefined;
    }

    const items = Array.from(node.querySelectorAll<HTMLElement>(".home-forward-item"));
    const desktopMq = window.matchMedia(PATHWAY_DESKTOP_MQ);

    let observer: IntersectionObserver | null = null;
    let completed = false;
    let frame = 0;

    const disconnect = () => {
      observer?.disconnect();
      observer = null;
    };

    const failOpen = () => {
      completed = true;
      disconnect();
      node.classList.remove("home-forward-track--prepare");
      items.forEach((item) => item.classList.add("home-forward-item--play"));
    };

    const playDesktop = () => {
      if (completed) return;
      completed = true;
      disconnect();
      frame = window.requestAnimationFrame(() => {
        node.classList.add("home-forward-track--play");
      });
    };

    const attach = () => {
      disconnect();
      if (completed) return;

      try {
        if (desktopMq.matches) {
          observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) playDesktop();
          }, PATHWAY_DESKTOP_OBSERVER);
          observer.observe(node);
        } else {
          observer = new IntersectionObserver((entries, obs) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              entry.target.classList.add("home-forward-item--play");
              obs.unobserve(entry.target);
            }
          }, PATHWAY_MOBILE_OBSERVER);
          items.forEach((item) => observer?.observe(item));
        }
      } catch {
        failOpen();
      }
    };

    node.classList.add("home-forward-track--prepare");
    attach();

    if (!observer && !completed) {
      failOpen();
      return undefined;
    }

    const onHash = () => {
      if (sectionTargetsHash(node)) failOpen();
    };
    onHash();

    if (completed) {
      return undefined;
    }

    window.addEventListener("hashchange", onHash);

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) failOpen();
    };
    window.addEventListener("pageshow", onPageShow);

    const onMq = () => {
      if (
        completed ||
        items.some((item) => item.classList.contains("home-forward-item--play"))
      ) {
        failOpen();
        return;
      }
      attach();
    };
    if (typeof desktopMq.addEventListener === "function") {
      desktopMq.addEventListener("change", onMq);
    } else {
      desktopMq.addListener(onMq);
    }

    return () => {
      disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("pageshow", onPageShow);
      if (typeof desktopMq.removeEventListener === "function") {
        desktopMq.removeEventListener("change", onMq);
      } else {
        desktopMq.removeListener(onMq);
      }
    };
  }, []);

  return (
    <div ref={ref} className="home-forward-track">
      {children}
    </div>
  );
}
