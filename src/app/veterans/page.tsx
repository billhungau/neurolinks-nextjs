import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { CarePathway } from "@/components/CarePathway";
import { Eyebrow } from "@/components/Eyebrow";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { VeteransContactForm } from "@/components/forms/VeteransContactForm";
import { Reveal } from "@/components/Reveal";
import { SiteChrome } from "@/components/SiteChrome";
import { TextLink } from "@/components/TextLink";
import {
  VAC_MENTAL_HEALTH_BENEFITS_URL,
  VETERAN_CONDITIONS,
  VETERAN_CONDITIONS_INTRO,
  VETERAN_CONDITIONS_NOTE,
  VETERAN_CONTACT,
  VETERAN_COVERAGE,
  VETERAN_EXPERIENCE,
  VETERAN_EXPERIENCE_POINTS,
  VETERAN_FAQS,
  VETERAN_IMPACT,
  VETERAN_PATHWAY,
  VETERAN_PATHWAY_CTA,
  VETERAN_PATHWAY_EYEBROW,
  VETERAN_PATHWAY_HEADING,
  VETERAN_PATHWAY_INTRO,
  VETERAN_TREATMENT_INTRO,
  VETERAN_TREATMENTS,
  VETERAN_TRUST,
} from "@/content/veterans";
import { MEDIA } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { PAGE_OG_IMAGES, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Mental Health Treatment for Veterans in BC | NeuroLinks",
  description:
    "Psychiatrist-led assessment and treatment for Veterans experiencing depression, anxiety or trauma-related symptoms, with support preparing VAC preauthorization documentation.",
  path: "/veterans/",
  image: PAGE_OG_IMAGES.tms,
});

const HERO_ALT =
  "Patient receiving TMS treatment at NeuroLinks, with the treatment coil positioned by a clinician";

export default function VeteransPage() {
  return (
    <SiteChrome>
      <section
        id="veterans-hero"
        className="vet-hero relative overflow-hidden bg-[var(--nl-navy)]"
      >
        <div className="absolute inset-0">
          <Image
            src={MEDIA.tmsClinic}
            alt={HERO_ALT}
            fill
            priority
            sizes={IMG_SIZES.fullBleed}
            className="hero-photo object-cover object-[44%_40%] md:object-[62%_36%]"
          />
          <div
            className="hero-scrim pointer-events-none absolute inset-0 md:hidden"
            aria-hidden="true"
          />
          <div
            className="vet-hero-wash pointer-events-none absolute inset-0 hidden md:block"
            aria-hidden="true"
          />
          <div
            className="hero-top-scrim pointer-events-none absolute inset-x-0 top-0 md:hidden"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-24 bg-gradient-to-b from-[var(--nl-navy)]/55 to-transparent md:block"
            aria-hidden="true"
          />
        </div>
        <div className="nl-wrap relative z-10 flex min-h-[clamp(520px,66svh,600px)] flex-col justify-end pt-20 pb-8 md:justify-center md:py-16">
          <div className="hero-intro max-w-[44rem]">
            <p className="hero-enter eyebrow text-white/80">Care for Veterans</p>
            <h1 className="hero-enter mt-3 max-w-[24ch] font-serif text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.05] text-white">
              Specialist mental health treatment for Veterans
            </h1>
            <p className="hero-enter hero-enter-2 vet-hero-lede">
              When depression, anxiety or trauma-related symptoms have not improved enough with
              medication or therapy, there may still be options.
            </p>
            <p className="hero-enter hero-enter-2 vet-hero-lede">
              NeuroLinks provides psychiatrist-led assessment and treatment in Nanaimo, with
              experience helping Veterans navigate treatment planning and VAC preauthorization.
            </p>
            <div className="hero-enter hero-enter-3 vet-hero-actions">
              <div className="vet-hero-buttons">
                <ButtonLink
                  href="#veterans-contact"
                  variant="accent"
                  className="grow basis-full md:grow-0 md:basis-auto"
                >
                  Request a confidential conversation
                </ButtonLink>
                <ButtonLink
                  href="#treatment-options"
                  variant="on-dark"
                  className="grow basis-full md:grow-0 md:basis-auto"
                >
                  Explore treatment options
                </ButtonLink>
              </div>
              <a className="text-link vet-hero-link" href="#coordination">
                <span>For clinicians and case managers</span>
                <span aria-hidden="true" className="text-link-arrow">
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip vet-trust" aria-label="How NeuroLinks supports Veterans">
        <div className="nl-wrap">
          <ul className="trust-grid">
            {VETERAN_TRUST.map((item) => (
              <li key={item}>
                <p className="trust-title">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="impact-of-service" className="tms-section bg-white">
        <div className="tms-wrap">
          <Reveal className="vet-impact">
            <div>
              <h2 className="tms-h2">{VETERAN_IMPACT.heading}</h2>
              <div className="vet-impact-rule" aria-hidden="true" />
            </div>
            <div className="vet-impact-copy">
              <p>{VETERAN_IMPACT.opening}</p>
              <blockquote className="vet-emphasis">
                <p>{VETERAN_IMPACT.emphasis}</p>
              </blockquote>
              <p>{VETERAN_IMPACT.closing}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="conditions" className="tms-section bg-[var(--nl-cream)]">
        <div className="tms-wrap">
          <Reveal>
            <Eyebrow>Conditions commonly assessed in Veterans</Eyebrow>
            <h2 className="tms-h2 mt-3">
              Mental health difficulties do not always occur one at a time
            </h2>
            <p className="tms-lede mt-4">{VETERAN_CONDITIONS_INTRO}</p>
          </Reveal>
          <Reveal className="vet-stagger vet-conditions">
            {VETERAN_CONDITIONS.map((condition) => (
              <article
                key={condition.title}
                className={`vet-condition vet-condition--${condition.tone}`}
              >
                <p className="vet-condition-label">{condition.label}</p>
                <h3>{condition.title}</h3>
                <p className="vet-condition-text">{condition.body}</p>
              </article>
            ))}
          </Reveal>
          <p className="tms-note">{VETERAN_CONDITIONS_NOTE}</p>
        </div>
      </section>

      <section id="treatment-options" className="tms-section bg-white">
        <div className="tms-wrap">
          <Reveal>
            <Eyebrow>Specialist treatment options</Eyebrow>
            <h2 className="tms-h2 mt-3">
              Specialist options when standard care has not helped enough
            </h2>
            <p className="tms-lede mt-4">{VETERAN_TREATMENT_INTRO}</p>
          </Reveal>
          <Reveal className="vet-stagger vet-tx-grid">
            {VETERAN_TREATMENTS.map((treatment) => (
              <article key={treatment.key} className={`vet-tx vet-tx--${treatment.key}`}>
                <div className="vet-tx-head">
                  <Eyebrow>{treatment.eyebrow}</Eyebrow>
                  <h3>{treatment.title}</h3>
                </div>
                <div className="vet-tx-body">
                  <p>{treatment.body}</p>
                  <ul className="vet-tx-points">
                    {treatment.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <div className="vet-tx-action">
                    <TextLink href={treatment.href}>{treatment.linkLabel}</TextLink>
                  </div>
                </div>
              </article>
            ))}
          </Reveal>
          <div className="vet-tx-foot">
            <ButtonLink href="#veterans-contact" variant="accent">
              Ask whether an assessment may be appropriate
            </ButtonLink>
          </div>
        </div>
      </section>

      <section id="experience" className="tms-section tms-mist">
        <div className="tms-wrap">
          <Reveal className="vet-experience">
            <div className="img-frame vet-experience-photo">
              <Image
                src={MEDIA.team}
                alt="Dr. Chi Hung Au with two NeuroLinks clinical team members at the clinic reception"
                fill
                sizes={IMG_SIZES.half}
                loading="lazy"
                className="object-cover object-[center_22%]"
              />
            </div>
            <div className="vet-experience-copy">
              <Eyebrow>{VETERAN_EXPERIENCE.eyebrow}</Eyebrow>
              <h2 className="tms-h2 mt-3">{VETERAN_EXPERIENCE.heading}</h2>
              <p className="vet-experience-text">{VETERAN_EXPERIENCE.opening}</p>
              <p className="vet-experience-text">{VETERAN_EXPERIENCE.closing}</p>
              <blockquote className="vet-emphasis">
                <p>{VETERAN_EXPERIENCE.quote}</p>
              </blockquote>
              <div className="vet-inline-link">
                <TextLink href="/psychiatrist-tms-nanaimo/">Meet the team providing care</TextLink>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <ul className="vet-points">
              {VETERAN_EXPERIENCE_POINTS.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <CarePathway
        sectionId="veteran-pathway"
        headingId="veteran-pathway-heading"
        eyebrow={VETERAN_PATHWAY_EYEBROW}
        heading={VETERAN_PATHWAY_HEADING}
        intro={VETERAN_PATHWAY_INTRO}
        steps={VETERAN_PATHWAY}
        ctaHref={VETERAN_PATHWAY_CTA.href}
        ctaLabel={VETERAN_PATHWAY_CTA.label}
      />

      <section id="coverage" className="tms-section bg-[var(--nl-cream)]">
        <div className="tms-wrap">
          <Reveal className="vet-coverage">
            <div>
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
            <div className="vet-coverage-copy">
              {VETERAN_COVERAGE.body.map((paragraph) => (
                <p key={paragraph} className="vet-coverage-text">
                  {paragraph}
                </p>
              ))}
              <aside id="coordination" className="vet-coord">
                <h3>{VETERAN_COVERAGE.coordinationHeading}</h3>
                <p>{VETERAN_COVERAGE.coordination}</p>
                <div className="vet-coord-actions">
                  <ButtonLink href="/physician-referral/">Submit a physician referral</ButtonLink>
                  <ButtonLink href="#veterans-contact" variant="ghost">
                    Contact NeuroLinks about coordination
                  </ButtonLink>
                </div>
              </aside>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="faqs" className="tms-section bg-white">
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
              <p className="mt-6">
                <a href="#veterans-contact" className="tms-text-link">
                  Request a confidential conversation
                </a>
              </p>
            </div>
            <FaqAccordion items={VETERAN_FAQS} variant="editorial" />
          </div>
        </div>
      </section>

      <section id="veterans-contact" className="tms-section tms-navy tms-assess">
        <div className="tms-wrap">
          <Reveal className="vet-contact">
            <div className="vet-contact-copy">
              <h2 className="tms-h2">{VETERAN_CONTACT.heading}</h2>
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
    </SiteChrome>
  );
}
