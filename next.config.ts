import type { NextConfig } from "next";
import { allAppRedirects } from "./src/lib/redirects";
import { ADS_LANDING_PATH, CLOSED_ROBOTS_HEADER, isSearchIndexable } from "./src/lib/site";

const nextConfig: NextConfig = {
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  skipProxyUrlNormalize: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    const adsSources = [ADS_LANDING_PATH, ADS_LANDING_PATH.replace(/\/$/, "")];
    const adsHeaders = adsSources.map((source) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
    }));

    if (isSearchIndexable()) {
      // Production HTML is indexable. Host-based noindex for vercel.app is
      // applied at request time in src/proxy.ts so the production alias cannot
      // inherit public indexing before neurolinks.ca DNS cutover.
      return adsHeaders;
    }

    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: CLOSED_ROBOTS_HEADER }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.neurolinks.ca" }],
        destination: "https://neurolinks.ca/:path*",
        statusCode: 301,
      },
      ...allAppRedirects(),
    ];
  },
};

export default nextConfig;
