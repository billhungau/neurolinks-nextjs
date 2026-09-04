import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { PAGE_MANIFEST, SITEMAP_ROUTES } from "../../content/manifest.ts";
import { CONTACT_NAV, FOOTER_QUICK_LINKS, PRIMARY_NAV } from "../../lib/nav.ts";
import { productionUrl } from "../../lib/site.ts";

const root = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(root, "page.tsx"), "utf8");
const globalsCss = readFileSync(join(root, "../globals.css"), "utf8");
const carePathway = readFileSync(join(root, "../../components/CarePathway.tsx"), "utf8");
const header = readFileSync(join(root, "../../components/SiteHeader.tsx"), "utf8");
const footer = readFileSync(join(root, "../../components/SiteFooter.tsx"), "utf8");
const form = readFileSync(join(root, "../../components/forms/VeteransContactForm.tsx"), "utf8");
const veteransContent = readFileSync(join(root, "../../content/veterans.ts"), "utf8");
const servicesPage = readFileSync(
  join(root, "../services-psychiatric-tms-ketamine-treatment/page.tsx"),
  "utf8",
);

function visibleText(source: string) {
  return source
    .replace(/\{["']\s["']\}/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** JSX text nodes wrap across source lines; collapse before matching copy. */
const pageCopy = page.replace(/\s+/g, " ");

test("metadata uses the supplied title, description and canonical path", () => {
  assert.match(page, /title: "Mental Health Treatment for Veterans in BC \| NeuroLinks"/);
  assert.match(
    page,
    /"Psychiatrist-led assessment and treatment for Veterans experiencing depression, anxiety or trauma-related symptoms, with support preparing VAC preauthorization documentation\."/,
  );
  assert.match(page, /path: "\/veterans\/"/);
  assert.match(page, /image: PAGE_OG_IMAGES\.tms/);
  assert.equal(productionUrl("/veterans/"), "https://neurolinks.ca/veterans/");
});

test("the route is in the manifest and therefore in the sitemap", () => {
  const record = PAGE_MANIFEST.find((item) => item.route === "/veterans/");
  assert.ok(record, "missing /veterans/ manifest record");
  assert.equal(record.inSitemap, true);
  assert.ok(SITEMAP_ROUTES.includes("/veterans/"));
});

test("main navigation places Veterans between Assessment & Treatment and About Us", () => {
  const labels = PRIMARY_NAV.map((item) => item.label);
  assert.deepEqual(labels, [
    "Home",
    "About TMS",
    "About Ketamine",
    "Assessment & Treatment",
    "Veterans",
    "About Us",
    "Physician Referral",
  ]);
  const veterans = PRIMARY_NAV.find((item) => item.label === "Veterans");
  assert.equal(veterans?.href, "/veterans/");
  assert.equal(CONTACT_NAV.href, "/contact/");
  assert.match(header, /shrink-0/);
  assert.match(header, /xl:gap-x-5 xl:text-\[14px\] 2xl:gap-x-6/);
  assert.match(header, /aria-current=\{current \? "page" : undefined\}/);
});

test("the header treats the Veterans hero like the other overlay heroes", () => {
  assert.match(header, /if \(path === "\/veterans"\) return "veterans-hero";/);
  assert.match(page, /id="veterans-hero"/);
  assert.match(page, /className="vet-hero relative overflow-hidden/);
});

test("Veterans appears under footer quick links", () => {
  assert.equal(FOOTER_QUICK_LINKS[0].label, "Veterans");
  assert.equal(FOOTER_QUICK_LINKS[0].href, "/veterans/");
  assert.match(footer, /FOOTER_QUICK_LINKS/);
  assert.match(footer, /Quick links/);
});

test("hero carries the supplied eyebrow, single H1, copy and on-page CTAs", () => {
  const heroEnd = page.indexOf('className="trust-strip vet-trust"');
  const hero = visibleText(page.slice(page.indexOf('id="veterans-hero"'), heroEnd));
  assert.match(hero, /Care for Veterans/);
  assert.match(hero, /Specialist mental health treatment for Veterans/);
  assert.match(
    hero,
    /When depression, anxiety or trauma-related symptoms have not improved enough with medication or therapy, there may still be options\./,
  );
  assert.match(
    hero,
    /NeuroLinks provides psychiatrist-led assessment and treatment in Nanaimo, with experience helping Veterans navigate treatment planning and VAC preauthorization\./,
  );
  assert.match(hero, /Request a confidential conversation/);
  assert.match(hero, /Explore treatment options/);
  assert.match(hero, /For clinicians and case managers/);
  assert.match(page, /href="#veterans-contact"/);
  assert.match(page, /href="#treatment-options"/);
  assert.match(page, /href="#coordination"/);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  assert.match(page, /hero-enter hero-enter-2/);
  assert.match(page, /hero-enter hero-enter-3/);
  assert.match(globalsCss, /\.vet-hero \.hero-enter \{/);
});

test("hero photography is existing clinic media with descriptive alt text", () => {
  assert.match(page, /MEDIA\.tmsClinic/);
  assert.match(page, /MEDIA\.team/);
  assert.match(
    page,
    /Patient receiving TMS treatment at NeuroLinks, with the treatment coil positioned by a clinician/,
  );
  assert.match(
    page,
    /Dr\. Chi Hung Au with two NeuroLinks clinical team members at the clinic reception/,
  );
  for (const banned of ["camouflage", "medal", "flag", "silhouette", "<video", "autoPlay"]) {
    assert.equal(page.includes(banned), false, `unexpected ${banned}`);
  }
  const altCount = (page.match(/\salt=/g) ?? []).length;
  const imageCount = (page.match(/<Image\b/g) ?? []).length;
  assert.equal(altCount, imageCount);
});

test("trust strip reuses the homepage strip and stacks four facts cleanly", () => {
  assert.match(page, /className="trust-strip vet-trust"/);
  assert.match(page, /VETERAN_TRUST\.map/);
  assert.match(globalsCss, /\.vet-trust \.trust-grid \{[\s\S]*?minmax\(0, 1fr\)/);
  assert.match(
    globalsCss,
    /@media \(min-width: 900px\) \{\s*\.vet-trust \.trust-grid \{[\s\S]*?repeat\(4, minmax\(0, 1fr\)\)/,
  );
  assert.match(globalsCss, /\.vet-trust \.trust-title \{[\s\S]*?font-size:\s*0\.9375rem/);
});

test("editorial sections use one H1 and a logical H2/H3 hierarchy", () => {
  const headings = [...page.matchAll(/<h([123])\b/g)].map((match) => Number(match[1]));
  assert.equal(headings.filter((level) => level === 1).length, 1);
  assert.equal(headings[0], 1);
  let seenH2 = false;
  for (const level of headings) {
    if (level === 2) seenH2 = true;
    if (level === 3) assert.equal(seenH2, true, "H3 before any H2");
  }
  assert.match(page, /className="tms-h2"/);
});

test("condition panels have no per-card CTAs", () => {
  assert.match(pageCopy, /Mental health difficulties do not always occur one at a time/);
  assert.equal(veteransContent.includes("A condition listed here does not mean"), false);
  assert.match(page, /<Reveal className="vet-stagger vet-conditions">/);
  assert.match(page, /vet-condition vet-condition--\$\{condition\.tone\}/);
  const conditions = page.slice(page.indexOf('id="conditions"'), page.indexOf('id="treatment-options"'));
  assert.equal(conditions.includes("TextLink"), false);
  assert.equal(conditions.includes("ButtonLink"), false);
  assert.match(globalsCss, /\.vet-condition--teal \{/);
  assert.match(globalsCss, /\.vet-condition--gold \{/);
});

test("treatment panels stay secondary and scroll the primary CTA on-page", () => {
  assert.match(pageCopy, /Specialist options when standard care has not helped enough/);
  assert.match(page, /<Reveal className="vet-stagger vet-tx-grid">/);
  assert.match(page, /vet-tx vet-tx--\$\{treatment\.key\}/);
  assert.match(page, /<TextLink href=\{treatment\.href\}>/);
  assert.match(pageCopy, /Ask whether an assessment may be appropriate/);
  assert.match(globalsCss, /\.vet-tx--tms \.vet-tx-head \{[\s\S]*?background:\s*#eef3f8/);
  assert.match(globalsCss, /\.vet-tx--ketamine \.vet-tx-head \{[\s\S]*?background:\s*#f6eed8/);
  assert.equal(/\bIV\b|intravenous/i.test(veteransContent), false);
});

test("experience precedes the pathway and uses the team photograph", () => {
  assert.ok(page.indexOf('id="experience"') < page.indexOf("<CarePathway"));
  assert.match(page, /className="tms-section [^"]*tms-mist"/);
  assert.match(page, /MEDIA\.team/);
  assert.match(page, /Meet the team providing care/);
  assert.match(page, /VETERAN_EXPERIENCE_POINTS\.map/);
});

test("the Veteran pathway reuses the shared CarePathway component", () => {
  assert.match(page, /<CarePathway/);
  assert.match(page, /headingId="veteran-pathway-heading"/);
  assert.match(page, /steps=\{VETERAN_PATHWAY\}/);
  assert.match(page, /heading=\{VETERAN_PATHWAY_HEADING\}/);
  assert.match(page, /eyebrow=\{VETERAN_PATHWAY_EYEBROW\}/);
  assert.match(page, /ctaLabel=\{VETERAN_PATHWAY_CTA\.label\}/);
  assert.equal(page.includes("home-forward-list"), false);
  assert.match(carePathway, /home-forward-item/);
  assert.match(carePathway, /"authorize"/);
  assert.match(globalsCss, /\.home-forward-item:nth-child\(4\) \.home-forward-node \{/);
});

test("coverage includes the official VAC link and an on-page coordination panel", () => {
  const coverage = visibleText(page.slice(page.indexOf('id="coverage"'), page.indexOf('id="faqs"')));
  assert.match(coverage, /Coverage and authorization/);
  assert.match(coverage, /VETERAN_COVERAGE\.coordinationHeading/);
  assert.match(coverage, /Submit a physician referral/);
  assert.match(coverage, /Contact NeuroLinks about coordination/);
  assert.match(coverage, /Veterans Affairs Canada — Mental Health Benefits/);
  assert.match(page, /id="coordination"/);
  assert.match(page, /href="\/physician-referral\/"/);
  assert.match(page, /VAC_MENTAL_HEALTH_BENEFITS_URL/);
  assert.match(page, /rel="noopener noreferrer"\s*\n?\s*target="_blank"/);
  assert.match(globalsCss, /\.vet-coord \{/);
});

test("FAQs render through the editorial accordion and emit matching FAQPage JSON-LD", () => {
  assert.match(page, /<FaqJsonLd items=\{VETERAN_FAQS\} \/>/);
  assert.match(page, /<FaqAccordion items=\{VETERAN_FAQS\} variant="editorial" \/>/);
  assert.match(page, /className="tms-faq-layout"/);
  const faqSection = page.slice(page.indexOf('id="faqs"'), page.indexOf('id="veterans-contact"'));
  assert.equal(faqSection.includes("Request a confidential conversation"), false);
  const jsonLd = readFileSync(join(root, "../../components/FaqJsonLd.tsx"), "utf8");
  assert.match(jsonLd, /"@type": "FAQPage"/);
});

test("Veterans page anchors share the measured header offset", () => {
  for (const id of [
    "treatment-options",
    "experience",
    "coverage",
    "coordination",
    "faqs",
    "veterans-contact",
  ]) {
    assert.match(page, new RegExp(`id="${id}"[\\s\\S]{0,100}vet-anchor-target`));
  }
  assert.match(carePathway, /className="home-section home-forward text-white"/);
  assert.match(globalsCss, /\.home-forward \{[\s\S]*?scroll-margin-top:\s*var\(--nl-anchor-offset\)/);
  assert.match(
    globalsCss,
    /\.vet-anchor-target :is\(\.tms-h2, \.home-h2\),[\s\S]*?scroll-margin-top:\s*var\(--nl-anchor-offset\)/,
  );
});

test("the three longest editorial sections use tighter Veterans-page spacing", () => {
  for (const id of ["conditions", "treatment-options", "experience"]) {
    assert.match(page, new RegExp(`id="${id}"[\\s\\S]{0,120}vet-compact-section`));
  }
  assert.match(
    globalsCss,
    /\.tms-section\.vet-compact-section \{[\s\S]*?--vet-section-pad:\s*3\.75rem/,
  );
  assert.match(
    globalsCss,
    /@media \(min-width: 768px\) \{\s*\.tms-section\.vet-compact-section \{\s*--vet-section-pad:\s*4\.75rem/,
  );
});

test("the final contact section hosts the Veteran form and clinic phone number", () => {
  assert.match(page, /id="veterans-contact"/);
  assert.match(page, /<VeteransContactForm/);
  assert.match(page, /href=\{SITE\.phoneHref\}/);
  assert.match(page, /Call \{SITE\.phone\}/);
  assert.match(form, /data-nl-form-source=\{VETERANS_SOURCE\}/);
  assert.match(form, /Ask our team to contact me/);
  assert.match(form, /You do not need to describe your trauma or medical history here/);
  assert.match(form, /source: VETERANS_SOURCE/);
  assert.equal(form.includes("Preferred contact method"), false);
  assert.equal(form.includes("What would you like help with?"), false);
  assert.equal(form.includes('name="preferredContact"'), false);
  assert.equal(form.includes('name="topic"'), false);
  assert.match(form, /name="email"[\s\S]{0,240}required[\s\S]{0,120}aria-required="true"/);
  const phoneField = form.slice(
    form.indexOf('<Field id="veterans-phone"'),
    form.indexOf('<Field id="veterans-message"'),
  );
  assert.match(phoneField, /optional/);
  assert.equal(phoneField.includes("required"), false);
  assert.match(form, /name="message"[\s\S]{0,240}required[\s\S]{0,120}aria-required="true"/);
  assert.equal(form.includes("JOTFORM_API_KEY"), false);
  assert.equal(form.includes("searchParams"), false);
  assert.equal(form.includes("gtag"), false);
  assert.match(globalsCss, /\.vet-contact \{/);
});

test("primary CTAs stay on the Veterans page instead of leaving for \/contact\/", () => {
  assert.equal(page.includes('href="/contact/"'), false);
  for (const href of [
    "/physician-referral/",
    "/psychiatrist-tms-nanaimo/",
  ]) {
    assert.ok(page.includes(href), `missing internal link ${href}`);
  }
  assert.match(page, /VETERAN_TREATMENTS/);
  assert.match(page, /VETERAN_CONDITIONS/);
});

test("reveal animation fails open and honours reduced motion", () => {
  assert.match(page, /<Reveal/);
  assert.equal(page.includes("setTimeout"), false);
  assert.match(globalsCss, /\.reveal \{\s*opacity:\s*1;\s*transform:\s*none;\s*\}/);
  assert.match(
    globalsCss,
    /\.motion-ready \.vet-stagger\.reveal:not\(\.is-visible\) > \* \{[\s\S]*?opacity:\s*0/,
  );
  assert.match(
    globalsCss,
    /\.motion-ready \.nl-hash-target \.vet-stagger\.reveal:not\(\.is-visible\) > \* \{[\s\S]*?opacity:\s*1/,
  );
  assert.match(
    globalsCss,
    /@media \(prefers-reduced-motion: reduce\) \{\s*\.vet-hero \.hero-photo,[\s\S]*?\.vet-stagger\.reveal > \* \{[\s\S]*?animation:\s*none\s*!important/,
  );
  assert.match(globalsCss, /animation:\s*vet-stagger-in 480ms/);
  assert.match(globalsCss, /> :nth-child\(2\) \{\s*animation-delay:\s*70ms/);
  assert.match(globalsCss, /> :nth-child\(3\) \{\s*animation-delay:\s*140ms/);
});

test("the Services page no longer claims blanket Medavie Blue Cross coverage", () => {
  assert.equal(
    servicesPage.includes(
      "The TMS treatment is covered by the Medavie Blue Cross insurance",
    ),
    false,
  );
  assert.match(servicesPage, /VETERAN_COVERAGE_STATEMENT/);
  assert.match(servicesPage, /title: "Veterans Affairs Canada and Medavie Blue Cross"/);
  assert.match(servicesPage, /className="svc-fee"/);
});
