"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LANDING_NAV } from "@/lib/nav";
import { IMG_SIZES } from "@/lib/image-sizes";
import { MEDIA } from "@/lib/media";
import { SITE } from "@/lib/site";

export function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E7E2DA] bg-white">
      <div className="nl-wrap flex items-center justify-between gap-4 py-3">
        <Link
          href="/neurolinks-psychiatry-nanaimo-bc/"
          className="flex items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3260eb]"
        >
          <Image
            src={MEDIA.landingLogo}
            alt=""
            width={48}
            height={48}
            priority
            sizes={IMG_SIZES.landingLogo}
          />
          <span className="font-serif text-lg font-bold text-[#1a2744]">NeuroLinks</span>
        </Link>
        <nav className="hidden md:block" aria-label="Landing">
          <ul className="flex flex-wrap items-center gap-6 text-sm font-medium text-[#1a2744]">
            {LANDING_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  className="hover:text-[#3260eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3260eb]"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <a
          className="hidden text-sm font-semibold text-[#3260eb] sm:inline"
          href={SITE.phoneHref}
        >
          {SITE.phone}
        </a>
        <button
          type="button"
          className="inline-flex items-center rounded border border-slate-300 px-3 py-2 text-sm md:hidden"
          aria-expanded={open}
          aria-controls="landing-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </div>
      {open ? (
        <nav
          id="landing-mobile-nav"
          className="border-t border-slate-200 px-4 py-3 md:hidden"
          aria-label="Landing mobile"
        >
          <ul className="flex flex-col gap-2 text-sm font-medium">
            {LANDING_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={SITE.phoneHref}>{SITE.phone}</a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
