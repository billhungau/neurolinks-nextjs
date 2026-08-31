import Image from "next/image";
import { SiteChrome } from "@/components/SiteChrome";
import { ButtonLink } from "@/components/ButtonLink";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { JotformReferralEmbed } from "@/components/JotformReferralEmbed";
import { JOTFORM_REFERRAL } from "@/lib/jotform-referral";
import { MEDIA } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Physician Referral | NeuroLinks",
  description:
    "Refer a patient to NeuroLinks for TMS or ketamine treatment in Nanaimo, BC. Complete the online form or fax the PDF referral.",
  path: "/physician-referral/",
});

const PREP_ITEMS = [
  "Patient name, PHN and contact information",
  "Referring physician information and MSP number",
  "Relevant diagnoses",
  "Requested treatment or treatment options",
  "Potential contraindications for TMS or ketamine",
  "Other clinically relevant information",
] as const;

export default function ReferralPage() {
  return (
    <SiteChrome>
      <section id="referral-hero" className="ref-hero relative overflow-hidden bg-[var(--nl-navy)]">
        <div className="absolute inset-0">
          <Image
            src={MEDIA.referralBanner}
            alt=""
            fill
            priority
            sizes={IMG_SIZES.fullBleed}
            className="hero-photo object-cover object-[center_46%] md:object-[center_42%]"
          />
          <div className="hero-scrim pointer-events-none absolute inset-0 md:hidden" aria-hidden="true" />
          <div className="ref-hero-wash pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true" />
          <div
            className="hero-top-scrim pointer-events-none absolute inset-x-0 top-0 md:hidden"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-20 bg-gradient-to-b from-[var(--nl-navy)]/50 to-transparent md:block"
            aria-hidden="true"
          />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[clamp(380px,46svh,440px)] max-w-6xl flex-col justify-end px-5 pt-16 pb-7 md:justify-center md:px-6 md:py-12 lg:px-8">
          <div className="hero-intro max-w-[36rem]">
            <p className="hero-enter eyebrow text-white/80">Physician referral</p>
            <h1 className="hero-enter mt-3 font-serif text-[clamp(2.25rem,4.6vw,3.4rem)] font-semibold leading-[1.06] text-white">
              Refer a patient to NeuroLinks
            </h1>
            <p className="hero-enter hero-enter-2 mt-4 max-w-[38ch] text-[0.975rem] leading-[1.55] text-white/90 md:max-w-md md:text-[1.05rem] md:leading-[1.65]">
              Submit a referral for psychiatric assessment and consideration of TMS or ketamine
              treatment.
            </p>
            <div className="hero-enter hero-enter-3 mt-6 flex flex-wrap gap-3">
              <ButtonLink
                href="#online-referral"
                variant="accent"
                className="grow basis-40 whitespace-nowrap md:grow-0"
              >
                Begin online referral
              </ButtonLink>
              <ButtonLink
                href={MEDIA.referralPdf}
                variant="on-dark"
                className="grow basis-40 whitespace-nowrap md:grow-0"
              >
                Download PDF
                <span className="sr-only"> (opens in a new tab)</span>
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="tms-section ket-ivory ref-section">
        <div className="tms-wrap">
          <Reveal>
            <Eyebrow>How to refer</Eyebrow>
            <h2 className="tms-h2 ref-h2 mt-3">Choose a referral method</h2>
            <div className="ref-methods">
              <article className="ref-method is-primary">
                <p className="ref-method-index">01</p>
                <h3>Online referral</h3>
                <p>
                  Complete the physician referral form below. Please have the patient’s PHN,
                  contact information, relevant diagnoses and potential treatment
                  contraindications available.
                </p>
                <ButtonLink href="#online-referral" variant="accent" className="mt-6">
                  Begin online referral
                </ButtonLink>
              </article>
              <article className="ref-method">
                <p className="ref-method-index">02</p>
                <h3>PDF and fax</h3>
                <p>
                  Download the PDF referral form and fax the completed form to{" "}
                  <strong>250-739-5530</strong>.
                </p>
                <ButtonLink href={MEDIA.referralPdf} variant="ghost" className="mt-6">
                  Download PDF
                  <span className="sr-only"> (opens in a new tab)</span>
                </ButtonLink>
              </article>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="tms-section tms-mist ref-section">
        <div className="tms-wrap">
          <Reveal className="ref-prep">
            <h2 className="ref-prep-heading">Before you begin</h2>
            <p>Please have the following information available:</p>
            <ul className="ref-prep-list">
              {PREP_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="ref-notices">
              <p>
                The information submitted through this form will be used to assess and
                coordinate the referral.
              </p>
              <p>
                This form is not monitored for emergencies. If the patient requires urgent
                medical or psychiatric assistance, use the appropriate emergency service.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="online-referral" className="tms-section bg-white ref-section">
        <div className="ref-form-wrap">
          <Reveal>
            <Eyebrow>Online referral</Eyebrow>
            <h2 className="tms-h2 ref-h2 mt-3">Physician Referral Form</h2>
            <p className="tms-lede mt-4">
              Thank you for helping our patients recover from their mental illness. Please
              complete the online referral form below.
            </p>
            <div className="ref-form-frame">
              <JotformReferralEmbed />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="tms-section ket-ivory ref-section">
        <div className="tms-wrap">
          <Reveal>
            <h2 className="tms-h2 ref-h2">Need help with a referral?</h2>
            <p className="tms-lede mt-4">
              If you are unable to complete the online form, download the PDF referral form
              and fax it to 250-739-5530.
            </p>
            <p className="ref-help-links">
              <a href={MEDIA.referralPdf} rel="noopener noreferrer" target="_blank">
                Download PDF
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href={JOTFORM_REFERRAL.src} rel="noopener noreferrer" target="_blank">
                Open Jotform directly
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
          </Reveal>
        </div>
      </section>
    </SiteChrome>
  );
}
