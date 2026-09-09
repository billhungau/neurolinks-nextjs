import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { Eyebrow } from "@/components/Eyebrow";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { VeteransContactForm } from "@/components/forms/VeteransContactForm";
import { VeteransRelatedInsights } from "@/components/insights/VeteransRelatedInsights";
import { Reveal } from "@/components/Reveal";
import { SiteChrome } from "@/components/SiteChrome";
import { TextLink } from "@/components/TextLink";
import { TmsSectionNav } from "@/components/tms/TmsSectionNav";
import { VeteransCarePathway } from "@/components/veterans/VeteransCarePathway";
import {
  VAC_MENTAL_HEALTH_BENEFITS_URL,
  VETERAN_CONDITIONS,
  VETERAN_CONTACT,
  VETERAN_COORDINATION_PRIMARY_CTA,
  VETERAN_COORDINATION_SECONDARY_CTA,
  VETERAN_COVERAGE,
  VETERAN_FAQS,
  VETERAN_HERO_PRIMARY_CTA,
  VETERAN_HERO_SECONDARY_CTA,
  VETERAN_IMPACT,
  VETERAN_PATHWAY,
  VETERAN_PATHWAY_CTA,
  VETERAN_PATHWAY_EYEBROW,
  VETERAN_PATHWAY_HEADING,
  VETERAN_PATHWAY_INTRO,
  VETERAN_TREATMENT_CTA,
  VETERAN_TREATMENT_INTRO,
  VETERAN_TREATMENTS,
  VETERAN_TRUST,
} from "@/content/veterans";
import { MEDIA } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { PAGE_OG_IMAGES, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import "./veterans.css";
import "./veterans-refinements.css";
import "./veterans-final.css";

export const metadata = pageMetadata({
  title: "Mental Health Treatment for Veterans in BC | NeuroLinks",
  description:
    "Psychiatrist-led assessment and treatment for Veterans experiencing depression, anxiety or trauma-related symptoms, with support preparing VAC preauthorization documentation.",
  path: "/veterans/",
  image: PAGE_OG_IMAGES.tms,
});

const HERO_ALT =
  "Patient receiving TMS treatment at NeuroLinks, with the treatment coil positioned by a clinician";

const VETERAN_SECTIONS = [
  { id: "impact-of-service", label: "Overview" },
  { id: "treatment-options", label: "Treatment options" },
  { id: "experience", label: "Our approach" },
  { id: "veteran-pathway", label: "How care works" },
  { id: "coverage", label: "VAC coverage" },
  { id: "faqs", label: "FAQs" },
] as const;

const APPROACH_POINTS = [
  {
    title: "Experience treating Veterans",
    body: "Specialist mental health care informed by direct work with Veterans.",
  },
  {
    title: "Specialist psychiatric oversight",
    body: "Assessment and treatment planning led by a psychiatrist.",
  },
  {
    title: "More than one treatment option",
    body: "TMS, Spravato and IM ketamine are available when clinically appropriate.",
  },
] as const;

export default function VeteransPage() {
  return (
    <SiteChrome>
      <div className="vet-page">
        <section id="veterans-hero" className="vet-redesign-hero">
          <div className="vet-redesign-hero-grid">
            <div className="vet-redesign-hero-media">
              <Image
                src={MEDIA.tmsClinic}
                alt={HERO_ALT}
                fill
                priority
                sizes={IMG_SIZES.fullBleed}
                className="vet-redesign-hero-photo"
              />
            </div>
            <div className="vet-redesign-hero-copy">
              <p className="hero-enter eyebrow">Care for Veterans</p>
              <h1 className="hero-enter">Specialist mental health treatment for Veterans</h1>
              <p className="hero-enter hero-enter-2 vet-redesign-hero-lede">
                Specialist care for Veterans with depression, anxiety or trauma-related symptoms.
              </p>
              <div className="hero-enter hero-enter-3 vet-redesign-hero-actions">
                <ButtonLink href={VETERAN_HERO_PRIMARY_CTA.href} variant="accent">
                  {VETERAN_HERO_PRIMARY_CTA.label}
                </ButtonLink>
                <ButtonLink href={VETERAN_HERO_SECONDARY_CTA.href} variant="ghost">
                  {VETERAN_HERO_SECONDARY_CTA.label}
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        <TmsSectionNav sections={VETERAN_SECTIONS} />

        <section className="vet-support-band" aria-label="How NeuroLinks supports Veterans">
          <div className="nl-wrap">
            <ul className="vet-support-band-list">
              {VETERAN_TRUST.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section id="impact-of-service" className="vet-overview-section vet-anchor-target">
          <div className="tms-wrap">
            <div className="vet-overview-grid">
              <Reveal className="vet-overview-impact">
                <h2 className="tms-h2">{VETERAN_IMPACT.heading}</h2>
                <div className="vet-overview-impact-copy">
                  <p>{VETERAN_IMPACT.opening}</p>
                  <blockquote className="vet-overview-emphasis">
                    <p>{VETERAN_IMPACT.emphasis}</p>
                  </blockquote>
                  <p>{VETERAN_IMPACT.closing}</p>
                </div>
              </Reveal>

              <div id="conditions" className="vet-conditions-editorial">
                <Reveal>
                  <Eyebrow>Conditions commonly assessed in Veterans</Eyebrow>
                </Reveal>
                <Reveal className="vet-condition-panels">
                  {VETERAN_CONDITIONS.map((condition) => (
                    <article
                      key={condition.title}
                      className={`vet-condition-panel vet-condition-panel--${condition.tone}`}
                    >
                      <h3>{condition.title}</h3>
                      <p>{condition.body}</p>
                    </article>
                  ))}
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <section id="treatment-options" className="vet-treatment-section vet-anchor-target">
          <div className="tms-wrap">
            <Reveal>
              <Eyebrow>Specialist treatment options</Eyebrow>
              <h2 className="tms-h2 mt-3">
                Specialist options when standard care has not helped enough
              </h2>
              <p className="tms-lede mt-4">{VETERAN_TREATMENT_INTRO}</p>
            </Reveal>
            <Reveal className="vet-treatment-grid">
              {VETERAN_TREATMENTS.map((treatment) => (
                <article
                  key={treatment.key}
                  className={`vet-treatment-card vet-treatment-card--${treatment.key}`}
                >
                  <div className="vet-treatment-card-head">
                    <Eyebrow>{treatment.eyebrow}</Eyebrow>
                    <h3>{treatment.title}</h3>
                  </div>
                  <div className="vet-treatment-card-body">
                    <p>{treatment.body}</p>
                    <ul className="vet-treatment-points">
                      {treatment.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <div className="vet-treatment-action">
                      <TextLink href={treatment.href}>{treatment.linkLabel}</TextLink>
                    </div>
                  </div>
                </article>
              ))}
            </Reveal>
            <div className="vet-treatment-foot">
              <ButtonLink href={VETERAN_TREATMENT_CTA.href} variant="accent">
                {VETERAN_TREATMENT_CTA.label}
              </ButtonLink>
            </div>
          </div>
        </section>

        <section id="experience" className="vet-experience-redesign vet-anchor-target">
          <div className="tms-wrap">
            <Reveal className="vet-experience-editorial">
              <div className="vet-experience-editorial-photo">
                <Image
                  src={MEDIA.team}
                  alt="Dr. Chi Hung Au with two NeuroLinks clinical team members at the clinic reception"
                  fill
                  sizes={IMG_SIZES.half}
                  loading="lazy"
                  className="object-cover object-[center_22%]"
                />
              </div>
              <div className="vet-experience-editorial-copy">
                <Eyebrow>Our approach</Eyebrow>
                <h2 className="tms-h2 mt-3">Psychiatrist-led care, tailored to the individual</h2>
                <p>
                  We take the time to understand your experience and goals. Treatment is selected
                  after a psychiatric assessment that considers your symptoms, previous treatment
                  and what you hope to regain.
                </p>
                <div className="mt-6 grid gap-0 border-t border-[var(--nl-border)]">
                  {APPROACH_POINTS.map((point) => (
                    <div
                      key={point.title}
                      className="relative border-b border-[var(--nl-border)] py-4 pl-5"
                    >
                      <span
                        className="absolute left-0 top-[1.35rem] h-2 w-2 rounded-full bg-[var(--nl-yellow)]"
                        aria-hidden="true"
                      />
                      <h3 className="font-semibold text-[var(--nl-navy)]">{point.title}</h3>
                      <p className="mt-1 text-[0.94rem] leading-relaxed text-[var(--nl-muted)]">
                        {point.body}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <TextLink href="/psychiatrist-tms-nanaimo/">Meet the team providing care</TextLink>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <VeteransCarePathway
          sectionId="veteran-pathway"
          headingId="veteran-pathway-heading"
          eyebrow={VETERAN_PATHWAY_EYEBROW}
          heading={VETERAN_PATHWAY_HEADING}
          intro={VETERAN_PATHWAY_INTRO}
          steps={VETERAN_PATHWAY}
          ctaHref={VETERAN_PATHWAY_CTA.href}
          ctaLabel={VETERAN_PATHWAY_CTA.label}
        />

        <section id="coverage" className="vet-coverage-redesign vet-anchor-target">
          <div className="tms-wrap">
            <Reveal className="vet-coverage-layout">
              <div className="vet-coverage-intro">
                <Eyebrow>Coverage and authorization</Eyebrow>
                <h2 className="tms-h2 mt-3">{VETERAN_COVERAGE.heading}</h2>
                <div className="vet-external">
                  <p className="vet-external-label">Official benefit information</p>
                  <p className="vet-external-target">
                    <a
                      className="evidence-link"
                      href={VAC_MENTAL_HEALTH_BENEFITS_URL}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Veterans Affairs Canada — Mental Health Benefits
                    </a>
                  </p>
                  <p className="vet-external-note">Opens veterans.gc.ca in a new tab.</p>
                </div>
              </div>

              <div>
                <div className="vet-coverage-matrix" aria-label="VAC treatment coverage overview">
                  {VETERAN_COVERAGE.options.map((option) => (
                    <article
                      key={option.treatment}
                      className={`vet-coverage-option vet-coverage-option--${option.tone}`}
                    >
                      <h3>{option.treatment}</h3>
                      <p className="vet-coverage-status">{option.status}</p>
                      <p className="vet-coverage-detail">{option.detail}</p>
                    </article>
                  ))}
                </div>
                <div className="vet-coverage-body">
                  {VETERAN_COVERAGE.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <aside id="coordination" className="vet-anchor-target vet-coord">
                  <h3>{VETERAN_COVERAGE.coordinationHeading}</h3>
                  <p>{VETERAN_COVERAGE.coordination}</p>
                  <div className="vet-coord-actions">
                    <ButtonLink href={VETERAN_COORDINATION_PRIMARY_CTA.href}>
                      {VETERAN_COORDINATION_PRIMARY_CTA.label}
                    </ButtonLink>
                    <ButtonLink href={VETERAN_COORDINATION_SECONDARY_CTA.href} variant="ghost">
                      {VETERAN_COORDINATION_SECONDARY_CTA.label}
                    </ButtonLink>
                  </div>
                </aside>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="faqs" className="tms-section vet-anchor-target bg-white">
          <div className="tms-wrap">
            <FaqJsonLd items={VETERAN_FAQS} />
            <div className="tms-faq-layout">
              <div className="tms-faq-intro">
                <h2 className="tms-h2">Questions Veterans ask</h2>
                <p className="tms-lede mt-4">
                  Answers about coverage, preauthorization, referrals, travel and how existing
                  clinicians can reach the clinic. Where an answer depends on your situation, we say
                  so.
                </p>
              </div>
              <FaqAccordion items={VETERAN_FAQS} variant="editorial" />
            </div>
          </div>
        </section>

        <section id="veterans-contact" className="vet-contact-redesign vet-anchor-target">
          <div className="tms-wrap">
            <Reveal className="vet-contact">
              <div className="vet-contact-copy">
                <h2 className="tms-h2 text-white">{VETERAN_CONTACT.heading}</h2>
                <p className="tms-lede tms-lede-on-dark mt-4">{VETERAN_CONTACT.body}</p>
                <div className="vet-cta-actions">
                  <ButtonLink href={SITE.phoneHref} variant="on-dark">
                    Call {SITE.phone}
                  </ButtonLink>
                </div>
              </div>
              <div className="vet-contact-form">
                <VeteransContactForm />
              </div>
            </Reveal>
          </div>
        </section>

        <VeteransRelatedInsights />
      </div>
    </SiteChrome>
  );
}
