import assert from "node:assert/strict";
import test from "node:test";
import { faqAnswerText } from "./faqs.ts";
import {
  VAC_MENTAL_HEALTH_BENEFITS_URL,
  VETERAN_CONDITIONS,
  VETERAN_COVERAGE,
  VETERAN_COVERAGE_STATEMENT,
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
  assert.match(VETERAN_IMPACT.opening, /Medications may cause side effects without providing enough relief/);
  assert.match(
    VETERAN_IMPACT.emphasis,
    /Continuing to struggle does not mean that you have failed treatment/,
  );
  assert.match(VETERAN_IMPACT.closing, /Only then do we consider whether a treatment such as TMS or ketamine may be appropriate/);
});

test("condition panels stay hedged and link to the relevant pages", () => {
  assert.equal(VETERAN_CONDITIONS.length, 3);
  assert.deepEqual(
    VETERAN_CONDITIONS.map((item) => item.title),
    ["Depression", "PTSD and trauma-related symptoms", "Anxiety"],
  );
  assert.deepEqual(
    VETERAN_CONDITIONS.map((item) => item.href),
    [
      "/ketamine-treatment-resistant-depression-nanaimo/",
      "/about-tms-treatment-on-psychiatric-illness/",
      "/contact/",
    ],
  );
  assert.deepEqual(
    VETERAN_CONDITIONS.map((item) => item.linkLabel),
    [
      "Learn about treatment-resistant depression",
      "Understand how treatment may fit",
      "Ask about an individual assessment",
    ],
  );
  // Distinct accents, drawn from the existing pathway palette.
  assert.equal(new Set(VETERAN_CONDITIONS.map((item) => item.tone)).size, 3);

  const ptsd = VETERAN_CONDITIONS[1].body.join(" ");
  assert.match(ptsd, /may be considered in selected cases/);
  assert.match(ptsd, /Evidence, regulatory status and appropriate protocols differ from those for depression/);
  assert.match(ptsd, /do not necessarily replace—trauma-focused psychotherapy/);

  const anxiety = VETERAN_CONDITIONS[2].body.join(" ");
  assert.match(anxiety, /depends on the underlying diagnosis, symptom pattern and previous treatment response/);

  const all = VETERAN_CONDITIONS.flatMap((item) => item.body).join(" ");
  assert.equal(/cure|guarantee|guaranteed|proven to work for everyone/i.test(all), false);
});

test("treatment panels carry the supplied titles, copy and key points", () => {
  assert.deepEqual(
    VETERAN_TREATMENTS.map((item) => item.key),
    ["tms", "ketamine"],
  );
  const [tms, ketamine] = VETERAN_TREATMENTS;

  assert.equal(tms.title, "Non-invasive treatment that works differently from medication");
  assert.match(tms.body[0], /does not require sedation or anaesthesia/);
  assert.match(tms.body[1], /Its strongest established role is in treating depression/);
  assert.deepEqual([...tms.points], [
    "Non-invasive treatment",
    "No sedation or anaesthesia",
    "Established evidence for depression",
    "Generally delivered repeatedly over several weeks",
    "Individualized protocol and brain mapping",
    "Progress and tolerability monitored throughout treatment",
  ]);
  assert.equal(tms.href, "/about-tms-treatment-on-psychiatric-illness/");
  assert.equal(tms.buttonLabel, "Learn more about TMS");

  assert.equal(
    ketamine.title,
    "A different treatment pathway, with the potential for earlier change",
  );
  assert.match(ketamine.body[0], /several treatments may be required and not everyone responds/);
  assert.match(ketamine.body[1], /controlled clinical setting with medical supervision/);
  assert.deepEqual([...ketamine.points], [
    "Primarily considered for treatment-resistant depression",
    "Potential for a more rapid response",
    "Medical screening before treatment",
    "Supervised administration and monitoring",
    "Response and side effects reviewed throughout the course",
    "Maintenance considered individually",
  ]);
  assert.equal(ketamine.href, "/ketamine-treatment-resistant-depression-nanaimo/");
  assert.equal(ketamine.buttonLabel, "Learn more about ketamine");
});

test("Veteran pathway is four steps with icons the shared component understands", () => {
  assert.equal(VETERAN_PATHWAY.length, 4);
  assert.equal(VETERAN_PATHWAY_HEADING, "A clear path from first contact to treatment");
  assert.match(
    VETERAN_PATHWAY_INTRO,
    /Seeking care should not require you to navigate every clinical and administrative step alone/,
  );
  assert.deepEqual(
    VETERAN_PATHWAY.map((step) => step.index),
    ["01", "02", "03", "04"],
  );
  assert.deepEqual(
    VETERAN_PATHWAY.map((step) => step.title),
    [
      "Start with a conversation",
      "Understand the full picture",
      "Obtain preauthorization",
      "Begin treatment and monitor progress",
    ],
  );
  assert.deepEqual(
    VETERAN_PATHWAY.map((step) => step.icon),
    ["talk", "assess", "authorize", "follow"],
  );
  assert.match(VETERAN_PATHWAY[0].body, /You do not need to decide whether TMS or ketamine is right for you before contacting us/);
  assert.match(VETERAN_PATHWAY[2].body, /Coverage must be confirmed through Veterans Affairs Canada and Medavie Blue Cross before treatment begins/);
  assert.match(VETERAN_PATHWAY[3].body, /Once written authorization and scheduling are confirmed/);
  assert.deepEqual({ ...VETERAN_PATHWAY_CTA }, { href: "/contact/", label: "Talk to our team" });
});

test("experience points avoid partner claims and invented Veteran counts", () => {
  assert.equal(VETERAN_EXPERIENCE_POINTS.length, 7);
  assert.match(VETERAN_EXPERIENCE_POINTS[1], /Experience providing VAC-authorized treatment/);
  assert.match(VETERAN_EXPERIENCE_POINTS[5], /with consent$/);
  const all = VETERAN_EXPERIENCE_POINTS.join(" ");
  assert.equal(/VAC partner|official partner/i.test(all), false);
  assert.equal(/\d+\s*(\+)?\s*(veterans|patients)/i.test(all), false);
});

test("coverage copy never promises approval and points at the official VAC page", () => {
  assert.equal(VETERAN_COVERAGE.heading, "Clear information before treatment begins");
  const body = VETERAN_COVERAGE.body.join(" ");
  assert.match(body, /No Veteran should begin treatment uncertain about whether it has been authorized/);
  assert.match(body, /Coverage is not automatic/);
  assert.match(body, /only after written authorization has been confirmed through VAC and Medavie Blue Cross/);
  assert.match(VETERAN_COVERAGE.note, /With your consent, they can contact NeuroLinks directly/);
  assert.equal(
    VAC_MENTAL_HEALTH_BENEFITS_URL,
    "https://www.veterans.gc.ca/en/mental-and-physical-health/mental-health-and-wellness/medical-costs/mental-health-benefits",
  );
});

test("the shared coverage statement replaces the blanket Medavie wording", () => {
  assert.match(
    VETERAN_COVERAGE_STATEMENT,
    /^Veterans Affairs Canada may authorize TMS or ketamine treatment in eligible cases\./,
  );
  assert.match(VETERAN_COVERAGE_STATEMENT, /Coverage is not automatic/);
  assert.match(
    VETERAN_COVERAGE_STATEMENT,
    /treatment begins only after written authorization has been confirmed through VAC and Medavie Blue Cross/,
  );
  assert.equal(VETERAN_COVERAGE_STATEMENT.includes("is covered by the Medavie Blue Cross"), false);
});

test("Veterans FAQ is the twelve supplied questions in order", () => {
  assert.deepEqual(
    VETERAN_FAQS.map((item) => item.q),
    [
      "Does VAC cover TMS or ketamine treatment?",
      "Will NeuroLinks help obtain preauthorization?",
      "Do I need a physician referral?",
      "Is the psychiatric assessment covered by MSP?",
      "Can my VAC case manager contact NeuroLinks?",
      "Can NeuroLinks communicate with my therapist or physician?",
      "How long does authorization usually take?",
      "How frequently will I need to travel to Nanaimo?",
      "Can TMS or ketamine be combined with psychotherapy?",
      "What happens if treatment does not help enough?",
      "Is maintenance treatment available?",
      "Does NeuroLinks treat serving CAF or RCMP members?",
    ],
  );
});

test("Veterans FAQ answers are JSON-LD safe and promise nothing", () => {
  for (const item of VETERAN_FAQS) {
    const text = faqAnswerText(item.a);
    assert.equal(typeof text, "string");
    assert.ok(text.length > 40, `answer too short: ${item.q}`);
    assert.equal(text.includes("[object Object]"), false);
    assert.equal(JSON.stringify({ text }).includes("[object Object]"), false);
    assert.equal(
      /\bwill be (covered|approved|authorized)\b|\bguarantee\b|\bguaranteed\b/i.test(text),
      false,
      `unsupported promise in: ${item.q}`,
    );
  }
});

test("individual-situation answers say so instead of committing", () => {
  const byQuestion = new Map(VETERAN_FAQS.map((item) => [item.q, faqAnswerText(item.a)]));
  assert.match(byQuestion.get("Does VAC cover TMS or ketamine treatment?")!, /Coverage is not automatic/);
  assert.match(
    byQuestion.get("How long does authorization usually take?")!,
    /so we cannot promise a date/,
  );
  assert.match(
    byQuestion.get("Will NeuroLinks help obtain preauthorization?")!,
    /decision rests with VAC and Medavie Blue Cross rather than the clinic/,
  );
  assert.match(
    byQuestion.get("What happens if treatment does not help enough?")!,
    /Not everyone responds/,
  );
  assert.match(
    byQuestion.get("Does NeuroLinks treat serving CAF or RCMP members?")!,
    /depends on your situation/,
  );
  assert.match(
    byQuestion.get("Can NeuroLinks communicate with my therapist or physician?")!,
    /written consent/,
  );
});
