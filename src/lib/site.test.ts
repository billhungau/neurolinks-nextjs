import assert from "node:assert/strict";
import test from "node:test";
import {
  ADS_LANDING_PATH,
  CLOSED_ROBOTS_HEADER,
  hostnameFromHostHeader,
  isAdsLandingPath,
  isProductionHostname,
  isPublicProductionIndexing,
  isSearchIndexable,
  PRODUCTION_ORIGIN,
  productionUrl,
  robotsTagForRequest,
} from "./site.ts";

test("production URLs always use the designated origin and trailing slashes", () => {
  assert.equal(PRODUCTION_ORIGIN, "https://neurolinks.ca");
  assert.equal(productionUrl("/"), "https://neurolinks.ca/");
  assert.equal(
    productionUrl("/about-tms-treatment-on-psychiatric-illness"),
    "https://neurolinks.ca/about-tms-treatment-on-psychiatric-illness/",
  );
  assert.equal(
    productionUrl("/documents/physician-referral-form.pdf"),
    "https://neurolinks.ca/documents/physician-referral-form.pdf",
  );
});

test("canonical helper never uses the request host or Vercel URL", () => {
  const previous = {
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };
  process.env.VERCEL_URL = "neurolinks-nextjs.vercel.app";
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.invalid";
  assert.equal(productionUrl("/contact/"), "https://neurolinks.ca/contact/");
  if (previous.VERCEL_URL === undefined) delete process.env.VERCEL_URL;
  else process.env.VERCEL_URL = previous.VERCEL_URL;
  if (previous.NEXT_PUBLIC_SITE_URL === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = previous.NEXT_PUBLIC_SITE_URL;
});

test("VERCEL_ENV=production is not enough to index", () => {
  const previous = process.env.ALLOW_SEARCH_INDEXING;
  delete process.env.ALLOW_SEARCH_INDEXING;
  process.env.VERCEL_ENV = "production";
  assert.equal(isSearchIndexable(), false);
  assert.equal(isPublicProductionIndexing("neurolinks.ca"), false);
  if (previous === undefined) delete process.env.ALLOW_SEARCH_INDEXING;
  else process.env.ALLOW_SEARCH_INDEXING = previous;
});

test("preview and vercel.app hosts stay closed even when the launch flag is on", () => {
  const previous = process.env.ALLOW_SEARCH_INDEXING;
  process.env.ALLOW_SEARCH_INDEXING = "true";
  assert.equal(isProductionHostname("neurolinks-nextjs.vercel.app"), false);
  assert.equal(isProductionHostname("localhost:3000"), false);
  assert.equal(isPublicProductionIndexing("neurolinks-nextjs.vercel.app"), false);
  assert.equal(robotsTagForRequest("neurolinks-nextjs.vercel.app", "/"), CLOSED_ROBOTS_HEADER);
  assert.equal(robotsTagForRequest("localhost:3000", "/contact/"), CLOSED_ROBOTS_HEADER);
  if (previous === undefined) delete process.env.ALLOW_SEARCH_INDEXING;
  else process.env.ALLOW_SEARCH_INDEXING = previous;
});

test("public production pages omit X-Robots-Tag; ads landing is noindex, follow", () => {
  const previous = process.env.ALLOW_SEARCH_INDEXING;
  process.env.ALLOW_SEARCH_INDEXING = "true";
  assert.equal(isPublicProductionIndexing("neurolinks.ca"), true);
  assert.equal(robotsTagForRequest("neurolinks.ca", "/"), null);
  assert.equal(robotsTagForRequest("www.neurolinks.ca", "/contact/"), null);
  assert.equal(robotsTagForRequest("neurolinks.ca", ADS_LANDING_PATH), "noindex, follow");
  assert.equal(robotsTagForRequest("neurolinks.ca", "/neurolinks-psychiatry-nanaimo-bc"), "noindex, follow");
  assert.equal(isAdsLandingPath("/neurolinks-psychiatry-nanaimo-bc"), true);
  if (previous === undefined) delete process.env.ALLOW_SEARCH_INDEXING;
  else process.env.ALLOW_SEARCH_INDEXING = previous;
});

test("host header parsing ignores ports and forwarded lists", () => {
  assert.equal(hostnameFromHostHeader("neurolinks.ca:443"), "neurolinks.ca");
  assert.equal(hostnameFromHostHeader("neurolinks.ca, vercel.app"), "neurolinks.ca");
});
