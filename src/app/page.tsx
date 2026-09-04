import Image, { getImageProps } from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { ClinicMap } from "@/components/ClinicMap";
import { CtaBand } from "@/components/CtaBand";
import { HomeForwardMotion } from "@/components/HomeForwardMotion";
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

const FORWARD = [
  {
    index: "01",
    title: "Start with a conversation",
    body: "Contact us by phone, email or the contact form. We will answer your questions and explain how an assessment can be arranged.",
    icon: "talk",
  },
  {
    index: "02",
    title: "Understand the full picture",
    body: "A psychiatrist considers your symptoms, treatment history, medical factors, needs and preferences. Questionnaires may help complete the picture.",
    icon: "assess",
  },
  {
    index: "03",
    title: "Receive care tailored to you",
    body: "After the assessment, we explain options suited to your needs, including TMS, ketamine, medication, bright light therapy or another approach.",
    icon: "path",
  },
  {
    index: "04",
    title: "Keep moving forward",
    body: "If treatment begins, our team monitors your comfort, progress and response. If progress is uneven, we follow up and consider the next steps with you.",
    icon: "follow",
  },
] as const;

function ForwardIcon({ name }: { name: (typeof FORWARD)[number]["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "talk") {
    return (
      <svg {...common}>
        <path d="M4.5 15.2V7.8A2.3 2.3 0 0 1 6.8 5.5h7.4A2.3 2.3 0 0 1 16.5 7.8v5.2a2.3 2.3 0 0 1-2.3 2.3H9.2L4.5 18.4z" />
        <path d="M16.4 9.2h.8A2.3 2.3 0 0 1 19.5 11.5v5.1l-3.1-2.1H11.8" />
      </svg>
    );
  }
  if (name === "assess") {
    return (
      <svg {...common}>
        <path d="M8 4.5H5.5V7" />
        <path d="M16 4.5h2.5V7" />
        <path d="M8 19.5H5.5V17" />
        <path d="M16 19.5h2.5V17" />
        <circle cx="12" cy="12" r="3.2" />
      </svg>
    );
  }
  if (name === "path") {
    return (
      <svg {...common}>
        <path d="M6 19.2c0-4.2 2.4-6.2 6-6.2" />
        <path d="M12 13c3.6 0 6-2 6-6.2" />
        <circle cx="6" cy="19.2" r="1.35" fill="currentColor" stroke="none" />
        <circle cx="18" cy="6.8" r="1.35" fill="currentColor" stroke="none" />
        <circle cx="12" cy="13" r="1.45" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M7.2 9.2A5.1 5.1 0 0 1 16.6 8.4L18 6.8v4.4h-4.4" />
      <path d="M16.8 14.8A5.1 5.1 0 0 1 7.4 15.6L6 17.2v-4.4h4.4" />
    </svg>
  );
}

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

      <section id="treatment-options" className="home-section bg-[var(--nl-cream)]">
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
              <article className="tx-feature group home-tx-card">
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
                  <p className="tx-feature-benefit home-tx-benefit home-tx-benefit--tms">
                    Can be more effective than another conventional medication when antidepressants
                    have not helped enough.
                  </p>
                  <div className="home-tx-support">
                    <p className="tx-feature-support">
                      TMS is a <strong>non-invasive neuromodulation treatment</strong> with
                      established evidence for depression and certain other psychiatric conditions.
                    </p>
                    <p className="tx-feature-support">
                      It is <strong>generally well tolerated</strong>.
                    </p>
                    <p className="tx-feature-support">
                      Suitability depends on the diagnosis, treatment history and protocol being
                      considered.
                    </p>
                  </div>
                  <TextLink href="/about-tms-treatment-on-psychiatric-illness/">
                    Discover how TMS could help
                  </TextLink>
                </div>
              </article>
            </Reveal>
            <Reveal delayMs={80}>
              <article className="tx-feature group home-tx-card">
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
                  <p className="tx-feature-benefit home-tx-benefit home-tx-benefit--ket">
                    Improvement may begin within hours or days.
                  </p>
                  <div className="home-tx-support">
                    <p className="tx-feature-support">
                      Ketamine can reduce depressive symptoms{" "}
                      <strong>considerably faster than conventional antidepressants</strong>.
                    </p>
                    <p className="tx-feature-support">
                      It is administered through intramuscular and subcutaneous injections in a
                      controlled clinical setting with medical supervision.
                    </p>
                  </div>
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

      <section
        className="home-section home-forward text-white"
        aria-labelledby="pathway-heading"
      >
        <div className="nl-wrap">
          <Reveal>
            <h2 id="pathway-heading" className="home-h2 max-w-3xl">
              A clear way forward
            </h2>
            <p className="home-forward-lede">
              You do not need to choose a treatment before contacting us. Start by telling us what
              has not helped enough and what you hope will change. We will explain the next steps
              and support you throughout your care.
            </p>
          </Reveal>
          <HomeForwardMotion>
            <svg
              className="home-forward-rail-svg"
              viewBox="0 0 1000 84"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="home-forward-line" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#6f9c96" />
                  <stop offset="1" stopColor="#e8b923" />
                </linearGradient>
              </defs>
              <path
                d="M0 50.4 C 280 46, 720 32, 1000 27.2"
                fill="none"
                pathLength={1}
                stroke="url(#home-forward-line)"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
            <ol className="home-forward-list">
              {FORWARD.map((step) => (
                <li key={step.index} className="home-forward-item">
                  <span className="home-forward-node" aria-hidden="true">
                    <ForwardIcon name={step.icon} />
                  </span>
                  <div className="home-forward-copy">
                    <p className="home-forward-step">Step {step.index}</p>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </HomeForwardMotion>
          <div className="home-forward-foot">
            <ButtonLink href="/contact/" variant="accent" className="home-forward-cta">
              Talk to our team
              <span aria-hidden="true">→</span>
            </ButtonLink>
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

      <section id="location" className="home-section bg-white">
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
