"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IMG_SIZES } from "@/lib/image-sizes";
import { SITE } from "@/lib/site";

const INQUIRY_HREF = "#inquiry";
const MENU_ID = "landing-mobile-nav";
const DESKTOP_NAV_MQ = "(min-width: 64rem)";

const SECTION_NAV = [
  { href: "#treatment", label: "Treatments" },
  { href: "#psychiatrist", label: "Your psychiatrist" },
  { href: "#faq", label: "FAQs" },
] as const;

function closeMenu(setOpen: (value: boolean) => void, button: HTMLButtonElement | null) {
  setOpen(false);
  button?.focus();
}

export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_NAV_MQ);
    const onViewport = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onViewport);
    return () => mq.removeEventListener("change", onViewport);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const firstLink = panelRef.current?.querySelector("a");
    firstLink?.focus();

    const isShown = (el: HTMLElement) => {
      if (el.hasAttribute("disabled") || el.getAttribute("aria-hidden") === "true") {
        return false;
      }
      return el.getClientRects().length > 0;
    };

    const focusables = () => {
      const nodes: HTMLElement[] = [];
      if (buttonRef.current) nodes.push(buttonRef.current);
      if (panelRef.current) {
        nodes.push(...panelRef.current.querySelectorAll<HTMLElement>("a[href], button"));
      }
      return nodes.filter(isShown);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu(setOpen, buttonRef.current);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (headerRef.current?.contains(target)) return;
      closeMenu(setOpen, buttonRef.current);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="landing-header site-header site-header--solid sticky top-0 z-50 border-b border-white/10 bg-[var(--nl-navy)]/90 text-white shadow-[0_1px_0_rgba(0,0,0,0.16)] backdrop-blur-md"
    >
      <div className="nl-wrap site-header-bar landing-header-bar relative z-10">
        <a className="site-header-logo landing-header-brand" href="#top" aria-label="NeuroLinks">
          <Image
            src={SITE.logoWhite}
            alt="NeuroLinks"
            width={250}
            height={50}
            priority
            sizes={IMG_SIZES.logo}
            className="site-header-logo-img"
          />
        </a>

        <nav className="landing-header-nav" aria-label="On this page">
          <ul>
            {SECTION_NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="landing-header-actions">
          <a className="landing-header-phone" href={SITE.phoneHref}>
            {SITE.phone}
          </a>
          <a className="landing-header-cta" href={INQUIRY_HREF}>
            Enquire
          </a>
          <button
            ref={buttonRef}
            type="button"
            className="landing-header-menu"
            aria-expanded={open}
            aria-controls={MENU_ID}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => (open ? closeMenu(setOpen, buttonRef.current) : setOpen(true))}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          ref={panelRef}
          id={MENU_ID}
          className="landing-header-panel"
          aria-label="Page sections"
        >
          <ul>
            {SECTION_NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a href={SITE.phoneHref} onClick={() => setOpen(false)}>
                Call the clinic
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
