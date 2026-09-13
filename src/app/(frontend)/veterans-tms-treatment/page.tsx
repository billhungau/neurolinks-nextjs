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

export const metadata = pageMetadata({
  title: "TMS Treatment for Veterans in BC | NeuroLinks Psychiatry",
  description:
    "Learn about psychiatrist-led TMS treatment for Canadian Veterans. Non-invasive outpatient care provided by NeuroLinks Psychiatry in Nanaimo, BC.",
  path: "/veterans-tms-treatment/",
  image: PAGE_OG_IMAGES.tms,
  robots: adsLandingRobots,
});

const BENEFITS = [
  ["Non-invasive", "Magnetic stimulation is delivered without surgery or injections."],
  ["No anesthesia", "Remain awake and alert throughout treatment."],
  ["Return to your day", "Treatment is outpatient and does not generally require recovery time."],
  ["Evidence-based treatment", "TMS is an established, non-invasive treatment for major depressive disorder."],
] as const;

const FAQS = [
  {
    q: "Does TMS require anesthesia?",
    a: "No. TMS is non-invasive and does not require anesthesia or sedation. You remain awake throughout treatment.",
  },
  {
    q: "Can I drive after treatment?",
    a: "Most people can return to their usual activities after a TMS session. Your psychiatrist will advise you if your individual circumstances require different precautions.",
  },
  {
    q: "How long does TMS treatment take?",
    a: "A standard course is usually delivered over several weeks. Accelerated schedules may also be considered for selected patients after psychiatric assessment.",
  },
  {
    q: "Will I need to stop my medications?",
    a: "Not necessarily. Medications and other treatments are reviewed during assessment, and any changes should be made with your treating clinician.",
  },
  {
    q: "Do I need a referral?",
    a: "Contact NeuroLinks and our team can explain the appropriate next step for your circumstances, including whether referral documentation is needed.",
  },
  {
    q: "Can Veterans Affairs Canada authorize TMS treatment?",
    a: "Authorization and coverage are determined individually by Veterans Affairs Canada. NeuroLinks can help explain the administrative process and information that may be required.",
  },
];

const REVIEWS = [
  "I highly recommend giving TMS a try if you are struggling.",
  "Dr. Au is very knowledgeable and it’s all about patient care and not the Money.",
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
            <Image src={MEDIA.tmsClinic} alt="" fill priority sizes="100vw" className="vtms-hero-photo" />
          </div>
          <div className="vtms-hero-overlay" aria-hidden="true" />
          <div className="vtms-wrap vtms-hero-grid">
            <div className="vtms-hero-copy">
              <p className="vtms-eyebrow">Care for Canadian Veterans</p>
              <h1>TMS Treatment for Veterans</h1>
              <p className="vtms-hero-lede">When previous treatments haven’t provided enough relief, TMS may offer another option.</p>
              <p className="vtms-hero-support">Non-invasive treatment provided in Nanaimo, BC, with assessment and care led by a psychiatrist.</p>
              <ul className="vtms-hero-points" aria-label="Treatment highlights">
                <li>Non-invasive</li>
                <li>No anesthesia</li>
                <li>Psychiatrist-led care</li>
              </ul>
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
            <span>Non-invasive</span>
            <span>No anesthesia</span>
            <span>Psychiatrist-led care</span>
            <span>Nanaimo, BC</span>
            <span>Veteran-focused support</span>
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
              {BENEFITS.map(([title, body], index) => (
                <article key={title} className="vtms-benefit-card">
                  <span className="vtms-card-number">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="vtms-section vtms-conditions">
          <div className="vtms-wrap vtms-conditions-layout">
            <div className="vtms-conditions-intro">
              <p className="vtms-eyebrow">Conditions we work with</p>
              <h2>Supporting Veterans with Complex Mental Health Challenges</h2>
              <p>TMS may be considered as part of a comprehensive treatment plan when symptoms continue despite previous care.</p>
            </div>
            <div className="vtms-condition-grid">
              {VETERAN_CONDITIONS.map((condition) => (
                <article key={condition.title} className="vtms-condition-card">
                  <span>{condition.label}</span>
                  <h3>{condition.title}</h3>
                  <p>{condition.body}</p>
                </article>
              ))}
              <p className="vtms-condition-note">Every person’s situation is unique. A psychiatric assessment is required to determine whether TMS may be appropriate.</p>
            </div>
          </div>
        </section>

        <section className="vtms-section vtms-clinician">
          <div className="vtms-wrap vtms-split">
            <div className="vtms-photo-card">
              <Image src={MEDIA.drAu} alt="Dr. Chi Hung Au, psychiatrist and founder of NeuroLinks" fill sizes="(max-width: 800px) 100vw, 45vw" className="vtms-cover" />
            </div>
            <div className="vtms-copy">
              <p className="vtms-eyebrow">Psychiatrist-led care</p>
              <h2>TMS Care Led by a Psychiatrist</h2>
              <p>TMS is a medical treatment. At NeuroLinks, patients are assessed by a psychiatrist before treatment, with individualized treatment planning and clinical monitoring throughout care.</p>
              <ol className="vtms-steps">
                <li><strong>Psychiatric assessment</strong><span>Review symptoms, treatment history and clinical considerations.</span></li>
                <li><strong>Personalized treatment plan</strong><span>Treatment is selected and planned for the individual.</span></li>
                <li><strong>Ongoing monitoring</strong><span>Progress and tolerability are reviewed throughout care.</span></li>
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
              {REVIEWS.map((review, index) => (
                <blockquote key={review} className={index === 0 ? "vtms-review vtms-review-featured" : "vtms-review"}>
                  <div className="vtms-stars" aria-label="5 out of 5 stars">★★★★★</div>
                  <p>“{review}”</p>
                  <footer>Google Review</footer>
                </blockquote>
              ))}
            </div>
            <div className="vtms-centre"><a href="#inquiry" className="vtms-text-link">Talk with our team →</a></div>
          </div>
        </section>

        <section className="vtms-section vtms-vac">
          <div className="vtms-wrap vtms-vac-grid">
            <div className="vtms-vac-image">
              <Image src={MEDIA.tmsBanner} alt="NeuroLinks TMS clinic in Nanaimo" fill sizes="(max-width: 800px) 100vw, 45vw" className="vtms-cover" />
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

        <section className="vtms-section vtms-faq">
          <div className="vtms-wrap vtms-faq-grid">
            <div>
              <p className="vtms-eyebrow">Frequently asked questions</p>
              <h2>Common Questions</h2>
              <p>Clear answers to practical questions that often come up before assessment.</p>
            </div>
            <FaqAccordion items={FAQS} />
          </div>
        </section>

        <section className="vtms-final">
          <div className="vtms-wrap vtms-final-grid">
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
        </section>
      </main>
      <div className="vtms-mobile-bar"><a href={SITE.phoneHref} aria-label="Call NeuroLinks">Call</a><a href="#inquiry">Request TMS Information</a></div>
    </div>
  );
}
