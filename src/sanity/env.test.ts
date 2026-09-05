import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { isSanityConfigured } from "./env.ts";
import { isPublishedArticle } from "../lib/insights.ts";

const root = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(root, "env.ts"), "utf8");
const live = readFileSync(join(root, "live.ts"), "utf8");
const fetchSource = readFileSync(join(root, "fetch.ts"), "utf8");
const studioPage = readFileSync(join(root, "../app/studio/[[...tool]]/page.tsx"), "utf8");
const example = readFileSync(join(root, "../../.env.example"), "utf8");

test("missing Sanity project identifiers are treated as unconfigured", () => {
  const previous = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  assert.equal(isSanityConfigured(), false);
  if (previous === undefined) delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  else process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = previous;
  assert.match(env, /isSanityConfigured/);
  assert.match(live, /isSanityConfigured\(\)/);
  assert.match(fetchSource, /if \(!isSanityConfigured\(\)\) return fallback/);
  assert.match(studioPage, /Insights Studio is not connected/);
});

test("tokens stay server-only and example env uses placeholders", () => {
  assert.match(example, /NEXT_PUBLIC_SANITY_PROJECT_ID=/);
  assert.match(example, /SANITY_API_READ_TOKEN=/);
  assert.match(example, /SANITY_REVALIDATE_SECRET=/);
  assert.match(example, /NEXT_PUBLIC_INSIGHTS_ENABLED=/);
  const client = readFileSync(join(root, "client.ts"), "utf8");
  assert.equal(client.includes("SANITY_API_READ_TOKEN"), false);
  assert.equal(/sk_[a-zA-Z0-9]/.test(example), false);
});

test("published article helper rejects draft ids", () => {
  assert.equal(
    isPublishedArticle({
      _id: "drafts.article-vac-tms-bc",
      title: "Draft",
      slug: "how-vac-authorization-for-tms-works-in-british-columbia",
      publishedAt: "2026-09-01",
    }),
    false,
  );
  assert.equal(
    isPublishedArticle({
      _id: "article-vac-tms-bc",
      title: "Published",
      slug: "how-vac-authorization-for-tms-works-in-british-columbia",
      publishedAt: "2026-09-01",
    }),
    true,
  );
});
