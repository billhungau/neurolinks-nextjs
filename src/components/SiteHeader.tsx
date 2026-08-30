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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="shrink-0" aria-label="NeuroLinks home">
          <Image
            src={SITE.logo}
            alt="NeuroLinks"
            width={250}
            height={50}
            priority
            sizes={IMG_SIZES.logo}
            className="h-10 w-auto"
          />
        </Link>
        <nav className="hidden lg:block" aria-label="Primary">
          <ul className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm font-medium text-slate-800">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link className="hover:text-[#3260eb]" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded border border-slate-300 px-3 py-2 text-sm lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </div>
      {open ? (
        <nav id="mobile-nav" className="border-t border-slate-200 px-4 py-3 lg:hidden" aria-label="Mobile">
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
