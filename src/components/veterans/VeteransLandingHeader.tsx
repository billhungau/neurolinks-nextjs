"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

const SCROLL_SOLID_AT = 40;

export function VeteransLandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY >= SCROLL_SOLID_AT);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={`vtms-header landing-header ${scrolled ? "vtms-header--solid" : "vtms-header--transparent"}`}
    >
      <div className="vtms-wrap vtms-header-inner landing-header-bar">
        <Link href="/" className="vtms-logo-link" aria-label="NeuroLinks home">
          <Image
            src={SITE.logoWhite}
            alt="NeuroLinks"
            width={230}
            height={46}
            priority
            className="vtms-logo"
          />
        </Link>
        <div className="vtms-header-actions">
          <a href={SITE.phoneHref} className="vtms-phone">
            <span className="vtms-phone-desktop">Call {SITE.phone}</span>
            <span className="vtms-phone-mobile">Call clinic</span>
          </a>
          <a href="#inquiry" className="vtms-button vtms-button-small">Check VAC Coverage</a>
        </div>
      </div>
    </header>
  );
}
