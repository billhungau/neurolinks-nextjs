import assert from "node:assert/strict";
import test from "node:test";
import { PAGE_MANIFEST, SITEMAP_ROUTES } from "../content/manifest.ts";
import { productionUrl } from "./site.ts";

const REQUIRED_TITLES: Record<string, string> = {
  "/": "TMS & Ketamine Therapy in Nanaimo, BC | NeuroLinks",
  "/about-tms-treatment-on-psychiatric-illness/": "TMS Therapy in Nanaimo, Vancouver Island | NeuroLinks",
  "/ketamine-treatment-resistant-depression-nanaimo/": "Ketamine Therapy in Nanaimo, BC | NeuroLinks",
  "/services-psychiatric-tms-ketamine-treatment/": "Psychiatric Assessment & Treatment in Nanaimo | NeuroLinks",
  "/veterans/": "TMS & Ketamine Treatment for Veterans in BC | NeuroLinks",
  "/psychiatrist-tms-nanaimo/": "Dr. Chi Hung Au & Our Team | NeuroLinks Nanaimo",
  "/physician-referral/": "Refer a Patient for TMS or Ketamine | NeuroLinks",
  "/contact/": "Contact NeuroLinks | Nanaimo TMS & Ketamine Clinic",
};

test("main English pages have unique titles without a leftover template suffix", () => {
  const titles = PAGE_MANIFEST.map((page) => page.seoTitle);
  assert.equal(new Set(titles).size, titles.length);
  for (const [route, title] of Object.entries(REQUIRED_TITLES)) {
    const page = PAGE_MANIFEST.find((item) => item.route === route);
    assert.equal(page?.seoTitle, title);
    assert.equal(title.includes("| NeuroLinks | NeuroLinks"), false);
  }
});

test("descriptions are unique and the ketamine title no longer has a missing space", () => {
  const descriptions = PAGE_MANIFEST.map((page) => page.seoDescription);
  assert.equal(new Set(descriptions).size, descriptions.length);
  const ketamine = PAGE_MANIFEST.find(
    (page) => page.route === "/ketamine-treatment-resistant-depression-nanaimo/",
  );
  assert.equal(ketamine?.seoTitle.includes("&Anxiety"), false);
});

test("sitemap routes are the eight indexable English pages only", () => {
  assert.deepEqual([...SITEMAP_ROUTES], [
    "/",
    "/about-tms-treatment-on-psychiatric-illness/",
    "/ketamine-treatment-resistant-depression-nanaimo/",
    "/services-psychiatric-tms-ketamine-treatment/",
    "/veterans/",
    "/psychiatrist-tms-nanaimo/",
    "/physician-referral/",
    "/contact/",
  ]);
  const landing = PAGE_MANIFEST.find((page) => page.route === "/neurolinks-psychiatry-nanaimo-bc/");
  assert.equal(landing?.inSitemap, false);
  const veterans = PAGE_MANIFEST.find((page) => page.route === "/veterans/");
  assert.equal(veterans?.inSitemap, true);
  assert.equal(
    veterans?.seoTitle,
    "TMS & Ketamine Treatment for Veterans in BC | NeuroLinks",
  );
  assert.equal(
    veterans?.seoDescription,
    "Psychiatrist-led assessment, TMS and ketamine treatment for Veterans in BC, with support navigating VAC and Medavie Blue Cross preauthorization.",
  );
  assert.equal(productionUrl("/veterans/"), "https://neurolinks.ca/veterans/");
});

test("Open Graph image URLs are production-origin and 1200x630 files exist", async () => {
  const { existsSync } = await import("node:fs");
  const files = [
    "default",
    "home",
    "tms",
    "ketamine",
    "services",
    "about",
    "contact",
    "referral",
    "landing",
  ];
  for (const name of files) {
    const path = `public/media/og/${name}.jpg`;
    assert.equal(existsSync(path), true, path);
    assert.equal(productionUrl(`/media/og/${name}.jpg`), `https://neurolinks.ca/media/og/${name}.jpg`);
  }
});
