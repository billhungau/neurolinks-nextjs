import Image from "next/image";
import { ContactForm } from "@/components/forms/ContactForm";
import { FaqAccordion } from "@/components/FaqAccordion";
import { TmsVideo } from "@/components/tms/TmsVideo";
import { VETERAN_CONDITIONS } from "@/content/veterans";
import { MEDIA } from "@/lib/media";
import { adsLandingRobots, PAGE_OG_IMAGES, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { treatmentVideoSrc } from "@/lib/videos";
import "./veterans-tms.css";
import "./veterans-tms-refinements.css";
import "./veterans-portrait-natural.css";

export const metadata = pageMetadata({
  title: "TMS Treatment for Veterans in BC | NeuroLinks Psychiatry",
  description:
    "Learn about psychiatrist-led TMS treatment for Canadian Veterans. Non-invasive outpatient care provided by NeuroLinks Psychiatry in Nanaimo, BC.",
  path: "/veterans-tms-treatment/",
  image: PAGE_OG_IMAGES.tms,
  robots: adsLandingRobots,
});

type IconName =
  | "noninvasive"
  | "noAnesthesia"
  | "psychiatrist"
  | "veteranSupport"
  | "dailyLife"
  | "evidence"
  | "assessment"
  | "plan"
  | "monitoring"
  | "check";

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const common = {
    className,
    width: 32,
    height: 32,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "noninvasive":
      return <svg {...common}><path d="M5 13c1.2-4.3 4.5-7 9.2-7 2.1 0 3.8.5 4.8 1.2-1.2 4.8-4.2 8.4-9 9.4-2 .4-3.8.2-5-.5"/><path d="M4 19c3.3-4.6 7.3-7.8 12.2-9.7"/></svg>;
    case "noAnesthesia":
      return <svg {...common}><path d="M8 4l8 8"/><path d="M6 8l10 10"/><path d="M9 3l2-2 10 10-2 2"/><path d="M7 9l-4 4 8 8 4-4"/><path d="M3 3l18 18"/></svg>;
    case "psychiatrist":
      return <svg {...common}><path d="M12 3l7 3v5c0 4.6-2.8 8.2-7 10-4.2-1.8-7-5.4-7-10V6l7-3z"/><path d="M9 12h6M12 9v6"/></svg>;
    case "veteranSupport":
      return <svg {...common}><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 19c.5-3.4 2.4-5 5-5s4.5 1.6 5 5"/><path d="M11 19c.5-3.4 2.4-5 5-5s4.5 1.6 5 5"/></svg>;
    case "dailyLife":
      return <svg {...common}><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/><path d="M8 14h3M13 14h3M8 17h3"/></svg>;
    case "evidence":
      return <svg {...common}><path d="M4 20V10M9 20V6M14 20v-8M19 20V3"/><path d="M3 20h18"/></svg>;
    case "assessment":
      return <svg {...common}><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 11h6M9 15h6"/></svg>;
    case "plan":
      return <svg {...common}><circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 20c.5-3.6 2.4-5.5 5-5.5S12.5 16.4 13 20"/><path d="M11 20c.5-3.6 2.4-5.5 5-5.5s4.5 1.9 5 5.5"/></svg>;
    case "monitoring":
      return <svg {...common}><path d="M4 20V12M9 20V8M14 20v-5M19 20V4"/><path d="M3 20h18"/></svg>;
    case "check":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.5 2.5L16.5 9"/></svg>;
  }
}

const BENEFITS = [
  ["Non-invasive", "Magnetic stimulation is delivered without surgery or injections.", "noninvasive"],
  ["No anesthesia", "Remain awake and alert throughout treatment.", "noAnesthesia"],
  ["Return to your day", "Treatment is outpatient and does not generally require recovery time.", "dailyLife"],
  ["Evidence-based treatment", "TMS is an established, non-invasive treatment for major depressive disorder.", "evidence"],
] as const satisfies readonly [string, string, IconName][];

const TRUST_ITEMS = [
  ["Non-invasive", "noninvasive"],
  ["No anesthesia", "noAnesthesia"],
  ["Psychiatrist-led care", "psychiatrist"],
  ["Veteran-focused support", "veteranSupport"],
] as const satisfies readonly [string, IconName][];

const FAQS = [
  {
    q: "Does TMS require anesthesia?",
    a: "No. TMS is non-invasive and does not require anesthesia or sedation. You remain awake during treatment. Unlike ECT, there is no anesthesia recovery period, and most people can return to their usual activities immediately afterward.",
  },
  {
    q: "Can I drive after treatment?",
    a: "Yes. Most people can drive and return to work or their usual activities after a TMS session because treatment does not require anesthesia or sedation. If your psychiatrist gives you individual precautions, follow that advice.",
  },
  {
    q: "How many treatments are needed?",
    a: "A typical course is about 30 sessions, usually delivered 5 days per week over approximately 4 to 6 weeks. Some patients may be considered for a shorter, more intensive schedule with several treatments per day over 5 days after psychiatric assessment.",
  },
  {
    q: "Will I need to stop my medications?",
    a: "Usually not. TMS can be given alongside antidepressant medication. Your medications are reviewed during assessment, and continuing an oral antidepressant may help support the durability of response. Do not stop or change medication unless your treating clinician advises it.",
  },
  {
    q: "Do I need a referral?",
    a: "Contact NeuroLinks first and our team can explain the referral or documentation needed for your situation. A psychiatric assessment is required before TMS treatment begins.",
  },
  {
    q: "Who may not be able to receive TMS?",
    a: "TMS may not be suitable for people with certain non-removable metal or implanted devices in or near the head, such as some aneurysm clips or coils, brain stents, deep-brain stimulators, or some ear or eye implants. A recent hemorrhagic stroke or head injury may also require additional risk assessment.",
  },
  {
    q: "Can Veterans Affairs Canada authorize TMS treatment?",
    a: "VAC authorization and coverage are determined individually. NeuroLinks can help explain the administrative process and what clinical or referral information may be required, but authorization cannot be guaranteed in advance.",
  },
];

const REVIEWS = [
  {
    quote: "I finally have hope and feel like I’m getting my life back. I highly recommend giving TMS a try if you are struggling.",
    initials: "C. M.",
  },
  {
    quote: "Thank you Dr. Au and Hannah for all your help during and after my TMS treatment — life is brighter, have not felt this good in years.",
    initials: "A. J.",
  },
  {
    quote: "I feel much more myself and can feel hopeful again. Thanks to Dr. Au and the incredible staff, you all have been wonderful.",
    initials: "J. A.",
  },
] as const;

function Header() {
  return (
    <header className="vtms-header">
      <div className="vtms-wrap vtms-header-inner">
        <Image src={SITE.logo} alt="NeuroLinks" width={230} height={46} priority className="vtms-logo" />
        <div className="vtms-header-actions">
          <a href={SITE.phoneHref} className="vtms-phone">Call {SITE.phone}</a>
          <a href="#inquiry" className="vtms-button vtms-button-small">Request information</a>
        </div>
      </div>
    </header>
  );
}

export default function VeteransTmsLandingPage() {
  return (
    <div className="vtms-page">
      <Header />
      <main>
        <section className="vtms-hero">
          <div className="vtms-hero-media" aria-hidden="true">
            <Image src="/media/images/veterans-tms-hero.webp" alt="" fill priority sizes="100vw" className="vtms-hero-photo" />
          </div>
          <div className="vtms-hero-overlay" aria-hidden="true" />
          <div className="vtms-wrap vtms-hero-grid">
            <div className="vtms-hero-copy">
              <p className="vtms-eyebrow">Care for Canadian Veterans</p>
              <h1>TMS Treatment for Veterans</h1>
              <p className="vtms-hero-lede">When previous treatments haven’t provided enough relief, TMS may offer another option.</p>
              <p className="vtms-hero-support">Non-invasive treatment provided in Nanaimo, BC, with assessment and care led by a psychiatrist.</p>
              <a href="#tms-benefits" className="vtms-button vtms-button-secondary">Learn About TMS ↓</a>
            </div>
            <aside id="inquiry" className="vtms-hero-card" aria-label="Request information">
              <h2>Talk With Our Team</h2>
              <p>Send us a message about TMS, VAC authorization or the next step in assessment.</p>
              <ContactForm showReferralNote={false} />
            </aside>
          </div>
        </section>

        <section className="vtms-trust" aria-label="NeuroLinks clinic facts">
          <div className="vtms-wrap vtms-trust-grid">
            {TRUST_ITEMS.map(([label, icon]) => (
              <div className="vtms-trust-item" key={label}>
                <Icon name={icon} className="vtms-trust-icon" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="tms-benefits" className="vtms-section vtms-benefits">
          <div className="vtms-wrap">
            <div className="vtms-section-heading">
              <p className="vtms-eyebrow">How TMS can help</p>
              <h2>Another Option When Treatment Hasn’t Been Enough</h2>
              <p>TMS uses magnetic stimulation to target brain networks involved in depression and may be considered when symptoms continue despite previous treatment.</p>
            </div>
            <div className="vtms-benefit-grid">
              {BENEFITS.map(([title, body, icon]) => (
                <article key={title} className="vtms-benefit-card">
                  <Icon name={icon} className="vtms-benefit-icon" />
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="vtms-conditions">
          <div className="vtms-conditions-visual">
            <Image src="/media/images/veterans-mountain.jpg" alt="Mountain and forest landscape in British Columbia" fill sizes="(max-width: 900px) 100vw, 50vw" className="vtms-cover" />
            <div className="vtms-conditions-visual-overlay" />
            <div className="vtms-conditions-visual-copy">
              <h2>Different<br />experiences.<br />A shared purpose.</h2>
              <p><span className="vtms-purpose-rule" aria-hidden="true" />Support for what comes next.</p>
            </div>
          </div>
          <div className="vtms-conditions-content">
            <p className="vtms-eyebrow">Conditions we work with</p>
            <h2>Supporting Veterans with Complex Mental Health Challenges</h2>
            <p>TMS may be considered as part of a comprehensive treatment plan when symptoms continue despite previous care.</p>
            <ul className="vtms-condition-list">
              {VETERAN_CONDITIONS.map((condition) => (
                <li key={condition.title}><Icon name="check" className="vtms-check-icon" /><span>{condition.title}</span></li>
              ))}
            </ul>
            <p className="vtms-condition-note">Every person’s situation is unique. A psychiatric assessment is required to determine whether TMS may be appropriate.</p>
          </div>
        </section>

        <section className="vtms-section vtms-clinician">
          <div className="vtms-wrap vtms-split">
            <div className="vtms-photo-card vtms-portrait-natural">
              <div className="vtms-portrait-image-wrap">
                <Image src="/media/images/Portrait for veterans page.png" alt="Dr. Chi Hung Au, psychiatrist and founder of NeuroLinks" width={768} height={768} sizes="(max-width: 900px) calc(100vw - 44px), 42vw" className="vtms-clinician-photo" />
              </div>
              <div className="vtms-clinician-quote">
                <blockquote>“Compassionate, evidence-based care for meaningful change.”</blockquote>
                <span>— Dr. Chi Hung Au</span>
              </div>
            </div>
            <div className="vtms-copy">
              <p className="vtms-eyebrow">Psychiatrist-led care</p>
              <h2>TMS Care Led by a Psychiatrist</h2>
              <p>TMS is a medical treatment. At NeuroLinks, patients are assessed by a psychiatrist before treatment, with individualized treatment planning and clinical monitoring throughout care.</p>
              <ol className="vtms-steps vtms-steps-visual">
                <li><Icon name="assessment" className="vtms-step-icon" /><strong>Psychiatric assessment</strong><span>Review symptoms, treatment history and clinical considerations.</span></li>
                <li><Icon name="plan" className="vtms-step-icon" /><strong>Personalized treatment plan</strong><span>Treatment is selected and planned for the individual.</span></li>
                <li><Icon name="monitoring" className="vtms-step-icon" /><strong>Ongoing monitoring</strong><span>Progress and tolerability are reviewed throughout care.</span></li>
              </ol>
            </div>
          </div>
        </section>

        <section className="vtms-section vtms-reviews">
          <div className="vtms-wrap">
            <div className="vtms-section-heading">
              <p className="vtms-eyebrow">What patients say</p>
              <h2>Real Experiences</h2>
            </div>
            <div className="vtms-review-grid">
              {REVIEWS.map((review) => (
                <blockquote key={review.initials} className="vtms-review">
                  <div className="vtms-stars" aria-label="5 out of 5 stars">★★★★★</div>
                  <p>“{review.quote}”</p>
                  <footer><strong>{review.initials}</strong><span>Google Review</span></footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section className="vtms-section vtms-vac">
          <div className="vtms-wrap vtms-vac-grid">
            <div className="vtms-vac-image">
              <Image src="/media/images/Canadian-flag.png" alt="Canadian flag overlooking Nanaimo and the coast from Mount Benson" fill sizes="(max-width: 800px) 100vw, 45vw" className="vtms-cover" />
            </div>
            <div>
              <p className="vtms-eyebrow">Veterans Affairs Canada</p>
              <h2>VAC and TMS</h2>
              <h3>We can help you understand the authorization process.</h3>
              <p>Veterans receiving VAC benefits may have questions about authorization for TMS. NeuroLinks can help explain the administrative process and information that may be required.</p>
              <p className="vtms-note">Coverage and authorization are determined individually by Veterans Affairs Canada.</p>
              <a href="#inquiry" className="vtms-button">Ask Us About VAC &amp; TMS</a>
            </div>
          </div>
        </section>

        <section className="vtms-section vtms-video-section">
          <div className="vtms-wrap vtms-video-grid">
            <div>
              <p className="vtms-eyebrow">See what treatment is like</p>
              <h2>A Short Introduction to TMS</h2>
              <p>Watch our 95-second introduction to TMS and what you can expect at NeuroLinks.</p>
              <a href="#inquiry" className="vtms-text-link">Have questions? Talk with our team →</a>
            </div>
            <div className="vtms-video-frame">
              <TmsVideo src={treatmentVideoSrc("tms")} poster={MEDIA.landingTmsPoster} label="TMS introduction video" />
            </div>
          </div>
        </section>

        <section className="vtms-bottom-split">
          <div className="vtms-faq vtms-faq-panel">
            <div className="vtms-faq-panel-inner">
              <p className="vtms-eyebrow">Frequently asked questions</p>
              <h2>Common Questions</h2>
              <p className="vtms-faq-intro">Clear answers to practical questions that often come up before assessment.</p>
              <FaqAccordion items={FAQS} />
            </div>
          </div>

          <div className="vtms-final vtms-final-panel">
            <div className="vtms-final-media" aria-hidden="true">
              <Image src="/media/images/veterans-tms-hero.webp" alt="" fill sizes="(max-width: 900px) 100vw, 50vw" className="vtms-final-photo" />
            </div>
            <div className="vtms-final-overlay" aria-hidden="true" />
            <div className="vtms-final-panel-inner">
              <div>
                <p className="vtms-eyebrow">Take the next step</p>
                <h2>Let’s Talk About What May Be Right for You</h2>
                <p>Speak with our team about TMS treatment and what would be involved in determining whether it may be appropriate.</p>
              </div>
              <div className="vtms-final-actions">
                <a href="#inquiry" className="vtms-button vtms-button-light">Request Information</a>
                <p>Prefer to speak with someone? <a href={SITE.phoneHref}>Call {SITE.phone}</a></p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <div className="vtms-mobile-bar"><a href={SITE.phoneHref} aria-label="Call NeuroLinks">Call</a><a href="#inquiry">Request TMS Information</a></div>
    </div>
  );
}
