import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = dirname(fileURLToPath(import.meta.url));
const homePage = readFileSync(join(root, "page.tsx"), "utf8");
const globalsCss = readFileSync(join(root, "globals.css"), "utf8");
const landingPage = readFileSync(join(root, "neurolinks-psychiatry-nanaimo-bc/page.tsx"), "utf8");

function visibleText(source: string) {
  return source
    .replace(/\{["']\s["']\}/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const treatmentStart = homePage.indexOf('id="treatment-options"');
const whyStart = homePage.indexOf('id="why-nl-heading"');
const fundingStart = homePage.indexOf('id="funding-heading"');
const teamStart = homePage.indexOf('id="team-heading"');
const treatment = visibleText(homePage.slice(treatmentStart, whyStart));
const funding = visibleText(homePage.slice(fundingStart, teamStart));

test("homepage treatment cards keep the published wording and destinations", () => {
  assert.match(
    treatment,
    /Can be more effective than another conventional medication when antidepressants have not helped enough/,
  );
  assert.match(
    treatment,
    /TMS is a non-invasive neuromodulation treatment with established evidence for depression and certain other psychiatric conditions/,
  );
  assert.match(treatment, /It is generally well tolerated/);
  assert.match(
    treatment,
    /Suitability depends on the diagnosis, treatment history and protocol being considered/,
  );
  assert.match(treatment, /Improvement may begin within hours or days/);
  assert.match(
    treatment,
    /Ketamine can reduce depressive symptoms considerably faster than conventional antidepressants/,
  );
  assert.match(
    treatment,
    /It is administered through intramuscular and subcutaneous injections in a controlled clinical setting with medical supervision/,
  );
  assert.match(treatment, /Discover how TMS could help/);
  assert.match(treatment, /Explore how ketamine could help/);
  assert.match(treatment, /More about our service/);
  assert.match(homePage, /href="\/about-tms-treatment-on-psychiatric-illness\/"/);
  assert.match(homePage, /href="\/ketamine-treatment-resistant-depression-nanaimo\/"/);
  assert.match(homePage, /href="\/services-psychiatric-tms-ketamine-treatment\/"/);
});

test("homepage funding copy is unchanged", () => {
  assert.match(funding, /not generally covered/);
  assert.match(funding, /covered by MSP for eligible BC residents when referral requirements are met/);
  assert.match(funding, /Veterans Affairs Canada/);
  assert.match(funding, /WorkSafeBC/);
  assert.match(
    funding,
    /Approval depends on eligibility and the requirements of the individual funding program/,
  );
});

test("homepage care pathway uses the supplied forward copy and contact CTA", () => {
  const start = homePage.indexOf("const FORWARD");
  const end = homePage.indexOf('id="funding-heading"');
  const pathway = visibleText(homePage.slice(start, end));
  assert.match(pathway, /A clear way forward/);
  assert.equal(homePage.includes("How care typically proceeds"), false);
  assert.match(
    pathway,
    /You do not need to choose a treatment before contacting us\. Start by telling us what has not helped enough and what you hope will change/,
  );
  assert.match(pathway, /Start with a conversation/);
  assert.match(pathway, /Understand the full picture/);
  assert.match(pathway, /Receive care tailored to you/);
  assert.match(pathway, /Keep moving forward/);
  assert.match(pathway, /bright-light therapy or another approach/);
  assert.match(
    pathway,
    /For an MSP-covered psychiatric assessment, a physician referral is required/,
  );
  assert.match(pathway, /Talk to our team/);
  assert.match(homePage, /href="\/contact\/"/);
  assert.match(homePage, /<ol className="home-forward-list">/);
  assert.match(homePage, /aria-hidden="true"/);
  assert.equal(landingPage.includes("home-forward"), false);
  assert.match(landingPage, /className="pathway-block mt-8"/);
  assert.match(globalsCss, /\.home-forward \{/);
  assert.match(globalsCss, /\.pathway-rule \{/);
});

test("treatment-card emphasis and funding columns are homepage-scoped", () => {
  assert.match(homePage, /home-tx-benefit--tms/);
  assert.match(homePage, /home-tx-benefit--ket/);
  assert.match(homePage, /home-tx-support/);
  assert.equal(landingPage.includes("home-tx-benefit"), false);
  const sharedBenefit = globalsCss.match(/\.tx-feature-benefit \{[\s\S]*?\}/);
  assert.ok(sharedBenefit);
  assert.equal(sharedBenefit[0].includes("background"), false);
  assert.match(globalsCss, /\.home-tx-benefit--tms \{[\s\S]*?background:\s*#eef3f8/);
  assert.match(globalsCss, /\.home-tx-benefit--ket \{[\s\S]*?background:\s*#f6eed8/);
  assert.match(
    globalsCss,
    /@media \(min-width: 1024px\) \{[\s\S]*?\.funding-grid \{[\s\S]*?1fr\) minmax\(0, 1\.4fr\) minmax\(0, 1fr\)/,
  );
  const fundingRule = globalsCss.match(/\.funding-grid \{[\s\S]*?\.team-split \{/);
  assert.ok(fundingRule);
  assert.equal(fundingRule[0].includes("repeat(3"), false);
});
