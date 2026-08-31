import Image from "next/image";
import Link from "next/link";
import { SiteChrome } from "@/components/SiteChrome";
import { ButtonLink } from "@/components/ButtonLink";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { TmsSectionNav } from "@/components/tms/TmsSectionNav";
import { TmsVideo } from "@/components/tms/TmsVideo";
import { TmsDisclosure } from "@/components/tms/TmsDisclosure";
import { KETAMINE_FAQS } from "@/content/faqs";
import { MEDIA, WP_VIDEOS } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Ketamine Treatment for Depression, OCD &Anxiety – NeuroLinks",
  description:
    "Discover ketamine treatment at NeuroLinks, Nanaimo. Effective for depression, OCD, PTSD & anxiety when other treatments haven’t worked.",
  path: "/ketamine-treatment-resistant-depression-nanaimo/",
});

const HERO_ALT = "Ketamine vial in a supervised treatment room at NeuroLinks";

const KET_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "how-ketamine-works", label: "How it works" },
  { id: "what-to-expect", label: "What to expect" },
  { id: "conditions", label: "Conditions" },
  { id: "safety", label: "Safety" },
  { id: "faqs", label: "FAQs" },
] as const;

const ONSET = [
  { index: "01", title: "Psychiatric assessment" },
  { index: "02", title: "Supervised treatment" },
  { index: "03", title: "Post-treatment observation" },
  { index: "04", title: "Response monitoring" },
] as const;

const MECHANISMS = [
  {
    index: "01",
    title: "NMDA receptor modulation",
    body: "Ketamine temporarily alters signalling through NMDA receptors, which are involved in communication between brain cells.",
  },
  {
    index: "02",
    title: "Glutamate signalling",
    body: "These effects influence glutamate-related pathways involved in neural communication and adaptation.",
  },
  {
    index: "03",
    title: "Neuroplasticity",
    body: "Ketamine may promote processes associated with synaptic change and neuroplasticity, which could contribute to its therapeutic effects.",
  },
] as const;

const JOURNEY = [
  {
    index: "01",
    title: "Psychiatric assessment",
    body: "Your diagnosis, previous treatments, medical history, medications and relevant safety considerations are reviewed.",
  },
  {
    index: "02",
    title: "Individualized treatment planning",
    body: "The psychiatrist determines whether ketamine may be appropriate and recommends a treatment plan based on your clinical needs.",
  },
  {
    index: "03",
    title: "Supervised administration",
    body: "Ketamine is administered in a controlled clinical setting with appropriate monitoring.",
  },
  {
    index: "04",
    title: "Recovery and follow-up",
    body: "Response, tolerability and safety are reviewed throughout care, and recommendations are adjusted according to clinical progress.",
  },
] as const;

const PRINCIPAL = [
  "Major depressive disorder",
  "Treatment-resistant depression",
  "Bipolar depression",
] as const;

const INDIVIDUAL = [
  "Post-traumatic stress disorder",
  "Anxiety disorders",
  "Obsessive-compulsive disorder",
  "Selected pain conditions",
] as const;

const SELECTION = [
  "diagnosis and previous treatment",
  "relevant medical and cardiovascular factors",
  "current medications",
  "substance-use considerations",
  "pregnancy considerations where relevant",
  "previous adverse reactions",
  "ability to participate safely in treatment and follow-up",
] as const;

function RippleMotif() {
  return (
    <svg
      className="ket-ripple"
      viewBox="0 0 240 180"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.1">
        <ellipse cx="168" cy="96" rx="22" ry="16" />
        <ellipse cx="168" cy="96" rx="44" ry="32" />
        <ellipse cx="168" cy="96" rx="68" ry="50" />
        <ellipse cx="168" cy="96" rx="94" ry="70" />
        <path d="M18 96h210" />
      </g>
    </svg>
  );
}

export default function KetaminePage() {
  return (
    <SiteChrome>
      <section id="ket-hero" className="ket-hero relative overflow-hidden bg-[var(--nl-navy)]">
        <div className="absolute inset-0">
          <Image
            src={MEDIA.ketamineHeroMobile}
            alt={HERO_ALT}
            fill
            priority
            sizes={IMG_SIZES.fullBleed}
            className="hero-photo object-cover object-top md:hidden"
          />
          <Image
            src={MEDIA.ketamineHero}
            alt={HERO_ALT}
            fill
            priority
            sizes={IMG_SIZES.fullBleed}
            className="hero-photo hidden object-cover object-center md:block"
          />
          <div className="hero-scrim pointer-events-none absolute inset-0 md:hidden" aria-hidden="true" />
          <div className="ket-hero-wash pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true" />
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
            <p className="hero-enter eyebrow text-white/80">Medically supervised ketamine treatment</p>
            <h1 className="hero-enter mt-3 font-serif text-[clamp(2.5rem,7vw,4.25rem)] font-semibold leading-[1.02] text-white">
              Ketamine therapy
            </h1>
            <p className="hero-enter hero-enter-2 mt-4 max-w-[36ch] text-[0.975rem] leading-[1.55] text-white/90 md:mt-5 md:max-w-md md:text-[1.05rem] md:leading-[1.65]">
              A rapid-acting treatment option for selected patients with difficult-to-treat
              depression and related conditions.
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
                href="#what-to-expect"
                variant="on-dark"
                className="grow basis-36 whitespace-nowrap md:grow-0"
              >
                What to expect
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <TmsSectionNav sections={KET_SECTIONS} />

      <section id="overview" className="tms-section ket-ivory">
        <div className="tms-wrap">
          <Reveal className="ket-overview-grid">
            <div>
              <Eyebrow>Overview</Eyebrow>
              <h2 className="tms-h2 mt-3">What is ketamine treatment?</h2>
              <p className="tms-lede mt-4">
                Ketamine was originally developed as an anesthetic and was later found to have
                rapid antidepressant effects at much lower doses. For some people, improvement may
                begin within hours to days—considerably faster than with conventional
                antidepressants.
              </p>
              <ul className="tms-facts ket-facts">
                <li>Rapid-acting potential</li>
                <li>Medically supervised administration</li>
                <li>Individualized psychiatric assessment</li>
              </ul>
              <TmsDisclosure summary="Read more about the evidence">
                <p>
                  Published research has reported that{" "}
                  <a
                    href="https://www.sciencedirect.com/science/article/pii/S0022395620311468"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    a single dose of ketamine
                  </a>{" "}
                  can produce an antidepressant effect within a few hours, and that this effect
                  may last up to a week for some people. A single dose is not a complete treatment
                  course; multiple treatments are typically considered when ketamine is
                  recommended.
                </p>
                <p>
                  Ketamine has also been studied across{" "}
                  <a
                    href="https://www.cambridge.org/core/journals/bjpsych-open/article/ketamine-for-the-treatment-of-mental-health-and-substance-use-disorders-comprehensive-systematic-review/36E261BFA62CDA6459B88F7777415FDA"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    several psychiatric conditions
                  </a>
                  , including major depressive disorder, bipolar depression, obsessive-compulsive
                  disorder, anxiety disorders and post-traumatic stress disorder. Evidence,
                  regulatory status and suitability differ by condition.
                </p>
              </TmsDisclosure>
            </div>
            <TmsVideo
              src={WP_VIDEOS.ketamine.src}
              poster={MEDIA.ketPoster}
              label="Ketamine introduction video"
            />
          </Reveal>
        </div>
      </section>

      <section className="tms-section tms-navy">
        <div className="tms-wrap">
          <Reveal className="ket-onset">
            <Eyebrow className="text-[var(--nl-yellow)]">Rapid-acting potential</Eyebrow>
            <h2 className="tms-h2 mt-3">Improvement may begin within hours or days</h2>
            <p className="tms-lede tms-lede-on-dark mt-4">
              Some patients experience improvement within hours or days, while others may require
              several treatments or may not respond. The timing, degree and duration of benefit
              vary.
            </p>
            <div className="ket-onset-track" aria-hidden="true">
              <span className="ket-onset-line" />
            </div>
            <ol className="ket-onset-grid">
              {ONSET.map((item) => (
                <li key={item.index} className="ket-onset-step">
                  <p>{item.index}</p>
                  <h3>{item.title}</h3>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section id="how-ketamine-works" className="tms-section ket-gold">
        <div className="tms-wrap">
          <Reveal className="ket-mech">
            <div className="relative">
              <RippleMotif />
              <Eyebrow>How ketamine may work</Eyebrow>
              <h2 className="tms-h2 mt-3">How ketamine may influence brain function</h2>
              <p className="tms-lede mt-4">
                Ketamine’s therapeutic effects are thought to involve changes in glutamate
                signalling and neuroplasticity. Its precise antidepressant mechanisms remain an
                active area of research.
              </p>
            </div>
            <ol className="ket-mech-grid">
              {MECHANISMS.map((item) => (
                <li key={item.index}>
                  <p className="ket-mech-index">{item.index}</p>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </li>
              ))}
            </ol>
            <TmsDisclosure summary="Read more about proposed mechanisms">
              <ul>
                <li>
                  Unlike conventional antidepressants, which often take weeks to have an effect,
                  ketamine may act quickly—often within days—by temporarily changing how NMDA
                  receptors work. These receptors help control communication between brain cells.
                </li>
                <li>
                  Ketamine may increase glutamatergic transmission. Glutamate is involved in
                  communication between brain cells; when those pathways function more
                  effectively, the brain may form new connections that can be relevant to mood.
                </li>
                <li>
                  Ketamine may also influence{" "}
                  <a
                    href="https://www.nature.com/articles/s41398-023-02451-0"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    brain plasticity
                  </a>
                  , including processes that involve proteins such as brain-derived neurotrophic
                  factor (BDNF).
                </li>
              </ul>
            </TmsDisclosure>
          </Reveal>
        </div>
      </section>

      <section id="what-to-expect" className="tms-section bg-white">
        <div className="tms-wrap">
          <Reveal>
            <Eyebrow>What to expect</Eyebrow>
            <h2 className="tms-h2 mt-3">Your treatment journey</h2>
            <ol className="ket-journey">
              {JOURNEY.map((item) => (
                <li key={item.index}>
                  <p className="ket-mech-index">{item.index}</p>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section id="conditions" className="tms-section tms-mist">
        <div className="tms-wrap">
          <Reveal>
            <Eyebrow>Conditions</Eyebrow>
            <h2 className="tms-h2 mt-3">Conditions considered for ketamine treatment</h2>
            <p className="tms-lede mt-4">
              The evidence, regulatory status and suitability of ketamine differ by condition. A
              condition listed here does not mean that treatment will automatically be
              recommended.
            </p>
            <div className="tms-condition-grid">
              <div>
                <h3>Principal clinical focus</h3>
                <ul>
                  {PRINCIPAL.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Considered individually</h3>
                <ul>
                  {INDIVIDUAL.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="tms-note">
              This grouping is for orientation only. It is not a regulatory classification and
              does not rank conditions by strength of evidence.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="safety" className="tms-section bg-white">
        <div className="tms-wrap">
          <Reveal>
            <Eyebrow>Safety and suitability</Eyebrow>
            <h2 className="tms-h2 mt-3">Careful selection and monitored treatment</h2>
            <div className="ket-safety">
              <div>
                <h3>Careful patient selection</h3>
                <p>
                  Suitability depends on diagnosis and previous treatment, relevant medical and
                  cardiovascular factors, current medications, substance-use considerations,
                  pregnancy considerations where relevant, previous adverse reactions, and the
                  ability to participate safely in treatment and follow-up.
                </p>
                <ul>
                  {SELECTION.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Monitored treatment</h3>
                <p>
                  Treatment occurs in a controlled clinical setting. Response and tolerability
                  are monitored. Temporary psychological and physical effects can occur, and the
                  treatment plan may be adjusted according to clinical response.
                </p>
                <p>
                  At NeuroLinks, ketamine is administered intramuscularly or subcutaneously by a
                  registered nurse under the supervision of a psychiatrist, with observation
                  before, during and after treatment.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="tms-section ket-ivory">
        <div className="tms-wrap">
          <Reveal>
            <Eyebrow>Treatment options</Eyebrow>
            <h2 className="tms-h2 mt-3">TMS or ketamine?</h2>
            <p className="tms-lede mt-4">
              TMS and ketamine work differently and may suit different patients. Recommendations
              depend on diagnosis, previous treatment, medical history, preferences and practical
              considerations.
            </p>
            <div className="ket-compare">
              <article className="ket-compare-tms">
                <h3>TMS</h3>
                <ul>
                  <li>Non-invasive</li>
                  <li>No anesthesia required</li>
                  <li>Treatment delivered across repeated sessions</li>
                  <li>Response generally develops over time</li>
                </ul>
              </article>
              <article className="ket-compare-ket">
                <h3>Ketamine</h3>
                <ul>
                  <li>Medication-based treatment</li>
                  <li>Medically supervised administration</li>
                  <li>Treatment schedule individualized</li>
                  <li>Improvement may begin within hours or days</li>
                </ul>
              </article>
            </div>
            <p className="tms-lede mt-8">
              A psychiatric assessment helps determine whether either treatment may be
              appropriate.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/about-tms-treatment-on-psychiatric-illness/" variant="ghost">
                Learn about TMS
              </ButtonLink>
              <ButtonLink href="/contact/" variant="accent">
                Request an assessment
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="tms-section tms-navy tms-assess">
        <div className="tms-wrap">
          <Reveal>
            <h2 className="tms-h2">Is ketamine treatment appropriate for you?</h2>
            <p className="tms-lede tms-lede-on-dark mt-4">
              Ketamine is not appropriate for everyone. A psychiatric assessment considers your
              symptoms, treatment history, medical factors and individual goals before treatment
              is recommended.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/contact/" variant="accent">
                Request an assessment
              </ButtonLink>
              <ButtonLink href="/physician-referral/" variant="on-dark">
                Information for physicians
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="faqs" className="tms-section bg-white">
        <div className="tms-wrap">
          <FaqJsonLd items={KETAMINE_FAQS} />
          <div className="tms-faq-layout">
            <div className="tms-faq-intro">
              <Eyebrow>FAQs</Eyebrow>
              <h2 className="tms-h2 mt-3">Frequently asked questions</h2>
              <p className="tms-lede mt-4">
                Answers to common questions about ketamine treatment, including onset, safety,
                administration and how it compares with TMS.
              </p>
              <p className="mt-6">
                <Link href="/contact/" className="tms-text-link">
                  Speak with the clinic
                </Link>
              </p>
            </div>
            <FaqAccordion items={KETAMINE_FAQS} variant="editorial" />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
