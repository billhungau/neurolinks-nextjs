import Image from "next/image";
import Link from "next/link";
import { footerQuickLinks, FOOTER_TREATMENTS } from "@/lib/nav";
import { IMG_SIZES } from "@/lib/image-sizes";
import { SITE } from "@/lib/site";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M14.5 8.25H16.5V5h-2c-2.35 0-4 1.52-4 4.15V11H8.5v3.25H10.5V21h3.25v-6.75H16.2l.8-3.25h-3.25V9.28c0-.62.28-1.03 1-1.03Z"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 8.35A3.65 3.65 0 1 0 12 15.65 3.65 3.65 0 0 0 12 8.35Zm0 6A2.35 2.35 0 1 1 12 9.65a2.35 2.35 0 0 1 0 4.7Z"
      />
      <path
        fill="currentColor"
        d="M17.15 7.2a1.05 1.05 0 1 1-2.1 0 1.05 1.05 0 0 1 2.1 0Z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M7.4 3.75h9.2A3.65 3.65 0 0 1 20.25 7.4v9.2a3.65 3.65 0 0 1-3.65 3.65H7.4A3.65 3.65 0 0 1 3.75 16.6V7.4A3.65 3.65 0 0 1 7.4 3.75Zm9.2 1.3H7.4A2.35 2.35 0 0 0 5.05 7.4v9.2A2.35 2.35 0 0 0 7.4 18.95h9.2a2.35 2.35 0 0 0 2.35-2.35V7.4a2.35 2.35 0 0 0-2.35-2.35Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer mt-auto">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <Link href="/" className="site-footer-logo" aria-label="NeuroLinks home">
              <Image
                src={SITE.logoWhite}
                alt="NeuroLinks"
                width={810}
                height={162}
                sizes={IMG_SIZES.footerLogo}
                className="h-auto w-[162px]"
              />
            </Link>
            <p className="site-footer-tagline">
              Specialist care for treatment-resistant mental health conditions in Nanaimo, BC.
            </p>
          </div>

          <div>
            <p className="site-footer-heading">Clinic</p>
            <address className="site-footer-clinic">
              <a
                className="site-footer-contact"
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NeuroLinks at 202-6010 Brickyard Road, Nanaimo (opens in Google Maps)"
              >
                {SITE.addressLine}
              </a>
              <a className="site-footer-contact" href={SITE.phoneHref}>
                {SITE.phone}
              </a>
              <a className="site-footer-contact" href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>
            </address>
          </div>

          <nav aria-label="Treatments">
            <p className="site-footer-heading">Treatments</p>
            <ul className="site-footer-list">
              {FOOTER_TREATMENTS.map((item) => (
                <li key={item.href}>
                  <Link className="site-footer-link" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <nav aria-label="Quick links">
              <p className="site-footer-heading">Quick links</p>
              <ul className="site-footer-list">
                {footerQuickLinks().map((item) => (
                  <li key={item.href}>
                    <Link className="site-footer-link" href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    className="site-footer-link"
                    href={SITE.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Get directions to NeuroLinks (opens in Google Maps)"
                  >
                    Get directions
                  </a>
                </li>
              </ul>
            </nav>
            <div className="site-footer-follow">
              <p className="site-footer-heading">Follow NeuroLinks</p>
              <div className="site-footer-socials">
                <a
                  className="site-footer-social"
                  href={SITE.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="NeuroLinks on Facebook"
                >
                  <FacebookIcon />
                </a>
                <a
                  className="site-footer-social"
                  href={SITE.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="NeuroLinks on Instagram"
                >
                  <InstagramIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="site-footer-legal">
        <div className="site-footer-inner">
          <p>
            © 2022–{year} NeuroLinks. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
