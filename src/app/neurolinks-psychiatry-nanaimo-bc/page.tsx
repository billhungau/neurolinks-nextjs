import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { LandingHeader } from "@/components/LandingHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { Section } from "@/components/ui";
import { LANDING_FAQS } from "@/content/faqs";
import { LANDING_YOUTUBE, MEDIA } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Psychiatry Clinic in Nanaimo, BC |TMS & Ketamine| NeuroLinks",
  description:
    "NeuroLinks is a psychiatrist-led psychiatry clinic in Nanaimo offering evidence-based care, including TMS and ketamine therapy, for treatment-resistant depression and related conditions.",
  path: "/neurolinks-psychiatry-nanaimo-bc/",
});

const REVIEWS = [
  {
    who: "T. H.",
    text: "Dr Au and his staff are top notch. If you suffer from PTSD, depression or anxiety give TMS a try. Dr. Au is very knowledgeable and it’s all about patient care and not the money. I had a really good outcome treating my PTSD, depression and anxiety symptoms.",
  },
  {
    who: "E. H.",
    text: "I felt hopeless and stuck in life. I spent years trying everything I could to make a change, then one day my doctor talked to me about TMS and I thought why not try. TMS has been a life changing treatment for me. I would highly recommend this to anyone suffering with depression. Doctor Au and his team have been so knowledgeable and supportive throughout this process.",
  },
  {
    who: "B. J.",
    text: "Dr Au and his team took amazing care of me! He was very patient and thorough with diagnosis and my options. I couldn’t imagine going through the rest of my life with how severe my depression was despite all the medications and therapy. TMS has helped me immensely. I have experienced a drastic reduction in my symptoms and I feel like it’s given me the fortitude to withstand and move forward through so many lows.",
  },
  {
    who: "P. R.",
    text: "I took my daughter to see Dr. Chi Hung for the first time today. We have struggled to find the right help for at least 5 years now and we are so grateful to Dr. Chi Hung and his staff for finally LISTENING and giving us the help and hope we have been so desperately searching for. I’m giving a 10 star review!",
  },
  {
    who: "S. H.",
    text: "TMS has been an integral treatment in healing myself from depression and anxiety. Mental illness caused by past traumas. TMS potentially saved my life, for I was suicidal before treatment. Forever grateful to Dr. Au and his staff.",
  },
  {
    who: "J. A.",
    text: "The Transcranial Magnetic Stimulation took longer than usual to work for me, but I have had depression for 45 years. The treatment and the guidance in adjusting my medication has really made a positive change. I feel much more myself and can feel hopeful again. Thanks to Dr. Au and the incredible staff, you all have been wonderful.",
  },
  {
    who: "Z. G.",
    text: "I experienced early childhood trauma which caused complex PTSD, Major Depression, and intense anxiety that I suffered with for over 30 years. I tried everything with no results. Five days of intensive TMS treatment had me feeling the best I’ve ever felt in my life! Dr. Au and his team are very kind and helped me feel safe and cared for.",
  },
  {
    who: "S. K.",
    text: "Dr Au and his wonderful team have brought me back from the brink. I feel like a happy version of myself and it is wonderful. He is so kind and caring and his team is just as lovely. I can’t recommend this TMS treatment enough for those who are suffering mentally.",
  },
  {
    who: "S. W.",
    text: "Has been miraculous for me. I feel happier than I have felt since I was a child. I would highly recommend these treatments to anyone suffering from depression.",
  },
];

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <FaqJsonLd items={LANDING_FAQS} />
        <section className="bg-[#F1EEEA]">
          <div className="mx-auto grid max-w-6xl items-stretch md:grid-cols-2">
            <div className="flex flex-col justify-center px-4 py-10 md:px-8 md:py-16">
              <h1 className="font-serif text-3xl font-bold leading-tight text-[#1a2744] md:text-4xl">
                When Medications Fall Short, Thoughtful Psychiatric Care Can Offer New Options.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#1a2744] md:text-lg">
                Psychiatrist-led Transcranial Magnetic Stimulation (TMS) and ketamine therapy for
                treatment-resistant depression, anxiety, OCD, and PTSD in British Columbia.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/contact/" variant="accent">
                  Contact the clinic
                </ButtonLink>
                <ButtonLink href="#treatment" variant="ghost">
                  Explore treatment options
                </ButtonLink>
              </div>
              <p className="mt-4 text-sm">
                Prefer to speak with someone?{" "}
                <a className="font-semibold text-[#3260eb] underline" href={SITE.phoneHref}>
                  Call {SITE.phone}
                </a>
              </p>
            </div>
            <div className="relative aspect-[1920/960] min-h-[16rem] w-full md:aspect-auto md:min-h-[28rem]">
              <Image
                src={MEDIA.landingHero}
                alt="Clinician preparing TMS treatment equipment in a NeuroLinks clinic room"
                fill
                priority
                sizes={IMG_SIZES.half}
                className="object-cover object-[center_18%] md:object-[center_center]"
              />
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-gradient-to-t from-black/55 to-transparent p-4">
                <Link
                  href="#treatment"
                  className="rounded bg-white/95 px-3 py-2 text-sm font-semibold text-[#1a2744]"
                >
                  TMS Therapy
                </Link>
                <Link
                  href="/ketamine-treatment-resistant-depression-nanaimo/"
                  className="rounded bg-white/95 px-3 py-2 text-sm font-semibold text-[#1a2744]"
                >
                  Ketamine Therapy
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Section>
          <h2 className="font-serif text-3xl font-bold">A Thoughtful, Psychiatrist-Led Approach</h2>
          <p className="mt-4 max-w-3xl leading-relaxed">
            At NeuroLinks, we recognize that seeking care after multiple treatments haven&apos;t
            helped can feel discouraging. Our approach begins with careful listening and a
            thorough understanding of your history, concerns, and goals.
          </p>
          <p className="mt-3 max-w-3xl leading-relaxed">
            TMS and ketamine therapy are considered thoughtfully, within a psychiatrist-led plan
            tailored to your needs, with close monitoring and follow-up throughout treatment.
          </p>
          <p className="mt-3 max-w-3xl leading-relaxed">
            When standard treatments haven&apos;t been enough, our clinic offers carefully
            evaluated alternatives guided by psychiatric expertise.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Psychiatrist-Led",
              "Evidence-Based",
              "Non-Invasive",
              "More Effective Than Meds",
              "Personalized Treatment Plans",
            ].map((label) => (
              <p key={label} className="rounded border border-slate-200 bg-white p-4 font-serif text-lg text-[#1a2744]">
                {label}
              </p>
            ))}
          </div>
        </Section>

        <Section>
          <h2 className="font-serif text-3xl font-bold">For Individuals Seeking Relief</h2>
          <p className="mt-3">You may recognize yourself in one or more of the following situations.</p>
          <ul className="mt-4 list-disc pl-6 leading-relaxed">
            <li>Long-standing or recurrent depression</li>
            <li>Partial or no response to antidepressants</li>
            <li>Complex conditions</li>
            <li>Preference for psychiatrist-led care</li>
          </ul>
        </Section>

        <Section id="treatment">
          <h2 className="font-serif text-3xl font-bold">Advanced Treatment Options</h2>
          <p className="mt-3 max-w-3xl">
            Evidence-based therapies that offer alternatives when standard approaches haven&apos;t
            provided adequate relief.
          </p>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <article>
              <h3 className="font-serif text-2xl">Transcranial Magnetic Stimulation (TMS)</h3>
              <p className="mt-3 leading-relaxed">
                TMS Therapy — Non-invasive brain stimulation
              </p>
              <p className="mt-3">
                <Link
                  className="text-[#3260eb] underline"
                  href="/about-tms-treatment-on-psychiatric-illness/"
                >
                  Learn more about TMS
                </Link>
              </p>
            </article>
            <article>
              <h3 className="font-serif text-2xl">Ketamine Therapy</h3>
              <p className="mt-3 leading-relaxed">
                Rapid-acting, medically supervised
              </p>
              <p className="mt-3">
                <Link
                  className="text-[#3260eb] underline"
                  href="/ketamine-treatment-resistant-depression-nanaimo/"
                >
                  Learn more about ketamine
                </Link>
              </p>
            </article>
          </div>
          <p className="mt-6">See if one of these options may be right for you</p>
        </Section>

        <Section>
          <h2 className="font-serif text-3xl font-bold">Understanding These Treatments More Fully</h2>
          <p className="mt-3 max-w-3xl">
            Short, psychiatrist-led explanations to help you understand how these treatments work
            and whether they may be appropriate for your situation.
          </p>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="font-serif text-2xl">
                Understanding TMS for Treatment-Resistant Depression
              </h3>
              <p className="mt-2 text-sm">
                A psychiatrist explains how TMS works, who it may help, and what to realistically
                expect from treatment.
              </p>
              <YouTubeEmbed
                videoId={LANDING_YOUTUBE.tms}
                title="Understanding TMS for Treatment-Resistant Depression"
              />
            </div>
            <div>
              <h3 className="font-serif text-2xl">Understanding Ketamine Therapy in Psychiatry</h3>
              <p className="mt-2 text-sm">
                A careful overview of ketamine therapy, including safety considerations,
                monitoring, and how candidacy is determined.
              </p>
              <YouTubeEmbed
                videoId={LANDING_YOUTUBE.ketamine}
                title="Understanding Ketamine Therapy in Psychiatry"
              />
            </div>
          </div>
        </Section>

        <Section>
          <h2 className="font-serif text-3xl font-bold">Why Patients Choose NeuroLinks</h2>
          <p className="mt-3 max-w-3xl">
            A thoughtful approach to advanced psychiatric care, focused on assessment, safety,
            and individualized treatment.
          </p>
          <ul className="mt-4 list-disc pl-6">
            <li>Psychiatrist-Led Expertise</li>
            <li>Measured, Real-World Outcomes</li>
            <li>Respect for Clinical Complexity</li>
          </ul>
        </Section>

        <Section>
          <h2 className="font-serif text-3xl font-bold">Considering Advanced Treatment Options?</h2>
          <p className="mt-3 max-w-3xl">
            A confidential psychiatric assessment can help determine whether TMS or ketamine
            therapy may be appropriate for your situation.
          </p>
          <div className="mt-6">
            <ButtonLink href="/contact/">Contact the clinic</ButtonLink>
          </div>
        </Section>

        <Section>
          <h2 className="font-serif text-3xl font-bold">What Patients Say</h2>
          <p className="mt-2 text-sm text-slate-600">on Google Reviews</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {REVIEWS.map((r) => (
              <blockquote key={r.who + r.text.slice(0, 24)} className="border p-4 text-sm">
                <p>{r.text}</p>
                <footer className="mt-3 font-semibold">— {r.who}</footer>
              </blockquote>
            ))}
          </div>
        </Section>

        <Section id="faq">
          <h2 className="font-serif text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="mt-3">Common questions about our treatments and approach to care.</p>
          <div className="mt-6">
            <FaqAccordion items={LANDING_FAQS} />
          </div>
        </Section>

        <Section>
          <h2 className="font-serif text-3xl font-bold">Check If You&apos;re a Candidate</h2>
          <p className="mt-3 max-w-3xl">
            Share a few details, and our clinical team will reach out to discuss whether TMS or
            ketamine therapy may be appropriate for your situation.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            The live landing page includes a lead form that is not in the approved Formidable
            contact/referral rebuild. Use the contact page until that backend is chosen.
          </p>
          <div className="mt-6">
            <ButtonLink href="/contact/" variant="accent">
              Contact NeuroLinks
            </ButtonLink>
          </div>
        </Section>

        <Section>
          <h2 className="font-serif text-3xl font-bold">Ready to Take the Next Step?</h2>
          <p className="mt-3">
            A confidential assessment is the first step toward understanding your options.
          </p>
          <p className="mt-2">
            Questions about eligibility or next steps?{" "}
            <a className="text-[#3260eb] underline" href={SITE.phoneHref}>
              {SITE.phone}
            </a>
          </p>
          <p className="mt-8 text-sm text-slate-600">
            Information provided is educational and does not replace a psychiatric assessment.
            Treatment outcomes vary by individual. Please consult with a qualified healthcare
            provider for personalized medical guidance.
          </p>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
