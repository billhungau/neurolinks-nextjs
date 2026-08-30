import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { SiteChrome } from "@/components/SiteChrome";
import { Card, Section } from "@/components/ui";
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
      <div className="relative min-h-[22rem] overflow-hidden md:min-h-[37.8rem]">
        <Image
          src={MEDIA.homeHero}
          alt="TMS and ketamine treatment in Nanaimo for depression and anxiety – NeuroLinks"
          fill
          priority
          sizes={IMG_SIZES.fullBleed}
          className="object-cover object-left"
        />
        <div className="absolute inset-0 bg-[#1a2744]/55" aria-hidden="true" />
        <div className="relative z-10 flex min-h-[22rem] items-center justify-center px-4 py-16 text-center text-white md:min-h-[37.8rem]">
          <div>
            <h1 className="mx-auto max-w-3xl font-serif text-4xl font-bold leading-tight md:text-5xl">
              Expert care for complex mental challenges
            </h1>
            <p className="mt-6 text-lg">No matter how hard the past</p>
            <p className="text-lg">We can always begin again</p>
          </div>
        </div>
      </div>

      <Section>
        <h2 className="font-serif text-2xl font-bold">
          Transcranial Magnetic Stimulation: Shedding Light on the Journey Through Mental Darkness
        </h2>
        <p className="mt-4 max-w-3xl leading-relaxed">
          Transcranial magnetic stimulation is an FDA-approved non-invasive neuromodulation therapy for treatment-resistant depression, obsessive-compulsive disorder, and post-traumatic stress disorder. TMS is more effective than conventional medication treatments with minimal side effects. TMS is covered by Veterans Affair Canada and certain worker compensation programs.
        </p>
        <div className="mt-6">
          <ButtonLink href="/about-tms-treatment-on-psychiatric-illness/">
            How TMS transforms mental illness
          </ButtonLink>
        </div>
      </Section>

      <Section>
        <h2 className="font-serif text-2xl font-bold">
          Ketamine: Reviving Spirits Amid Treatment-Resistant Mental Health Struggles
        </h2>
        <p className="mt-4 max-w-3xl leading-relaxed">
          Ketamine therapy offers a novel treatment avenue for individuals with treatment-resistant mental illnesses like depression, anxiety, PTSD, and bipolar disorder. Administered in controlled clinical settings through intramuscular and subcutaneous injections, ketamine&apos;s rapid onset of action distinguishes it from traditional antidepressants, often alleviating symptoms within hours or days. Its mechanism of action involves modulation of neurotransmitter systems and promotion of new synaptic connections in the brain.
        </p>
        <div className="mt-6">
          <ButtonLink href="/ketamine-treatment-resistant-depression-nanaimo/">
            How Ketamine uplifts mental wellbeing
          </ButtonLink>
        </div>
      </Section>

      <Section>
        <h2 className="font-serif text-3xl font-bold">Our Services</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card>
            <Image
              src={MEDIA.eval}
              alt="Psychiatric evaluation"
              width={768}
              height={512}
              className="h-48 w-full object-cover"
              sizes={IMG_SIZES.third}
            />
            <div className="p-4">
              <h3 className="font-serif text-xl">
                <a href="/services-psychiatric-tms-ketamine-treatment/#assessment">
                  Psychiatric Evaluation
                </a>
              </h3>
              <p className="mt-2 text-sm leading-relaxed">
                Feeling like your mental health challenges aren&apos;t improving? You&apos;re not alone! You deserve a clear understanding of your situation. At NeuroLinks, our psychiatrist can help. We offer a comprehensive evaluation to understand your unique situation and explore all potential treatment options, including TMS and Ketamine therapy. This evaluation, completely covered by MSP, can be the key to unlocking lasting relief and feeling your best again.
              </p>
            </div>
          </Card>
          <Card>
            <Image
              src={MEDIA.tmsClinic}
              alt="TMS treatment"
              width={768}
              height={512}
              className="h-48 w-full object-cover"
              sizes={IMG_SIZES.third}
            />
            <div className="p-4">
              <h3 className="font-serif text-xl">
                <a href="/services-psychiatric-tms-ketamine-treatment/#tms">
                  Transcranial Magnetic Stimulation
                </a>
              </h3>
              <p className="mt-2 text-sm leading-relaxed">
                TMS offers a non-invasive approach that has shown promise in helping individuals manage their mental health. If TMS is deemed suitable, you can choose between a standard treatment plan or an accelerated option. The standard plan typically involves five sessions per week for at least six weeks, while the accelerated option condenses these sessions into five intensive days.
              </p>
            </div>
          </Card>
          <Card>
            <Image
              src={MEDIA.reception}
              alt="Reception area"
              width={768}
              height={512}
              className="h-48 w-full object-cover"
              sizes={IMG_SIZES.third}
            />
            <div className="p-4">
              <h3 className="font-serif text-xl">
                <a href="/services-psychiatric-tms-ketamine-treatment/#ketamine">
                  Ketamine Treatment
                </a>
              </h3>
              <p className="mt-2 text-sm leading-relaxed">
                We can explore if Ketamine therapy might be a potential tool to support your journey towards improvement. Ketamine has emerged as a promising treatment for treatment-resistant mental challenges, offering rapid relief. Our Ketamine therapy is tailored to your specific needs, typically involving two sessions per week for up to three weeks, with adjustments based on your response to treatment.
              </p>
            </div>
          </Card>
        </div>
        <div className="mt-8">
          <ButtonLink href="/services-psychiatric-tms-ketamine-treatment/">
            More about our service
          </ButtonLink>
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl font-bold">
              <a href="/psychiatrist-tms-nanaimo/">About Us</a>
            </h2>
            <h3 className="mt-3 text-lg">
              We are dedicated to helping people struggling with psychiatric illness.
            </h3>
            <p className="mt-4">
              We empathize with patients&apos; struggles and recognize the shortcomings of conventional medicine. Our goal is to enact meaningful transformations in their lives.
            </p>
            <div className="mt-6">
              <ButtonLink href="/psychiatrist-tms-nanaimo/">Find out more</ButtonLink>
            </div>
          </div>
          <Image
            src={MEDIA.team}
            alt="Neurolinks team"
            width={768}
            height={512}
            className="rounded object-cover"
            sizes={IMG_SIZES.half}
          />
        </div>
      </Section>

      <Section>
        <h2 className="font-serif text-3xl font-bold">What Our Patients Say</h2>
        <p className="mt-2 text-sm text-slate-600">Google rating 5.0 — snapshots from the live WordPress reviews widget (not a live API in Phase 1).</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <blockquote key={r.name} className="rounded border border-slate-200 p-4 text-sm">
              <p>{r.text}</p>
              <footer className="mt-3 font-semibold">{r.name}</footer>
            </blockquote>
          ))}
        </div>
      </Section>

      <Section id="location">
        <h2 className="font-serif text-3xl font-bold">Address</h2>
        <p className="mt-3">{SITE.addressLine}</p>
        <p>Free parking is available</p>
        <iframe
          title="6010 Brickyard Road, Nanaimo, BC"
          className="mt-6 h-72 w-full rounded border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://maps.google.com/maps?q=6010%20Brickyard%20Road%2C%20Nanaimo%2C%20BC&t=m&z=13&output=embed&iwloc=near"
        />
      </Section>

      <div className="bg-[#3260eb] px-4 py-16 text-center text-white">
        <h2 className="font-serif text-3xl font-bold">QUESTIONS?</h2>
        <p className="mx-auto mt-4 max-w-xl">
          Seeking support for your mental wellbeing or a loved one&apos;s? Don&apos;t hesitate to contact us – we&apos;re here to help you navigate your journey.
        </p>
        <div className="mt-6">
          <a
            className="inline-flex rounded border border-white px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            href="/contact/"
          >
            Contact Us
          </a>
        </div>
      </div>
    </SiteChrome>
  );
}
