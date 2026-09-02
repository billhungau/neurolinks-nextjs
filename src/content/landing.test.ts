import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { LANDING_FAQS } from "./faqs.ts";
import {
  LANDING_HEADLINE,
  LANDING_INQUIRY_HEADING,
  LANDING_INQUIRY_SUPPORTING_TEXT,
  LANDING_NEXT_STEPS,
  LANDING_OUTCOME_NOTE,
  LANDING_REVIEWS,
  LANDING_SUPPORTING_TEXT,
  LANDING_TREATMENTS,
  LANDING_WHY,
} from "./landing.ts";

const root = dirname(fileURLToPath(import.meta.url));
const landingPage = readFileSync(
  join(root, "../app/neurolinks-psychiatry-nanaimo-bc/page.tsx"),
  "utf8",
);
const contactPage = readFileSync(join(root, "../app/contact/page.tsx"), "utf8");
const landingHeader = readFileSync(join(root, "../components/LandingHeader.tsx"), "utf8");
const contactForm = readFileSync(join(root, "../components/forms/ContactForm.tsx"), "utf8");
const globalsCss = readFileSync(join(root, "../app/globals.css"), "utf8");

test("landing and contact pages share the same ContactForm module", () => {
  assert.match(landingPage, /from "@\/components\/forms\/ContactForm"/);
  assert.match(contactPage, /from "@\/components\/forms\/ContactForm"/);
  assert.equal(landingPage.includes("jotform.com"), false);
  assert.equal(landingPage.includes("not connected"), false);
});

test("landing inquiry CTAs target #inquiry and keep compact navigation", () => {
  assert.match(landingPage, /#inquiry/);
  assert.match(landingHeader, /#inquiry/);
  assert.match(landingHeader, /Ask about treatment options/);
  assert.match(landingHeader, /About Us/);
  assert.equal(landingHeader.includes("PRIMARY_NAV"), false);
  assert.equal(landingHeader.includes("Open menu"), false);
});

test("landing keeps the approved headline, excerpt and three verbatim reviews", () => {
  assert.equal(
    LANDING_HEADLINE,
    "When Medications Fall Short, Thoughtful Psychiatric Care Can Offer New Options.",
  );
  assert.match(LANDING_SUPPORTING_TEXT, /Nanaimo/);
  assert.match(LANDING_SUPPORTING_TEXT, /Vancouver Island/);
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
  assert.equal(LANDING_TREATMENTS[0].body, "TMS Therapy — Non-invasive brain stimulation");
  assert.equal(LANDING_TREATMENTS[1].body, "Rapid-acting, medically supervised");
  assert.equal(LANDING_TREATMENTS[0].points.length, 3);
  assert.equal(LANDING_TREATMENTS[1].points.length, 3);
  assert.match(LANDING_TREATMENTS[0].points[0], /non-invasive/);
  assert.match(LANDING_TREATMENTS[1].points[0], /Before every session/);
  assert.match(LANDING_TREATMENTS[1].points[1], /vital signs/);
  assert.match(LANDING_TREATMENTS[1].points[2], /After the session/);
  assert.equal(
    LANDING_TREATMENTS.some((item) =>
      item.points.some((point) => /intramuscular|subcutaneous/i.test(point)),
    ),
    false,
  );
  assert.equal(LANDING_NEXT_STEPS.length, 4);
  assert.equal(
    LANDING_NEXT_STEPS[1].body,
    "An appropriate physician referral is required for an MSP-covered assessment. The clinic can explain referral requirements when you enquire.",
  );
  assert.equal(LANDING_INQUIRY_HEADING, "Ask about treatment options");
  assert.match(LANDING_INQUIRY_SUPPORTING_TEXT, /not a commitment to treatment/);
});

test("landing does not load YouTube or a disconnected-form placeholder", () => {
  assert.match(landingPage, /as="li"/);
  assert.equal(landingPage.includes("YouTubeEmbed"), false);
  assert.equal(landingPage.includes("LANDING_YOUTUBE"), false);
  assert.equal(contactForm.includes("gtag"), false);
  assert.equal(contactForm.includes("dataLayer"), false);
});

test("landing why items stay distinct and grounded in approved copy", () => {
  assert.equal(LANDING_WHY.length, 3);
  assert.match(LANDING_WHY[0].title, /Psychiatrist-led expertise/i);
  assert.match(LANDING_WHY[0].body, /A psychiatrist reviews your diagnosis/);
  assert.match(LANDING_WHY[1].title, /Individualized options/i);
  assert.match(LANDING_WHY[1].body, /options beyond medication alone/);
  assert.match(LANDING_WHY[2].title, /Monitoring and support/i);
  assert.match(LANDING_WHY[2].body, /symptoms can fluctuate/);
  assert.equal(LANDING_WHY[2].body.includes("guaranteed"), false);
});

test("landing psychiatrist copy is one block beside the portrait", () => {
  assert.match(landingPage, /className="landing-psychiatrist"/);
  assert.equal(landingPage.includes('className="about-au landing-psychiatrist"'), false);
  assert.match(landingPage, /landing-psychiatrist-copy/);
  assert.match(landingPage, /landing-tx-points/);
  assert.match(landingPage, /TMS coil on the left and ketamine vial on the right/);
  assert.match(globalsCss, /\.landing-psychiatrist \{[\s\S]*?display:\s*grid/);
  assert.match(globalsCss, /\.landing-psychiatrist \{[\s\S]*?align-items:\s*start/);
  assert.match(globalsCss, /\.landing-hero-media \{[\s\S]*?aspect-ratio:\s*2\s*\/\s*1/);
  assert.equal(globalsCss.includes(".landing-hero-media {\n    max-height: none;\n    min-height: 22rem;"), false);
  assert.match(globalsCss, /#inquiry\.home-section \{[\s\S]*?scroll-margin-top:\s*var\(--nl-anchor-offset\)/);
});

test("landing treatment cards stretch on desktop and keep distinct ketamine points", () => {
  assert.match(landingPage, /landing-tx-grid/);
  assert.match(landingPage, /className="h-full"/);
  assert.match(globalsCss, /\.landing-tx-grid \{[\s\S]*?align-items:\s*stretch/);
  assert.match(globalsCss, /\.landing-tx \.tx-feature-copy \.text-link \{[\s\S]*?margin-top:\s*auto/);
  assert.match(LANDING_TREATMENTS[1].points[0], /explains what to expect/);
  assert.match(LANDING_TREATMENTS[1].points[1], /experience unfolds/);
  assert.match(LANDING_TREATMENTS[1].points[2], /reflect on the experience/);
  assert.equal(
    LANDING_TREATMENTS[1].points.filter((point) => /post-session reflection/i.test(point)).length,
    0,
  );
});
