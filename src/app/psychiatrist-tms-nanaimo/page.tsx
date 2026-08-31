import Image from "next/image";
import { SiteChrome } from "@/components/SiteChrome";
import { ButtonLink } from "@/components/ButtonLink";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { TmsSectionNav } from "@/components/tms/TmsSectionNav";
import {
  DR_AU_PARAS,
  HANNAH_BIO,
  JULIE_BIO,
  LAURALEE_BIO,
  STORY_PARAS,
} from "@/content/about-bios";
import { MEDIA } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Psychiatrist in BC | TMS & ketamine treatment – NeuroLinks",
  description:
    "NeuroLinks in Nanaimo offers expert psychiatric care, TMS therapy, and ketamine treatment for depression & OCD. Book a consultation today.",
  path: "/psychiatrist-tms-nanaimo/",
});

const ABOUT_SECTIONS = [
  { id: "our-story", label: "Our story" },
  { id: "clinic", label: "The clinic" },
  { id: "dr-au", label: "Dr. Au" },
  { id: "team", label: "Our team" },
] as const;

const PRINCIPLES = [
  { index: "01", title: "Patient autonomy" },
  { index: "02", title: "Medication is not the only answer" },
  { index: "03", title: "Innovative treatment options" },
] as const;

const CREDENTIALS = [
  "Psychiatrist",
  "Clinical Assistant Professor, UBC",
  "Master of Science, University of Oxford",
  "Formal TMS training, Harvard University",
  "Experience establishing a TMS centre at Queen Mary Hospital",
] as const;

const TEAM = [
  {
    name: "Julie",
    role: "TMS Technician",
    src: MEDIA.julie,
    alt: "Julie, TMS Technician at NeuroLinks",
    bio: JULIE_BIO,
    position: "center 18%",
  },
  {
    name: "Hannah",
    role: "TMS Technician",
    src: MEDIA.hannah,
    alt: "Hannah, TMS Technician at NeuroLinks",
    bio: HANNAH_BIO,
    position: "center 22%",
  },
  {
    name: "Laura-Lee",
    role: "Registered Nurse",
    src: MEDIA.lauralee,
    alt: "Laura-Lee, Registered Nurse at NeuroLinks",
    bio: LAURALEE_BIO,
    position: "center 16%",
  },
] as const;

export default function AboutUsPage() {
  return (
    <SiteChrome>
      <section id="about-hero" className="about-hero relative overflow-hidden bg-[var(--nl-navy)]">
        <div className="absolute inset-0">
          <Image
            src={MEDIA.aboutHero}
            alt="NeuroLinks reception area with the clinic name displayed on the wall"
            fill
            priority
            sizes={IMG_SIZES.fullBleed}
            className="hero-photo object-cover object-[68%_42%] md:object-[54%_46%]"
          />
          <div className="hero-scrim pointer-events-none absolute inset-0 md:hidden" aria-hidden="true" />
          <div className="about-hero-wash pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true" />
          <div
            className="hero-top-scrim pointer-events-none absolute inset-x-0 top-0 md:hidden"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-24 bg-gradient-to-b from-[var(--nl-navy)]/50 to-transparent md:block"
            aria-hidden="true"
          />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[clamp(500px,56svh,560px)] max-w-6xl flex-col justify-end px-5 pt-20 pb-8 md:justify-center md:px-6 md:py-16 lg:px-8">
          <div className="hero-intro max-w-[36rem]">
            <p className="hero-enter eyebrow text-white/80">Our clinic and team</p>
            <h1 className="hero-enter mt-3 font-serif text-[clamp(2.375rem,5.2vw,4rem)] font-semibold leading-[1.04] text-white">
              About NeuroLinks
            </h1>
            <p className="hero-enter hero-enter-2 mt-4 max-w-[34ch] text-[0.975rem] leading-[1.55] text-white/90 md:mt-5 md:max-w-md md:text-[1.05rem] md:leading-[1.65]">
              Psychiatrist-led care for people living with complex and treatment-resistant mental
              health conditions.
            </p>
            <div className="hero-enter hero-enter-3 mt-7 flex flex-wrap gap-3">
              <ButtonLink
                href="#team"
                variant="accent"
                className="grow basis-36 whitespace-nowrap md:grow-0"
              >
                Meet our team
              </ButtonLink>
              <ButtonLink
                href="/contact/"
                variant="on-dark"
                className="grow basis-36 whitespace-nowrap md:grow-0"
              >
                Contact the clinic
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <TmsSectionNav sections={ABOUT_SECTIONS} />

      <section id="our-story" className="tms-section ket-ivory">
        <div className="tms-wrap">
          <Reveal className="about-story">
            <div>
              <Eyebrow>Our story</Eyebrow>
              <h2 className="tms-h2 mt-3">Care beyond conventional treatment</h2>
              <div className="about-story-copy">
                {STORY_PARAS.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            </div>
            <ol className="about-principles">
              {PRINCIPLES.map((item) => (
                <li key={item.index}>
                  <p>{item.index}</p>
                  <h3>{item.title}</h3>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section id="clinic" className="tms-section bg-white">
        <div className="tms-wrap">
          <Reveal className="about-gallery-wrap">
            <Eyebrow>Our clinic</Eyebrow>
            <h2 className="tms-h2 mt-3">A welcoming space for specialized care</h2>
            <div className="about-gallery">
              <figure className="about-gallery-wide">
                <div className="about-photo">
                  <Image
                    src={MEDIA.reception}
                    alt="Reception area at NeuroLinks in Nanaimo"
                    fill
                    sizes={IMG_SIZES.half}
                    className="object-cover object-[center_60%]"
                  />
                </div>
                <figcaption>NeuroLinks reception area</figcaption>
              </figure>
              <figure className="about-gallery-narrow">
                <div className="about-photo">
                  <Image
                    src={MEDIA.tmsMachine}
                    alt="TMS treatment room at NeuroLinks"
                    fill
                    sizes={IMG_SIZES.third}
                    className="object-cover object-[72%_46%]"
                  />
                </div>
                <figcaption>TMS treatment room at NeuroLinks</figcaption>
              </figure>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="dr-au" className="tms-section tms-mist">
        <div className="tms-wrap">
          <Reveal className="about-au">
            <div className="about-au-portrait">
              <Image
                src={MEDIA.drAu}
                alt="Dr. Chi Hung Au, psychiatrist and founder of NeuroLinks"
                fill
                sizes="(max-width: 768px) 100vw, 32vw"
                className="object-cover object-[center_18%]"
              />
            </div>
            <div>
              <h2 className="about-au-name">Dr Chi Hung Au</h2>
              <p className="about-role">Psychiatrist</p>
              <div className="about-bio">
                {DR_AU_PARAS.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            </div>
            <ul className="about-credentials">
              {CREDENTIALS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section id="team" className="tms-section bg-white">
        <div className="tms-wrap">
          <Reveal className="about-team-reveal">
            <Eyebrow>Our team</Eyebrow>
            <h2 className="tms-h2 mt-3">Supporting patients throughout treatment</h2>
            <div className="about-team">
              {TEAM.map((member) => (
                <article key={member.name}>
                  <div className="about-team-photo">
                    <Image
                      src={member.src}
                      alt={member.alt}
                      fill
                      sizes={IMG_SIZES.third}
                      className="object-cover"
                      style={{ objectPosition: member.position }}
                    />
                  </div>
                  <h3>{member.name}</h3>
                  <p className="about-role">{member.role}</p>
                  <p className="about-bio">{member.bio}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="tms-section tms-navy tms-assess">
        <div className="tms-wrap">
          <Reveal>
            <h2 className="tms-h2">Meet a team committed to individualized care</h2>
            <p className="tms-lede tms-lede-on-dark mt-4">
              Contact NeuroLinks to learn more about psychiatric assessment, TMS and ketamine
              treatment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/contact/" variant="accent">
                Contact the clinic
              </ButtonLink>
              <ButtonLink
                href="/services-psychiatric-tms-ketamine-treatment/"
                variant="on-dark"
              >
                Explore our services
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteChrome>
  );
}
