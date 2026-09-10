import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { FOOTER_QUICK_LINKS, footerQuickLinks, PRIMARY_NAV } from "../../../lib/nav.ts";
import { SITEMAP_ROUTES } from "../../../content/manifest.ts";
import { isInsightsPublicEnabled } from "../../../lib/insights.ts";
import { automaticArticleCta, selectInsightsLead } from "../../../lib/insights-editorial.ts";

const root = dirname(fileURLToPath(import.meta.url));
const read = (relative: string) => readFileSync(join(root, relative), "utf8");
const indexPage = read("page.tsx");
const articlePage = read("[slug]/page.tsx");
const globalsCss = read("../globals.css");
const insightsCss = read("../insights.css");
const indexCss = read("../insights-index.css");
const articleEditorialCss = read("../insights-editorial.css");
const articleBody = read("../../../components/insights/ArticleBody.tsx");
const articleCollection = read("../../../components/insights/ArticleCollection.tsx");
const articleCard = read("../../../components/insights/ArticleCard.tsx");
const articleToc = read("../../../components/insights/ArticleToc.tsx");
const comparison = read("../../../components/insights/EvidenceSummary.tsx");
const sitemap = read("../../sitemap.ts");
const robots = read("../../robots.ts");
const footer = read("../../../components/SiteFooter.tsx");
const dataLayer = read("../../../lib/payload/insights.ts");
const insightsCollection = read("../../../payload/collections/Insights.ts");
const blocks = read("../../../payload/blocks/index.ts");
const lexical = read("../../../payload/lexical.ts");
const adminPage = read("../../(payload)/admin/[[...segments]]/page.tsx");
const payloadConfig = read("../../../payload.config.ts");
const previewRoute = read("../api/insights-preview/route.ts");

test("the public Insights index is gated and uses the compact editorial layout", () => {
  assert.match(indexPage, /shouldExposeInsightsPublicly/); assert.match(indexPage, /notFound\(\)/); assert.match(indexPage, /generateMetadata/); assert.match(indexPage, /insightsIndexMetadata/); assert.equal(/\bBlog\b/.test(indexPage), false); assert.match(indexPage, /TopicFilters/); assert.match(articleCollection, /insights-editorial-grid/); assert.match(indexPage, /FeaturedArticle/); assert.match(indexPage, /selectInsightsLead/); assert.equal(indexPage.includes("Medical authorship"), false); assert.equal(indexPage.includes("InsightsHero"), false); assert.match(indexPage, /searchParams/); assert.equal(indexPage.includes("placeholder"), false);
});

test("lead article prefers featured content, falls back to newest, and never duplicates", () => {
  const articles = [
    { id: 1, title: "Newest", slug: "newest", category: null, featuredImage: null, featured: false },
    { id: 2, title: "Featured", slug: "featured", category: null, featuredImage: null, featured: true },
    { id: 3, title: "Third", slug: "third", category: null, featuredImage: null },
  ];
  const selected = selectInsightsLead(articles, null);
  assert.equal(selected.lead?.id, 2);
  assert.equal(selected.remaining.some((article) => article.id === 2), false);
  assert.deepEqual(selectInsightsLead(articles, "tms").remaining.map((article) => article.id), [1, 2, 3]);
  assert.equal(selectInsightsLead(articles, "tms").lead, null);
  assert.equal(selectInsightsLead([articles[0]], null).lead?.id, 1);
});

test("automatic article CTA selection prevents redundant Veterans and embedded CTAs", () => {
  assert.equal(automaticArticleCta({ topics: ["veterans-and-coverage"], bodyHasCta: false }), "veterans");
  assert.equal(automaticArticleCta({ topics: ["veterans-and-coverage"], bodyHasCta: true }), "none");
  assert.equal(automaticArticleCta({ topics: ["tms"], bodyHasCta: false }), "generic");
  assert.equal(automaticArticleCta({ topics: ["tms"], bodyHasCta: true }), "none");
});

test("the index reads only through the data layer", () => { assert.match(indexPage, /from "@\/lib\/payload\/insights"/); assert.equal(indexPage.includes("getPayload"), false); assert.equal(indexPage.includes("payload.find"), false); });
test("the premium index supports readable grid and list views without changing article data", () => { assert.match(indexCss, /\.insights-index-lead/); assert.match(indexCss, /\.insights-editorial-grid\.is-grid/); assert.match(indexCss, /\.insights-editorial-grid\.is-list/); assert.match(indexCss, /nth-child\(even\)/); assert.match(indexCss, /\.insights-view-toggle/); assert.match(indexCss, /button\.is-active \{ background: var\(--nl-navy\)/); assert.match(indexCss, /repeat\(3,\s*minmax\(0,\s*1fr\)\)/); assert.match(indexCss, /\.is-grid \.insights-card \{ height: auto/); assert.match(indexCss, /flex:\s*0 0 auto/); assert.match(articleCollection, /useState<ViewMode>\("grid"\)/); assert.match(articleCollection, /localStorage/); assert.match(articleCollection, /aria-pressed/); assert.match(articleCollection, /articles\.length/); assert.match(articleCard, /insights-card-action/); assert.match(indexPage, /ArticleCollection/); assert.match(indexCss, /\.insights-index-intro/); assert.match(indexCss, /\.insights-index-cta/); });
test("article routes 404 for unpublished, unknown or disabled URLs and keep draft preview", () => { assert.match(articlePage, /isDraftPreview/); assert.match(articlePage, /canShowArticle/); assert.match(articlePage, /notFound\(\)/); assert.match(articlePage, /generateMetadata/); assert.match(articlePage, /articleJsonLd/); assert.match(articlePage, /breadcrumbJsonLd/); assert.match(articlePage, /<h1>\{article\.title\}<\/h1>/); assert.match(articlePage, /ArticleToc/); assert.equal((articlePage.match(/<h1/g) ?? []).length, 1); });
test("article header uses compact editorial metadata without changing semantic dates or JSON-LD", () => { assert.match(articlePage, /insights-editorial-meta/); assert.match(articlePage, /Written by/); assert.match(articlePage, /Medically reviewed by/); assert.match(articlePage, /<time dateTime=\{article\.publishedAt/); assert.match(articlePage, /<time dateTime=\{article\.lastReviewedAt/); assert.match(articleEditorialCss, /\.insights-editorial-meta/); });
test("key points remain accessible and the TOC is sticky on desktop but collapsible on mobile", () => { assert.match(articlePage, /aria-labelledby="insights-keypoints-heading"/); assert.match(articleToc, /<details>/); assert.equal(articleToc.includes("<details open>"), false); assert.match(articleEditorialCss, /position:\s*sticky/); assert.match(articleEditorialCss, /@media \(max-width: 939px\)/); assert.match(articleEditorialCss, /details:not\(\[open\]\) ol \{ display: none/); });
test("every public query is constrained to published documents in the database", () => { assert.match(dataLayer, /_status: \{ equals: "published" \}/); assert.match(dataLayer, /publishedAt: \{ exists: true \}/); assert.equal((dataLayer.match(/draft: true/g) ?? []).length, 1); assert.match(dataLayer, /if \(!preview\) return cachedArticleBySlug\(slug\)/); assert.match(dataLayer, /unstable_cache/); assert.match(dataLayer, /INSIGHTS_CACHE_TAG/); });
test("Insights use Payload drafts and only editors may write or read versions", () => { assert.match(insightsCollection, /versions: \{/); assert.match(insightsCollection, /drafts: \{/); assert.match(insightsCollection, /read: publishedOrAuthenticated/); assert.match(insightsCollection, /create: authenticated/); assert.match(insightsCollection, /update: authenticated/); assert.match(insightsCollection, /delete: authenticated/); assert.match(insightsCollection, /readVersions: authenticated/); assert.match(insightsCollection, /preview: previewUrl/); });
test("the preview route requires a signed link and a Payload session", () => { assert.match(previewRoute, /isValidPreviewToken/); assert.match(previewRoute, /payload\.auth/); assert.match(previewRoute, /if \(!user\)/); assert.match(previewRoute, /draft\.enable\(\)/); assert.match(previewRoute, /overrideAccess: false/); });
test("the editor offers structured clinical blocks and no H1, colour or raw HTML", () => { assert.match(lexical, /enabledHeadingSizes: \["h2", "h3"\]/); assert.equal(lexical.includes("h1"), false); assert.equal(lexical.includes("HTMLConverter"), false); assert.equal(blocks.includes("color"), false); for (const slug of ["keyPointsBox","evidenceSummary","clinicalNote","importantLimitation","vacCoverageNote","processTimeline","comparisonTable","pullQuote","imageWithCaption","relatedReading","contextualCta","referencesSection","citation"]) { assert.match(blocks, new RegExp(`slug: "${slug}"`)); assert.match(articleBody, new RegExp(`\\b${slug}:`)); } });
test("uploads require alternative text before an image can be used", () => { const media = read("../../../payload/collections/Media.ts"); assert.match(media, /label: "Alternative text"/); assert.match(media, /required: true/); assert.match(media, /minLength: 8/); });
test("editorial blocks and references are rendered by dedicated components", () => { assert.match(articleBody, /href=\{`#reference-\$\{number\}`\}/); assert.match(comparison, /<table className="insights-compare-table"/); assert.match(comparison, /<th key=\{column\} scope="col">/); assert.match(comparison, /insights-compare-cards/); assert.match(insightsCss, /@media \(max-width: 699px\)/); assert.match(insightsCss, /\.insights-compare-table-wrap \{\s*display:\s*none/); });
test("Lexical lists and citation numbers keep their markers despite the Tailwind reset", () => { assert.match(insightsCss, /\.insights-prose ul \{\s*list-style:\s*disc/); assert.match(insightsCss, /\.insights-prose ol,\s*\n\.insights-references ol \{\s*list-style:\s*decimal/); });
test("internal links use existing clinic routes and the Veterans contact anchor", () => { assert.match(articlePage, /\/veterans\/#veterans-contact/); assert.match(indexPage, /href="\/contact\/"/); assert.match(articleBody, /insightsArticlePath\(entry\.slug\)/); });
test("sitemap and robots exclude the CMS; Insights URLs are added only when enabled", () => { assert.equal(SITEMAP_ROUTES.includes("/insights/"), false); assert.equal(SITEMAP_ROUTES.includes("/admin/"), false); assert.match(sitemap, /shouldExposeInsightsPublicly/); assert.match(sitemap, /getIndexableArticleSlugs/); assert.match(robots, /disallow: \[CMS_ADMIN_PATH, `\$\{CMS_API_PATH\}\/`, "\/api\/"\]/); assert.match(adminPage, /generatePageMetadata/); assert.match(payloadConfig, /robots: "noindex, nofollow"/); });
test("footer exposes Insights by default, keeps a kill switch, and leaves the header unchanged", () => { const previous = process.env.NEXT_PUBLIC_INSIGHTS_ENABLED; delete process.env.NEXT_PUBLIC_INSIGHTS_ENABLED; assert.equal(isInsightsPublicEnabled(), true); let labels = footerQuickLinks().map((item) => item.label); assert.equal(labels[0], "Veterans"); assert.equal(labels[1], "Insights"); process.env.NEXT_PUBLIC_INSIGHTS_ENABLED = "false"; assert.equal(isInsightsPublicEnabled(), false); assert.deepEqual(footerQuickLinks().map((item) => item.label), FOOTER_QUICK_LINKS.map((item) => item.label)); process.env.NEXT_PUBLIC_INSIGHTS_ENABLED = "true"; labels = footerQuickLinks().map((item) => item.label); assert.equal(labels[1], "Insights"); assert.equal(PRIMARY_NAV.some((item) => item.label === "Insights"), false); assert.match(footer, /footerQuickLinks/); if (previous === undefined) delete process.env.NEXT_PUBLIC_INSIGHTS_ENABLED; else process.env.NEXT_PUBLIC_INSIGHTS_ENABLED = previous; });
test("Insights motion fails open and honours reduced motion", () => { assert.match(articleCollection, /<Reveal/); assert.match(globalsCss, /prefers-reduced-motion:\s*reduce/); assert.match(insightsCss, /prefers-reduced-motion:\s*reduce/); assert.match(insightsCss, /\.insights-card \{\s*transition:\s*none/); });
test("no public Insights code imports the retired CMS", () => { for (const source of [indexPage, articlePage, articleBody, sitemap, robots, dataLayer]) assert.equal(/sanity|groq|portabletext/i.test(source), false); });
