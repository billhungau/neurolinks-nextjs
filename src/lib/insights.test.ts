import assert from "node:assert/strict";
import test from "node:test";
import {
  PUBLISHED_ARTICLE_GROQ_FILTER,
  countWords,
  defaultCtaHref,
  insightsArticlePath,
  isInsightsPublicEnabled,
  isInsightsTopicSlug,
  readingTimeMinutes,
  slugifyHeading,
  uniqueHeadingIds,
} from "./insights.ts";

test("Insights stays disabled unless the launch flag is exactly true", () => {
  const previous = process.env.NEXT_PUBLIC_INSIGHTS_ENABLED;
  delete process.env.NEXT_PUBLIC_INSIGHTS_ENABLED;
  assert.equal(isInsightsPublicEnabled(), false);
  process.env.NEXT_PUBLIC_INSIGHTS_ENABLED = "1";
  assert.equal(isInsightsPublicEnabled(), false);
  process.env.NEXT_PUBLIC_INSIGHTS_ENABLED = "true";
  assert.equal(isInsightsPublicEnabled(), true);
  if (previous === undefined) delete process.env.NEXT_PUBLIC_INSIGHTS_ENABLED;
  else process.env.NEXT_PUBLIC_INSIGHTS_ENABLED = previous;
});

test("published article GROQ excludes drafts and unpublished documents", () => {
  assert.match(PUBLISHED_ARTICLE_GROQ_FILTER, /_type == "article"/);
  assert.match(PUBLISHED_ARTICLE_GROQ_FILTER, /!\(_id in path\("drafts\.\*\*"\)\)/);
  assert.match(PUBLISHED_ARTICLE_GROQ_FILTER, /defined\(publishedAt\)/);
  assert.match(PUBLISHED_ARTICLE_GROQ_FILTER, /defined\(slug\.current\)/);
});

test("article paths keep trailing slashes and topic slugs are known", () => {
  assert.equal(
    insightsArticlePath("how-vac-authorization-for-tms-works-in-british-columbia"),
    "/insights/how-vac-authorization-for-tms-works-in-british-columbia/",
  );
  assert.equal(isInsightsTopicSlug("tms"), true);
  assert.equal(isInsightsTopicSlug("blog"), false);
  assert.equal(defaultCtaHref(["veterans-and-coverage"]), "/veterans/#veterans-contact");
  assert.equal(defaultCtaHref(["tms"]), "/about-tms-treatment-on-psychiatric-illness/");
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
