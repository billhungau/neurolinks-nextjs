"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import { anchorScrollTarget, samePageHashId } from "@/lib/anchor-target";

const GAP_PX = 16;

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
  const openPanel = header.querySelector<HTMLElement>(".site-header-panel, #landing-mobile-nav");
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

function scrollToHashId(id: string) {
  const target = anchorScrollTarget(document.getElementById(id));
  target?.scrollIntoView({ block: "start", inline: "nearest" });
}

function scrollToCurrentHash() {
  const raw = window.location.hash;
  if (!raw || raw === "#") return;
  let id = raw.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    return;
  }
  scrollToHashId(id);
}

function isModifiedClick(event: MouseEvent) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function restoreHashPosition() {
  applyAnchorOffset();
  scrollToCurrentHash();
}

export function AnchorOffset() {
  const pathname = usePathname();

  useLayoutEffect(() => {
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
      observer.disconnect();
      window.removeEventListener("resize", onViewport);
      window.visualViewport?.removeEventListener("resize", onViewport);
    };
  }, [pathname]);

  useEffect(() => {
    restoreHashPosition();

    const onHash = () => restoreHashPosition();
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);
    window.addEventListener("pageshow", onHash);

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
      scrollToHashId(id);
    };
    document.addEventListener("click", onClick, true);

    // Next.js hydrates with hashFragment: null, then may focus/scroll the
    // target without CSS scroll-margin. One follow-up frame after paint is
    // enough to re-apply native scrollIntoView; do not keep re-scrolling.
    let frame2 = 0;
    const frame1 = window.requestAnimationFrame(() => {
      frame2 = window.requestAnimationFrame(restoreHashPosition);
    });

    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
      window.removeEventListener("pageshow", onHash);
      document.removeEventListener("click", onClick, true);
      window.cancelAnimationFrame(frame1);
      window.cancelAnimationFrame(frame2);
    };
  }, [pathname]);

  return null;
}
