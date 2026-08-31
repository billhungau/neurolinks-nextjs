import Image from "next/image";
import { SiteChrome } from "@/components/SiteChrome";
import { JotformReferralEmbed } from "@/components/JotformReferralEmbed";
import { JOTFORM_REFERRAL } from "@/lib/jotform-referral";
import { MEDIA } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Physician Referral | NeuroLinks",
  description:
    "Refer a patient to NeuroLinks for TMS or ketamine treatment in Nanaimo, BC. Complete the online form or fax the PDF referral.",
  path: "/physician-referral/",
});

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
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-16 bg-gradient-to-b from-[var(--nl-navy)]/50 to-transparent md:block"
            aria-hidden="true"
          />
        </div>
        <div className="nl-wrap relative z-10 flex min-h-[clamp(250px,32svh,290px)] flex-col justify-center pt-16 pb-8 md:min-h-[clamp(280px,28svh,320px)] md:pb-10">
          <div className="hero-intro max-w-[40rem]">
            <p className="hero-enter eyebrow text-white/80">For referring clinicians</p>
            <h1 className="hero-enter mt-3 font-serif text-[clamp(2.4rem,8vw,2.75rem)] font-semibold leading-[1.05] text-white md:text-[clamp(3.25rem,5vw,3.75rem)]">
              Refer a patient
            </h1>
          </div>
        </div>
      </section>

      <section className="ref-body">
        <dl className="ref-band">
          <div>
            <dt>Online referral</dt>
            <dd>Complete the secure form below.</dd>
          </div>
          <div>
            <dt>PDF alternative</dt>
            <dd>
              <a href={JOTFORM_REFERRAL.pdfUrl} rel="noopener noreferrer" target="_blank">
                Download the referral form
              </a>{" "}
              and fax the completed document to {SITE.fax}.
            </dd>
          </div>
          <div>
            <dt>Clinical information</dt>
            <dd>
              Include the reason for referral, relevant diagnoses, previous treatments and current
              medications.
            </dd>
          </div>
          <div>
            <dt>Next step</dt>
            <dd>
              The clinic will review the referral and contact the patient or referring office as
              appropriate.
            </dd>
          </div>
        </dl>
        <div className="ref-form-frame">
          <JotformReferralEmbed />
        </div>
      </section>
    </SiteChrome>
  );
}
