import Image from "next/image";
import Link from "next/link";
import { DESKTOP_NAV, NAV_ITEMS } from "@/lib/nav";
import { IMG_SIZES } from "@/lib/image-sizes";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--nl-navy)]/10 bg-[var(--nl-white)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <Link href="/" className="shrink-0" aria-label="NeuroLinks home">
          <Image
            src={SITE.logo}
            alt="NeuroLinks"
            width={250}
            height={50}
            priority
            sizes={IMG_SIZES.logo}
            className="h-8 w-auto md:h-9"
          />
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
          <summary className="flex min-h-10 cursor-pointer list-none items-center rounded-sm border border-[var(--nl-navy)]/20 px-3 py-1.5 text-sm marker:content-none [&::-webkit-details-marker]:hidden">
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
