import assert from "node:assert/strict";
import test from "node:test";
import {
  countWords,
  defaultCtaHref,
  insightsArticlePath,
  isIndexableArticle,
  isInsightsPublicEnabled,
  isInsightsTopicSlug,
  isMedicalArticle,
  isPublishedArticle,
  readingTimeMinutes,
  slugifyHeading,
  uniqueHeadingIds,
} from "./insights.ts";

test("Insights is public by default with an explicit false kill switch", () => {
  const previous = process.env.NEXT_PUBLIC_INSIGHTS_ENABLED;
  delete process.env.NEXT_PUBLIC_INSIGHTS_ENABLED;
  assert.equal(isInsightsPublicEnabled(), true);
  process.env.NEXT_PUBLIC_INSIGHTS_ENABLED = "false";
  assert.equal(isInsightsPublicEnabled(), false);
  process.env.NEXT_PUBLIC_INSIGHTS_ENABLED = "true";
  assert.equal(isInsightsPublicEnabled(), true);
  if (previous === undefined) delete process.env.NEXT_PUBLIC_INSIGHTS_ENABLED;
  else process.env.NEXT_PUBLIC_INSIGHTS_ENABLED = previous;
});

test("only published Payload documents with a slug and a date are public", () => {
  const published = { _status: "published", slug: "tms-and-vac", publishedAt: "2026-09-01" };
  assert.equal(isPublishedArticle(published), true);
  assert.equal(isPublishedArticle({ ...published, _status: "draft" }), false);
  assert.equal(isPublishedArticle({ ...published, publishedAt: null }), false);
  assert.equal(isPublishedArticle({ ...published, slug: null }), false);
  assert.equal(isPublishedArticle(null), false);
});

test("noindex articles stay out of the indexable set even once published", () => {
  const published = { _status: "published", slug: "tms-and-vac", publishedAt: "2026-09-01" };
  assert.equal(isIndexableArticle(published), true);
  assert.equal(isIndexableArticle({ ...published, indexable: true }), true);
  assert.equal(isIndexableArticle({ ...published, indexable: false }), false);
  assert.equal(isIndexableArticle({ ...published, _status: "draft" }), false);
});

test("MedicalWebPage typing is limited to clinical topics", () => {
  assert.equal(isMedicalArticle(["tms"]), true);
  assert.equal(isMedicalArticle(["ketamine-and-spravato"]), true);
  assert.equal(isMedicalArticle(["veterans-and-coverage"]), false);
  assert.equal(isMedicalArticle([]), false);
  assert.equal(isMedicalArticle(null), false);
});

test("article paths keep trailing slashes and topic slugs are known", () => {
  assert.equal(
    insightsArticlePath("how-vac-authorization-for-tms-works-in-british-columbia"),
    "/insights/how-vac-authorization-for-tms-works-in-british-columbia/",
  );
  assert.equal(isInsightsTopicSlug("tms"), true);
  assert.equal(isInsightsTopicSlug("blog"), false);
  assert.equal(defaultCtaHref(["veterans-and-coverage"]), "/veterans/#veterans-contact");
  assert.equal(defaultCtaHref(["tms"]), "/contact/");
  assert.equal(defaultCtaHref(["ketamine-and-spravato"]), "/ketamine-treatment-resistant-depression-nanaimo/");
  assert.equal(defaultCtaHref([]), "/contact/");
});

test("heading ids are stable, unique and reading time rounds up from words", () => {
  assert.equal(slugifyHeading("How VAC authorization works"), "how-vac-authorization-works");
  assert.deepEqual(uniqueHeadingIds(["Evidence", "Evidence", "Care"]), [
    "evidence",
    "evidence-2",
    "care",
  ]);
  assert.equal(countWords("one two three"), 3);
  assert.equal(readingTimeMinutes(0), 1);
  assert.equal(readingTimeMinutes(220), 1);
  assert.equal(readingTimeMinutes(400, 6), 6);
});
