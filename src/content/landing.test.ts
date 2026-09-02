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
} from "./landing.ts";

const root = dirname(fileURLToPath(import.meta.url));
const landingPage = readFileSync(
  join(root, "../app/neurolinks-psychiatry-nanaimo-bc/page.tsx"),
  "utf8",
);
const contactPage = readFileSync(join(root, "../app/contact/page.tsx"), "utf8");
const landingHeader = readFileSync(join(root, "../components/LandingHeader.tsx"), "utf8");
const contactForm = readFileSync(join(root, "../components/forms/ContactForm.tsx"), "utf8");

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
