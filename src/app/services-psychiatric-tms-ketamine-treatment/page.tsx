import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { PageBanner } from "@/components/PageBanner";
import { SiteChrome } from "@/components/SiteChrome";
import { Card, Section } from "@/components/ui";
import { MEDIA } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Safe and effective TMS & Ketamine Therapy in Nanaimo, BC",
  description:
    "NeuroLinks Clinic in Nanaimo, BC specializes in TMS and ketamine therapy for depression, OCD & PTSD. Safe, effective, and evidence-based care.",
  path: "/services-psychiatric-tms-ketamine-treatment/",
});

export default function ServicesPage() {
  return (
    <SiteChrome>
      <PageBanner
        src={MEDIA.servicesBanner}
        alt="NeuroLinks clinic at Brickyard Road, Nanaimo"
        objectPosition="bottom center"
      />
      <Section>
        <h1 className="font-serif text-4xl font-bold">Our Services</h1>
        <h2 className="mt-6 font-serif text-2xl font-bold">
          Advanced Mental Health Treatments for Medication-Resistant Conditions
        </h2>
      </Section>
      <Section id="assessment">
        <Card>
          <div className="grid gap-6 p-6 md:grid-cols-2">
            <Image
              alt="psychiatric assessment"
              src={MEDIA.consult}
              width={768}
              height={432}
              className="rounded object-cover"
              sizes={IMG_SIZES.half}
            />
            <div>
              <p className="text-sm font-semibold text-[#3260eb]">Initial Assessment</p>
              <h3 className="mt-1 font-serif text-2xl">
                Comprehensive Assessment by Psychiatrists
              </h3>
              <p className="mt-3 leading-relaxed">
                Struggling with mental challenges illness can be isolating and discouraging.
                You&apos;re not alone! Our experienced psychiatrist can help you gain clarity
                and a path forward. At NeuroLinks, we&apos;ll review your diagnosis, treatment
                history, and explore potential options like TMS and ketamine treatments.
              </p>
              <p className="mt-3">
                *The assessment is completely covered by the Medical Service Plan (MSP).
              </p>
            </div>
          </div>
        </Card>
      </Section>
      <Section id="psychometric">
        <Card>
          <div className="grid gap-6 p-6 md:grid-cols-2">
            <Image
              alt="cognitive testing neuropsychological test for cog 2022 02 08 03 59 37 utc"
              src={MEDIA.cognitive}
              width={768}
              height={512}
              className="rounded object-cover"
              sizes={IMG_SIZES.half}
            />
            <div>
              <p className="text-sm font-semibold text-[#3260eb]">Psychometric Assessment</p>
              <h3 className="mt-1 font-serif text-2xl">Evaluate Severity</h3>
              <p className="mt-3 leading-relaxed">
                You will complete some psychometric assessments which will inform us about the
                severity of the mental illness. Apart from the standardized psychometric
                assessments, our psychiatrist may also implement some tailor-made evaluation
                tools depending on your need. These assessments are important for monitoring the
                treatment response.
              </p>
            </div>
          </div>
        </Card>
      </Section>
      <Section id="tms">
        <Card>
          <div className="grid gap-6 p-6 md:grid-cols-2">
            <Image
              alt="TMS treatment"
              src={MEDIA.tmsClinic}
              width={768}
              height={512}
              className="rounded object-cover"
              sizes={IMG_SIZES.half}
            />
            <div>
              <p className="text-sm font-semibold text-[#3260eb]">TMS</p>
              <h3 className="mt-1 font-serif text-2xl">Transcranial Magnetic Stimulation</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
                <li>
                  TMS therapy is typically given <strong>five days a week</strong>, over{" "}
                  <strong>4 to 6 weeks</strong> (<strong>accelerated TMS</strong> is available on
                  request, which is an intensive course of treatment given over 5 days).
                </li>
                <li>
                  Each session may last <strong>up to 30 minutes</strong>. The TMS machine in
                  our center is equipped with novel technology,{" "}
                  <strong>theta burst stimulation</strong>, which allows us to give the TMS in
                  as few as <strong>3 minutes</strong>.
                </li>
                <li>
                  Our psychiatrists will oversee your mental and physical wellbeing, as well as
                  the whole treatment course.
                </li>
                <li>
                  When you arrive, our technician will check in with you to see if you have any
                  special concerns.
                </li>
                <li>
                  The <strong>optimal stimulation intensity</strong> (motor threshold
                  assessment) and <strong>position</strong> (brain mapping) will be determined,
                  and they will be evaluated regularly.
                </li>
                <li>
                  During the stimulation, a clicking sound is produced by the coil. This is
                  usually mild and well tolerated. But if you find the sound difficult, we will
                  provide you with earplugs.
                </li>
                <li>
                  It usually takes <strong>at least 10-15 sessions</strong> of TMS for the
                  therapeutic effect to appear, and immediate relief after the first few
                  sessions is not expected.
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </Section>
      <Section id="ketamine">
        <Card>
          <div className="p-6">
            <p className="text-sm font-semibold text-[#3260eb]">Ketamine</p>
            <h3 className="mt-1 font-serif text-2xl">Ketamine Therapy</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
              <li>
                Ketamine therapy is typically given <strong>2 days a week</strong>, over{" "}
                <strong>3 weeks</strong>.
              </li>
              <li>
                The antidepressant effects of ketamine can appear within weeks, hours or days
                after a single infusion. Additional treatments are often necessary to sustain
                these benefits.
              </li>
              <li>
                Our psychiatrist will oversee your mental health and physical wellbeing, as well
                as the whole treatment course.
              </li>
            </ul>
          </div>
        </Card>
      </Section>
      <Section>
        <h2 className="font-serif text-3xl font-bold">Fee</h2>
        <p className="mt-4 max-w-3xl leading-relaxed">
          Our mission is to improve the mental well-being and functioning of as many patients as
          possible by delivering safe and effective therapies. However, TMS and Ketamine are
          unfortunately not covered by the Medical Service Plan (MSP). NeuroLinks would like to
          increase the coverage of these therapies in the following ways:
        </p>
        <ul className="mt-4 max-w-3xl list-disc space-y-3 pl-6 leading-relaxed">
          <li>
            If you have extended health insurance, you may be covered. We will issue a letter of
            support and can fill out necessary insurance documents to assist you with
            reimbursement. However, since coverage policies differ among insurance companies,
            please contact your agent for more information.
          </li>
          <li>
            The TMS treatment is covered by the Medavie Blue Cross insurance, which provides
            coverage for members of the Canadian Armed Forces and Royal Canadian Mounted Police.
          </li>
          <li>
            If you are a work injury case with the WorkSafeBC, you may also be covered. Please
            contact your agent for your eligibility.
          </li>
          <li>
            We can also provide information about financial institutions to help patients not
            delay their treatment. Please contact us for more details.
          </li>
        </ul>
        <div className="mt-8">
          <ButtonLink href="/physician-referral/">Physician Referral</ButtonLink>
        </div>
      </Section>
    </SiteChrome>
  );
}
