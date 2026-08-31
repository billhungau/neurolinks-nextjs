import Image from "next/image";
import Link from "next/link";
import { JotformContactEmbed } from "@/components/JotformContactEmbed";
import { SiteChrome } from "@/components/SiteChrome";
import { IMG_SIZES } from "@/lib/image-sizes";
import { MEDIA } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact NeuroLinks | Nanaimo TMS and Ketamine Clinic",
  description:
    "Contact NeuroLinks at 202-6010 Brickyard Road, Nanaimo. Phone 250-739-5530 or email contact@neurolinks.ca.",
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <SiteChrome>
      <section id="contact-hero" className="ct-hero relative overflow-hidden bg-[var(--nl-navy)]">
        <div className="absolute inset-0">
          <Image
            src={MEDIA.reception}
            alt="NeuroLinks reception and waiting area at the Brickyard Clinic"
            fill
            priority
            sizes={IMG_SIZES.fullBleed}
            className="hero-photo object-cover object-[58%_40%] md:object-[64%_38%]"
          />
          <div className="ct-hero-wash pointer-events-none absolute inset-0" aria-hidden="true" />
        </div>
        <div className="ct-hero-copy">
          <h1 className="hero-enter">Contact</h1>
          <p className="hero-enter hero-enter-2">
            Don&apos;t hesitate to contact us – we&apos;re here to help you navigate your journey.
          </p>
        </div>
      </section>

      <section className="ct-body" aria-labelledby="contact-form-heading">
        <div className="ct-layout">
          <div className="ct-form-col">
            <h2 id="contact-form-heading" className="ct-section-title">
              Send a message
            </h2>
            <p className="ct-privacy">
              For general inquiries only. Please do not include personal health information, referral
              details or urgent medical concerns.
            </p>
            <p className="ct-referral">
              Healthcare professionals:{" "}
              <Link href="/physician-referral/">Physician Referral Form</Link>
            </p>
            <div className="ct-form-frame">
              <JotformContactEmbed />
            </div>
          </div>

          <aside className="ct-aside" aria-labelledby="contact-office-heading">
            <h2 id="contact-office-heading" className="ct-section-title">
              Our office
            </h2>
            <dl className="ct-details">
              <div>
                <dt>Phone number</dt>
                <dd>
                  <a href={SITE.phoneHref}>{SITE.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Fax number</dt>
                <dd>{SITE.fax}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>
                  <a href={SITE.mapsUrl} rel="noopener noreferrer" target="_blank">
                    {SITE.addressLine}
                  </a>
                </dd>
              </div>
            </dl>
            <p className="ct-directions">
              <a
                href={SITE.mapsUrl}
                rel="noopener noreferrer"
                target="_blank"
                aria-label="Get directions to NeuroLinks (opens in Google Maps)"
              >
                Get directions
              </a>
            </p>
          </aside>
        </div>

        <div className="ct-map-block">
          <div className="ct-map">
            <iframe
              title="NeuroLinks at 202-6010 Brickyard Road, Nanaimo, BC"
              className="ct-map-frame"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=6010%20Brickyard%20Road%2C%20Nanaimo%2C%20BC&t=m&z=15&output=embed&iwloc=near"
            />
          </div>
          <p className="ct-map-link">
            <a href={SITE.mapsUrl} rel="noopener noreferrer" target="_blank">
              Open in Google Maps
            </a>
          </p>
        </div>
      </section>
    </SiteChrome>
  );
}
