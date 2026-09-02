import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  KETAMINE_FAQS,
  TMS_FAQS,
  collectFaqEvidenceLinks,
  faqAnswerText,
  faqEvidenceLinks,
  isStructuredFaqAnswer,
} from "./faqs.ts";

const TMS_EXPECTED = [
  {
    q: "How likely will depression improve with TMS?",
    value: "non treatment resistant depression",
    href: "https://bmcpsychiatry.biomedcentral.com/articles/10.1186/s12888-018-1989-z",
  },
  {
    q: "How likely will depression improve with TMS?",
    value: "treatment-resistant depression",
    href: "https://www.psychiatrist.com/jcp/depression/repetitive-transcranial-magnetic-stimulation-treatment-2/",
  },
  {
    q: "Are there any side effects from TMS?",
    value: "<0.1%",
    href: "https://www.sciencedirect.com/science/article/pii/S1935861X21001182",
  },
  {
    q: "Are there any side effects from TMS?",
    value: "lifetime prevalence",
    href: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5272794/",
  },
  {
    q: "Is the effect of TMS durable?",
    value: "Read more about the study",
    href: "https://pubmed.ncbi.nlm.nih.gov/30344109/",
  },
  {
    q: "I have been taking medications. Why do I need TMS?",
    value: "up to 30%",
    href: "https://www.psychiatrist.com/jcp/depression/prevalence-national-burden-treatment-resistant-depression-major-depressive-disorder-in-us/",
  },
  {
    q: "I have been taking medications. Why do I need TMS?",
    value: "up to 60%",
    href: "https://www.sciencedirect.com/science/article/abs/pii/S0278584605003520?via%3Dihub",
  },
  {
    q: "I have been taking medications. Why do I need TMS?",
    value: "depression",
    href: "https://www.sciencedirect.com/science/article/abs/pii/S0165032720328573",
  },
  {
    q: "I have been taking medications. Why do I need TMS?",
    value: "obsessive-compulsive disorder",
    href: "https://www.nature.com/articles/s41398-021-01453-0",
  },
  {
    q: "I am pregnant. Can I receive TMS?",
    value: "mothers",
    href: "https://link.springer.com/article/10.1007/s00737-013-0397-0",
  },
  {
    q: "I am pregnant. Can I receive TMS?",
    value: "fetus",
    href: "https://journals.sagepub.com/doi/abs/10.1177/1039856221992636#abstract",
  },
  {
    q: "I am pregnant. Can I receive TMS?",
    value: "long-term study",
    href: "https://pubmed.ncbi.nlm.nih.gov/33653123/",
  },
  {
    q: "What factors affect the treatment outcome?",
    value:
      "Predictors of Response to Repetitive Transcranial Magnetic Stimulation in Depression: A Review of Recent Updates",
    href: "https://pubmed.ncbi.nlm.nih.gov/30690937/",
  },
  {
    q: "How good is the treatment effect in obsessive-compulsive disorder (OCD)?",
    value: "near half of patients",
    href: "https://pubmed.ncbi.nlm.nih.gov/31109199/",
  },
  {
    q: "How good is the treatment effect in obsessive-compulsive disorder (OCD)?",
    value: "improves depressive symptoms",
    href: "https://www.sciencedirect.com/science/article/pii/S0165032722000544",
  },
  {
    q: "Is a shorter but more intensive course of TMS available?",
    value: "controlled study",
    href: "https://ajp.psychiatryonline.org/doi/10.1176/appi.ajp.2021.20101429",
  },
] as const;

const KETAMINE_EXPECTED = [
  {
    q: "How effective is ketamine treatment?",
    value: "treatment-resistant depression",
    href: "https://ajp.psychiatryonline.org/doi/full/10.1176/appi.ajp.2016.16010037",
  },
  {
    q: "How effective is ketamine treatment?",
    value: "chronic PTSD",
    href: "https://ajp.psychiatryonline.org/doi/full/10.1176/appi.ajp.2020.20050596",
  },
  {
    q: "How effective is ketamine treatment?",
    value: "multiple treatments are essential",
    href: "https://www.sciencedirect.com/science/article/abs/pii/S0165032720327026",
  },
  {
    q: "How soon can I expect to see results with ketamine treatment?",
    value: "4-week treatment program",
    href: "https://ajp.psychiatryonline.org/doi/full/10.1176/appi.ajp.2016.16010037",
  },
  {
    q: "How is ketamine administered?",
    value: "intramuscular",
    href: "https://link.springer.com/article/10.1186/s12888-022-04268-5",
  },
  {
    q: "How is ketamine administered?",
    value: "subcutaneous injections",
    href: "https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2021.513068/full",
  },
  {
    q: "Is ketamine treatment safe?",
    value: "most studies",
    href: "https://www.sciencedirect.com/science/article/pii/S0022395621001369",
  },
  {
    q: "Is ketamine treatment safe?",
    value: "side effects",
    href: "https://www.clinicalkey.com/#!/content/playContent/1-s2.0-S2215036617302729",
  },
  {
    q: "What factors affect the treatment outcome?",
    value: "Positive predictors",
    href: "https://www.liebertpub.com/doi/abs/10.1089/cap.2023.0047",
  },
  {
    q: "What factors affect the treatment outcome?",
    value: "Negative outcome predictors",
    href: "https://onlinelibrary.wiley.com/doi/abs/10.1002/hup.2836",
  },
  {
    q: "Is ketamine treatment FDA-approved?",
    value: "esketamine might not work as well as the full mixture of ketamine",
    href: "https://www.sciencedirect.com/science/article/pii/S016503272032766X",
  },
  {
    q: "How should I choose among ketamine and TMS treatments?",
    value: "short-term side effects",
    href: "https://www.thelancet.com/journals/lanpsy/article/PIIS2215-0366(22)00317-0/abstract",
  },
] as const;

test("TMS FAQ retains 10 questions and 16 evidence links", () => {
  assert.equal(TMS_FAQS.length, 10);
  const links = collectFaqEvidenceLinks(TMS_FAQS);
  assert.equal(links.length, 16);
  assert.deepEqual(
    links.map((link) => ({ value: link.value, href: link.href })),
    TMS_EXPECTED.map(({ value, href }) => ({ value, href })),
  );
});

test("TMS FAQ questions remain the published set", () => {
  assert.deepEqual(
    TMS_FAQS.map((item) => item.q),
    [
      "How likely will depression improve with TMS?",
      "Are there any side effects from TMS?",
      "Is the effect of TMS durable?",
      "I have been taking medications. Why do I need TMS?",
      "Who cannot receive TMS?",
      "What is the difference between TMS and electroconvulsive therapy (ECT)?",
      "I am pregnant. Can I receive TMS?",
      "What factors affect the treatment outcome?",
      "How good is the treatment effect in obsessive-compulsive disorder (OCD)?",
      "Is a shorter but more intensive course of TMS available?",
    ],
  );
});

test("ketamine FAQ retains 10 questions and 12 evidence links", () => {
  assert.equal(KETAMINE_FAQS.length, 10);
  const links = collectFaqEvidenceLinks(KETAMINE_FAQS);
  assert.equal(links.length, 12);
  assert.deepEqual(
    links.map((link) => ({ value: link.value, href: link.href })),
    KETAMINE_EXPECTED.map(({ value, href }) => ({ value, href })),
  );
});

test("ketamine FAQ questions remain the published set", () => {
  assert.deepEqual(
    KETAMINE_FAQS.map((item) => item.q),
    [
      "How effective is ketamine treatment?",
      "How soon can I expect to see results with ketamine treatment?",
      "How is ketamine administered?",
      "Is ketamine treatment safe?",
      "Is maintenance treatment necessary?",
      "What factors affect the treatment outcome?",
      "Who cannot receive ketamine treatment?",
      "What is a ketamine bad trip?",
      "Is ketamine treatment FDA-approved?",
      "How should I choose among ketamine and TMS treatments?",
    ],
  );
});

test("each expected phrase appears in the matching FAQ answer", () => {
  for (const expected of [...TMS_EXPECTED, ...KETAMINE_EXPECTED]) {
    const faqs = TMS_EXPECTED.some((item) => item === expected) ? TMS_FAQS : KETAMINE_FAQS;
    const item = faqs.find((faq) => faq.q === expected.q);
    assert.ok(item, `missing question: ${expected.q}`);
    const text = faqAnswerText(item.a);
    assert.ok(text.includes(expected.value), `missing phrase "${expected.value}" in ${expected.q}`);
    const match = faqEvidenceLinks(item.a).find(
      (link) => link.value === expected.value && link.href === expected.href,
    );
    assert.ok(match, `missing mapping ${expected.value} -> ${expected.href}`);
  }
});

const TMS_SOURCE_PHRASES = [
  "most patients show significant improvement and two thirds of them can see absence of depressive symptoms",
  "about one in three patients show significant improvement",
  "remission rate of treatment-resistant depression with TMS 30%, without TMS 6%",
  "Most side effects are mild and self-limiting",
  "headache and discomfort at the site of stimulation",
  "this is NOT higher than the lifetime prevalence of seizure in the general population",
  "half of patients see sustained responses up to 1 year",
  "continue their oral antidepressants to maximize the durability of the treatment effect of TMS",
  "do not adequately respond to at least 2 antidepressants",
  "impaired social functioning, both occupational and interpersonal",
  "any patients with non-removable metal in their head (except braces or dental fillings)",
  "facial tattoos with metallic or magnetic-sensitive ink",
  "a recent (<30 days) hemorrhagic stroke or head injury",
  "While both are effective for the treatment of several mental illness, they work differently",
  "In contrast to ECT, TMS is non-invasive and it does not need anesthesia",
  "can return to work straight after",
  "rarely induces seizure (<1/10000)",
  "30 sessions",
  "not covered by MSP (enquire private insurance)",
  "requires a seizure every time",
  "babies have more difficulties developing a secure attachment",
  "followed for more than 20 years",
  "shorter duration of depression",
  "short duration of TMS therapy (<15 sessions)",
  "About 40-60% of patients with OCD are resistant to at least one medication",
  "The treatment course of TMS can be given several times a day over 5 days",
  "conducted by Stanford University",
] as const;

test("structured TMS answers keep the published wording for JSON-LD", () => {
  for (const phrase of TMS_SOURCE_PHRASES) {
    const found = TMS_FAQS.some((item) => faqAnswerText(item.a).includes(phrase));
    assert.ok(found, `missing published phrase: ${phrase}`);
  }
});

test("FAQ plain text is available for JSON-LD and never stringifies as objects", () => {
  for (const item of [...TMS_FAQS, ...KETAMINE_FAQS]) {
    const text = faqAnswerText(item.a);
    assert.equal(typeof text, "string");
    assert.ok(text.length > 0);
    assert.equal(text.includes("[object Object]"), false);
    assert.equal(JSON.stringify({ text }).includes("[object Object]"), false);
  }
  const seizure = faqAnswerText(
    TMS_FAQS.find((item) => item.q === "Are there any side effects from TMS?")!.a,
  );
  assert.ok(seizure.includes("<0.1%"));
  assert.equal(seizure.includes("&lt;0.1%"), false);
  const ect = faqAnswerText(
    TMS_FAQS.find((item) => item.q.includes("electroconvulsive therapy"))!.a,
  );
  assert.ok(ect.includes("30 sessions"));
  assert.equal(ect.includes("usually 20-30 sessions"), false);
});

test("ECT comparison states that ECT needs anesthesia", () => {
  const item = TMS_FAQS.find((faq) => faq.q.includes("electroconvulsive therapy"));
  assert.ok(item);
  assert.ok(isStructuredFaqAnswer(item.a));
  const compare = item.a.find((block) => block.type === "compare");
  assert.equal(compare?.type, "compare");
  const row = compare && compare.type === "compare"
    ? compare.rows.find((entry) => entry.feature === "Anesthesia")
    : undefined;
  assert.equal(row?.tms, "non-invasive; does not need anesthesia");
  assert.equal(row?.ect, "needs anesthesia");
});

test("evidence-link markup uses a safe new-tab rel", () => {
  const source = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../components/FaqAnswer.tsx"),
    "utf8",
  );
  assert.match(source, /target="_blank"/);
  assert.match(source, /rel="noopener noreferrer"/);
  assert.equal(source.includes("nofollow"), false);
  assert.equal(source.includes("dangerouslySetInnerHTML"), false);
});

test("TMS FAQ lists restore disc markers against the global list reset", () => {
  const css = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../app/globals.css"),
    "utf8",
  );
  const listRule = css.match(/\.tms-faq-list \{[\s\S]*?\}/);
  assert.ok(listRule, "missing .tms-faq-list rule");
  assert.match(listRule[0], /list-style:\s*disc/);
});
