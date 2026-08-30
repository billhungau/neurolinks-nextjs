import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { PageBanner } from "@/components/PageBanner";
import { SiteChrome } from "@/components/SiteChrome";
import { Section } from "@/components/ui";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { KETAMINE_FAQS } from "@/content/faqs";
import { MEDIA, WP_VIDEOS } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Ketamine Treatment for Depression, OCD &Anxiety – NeuroLinks",
  description:
    "Discover ketamine treatment at NeuroLinks, Nanaimo. Effective for depression, OCD, PTSD & anxiety when other treatments haven’t worked.",
  path: "/ketamine-treatment-resistant-depression-nanaimo/",
});

export default function KetaminePage() {
  return (
    <SiteChrome>
      <PageBanner src={MEDIA.ketamineBanner} alt="" objectPosition="left center" />
      <Section>
        <h1 className="font-serif text-4xl font-bold">
          Ketamine&apos;s Path to Healing Treatment-Resistant Mental Illness
        </h1>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <video
            className="w-full rounded bg-black"
            controls
            preload="none"
            poster={MEDIA.ketPoster}
            src={WP_VIDEOS.ketamine.src}
          >
            Ketamine introduction video
          </video>
          <div>
            <h2 className="font-serif text-3xl font-bold">What is Ketamine Treatment?</h2>
            <p className="mt-4 leading-relaxed">
              Ketamine was first developed as an anesthetic agent and was later found to have a
              rapid and strong antidepressant effect.
            </p>
            <p className="mt-3 leading-relaxed">
              Numerous studies have demonstrated that{" "}
              <a
                className="text-[#3260eb] underline"
                href="https://www.sciencedirect.com/science/article/pii/S0022395620311468"
                rel="noopener noreferrer"
                target="_blank"
              >
                a single dose of ketamine
              </a>{" "}
              provides an antidepressant effect within a few hours and it can be sustained up to
              a week.
            </p>
            <p className="mt-3 leading-relaxed">
              Ketamine therapy demonstrates efficacy in managing{" "}
              <a
                className="text-[#3260eb] underline"
                href="https://www.cambridge.org/core/journals/bjpsych-open/article/ketamine-for-the-treatment-of-mental-health-and-substance-use-disorders-comprehensive-systematic-review/36E261BFA62CDA6459B88F7777415FDA"
                rel="noopener noreferrer"
                target="_blank"
              >
                various psychiatric conditions
              </a>
              , encompassing major depressive disorder, bipolar depression,
              obsessive-compulsive disorder, anxiety disorders, and post-traumatic stress
              disorder.
            </p>
          </div>
        </div>
      </Section>
      <Section>
        <h2 className="font-serif text-3xl font-bold">
          How does Ketamine treatment improve mental disorders?
        </h2>
        <p className="mt-4">
          Ketamine exerts a rapid therapeutic effect by performing several actions in the brain.
        </p>
        <ul className="mt-4 list-disc space-y-3 pl-6">
          <li>
            Unlike regular antidepressants which takes a few weeks to be effective, ketamine{" "}
            <strong>acts quickly often within days.</strong> It does this by temporarily changing
            how a specific type of receptor in the brain, called <strong>NMDA receptors</strong>,
            works. These receptors are like switches that{" "}
            <strong>control communication between brain cells</strong>.
          </li>
          <li>
            Ketamine <strong>boosts glutamatergic transmission</strong> – Glutamate is a chemical
            that helps brain cells communicate better. When glutamate functions more
            effectively, it assists the brain in changing and adapting. This means it can{" "}
            <strong>form new connections between brain cells</strong>, which are important for
            improving mood.
          </li>
          <li>
            <strong>Ketamine improves the brain plasticity</strong>. When ketamine stimulates
            these receptors, it triggers a series of reactions in the brain, including making
            new proteins in the brain, such as brain-derived neurotrophic factor (BDNF), which
            are needed for <strong>improving the changeability of the brain</strong> (i.e.{" "}
            <a
              className="text-[#3260eb] underline"
              href="https://www.nature.com/articles/s41398-023-02451-0"
              rel="noopener noreferrer"
              target="_blank"
            >
              brain plasticity
            </a>
            ).
          </li>
        </ul>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Image
            alt="human brain 2021 08 26 15 33 00 utc 1"
            src={MEDIA.brain}
            width={300}
            height={240}
            sizes={IMG_SIZES.diagram}
          />
          <Image
            alt="neurons electrical pulses 2021 08 26 18 26 30 utc 1"
            src={MEDIA.neurons}
            width={300}
            height={225}
            sizes={IMG_SIZES.diagram}
          />
          <Image
            alt="3d illustration model of serotonin molecule horm 2021 08 31 13 46 21 utc"
            src={MEDIA.serotonin}
            width={300}
            height={145}
            sizes={IMG_SIZES.diagram}
          />
        </div>
        <h2 className="mt-10 font-serif text-3xl font-bold">Conditions We Treat</h2>
        <ul className="mt-4 list-disc pl-6 leading-relaxed">
          <li>Major depressive disorder</li>
          <li>Bipolar depression</li>
          <li>Post-traumatic stress disorder</li>
          <li>Anxiety disorders</li>
          <li>Obsessive compulsive disorder</li>
          <li>Pain conditions</li>
        </ul>
        <div className="mt-6">
          <ButtonLink href="/contact/">Book an Appointment Today</ButtonLink>
        </div>
      </Section>
      <Section>
        <h2 className="font-serif text-3xl font-bold">Frequently Asked Questions</h2>
        <FaqJsonLd items={KETAMINE_FAQS} />
        <div className="mt-6">
          <FaqAccordion items={KETAMINE_FAQS} />
        </div>
        <div className="mt-8">
          <ButtonLink href="/contact/">Contact Us</ButtonLink>
        </div>
      </Section>
    </SiteChrome>
  );
}
