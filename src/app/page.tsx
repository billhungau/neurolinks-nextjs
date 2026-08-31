import Image, { getImageProps } from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { ClinicMap } from "@/components/ClinicMap";
import { CtaBand } from "@/components/CtaBand";
import { Eyebrow } from "@/components/Eyebrow";
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

const REVIEWS = [
  {
    name: "B. J.",
    text: "Dr Au and his team took amazing care of me! He was very patient and thorough with diagnosis and my options- plus providing all the information on TMS treatment.",
  },
  {
    name: "P. R.",
    text: "I took my daughter to see Dr. Chi Hung for the first time today. We have struggled to find the right help for at least 5 years now and we are so grateful to Dr. Chi Hung and his staff for finally LISTENING.",
  },
  {
    name: "S. H.",
    text: "TMS has been a integral treatment in healing myself from depression and anxiety. TMS potentially saved my life, for I was suicidal before treatment. Forever grateful to Dr. Au and his staff.",
  },
];

const PATHWAY = [
  {
    index: "01",
    title: "Referral or inquiry",
    body: "Patients and families may contact the clinic. Physicians can complete the online referral or fax the PDF form.",
  },
  {
    index: "02",
    title: "Psychiatric assessment",
    body: "A psychiatrist reviews your diagnosis, treatment history, medical factors and goals. The assessment is covered by MSP.",
  },
  {
    index: "03",
    title: "Individualized treatment planning",
    body: "If TMS is deemed suitable, standard or accelerated plans may be considered. Standard care is typically five sessions a week for at least six weeks; an accelerated five-day course is also available. Ketamine is tailored to your needs, typically two sessions a week for up to three weeks, with adjustments based on your response.",
  },
  {
    index: "04",
    title: "Treatment and outcome monitoring",
    body: "Care is delivered in a medically supervised setting, with adjustments based on your response.",
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
        className="hero-photo absolute inset-0 h-full w-full object-cover object-[center_top] md:object-[center_42%]"
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
              No matter how hard the past, we can always begin again.
            </p>
            <div className="hero-enter hero-enter-3 home-hero-actions">
              <ButtonLink href="/about-tms-treatment-on-psychiatric-illness/" variant="accent">
                Explore TMS
              </ButtonLink>
              <ButtonLink
                href="/ketamine-treatment-resistant-depression-nanaimo/"
                variant="on-dark"
              >
                Explore Ketamine
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="nl-section bg-[var(--nl-cream)]">
        <div className="nl-wrap">
          <Reveal>
            <Eyebrow>Treatment options</Eyebrow>
            <h2 className="mt-3 max-w-3xl font-serif text-[clamp(1.85rem,3.6vw,3rem)] font-semibold leading-tight text-[var(--nl-navy)]">
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
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
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
                  <Eyebrow>01 · TMS</Eyebrow>
                  <h3 className="mt-3 font-serif text-2xl font-semibold text-[var(--nl-navy)] md:text-[1.85rem]">
                    Transcranial Magnetic Stimulation
                  </h3>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--nl-muted)]">
                    TMS is a non-invasive neuromodulation treatment with established evidence for
                    depression and certain other psychiatric conditions. Suitability depends on the
                    diagnosis, treatment history and protocol being considered. TMS is covered by
                    Veterans Affair Canada and certain worker compensation programs.
                  </p>
                  <TextLink href="/about-tms-treatment-on-psychiatric-illness/">
                    How TMS transforms mental illness
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
                  <Eyebrow>02 · Ketamine</Eyebrow>
                  <h3 className="mt-3 font-serif text-2xl font-semibold text-[var(--nl-navy)] md:text-[1.85rem]">
                    Ketamine therapy
                  </h3>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--nl-muted)]">
                    Ketamine is administered in controlled clinical settings through intramuscular and
                    subcutaneous injections. Its rapid onset of action distinguishes it from
                    traditional antidepressants, often alleviating symptoms within hours or days.
                  </p>
                  <TextLink href="/ketamine-treatment-resistant-depression-nanaimo/">
                    How Ketamine uplifts mental wellbeing
                  </TextLink>
                </div>
              </article>
            </Reveal>
          </div>
          <Reveal>
            <div className="mt-10">
              <TextLink href="/services-psychiatric-tms-ketamine-treatment/">
                More about our service
              </TextLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="nl-section bg-[var(--nl-navy)] text-white">
        <div className="nl-wrap">
          <Reveal>
            <Eyebrow className="text-[var(--nl-yellow)]">Patient pathway</Eyebrow>
            <h2 className="mt-3 max-w-3xl font-serif text-[clamp(1.85rem,3.6vw,3rem)] font-semibold leading-tight">
              How care typically proceeds
            </h2>
            <p className="prose-measure mt-4 text-sm leading-relaxed text-white/75">
              An inquiry or referral leads to assessment. Treatment is offered only when it is
              clinically appropriate.
            </p>
          </Reveal>
          <ol className="pathway mt-12 grid list-none gap-10 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {PATHWAY.map((step, index) => (
              <Reveal key={step.index} delayMs={index * 60}>
                <li>
                  <p className="relative z-10 font-serif text-2xl text-[var(--nl-yellow)]">
                    {step.index}
                  </p>
                  <h3 className="mt-4 font-serif text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/75">{step.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <TreatmentBenefits />

      <section className="nl-section bg-white">
        <div className="nl-wrap">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16">
            <Reveal>
              <div className="img-frame relative aspect-[4/3] overflow-hidden rounded-[var(--nl-radius-lg)]">
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
              <h2 className="mt-3 font-serif text-[clamp(1.85rem,3.6vw,3rem)] font-semibold leading-tight text-[var(--nl-navy)]">
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
              <div className="mt-6">
                <TextLink href="/psychiatrist-tms-nanaimo/">Meet the team</TextLink>
              </div>
            </Reveal>
          </div>
          <Reveal>
            <div className="mt-16 border-t border-[var(--nl-navy)]/10 pt-12">
              <Eyebrow>Google reviews</Eyebrow>
              <h2 className="mt-3 font-serif text-[clamp(1.75rem,3.2vw,2.35rem)] font-semibold text-[var(--nl-navy)]">
                What our patients say
              </h2>
              <p className="prose-measure mt-4 leading-relaxed text-[var(--nl-muted)]">
                Selected reviews from patients who shared their experiences on Google.
              </p>
              <p className="mt-3">
                <TextLink href={SITE.googleListingUrl}>View all Google reviews</TextLink>
              </p>
              <div className="mt-8 grid gap-5 md:grid-cols-3 md:gap-6">
                {REVIEWS.map((r) => (
                  <blockquote key={r.name} className="review-card">
                    <p className="review-mark" aria-hidden="true">
                      “
                    </p>
                    <p className="text-sm leading-relaxed text-[var(--nl-ink)]">{r.text}</p>
                    <footer className="mt-5 text-sm font-semibold text-[var(--nl-navy)]">
                      {r.name}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="location" className="nl-section scroll-mt-24 bg-[var(--nl-cream)]">
        <Reveal>
          <div className="nl-wrap grid items-stretch gap-8 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] lg:gap-12">
            <div className="flex flex-col justify-center">
              <Eyebrow>Visit</Eyebrow>
              <h2 className="mt-3 font-serif text-[clamp(1.85rem,3.6vw,3rem)] font-semibold text-[var(--nl-navy)]">
                Find the clinic
              </h2>
              <p className="mt-4 max-w-md leading-relaxed">{SITE.addressLine}</p>
              <p className="mt-2 text-[var(--nl-muted)]">Free parking is available</p>
              <p className="mt-6">
                <a
                  className="inline-flex min-h-11 items-center font-semibold text-[var(--nl-blue-bright)] underline underline-offset-4"
                  href={SITE.phoneHref}
                >
                  {SITE.phone}
                </a>
              </p>
              <div className="mt-4">
                <TextLink href={SITE.mapsUrl}>Get directions</TextLink>
              </div>
            </div>
            <ClinicMap />
          </div>
        </Reveal>
      </section>

      <CtaBand
        eyebrow="Questions?"
        title="Seeking support for your mental wellbeing or a loved one's?"
        body="Don't hesitate to contact us – we're here to help you navigate your journey."
        href="/contact/"
        label="Contact us"
      />
    </SiteChrome>
  );
}
