import Image from "next/image";
import { PageBanner } from "@/components/PageBanner";
import { SiteChrome } from "@/components/SiteChrome";
import { ButtonLink } from "@/components/ButtonLink";
import { Section } from "@/components/ui";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { TMS_FAQS } from "@/content/faqs";
import { MEDIA, WP_VIDEOS } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "TMS – Transcranial Magnetic Stimulation therapy | NeuroLinks",
  description:
    "NeuroLinks psychiatry in Nanaimo provides TMS therapy for depression, OCD, and PTSD. A safe, effective, and non-invasive treatment. Book a consultation today!",
  path: "/about-tms-treatment-on-psychiatric-illness/",
});

export default function AboutTmsPage() {
  return (
    <SiteChrome>
      <PageBanner src={MEDIA.tmsBanner} alt="" objectPosition="left bottom" />
      <Section>
        <h1 className="font-serif text-4xl font-bold">
          TMS Treatment: Illuminating the Journey Through Mental Darkness
        </h1>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <video
            className="w-full rounded bg-black"
            controls
            preload="none"
            poster={MEDIA.tmsPoster}
            src={WP_VIDEOS.tms.src}
          >
            TMS introduction video
          </video>
          <div>
            <h2 className="font-serif text-3xl font-bold">What is TMS?</h2>
            <p className="mt-4 leading-relaxed">
              Transcranial magnetic stimulation (TMS) is a <strong>non-invasive</strong> brain
              modulation technology. It does <strong>not require anesthesia</strong> and it is
              generally exceptionally <strong>well tolerated</strong>, in contrast to the side
              effects of medications and electroconvulsive therapy (ECT). The TMS machine
              produces an alternating magnetic field which <strong>induces electric currents</strong>{" "}
              at a specific area of the brain. The strength of the magnetic field generated is
              similar to that of a magnetic resonance imaging (MRI) device. It{" "}
              <strong>stimulates a discrete part of the brain</strong>, resulting in multiple
              changes in the nervous system, including promoting neural growth, modulating neural
              networks, and stimulating brain chemicals release. TMS has been proven{" "}
              <strong>safe</strong> and <strong>effective</strong>.
            </p>
          </div>
        </div>
      </Section>
      <Section>
        <h2 className="font-serif text-3xl font-bold">How does TMS improve mental disorders?</h2>
        <p className="mt-4">
          Despite the efficacy of TMS having been well established, the underlying mechanism is
          still a hot topic of research and there have been several proposed mechanisms:
        </p>
        <ul className="mt-4 list-disc space-y-3 pl-6">
          <li>
            <strong>TMS stimulates the growth of the nervous system</strong> – most notably the
            hippocampus, a brain structure which is crucial for mood and memory, and which is
            dysfunctional in many mental disorders.{" "}
            <a
              className="text-[#3260eb] underline"
              href="https://pubmed.ncbi.nlm.nih.gov/28631869/"
              rel="noopener noreferrer"
              target="_blank"
            >
              A study
            </a>{" "}
            in patients with depression demonstrated that the size of the hippocampus increased
            after TMS.
          </li>
          <li>
            <strong>TMS changes the neural network (functional connectivity)</strong>, particularly
            affecting remote brain regions which are responsible for mood regulation.
          </li>
          <li>
            <strong>TMS stimulates the release of numerous brain chemicals</strong>. The most
            remarkable example is{" "}
            <a
              className="text-[#3260eb] underline"
              href="https://pubmed.ncbi.nlm.nih.gov/21795553/"
              rel="noopener noreferrer"
              target="_blank"
            >
              brain-derived neurotrophic factor
            </a>{" "}
            (BDNF), which is a chemical crucial for nerve growth. It enhances neuronal survival
            and improves neural connections. Like conventional antidepressants, TMS also
            stimulates the release of serotonin and dopamine.
          </li>
        </ul>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Image
            alt="human brain 2021 08 26 15 33 00 utc 1"
            src={MEDIA.brain}
            width={768}
            height={614}
            className="rounded object-cover"
            sizes={IMG_SIZES.diagram}
          />
          <Image
            alt="neurons electrical pulses 2021 08 26 18 26 30 utc 1"
            src={MEDIA.neurons}
            width={768}
            height={576}
            className="rounded object-cover"
            sizes={IMG_SIZES.diagram}
          />
          <Image
            alt="3d illustration model of serotonin molecule horm 2021 08 31 13 46 21 utc"
            src={MEDIA.serotonin}
            width={300}
            height={145}
            className="rounded object-cover"
            sizes={IMG_SIZES.diagram}
          />
        </div>
      </Section>
      <Section>
        <h2 className="font-serif text-3xl font-bold">Conditions We Treat</h2>
        <ul className="mt-4 list-disc pl-6 leading-relaxed">
          <li>Major depressive disorder</li>
          <li>Obsessive-compulsive disorder</li>
          <li>Post-traumatic stress disorder</li>
          <li>Bipolar depression</li>
          <li>Anxiety disorders</li>
          <li>Pain conditions, such as migraine and fibromyalgia</li>
        </ul>
        <h2 className="mt-10 font-serif text-3xl font-bold">Age group</h2>
        <p className="mt-3">FDA has approved TMS for patients aged 15 and older.</p>
        <h2 className="mt-10 font-serif text-3xl font-bold">Coverage</h2>
        <ul className="mt-4 list-disc pl-6 leading-relaxed">
          <li>Veterans Affair Canada (veterans and RCMP)</li>
          <li>Certain worker compensation programs</li>
        </ul>
        <p className="mt-3">
          Kindly contact your insurance provider to inquire about the policies regarding
          extended health benefits.
        </p>
        <div className="mt-6">
          <ButtonLink href="/contact/">Book an Appointment Today</ButtonLink>
        </div>
      </Section>
      <Section>
        <h2 className="font-serif text-3xl font-bold">Frequently Asked Questions</h2>
        <FaqJsonLd items={TMS_FAQS} />
        <div className="mt-6">
          <FaqAccordion items={TMS_FAQS} />
        </div>
        <div className="mt-8">
          <ButtonLink href="/contact/">Contact Us</ButtonLink>
        </div>
      </Section>
    </SiteChrome>
  );
}
