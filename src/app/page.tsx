import Image, { getImageProps } from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { CtaBand } from "@/components/CtaBand";
import { Eyebrow } from "@/components/Eyebrow";
import { NumberedBlock } from "@/components/NumberedBlock";
import { Reveal } from "@/components/Reveal";
import { SiteChrome } from "@/components/SiteChrome";
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
    body: "A comprehensive evaluation, covered by MSP, reviews your situation and possible options. A psychiatrist-led assessment reviews your history and explores options, including TMS and ketamine. This evaluation is completely covered by MSP.",
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
    src: MEDIA.homeHero,
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
        className="hero-photo absolute inset-0 h-full w-full object-cover object-top md:object-center lg:object-[center_40%]"
      />
    </picture>
  );
}

export default function HomePage() {
  return (
    <SiteChrome>
      <section id="home-hero" className="relative overflow-hidden bg-[var(--nl-navy)]">
        {/* Full bleed on phones; the banner-above-copy layout returns from md up. */}
        <div className="absolute inset-0 md:relative md:aspect-[2/1] md:w-full lg:absolute lg:inset-0 lg:aspect-auto">
          <HeroPhoto />
          <div className="hero-scrim pointer-events-none absolute inset-0 md:hidden" aria-hidden="true" />
          <div
            className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[var(--nl-navy)]/78 via-[var(--nl-navy)]/42 to-transparent md:block md:max-lg:from-[var(--nl-navy)]/20 md:max-lg:via-transparent md:max-lg:to-[var(--nl-navy)]/15"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[var(--nl-navy)]/55 to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-28 bg-gradient-to-t from-[var(--nl-navy)]/50 to-transparent lg:block"
            aria-hidden="true"
          />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[clamp(540px,72svh,610px)] max-w-6xl flex-col justify-end px-5 pt-20 pb-8 md:min-h-0 md:justify-center md:px-4 md:py-10 lg:min-h-[clamp(540px,72vh,640px)] lg:py-16">
          <div className="hero-intro max-w-[45rem]">
            {/* The mobile floor is low enough to keep the three-line break at 320px. */}
            <h1 className="hero-enter max-w-[16ch] font-serif text-[clamp(2.05rem,11vw,4rem)] font-semibold leading-[1.02] text-white md:leading-[1.04] lg:text-[clamp(3.5rem,5.3vw,5rem)] lg:leading-[1.02]">
              Expert care for complex mental challenges
            </h1>
            <p className="hero-enter hero-enter-2 mt-4 max-w-[32ch] text-[0.9375rem] leading-[1.55] text-white/90 md:mt-5 md:max-w-xl md:text-lg md:leading-relaxed">
              No matter how hard the past. We can always begin again.
            </p>
            <div className="hero-enter hero-enter-3 mt-6 flex flex-wrap gap-3 md:mt-8">
              <ButtonLink
                href="/about-tms-treatment-on-psychiatric-illness/"
                variant="accent"
                className="grow basis-34 whitespace-nowrap md:grow-0 md:basis-auto"
              >
                Explore TMS
              </ButtonLink>
              <ButtonLink
                href="/ketamine-treatment-resistant-depression-nanaimo/"
                variant="on-dark"
                className="grow basis-34 whitespace-nowrap md:grow-0 md:basis-auto"
              >
                Explore Ketamine
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--nl-cream)] px-4 py-16 md:py-[4.5rem]">
        <div className="mx-auto max-w-6xl">
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
              <article className="group bg-white">
                <div className="img-frame relative aspect-[16/10]">
                  <Image
                    src={MEDIA.tmsMachine}
                    alt="TMS treatment"
                    fill
                    sizes={IMG_SIZES.half}
                    className="object-cover"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <Eyebrow>01 · TMS</Eyebrow>
                  <h3 className="mt-3 font-serif text-2xl font-semibold text-[var(--nl-navy)] md:text-[1.85rem]">
                    Transcranial Magnetic Stimulation
                  </h3>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--nl-muted)]">
                    Transcranial magnetic stimulation is an FDA-approved non-invasive neuromodulation
                    therapy for treatment-resistant depression, obsessive-compulsive disorder, and
                    post-traumatic stress disorder. TMS is covered by Veterans Affair Canada and
                    certain worker compensation programs.
                  </p>
                  <div className="mt-6">
                    <ButtonLink href="/about-tms-treatment-on-psychiatric-illness/">
                      How TMS transforms mental illness
                    </ButtonLink>
                  </div>
                </div>
              </article>
            </Reveal>
            <Reveal delayMs={80}>
              <article className="group bg-white">
                <div className="img-frame relative aspect-[16/10]">
                  <Image
                    src={MEDIA.reception}
                    alt="Reception area"
                    fill
                    sizes={IMG_SIZES.half}
                    className="object-cover"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <Eyebrow>02 · Ketamine</Eyebrow>
                  <h3 className="mt-3 font-serif text-2xl font-semibold text-[var(--nl-navy)] md:text-[1.85rem]">
                    Ketamine therapy
                  </h3>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--nl-muted)]">
                    Ketamine is administered in controlled clinical settings through intramuscular and
                    subcutaneous injections. Its rapid onset of action distinguishes it from
                    traditional antidepressants, often alleviating symptoms within hours or days.
                  </p>
                  <div className="mt-6">
                    <ButtonLink
                      href="/ketamine-treatment-resistant-depression-nanaimo/"
                      variant="ghost"
                    >
                      How Ketamine uplifts mental wellbeing
                    </ButtonLink>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
          <Reveal>
            <div className="mt-10">
              <ButtonLink href="/services-psychiatric-tms-ketamine-treatment/">
                More about our service
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[var(--nl-navy)] px-4 py-16 text-white md:py-[4.5rem]">
        <div className="mx-auto max-w-6xl">
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

      <section className="bg-[var(--nl-cream)] px-4 py-16 md:py-[4.5rem]">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Eyebrow>Treatment benefits</Eyebrow>
            <h2 className="mt-3 max-w-3xl font-serif text-[clamp(1.85rem,3.6vw,3rem)] font-semibold leading-tight text-[var(--nl-navy)]">
              What these treatments can offer
            </h2>
            <p className="prose-measure mt-4 leading-relaxed text-[var(--nl-muted)]">
              Outcomes vary. Treatment is recommended only when clinically appropriate. Medication
              should not be changed without medical guidance.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-x-12 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
            <Reveal>
              <NumberedBlock index="01" title="Non-invasive TMS">
                Transcranial magnetic stimulation is an FDA-approved non-invasive neuromodulation
                therapy. It does not require anesthesia.
              </NumberedBlock>
            </Reveal>
            <Reveal delayMs={40}>
              <NumberedBlock index="02" title="Compared with medication alone">
                TMS is more effective than conventional medication treatments with minimal side
                effects.
              </NumberedBlock>
            </Reveal>
            <Reveal delayMs={80}>
              <NumberedBlock index="03" title="Coverage in selected programs">
                TMS is covered by Veterans Affair Canada and certain worker compensation programs.
              </NumberedBlock>
            </Reveal>
            <Reveal>
              <NumberedBlock index="04" title="Ketamine onset">
                Ketamine&apos;s rapid onset of action distinguishes it from traditional
                antidepressants, often alleviating symptoms within hours or days.
              </NumberedBlock>
            </Reveal>
            <Reveal delayMs={40}>
              <NumberedBlock index="05" title="Supervised administration">
                Ketamine is administered in controlled clinical settings through intramuscular and
                subcutaneous injections.
              </NumberedBlock>
            </Reveal>
            <Reveal delayMs={80}>
              <NumberedBlock index="06" title="MSP-covered assessment">
                A comprehensive psychiatric evaluation is completely covered by MSP.
              </NumberedBlock>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:py-[4.5rem]">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div className="img-frame relative aspect-[4/3]">
                <Image
                  src={MEDIA.team}
                  alt="Neurolinks team"
                  fill
                  sizes={IMG_SIZES.half}
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal delayMs={70}>
              <Eyebrow>The clinic</Eyebrow>
              <h2 className="mt-3 font-serif text-[clamp(1.85rem,3.6vw,3rem)] font-semibold leading-tight text-[var(--nl-navy)]">
                About us
              </h2>
              <p className="mt-4 text-lg text-[var(--nl-navy)]">
                We are dedicated to helping people struggling with psychiatric illness.
              </p>
              <p className="mt-4 leading-relaxed text-[var(--nl-muted)]">
                We empathize with patients&apos; struggles and recognize the shortcomings of
                conventional medicine. NeuroLinks was founded by psychiatrist Dr. Chi Hung Au in
                Nanaimo.
              </p>
              <div className="mt-8">
                <ButtonLink href="/psychiatrist-tms-nanaimo/">Find out more</ButtonLink>
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
                <a
                  className="text-sm font-semibold text-[var(--nl-blue-bright)] underline underline-offset-4"
                  href={SITE.googleListingUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  View all Google reviews
                </a>
              </p>
              <div className="mt-8 grid gap-8 md:grid-cols-3">
                {REVIEWS.map((r) => (
                  <blockquote key={r.name} className="border-l-2 border-[var(--nl-yellow)] pl-5">
                    <p className="text-sm leading-relaxed text-[var(--nl-ink)]">{r.text}</p>
                    <footer className="mt-4 text-sm font-semibold text-[var(--nl-navy)]">
                      — {r.name}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="location" className="scroll-mt-24 bg-[var(--nl-cream)] px-4 py-16 md:py-[4.5rem]">
        <Reveal>
          <div className="mx-auto grid max-w-6xl items-stretch gap-8 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]">
            <div className="flex flex-col justify-center">
              <Eyebrow>Visit</Eyebrow>
              <h2 className="mt-3 font-serif text-[clamp(1.85rem,3.6vw,3rem)] font-semibold text-[var(--nl-navy)]">
                Find the clinic
              </h2>
              <p className="mt-4 max-w-md leading-relaxed">{SITE.addressLine}</p>
              <p className="mt-2 text-[var(--nl-muted)]">Free parking is available</p>
              <p className="mt-6">
                <a
                  className="inline-flex min-h-11 items-center font-semibold text-[var(--nl-blue-bright)] underline"
                  href={SITE.phoneHref}
                >
                  {SITE.phone}
                </a>
              </p>
              <div className="mt-6">
                <ButtonLink href={SITE.mapsUrl} variant="ghost">
                  Get directions
                </ButtonLink>
              </div>
            </div>
            <div className="relative min-h-[18rem] overflow-hidden bg-white md:min-h-[22rem] lg:min-h-[24rem]">
              <iframe
                title="6010 Brickyard Road, Nanaimo, BC"
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://maps.google.com/maps?q=6010%20Brickyard%20Road%2C%20Nanaimo%2C%20BC&t=m&z=15&output=embed&iwloc=near"
              />
            </div>
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
