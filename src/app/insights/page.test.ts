import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { FOOTER_QUICK_LINKS, footerQuickLinks, PRIMARY_NAV } from "../../lib/nav.ts";
import { SITEMAP_ROUTES } from "../../content/manifest.ts";
import { isInsightsPublicEnabled } from "../../lib/insights.ts";

const root = dirname(fileURLToPath(import.meta.url));
const indexPage = readFileSync(join(root, "page.tsx"), "utf8");
const articlePage = readFileSync(join(root, "[slug]/page.tsx"), "utf8");
const globalsCss = readFileSync(join(root, "../globals.css"), "utf8");
const insightsCss = readFileSync(join(root, "../insights.css"), "utf8");
const articleBody = readFileSync(join(root, "../../components/insights/ArticleBody.tsx"), "utf8");
const comparison = readFileSync(join(root, "../../components/insights/EvidenceSummary.tsx"), "utf8");
const sitemap = readFileSync(join(root, "../sitemap.ts"), "utf8");
const robots = readFileSync(join(root, "../robots.ts"), "utf8");
const footer = readFileSync(join(root, "../../components/SiteFooter.tsx"), "utf8");
const studioPage = readFileSync(join(root, "../studio/[[...tool]]/page.tsx"), "utf8");
const seed = readFileSync(join(root, "../../../sanity/seed/insights.ndjson"), "utf8");
const schemaArticle = readFileSync(join(root, "../../sanity/schemaTypes/article.ts"), "utf8");

test("the public Insights index is gated and never labelled as a blog", () => {
  assert.match(indexPage, /shouldExposeInsightsPublicly/);
  assert.match(indexPage, /notFound\(\)/);
  assert.match(indexPage, /InsightsHero/);
  assert.match(indexPage, /generateMetadata/);
  assert.match(indexPage, /insightsIndexMetadata/);
  assert.equal(/\bBlog\b/.test(indexPage), false);
  assert.match(indexPage, /TopicFilters/);
  assert.match(indexPage, /FeaturedArticle/);
  assert.match(indexPage, /searchParams/);
  assert.equal(indexPage.includes("placeholder"), false);
});

test("article routes 404 for unpublished, unknown or disabled URLs and keep draft preview", () => {
  assert.match(articlePage, /isDraftPreview/);
  assert.match(articlePage, /canShowArticle/);
  assert.match(articlePage, /isPublishedArticle/);
  assert.match(articlePage, /notFound\(\)/);
  assert.match(articlePage, /generateMetadata/);
  assert.match(articlePage, /articleJsonLd/);
  assert.match(articlePage, /breadcrumbJsonLd/);
  assert.match(articlePage, /<h1>\{article\.title\}<\/h1>/);
  assert.match(articlePage, /ArticleToc/);
  assert.equal((articlePage.match(/<h1/g) ?? []).length, 1);
});

test("published queries exclude drafts and seed documents are draft-only", () => {
  const queries = readFileSync(join(root, "../../sanity/queries.ts"), "utf8");
  assert.match(queries, /PUBLISHED_ARTICLE_GROQ_FILTER/);
  assert.match(queries, /drafts\.\*\*/);
  for (const line of seed.trim().split("\n")) {
    const doc = JSON.parse(line) as { _id: string; _type: string; publishedAt?: string };
    if (doc._type === "article") {
      assert.match(doc._id, /^drafts\./);
      assert.equal(doc.publishedAt, undefined);
    }
  }
});

test("schema requires image alt text and does not offer colour or font controls", () => {
  assert.match(schemaArticle, /title: "Alternative text"/);
  assert.match(schemaArticle, /rule\.required\(\)\.min\(8\)/);
  const blocks = readFileSync(join(root, "../../sanity/schemaTypes/blocks.ts"), "utf8");
  assert.equal(blocks.includes("value: \"h1\""), false);
  assert.equal(blocks.includes("color"), false);
  assert.match(blocks, /keyPointsBox/);
  assert.match(blocks, /evidenceSummary/);
  assert.match(blocks, /vacCoverageNote/);
  assert.match(blocks, /comparisonTable/);
  assert.match(blocks, /citation/);
});

test("portable text custom blocks and references are rendered by dedicated components", () => {
  assert.match(articleBody, /evidenceSummary/);
  assert.match(articleBody, /vacCoverageNote/);
  assert.match(articleBody, /comparisonTable/);
  assert.match(articleBody, /citation/);
  assert.match(articleBody, /href=\{`#reference-\$\{number\}`\}/);
  assert.match(comparison, /<table className="insights-compare-table"/);
  assert.match(comparison, /<th key=\{column\} scope="col">/);
  assert.match(comparison, /insights-compare-cards/);
  assert.match(insightsCss, /@media \(max-width: 699px\)/);
  assert.match(insightsCss, /\.insights-compare-table-wrap \{\s*display:\s*none/);
});

test("internal links use existing clinic routes and the Veterans contact anchor", () => {
  assert.match(articlePage, /\/veterans\/#veterans-contact/);
  assert.match(indexPage, /href="\/contact\/"/);
  assert.match(articleBody, /TextLink href=\{\`\/insights\/\$\{slug\}\/\`\}/);
});

test("sitemap and robots exclude Studio; Insights URLs are added only when enabled", () => {
  assert.equal(SITEMAP_ROUTES.includes("/insights/"), false);
  assert.equal(SITEMAP_ROUTES.includes("/studio/"), false);
  assert.match(sitemap, /shouldExposeInsightsPublicly/);
  assert.match(sitemap, /getIndexableArticleSlugs/);
  assert.match(robots, /disallow: \["\/studio\/"/);
  assert.match(studioPage, /index: false/);
  assert.match(studioPage, /follow: false/);
  assert.match(studioPage, /next-sanity\/studio/);
});

test("footer Insights link is flag-gated and the header is unchanged", () => {
  const previous = process.env.NEXT_PUBLIC_INSIGHTS_ENABLED;
  delete process.env.NEXT_PUBLIC_INSIGHTS_ENABLED;
  assert.equal(isInsightsPublicEnabled(), false);
  assert.deepEqual(
    footerQuickLinks().map((item) => item.label),
    FOOTER_QUICK_LINKS.map((item) => item.label),
  );
  process.env.NEXT_PUBLIC_INSIGHTS_ENABLED = "true";
  const labels = footerQuickLinks().map((item) => item.label);
  assert.equal(labels[0], "Veterans");
  assert.equal(labels[1], "Insights");
  assert.equal(
    PRIMARY_NAV.some((item) => item.label === "Insights"),
    false,
  );
  assert.match(footer, /footerQuickLinks/);
  if (previous === undefined) delete process.env.NEXT_PUBLIC_INSIGHTS_ENABLED;
  else process.env.NEXT_PUBLIC_INSIGHTS_ENABLED = previous;
});

test("Insights motion fails open and honours reduced motion", () => {
  assert.match(indexPage, /<Reveal/);
  assert.match(globalsCss, /prefers-reduced-motion:\s*reduce/);
  assert.match(insightsCss, /prefers-reduced-motion:\s*reduce/);
  assert.match(insightsCss, /\.insights-card \{\s*transition:\s*none/);
});
