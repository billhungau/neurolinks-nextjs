import { getImageProps } from "next/image";
import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { ExplainerVideo } from "@/components/ExplainerVideo";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { ContactForm } from "@/components/forms/ContactForm";
import { LandingHeader } from "@/components/LandingHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TextLink } from "@/components/TextLink";
import { DR_AU_PARAS } from "@/content/about-bios";
import { LANDING_FAQS } from "@/content/faqs";
import {
  LANDING_CLOSE_TEXT,
  LANDING_HEADLINE,
  LANDING_INQUIRY_CALL_LABEL,
  LANDING_INQUIRY_FOLLOW_UP,
  LANDING_INQUIRY_HEADING,
  LANDING_INQUIRY_SUPPORTING_TEXT,
  LANDING_NEXT_STEPS,
  LANDING_REVIEWS,
  LANDING_REVIEWS_CTA_LABEL,
  LANDING_SUPPORTING_LINES,
  LANDING_TREATMENT_HEADING,
  LANDING_TREATMENTS,
  LANDING_TRUST,
  LANDING_WHY_HEADING,
  LANDING_WHY_TEXT,
} from "@/content/landing";
import { ADVERTISING_LANDING_SOURCE } from "@/lib/contact-form";
import { IMG_SIZES } from "@/lib/image-sizes";
import { HOME_HERO_ASSET, LANDING_VIDEO_POSTERS, LANDING_YOUTUBE, MEDIA } from "@/lib/media";
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

const TREATMENT_VIDEOS = {
  tms: {
    id: LANDING_YOUTUBE.tms,
    poster: LANDING_VIDEO_POSTERS.tms.local,
    title: "Transcranial Magnetic Stimulation Treatment: Illuminating the Journey Through Mental Darkness",
  },
  ketamine: {
    id: LANDING_YOUTUBE.ketamine,
    poster: LANDING_VIDEO_POSTERS.ketamine.local,
    title: "Ketamine's Path to Healing Treatment-Resistant Mental Illness",
  },
} as const;

const HERO_ALT = "TMS coil on the left and ketamine vial on the right at NeuroLinks";

function LandingHeroPhoto() {
  const { props } = getImageProps({
    alt: HERO_ALT,
    sizes: IMG_SIZES.fullBleed,
    priority: true,
    src: MEDIA.homeHeroRetouched,
    width: HOME_HERO_ASSET.width,
    height: HOME_HERO_ASSET.height,
  });
  return (
    // getImageProps supplies a next/image-optimized srcSet; the hero needs a
    // plain img so one landscape file can sit in a CSS-sized frame.
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={HERO_ALT} className="landing-hero-photo" />
  );
}

export default function LandingPage() {
  return (
    <>
      <div id="top" className="landing-top-anchor" />
      <LandingHeader />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <FaqJsonLd items={LANDING_FAQS} />

        <section id="landing-hero" className="landing-hero" aria-labelledby="landing-hero-heading">
          <div className="landing-hero-media">
            <LandingHeroPhoto />
            <div className="landing-hero-wash" aria-hidden="true" />
          </div>
          <div className="nl-wrap landing-hero-copy-wrap">
            <div className="landing-hero-copy">
              <h1 id="landing-hero-heading">{LANDING_HEADLINE}</h1>
              <p className="landing-hero-support">
                {LANDING_SUPPORTING_LINES.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
              <div className="landing-hero-actions">
                <ButtonLink href="#treatment" variant="accent" className="landing-hero-primary">
                  Explore treatments
                </ButtonLink>
                <ButtonLink href="#inquiry" variant="on-dark" className="landing-hero-secondary">
                  Talk to our team
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-strip landing-trust" aria-label="Clinic facts">
          <div className="nl-wrap">
            <ul className="trust-grid">
              {LANDING_TRUST.map((item) => (
                <li key={item}>
                  <p className="trust-title">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="treatment"
          className="home-section bg-[var(--nl-cream)]"
          aria-labelledby="landing-treatment-heading"
        >
          <div className="nl-wrap">
            <h2 id="landing-treatment-heading" className="home-h2 max-w-3xl text-[var(--nl-navy)]">
              {LANDING_TREATMENT_HEADING}
            </h2>
            <div className="landing-tx-grid">
              {LANDING_TREATMENTS.map((item) => {
                const video = TREATMENT_VIDEOS[item.video];
                return (
                  <article key={item.href} className="tx-feature landing-tx">
                    <h3 className="landing-tx-title font-serif text-2xl font-semibold text-[var(--nl-navy)] md:text-[1.75rem]">
                      {item.title}
                    </h3>
                    <p className="tx-feature-benefit">{item.benefit}</p>
                    <ul className="landing-tx-points">
                      {item.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <ExplainerVideo
                      videoId={video.id}
                      poster={video.poster}
                      title={video.title}
                      playLabel={item.playLabel}
                      watchLabel="Watch explainer"
                    />
                    <div className="landing-tx-actions">
                      <ButtonLink href="#inquiry" variant="accent" className="landing-tx-cta">
                        {item.ctaLabel}
                      </ButtonLink>
                      <TextLink href={item.href}>{item.linkLabel}</TextLink>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="landing-why" aria-labelledby="landing-why-heading">
          <div className="nl-wrap">
            <div className="landing-why-block">
              <h2 id="landing-why-heading">{LANDING_WHY_HEADING}</h2>
              <p>{LANDING_WHY_TEXT}</p>
            </div>
          </div>
        </section>

        <section
          id="inquiry"
          className="landing-inquiry-section nl-anchor-section"
          aria-labelledby="inquiry-heading"
        >
          <div className="nl-wrap landing-inquiry">
            <div className="landing-inquiry-intro">
              <h2 id="inquiry-heading">{LANDING_INQUIRY_HEADING}</h2>
              <p>{LANDING_INQUIRY_SUPPORTING_TEXT}</p>
              <p>{LANDING_INQUIRY_FOLLOW_UP}</p>
              <ButtonLink href={SITE.phoneHref} variant="accent" className="landing-inquiry-call">
                {LANDING_INQUIRY_CALL_LABEL}
              </ButtonLink>
            </div>
            <div className="ct-form-frame landing-inquiry-form">
              <ContactForm source={ADVERTISING_LANDING_SOURCE} showReferralNote={false} />
            </div>
          </div>
        </section>

        <section
          id="psychiatrist"
          className="home-section bg-white"
          aria-labelledby="landing-psychiatrist-heading"
        >
          <div className="nl-wrap">
            <div className="landing-psychiatrist">
              <div className="about-au-portrait landing-psychiatrist-portrait">
                <Image
                  src={MEDIA.drAu}
                  alt="Dr. Chi Hung Au, psychiatrist and founder of NeuroLinks"
                  fill
                  sizes="(max-width: 768px) 100vw, 32vw"
                  className="object-cover object-[center_18%]"
                />
              </div>
              <div className="landing-psychiatrist-copy">
                <h2 id="landing-psychiatrist-heading" className="home-h2 text-[var(--nl-navy)]">
                  Meet your psychiatrist
                </h2>
                <p className="about-role">Dr Chi Hung Au</p>
                <p>{DR_AU_PARAS[0]}</p>
                <p className="landing-psychiatrist-link">
                  <TextLink href="/psychiatrist-tms-nanaimo/">Read the complete biography</TextLink>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="home-section bg-[var(--nl-navy)] text-white"
          aria-labelledby="landing-next-heading"
        >
          <div className="nl-wrap">
            <h2 id="landing-next-heading" className="home-h2 max-w-3xl">
              What happens next
            </h2>
            <div className="pathway-block mt-8">
              <div className="pathway-rule" aria-hidden="true" />
              <ol className="pathway grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
                {LANDING_NEXT_STEPS.map((step) => (
                  <li key={step.index}>
                    <p className="relative z-10 font-serif text-2xl text-[var(--nl-yellow)]">
                      {step.index}
                    </p>
                    <h3 className="mt-3 font-serif text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/75">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="home-section bg-white" aria-labelledby="landing-reviews-heading">
          <div className="nl-wrap">
            <h2 id="landing-reviews-heading" className="home-h2 text-[var(--nl-navy)]">
              Patient experiences
            </h2>
            <p className="mt-2 text-sm text-[var(--nl-muted)]">on Google Reviews</p>
            <div className="landing-reviews">
              {LANDING_REVIEWS.map((review) => (
                <blockquote key={review.who}>
                  <p>{review.text}</p>
                  <footer>— {review.who}</footer>
                </blockquote>
              ))}
            </div>
            <p className="landing-section-cta">
              <ButtonLink href="#inquiry" variant="accent" className="landing-inline-cta">
                {LANDING_REVIEWS_CTA_LABEL}
              </ButtonLink>
            </p>
          </div>
        </section>

        <section id="faq" className="home-section bg-[var(--nl-cream)]" aria-labelledby="landing-faq-heading">
          <div className="nl-wrap">
            <h2 id="landing-faq-heading" className="home-h2 text-[var(--nl-navy)]">
              Frequently Asked Questions
            </h2>
            <div className="landing-faq mt-6">
              <FaqAccordion items={LANDING_FAQS} />
            </div>
            <div className="landing-close">
              <p>{LANDING_CLOSE_TEXT}</p>
              <ButtonLink href="#inquiry" variant="accent" className="landing-inline-cta">
                Talk to our team
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
