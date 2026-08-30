import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { CtaBand } from "@/components/CtaBand";
import { Eyebrow } from "@/components/Eyebrow";
import { NumberedBlock } from "@/components/NumberedBlock";
import { OVERLAY_ANCHOR_ID } from "@/components/SiteHeader";
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

const SERVICES = [
  {
    href: "/services-psychiatric-tms-ketamine-treatment/#assessment",
    img: MEDIA.eval,
    alt: "Psychiatric evaluation",
    title: "Psychiatric Evaluation",
    body: "A psychiatrist-led assessment reviews your history and explores options, including TMS and ketamine. This evaluation is completely covered by MSP.",
  },
  {
    href: "/services-psychiatric-tms-ketamine-treatment/#tms",
    img: MEDIA.tmsClinic,
    alt: "TMS treatment",
    title: "Transcranial Magnetic Stimulation",
    body: "A non-invasive option when TMS is deemed suitable. Standard care is typically five sessions a week for at least six weeks; an accelerated five-day course is also available.",
  },
  {
    href: "/services-psychiatric-tms-ketamine-treatment/#ketamine",
    img: MEDIA.office,
    alt: "NeuroLinks clinic office",
    title: "Ketamine Treatment",
    body: "Ketamine is tailored to your needs, typically two sessions a week for up to three weeks, with adjustments based on your response.",
  },
];

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
        className="hero-photo absolute inset-0 h-full w-full object-cover object-top md:object-center"
      />
    </picture>
  );
}

export default function HomePage() {
  return (
    <SiteChrome overlayHeader>
      <section id={OVERLAY_ANCHOR_ID} className="relative overflow-hidden bg-[var(--nl-navy)]">
        <div className="absolute inset-0">
          <HeroPhoto />
          <div className="hero-scrim pointer-events-none absolute inset-0 md:hidden" aria-hidden="true" />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--nl-navy)]/55 to-transparent md:hidden"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[var(--nl-navy)]/35 via-[var(--nl-navy)]/70 to-[var(--nl-navy)]/35 md:block"
            aria-hidden="true"
          />
        </div>
        <div className="relative z-10 flex min-h-[clamp(540px,72svh,610px)] flex-col justify-end px-5 pt-20 pb-8 md:mx-auto md:min-h-[min(42rem,calc(100svh-4.5rem))] md:max-w-6xl md:px-4 md:pt-24 md:pb-16 lg:pb-20">
          <div className="md:ml-[18%] md:max-w-xl lg:ml-[20%]">
            {/* White over the photograph for AA; the accent yellow returns on desktop.
                Below 360px the copy fills the hero, so the kicker steps aside. */}
            <Eyebrow className="hero-enter max-[359px]:hidden text-white md:text-[var(--nl-yellow)]">
              NeuroLinks · Nanaimo, BC
            </Eyebrow>
            {/* The mobile size tracks the viewport so the three-line break holds from 320px up. */}
            <h1 className="hero-enter hero-enter-2 mt-3 font-serif text-[clamp(2.05rem,11.4vw,2.75rem)] leading-[1.02] font-semibold text-white md:mt-4 md:max-w-[16ch] md:text-[clamp(2rem,5.4vw,4.35rem)] md:leading-[1.08]">
              Expert care for complex mental challenges
            </h1>
            <p className="hero-enter hero-enter-3 mt-4 max-w-[32ch] text-[0.9375rem] leading-[1.55] text-white/90 md:mt-5 md:max-w-[38rem] md:text-lg md:leading-relaxed">
              No matter how hard the past. We can always begin again.
            </p>
            <div className="hero-enter hero-enter-4 mt-6 flex flex-wrap gap-3 md:mt-8">
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
            <p className="hero-enter hero-enter-4 mt-5 text-sm text-white/80 md:mt-6">
              Referring a patient?{" "}
              <Link
                className="font-semibold text-[var(--nl-yellow)] underline underline-offset-4"
                href="/physician-referral/"
              >
                Physician referral
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[var(--nl-cream)] px-4 py-14 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Eyebrow>Treatment options</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-serif text-[clamp(1.75rem,3.6vw,3rem)] font-semibold leading-tight text-[var(--nl-navy)]">
            Two distinct, psychiatrist-led therapies
          </h2>
          <p className="prose-measure mt-4 leading-relaxed text-[var(--nl-muted)]">
            TMS and ketamine work through different mechanisms. Suitability is determined through
            psychiatric assessment, not a one-size-fits-all protocol.
          </p>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <article className="group overflow-hidden bg-white">
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
            <article className="group overflow-hidden bg-white lg:mt-10">
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
                  <ButtonLink href="/ketamine-treatment-resistant-depression-nanaimo/" variant="ghost">
                    How Ketamine uplifts mental wellbeing
                  </ButtonLink>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Eyebrow>Care at NeuroLinks</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-serif text-[clamp(1.75rem,3.6vw,3rem)] font-semibold leading-tight text-[var(--nl-navy)]">
            Our services
          </h2>
          <p className="prose-measure mt-4 leading-relaxed text-[var(--nl-muted)]">
            A psychiatrist-led evaluation reviews your history and goals. Not every condition listed
            on this site is an automatic indication for TMS or ketamine; treatment is recommended
            only when clinically appropriate.
          </p>
          <div className="mt-10 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((item) => (
              <article key={item.title} className="flex h-full flex-col bg-[var(--nl-cream)]">
                <div className="img-frame relative aspect-[4/3]">
                  <Image
                    src={item.img}
                    alt={item.alt}
                    fill
                    sizes={IMG_SIZES.third}
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-serif text-xl font-semibold text-[var(--nl-navy)]">
                    <Link className="hover:underline" href={item.href}>
                      {item.title}
                    </Link>
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--nl-muted)]">
                    {item.body}
                  </p>
                  <p className="mt-4">
                    <Link
                      className="text-sm font-semibold text-[var(--nl-blue-bright)] underline-offset-4 hover:underline"
                      href={item.href}
                    >
                      Learn more
                    </Link>
                  </p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10">
            <ButtonLink href="/services-psychiatric-tms-ketamine-treatment/">
              More about our service
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="bg-[var(--nl-cream)] px-4 py-14 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Eyebrow>Treatment benefits</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-serif text-[clamp(1.75rem,3.6vw,3rem)] font-semibold leading-tight text-[var(--nl-navy)]">
            What these treatments can offer
          </h2>
          <p className="prose-measure mt-4 leading-relaxed text-[var(--nl-muted)]">
            Outcomes vary. Treatment is recommended only when clinically appropriate. Medication
            should not be changed without medical guidance.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <NumberedBlock index="01" title="Non-invasive TMS">
              Transcranial magnetic stimulation is an FDA-approved non-invasive neuromodulation
              therapy. It does not require anesthesia.
            </NumberedBlock>
            <NumberedBlock index="02" title="Compared with medication alone">
              TMS is more effective than conventional medication treatments with minimal side
              effects.
            </NumberedBlock>
            <NumberedBlock index="03" title="Coverage in selected programs">
              TMS is covered by Veterans Affair Canada and certain worker compensation programs.
            </NumberedBlock>
            <NumberedBlock index="04" title="Ketamine onset">
              Ketamine&apos;s rapid onset of action distinguishes it from traditional
              antidepressants, often alleviating symptoms within hours or days.
            </NumberedBlock>
            <NumberedBlock index="05" title="Supervised administration">
              Ketamine is administered in controlled clinical settings through intramuscular and
              subcutaneous injections.
            </NumberedBlock>
            <NumberedBlock index="06" title="MSP-covered assessment">
              A comprehensive psychiatric evaluation is completely covered by MSP.
            </NumberedBlock>
          </div>
        </div>
      </section>

      <section className="bg-[var(--nl-navy)] px-4 py-14 text-white md:py-20">
        <div className="mx-auto max-w-6xl">
          <Eyebrow className="text-[var(--nl-yellow)]">Patient pathway</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-serif text-[clamp(1.75rem,3.6vw,3rem)] font-semibold leading-tight">
            How care typically proceeds
          </h2>
          <p className="prose-measure mt-4 text-sm leading-relaxed text-white/75">
            An inquiry or referral leads to assessment. Treatment is offered only when it is
            clinically appropriate.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <NumberedBlock tone="dark" index="01" title="Referral or inquiry">
              Patients and families may contact the clinic. Physicians can complete the online
              referral or fax the PDF form.
            </NumberedBlock>
            <NumberedBlock tone="dark" index="02" title="Psychiatric assessment">
              A comprehensive evaluation, covered by MSP, reviews your situation and possible
              options.
            </NumberedBlock>
            <NumberedBlock tone="dark" index="03" title="Individualized treatment planning">
              If TMS is deemed suitable, standard or accelerated plans may be considered. Ketamine
              is tailored to your needs.
            </NumberedBlock>
            <NumberedBlock tone="dark" index="04" title="Treatment and outcome monitoring">
              Care is delivered in a medically supervised setting, with adjustments based on your
              response.
            </NumberedBlock>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="img-frame relative aspect-[4/3]">
            <Image
              src={MEDIA.team}
              alt="Neurolinks team"
              fill
              sizes={IMG_SIZES.half}
              className="object-cover"
            />
          </div>
          <div>
            <Eyebrow>The clinic</Eyebrow>
            <h2 className="mt-3 font-serif text-[clamp(1.75rem,3.6vw,3rem)] font-semibold leading-tight text-[var(--nl-navy)]">
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
          </div>
        </div>
      </section>

      <section className="bg-[var(--nl-cream)] px-4 py-14 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Eyebrow>Google reviews</Eyebrow>
          <h2 className="mt-3 font-serif text-[clamp(1.75rem,3.6vw,3rem)] font-semibold text-[var(--nl-navy)]">
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
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <blockquote
                key={r.name}
                className="border-l-2 border-[var(--nl-yellow)] bg-white px-6 py-5 text-sm leading-relaxed"
              >
                <p className="text-[1.35rem] leading-none text-[var(--nl-yellow)]" aria-hidden="true">
                  “
                </p>
                <p className="mt-1">{r.text}</p>
                <footer className="mt-4 font-semibold text-[var(--nl-navy)]">— {r.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="location" className="scroll-mt-24 bg-white px-4 py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl items-stretch gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col justify-start pt-1">
            <Eyebrow>Visit</Eyebrow>
            <h2 className="mt-3 font-serif text-[clamp(1.75rem,3.6vw,3rem)] font-semibold text-[var(--nl-navy)]">
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
          <div className="relative min-h-[16rem] overflow-hidden bg-[var(--nl-cream)] md:min-h-[18rem] lg:min-h-[20rem]">
            <iframe
              title="6010 Brickyard Road, Nanaimo, BC"
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=6010%20Brickyard%20Road%2C%20Nanaimo%2C%20BC&t=m&z=15&output=embed&iwloc=near"
            />
          </div>
        </div>
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
