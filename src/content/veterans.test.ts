import assert from "node:assert/strict";
import test from "node:test";
import { faqAnswerText } from "./faqs.ts";
import {
  VAC_MENTAL_HEALTH_BENEFITS_URL,
  VETERAN_CONDITIONS,
  VETERAN_CONDITIONS_INTRO,
  VETERAN_CONTACT,
  VETERAN_COVERAGE,
  VETERAN_COVERAGE_STATEMENT,
  VETERAN_EXPERIENCE,
  VETERAN_EXPERIENCE_POINTS,
  VETERAN_FAQS,
  VETERAN_IMPACT,
  VETERAN_PATHWAY,
  VETERAN_PATHWAY_CTA,
  VETERAN_PATHWAY_HEADING,
  VETERAN_PATHWAY_INTRO,
  VETERAN_TREATMENTS,
  VETERAN_TRUST,
} from "./veterans.ts";

test("trust strip states the four supplied Veteran facts", () => {
  assert.deepEqual([...VETERAN_TRUST], [
    "Psychiatrist-led care",
    "Experience treating Veterans",
    "TMS and ketamine options",
    "VAC authorization support",
  ]);
});

test("impact copy keeps the reassurance that symptoms are not a treatment failure", () => {
  assert.equal(
    VETERAN_IMPACT.heading,
    "The impact of service can continue long after service ends",
  );
  assert.match(VETERAN_IMPACT.opening, /Sleep, relationships, motivation and everyday functioning/);
  assert.match(
    VETERAN_IMPACT.emphasis,
    /Continuing to struggle does not mean that you have failed treatment/,
  );
  assert.match(VETERAN_IMPACT.closing, /what you most want to regain/);
});

test("condition panels stay contextual and do not carry outbound CTAs", () => {
  assert.equal(VETERAN_CONDITIONS.length, 3);
  assert.deepEqual(
    VETERAN_CONDITIONS.map((item) => item.title),
    ["Depression", "PTSD and trauma-related symptoms", "Anxiety"],
  );
  assert.equal(new Set(VETERAN_CONDITIONS.map((item) => item.tone)).size, 3);
  assert.match(VETERAN_CONDITIONS_INTRO, /rather than treating each symptom in isolation/);

  const ptsd = VETERAN_CONDITIONS[1].body;
  assert.match(ptsd, /Hypervigilance, disrupted sleep, irritability, avoidance/);
  assert.match(ptsd, /alongside depression, anxiety, pain and sleep/);

  const all = VETERAN_CONDITIONS.map((item) => item.body).join(" ");
  assert.equal(/cure|guarantee|guaranteed|proven to work for everyone/i.test(all), false);
  assert.equal("href" in VETERAN_CONDITIONS[0], false);
  assert.equal("linkLabel" in VETERAN_CONDITIONS[0], false);
});

test("treatment panels stay scannable and cautious", () => {
  assert.deepEqual(
    VETERAN_TREATMENTS.map((item) => item.key),
    ["tms", "ketamine"],
  );
  const [tms, ketamine] = VETERAN_TREATMENTS;

  assert.equal(tms.title, "Non-invasive treatment that works differently from medication");
  assert.match(tms.body, /sedation or anaesthesia is not required/);
  assert.equal(tms.points.length, 4);
  assert.deepEqual([...tms.points], [
    "Strongest established role in depression",
    "Non-invasive, without sedation",
    "Delivered through repeated clinic visits",
    "Protocol selected following assessment",
  ]);
  assert.equal(tms.href, "/about-tms-treatment-on-psychiatric-illness/");
  assert.equal(tms.linkLabel, "Learn more about TMS");

  assert.equal(ketamine.eyebrow, "IM ketamine");
  assert.equal(ketamine.title, "Rapid-acting treatment when depression has not lifted");
  assert.match(ketamine.body, /improvement can begin within hours or days/);
  assert.equal(ketamine.points.length, 4);
  assert.deepEqual([...ketamine.points], [
    "Can act more quickly than conventional antidepressants",
    "Works through a different brain pathway",
    "May help when several treatments have not worked",
    "Individualized treatment with psychiatrist-led monitoring",
  ]);
  assert.equal(ketamine.href, "/ketamine-treatment-resistant-depression-nanaimo/");
  assert.equal(ketamine.linkLabel, "Learn more about ketamine");
});

test("Veteran pathway is four shortened steps with shared-component icons", () => {
  assert.equal(VETERAN_PATHWAY.length, 4);
  assert.equal(VETERAN_PATHWAY_HEADING, "From first contact to treatment");
  assert.match(VETERAN_PATHWAY_INTRO, /You should not have to navigate every clinical and administrative step alone/);
  assert.deepEqual(
    VETERAN_PATHWAY.map((step) => step.title),
    [
      "Start with a conversation",
      "Understand the full picture",
      "Request preauthorization",
      "Begin treatment and monitor progress",
    ],
  );
  assert.deepEqual(
    VETERAN_PATHWAY.map((step) => step.icon),
    ["talk", "assess", "authorize", "follow"],
  );
  assert.match(VETERAN_PATHWAY[0].body, /You do not need to choose a treatment before contacting us/);
  assert.match(VETERAN_PATHWAY[2].body, /Medavie Blue Cross/);
  assert.match(VETERAN_PATHWAY[2].body, /must be taking an antidepressant/);
  assert.deepEqual(
    { ...VETERAN_PATHWAY_CTA },
    { href: "#veterans-contact", label: "Talk with our team" },
  );
});

test("experience points stay at four and avoid partner claims", () => {
  assert.equal(VETERAN_EXPERIENCE_POINTS.length, 4);
  assert.equal(VETERAN_EXPERIENCE.quote, "We approach each Veteran as an individual—not as a diagnosis or a funding file.");
  assert.match(VETERAN_EXPERIENCE_POINTS[1], /Experience providing VAC-authorized treatment/);
  assert.match(VETERAN_EXPERIENCE_POINTS[3], /with consent$/);
  const all = VETERAN_EXPERIENCE_POINTS.join(" ");
  assert.equal(/VAC partner|official partner/i.test(all), false);
  assert.equal(/\d+\s*(\+)?\s*(veterans|patients)/i.test(all), false);
});

test("coverage copy never promises approval and keeps the official VAC page", () => {
  assert.equal(VETERAN_COVERAGE.heading, "Clear information before treatment begins");
  const body = VETERAN_COVERAGE.body.join(" ");
  assert.match(body, /Coverage is not automatic/);
  assert.match(body, /IM ketamine treatment offered by NeuroLinks is not included/);
  assert.match(body, /must be taking an antidepressant/);
  assert.match(body, /only after authorization has been confirmed/);
  assert.equal(VETERAN_COVERAGE.coordinationHeading, "Already working with a clinician or case manager?");
  assert.match(VETERAN_COVERAGE.coordination, /With the Veteran/);
  assert.equal(
    VAC_MENTAL_HEALTH_BENEFITS_URL,
    "https://www.veterans.gc.ca/en/mental-and-physical-health/mental-health-and-wellness/medical-costs/mental-health-benefits",
  );
});

test("the shared coverage statement replaces the blanket Medavie wording", () => {
  assert.match(
    VETERAN_COVERAGE_STATEMENT,
    /^Veterans Affairs Canada may authorize TMS or Spravato® treatment in eligible cases\./,
  );
  assert.match(VETERAN_COVERAGE_STATEMENT, /IM ketamine/);
  assert.match(VETERAN_COVERAGE_STATEMENT, /not included in the current VAC benefit schedule/);
  assert.match(VETERAN_COVERAGE_STATEMENT, /Coverage is not automatic/);
  assert.equal(VETERAN_COVERAGE_STATEMENT.includes("is covered by the Medavie Blue Cross"), false);
});

test("Veterans FAQ is the six conversion questions in order", () => {
  assert.deepEqual(
    VETERAN_FAQS.map((item) => item.q),
    [
      "What is usually required for Spravato coverage?",
      "Will NeuroLinks help obtain preauthorization?",
      "Do I need a physician referral?",
      "Why might NeuroLinks recommend TMS first?",
      "How frequently will I need to travel to Nanaimo?",
      "Can my VAC case manager, therapist or physician contact NeuroLinks?",
    ],
  );
});

test("Veterans FAQ answers stay JSON-LD safe, concise and promise nothing", () => {
  for (const item of VETERAN_FAQS) {
    const text = faqAnswerText(item.a);
    const words = text.split(/\s+/).filter(Boolean).length;
    assert.ok(words >= 45 && words <= 95, `${item.q} has ${words} words`);
    assert.equal(text.includes("[object Object]"), false);
    assert.equal(
      /\bwill be (covered|approved|authorized)\b|\bguarantee\b|\bguaranteed\b/i.test(text),
      false,
      `unsupported promise in: ${item.q}`,
    );
  }
  assert.equal(
    VETERAN_FAQS.some((item) => /more effective than IM ketamine/i.test(item.q)),
    false,
  );
});

test("individual-situation answers say so instead of committing", () => {
  const byQuestion = new Map(VETERAN_FAQS.map((item) => [item.q, faqAnswerText(item.a)]));
  assert.match(
    byQuestion.get("What is usually required for Spravato coverage?")!,
    /must be taking an antidepressant/,
  );
  assert.match(
    byQuestion.get("What is usually required for Spravato coverage?")!,
    /antipsychotic augmentation/,
  );
  assert.match(
    byQuestion.get("Why might NeuroLinks recommend TMS first?")!,
    /sedation or dissociation/,
  );
  assert.match(
    byQuestion.get("Why might NeuroLinks recommend TMS first?")!,
    /decision remains with VAC and Medavie Blue Cross/,
  );
  assert.match(
    byQuestion.get("Will NeuroLinks help obtain preauthorization?")!,
    /decision rests with VAC and Medavie Blue Cross rather than the clinic/,
  );
  assert.match(
    byQuestion.get("Can my VAC case manager, therapist or physician contact NeuroLinks?")!,
    /With your consent/,
  );
});

test("final contact copy stays on-page and does not demand a treatment choice", () => {
  assert.equal(VETERAN_CONTACT.heading, "You do not have to determine the next step alone");
  assert.match(VETERAN_CONTACT.body, /You do not need to decide whether TMS or ketamine is right for you/);
  assert.match(VETERAN_CONTACT.reassurance, /You do not need to describe your trauma or medical history here/);
  assert.equal(VETERAN_CONTACT.submitLabel, "Ask our team to contact me");
});
