import { PhysicianReferralForm } from "@/components/forms/PhysicianReferralForm";
import { REFERRAL_PDF_URL } from "@/lib/referral-form";
import { SITE } from "@/lib/site";

export function PhysicianReferralExperience() {
  return (
    <div className="physician-referral-experience">
      <div className="referral-entry">
        <p className="ref-instruction">
          Please fill out the online referral form below. Alternatively, you may download the{" "}
          <a href={REFERRAL_PDF_URL} rel="noopener noreferrer" target="_blank">
            PDF referral form
          </a>{" "}
          and fax it to <a href={SITE.faxHref}>{SITE.fax}</a>.
        </p>

        <div className="ref-form-frame">
          <PhysicianReferralForm />
        </div>
      </div>

      <section
        className="referral-thankyou mx-auto max-w-[760px] py-[clamp(3.5rem,8vw,6.5rem)] text-center text-[var(--nl-navy)]"
        aria-live="polite"
        aria-atomic="true"
      >
        <h2 className="font-serif text-[clamp(2rem,4vw,2.65rem)] font-semibold leading-[1.15]">
          Thank you for your referral
        </h2>
        <p className="mx-auto mt-5 max-w-[44rem] text-[1.05rem] leading-8">
          We sincerely appreciate your trust in NeuroLinks. Your referral has been received, and our
          clinical team will review it with care and attention.
        </p>
        <p className="mx-auto mt-8 max-w-[44rem] text-[1.05rem] leading-8">
          If you have any questions or would like to share additional information, please contact
          NeuroLinks through our usual office channels. We&apos;re here to help make the referral process
          as smooth as possible.
        </p>
        <p className="mx-auto mt-8 max-w-[44rem] text-[1.05rem] leading-8">
          Thank you for partnering with us in caring for your patient.
        </p>
      </section>

      <style>{`
        .physician-referral-experience .referral-thankyou {
          display: none;
        }

        .physician-referral-experience:has(.ref-form-success) .referral-entry {
          display: none;
        }

        .physician-referral-experience:has(.ref-form-success) .referral-thankyou {
          display: block;
        }

        .physician-referral-experience .ref-check-group > .ref-field-hint,
        .physician-referral-experience #referral-patientPhone-hint,
        .physician-referral-experience #referral-referrerPhone-hint {
          display: none;
        }
      `}</style>
    </div>
  );
}
