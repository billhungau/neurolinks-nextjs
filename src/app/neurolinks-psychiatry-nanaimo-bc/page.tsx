import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { ContactForm } from "@/components/forms/ContactForm";
import { LandingHeader } from "@/components/LandingHeader";
import { MotionReady } from "@/components/MotionReady";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { TextLink } from "@/components/TextLink";
import { DR_AU_PARAS } from "@/content/about-bios";
import { LANDING_FAQS } from "@/content/faqs";
import {
  LANDING_HEADLINE,
  LANDING_INQUIRY_HEADING,
  LANDING_INQUIRY_SUPPORTING_TEXT,
  LANDING_NEXT_STEPS,
  LANDING_OUTCOME_NOTE,
  LANDING_REVIEWS,
  LANDING_SUPPORTING_TEXT,
  LANDING_TREATMENTS,
  LANDING_WHY,
} from "@/content/landing";
import { ADVERTISING_LANDING_SOURCE } from "@/lib/contact-form";
import { IMG_SIZES } from "@/lib/image-sizes";
import { MEDIA } from "@/lib/media";
import { adsLandingRobots, PAGE_OG_IMAGES, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Psychiatry Clinic in Nanaimo, BC | TMS & Ketamine | NeuroLinks",
  description:
    "NeuroLinks is a psychiatrist-led psychiatry clinic in Nanaimo offering evidence-based care, including TMS and ketamine therapy, for treatment-resistant depression and related conditions.",
  path: "/neurolinks-psychiatry-nanaimo-bc/",
  image: PAGE_OG_IMAGES.landing,
  robots: adsLandingRobots,
});

const TREATMENT_MEDIA = {
  tmsMachine: MEDIA.tmsMachine,
  ketamineHero: MEDIA.ketamineHero,
} as const;

export default function LandingPage() {
  return (
    <>
      <MotionReady />
      <LandingHeader />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <FaqJsonLd items={LANDING_FAQS} />

        <section className="landing-hero" aria-labelledby="landing-hero-heading">
          <div className="landing-hero-grid">
            <div className="landing-hero-copy">
              <h1 id="landing-hero-heading">{LANDING_HEADLINE}</h1>
              <p>{LANDING_SUPPORTING_TEXT}</p>
              <div className="landing-hero-actions">
                <ButtonLink href="#inquiry" variant="accent">
                  Ask about treatment options
                </ButtonLink>
                <ButtonLink href={SITE.phoneHref} variant="ghost">
                  Call {SITE.phone}
                </ButtonLink>
              </div>
            </div>
            <div className="landing-hero-media">
              <Image
                src={MEDIA.landingHero}
                alt="Clinician preparing TMS treatment equipment in a NeuroLinks clinic room"
                fill
                priority
                sizes={IMG_SIZES.half}
                className="object-cover object-[center_18%] md:object-[center_center]"
              />
            </div>
          </div>
        </section>

        <section className="home-section why-nl bg-white" aria-labelledby="landing-why-heading">
          <div className="nl-wrap why-nl-grid">
            <Reveal>
              <h2 id="landing-why-heading" className="home-h2 text-[var(--nl-navy)]">
                Why NeuroLinks
              </h2>
            </Reveal>
            <ol className="why-nl-list">
              {LANDING_WHY.map((item, index) => (
                <Reveal key={item.index} as="li" delayMs={index * 70}>
                  <p className="why-nl-index">{item.index}</p>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="treatment"
          className="home-section bg-[var(--nl-cream)]"
          aria-labelledby="landing-treatment-heading"
        >
          <div className="nl-wrap">
            <Reveal>
              <h2 id="landing-treatment-heading" className="home-h2 max-w-3xl text-[var(--nl-navy)]">
                TMS and ketamine
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-stretch">
              {LANDING_TREATMENTS.map((item) => (
                <Reveal key={item.href}>
                  <article className="tx-feature group">
                    <div className="img-frame relative aspect-[16/10]">
                      <Image
                        src={TREATMENT_MEDIA[item.image]}
                        alt={item.alt}
                        fill
                        sizes={IMG_SIZES.half}
                        className={`object-cover ${"objectPosition" in item ? item.objectPosition : ""}`.trim()}
                      />
                    </div>
                    <div className="tx-feature-copy">
                      <h3 className="font-serif text-2xl font-semibold text-[var(--nl-navy)] md:text-[1.75rem]">
                        {item.title}
                      </h3>
                      <p className="tx-feature-support">{item.body}</p>
                      <TextLink href={item.href}>{item.linkLabel}</TextLink>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section bg-white" aria-labelledby="landing-psychiatrist-heading">
          <div className="nl-wrap">
            <Reveal className="about-au landing-psychiatrist">
              <div className="about-au-portrait">
                <Image
                  src={MEDIA.drAu}
                  alt="Dr. Chi Hung Au, psychiatrist and founder of NeuroLinks"
                  fill
                  sizes="(max-width: 768px) 100vw, 32vw"
                  className="object-cover object-[center_18%]"
                />
              </div>
              <div className="about-au-identity">
                <h2 id="landing-psychiatrist-heading" className="about-au-name">
                  Meet your psychiatrist
                </h2>
                <p className="about-role">Dr Chi Hung Au</p>
              </div>
              <div className="about-bio">
                <p>{DR_AU_PARAS[0]}</p>
                <TextLink href="/psychiatrist-tms-nanaimo/">Read the complete biography</TextLink>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          className="home-section bg-[var(--nl-navy)] text-white"
          aria-labelledby="landing-next-heading"
        >
          <div className="nl-wrap">
            <Reveal>
              <h2 id="landing-next-heading" className="home-h2 max-w-3xl">
                What happens next
              </h2>
            </Reveal>
            <div className="pathway-block mt-8">
              <div className="pathway-rule" aria-hidden="true" />
              <ol className="pathway grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
                {LANDING_NEXT_STEPS.map((step, index) => (
                  <Reveal key={step.index} as="li" delayMs={index * 60}>
                    <p className="relative z-10 font-serif text-2xl text-[var(--nl-yellow)]">
                      {step.index}
                    </p>
                    <h3 className="mt-3 font-serif text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/75">{step.body}</p>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="home-section bg-white" aria-labelledby="landing-reviews-heading">
          <div className="nl-wrap">
            <Reveal>
              <h2 id="landing-reviews-heading" className="home-h2 text-[var(--nl-navy)]">
                Patient experiences
              </h2>
              <p className="mt-2 text-sm text-[var(--nl-muted)]">on Google Reviews</p>
            </Reveal>
            <div className="landing-reviews">
              {LANDING_REVIEWS.map((review) => (
                <blockquote key={review.who}>
                  <p>{review.text}</p>
                  <footer>— {review.who}</footer>
                </blockquote>
              ))}
            </div>
            <p className="landing-outcome-note">{LANDING_OUTCOME_NOTE}</p>
          </div>
        </section>

        <section id="faq" className="home-section bg-[var(--nl-cream)]" aria-labelledby="landing-faq-heading">
          <div className="nl-wrap">
            <Reveal>
              <h2 id="landing-faq-heading" className="home-h2 text-[var(--nl-navy)]">
                Frequently Asked Questions
              </h2>
              <p className="prose-measure mt-3 text-[var(--nl-muted)]">
                Common questions about our treatments and approach to care.
              </p>
            </Reveal>
            <div className="mt-6">
              <FaqAccordion items={LANDING_FAQS} />
            </div>
          </div>
        </section>

        <section
          id="inquiry"
          className="home-section nl-anchor-section bg-white"
          aria-labelledby="inquiry-heading"
        >
          <div className="nl-wrap landing-inquiry">
            <Reveal>
              <h2 id="inquiry-heading" className="home-h2 text-[var(--nl-navy)]">
                {LANDING_INQUIRY_HEADING}
              </h2>
              <p className="prose-measure mt-4 leading-relaxed text-[var(--nl-muted)]">
                {LANDING_INQUIRY_SUPPORTING_TEXT}
              </p>
            </Reveal>
            <div className="ct-form-frame landing-inquiry-form">
              <ContactForm source={ADVERTISING_LANDING_SOURCE} />
            </div>
            <p className="mt-6 text-sm text-[var(--nl-muted)]">
              Prefer to speak with someone?{" "}
              <a className="font-semibold text-[var(--nl-navy)] underline" href={SITE.phoneHref}>
                Call {SITE.phone}
              </a>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
