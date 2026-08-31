"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { CONTACT_NAV, PRIMARY_NAV, isActivePath } from "@/lib/nav";
import { IMG_SIZES } from "@/lib/image-sizes";
import { SITE } from "@/lib/site";

const SCROLL_SOLID_AT = 40;

function overlayHeroId(pathname: string) {
  const path = pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (path === "/") return "home-hero";
  if (path === "/about-tms-treatment-on-psychiatric-illness") return "tms-hero";
  if (path === "/ketamine-treatment-resistant-depression-nanaimo") return "ket-hero";
  if (path === "/services-psychiatric-tms-ketamine-treatment") return "svc-hero";
  if (path === "/psychiatrist-tms-nanaimo") return "about-hero";
  if (path === "/physician-referral") return "referral-hero";
  if (path === "/contact") return "contact-hero";
  return null;
}

function closeMenu(setOpen: (value: boolean) => void, button: HTMLButtonElement | null) {
  setOpen(false);
  button?.focus();
}

export function SiteHeader() {
  const pathname = usePathname();
  const heroId = overlayHeroId(pathname);
  const overlay = Boolean(heroId);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }
  const barRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const menuId = useId();
  const solid = !overlay || scrolled || open;
  const overHero = overlay && !solid;

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY >= SCROLL_SOLID_AT);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const firstLink = panelRef.current?.querySelector("a");
    firstLink?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () => {
      const root = barRef.current;
      if (!root) return [];
      return [...root.querySelectorAll<HTMLElement>("a[href], button")].filter(
        (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
      );
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
      if (barRef.current?.contains(target)) return;
      closeMenu(setOpen, buttonRef.current);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const headerTone = overHero
    ? "site-header--transparent border-transparent bg-transparent text-white"
    : "site-header--solid border-white/10 bg-[var(--nl-navy)]/90 text-white shadow-[0_1px_0_rgba(0,0,0,0.16)] backdrop-blur-md";

  return (
    <header
      ref={barRef}
      className={`site-header ${overlay ? "fixed" : "sticky"} top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow,color] duration-200 ease-out ${headerTone}`}
    >
      {overHero ? <div className="site-header-wash" aria-hidden="true" /> : null}
      <div className="relative z-10 mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5 md:h-16 md:px-4">
        <Link
          href="/"
          className="shrink-0"
          aria-label="NeuroLinks home"
          onClick={() => setOpen(false)}
        >
          <Image
            src={SITE.logoWhite}
            alt="NeuroLinks"
            width={250}
            height={50}
            priority
            sizes={IMG_SIZES.logo}
            className="h-8 w-auto md:h-9"
          />
        </Link>
        <nav className="hidden min-w-0 flex-1 lg:block" aria-label="Primary">
          <ul className="flex flex-nowrap items-center justify-end gap-x-3.5 text-[13px] font-medium tracking-[0.01em] text-white xl:gap-x-5 xl:text-[14px]">
            {PRIMARY_NAV.map((item) => {
              const current = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    className="site-nav-link"
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Link
          href={CONTACT_NAV.href}
          className={`site-nav-contact hidden min-h-9 shrink-0 items-center rounded-sm bg-[var(--nl-yellow)] px-3.5 text-sm font-semibold text-[var(--nl-navy)] lg:inline-flex ${
            isActivePath(pathname, CONTACT_NAV.href) ? "is-current" : ""
          }`}
          aria-current={isActivePath(pathname, CONTACT_NAV.href) ? "page" : undefined}
        >
          {CONTACT_NAV.label}
        </Link>
        <button
          ref={buttonRef}
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-white/40 px-2.5 text-[13px] font-medium text-white lg:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() =>
            open ? closeMenu(setOpen, buttonRef.current) : setOpen(true)
          }
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open ? (
        <>
          <div
            className="site-header-backdrop lg:hidden"
            aria-hidden="true"
            onClick={() => closeMenu(setOpen, buttonRef.current)}
          />
          <nav
            ref={panelRef}
            id={menuId}
            className="site-header-panel relative z-10 lg:hidden"
            aria-label="Mobile"
          >
            <ul className="mx-auto flex max-w-6xl flex-col gap-0.5 px-4 pt-3 pb-5">
              {PRIMARY_NAV.map((item) => {
                const current = isActivePath(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      className="site-nav-link site-nav-link--mobile"
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <a
                  className="site-nav-directions"
                  href={SITE.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get directions to NeuroLinks (opens in Google Maps)"
                  onClick={() => setOpen(false)}
                >
                  Get directions
                </a>
              </li>
              <li className="pt-2">
                <Link
                  className={`site-nav-contact site-nav-contact--mobile ${
                    isActivePath(pathname, CONTACT_NAV.href) ? "is-current" : ""
                  }`}
                  href={CONTACT_NAV.href}
                  aria-current={isActivePath(pathname, CONTACT_NAV.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {CONTACT_NAV.label}
                </Link>
              </li>
            </ul>
          </nav>
        </>
      ) : null}
    </header>
  );
}
