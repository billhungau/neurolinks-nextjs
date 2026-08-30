"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DESKTOP_NAV, NAV_ITEMS } from "@/lib/nav";
import { IMG_SIZES } from "@/lib/image-sizes";
import { MEDIA } from "@/lib/media";
import { SITE } from "@/lib/site";

/** Element the overlay header floats over until it is scrolled past. */
export const OVERLAY_ANCHOR_ID = "home-hero";

type Props = {
  /**
   * Below `md`, float transparently over the hero photograph and switch to the
   * standard solid bar once the hero is scrolled past. Desktop is unaffected.
   */
  overlay?: boolean;
};

export function SiteHeader({ overlay = false }: Props) {
  const [scrolledPast, setScrolledPast] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const floating = overlay && !scrolledPast;

  useEffect(() => {
    if (!overlay) return;
    const anchor = document.getElementById(OVERLAY_ANCHOR_ID);
    const update = () => {
      const bar = ref.current?.offsetHeight ?? 60;
      // Turn solid before the light section below slides under the bar, so the
      // reversed wordmark never lands on a pale background mid-scroll.
      const limit = (anchor?.offsetHeight ?? 400) - bar - 72;
      setScrolledPast(window.scrollY > Math.max(limit, 48));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [overlay]);

  return (
    <header
      ref={ref}
      className={`z-50 transition-colors duration-200 md:sticky md:inset-x-auto md:top-0 md:border-b md:border-[var(--nl-navy)]/10 md:bg-[var(--nl-white)]/95 md:backdrop-blur-sm ${
        overlay ? "fixed inset-x-0 top-0" : "sticky top-0"
      } ${
        floating
          ? "border-b border-transparent bg-transparent"
          : "border-b border-[var(--nl-navy)]/10 bg-[var(--nl-white)]/95 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <Link href="/" className="relative shrink-0" aria-label="NeuroLinks home">
          <Image
            src={SITE.logo}
            alt="NeuroLinks"
            width={250}
            height={50}
            priority
            sizes={IMG_SIZES.logo}
            className={`w-auto transition-opacity duration-200 md:h-9 md:opacity-100 ${
              overlay ? "h-10" : "h-8"
            } ${floating ? "opacity-0" : "opacity-100"}`}
          />
          {overlay ? (
            <Image
              src={MEDIA.logoReversed}
              alt=""
              aria-hidden="true"
              width={250}
              height={50}
              priority
              sizes={IMG_SIZES.logo}
              className={`absolute top-0 left-0 h-10 w-auto transition-opacity duration-200 md:hidden ${
                floating ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : null}
        </Link>
        <nav className="hidden min-w-0 flex-1 lg:block" aria-label="Primary">
          <ul className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-[0.78rem] font-medium tracking-wide text-[var(--nl-navy)] xl:gap-x-5">
            {DESKTOP_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  className={`underline-offset-4 transition-colors hover:text-[var(--nl-blue)] hover:underline ${
                    item.href === "/physician-referral/"
                      ? "text-[var(--nl-blue)]"
                      : ""
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
        <details className="relative lg:hidden">
          <summary
            className={`flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-sm border px-3 text-sm transition-colors marker:content-none md:border-[var(--nl-navy)]/20 md:text-[var(--nl-navy)] [&::-webkit-details-marker]:hidden ${
              floating
                ? "border-white/60 bg-[var(--nl-navy)]/25 font-semibold text-white md:bg-transparent md:font-normal"
                : "border-[var(--nl-navy)]/20"
            }`}
          >
            Menu
          </summary>
          <nav
            className="absolute right-0 z-50 mt-2 w-56 border border-[var(--nl-navy)]/10 bg-white px-4 py-3 shadow-sm"
            aria-label="Mobile"
          >
            <ul className="flex flex-col gap-2 text-sm font-medium">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
