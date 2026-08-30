import { PageBanner } from "@/components/PageBanner";
import { ReferralForm } from "@/components/ReferralForm";
import { SiteChrome } from "@/components/SiteChrome";
import { Section } from "@/components/ui";
import { MEDIA } from "@/lib/media";
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
      <PageBanner src={MEDIA.referralBanner} alt="" objectPosition="center -140px" />
      <Section>
        <h1 className="font-serif text-3xl font-bold">Physician Referral Form</h1>
        <p className="mt-4 max-w-3xl leading-relaxed">
          Thank you for helping our patients recover from their mental illness.
          <br />
          Please fill out the online referral form below. Alternatively, you may download the{" "}
          <a
            className="text-[#3260eb] underline"
            href={MEDIA.referralPdf}
            rel="noopener noreferrer"
            target="_blank"
          >
            PDF referral form
          </a>{" "}
          and fax it to 250-739-5530.
        </p>
        <p className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          Development preview: this referral form is not connected. Submissions are not
          delivered, stored, faxed, emailed, or logged.
        </p>
        <div className="mt-8">
          <ReferralForm />
        </div>
      </Section>
    </SiteChrome>
  );
}
