import Image from "next/image";
import { SiteChrome } from "@/components/SiteChrome";
import { PhysicianReferralForm } from "@/components/forms/PhysicianReferralForm";
import { MEDIA } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { pageMetadata } from "@/lib/seo";

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
            <h1 className="hero-enter font-serif text-[clamp(2.4rem,8vw,2.75rem)] font-semibold leading-[1.05] text-white md:text-[clamp(3.25rem,5vw,3.75rem)]">
              Refer a patient
            </h1>
          </div>
        </div>
      </section>

      <section className="ref-body">
        <PhysicianReferralForm />
      </section>
    </SiteChrome>
  );
}
