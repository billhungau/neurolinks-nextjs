import Image from "next/image";
import Link from "next/link";
import { SiteChrome } from "@/components/SiteChrome";
import { ButtonLink } from "@/components/ButtonLink";
import { Reveal } from "@/components/Reveal";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { TmsSectionNav } from "@/components/tms/TmsSectionNav";
import { TmsVideo } from "@/components/tms/TmsVideo";
import { TmsDisclosure } from "@/components/tms/TmsDisclosure";
import { TMS_FAQS } from "@/content/faqs";
import { MEDIA } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "TMS – Transcranial Magnetic Stimulation therapy | NeuroLinks",
  description:
    "NeuroLinks psychiatry in Nanaimo provides TMS therapy for depression, OCD, and PTSD. A safe, effective, and non-invasive treatment. Book a consultation today!",
  path: "/about-tms-treatment-on-psychiatric-illness/",
});

const HERO_ALT =
  "TMS treatment chair, figure-eight coil, and MagVenture console in the NeuroLinks clinic";

const MECHANISMS = [
  {
    index: "01",
    title: "Targeted stimulation",
    body: "Magnetic pulses induce small electrical currents in a selected area of the brain.",
  },
  {
    index: "02",
    title: "Network modulation",
    body: "Repeated stimulation may influence connected brain networks involved in mood regulation.",
  },
  {
    index: "03",
    title: "Neuroplastic changes",
    body: "Treatment may support changes in neural activity, connectivity and neuroplasticity over time.",
  },
] as const;

const COMMON_CONDITIONS = [
  "Major depressive disorder",
  "Treatment-resistant depression",
  "Obsessive-compulsive disorder",
] as const;

const INDIVIDUAL_CONDITIONS = [
  "Post-traumatic stress disorder",
  "Bipolar depression",
  "Anxiety disorders",
  "Selected pain conditions, including migraine and fibromyalgia",
] as const;

const ELIGIBILITY = [
  "diagnosis and current symptoms",
  "previous treatment history",
  "relevant medical and neurological factors",
  "implanted metal or electronic devices",
  "pregnancy considerations where relevant",
  "age and the specific treatment indication",
  "individual psychiatric assessment",
] as const;

const FUNDING = [
  {
    title: "Veterans Affairs Canada",
    body: "Funding may be available for eligible veterans and RCMP members, subject to authorization.",
  },
  {
    title: "WorkSafeBC and other programs",
    body: "Coverage may be available in selected cases and depends on program approval.",
  },
  {
    title: "Extended health benefits",
    body: "Patients should contact their insurer to determine whether their plan provides reimbursement for any part of treatment.",
  },
] as const;

const WHY_TMS = [
  {
    title: "Another option when medication hasn’t helped",
    body: "TMS can improve certain mental conditions when conventional medications have not provided enough relief.",
  },
  {
    title: "Non-invasive, targeted treatment",
    body: "Magnetic pulses stimulate brain areas involved in mood regulation, cognition, and behaviors.",
  },
  {
    title: "Well tolerated",
    body: "Common side effects, such as scalp discomfort or headache, are usually temporary.",
  },
  {
    title: "Get back to your day",
    body: "Most patients can return to their usual activities after each session.",
  },
] as const;

const DURING_TREATMENT = [
  {
    title: "When you arrive",
    body: "When you arrive, our technician will check in with you to see if you have any special concerns. Stimulation intensity is established through motor-threshold assessment, and the treatment position is determined through brain mapping.",
  },
  {
    title: "What it feels and sounds like",
    body: "The coil produces a repetitive clicking sound during stimulation. Hearing protection is provided during treatment.",
  },
  {
    title: "Session length and course",
    body: "Each session may last up to 30 minutes. NeuroLinks offers theta-burst stimulation, which can reduce the stimulation portion of selected TMS sessions to as little as three minutes. The complete appointment may take longer. Treatment is typically given five days a week over 4 to 6 weeks. An accelerated course given over 5 days is available on request.",
  },
  {
    title: "Comfort and progress",
    body: "A NeuroLinks psychiatrist oversees treatment planning, clinical progress, tolerability and safety throughout the course.",
  },
] as const;

export default function AboutTmsPage() {
  return (
    <SiteChrome>
      <section id="tms-hero" className="tms-hero relative overflow-hidden bg-[var(--nl-navy)]">
        <div className="absolute inset-0">
          <Image
            src={MEDIA.tmsMachine}
            alt={HERO_ALT}
            fill
            priority
            sizes={IMG_SIZES.fullBleed}
            className="hero-photo object-cover object-[78%_42%] md:object-[72%_46%]"
          />
          <div className="hero-scrim pointer-events-none absolute inset-0 md:hidden" aria-hidden="true" />
          <div className="tms-hero-wash pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true" />
          <div
            className="hero-top-scrim pointer-events-none absolute inset-x-0 top-0 md:hidden"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-24 bg-gradient-to-b from-[var(--nl-navy)]/55 to-transparent md:block"
            aria-hidden="true"
          />
        </div>
        <div className="nl-wrap relative z-10 flex min-h-[clamp(500px,64svh,570px)] flex-col justify-end pt-20 pb-8 md:justify-center md:py-16">
          <div className="hero-intro max-w-[36rem]">
            <p className="hero-enter eyebrow text-white/80">Transcranial magnetic stimulation</p>
            <h1 className="hero-enter mt-3 font-serif text-[clamp(2.5rem,7vw,4.25rem)] font-semibold leading-[1.02] text-white">
              TMS treatment
            </h1>
            <p className="hero-enter hero-enter-2 mt-4 max-w-md text-[0.975rem] leading-[1.55] text-white/90 md:mt-5 md:text-[1.05rem] md:leading-[1.65]">
              A non-invasive approach to treatment when conventional care has not provided enough
              relief.
            </p>
            <div className="hero-enter hero-enter-3 mt-7 flex flex-wrap gap-3">
              <ButtonLink
                href="/contact/"
                variant="accent"
                className="grow basis-36 whitespace-nowrap md:grow-0"
              >
                Request an assessment
              </ButtonLink>
              <ButtonLink
                href="#how-tms-works"
                variant="on-dark"
                className="grow basis-36 whitespace-nowrap md:grow-0"
              >
                How TMS works
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <TmsSectionNav />

      <section id="overview" className="tms-section bg-[var(--nl-cream)]">
        <div className="tms-wrap">
          <Reveal className="tms-overview-grid">
            <TmsVideo />
            <div>
              <h2 className="tms-h2">What is TMS?</h2>
              <p className="tms-lede mt-4">
                Transcranial magnetic stimulation uses focused magnetic pulses to stimulate
                specific brain networks involved in mood and other psychiatric symptoms. Treatment
                is non-invasive, does not require anesthesia and is generally well tolerated.
              </p>
              <h3 className="tms-why-heading">Why consider TMS?</h3>
              <ul className="tms-why">
                {WHY_TMS.map((item) => (
                  <li key={item.title}>
                    <h4>{item.title}</h4>
                    <p>{item.body}</p>
                  </li>
                ))}
              </ul>
              <TmsDisclosure summary="Read more about the technology">
                <p>
                  Transcranial magnetic stimulation (TMS) is a non-invasive brain modulation
                  technology. It does not require anesthesia and is generally well tolerated, in
                  contrast to the side effects of medications and electroconvulsive therapy (ECT).
                  The TMS machine produces an alternating magnetic field which induces electric
                  currents at a specific area of the brain. The strength of the magnetic field
                  generated is similar to that of a magnetic resonance imaging (MRI) device. It
                  stimulates a discrete part of the brain, resulting in multiple changes in the
                  nervous system, including promoting neural growth, modulating neural networks,
                  and stimulating brain-chemical release.
                </p>
              </TmsDisclosure>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="during-treatment" className="tms-section tms-experience bg-white">
        <div className="tms-wrap">
          <Reveal>
            <h2 className="tms-h2">What happens during treatment?</h2>
            <ul className="tms-experience-grid">
              {DURING_TREATMENT.map((item) => (
                <li key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section id="how-tms-works" className="tms-section tms-navy tms-mech-section">
        <div className="tms-wrap">
          <Reveal className="tms-mech">
            <h2 className="tms-h2 tms-mech-heading text-white">How TMS works</h2>
            <p className="tms-lede tms-lede-on-dark mt-4">
              The clinical effectiveness of TMS is established for selected conditions, although
              its underlying mechanisms remain an active area of research. Proposed mechanisms
              include targeted stimulation, changes in connected brain networks and neuroplastic
              effects.
            </p>
            <div className="tms-mech-track" aria-hidden="true">
              <span className="tms-mech-line" />
            </div>
            <ol className="tms-mech-grid">
              {MECHANISMS.map((item) => (
                <li key={item.index} className="tms-mech-step">
                  <p className="tms-mech-index">{item.index}</p>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </li>
              ))}
            </ol>
            <TmsDisclosure summary="Read more about proposed mechanisms">
              <ul>
                <li>
                  <strong>Nervous-system growth.</strong> One proposed effect is stimulation of
                  nervous-system growth, most notably in the hippocampus, a structure involved in
                  mood and memory that can be affected in many mental disorders.{" "}
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/28631869/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    A published study
                  </a>{" "}
                  in patients with depression reported an increase in hippocampal size after TMS.
                </li>
                <li>
                  <strong>Functional connectivity.</strong> TMS may change neural-network
                  connectivity, including remote brain regions involved in mood regulation.
                </li>
                <li>
                  <strong>Neurochemical effects.</strong> TMS may stimulate the release of brain
                  chemicals. One example is{" "}
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/21795553/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    brain-derived neurotrophic factor (BDNF)
                  </a>
                  , which is involved in nerve growth, neuronal survival and neural connections.
                  Like conventional antidepressants, TMS has also been reported to stimulate
                  serotonin and dopamine release.
                </li>
              </ul>
            </TmsDisclosure>
          </Reveal>
        </div>
      </section>

      <section id="conditions" className="tms-section bg-white">
        <div className="tms-wrap">
          <Reveal>
            <h2 className="tms-h2">Conditions considered for TMS</h2>
            <p className="tms-lede mt-4">
              The evidence, regulatory status and suitability of TMS differ by condition. A
              diagnosis listed here does not mean that TMS will automatically be recommended.
            </p>
            <div className="tms-condition-grid">
              <div>
                <h3>Commonly considered</h3>
                <ul>
                  {COMMON_CONDITIONS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Considered individually</h3>
                <ul>
                  {INDIVIDUAL_CONDITIONS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="tms-note">
              This grouping is for orientation only. It is not a regulatory classification and does
              not rank conditions by strength of evidence.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="eligibility" className="tms-section tms-mist">
        <div className="tms-wrap">
          <Reveal className="tms-eligibility">
            <div>
              <h2 className="tms-h2">Who may be eligible?</h2>
              <p className="tms-lede mt-4">
                We assess your suitability for TMS by reviewing your symptoms, treatment history
                and relevant medical factors.
              </p>
            </div>
            <aside className="tms-screen">
              <h3>Important screening considerations</h3>
              <ul>
                {ELIGIBILITY.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <TmsDisclosure summary="Age and treatment eligibility">
                <p>
                  The U.S. Food and Drug Administration has approved TMS for some indications in
                  patients aged 15 and older. Approval, age range and device labelling vary by
                  indication, device and jurisdiction. NeuroLinks is a Canadian clinic; suitability
                  is determined individually and is not based on a single minimum age.
                </p>
              </TmsDisclosure>
            </aside>
          </Reveal>
        </div>
      </section>

      <section id="coverage" className="tms-section bg-[var(--nl-cream)]">
        <div className="tms-wrap">
          <Reveal>
            <h2 className="tms-h2">Treatment funding and coverage</h2>
            <p className="tms-lede mt-4">
              Coverage is not automatic. Authorization depends on the program, the clinical
              indication and individual eligibility.
            </p>
            <div className="tms-funding">
              {FUNDING.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
            <p className="mt-8">
              <Link href="/contact/" className="tms-text-link">
                Contact the clinic
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      <section className="tms-section tms-navy tms-assess">
        <div className="tms-wrap">
          <Reveal>
            <h2 className="tms-h2 text-white">Is TMS appropriate for you?</h2>
            <p className="tms-lede tms-lede-on-dark mt-4">
              Suitability depends on your diagnosis, previous treatments, medical history and
              individual goals. A psychiatric assessment is required before treatment is
              recommended.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/contact/" variant="accent">
                Request an assessment
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="faqs" className="tms-section bg-white">
        <div className="tms-wrap">
          <FaqJsonLd items={TMS_FAQS} />
          <div className="tms-faq-layout">
            <div className="tms-faq-intro">
              <h2 className="tms-h2">Frequently asked questions</h2>
              <p className="tms-lede mt-4">
                Answers to common questions about TMS, including suitability, side effects and how
                it compares with other treatments.
              </p>
              <p className="mt-6">
                <Link href="/contact/" className="tms-text-link">
                  Contact the clinic
                </Link>
              </p>
            </div>
            <FaqAccordion items={TMS_FAQS} variant="editorial" />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
