"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import { anchorScrollTarget, samePageHashId } from "@/lib/anchor-target";

const GAP_PX = 16;
const INSTANT_SCROLL_CLASS = "nl-instant-scroll";

function withInstantScroll(fn: () => void) {
  const root = document.documentElement;
  root.classList.add(INSTANT_SCROLL_CLASS);
  // Match Next.js: Chrome will not pick up scroll-behavior: auto without a layout.
  void root.getClientRects();
  fn();
}

function enableSamePageSmoothScroll() {
  const root = document.documentElement;
  root.setAttribute("data-nl-smooth-scroll", "");
  root.setAttribute("data-scroll-behavior", "smooth");
  // Unlock on the following frame so this restore's scrollIntoView stays instant.
  requestAnimationFrame(() => {
    root.classList.remove(INSTANT_SCROLL_CLASS);
  });
}

function currentHashId() {
  const raw = window.location.hash;
  if (!raw || raw === "#") return "";
  try {
    return decodeURIComponent(raw.slice(1));
  } catch {
    return "";
  }
}

function isShown(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  return el.getClientRects().length > 0;
}

function headerChromeHeight(): number {
  const siteHeader = document.querySelector<HTMLElement>("header.site-header");
  const landingHeader = document.querySelector<HTMLElement>("header.landing-header");
  const header = isShown(siteHeader) ? siteHeader : isShown(landingHeader) ? landingHeader : null;
  if (!header) return 0;

  const bar =
    header.querySelector<HTMLElement>(".site-header-bar") ??
    header.querySelector<HTMLElement>(".landing-header-bar");
  const expandedControl = header.querySelector<HTMLElement>("[aria-expanded='true']");
  const openPanel = header.querySelector<HTMLElement>(
    ".site-header-panel, .landing-header-panel, #landing-mobile-nav",
  );
  const menuOpen = Boolean(expandedControl) && isShown(openPanel);

  if (menuOpen && bar && isShown(bar)) {
    const border = Number.parseFloat(getComputedStyle(header).borderBottomWidth) || 0;
    return bar.getBoundingClientRect().height + border;
  }

  return header.getBoundingClientRect().height;
}

function subnavHeight(): number {
  const nav = document.querySelector<HTMLElement>(".tms-subnav");
  if (!isShown(nav)) return 0;
  return nav.getBoundingClientRect().height;
}

function applyAnchorOffset() {
  const root = document.documentElement;
  const header = headerChromeHeight();
  const nav = document.querySelector(".tms-subnav");
  root.style.setProperty("--nl-header-height", `${header}px`);
  root.style.setProperty("--nl-anchor-gap", `${GAP_PX}px`);
  if (!nav) {
    root.style.setProperty("--nl-subnav-height", "0px");
    return;
  }
  if (isShown(nav)) {
    root.style.setProperty("--nl-subnav-height", `${subnavHeight()}px`);
  }
}

function markHashTarget(id: string) {
  document.querySelectorAll(".nl-hash-target").forEach((node) => {
    node.classList.remove("nl-hash-target");
  });
  document.getElementById(id)?.classList.add("nl-hash-target");
}

function scrollToHashId(id: string) {
  markHashTarget(id);
  const target = anchorScrollTarget(document.getElementById(id));
  if (!target) return;
  void target.getBoundingClientRect();
  target.scrollIntoView({ block: "start", inline: "nearest" });
}

function scrollToCurrentHash() {
  const id = currentHashId();
  if (!id) return;
  scrollToHashId(id);
}

function isModifiedClick(event: MouseEvent) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function restoreHashPosition() {
  withInstantScroll(() => {
    applyAnchorOffset();
    scrollToCurrentHash();
  });
}

export function AnchorOffset() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    document.documentElement.classList.add(INSTANT_SCROLL_CLASS);
    applyAnchorOffset();
    scrollToCurrentHash();

    const observed = [
      document.querySelector("header.site-header"),
      document.querySelector("header.site-header .site-header-bar"),
      document.querySelector("header.landing-header"),
      document.querySelector("header.landing-header .landing-header-bar"),
      document.querySelector(".tms-subnav"),
    ].filter((node): node is Element => Boolean(node));

    const observer = new ResizeObserver(() => {
      applyAnchorOffset();
    });
    observed.forEach((node) => observer.observe(node));

    const onViewport = () => applyAnchorOffset();
    window.addEventListener("resize", onViewport);
    window.visualViewport?.addEventListener("resize", onViewport);
    document.fonts?.ready.then(applyAnchorOffset).catch(() => undefined);

    return () => {
      document.documentElement.classList.add(INSTANT_SCROLL_CLASS);
      observer.disconnect();
      window.removeEventListener("resize", onViewport);
      window.visualViewport?.removeEventListener("resize", onViewport);
    };
  }, [pathname]);

  useEffect(() => {
    restoreHashPosition();

    const onHashChange = () => {
      const id = currentHashId();
      if (!id || id === "main-content") return;
      restoreHashPosition();
      requestAnimationFrame(() => {
        document.documentElement.classList.remove(INSTANT_SCROLL_CLASS);
      });
    };
    const onHistoryRestore = () => {
      restoreHashPosition();
      requestAnimationFrame(() => {
        document.documentElement.classList.remove(INSTANT_SCROLL_CLASS);
      });
    };
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHistoryRestore);
    window.addEventListener("pageshow", onHistoryRestore);

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target && link.target !== "_self") return;
      const id = samePageHashId(link.getAttribute("href") ?? "", pathname, window.location.search);
      if (!id || id === "main-content") return;
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      applyAnchorOffset();
      if (window.location.hash !== `#${id}`) {
        history.pushState(null, "", `#${id}`);
      }
      // :target skips reveal translateY; force a layout so scroll-margin
      // uses the untransformed heading position.
      void target.getBoundingClientRect();
      // Native CSS scroll-behavior: smooth applies; do not also pass behavior.
      scrollToHashId(id);
    };
    document.addEventListener("click", onClick, true);

    // Next.js hydrates with hashFragment: null, then may focus/scroll the
    // target without CSS scroll-margin. One follow-up frame after paint is
    // enough to re-apply native scrollIntoView; do not keep re-scrolling.
    let frame2 = 0;
    const frame1 = window.requestAnimationFrame(() => {
      frame2 = window.requestAnimationFrame(() => {
        restoreHashPosition();
        enableSamePageSmoothScroll();
      });
    });

    return () => {
      document.documentElement.classList.add(INSTANT_SCROLL_CLASS);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHistoryRestore);
      window.removeEventListener("pageshow", onHistoryRestore);
      document.removeEventListener("click", onClick, true);
      window.cancelAnimationFrame(frame1);
      window.cancelAnimationFrame(frame2);
    };
  }, [pathname]);

  return null;
}
