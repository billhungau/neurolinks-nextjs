import Image from "next/image";
import Link from "next/link";
import { IMG_SIZES } from "@/lib/image-sizes";
import { SITE } from "@/lib/site";

const INQUIRY_HREF = "#inquiry";

export function LandingHeader() {
  return (
    <header className="landing-header site-header site-header--solid sticky top-0 z-50 border-b border-white/10 bg-[var(--nl-navy)]/90 text-white shadow-[0_1px_0_rgba(0,0,0,0.16)] backdrop-blur-md">
      <div className="nl-wrap site-header-bar landing-header-bar relative z-10">
        <Link
          href="/neurolinks-psychiatry-nanaimo-bc/"
          className="site-header-logo"
          aria-label="NeuroLinks"
        >
          <Image
            src={SITE.logoWhite}
            alt="NeuroLinks"
            width={250}
            height={50}
            priority
            sizes={IMG_SIZES.logo}
            className="site-header-logo-img"
          />
        </Link>
        <div className="landing-header-actions">
          <Link className="landing-header-about" href="/psychiatrist-tms-nanaimo/">
            About Us
          </Link>
          <a className="landing-header-phone" href={SITE.phoneHref}>
            {SITE.phone}
          </a>
          <a className="landing-header-cta" href={INQUIRY_HREF}>
            Ask about treatment options
          </a>
        </div>
      </div>
    </header>
  );
}
