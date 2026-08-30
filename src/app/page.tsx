import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { CtaBand } from "@/components/CtaBand";
import { Eyebrow } from "@/components/Eyebrow";
import { NumberedBlock } from "@/components/NumberedBlock";
import { SiteChrome } from "@/components/SiteChrome";
import { MEDIA } from "@/lib/media";
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

export default function HomePage() {
  return (
    <SiteChrome>
      <section className="relative min-h-[32rem] overflow-hidden bg-[var(--nl-navy)] md:min-h-[40rem] lg:min-h-[46rem]">
        <Image
          src={MEDIA.tmsClinic}
          alt="TMS treatment at NeuroLinks in Nanaimo"
          fill
          priority
          sizes={IMG_SIZES.fullBleed}
          className="object-cover object-[center_30%]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[var(--nl-navy)] via-[var(--nl-navy)]/80 to-[var(--nl-navy)]/25"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto flex min-h-[32rem] max-w-6xl flex-col justify-end px-4 py-16 md:min-h-[40rem] md:py-24 lg:min-h-[46rem]">
          <Eyebrow className="text-[var(--nl-yellow)]">NeuroLinks · Nanaimo, BC</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-serif text-[clamp(2.15rem,6vw,4.75rem)] font-semibold leading-[1.08] text-white">
            Expert care for complex mental challenges
          </h1>
          <p className="prose-measure mt-5 text-lg leading-relaxed text-white/90">
            No matter how hard the past. We can always begin again.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/about-tms-treatment-on-psychiatric-illness/" variant="accent">
              Explore TMS
            </ButtonLink>
            <ButtonLink href="/ketamine-treatment-resistant-depression-nanaimo/" variant="on-dark">
              Explore Ketamine
            </ButtonLink>
          </div>
          <p className="mt-5 text-sm text-white/80">
            Referring a patient?{" "}
            <Link
              className="font-semibold text-[var(--nl-yellow)] underline underline-offset-4"
              href="/physician-referral/"
            >
              Physician referral
            </Link>
          </p>
        </div>
      </section>

      <section className="bg-[var(--nl-cream)] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Eyebrow>Treatment options</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-serif text-[clamp(1.85rem,4vw,3.25rem)] font-semibold leading-tight text-[var(--nl-navy)]">
            Two distinct, psychiatrist-led therapies
          </h2>
          <p className="prose-measure mt-4 leading-relaxed text-[var(--nl-muted)]">
            TMS and ketamine work through different mechanisms. Suitability is determined through
            psychiatric assessment, not a one-size-fits-all protocol.
          </p>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
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
                <h3 className="mt-3 font-serif text-2xl font-semibold text-[var(--nl-navy)] md:text-3xl">
                  Transcranial Magnetic Stimulation: Shedding Light on the Journey Through Mental
                  Darkness
                </h3>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--nl-muted)]">
                  Transcranial magnetic stimulation is an FDA-approved non-invasive neuromodulation
                  therapy for treatment-resistant depression, obsessive-compulsive disorder, and
                  post-traumatic stress disorder. TMS is more effective than conventional medication
                  treatments with minimal side effects. TMS is covered by Veterans Affair Canada and
                  certain worker compensation programs.
                </p>
                <div className="mt-6">
                  <ButtonLink href="/about-tms-treatment-on-psychiatric-illness/">
                    How TMS transforms mental illness
                  </ButtonLink>
                </div>
              </div>
            </article>
            <article className="group overflow-hidden bg-white lg:mt-12">
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
                <h3 className="mt-3 font-serif text-2xl font-semibold text-[var(--nl-navy)] md:text-3xl">
                  Ketamine: Reviving Spirits Amid Treatment-Resistant Mental Health Struggles
                </h3>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--nl-muted)]">
                  Ketamine therapy offers a novel treatment avenue for individuals with
                  treatment-resistant mental illnesses like depression, anxiety, PTSD, and bipolar
                  disorder. Administered in controlled clinical settings through intramuscular and
                  subcutaneous injections, ketamine&apos;s rapid onset of action distinguishes it
                  from traditional antidepressants, often alleviating symptoms within hours or days.
                  Its mechanism of action involves modulation of neurotransmitter systems and
                  promotion of new synaptic connections in the brain.
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

      <section className="bg-white px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Eyebrow>Conditions and needs</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-serif text-[clamp(1.85rem,4vw,3.25rem)] font-semibold leading-tight text-[var(--nl-navy)]">
            Our services
          </h2>
          <p className="prose-measure mt-4 leading-relaxed text-[var(--nl-muted)]">
            A psychiatrist-led evaluation reviews your history and goals. Not every condition listed
            on this site is an automatic indication for TMS or ketamine; treatment is recommended
            only when clinically appropriate.
          </p>
          <div className="mt-12 grid gap-px bg-[var(--nl-cream-deep)] sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                href: "/services-psychiatric-tms-ketamine-treatment/#assessment",
                img: MEDIA.eval,
                alt: "Psychiatric evaluation",
                title: "Psychiatric Evaluation",
                body: "Feeling like your mental health challenges aren't improving? You're not alone! You deserve a clear understanding of your situation. At NeuroLinks, our psychiatrist can help. We offer a comprehensive evaluation to understand your unique situation and explore all potential treatment options, including TMS and Ketamine therapy. This evaluation, completely covered by MSP, can be the key to unlocking lasting relief and feeling your best again.",
              },
              {
                href: "/services-psychiatric-tms-ketamine-treatment/#tms",
                img: MEDIA.tmsClinic,
                alt: "TMS treatment",
                title: "Transcranial Magnetic Stimulation",
                body: "TMS offers a non-invasive approach that has shown promise in helping individuals manage their mental health. If TMS is deemed suitable, you can choose between a standard treatment plan or an accelerated option. The standard plan typically involves five sessions per week for at least six weeks, while the accelerated option condenses these sessions into five intensive days.",
              },
              {
                href: "/services-psychiatric-tms-ketamine-treatment/#ketamine",
                img: MEDIA.office,
                alt: "NeuroLinks clinic office",
                title: "Ketamine Treatment",
                body: "We can explore if Ketamine therapy might be a potential tool to support your journey towards improvement. Ketamine has emerged as a promising treatment for treatment-resistant mental challenges, offering rapid relief. Our Ketamine therapy is tailored to your specific needs, typically involving two sessions per week for up to three weeks, with adjustments based on your response to treatment.",
              },
            ].map((item) => (
              <article key={item.title} className="bg-white p-6 md:p-8">
                <div className="img-frame relative mb-5 aspect-[4/3]">
                  <Image
                    src={item.img}
                    alt={item.alt}
                    fill
                    sizes={IMG_SIZES.third}
                    className="object-cover"
                  />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[var(--nl-navy)]">
                  <Link className="hover:underline" href={item.href}>
                    {item.title}
                  </Link>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--nl-muted)]">{item.body}</p>
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

      <section className="bg-[var(--nl-cream)] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Eyebrow>From existing clinical information</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-serif text-[clamp(1.85rem,4vw,3.25rem)] font-semibold leading-tight text-[var(--nl-navy)]">
            What these treatments can offer
          </h2>
          <p className="prose-measure mt-4 leading-relaxed text-[var(--nl-muted)]">
            Outcomes vary. These points summarize wording already used on this site; they are not
            guarantees, and they do not mean medications should be stopped without psychiatric
            guidance.
          </p>
          <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            <NumberedBlock index="01" title="Non-invasive TMS">
              Transcranial magnetic stimulation is an FDA-approved non-invasive neuromodulation
              therapy. It does not require anesthesia.
            </NumberedBlock>
            <NumberedBlock index="02" title="Compared with medication alone">
              TMS is more effective than conventional medication treatments with minimal side
              effects, according to the clinic&apos;s existing description of the treatment.
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

      <section className="bg-[var(--nl-navy)] px-4 py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl">
          <Eyebrow className="text-[var(--nl-yellow)]">Patient pathway</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-serif text-[clamp(1.85rem,4vw,3.25rem)] font-semibold leading-tight">
            How care typically proceeds
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            <NumberedBlock tone="dark" index="01" title="Referral or inquiry">
              Patients and families may contact the clinic. Physicians can complete the online
              referral or fax the PDF referral form.
            </NumberedBlock>
            <NumberedBlock tone="dark" index="02" title="Psychiatric assessment">
              Our psychiatrist offers a comprehensive evaluation, covered by MSP, to understand
              your unique situation and explore potential treatment options.
            </NumberedBlock>
            <NumberedBlock tone="dark" index="03" title="Individualized treatment planning">
              If TMS is deemed suitable, you can choose between a standard treatment plan or an
              accelerated option. Ketamine therapy is tailored to your specific needs.
            </NumberedBlock>
            <NumberedBlock tone="dark" index="04" title="Treatment and outcome monitoring">
              Treatment is delivered in a medically supervised setting, with adjustments based on
              your response.
            </NumberedBlock>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="img-frame relative aspect-[4/3] lg:aspect-[5/4]">
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
            <h2 className="mt-3 font-serif text-[clamp(1.85rem,4vw,3.15rem)] font-semibold leading-tight text-[var(--nl-navy)]">
              About us
            </h2>
            <p className="mt-4 text-lg text-[var(--nl-navy)]">
              We are dedicated to helping people struggling with psychiatric illness.
            </p>
            <p className="mt-4 leading-relaxed text-[var(--nl-muted)]">
              We empathize with patients&apos; struggles and recognize the shortcomings of
              conventional medicine. Our goal is to enact meaningful transformations in their
              lives. NeuroLinks was founded by psychiatrist Dr. Chi Hung Au in Nanaimo.
            </p>
            <div className="mt-8">
              <ButtonLink href="/psychiatrist-tms-nanaimo/">Find out more</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--nl-cream)] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Eyebrow>Google reviews</Eyebrow>
          <h2 className="mt-3 font-serif text-[clamp(1.85rem,4vw,3.25rem)] font-semibold text-[var(--nl-navy)]">
            What our patients say
          </h2>
          <p className="mt-2 text-sm text-[var(--nl-muted)]">
            Google rating 5.0 — snapshots from the live WordPress reviews widget (not a live API
            in Phase 1).
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <blockquote
                key={r.name}
                className="border-t-2 border-[var(--nl-yellow)] bg-white p-6 text-sm leading-relaxed"
              >
                <p>{r.text}</p>
                <footer className="mt-4 font-semibold text-[var(--nl-navy)]">{r.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="location" className="scroll-mt-24 bg-white px-4 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Visit</Eyebrow>
            <h2 className="mt-3 font-serif text-[clamp(1.85rem,4vw,3.25rem)] font-semibold text-[var(--nl-navy)]">
              Address
            </h2>
            <p className="mt-4 max-w-md leading-relaxed">{SITE.addressLine}</p>
            <p className="mt-2 text-[var(--nl-muted)]">Free parking is available</p>
            <p className="mt-6">
              <a className="font-semibold text-[var(--nl-blue-bright)] underline" href={SITE.phoneHref}>
                {SITE.phone}
              </a>
            </p>
          </div>
          <iframe
            title="6010 Brickyard Road, Nanaimo, BC"
            className="h-72 w-full border-0 lg:h-full lg:min-h-[20rem]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://maps.google.com/maps?q=6010%20Brickyard%20Road%2C%20Nanaimo%2C%20BC&t=m&z=13&output=embed&iwloc=near"
          />
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
