import assert from "node:assert/strict";
import test from "node:test";
import {
  ADS_LANDING_PATH,
  CLOSED_ROBOTS_HEADER,
  cmsTrustedOrigins,
  hostnameFromHostHeader,
  isAdsLandingPath,
  isProductionDeployment,
  isProductionHostname,
  isPublicProductionIndexing,
  isSearchIndexable,
  PRODUCTION_ORIGIN,
  productionUrl,
  relativizeToSite,
  robotsTagForRequest,
  siteOrigin,
} from "./site.ts";

const URL_VARS = [
  "ALLOW_SEARCH_INDEXING",
  "NEXT_PUBLIC_SITE_URL",
  "PORT",
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
] as const;

/**
 * Indexing and origin resolution are environment-driven, so each case runs
 * against an explicit environment rather than whatever leaked in from another
 * test file or the developer's shell.
 */
function withEnv(values: Partial<Record<(typeof URL_VARS)[number], string>>, run: () => void) {
  const previous = new Map(URL_VARS.map((name) => [name, process.env[name]]));
  for (const name of URL_VARS) delete process.env[name];
  for (const [name, value] of Object.entries(values)) process.env[name] = value;
  try {
    run();
  } finally {
    for (const name of URL_VARS) {
      const value = previous.get(name);
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

const STAGING = "https://neurolinks-nextjs.vercel.app";

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

test("canonical helper never uses the request host, site URL, or Vercel URL", () => {
  withEnv({ VERCEL_URL: "neurolinks-nextjs.vercel.app", NEXT_PUBLIC_SITE_URL: STAGING }, () => {
    assert.equal(productionUrl("/contact/"), "https://neurolinks.ca/contact/");
    assert.equal(productionUrl("/insights/tms-basics/"), "https://neurolinks.ca/insights/tms-basics/");
  });
});

test("site origin prefers NEXT_PUBLIC_SITE_URL, then VERCEL_URL, then localhost", () => {
  withEnv({ NEXT_PUBLIC_SITE_URL: `${STAGING}/`, VERCEL_URL: "branch-abc.vercel.app" }, () => {
    assert.equal(siteOrigin(), STAGING);
  });
  withEnv({ VERCEL_URL: "branch-abc.vercel.app" }, () => {
    assert.equal(siteOrigin(), "https://branch-abc.vercel.app");
  });
  withEnv({}, () => {
    assert.equal(siteOrigin(), "http://localhost:3000");
  });
  withEnv({ PORT: "3010" }, () => {
    assert.equal(siteOrigin(), "http://localhost:3010");
  });
});

test("only a site URL on the production domain counts as a production deployment", () => {
  withEnv({ NEXT_PUBLIC_SITE_URL: STAGING }, () => {
    assert.equal(isProductionDeployment(), false);
  });
  withEnv({}, () => {
    assert.equal(isProductionDeployment(), false);
  });
  withEnv({ NEXT_PUBLIC_SITE_URL: "https://neurolinks.ca" }, () => {
    assert.equal(isProductionDeployment(), true);
  });
  withEnv({ NEXT_PUBLIC_SITE_URL: "https://www.neurolinks.ca" }, () => {
    assert.equal(isProductionDeployment(), true);
  });
});

test("VERCEL_ENV=production is not enough to index", () => {
  withEnv({ VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://neurolinks.ca" }, () => {
    assert.equal(isSearchIndexable(), false);
    assert.equal(isPublicProductionIndexing("neurolinks.ca"), false);
  });
});

test("the launch flag alone cannot index the staging deployment", () => {
  withEnv({ ALLOW_SEARCH_INDEXING: "true", NEXT_PUBLIC_SITE_URL: STAGING }, () => {
    assert.equal(isSearchIndexable(), false);
    assert.equal(isPublicProductionIndexing("neurolinks.ca"), false);
    assert.equal(robotsTagForRequest("neurolinks-nextjs.vercel.app", "/"), CLOSED_ROBOTS_HEADER);
    assert.equal(robotsTagForRequest("neurolinks.ca", "/insights/"), CLOSED_ROBOTS_HEADER);
  });
  withEnv({ ALLOW_SEARCH_INDEXING: "true", VERCEL_URL: "neurolinks-nextjs.vercel.app" }, () => {
    assert.equal(isSearchIndexable(), false);
  });
});

test("preview and vercel.app hosts stay closed even when the launch config is on", () => {
  withEnv({ ALLOW_SEARCH_INDEXING: "true", NEXT_PUBLIC_SITE_URL: "https://neurolinks.ca" }, () => {
    assert.equal(isProductionHostname("neurolinks-nextjs.vercel.app"), false);
    assert.equal(isProductionHostname("localhost:3000"), false);
    assert.equal(isPublicProductionIndexing("neurolinks-nextjs.vercel.app"), false);
    assert.equal(robotsTagForRequest("neurolinks-nextjs.vercel.app", "/"), CLOSED_ROBOTS_HEADER);
    assert.equal(robotsTagForRequest("localhost:3000", "/contact/"), CLOSED_ROBOTS_HEADER);
  });
});

test("public production pages omit X-Robots-Tag; ads landing is noindex, follow", () => {
  withEnv({ ALLOW_SEARCH_INDEXING: "true", NEXT_PUBLIC_SITE_URL: "https://neurolinks.ca" }, () => {
    assert.equal(isPublicProductionIndexing("neurolinks.ca"), true);
    assert.equal(robotsTagForRequest("neurolinks.ca", "/"), null);
    assert.equal(robotsTagForRequest("www.neurolinks.ca", "/contact/"), null);
    assert.equal(robotsTagForRequest("neurolinks.ca", ADS_LANDING_PATH), "noindex, follow");
    assert.equal(
      robotsTagForRequest("neurolinks.ca", "/neurolinks-psychiatry-nanaimo-bc"),
      "noindex, follow",
    );
    assert.equal(isAdsLandingPath("/neurolinks-psychiatry-nanaimo-bc"), true);
    assert.equal(robotsTagForRequest("neurolinks.ca", "/admin/"), CLOSED_ROBOTS_HEADER);
    assert.equal(robotsTagForRequest("neurolinks.ca", "/admin"), CLOSED_ROBOTS_HEADER);
    assert.equal(
      robotsTagForRequest("neurolinks.ca", "/admin/collections/insights"),
      CLOSED_ROBOTS_HEADER,
    );
    assert.equal(
      robotsTagForRequest("neurolinks.ca", "/payload-api/insights"),
      CLOSED_ROBOTS_HEADER,
    );
  });
});

test("CMS session origins cover the site URL, this deployment, and the production domains", () => {
  withEnv(
    {
      VERCEL: "1",
      NEXT_PUBLIC_SITE_URL: STAGING,
      VERCEL_URL: "neurolinks-nextjs-git-branch.vercel.app",
      VERCEL_PROJECT_PRODUCTION_URL: "neurolinks-nextjs.vercel.app",
    },
    () => {
      const origins = cmsTrustedOrigins();
      // Signing in on the stable staging alias, on a branch deployment, and on
      // neurolinks.ca after cutover all have to keep working.
      assert.ok(origins.includes(STAGING));
      assert.ok(origins.includes("https://neurolinks-nextjs-git-branch.vercel.app"));
      assert.ok(origins.includes("https://neurolinks.ca"));
      assert.ok(origins.includes("https://www.neurolinks.ca"));
      // An unrelated site must not be able to use a CMS session cookie.
      assert.ok(!origins.includes("https://evil.example"));
      // Deployed environments do not trust local origins.
      assert.ok(!origins.some((origin) => origin.includes("localhost")));
      assert.equal(new Set(origins).size, origins.length);
    },
  );
});

test("CMS session origins include local dev origins when not on Vercel", () => {
  withEnv({ PORT: "3010" }, () => {
    const origins = cmsTrustedOrigins();
    assert.ok(origins.includes("http://localhost:3010"));
    assert.ok(origins.includes("http://127.0.0.1:3010"));
    assert.ok(origins.includes("http://localhost:3000"));
  });
});

test("media URLs on this deployment are served back as paths", () => {
  withEnv({ NEXT_PUBLIC_SITE_URL: STAGING }, () => {
    // Payload stamps serverURL onto locally stored uploads; next/image should
    // not need this deployment's hostname in remotePatterns.
    assert.equal(
      relativizeToSite(`${STAGING}/payload-api/media/file/brain.jpg`),
      "/payload-api/media/file/brain.jpg",
    );
    // Vercel Blob and other external hosts pass through untouched.
    assert.equal(
      relativizeToSite("https://abc123.public.blob.vercel-storage.com/brain.jpg"),
      "https://abc123.public.blob.vercel-storage.com/brain.jpg",
    );
    assert.equal(relativizeToSite("/payload-api/media/file/brain.jpg"), "/payload-api/media/file/brain.jpg");
    assert.equal(relativizeToSite("not a url"), "not a url");
  });
});

test("host header parsing ignores ports and forwarded lists", () => {
  assert.equal(hostnameFromHostHeader("neurolinks.ca:443"), "neurolinks.ca");
  assert.equal(hostnameFromHostHeader("neurolinks.ca, vercel.app"), "neurolinks.ca");
});
