import Image from "next/image";
import Link from "next/link";
import { SiteChrome } from "@/components/SiteChrome";
import { ButtonLink } from "@/components/ButtonLink";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { TmsSectionNav } from "@/components/tms/TmsSectionNav";
import { MEDIA } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Safe and effective TMS & Ketamine Therapy in Nanaimo, BC",
  description:
    "NeuroLinks Clinic in Nanaimo, BC specializes in TMS and ketamine therapy for depression, OCD & PTSD. Safe, effective, and evidence-based care.",
  path: "/services-psychiatric-tms-ketamine-treatment/",
});

const HERO_ALT = "NeuroLinks clinic at Brickyard Road, Nanaimo";

const SVC_SECTIONS = [
  { id: "care-pathway", label: "Care pathway" },
  { id: "assessment", label: "Initial assessment" },
  { id: "psychometric", label: "Psychometric assessment" },
  { id: "tms", label: "TMS" },
  { id: "ketamine", label: "Ketamine" },
  { id: "coverage", label: "Coverage" },
] as const;

const PATHWAY = [
  { index: "01", title: "Initial contact" },
  { index: "02", title: "Psychiatric assessment" },
  { index: "03", title: "Treatment recommendation" },
  { index: "04", title: "TMS or ketamine treatment" },
  { index: "05", title: "Response and safety monitoring" },
] as const;

const ASSESSMENT_MARKERS = [
  "Diagnosis and treatment history",
  "Individual clinical needs",
  "Potential options including TMS and ketamine",
] as const;

const MEASURE = ["Baseline", "During treatment", "Follow-up"] as const;

const TMS_OVERVIEW = (
  <>
    TMS therapy is typically given <strong>five days a week</strong>, over{" "}
    <strong>4 to 6 weeks</strong> (<strong>accelerated TMS</strong> is available on request,
    which is an intensive course of treatment given over 5 days).
  </>
);

const TMS_DETAILS = [
  {
    title: "Session length and protocol",
    body: (
      <>
        Each session may last <strong>up to 30 minutes</strong>. NeuroLinks offers{" "}
        <strong>theta-burst stimulation</strong>, which can reduce the stimulation portion of
        selected TMS sessions to as little as <strong>three minutes</strong>. The complete
        appointment may take longer.
      </>
    ),
  },
  {
    title: "Psychiatrist oversight",
    body: (
      <>
        A NeuroLinks psychiatrist oversees treatment planning, clinical progress, tolerability
        and safety throughout the course.
      </>
    ),
  },
  {
    title: "Before each session",
    body: (
      <>
        When you arrive, our technician will check in with you to see if you have any special
        concerns.
      </>
    ),
  },
  {
    title: "Treatment intensity and position",
    body: (
      <>
        <strong>Stimulation intensity</strong> is established through motor-threshold
        assessment, and the treatment <strong>position</strong> is determined through brain
        mapping. These may be reassessed when clinically appropriate.
      </>
    ),
  },
  {
    title: "What treatment feels and sounds like",
    body: (
      <>
        The coil produces a repetitive clicking sound during stimulation. Hearing protection is
        provided during treatment.
      </>
    ),
  },
  {
    title: "When improvement may begin",
    body: (
      <>
        Improvement generally develops gradually across the treatment course. Some patients
        notice changes after approximately <strong>10–15 sessions</strong>, although timing and
        response vary.
      </>
    ),
  },
] as const;

const KETAMINE_GROUPS = [
  {
    title: "Treatment schedule",
    body: (
      <>
        Ketamine therapy is typically given <strong>2 days a week</strong>, over{" "}
        <strong>3 weeks</strong>.
      </>
    ),
  },
  {
    title: "Rapid-acting potential",
    body: (
      <>
        Some patients experience improvement within hours or days, although several treatments
        may be required and not everyone responds. The timing, degree and duration of benefit
        vary.
      </>
    ),
  },
  {
    title: "Psychiatrist oversight and monitoring",
    body: (
      <>
        Ketamine is administered by a registered nurse under psychiatrist supervision, with
        appropriate monitoring before, during and after treatment.
      </>
    ),
  },
] as const;

const COVERAGE = [
  {
    title: "Extended health insurance",
    body: "If you have extended health insurance, you may be covered. We will issue a letter of support and can fill out necessary insurance documents to assist you with reimbursement. However, since coverage policies differ among insurance companies, please contact your agent for more information.",
  },
  {
    title: "Medavie Blue Cross",
    body: "The TMS treatment is covered by the Medavie Blue Cross insurance, which provides coverage for members of the Canadian Armed Forces and Royal Canadian Mounted Police.",
  },
  {
    title: "WorkSafeBC",
    body: "Coverage may be available in selected WorkSafeBC cases. Patients should contact their WorkSafeBC representative to confirm eligibility and authorization requirements.",
  },
  {
    title: "Financial support information",
    body: "We can also provide information about financial institutions to help patients not delay their treatment. Please contact us for more details.",
  },
] as const;

function ServicePhoto({
  src,
  alt,
  position = "center",
}: {
  src: string;
  alt: string;
  position?: string;
}) {
  return (
    <div className="svc-photo">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={IMG_SIZES.half}
        className="object-cover"
        style={{ objectPosition: position }}
      />
    </div>
  );
}

export default function ServicesPage() {
  return (
    <SiteChrome>
      <section id="svc-hero" className="svc-hero relative overflow-hidden bg-[var(--nl-navy)]">
        <div className="absolute inset-0">
          <Image
            src={MEDIA.servicesBanner}
            alt={HERO_ALT}
            fill
            priority
            sizes={IMG_SIZES.fullBleed}
            className="hero-photo object-cover object-[42%_72%] md:object-[46%_68%]"
          />
          <div className="hero-scrim pointer-events-none absolute inset-0 md:hidden" aria-hidden="true" />
          <div className="svc-hero-wash pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true" />
          <div
            className="hero-top-scrim pointer-events-none absolute inset-x-0 top-0 md:hidden"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-24 bg-gradient-to-b from-[var(--nl-navy)]/55 to-transparent md:block"
            aria-hidden="true"
          />
        </div>
        <div className="nl-wrap relative z-10 flex min-h-[clamp(500px,58svh,550px)] flex-col justify-end pt-20 pb-8 md:justify-center md:py-16">
          <div className="hero-intro max-w-[42rem]">
            <p className="hero-enter eyebrow text-white/80">Our Services</p>
            <h1 className="hero-enter mt-3 font-serif text-[clamp(2.375rem,5vw,4rem)] font-semibold leading-[1.06] text-white">
              Advanced Mental Health Treatments for Medication-Resistant Conditions
            </h1>
            <div className="hero-enter hero-enter-3 mt-7 flex flex-wrap gap-3">
              <ButtonLink
                href="#care-pathway"
                variant="accent"
                className="grow basis-36 whitespace-nowrap md:grow-0"
              >
                Explore our services
              </ButtonLink>
              <ButtonLink
                href="/contact/"
                variant="on-dark"
                className="grow basis-36 whitespace-nowrap md:grow-0"
              >
                Request an assessment
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <TmsSectionNav sections={SVC_SECTIONS} />

      <section id="care-pathway" className="tms-section ket-ivory">
        <div className="tms-wrap">
          <Reveal className="svc-path">
            <Eyebrow>Your care pathway</Eyebrow>
            <h2 className="tms-h2 mt-3">From assessment to treatment</h2>
            <div className="svc-path-track" aria-hidden="true">
              <span className="svc-path-line" />
            </div>
            <ol className="svc-path-grid">
              {PATHWAY.map((item) => (
                <li key={item.index} className="svc-path-step">
                  <p>{item.index}</p>
                  <h3>{item.title}</h3>
                </li>
              ))}
            </ol>
            <p className="tms-note">
              Treatment is recommended only when clinically appropriate following psychiatric
              assessment.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="assessment" className="tms-section bg-white">
        <div className="tms-wrap">
          <Reveal className="svc-split">
            <ServicePhoto
              src={MEDIA.consult}
              alt="Clinician and patient reviewing documents during a psychiatric assessment"
              position="center 40%"
            />
            <div>
              <Eyebrow>Initial Assessment</Eyebrow>
              <h2 className="tms-h2 mt-3">Comprehensive Assessment by Psychiatrists</h2>
              <p className="tms-lede mt-4">
                Living with a mental health condition can feel isolating and discouraging. You
                are not alone. A NeuroLinks psychiatrist can review your diagnosis and treatment
                history and discuss appropriate options, which may include TMS or ketamine when
                clinically suitable.
              </p>
              <ul className="tms-facts">
                {ASSESSMENT_MARKERS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="svc-msp">
                For eligible British Columbia residents with an appropriate referral, the
                psychiatric assessment is covered by the Medical Services Plan (MSP).
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="psychometric" className="tms-section tms-mist">
        <div className="tms-wrap">
          <Reveal className="svc-split svc-split-rev">
            <div>
              <Eyebrow>Psychometric Assessment</Eyebrow>
              <h2 className="tms-h2 mt-3">Evaluate Severity</h2>
              <p className="tms-lede mt-4">
                Standardized questionnaires help evaluate symptom severity and establish a
                baseline before treatment. Additional measures may be selected according to
                individual clinical needs. Repeated assessments help monitor progress during
                treatment and follow-up.
              </p>
              <ol className="svc-measure" aria-label="How psychometric assessments are used">
                {MEASURE.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true" />
                    <p>{item}</p>
                  </li>
                ))}
              </ol>
            </div>
            <ServicePhoto
              src={MEDIA.cognitive}
              alt="Person completing a visuospatial psychometric assessment form"
              position="center 30%"
            />
          </Reveal>
        </div>
      </section>

      <section id="tms" className="tms-section bg-white">
        <div className="tms-wrap">
          <Reveal>
            <div className="svc-split svc-tms">
              <ServicePhoto
                src={MEDIA.tmsClinic}
                alt="Patient receiving TMS treatment at NeuroLinks"
                position="center 45%"
              />
              <div>
                <Eyebrow>TMS</Eyebrow>
                <h2 className="tms-h2 mt-3">Transcranial Magnetic Stimulation</h2>
                <h3 className="svc-group-label">Treatment schedule</h3>
                <p className="tms-lede mt-2">{TMS_OVERVIEW}</p>
                <p className="mt-6">
                  <Link
                    href="/about-tms-treatment-on-psychiatric-illness/"
                    className="tms-text-link"
                  >
                    Learn more about TMS
                  </Link>
                </p>
              </div>
            </div>
            <dl className="svc-rows">
              {TMS_DETAILS.map((item) => (
                <div key={item.title}>
                  <dt>{item.title}</dt>
                  <dd>{item.body}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <section id="ketamine" className="tms-section ket-gold">
        <div className="tms-wrap">
          <Reveal>
            <div className="svc-split svc-split-rev svc-ket">
              <div>
                <Eyebrow>Ketamine</Eyebrow>
                <h2 className="tms-h2 mt-3">Ketamine Therapy</h2>
                <h3 className="svc-group-label svc-group-label-gold">Treatment schedule</h3>
                <p className="tms-lede mt-2">{KETAMINE_GROUPS[0].body}</p>
                <p className="mt-6">
                  <Link
                    href="/ketamine-treatment-resistant-depression-nanaimo/"
                    className="tms-text-link"
                  >
                    Learn more about ketamine therapy
                  </Link>
                </p>
              </div>
              <div className="svc-photo svc-photo-ket">
                <Image
                  src={MEDIA.ketamineVial}
                  alt="Ketamine vial on a clinic windowsill at NeuroLinks"
                  fill
                  sizes={IMG_SIZES.half}
                  className="object-cover object-[68%_62%]"
                />
              </div>
            </div>
            <dl className="svc-rows svc-rows-gold">
              {KETAMINE_GROUPS.slice(1).map((item) => (
                <div key={item.title}>
                  <dt>{item.title}</dt>
                  <dd>{item.body}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <section id="coverage" className="tms-section bg-white">
        <div className="tms-wrap">
          <Reveal>
            <Eyebrow>Coverage</Eyebrow>
            <h2 className="tms-h2 mt-3">Coverage and financial considerations</h2>
            <p className="tms-lede mt-4">
              Our mission is to improve the mental well-being and functioning of as many
              patients as possible by delivering safe and effective therapies. However, TMS and
              Ketamine are unfortunately not covered by the Medical Services Plan (MSP).
              NeuroLinks would like to increase the coverage of these therapies in the following
              ways:
            </p>
            <div className="svc-fee">
              {COVERAGE.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="tms-section tms-navy tms-assess">
        <div className="tms-wrap">
          <Reveal>
            <h2 className="tms-h2">Ready to explore your treatment options?</h2>
            <p className="tms-lede tms-lede-on-dark mt-4">
              Contact NeuroLinks to learn more about psychiatric assessment, TMS and ketamine
              treatment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/contact/" variant="accent">
                Request an assessment
              </ButtonLink>
              <ButtonLink href="/contact/" variant="on-dark">
                Contact the clinic
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteChrome>
  );
}
