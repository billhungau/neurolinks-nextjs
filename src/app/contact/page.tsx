import Image from "next/image";
import Script from "next/script";
import { ButtonLink } from "@/components/ButtonLink";
import { JotformContactEmbed } from "@/components/JotformContactEmbed";
import { Reveal } from "@/components/Reveal";
import { SiteChrome } from "@/components/SiteChrome";
import { JOTFORM_CONTACT } from "@/lib/jotform-contact";
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
      <Script src={JOTFORM_CONTACT.handlerSrc} strategy="afterInteractive" />
      <section id="contact-hero" className="ct-hero relative overflow-hidden bg-[var(--nl-navy)]">
        <div className="absolute inset-0">
          <Image
            src={MEDIA.reception}
            alt="NeuroLinks reception and waiting area at the Brickyard Clinic"
            fill
            priority
            sizes={IMG_SIZES.fullBleed}
            className="hero-photo object-cover object-[62%_38%] md:object-[68%_42%]"
          />
          <div className="hero-scrim pointer-events-none absolute inset-0 md:hidden" aria-hidden="true" />
          <div className="ct-hero-wash pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true" />
          <div
            className="hero-top-scrim pointer-events-none absolute inset-x-0 top-0 md:hidden"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-16 bg-gradient-to-b from-[var(--nl-navy)]/45 to-transparent md:block"
            aria-hidden="true"
          />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[clamp(380px,48svh,440px)] max-w-6xl flex-col justify-end px-5 pt-20 pb-8 md:min-h-[clamp(400px,38svh,460px)] md:justify-center md:px-6 md:py-16 lg:px-8">
          <div className="hero-intro max-w-[36rem]">
            <h1 className="hero-enter font-serif text-[clamp(2.375rem,6vw,3.5rem)] font-semibold leading-[1.04] text-white">
              Contact NeuroLinks
            </h1>
            <p className="hero-enter hero-enter-2 mt-4 max-w-[38ch] text-[0.975rem] leading-[1.55] text-white/90 md:mt-5 md:max-w-md md:text-[1.05rem] md:leading-[1.65]">
              Don&apos;t hesitate to contact us – we&apos;re here to help you navigate your journey.
            </p>
            <div className="hero-enter hero-enter-3 mt-7 flex flex-wrap gap-3">
              <ButtonLink
                href={SITE.phoneHref}
                variant="accent"
                className="grow basis-36 whitespace-nowrap md:grow-0"
              >
                Call the clinic
              </ButtonLink>
              <ButtonLink
                href={SITE.mapsUrl}
                variant="on-dark"
                className="grow basis-36 whitespace-nowrap md:grow-0"
              >
                Get directions
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="ct-body" aria-labelledby="contact-form-heading">
        <div className="ct-layout">
          <Reveal className="ct-form-col">
            <h2 id="contact-form-heading" className="ct-section-title">
              Send a message
            </h2>
            <p className="ct-privacy">
              For general inquiries only. Please do not include personal health information, referral
              details or urgent medical concerns.
            </p>
            <div className="ct-form-frame">
              <JotformContactEmbed />
            </div>
          </Reveal>

          <Reveal className="ct-aside" delayMs={40}>
            <h2 className="ct-section-title">Our office</h2>
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
              <a href={SITE.mapsUrl} rel="noopener noreferrer" target="_blank">
                Get directions
              </a>
            </p>
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
          </Reveal>
        </div>
      </section>
    </SiteChrome>
  );
}
