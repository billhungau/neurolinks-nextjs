"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { DESKTOP_NAV, NAV_ITEMS } from "@/lib/nav";
import { IMG_SIZES } from "@/lib/image-sizes";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const overlay = pathname === "/";
  const [heroGone, setHeroGone] = useState(false);
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const menuId = useId();
  const solid = !overlay || heroGone;

  useEffect(() => {
    if (!overlay) return undefined;

    const hero = document.getElementById("home-hero");
    if (!hero) return undefined;

    const update = () => {
      // Go solid while the hero still fills the bar, so the white wordmark never
      // sits on the pale section sliding up underneath it.
      const clearance = (barRef.current?.offsetHeight ?? 56) + 72;
      setHeroGone(hero.getBoundingClientRect().bottom <= clearance);
    };

    const frame = window.requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [overlay]);

  useEffect(() => {
    if (!open) return undefined;

    const firstLink = panelRef.current?.querySelector("a");
    firstLink?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const overHero = overlay && !solid;
  const headerTone = overHero
    ? "border-transparent bg-transparent text-white"
    : "border-[var(--nl-navy)]/10 bg-[var(--nl-white)]/95 text-[var(--nl-navy)] shadow-[0_1px_0_rgba(26,39,68,0.06)] backdrop-blur-sm";

  return (
    <header
      ref={barRef}
      className={`${overlay ? "fixed" : "sticky"} top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow,color] duration-200 ease-out ${headerTone}`}
    >
      <div
        className={`mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 md:h-16 ${
          overHero ? "px-5 md:px-4" : "px-4"
        }`}
      >
        <Link
          href="/"
          className="shrink-0"
          aria-label="NeuroLinks home"
          onClick={() => setOpen(false)}
        >
          <Image
            src={overHero ? SITE.logoWhite : SITE.logo}
            alt="NeuroLinks"
            width={250}
            height={50}
            priority
            sizes={IMG_SIZES.logo}
            className={
              overHero ? "h-auto w-[155px] md:h-9 md:w-auto" : "h-8 w-auto md:h-9"
            }
          />
        </Link>
        <nav className="hidden min-w-0 flex-1 lg:block" aria-label="Primary">
          <ul
            className={`flex flex-nowrap items-center justify-end gap-x-3 text-[0.75rem] font-medium tracking-wide xl:gap-x-5 xl:text-[0.8rem] ${
              overHero ? "text-white" : "text-[var(--nl-navy)]"
            }`}
          >
            {DESKTOP_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  className={`underline-offset-4 transition-colors hover:underline ${
                    overHero ? "hover:text-white" : "hover:text-[var(--nl-blue)]"
                  }`}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          href="/contact/"
          className="hidden min-h-9 shrink-0 items-center rounded-sm bg-[var(--nl-yellow)] px-3.5 text-sm font-semibold text-[var(--nl-navy)] sm:inline-flex"
        >
          Contact
        </Link>
        <button
          ref={buttonRef}
          type="button"
          className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border font-medium lg:hidden ${
            overHero
              ? "border-white/40 px-2.5 text-[13px] text-white"
              : "border-[var(--nl-navy)]/20 px-3 text-sm text-[var(--nl-navy)]"
          }`}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
      </div>
      {open ? (
        <nav
          ref={panelRef}
          id={menuId}
          className="border-t border-[var(--nl-navy)]/10 bg-white px-4 py-3 text-[var(--nl-navy)] lg:hidden"
          aria-label="Mobile"
        >
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 text-sm font-medium">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  className="flex min-h-10 items-center"
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
