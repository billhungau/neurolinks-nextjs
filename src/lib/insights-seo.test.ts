import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { articleJsonLd, breadcrumbJsonLd, doiHref, formatReference } from "./insights.ts";
import { productionUrl } from "./site.ts";

const seoSource = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "insights-seo.ts"), "utf8");

const article = {
  title: "How VAC authorization for TMS works in British Columbia",
  slug: "how-vac-authorization-for-tms-works-in-british-columbia",
  summary: "An educational outline of the authorization pathway.",
  publishedAt: "2026-09-01T12:00:00.000Z",
  lastReviewedAt: "2026-09-02",
  author: { name: "Dr. Chi Hung Au", role: "Psychiatrist" },
  medicalReviewer: { name: "Dr. Chi Hung Au", role: "Psychiatrist" },
};

test("article JSON-LD uses visible fields only and production canonicals", () => {
  const data = articleJsonLd(article);
  assert.equal(data["@type"], "Article");
  assert.equal(data.headline, article.title);
  assert.equal(data.description, article.summary);
  assert.equal(
    data.url,
    productionUrl("/insights/how-vac-authorization-for-tms-works-in-british-columbia/"),
  );
  assert.equal((data.author as { name: string }).name, "Dr. Chi Hung Au");
  assert.equal((data.reviewedBy as { name: string }).name, "Dr. Chi Hung Au");
  assert.equal((data.publisher as { name: string }).name, "NeuroLinks");
  assert.equal(JSON.stringify(data).includes("miracle"), false);
  assert.equal("image" in data, false);
});

test("breadcrumb JSON-LD lists Home, Insights and the article", () => {
  const data = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Insights", path: "/insights/" },
    {
      name: article.title,
      path: "/insights/how-vac-authorization-for-tms-works-in-british-columbia/",
    },
  ]);
  assert.equal(data["@type"], "BreadcrumbList");
  assert.equal(data.itemListElement[0].item, "https://neurolinks.ca/");
  assert.equal(data.itemListElement[1].item, "https://neurolinks.ca/insights/");
  assert.equal(data.itemListElement[2].position, 3);
});

test("article metadata uses unique titles, canonicals, article Open Graph and dates", () => {
  assert.match(seoSource, /export function articleMetadataRecord/);
  assert.match(seoSource, /alternates: \{ canonical \}/);
  assert.match(seoSource, /type: "article"/);
  assert.match(seoSource, /publishedTime: article\.publishedAt/);
  assert.match(seoSource, /modifiedTime: article\.lastReviewedAt \|\| article\.publishedAt/);
  assert.match(seoSource, /authors: article\.author\?\.name \? \[article\.author\.name\]/);
  assert.match(seoSource, /articleShareImage/);
  assert.match(seoSource, /path: "\/insights\/"/);
  assert.equal(seoSource.includes("miracle"), false);
});

test("references render a consistent citation string without injecting HTML", () => {
  const text = formatReference({
    title: "Repetitive transcranial magnetic stimulation for depression",
    authors: "Author A",
    publisher: "Journal",
    year: 2020,
    volume: "12",
    issue: "3",
    pages: "10-20",
    doi: "10.1000/example",
  });
  assert.match(text, /Author A\./);
  assert.match(text, /Journal/);
  assert.match(text, /\(2020\)/);
  assert.match(text, /doi:10\.1000\/example/);
  assert.equal(text.includes("<"), false);
  assert.equal(doiHref("10.1000/example"), "https://doi.org/10.1000/example");
});
