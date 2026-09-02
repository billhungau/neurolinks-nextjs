import Image, { getImageProps } from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { ClinicMap } from "@/components/ClinicMap";
import { CtaBand } from "@/components/CtaBand";
import { HomeReviews } from "@/components/HomeReviews";
import { Reveal } from "@/components/Reveal";
import { SiteChrome } from "@/components/SiteChrome";
import { TextLink } from "@/components/TextLink";
import { HOME_HERO_ASSET, MEDIA } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { PAGE_OG_IMAGES, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "TMS & Ketamine Therapy in Nanaimo, BC | NeuroLinks",
  description:
    "NeuroLinks Clinic in Nanaimo, BC offers Transcranial Magnetic Stimulation (TMS) and Ketamine therapy for treatment-resistant depression, OCD, and PTSD.",
  path: "/",
  image: PAGE_OG_IMAGES.home,
});

const TRUST = [
  "Psychiatrist-led care",
  "TMS and ketamine treatment options",
  "MSP-covered assessment",
] as const;

const WHY = [
  {
    index: "01",
    title: "More options, care tailored to you",
    body: "With both TMS and ketamine available, NeuroLinks offers options beyond medication alone. We consider your treatment history, current symptoms, needs and preferences to recommend an individualized approach.",
  },
  {
    index: "02",
    title: "Clear guidance, informed choices",
    body: "We take time to explain your options, potential benefits, side effects and what treatment involves. Your questions and preferences matter, and we work with you to make decisions you understand and feel comfortable with.",
  },
  {
    index: "03",
    title: "Support that continues beyond treatment",
    body: "We follow up after treatment to understand how you are doing, recognizing that symptoms can fluctuate and improvement is not always straightforward. If treatment has not helped enough, we review factors that may affect your response and explore appropriate next steps with you.",
  },
] as const;

const PATHWAY = [
  {
    index: "01",
    title: "Contact the clinic",
    body: "Phone, email, or the contact form on this site to ask about a psychiatric assessment.",
  },
  {
    index: "02",
    title: "Physician referral",
    body: "An appropriate physician referral is required for an MSP-covered assessment. The clinic can explain referral requirements when you enquire.",
  },
  {
    index: "03",
    title: "Psychiatric assessment",
    body: "A psychiatrist reviews your diagnosis, treatment history, and relevant medical factors. Questionnaires may be used to understand symptom severity.",
  },
  {
    index: "04",
    title: "After the assessment",
    body: "TMS, ketamine, or another option may be recommended when clinically appropriate. Treatment coverage is separate from the assessment.",
  },
] as const;

const HERO_ALT = "TMS coil on the left and ketamine vial on the right at NeuroLinks";

/**
 * One landscape photograph for every viewport. Phones show it full-width at
 * the top of the hero; desktop covers the current hero height without a
 * separate crop file.
 */
function HeroPhoto() {
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
    <img {...props} alt={HERO_ALT} className="hero-photo" />
  );
}

export default function HomePage() {
  return (
    <SiteChrome>
      <section id="home-hero" className="home-hero">
        <div className="home-hero-media">
          <HeroPhoto />
          <div className="home-hero-wash" aria-hidden="true" />
        </div>
        <div className="nl-wrap home-hero-copy-wrap">
          <div className="hero-intro home-hero-copy">
            <h1 className="hero-enter home-hero-heading whitespace-pre-line">
              {`Expert care for
complex mental
challenges`}
            </h1>
            <p className="hero-enter hero-enter-2 home-hero-lede">
              <span>Psychiatrist-led TMS and ketamine therapy in Nanaimo, serving Vancouver Island.</span>
              <span>Care tailored to your needs.</span>
            </p>
            <div className="hero-enter hero-enter-3 home-hero-actions">
              <ButtonLink href="/contact/" variant="accent" className="home-hero-primary">
                Request assessment
              </ButtonLink>
              <ButtonLink href="#treatment-options" variant="on-dark" className="home-hero-secondary !font-medium">
                Explore treatments
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Clinic facts">
        <div className="nl-wrap">
          <ul className="trust-grid">
            {TRUST.map((item) => (
              <li key={item}>
                <p className="trust-title">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="treatment-options" className="home-section scroll-mt-24 bg-[var(--nl-cream)]">
        <div className="nl-wrap">
          <Reveal>
            <h2 className="home-h2 max-w-3xl text-[var(--nl-navy)]">
              Treatment options
            </h2>
            <p className="prose-measure mt-4 leading-relaxed text-[var(--nl-muted)]">
              We tailor care to your needs, drawing on options including medication, bright light
              therapy, TMS and ketamine.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <Reveal>
              <article className="tx-feature group">
                <div className="img-frame relative aspect-[16/10]">
                  <Image
                    src={MEDIA.tmsMachine}
                    alt="TMS treatment"
                    fill
                    sizes={IMG_SIZES.half}
                    className="object-cover"
                  />
                </div>
                <div className="tx-feature-copy">
                  <h3 className="font-serif text-2xl font-semibold text-[var(--nl-navy)] md:text-[1.75rem]">
                    Transcranial Magnetic Stimulation
                  </h3>
                  <p className="tx-feature-benefit">
                    Can be more effective than another conventional medication when antidepressants
                    have not helped enough.
                  </p>
                  <p className="tx-feature-support">
                    TMS is a non-invasive neuromodulation treatment with established evidence for
                    depression and certain other psychiatric conditions. It is generally well
                    tolerated. Suitability depends on the diagnosis, treatment history and protocol
                    being considered.
                  </p>
                  <TextLink href="/about-tms-treatment-on-psychiatric-illness/">
                    Discover how TMS could help
                  </TextLink>
                </div>
              </article>
            </Reveal>
            <Reveal delayMs={80}>
              <article className="tx-feature group">
                <div className="img-frame relative aspect-[16/10]">
                  <Image
                    src={MEDIA.ketamineHero}
                    alt="Ketamine treatment room with a recliner, window and side table at NeuroLinks"
                    fill
                    sizes={IMG_SIZES.half}
                    loading="lazy"
                    className="object-cover object-[58%_center]"
                  />
                </div>
                <div className="tx-feature-copy">
                  <h3 className="font-serif text-2xl font-semibold text-[var(--nl-navy)] md:text-[1.75rem]">
                    Ketamine therapy
                  </h3>
                  <p className="tx-feature-benefit">
                    Improvement may begin within hours or days.
                  </p>
                  <p className="tx-feature-support">
                    Ketamine can reduce depressive symptoms considerably faster than conventional
                    antidepressants. It is administered through intramuscular and subcutaneous
                    injections in a controlled clinical setting with medical supervision.
                  </p>
                  <TextLink href="/ketamine-treatment-resistant-depression-nanaimo/">
                    Explore how ketamine could help
                  </TextLink>
                </div>
              </article>
            </Reveal>
          </div>
          <Reveal>
            <div className="mt-7">
              <TextLink href="/services-psychiatric-tms-ketamine-treatment/">
                More about our service
              </TextLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="home-section why-nl bg-white" aria-labelledby="why-nl-heading">
        <div className="nl-wrap why-nl-grid">
          <Reveal>
            <h2 id="why-nl-heading" className="home-h2 text-[var(--nl-navy)]">
              Why patients choose NeuroLinks
            </h2>
          </Reveal>
          <ol className="why-nl-list">
            {WHY.map((item, index) => (
              <Reveal key={item.index} delayMs={index * 70}>
                <li>
                  <p className="why-nl-index">{item.index}</p>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-section bg-[var(--nl-navy)] text-white" aria-labelledby="pathway-heading">
        <div className="nl-wrap">
          <Reveal>
            <h2 id="pathway-heading" className="home-h2 max-w-3xl">
              How care typically proceeds
            </h2>
          </Reveal>
          <div className="pathway-block mt-8">
            <div className="pathway-rule" aria-hidden="true" />
            <ol className="pathway grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
              {PATHWAY.map((step, index) => (
                <Reveal key={step.index} delayMs={index * 60}>
                  <li>
                    <p className="relative z-10 font-serif text-2xl text-[var(--nl-yellow)]">
                      {step.index}
                    </p>
                    <h3 className="mt-3 font-serif text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/75">{step.body}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="home-section bg-white" aria-labelledby="funding-heading">
        <div className="nl-wrap">
          <Reveal>
            <aside className="funding-panel" aria-labelledby="funding-heading">
              <h2 id="funding-heading" className="home-h2 text-[var(--nl-navy)]">
                Assessment and treatment funding
              </h2>
              <dl className="funding-grid">
                <div>
                  <dt>MSP-covered assessment</dt>
                  <dd>
                    The comprehensive psychiatric assessment is covered by MSP for eligible BC
                    residents when referral requirements are met.
                  </dd>
                </div>
                <div>
                  <dt>Treatment coverage</dt>
                  <dd>
                    TMS and ketamine treatment are not generally covered by MSP. Selected
                    third-party programs, including Veterans Affairs Canada and workers&apos;
                    compensation programs such as WorkSafeBC, may provide coverage in eligible
                    cases.
                  </dd>
                </div>
                <div>
                  <dt>Your circumstances</dt>
                  <dd>
                    Approval depends on eligibility and the requirements of the individual funding
                    program. Contact the clinic to ask about your circumstances.
                  </dd>
                </div>
              </dl>
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="home-section bg-[var(--nl-cream)]" aria-labelledby="team-heading">
        <div className="nl-wrap">
          <div className="team-split">
            <Reveal>
              <div className="img-frame team-photo relative">
                <Image
                  src={MEDIA.team}
                  alt="Neurolinks team"
                  fill
                  sizes={IMG_SIZES.half}
                  className="object-cover object-[center_20%]"
                />
              </div>
            </Reveal>
            <Reveal delayMs={70}>
              <h2 id="team-heading" className="home-h2 text-[var(--nl-navy)]">
                The people providing care
              </h2>
              <p className="mt-4 leading-relaxed text-[var(--nl-muted)]">
                At NeuroLinks, our psychiatrist and treatment team work together to provide TMS and
                ketamine care, with attention to your comfort, progress and individual needs.
              </p>
              <div className="mt-5">
                <TextLink href="/psychiatrist-tms-nanaimo/">Meet the team</TextLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <HomeReviews />

      <section id="location" className="home-section scroll-mt-24 bg-white">
        <Reveal>
          <div className="nl-wrap location-split">
            <div className="flex flex-col justify-center">
              <h2 className="home-h2 text-[var(--nl-navy)]">Find the clinic</h2>
              <p className="mt-4 max-w-md leading-relaxed">{SITE.addressLine}</p>
              <p className="mt-2 text-[var(--nl-muted)]">Free parking is available</p>
              <p className="mt-5">
                <a
                  className="inline-flex min-h-11 items-center font-semibold text-[var(--nl-blue-bright)] underline underline-offset-4"
                  href={SITE.phoneHref}
                >
                  {SITE.phone}
                </a>
              </p>
              <div className="mt-2">
                <TextLink href={SITE.mapsUrl}>Get directions</TextLink>
              </div>
            </div>
            <ClinicMap className="map-embed--home" />
          </div>
        </Reveal>
      </section>

      <CtaBand
        title="Not sure whether TMS or ketamine may be appropriate?"
        body="Our team can explain the assessment process and referral requirements."
        href="/contact/"
        label="Request an assessment"
      />
    </SiteChrome>
  );
}
