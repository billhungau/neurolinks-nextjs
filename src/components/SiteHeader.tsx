"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/nav";
import { IMG_SIZES } from "@/lib/image-sizes";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--nl-navy)]/10 bg-[var(--nl-white)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="shrink-0" aria-label="NeuroLinks home">
          <Image
            src={SITE.logo}
            alt="NeuroLinks"
            width={250}
            height={50}
            priority
            sizes={IMG_SIZES.logo}
            className="h-9 w-auto md:h-10"
          />
        </Link>
        <nav className="hidden lg:block" aria-label="Primary">
          <ul className="flex flex-wrap items-center justify-end gap-x-5 text-[0.8rem] font-medium tracking-wide text-[var(--nl-navy)]">
            {NAV_ITEMS.filter((item) => item.href !== "/").map((item) => (
              <li key={item.href}>
                <Link
                  className="underline-offset-4 transition-colors hover:text-[var(--nl-blue)] hover:underline"
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
          className="hidden min-h-10 items-center rounded-sm bg-[var(--nl-yellow)] px-4 text-sm font-semibold text-[var(--nl-navy)] sm:inline-flex"
        >
          Contact
        </Link>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-sm border border-[var(--nl-navy)]/20 px-3 py-2 text-sm lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </div>
      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-[var(--nl-navy)]/10 px-4 py-3 lg:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-2 text-sm font-medium">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)}>
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
