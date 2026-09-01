import Image, { getImageProps } from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { ClinicMap } from "@/components/ClinicMap";
import { CtaBand } from "@/components/CtaBand";
import { Eyebrow } from "@/components/Eyebrow";
import { HomeReviews } from "@/components/HomeReviews";
import { TreatmentBenefits } from "@/components/TreatmentBenefits";
import { Reveal } from "@/components/Reveal";
import { SiteChrome } from "@/components/SiteChrome";
import { TextLink } from "@/components/TextLink";
import { HOME_HERO_ASSET, HOME_HERO_MOBILE_ASSET, MEDIA } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Transcranial Magnetic Stimulation & Ketamine Therapy in BC",
  description:
    "NeuroLinks Clinic in Nanaimo, BC offers Transcranial Magnetic Stimulation (TMS) and Ketamine therapy for treatment-resistant depression, OCD, and PTSD.",
  path: "/",
});

const TRUST = [
  {
    title: "Psychiatrist-led care",
    body: "Assessment and treatment recommendations led by a psychiatrist.",
  },
  {
    title: "Two treatment options",
    body: "TMS and ketamine offered when clinically appropriate.",
  },
  {
    title: "MSP-covered assessment",
    body: "The comprehensive psychiatric assessment is covered by MSP.",
  },
] as const;

const WHY = [
  {
    index: "01",
    title: "Psychiatrist-led assessment",
    body: "Diagnosis, treatment history and relevant medical factors are reviewed before treatment is recommended.",
  },
  {
    index: "02",
    title: "Individualized recommendations",
    body: "TMS, ketamine or another option is considered according to each patient’s clinical circumstances.",
  },
  {
    index: "03",
    title: "Careful monitoring",
    body: "Treatment response, tolerability and safety are monitored throughout care.",
  },
] as const;

const PATHWAY = [
  {
    index: "01",
    title: "Contact the clinic",
    body: "Contact NeuroLinks to ask about the assessment process.",
  },
  {
    index: "02",
    title: "Psychiatric assessment",
    body: "A psychiatrist reviews your symptoms, diagnosis, treatment history and relevant medical factors.",
  },
  {
    index: "03",
    title: "Treatment recommendation",
    body: "TMS, ketamine or another option may be recommended when clinically appropriate.",
  },
  {
    index: "04",
    title: "Treatment and monitoring",
    body: "Response, tolerability and safety are monitored, with recommendations adjusted according to clinical progress.",
  },
] as const;

const HERO_ALT = "TMS coil on the left and ketamine vial on the right at NeuroLinks";

/**
 * The hero photograph is art-directed per viewport: the landscape diptych on
 * desktop, the portrait re-crop on phones. `<picture>` keeps the hero to a
 * single request instead of loading both crops.
 */
function HeroPhoto() {
  const shared = { alt: HERO_ALT, sizes: IMG_SIZES.fullBleed, priority: true };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...shared,
    src: MEDIA.homeHeroIntegrated,
    width: HOME_HERO_ASSET.width,
    height: HOME_HERO_ASSET.height,
  });
  const { props: mobile } = getImageProps({
    ...shared,
    src: MEDIA.homeHeroMobile,
    width: HOME_HERO_MOBILE_ASSET.width,
    height: HOME_HERO_MOBILE_ASSET.height,
  });
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktopSrcSet} sizes={shared.sizes} />
      <img
        {...mobile}
        alt={HERO_ALT}
        className="hero-photo absolute inset-0 h-full w-full object-cover object-[center_36%] md:object-[center_42%]"
      />
    </picture>
  );
}

export default function HomePage() {
  return (
    <SiteChrome>
      <section id="home-hero" className="relative overflow-hidden bg-[var(--nl-navy)]">
        <div className="absolute inset-0">
          <HeroPhoto />
          <div className="home-hero-wash pointer-events-none absolute inset-0" aria-hidden="true" />
        </div>
        <div className="nl-wrap relative z-10 flex min-h-[clamp(32.5rem,78svh,38.5rem)] flex-col justify-end pt-[4.75rem] pb-8 md:min-h-[clamp(28rem,62vh,36rem)] md:justify-center md:py-16 lg:min-h-[clamp(32rem,64vh,38rem)] lg:py-16">
          <div className="home-hero-copy">
            <h1 className="hero-enter home-hero-heading whitespace-pre-line">
              {`Expert care for
complex mental
challenges`}
            </h1>
            <p className="hero-enter hero-enter-2 home-hero-lede">
              No matter how hard the past. We can always begin again.
            </p>
            <div className="hero-enter hero-enter-3 home-hero-actions">
              <ButtonLink href="/contact/" variant="accent" className="home-hero-primary">
                Request assessment
              </ButtonLink>
              <ButtonLink href="#treatment-options" variant="on-dark" className="home-hero-secondary">
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
              <li key={item.title}>
                <p className="trust-title">{item.title}</p>
                <p className="trust-body">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="treatment-options" className="home-section scroll-mt-24 bg-[var(--nl-cream)]">
        <div className="nl-wrap">
          <Reveal>
            <Eyebrow>Treatment options</Eyebrow>
            <h2 className="home-h2 mt-3 max-w-3xl text-[var(--nl-navy)]">
              Two distinct, psychiatrist-led therapies
            </h2>
            <p className="prose-measure mt-4 leading-relaxed text-[var(--nl-muted)]">
              TMS and ketamine work through different mechanisms. Suitability is determined through
              psychiatric assessment, not a one-size-fits-all protocol.
            </p>
            <p className="prose-measure mt-3 leading-relaxed text-[var(--nl-muted)]">
              Not every condition listed on this site is an automatic indication for TMS or ketamine;
              treatment is recommended only when clinically appropriate.
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
                  <Eyebrow>TMS</Eyebrow>
                  <h3 className="mt-2 font-serif text-2xl font-semibold text-[var(--nl-navy)] md:text-[1.75rem]">
                    Transcranial Magnetic Stimulation
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--nl-muted)]">
                    TMS is a non-invasive neuromodulation treatment with established evidence for
                    depression and certain other psychiatric conditions. Suitability depends on the
                    diagnosis, treatment history and protocol being considered. TMS is covered by
                    Veterans Affairs Canada and certain workers&apos; compensation programs.
                  </p>
                  <TextLink href="/about-tms-treatment-on-psychiatric-illness/">
                    Learn about TMS
                  </TextLink>
                </div>
              </article>
            </Reveal>
            <Reveal delayMs={80}>
              <article className="tx-feature group">
                <div className="img-frame relative aspect-[16/10]">
                  <Image
                    src={MEDIA.reception}
                    alt="Reception area"
                    fill
                    sizes={IMG_SIZES.half}
                    className="object-cover"
                  />
                </div>
                <div className="tx-feature-copy">
                  <Eyebrow>Ketamine</Eyebrow>
                  <h3 className="mt-2 font-serif text-2xl font-semibold text-[var(--nl-navy)] md:text-[1.75rem]">
                    Ketamine therapy
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--nl-muted)]">
                    Ketamine is administered in controlled clinical settings through intramuscular and
                    subcutaneous injections. Its rapid onset of action distinguishes it from
                    traditional antidepressants, often alleviating symptoms within hours or days.
                  </p>
                  <TextLink href="/ketamine-treatment-resistant-depression-nanaimo/">
                    Learn about ketamine
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
            <Eyebrow>Why NeuroLinks</Eyebrow>
            <h2 id="why-nl-heading" className="home-h2 mt-3 text-[var(--nl-navy)]">
              Why patients choose NeuroLinks
            </h2>
            <p className="mt-4 max-w-[34rem] leading-relaxed text-[var(--nl-muted)]">
              Specialist psychiatric assessment, individualized recommendations and careful
              monitoring throughout treatment.
            </p>
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
            <Eyebrow className="text-[var(--nl-yellow)]">Patient pathway</Eyebrow>
            <h2 id="pathway-heading" className="home-h2 mt-3 max-w-3xl">
              How care typically proceeds
            </h2>
          </Reveal>
          <ol className="pathway mt-10 grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
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
      </section>

      <TreatmentBenefits />

      <section className="home-section bg-white" aria-labelledby="funding-heading">
        <div className="nl-wrap">
          <Reveal>
            <aside className="funding-panel" aria-labelledby="funding-heading">
              <Eyebrow>Funding and coverage</Eyebrow>
              <h2 id="funding-heading" className="home-h2 mt-3 text-[var(--nl-navy)]">
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
                    third-party programs, including Veterans Affairs Canada and WorkSafeBC, may
                    provide coverage in eligible cases.
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
              <Eyebrow>Psychiatrist-led care</Eyebrow>
              <h2 id="team-heading" className="home-h2 mt-3 text-[var(--nl-navy)]">
                Specialist oversight from assessment through treatment
              </h2>
              <p className="mt-4 leading-relaxed text-[var(--nl-muted)]">
                NeuroLinks was founded by Nanaimo psychiatrist Dr. Chi Hung Au to provide carefully
                assessed treatment options for people facing complex or treatment-resistant mental
                health conditions. Treatment recommendations are based on diagnosis, treatment
                history, medical factors and individual needs.
              </p>
              <dl className="team-id">
                <dt>Dr. Chi Hung Au</dt>
                <dd>Psychiatrist · Clinical Assistant Professor, UBC</dd>
              </dl>
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
              <Eyebrow>Visit</Eyebrow>
              <h2 className="home-h2 mt-3 text-[var(--nl-navy)]">Find the clinic</h2>
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
        body="Contact NeuroLinks to learn more about the assessment process."
        href="/contact/"
        label="Request an assessment"
      />
    </SiteChrome>
  );
}
