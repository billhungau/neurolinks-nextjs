import type { NextConfig } from "next";
import { allAppRedirects } from "./src/lib/redirects";
import { ADS_LANDING_PATH, CLOSED_ROBOTS_HEADER, isSearchIndexable } from "./src/lib/site";

const nextConfig: NextConfig = {
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  skipProxyUrlNormalize: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async headers() {
    const adsSources = [ADS_LANDING_PATH, ADS_LANDING_PATH.replace(/\/$/, "")];
    const adsHeaders = adsSources.map((source) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
    }));
    const studioHeaders = [
      {
        source: "/studio",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/studio/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];

    if (isSearchIndexable()) {
      // Production HTML is indexable. Host-based noindex for vercel.app is
      // applied at request time in src/proxy.ts so the production alias cannot
      // inherit public indexing before neurolinks.ca DNS cutover.
      return [...adsHeaders, ...studioHeaders];
    }

    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: CLOSED_ROBOTS_HEADER }],
      },
    ];
  },
  async redirects() {
    // www → apex is handled in src/proxy.ts so trailing slashes and query
    // strings are preserved in a single 301. A next.config `/:path*` rule
    // strips the trailing slash and forces a second hop.
    return allAppRedirects();
  },
};

export default nextConfig;
