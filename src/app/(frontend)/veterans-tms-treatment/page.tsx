import Image from "next/image";
import { FaqAccordion } from "@/components/FaqAccordion";
import { TmsVideo } from "@/components/tms/TmsVideo";
import { VeteransTmsLeadForm } from "@/components/forms/VeteransTmsLeadForm";
import { MEDIA } from "@/lib/media";
import { adsLandingRobots, PAGE_OG_IMAGES, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { treatmentVideoSrc } from "@/lib/videos";
import "./veterans-tms.css";

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
  ["Evidence-based", "TMS is an established treatment option for major depressive disorder."],
] as const;

const FAQS = [
  { question: "Does TMS require anesthesia?", answer: "No. TMS is non-invasive and does not require anesthesia or sedation. You remain awake throughout treatment." },
  { question: "Can I drive after treatment?", answer: "Most people can return to their usual activities after a TMS session. Your psychiatrist will advise you if your individual circumstances require different precautions." },
  { question: "How long does TMS treatment take?", answer: "A standard course is usually delivered over several weeks. Accelerated schedules may also be considered for selected patients after psychiatric assessment." },
  { question: "Will I need to stop my medications?", answer: "Not necessarily. Medications and other treatments are reviewed during assessment, and any changes should be made with your treating clinician." },
  { question: "Do I need a referral?", answer: "Contact NeuroLinks and our team can explain the appropriate next step for your circumstances, including whether referral documentation is needed." },
  { question: "Can Veterans Affairs Canada authorize TMS treatment?", answer: "Authorization and coverage are determined individually by Veterans Affairs Canada. NeuroLinks can help explain the administrative process and information that may be required." },
];

const REVIEWS = [
  "The team at NeuroLinks is professional, compassionate and truly supportive throughout the process.",
  "I was impressed by how comfortable the treatment was and how much better I feel now.",
  "The staff are exceptional and made the whole experience positive.",
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
                <li>Non-invasive</li><li>No anesthesia</li><li>Psychiatrist-led care</li>
              </ul>
              <a href="#inquiry" className="vtms-button">Find Out If TMS May Be Right for You</a>
              <p className="vtms-confidential">Confidential inquiry · No obligation</p>
            </div>
            <aside className="vtms-hero-card" aria-label="Request information">
              <h2>Find Out If TMS May Be Right for You</h2>
              <p>Send a brief inquiry and our team will contact you to discuss the next steps.</p>
              <VeteransTmsLeadForm compact />
            </aside>
          </div>
        </section>

        <section className="vtms-trust" aria-label="NeuroLinks clinic facts">
          <div className="vtms-wrap vtms-trust-grid"><span>Psychiatrist-led care</span><span>Nanaimo, BC</span><span>Non-invasive treatment</span><span>Veteran-focused support</span></div>
        </section>

        <section className="vtms-section vtms-benefits">
          <div className="vtms-wrap">
            <div className="vtms-section-heading"><h2>Another Option When Treatment Hasn’t Been Enough</h2><p>TMS uses magnetic stimulation to target brain networks involved in depression and may be considered when symptoms continue despite previous treatment.</p></div>
            <div className="vtms-benefit-grid">{BENEFITS.map(([title, body], index) => <article key={title} className="vtms-benefit-card"><span className="vtms-card-number">0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
            <div className="vtms-centre"><a href="#inquiry" className="vtms-button">See If TMS May Be an Option</a></div>
          </div>
        </section>

        <section className="vtms-section vtms-clinician">
          <div className="vtms-wrap vtms-split">
            <div className="vtms-photo-card"><Image src={MEDIA.drAu} alt="Dr. Chi Hung Au, psychiatrist and founder of NeuroLinks" fill sizes="(max-width: 800px) 100vw, 45vw" className="vtms-cover" /></div>
            <div className="vtms-copy"><p className="vtms-eyebrow">Why NeuroLinks</p><h2>TMS Care Led by a Psychiatrist</h2><p>TMS is a medical treatment. At NeuroLinks, patients are assessed by a psychiatrist before treatment, with individualized treatment planning and clinical monitoring throughout care.</p><ol className="vtms-steps"><li><strong>Psychiatric assessment</strong><span>Review symptoms, treatment history and clinical considerations.</span></li><li><strong>Personalized treatment plan</strong><span>Treatment is selected and planned for the individual.</span></li><li><strong>Ongoing monitoring</strong><span>Progress and tolerability are reviewed throughout care.</span></li></ol></div>
          </div>
        </section>

        <section id="inquiry" className="vtms-section vtms-inquiry">
          <div className="vtms-wrap vtms-inquiry-grid"><div><p className="vtms-eyebrow">A simple first step</p><h2>Talk With Our Team</h2><p>Wondering whether TMS may be appropriate? Send your contact information and our team will get in touch to discuss the next steps.</p><p className="vtms-call">Prefer to speak with someone? <a href={SITE.phoneHref}>Call {SITE.phone}</a></p></div><div className="vtms-form-card"><VeteransTmsLeadForm /></div></div>
        </section>

        <section className="vtms-section vtms-vac">
          <div className="vtms-wrap vtms-vac-grid"><div className="vtms-vac-image"><Image src={MEDIA.tmsBanner} alt="NeuroLinks TMS clinic in Nanaimo" fill sizes="(max-width: 800px) 100vw, 45vw" className="vtms-cover" /></div><div><p className="vtms-eyebrow">Coverage and authorization</p><h2>Veterans Affairs Canada and TMS</h2><h3>We can help you understand the authorization process.</h3><p>Veterans receiving VAC benefits may have questions about authorization for TMS. NeuroLinks can help explain the administrative process and information that may be required.</p><p className="vtms-note">Coverage and authorization are determined individually by Veterans Affairs Canada.</p><a href="#inquiry" className="vtms-button">Ask Us About VAC &amp; TMS</a></div></div>
        </section>

        <section className="vtms-section vtms-video-section">
          <div className="vtms-wrap vtms-video-grid"><div className="vtms-video-frame"><TmsVideo src={treatmentVideoSrc("tms")} poster={MEDIA.landingTmsPoster} label="TMS introduction video" /></div><div><p className="vtms-eyebrow">A 95-second introduction</p><h2>See What TMS Treatment Is Like</h2><p>Watch our short introduction to TMS and what you can expect at NeuroLinks. The video loads only when you choose to play it.</p><a href="#inquiry" className="vtms-text-link">Have questions? Talk with our team →</a></div></div>
        </section>

        <section className="vtms-section vtms-reviews">
          <div className="vtms-wrap"><div className="vtms-section-heading"><p className="vtms-eyebrow">Google Reviews</p><h2>What Patients Say About NeuroLinks</h2></div><div className="vtms-review-grid">{REVIEWS.map((review, index) => <blockquote key={review} className={index === 0 ? "vtms-review vtms-review-featured" : "vtms-review"}><div className="vtms-stars" aria-label="5 out of 5 stars">★★★★★</div><p>“{review}”</p><footer>Google Review</footer></blockquote>)}</div><div className="vtms-centre"><a href="#inquiry" className="vtms-button">Talk With Our Team</a></div></div>
        </section>

        <section className="vtms-section vtms-faq"><div className="vtms-wrap vtms-faq-grid"><div><p className="vtms-eyebrow">Common questions</p><h2>Questions About TMS</h2><p>Clear answers to practical questions that often come up before assessment.</p></div><FaqAccordion items={FAQS} /></div></section>

        <section className="vtms-final"><div className="vtms-wrap vtms-final-grid"><div><p className="vtms-eyebrow">Take the next step</p><h2>Find Out Whether TMS May Be an Option</h2><p>Speak with our team about TMS treatment and what would be involved in determining whether it is appropriate.</p><p>Prefer to speak with someone? <a href={SITE.phoneHref}>Call {SITE.phone}</a></p></div><div className="vtms-form-card"><VeteransTmsLeadForm /></div></div></section>
      </main>
      <div className="vtms-mobile-bar"><a href={SITE.phoneHref} aria-label="Call NeuroLinks">Call</a><a href="#inquiry">Request TMS Information</a></div>
    </div>
  );
}
