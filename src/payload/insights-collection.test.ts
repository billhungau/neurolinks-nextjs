import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { INSIGHTS_TOPICS } from "../lib/insights.ts";
import { sameHostRedirect } from "../lib/same-host-redirect.ts";
import { slugField, slugify } from "./fields/slug.ts";
import {
  isValidPreviewToken,
  previewPath,
  previewToken,
  PREVIEW_DISABLE_PATH,
  previewUrl,
} from "./preview.ts";

const root = dirname(fileURLToPath(import.meta.url));
const read = (relative: string) => readFileSync(join(root, relative), "utf8");

const insights = read("collections/Insights.ts");
const references = read("collections/References.ts");
const aiSourceDocuments = read("collections/AISourceDocuments.ts");
const users = read("collections/Users.ts");
const settings = read("globals/InsightsSettings.ts");
const config = read("../payload.config.ts");
const revalidate = read("hooks/revalidateInsights.ts");

const [slug] = slugField();

function derive(value: unknown, data: Record<string, unknown>) {
  const hook = slug.hooks?.beforeValidate?.[0];
  assert.ok(hook, "slug field derives its value in a beforeValidate hook");
  return hook({ data, originalDoc: undefined, value } as never);
}

test("slugs are lowercase, ASCII and hyphenated", () => {
  assert.equal(slugify("How VAC Authorization Works"), "how-vac-authorization-works");
  assert.equal(slugify("Ketamine & Spravato: what's the difference?"), "ketamine-spravato-whats-the-difference");
  assert.equal(slugify("  Émile's TMS review  "), "emiles-tms-review");
  assert.equal(slugify("---"), "");
});

test("a blank slug is derived from the title but a typed slug is kept", () => {
  assert.equal(derive(undefined, { title: "TMS for Veterans" }), "tms-for-veterans");
  assert.equal(derive("", { title: "TMS for Veterans" }), "tms-for-veterans");
  assert.equal(derive("custom-url", { title: "TMS for Veterans" }), "custom-url");
  assert.equal(derive("Not A Slug", { title: "TMS for Veterans" }), "not-a-slug");
});

test("slugs are unique, indexed and validated before saving", () => {
  assert.equal(slug.unique, true);
  assert.equal(slug.index, true);
  assert.equal(slug.admin?.position, "sidebar");
  const validate = slug.validate as (value: string | null | undefined) => true | string;
  assert.equal(validate("how-vac-authorization-works"), true);
  assert.equal(typeof validate(""), "string");
  assert.equal(typeof validate("Not A Slug"), "string");
});

test("preview links are signed and cannot be forged or reused across articles", () => {
  const previous = process.env.PAYLOAD_SECRET;
  process.env.PAYLOAD_SECRET = "test-secret";
  const token = previewToken("tms-and-vac");
  assert.equal(isValidPreviewToken("tms-and-vac", token), true);
  assert.equal(isValidPreviewToken("another-article", token), false);
  assert.equal(isValidPreviewToken("tms-and-vac", "deadbeef"), false);
  assert.equal(isValidPreviewToken("tms-and-vac", null), false);
  assert.match(previewPath("tms-and-vac"), /^\/api\/insights-preview\?slug=tms-and-vac&token=[a-f0-9]{64}$/);
  assert.equal(previewUrl({ slug: "tms-and-vac" }), previewPath("tms-and-vac"));
  assert.equal(previewUrl(null), "/insights/");
  assert.equal(PREVIEW_DISABLE_PATH, "/api/insights-preview/exit");
  if (previous === undefined) delete process.env.PAYLOAD_SECRET;
  else process.env.PAYLOAD_SECRET = previous;
});

test("the preview routes redirect on the requesting host so the draft cookie survives", () => {
  const response = sameHostRedirect("/insights/tms-and-vac/");
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "/insights/tms-and-vac/");

  const enable = read("../app/(frontend)/api/insights-preview/route.ts");
  const exit = read("../app/(frontend)/api/insights-preview/exit/route.ts");
  for (const route of [enable, exit]) {
    assert.match(route, /sameHostRedirect/);
    assert.doesNotMatch(route, /nextUrl\.origin/);
  }
});

test("the Insights collection carries the content, SEO and authorship fields", () => {
  for (const field of [
    "title",
    "summary",
    "keyPoints",
    "body",
    "featured",
    "readingTime",
    "sortOrder",
    "featuredImage",
    "featuredImageAlt",
    "author",
    "medicalReviewer",
    "publishedAt",
    "lastReviewedAt",
    "references",
    "seoTitle",
    "metaDescription",
    "socialTitle",
    "socialDescription",
    "socialImage",
    "canonicalUrl",
    "indexable",
  ]) {
    assert.match(insights, new RegExp(`name: "${field}"`), `missing field ${field}`);
  }
});

test("topic options come from the one authoritative taxonomy", () => {
  assert.match(insights, /INSIGHTS_TOPICS\.map/);
  assert.deepEqual(
    INSIGHTS_TOPICS.map((topic) => topic.slug),
    [
      "veterans-and-coverage",
      "tms",
      "ketamine-and-spravato",
      "treatment-resistant-depression",
      "depression",
      "ptsd-and-anxiety",
    ],
  );
});

test("publishing revalidates the public routes instead of needing a deployment", () => {
  assert.match(insights, /beforeChange: \[clearAISourceSessionBeforePublish\]/);
  assert.match(insights, /afterChange: \[revalidateInsight\]/);
  assert.match(insights, /afterDelete: \[revalidateInsightAfterDelete, cleanupAISourcesAfterDelete\]/);
  assert.match(revalidate, /revalidateTag\(INSIGHTS_CACHE_TAG, "max"\)/);
  assert.match(revalidate, /revalidatePath\(INSIGHTS_PATH\)/);
  assert.match(revalidate, /revalidatePath\("\/sitemap\.xml"\)/);
  assert.match(revalidate, /revalidatePath\(insightsArticlePath\(slug\)\)/);
});

test("private CMS data is not readable anonymously", () => {
  assert.match(users, /read: authenticated/);
  assert.equal(users.includes("read: anyone"), false);
  assert.match(references, /name: "editorialNote"/);
  assert.match(references, /read: authenticatedFieldAccess/);
  for (const source of [insights, references, settings]) {
    assert.match(source, /readVersions: authenticated/);
  }
});

test("the CMS is mounted off /api and GraphQL is not exposed", () => {
  assert.match(config, /admin: CMS_ADMIN_PATH\.replace\(\/\\\/\$\/, ""\)/);
  assert.match(config, /api: CMS_API_PATH/);
  assert.match(config, /graphQL: \{\s*disable: true/);
  assert.match(config, /push: false/);
  assert.match(config, /migrationDir/);
  assert.match(config, /vercelBlobStorage/);
});

test("Payload derives its absolute URL from the one authoritative site URL", () => {
  assert.match(config, /serverURL: siteOrigin\(\)/);
  const configCode = config.replace(/^\s*\/\/.*$/gm, "");
  assert.doesNotMatch(configCode, /neurolinks-nextjs\.vercel\.app/);
  assert.doesNotMatch(configCode, /https:\/\/neurolinks\.ca/);
  assert.match(config, /connectionString: process\.env\.DATABASE_URL/);
  assert.match(config, /secret: process\.env\.PAYLOAD_SECRET/);
  assert.equal(config.includes("NEXT_PUBLIC_PAYLOAD_SECRET"), false);
});

test("the CMS API stays same-origin and session cookies are origin-checked", () => {
  assert.match(config, /cors: \[\]/);
  assert.match(config, /csrf: cmsTrustedOrigins\(\)/);
});

test("preview links stay on the host serving the admin", () => {
  const previous = process.env.PAYLOAD_SECRET;
  process.env.PAYLOAD_SECRET = "test-secret";
  for (const value of [previewPath("tms-and-vac"), previewUrl({ slug: "tms-and-vac" }), previewUrl(null)]) {
    assert.ok(value.startsWith("/"), `${value} is relative`);
    assert.equal(value.includes("neurolinks.ca"), false);
    assert.equal(value.includes("vercel.app"), false);
  }
  if (previous === undefined) delete process.env.PAYLOAD_SECRET;
  else process.env.PAYLOAD_SECRET = previous;
});

test("the admin navigation remains limited to the six visible editorial areas", () => {
  const collections = config.match(/collections: \[([^\]]+)\]/)?.[1] ?? "";
  assert.deepEqual(
    collections.split(",").map((entry) => entry.trim()),
    ["Insights", "Media", "AISourceDocuments", "Categories", "Authors", "References", "Users"],
  );
  assert.match(aiSourceDocuments, /admin:\s*\{[\s\S]*hidden: true/);
  assert.match(config, /globals: \[InsightsSettings\]/);
  assert.match(users, /group: "Administration"/);
});
