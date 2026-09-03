import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { LANDING_FAQS } from "./faqs.ts";
import {
  LANDING_CLOSE_TEXT,
  LANDING_HEADLINE,
  LANDING_INQUIRY_HEADING,
  LANDING_INQUIRY_NOTE,
  LANDING_INQUIRY_SUPPORTING_TEXT,
  LANDING_NEXT_STEPS,
  LANDING_OUTCOME_NOTE,
  LANDING_REVIEWS,
  LANDING_REVIEWS_CTA_LABEL,
  LANDING_SUPPORTING_TEXT,
  LANDING_TREATMENT_HEADING,
  LANDING_TREATMENTS,
  LANDING_TRUST,
  LANDING_WHY_HEADING,
  LANDING_WHY_TEXT,
} from "./landing.ts";
import { LANDING_YOUTUBE } from "../lib/media.ts";
import { SITE } from "../lib/site.ts";

const root = dirname(fileURLToPath(import.meta.url));
const landingPage = readFileSync(
  join(root, "../app/neurolinks-psychiatry-nanaimo-bc/page.tsx"),
  "utf8",
);
const homePage = readFileSync(join(root, "../app/page.tsx"), "utf8");
const contactPage = readFileSync(join(root, "../app/contact/page.tsx"), "utf8");
const landingHeader = readFileSync(join(root, "../components/LandingHeader.tsx"), "utf8");
const contactForm = readFileSync(join(root, "../components/forms/ContactForm.tsx"), "utf8");
const revealSource = readFileSync(join(root, "../components/Reveal.tsx"), "utf8");
const globalsCss = readFileSync(join(root, "../app/globals.css"), "utf8");

function wordCount(text: string) {
  return text.trim().split(/\s+/).length;
}

function firstIndex(source: string, token: string) {
  const index = source.indexOf(token);
  assert.ok(index >= 0, `missing ${token}`);
  return index;
}

test("landing and contact pages share the same ContactForm module", () => {
  assert.match(landingPage, /from "@\/components\/forms\/ContactForm"/);
  assert.match(contactPage, /from "@\/components\/forms\/ContactForm"/);
  assert.match(contactPage, /<ContactForm \/>/);
  assert.equal(contactPage.includes("notice="), false);
  assert.equal(contactPage.includes("LANDING_INQUIRY_NOTE"), false);
  assert.equal(contactPage.includes("showReferralNote"), false);
  assert.match(landingPage, /showReferralNote=\{false\}/);
  assert.match(contactForm, /showReferralNote = true/);
  assert.match(contactForm, /Physician Referral Form/);
  assert.equal(landingPage.includes("Physician Referral Form"), false);
  assert.equal(landingPage.includes("jotform.com"), false);
  assert.equal(landingPage.includes("not connected"), false);
});

test("landing inquiry CTAs target #inquiry and keep compact navigation", () => {
  assert.match(landingPage, /#inquiry/);
  assert.match(landingHeader, /#inquiry/);
  assert.match(landingHeader, /Enquire/);
  assert.equal(landingHeader.includes("Ask about treatment options"), false);
  assert.equal(landingHeader.includes("Physician Referral"), false);
  assert.match(landingPage, /Explore treatments/);
  assert.match(landingPage, /Talk to our team/);
  assert.equal(LANDING_TREATMENTS[0].ctaLabel, "Ask about TMS");
  assert.equal(LANDING_TREATMENTS[1].ctaLabel, "Ask about ketamine");
  assert.match(landingPage, /item\.ctaLabel/);
  assert.equal(landingPage.includes("Request assessment"), false);
  assert.equal(landingPage.includes("Watch treatment videos"), false);
  assert.equal(landingPage.includes("Book now"), false);
  assert.match(landingPage, /href="#treatment"/);
  assert.ok(landingPage.indexOf('id="treatment"') < landingPage.indexOf('id="inquiry"'));
  assert.equal((landingPage.match(/<ContactForm/g) ?? []).length, 1);
  assert.equal(landingHeader.includes("About Us"), false);
  assert.match(landingHeader, /#treatment/);
  assert.match(landingHeader, /#psychiatrist/);
  assert.match(landingHeader, /#faq/);
  assert.match(landingHeader, /SITE\.phoneHref/);
  assert.equal(SITE.phoneHref, "tel:2507395530");
  assert.match(landingHeader, /Open menu/);
  assert.match(landingHeader, /aria-controls/);
  assert.match(landingHeader, /landing-mobile-nav/);
  assert.equal(landingHeader.includes("PRIMARY_NAV"), false);
  assert.equal(landingHeader.includes("document.body.style.overflow"), false);
  assert.match(landingPage, /id="psychiatrist"/);
  assert.match(landingPage, /psychiatrist-tms-nanaimo/);
});

test("landing header uses a centred three-zone desktop layout", () => {
  assert.match(globalsCss, /\.landing-header \.landing-header-bar \{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s*auto\s*minmax\(0,\s*1fr\)/);
  assert.match(globalsCss, /html:has\(\.landing-header\) \{[\s\S]*?--nl-header-height:\s*4\.5rem/);
  assert.match(globalsCss, /@media \(max-width: 63\.99rem\) \{[\s\S]*?--nl-header-height:\s*3\.75rem/);
  assert.equal(globalsCss.includes("--nl-header-height: 6.75rem"), false);
  assert.match(landingHeader, /site-header--transparent/);
  assert.match(landingHeader, /SCROLL_SOLID_AT = 40/);
  assert.match(landingHeader, /className=\{`landing-header site-header fixed/);
});

test("landing logo uses a same-page #top hash so advertising parameters are kept", () => {
  assert.match(landingPage, /id="top"/);
  assert.match(landingPage, /landing-top-anchor/);
  assert.match(landingHeader, /href="#top"/);
  assert.equal(landingHeader.includes('id="top"'), false);
  assert.equal(landingHeader.includes('href="/neurolinks-psychiatry-nanaimo-bc/"'), false);
  assert.match(globalsCss, /\.landing-top-anchor \{[\s\S]*?height:\s*0/);
});

test("Reveal fails open when the observer cannot run", () => {
  assert.match(revealSource, /REVEAL_FALLBACK_MS = 1200/);
  assert.match(revealSource, /prefersReducedMotion\(\)[\s\S]*reveal\(\)/);
  assert.match(revealSource, /typeof IntersectionObserver === "undefined"/);
  assert.match(revealSource, /isInOrPastView\(node\)/);
  assert.equal(revealSource.includes("setTimeout(reveal, 12000)"), false);
});

test("landing keeps the approved headline, excerpt and three verbatim reviews", () => {
  assert.equal(
    LANDING_HEADLINE,
    "When medication hasn’t helped enough, there may be another way forward.",
  );
  assert.match(LANDING_SUPPORTING_TEXT, /psychiatrist-led TMS and ketamine treatment in Nanaimo/);
  assert.match(LANDING_SUPPORTING_TEXT, /care tailored to your needs/);
  assert.equal(LANDING_HEADLINE.includes("\n"), false);
  assert.match(landingPage, /MEDIA\.homeHeroRetouched/);
  assert.match(landingPage, /DR_AU_PARAS\[0\]/);
  assert.equal(LANDING_REVIEWS.length, 3);
  assert.match(landingPage, /LANDING_REVIEWS/);
  assert.equal(
    LANDING_REVIEWS[0].text.includes("it’s all about patient care and not the money"),
    true,
  );
  assert.equal(
    LANDING_REVIEWS[2].text.startsWith("The Transcranial Magnetic Stimulation took longer"),
    true,
  );
  assert.match(LANDING_OUTCOME_NOTE, /outcomes vary/i);
  assert.equal(LANDING_FAQS.length, 10);
  assert.equal(LANDING_TREATMENT_HEADING, "Explore your treatment options");
  assert.match(LANDING_TREATMENTS[0].benefit, /antidepressants have not helped enough/);
  assert.match(LANDING_TREATMENTS[0].body, /non-invasive/);
  assert.match(LANDING_TREATMENTS[0].body, /generally well tolerated/);
  assert.equal(/anesthesia/i.test(LANDING_TREATMENTS[0].body), false);
  assert.match(LANDING_TREATMENTS[1].benefit, /for some people/i);
  assert.match(LANDING_TREATMENTS[1].benefit, /hours or days/);
  assert.match(LANDING_TREATMENTS[1].body, /registered nurse/);
  assert.match(LANDING_TREATMENTS[1].body, /vital-sign monitoring/);
  assert.equal(
    LANDING_TREATMENTS.some((item) => /intramuscular|subcutaneous/i.test(`${item.benefit} ${item.body}`)),
    false,
  );
  const tmsWords = wordCount(`${LANDING_TREATMENTS[0].benefit} ${LANDING_TREATMENTS[0].body}`);
  const ketWords = wordCount(`${LANDING_TREATMENTS[1].benefit} ${LANDING_TREATMENTS[1].body}`);
  assert.ok(tmsWords >= 40 && tmsWords <= 65, `TMS intro is ${tmsWords} words`);
  assert.ok(ketWords >= 40 && ketWords <= 65, `ketamine intro is ${ketWords} words`);
  assert.equal(LANDING_NEXT_STEPS.length, 4);
  assert.equal(
    LANDING_NEXT_STEPS[1].body,
    "An appropriate physician referral is required for an MSP-covered assessment. The clinic can explain referral requirements when you enquire.",
  );
  assert.equal(LANDING_INQUIRY_HEADING, "Let’s explore what may be right for you.");
  assert.equal(
    LANDING_INQUIRY_SUPPORTING_TEXT,
    "You do not need to choose a treatment before contacting us.",
  );
  assert.deepEqual([...LANDING_TRUST], [
    "Psychiatrist-led care",
    "Personalized treatment options",
    "MSP-covered assessment",
  ]);
  assert.match(LANDING_INQUIRY_NOTE, /personal health information/);
  assert.match(LANDING_INQUIRY_NOTE, /referral documents/);
  assert.match(landingPage, /LANDING_INQUIRY_NOTE/);
  assert.match(landingPage, /LANDING_TRUST/);
  assert.equal(contactForm.includes("For general inquiries only"), false);
  assert.equal(contactForm.includes("personal health information"), false);
  assert.match(contactForm, /notice\?: string/);
  assert.equal((landingPage.match(/<ContactForm/g) ?? []).length, 1);
});

test("landing section order is treatments, then why, then one inquiry form", () => {
  const hero = firstIndex(landingPage, 'id="landing-hero"');
  const treatment = firstIndex(landingPage, 'id="treatment"');
  const why = firstIndex(landingPage, 'id="landing-why-heading"');
  const inquiry = firstIndex(landingPage, 'id="inquiry"');
  const psychiatrist = firstIndex(landingPage, 'id="psychiatrist"');
  const next = firstIndex(landingPage, 'id="landing-next-heading"');
  const reviews = firstIndex(landingPage, 'id="landing-reviews-heading"');
  const faq = firstIndex(landingPage, 'id="faq"');
  assert.ok(hero < treatment && treatment < why && why < inquiry);
  assert.ok(inquiry < psychiatrist && psychiatrist < next && next < reviews && reviews < faq);
  assert.equal(landingPage.includes("Why NeuroLinks"), false);
  assert.equal(landingPage.includes("why-nl-list"), false);
  assert.equal(LANDING_WHY_HEADING, "Care that goes beyond delivering treatment.");
  assert.match(LANDING_WHY_TEXT, /review your progress/);
  assert.equal(LANDING_WHY_TEXT.includes("guaranteed"), false);
  assert.equal(LANDING_WHY_TEXT.includes("unlimited"), false);
  assert.match(landingPage, /LANDING_CLOSE_TEXT/);
  assert.equal(LANDING_REVIEWS_CTA_LABEL, "Talk to our team");
  assert.match(LANDING_CLOSE_TEXT, /when you are ready|what may be appropriate/);
});

test("landing uses click-to-play original YouTube explainers in the treatment cards", () => {
  const explainer = readFileSync(join(root, "../components/ExplainerVideo.tsx"), "utf8");
  assert.match(landingPage, /from "@\/components\/ExplainerVideo"/);
  assert.match(landingPage, /LANDING_YOUTUBE/);
  assert.equal(LANDING_YOUTUBE.tms, "hIMYP1bC3UE");
  assert.equal(LANDING_YOUTUBE.ketamine, "tbAN-E4iXzY");
  assert.equal(landingPage.includes("YouTubeEmbed"), false);
  assert.equal(landingPage.includes("tms-introduction.mp4"), false);
  assert.equal(landingPage.includes("ketamine-introduction.mp4"), false);
  assert.equal(landingPage.includes("Understanding these treatments"), false);
  assert.equal((landingPage.match(/<ExplainerVideo/g) ?? []).length, 1);
  assert.ok(landingPage.indexOf("tx-feature-benefit") < landingPage.indexOf("<ExplainerVideo"));
  assert.match(explainer, /youtube-nocookie.com/);
  assert.match(explainer, /nl:explainer-play/);
  assert.match(explainer, /active \? \(/);
  assert.match(explainer, /active \? \(\s*<p className="explainer-video-fallback"/);
  assert.match(globalsCss, /\.tms-video-play:focus-visible/);
  assert.equal(explainer.includes("gtag"), false);
  assert.equal(contactForm.includes("gtag"), false);
  assert.equal(contactForm.includes("dataLayer"), false);
});

test("landing psychiatrist copy is one block beside the portrait", () => {
  assert.match(landingPage, /className="landing-psychiatrist"/);
  assert.equal(landingPage.includes('className="about-au landing-psychiatrist"'), false);
  assert.match(landingPage, /landing-psychiatrist-copy/);
  assert.equal(landingPage.includes("landing-tx-points"), false);
  assert.match(landingPage, /TMS coil on the left and ketamine vial on the right/);
  assert.match(globalsCss, /\.landing-psychiatrist \{[\s\S]*?display:\s*grid/);
  assert.match(globalsCss, /\.landing-psychiatrist \{[\s\S]*?align-items:\s*start/);
  assert.match(globalsCss, /\.landing-hero-media \{[\s\S]*?aspect-ratio:\s*1960\s*\/\s*802/);
  assert.match(globalsCss, /\.landing-hero-copy-wrap \{[\s\S]*?min-height:\s*clamp\(28\.75rem,\s*56vh,\s*33\.75rem\)/);
  assert.equal(globalsCss.includes(".landing-hero-media {\n    max-height: none;\n    min-height: 22rem;"), false);
  assert.match(globalsCss, /#inquiry\.landing-inquiry-section \{[\s\S]*?scroll-margin-top:\s*var\(--nl-anchor-offset\)/);
  assert.match(globalsCss, /\.landing-inquiry \{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*0\.82fr\)\s*minmax\(0,\s*1\.18fr\)/);
  assert.match(globalsCss, /\.landing-inquiry-form \.ct-submit \{[\s\S]*?background:\s*var\(--nl-yellow\)/);
});

test("contact form controls stay visible below the sticky header when focused", () => {
  assert.match(
    globalsCss,
    /\.ct-field input,\s*\.ct-field textarea \{[\s\S]*?scroll-margin-top:\s*var\(--nl-anchor-offset\)/,
  );
  assert.match(globalsCss, /\.ct-submit \{[\s\S]*?scroll-margin-top:\s*var\(--nl-anchor-offset\)/);
  assert.match(
    globalsCss,
    /\.ct-form-success,\s*\.ct-form-error-banner \{[\s\S]*?scroll-margin-top:\s*var\(--nl-anchor-offset\)/,
  );
});

test("landing treatment cards keep approved copy and do not change the homepage", () => {
  assert.match(landingPage, /landing-tx-grid/);
  assert.match(landingPage, /landing-tx-actions/);
  assert.match(globalsCss, /\.landing-tx-grid \{[\s\S]*?align-items:\s*stretch/);
  assert.match(globalsCss, /\.landing-tx-actions \{[\s\S]*?margin-top:\s*auto/);
  assert.match(homePage, /Request assessment/);
  assert.match(homePage, /Why patients choose NeuroLinks/);
  assert.match(homePage, /Can be more effective than another conventional medication/);
  assert.equal(homePage.includes("showReferralNote"), false);
  assert.equal(landingPage.includes("<Reveal"), false);
  assert.equal(landingPage.includes("MotionReady"), false);
});
