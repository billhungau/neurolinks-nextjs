import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { CarePathway } from "@/components/CarePathway";
import { Eyebrow } from "@/components/Eyebrow";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { Reveal } from "@/components/Reveal";
import { SiteChrome } from "@/components/SiteChrome";
import { TextLink } from "@/components/TextLink";
import {
  VAC_MENTAL_HEALTH_BENEFITS_URL,
  VETERAN_CONDITIONS,
  VETERAN_COVERAGE,
  VETERAN_EXPERIENCE_POINTS,
  VETERAN_FAQS,
  VETERAN_IMPACT,
  VETERAN_PATHWAY,
  VETERAN_PATHWAY_CTA,
  VETERAN_PATHWAY_HEADING,
  VETERAN_PATHWAY_INTRO,
  VETERAN_TREATMENTS,
  VETERAN_TRUST,
} from "@/content/veterans";
import { MEDIA } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { PAGE_OG_IMAGES, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "TMS & Ketamine Treatment for Veterans in BC | NeuroLinks",
  description:
    "Psychiatrist-led assessment, TMS and ketamine treatment for Veterans in BC, with support navigating VAC and Medavie Blue Cross preauthorization.",
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
              When depression, anxiety or trauma-related symptoms continue despite medication and
              therapy, it can feel as though the options are running out. They may not be.
            </p>
            <p className="hero-enter hero-enter-2 vet-hero-lede">
              NeuroLinks provides psychiatrist-led assessment, TMS and ketamine treatment in
              Nanaimo, with experience supporting Veterans through treatment planning,
              preauthorization and ongoing monitoring.
            </p>
            <div className="hero-enter hero-enter-3 mt-7 flex flex-wrap gap-3">
              <ButtonLink
                href="/contact/"
                variant="accent"
                className="grow basis-full md:grow-0 md:basis-auto"
              >
                Ask about care for Veterans
              </ButtonLink>
              <ButtonLink
                href="/physician-referral/"
                variant="on-dark"
                className="grow basis-full md:grow-0 md:basis-auto"
              >
                Information for clinicians and case managers
              </ButtonLink>
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
              <div className="vet-inline-link">
                <TextLink href="/services-psychiatric-tms-ketamine-treatment/">
                  See how assessment and treatment work
                </TextLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="conditions" className="tms-section ket-ivory">
        <div className="tms-wrap">
          <Reveal>
            <Eyebrow>Conditions commonly assessed in Veterans</Eyebrow>
            <h2 className="tms-h2 mt-3">
              Mental health difficulties do not always occur one at a time
            </h2>
            <p className="tms-lede mt-4">
              Depression, anxiety and trauma-related symptoms frequently overlap. Their effects may
              also be complicated by chronic pain, disrupted sleep, medication burden and
              difficulties returning to everyday roles. Treatment should reflect the full clinical
              picture rather than a single diagnosis.
            </p>
          </Reveal>
          <Reveal className="vet-stagger vet-conditions">
            {VETERAN_CONDITIONS.map((condition) => (
              <article
                key={condition.title}
                className={`vet-condition vet-condition--${condition.tone}`}
              >
                <p className="vet-condition-label">{condition.label}</p>
                <h3>{condition.title}</h3>
                {condition.body.map((paragraph) => (
                  <p key={paragraph} className="vet-condition-text">
                    {paragraph}
                  </p>
                ))}
                <TextLink href={condition.href}>{condition.linkLabel}</TextLink>
              </article>
            ))}
          </Reveal>
          <p className="tms-note">
            A diagnosis listed here does not mean that TMS or ketamine will be recommended. Neither
            treatment is routinely indicated for every condition, and suitability is determined
            through psychiatric assessment.
          </p>
        </div>
      </section>

      <section id="treatment-options" className="tms-section bg-white">
        <div className="tms-wrap">
          <Reveal>
            <Eyebrow>How TMS and ketamine may help</Eyebrow>
            <h2 className="tms-h2 mt-3">When conventional treatment has not brought enough relief</h2>
            <p className="tms-lede mt-4">
              TMS and ketamine work differently from conventional antidepressant medications. They
              may provide another path forward for selected patients, but neither treatment is
              appropriate for everyone. A psychiatric assessment is required to determine whether
              the potential benefits justify the risks and demands of treatment.
            </p>
          </Reveal>
          <Reveal className="vet-stagger vet-tx-grid">
            {VETERAN_TREATMENTS.map((treatment) => (
              <article key={treatment.key} className={`vet-tx vet-tx--${treatment.key}`}>
                <div className="vet-tx-head">
                  <Eyebrow>{treatment.eyebrow}</Eyebrow>
                  <h3>{treatment.title}</h3>
                </div>
                <div className="vet-tx-body">
                  {treatment.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  <ul className="vet-tx-points">
                    {treatment.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <div className="vet-tx-action">
                    <ButtonLink href={treatment.href}>{treatment.buttonLabel}</ButtonLink>
                  </div>
                </div>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <CarePathway
        headingId="veteran-pathway-heading"
        heading={VETERAN_PATHWAY_HEADING}
        intro={VETERAN_PATHWAY_INTRO}
        steps={VETERAN_PATHWAY}
        ctaHref={VETERAN_PATHWAY_CTA.href}
        ctaLabel={VETERAN_PATHWAY_CTA.label}
      />

      <section id="experience" className="tms-section bg-white">
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
              <Eyebrow>Experience that reduces uncertainty</Eyebrow>
              <h2 className="tms-h2 mt-3">
                Veterans should not have to explain the treatment process to their clinic
              </h2>
              <p className="vet-experience-text">
                NeuroLinks has experience assessing and treating Veterans, including patients whose
                care has been authorized through Veterans Affairs Canada.
              </p>
              <p className="vet-experience-text">
                Our team understands that receiving treatment involves more than selecting a
                protocol. It may require a detailed treatment plan, clinical rationale,
                preauthorization, progress monitoring and communication with existing healthcare
                providers or case managers.
              </p>
              <p className="vet-experience-text">
                We approach each Veteran as an individual—not as a diagnosis or a funding file.
              </p>
              <div className="vet-inline-link">
                <TextLink href="/psychiatrist-tms-nanaimo/">Meet the team providing care</TextLink>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="vet-points-block">
              <h3 className="vet-points-heading">What we provide</h3>
              <ul className="vet-points">
                {VETERAN_EXPERIENCE_POINTS.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="coverage" className="tms-section ket-ivory">
        <div className="tms-wrap">
          <Reveal className="vet-coverage">
            <div>
              <Eyebrow>Coverage and authorization</Eyebrow>
              <h2 className="tms-h2 mt-3">{VETERAN_COVERAGE.heading}</h2>
            </div>
            <div className="vet-coverage-copy">
              {VETERAN_COVERAGE.body.map((paragraph) => (
                <p key={paragraph} className="vet-coverage-text">
                  {paragraph}
                </p>
              ))}
              <aside className="vet-note">{VETERAN_COVERAGE.note}</aside>
              <div className="vet-external">
                <p>
                  Official benefit information:{" "}
                  <a
                    className="evidence-link"
                    href={VAC_MENTAL_HEALTH_BENEFITS_URL}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Veterans Affairs Canada — Mental Health Benefits
                  </a>{" "}
                  <span className="vet-external-note">(opens on veterans.gc.ca)</span>
                </p>
              </div>
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
                Answers about coverage, preauthorization, referrals, travel and what happens if
                treatment does not help enough. Where an answer depends on your individual
                situation, we say so.
              </p>
              <p className="mt-6">
                <Link href="/contact/" className="tms-text-link">
                  Contact the clinic
                </Link>
              </p>
            </div>
            <FaqAccordion items={VETERAN_FAQS} variant="editorial" />
          </div>
        </div>
      </section>

      <section className="tms-section tms-navy tms-assess">
        <div className="tms-wrap">
          <Reveal>
            <h2 className="tms-h2">You do not have to determine the next step alone</h2>
            <p className="tms-lede tms-lede-on-dark mt-4">
              Tell us what you have tried, what remains difficult and what you hope will change.
              Our team can explain the assessment process, whether TMS or ketamine may be worth
              considering, and what would be required to request authorization.
            </p>
            <div className="vet-cta-actions">
              <ButtonLink href="/contact/" variant="accent">
                Ask about care for Veterans
              </ButtonLink>
              <ButtonLink href={SITE.phoneHref} variant="on-dark">
                Call {SITE.phone}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteChrome>
  );
}
