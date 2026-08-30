import type { NextConfig } from "next";

function searchClosed() {
  return process.env.ALLOW_SEARCH_INDEXING !== "true";
}

const nextConfig: NextConfig = {
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  skipProxyUrlNormalize: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    if (!searchClosed()) return [];
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/about-ketamine/",
        destination: "/ketamine-treatment-resistant-depression-nanaimo/",
        permanent: true,
      },
      {
        source: "/about-ketamine-for-drug-resistant-mental-illness/",
        destination: "/ketamine-treatment-resistant-depression-nanaimo/",
        permanent: true,
      },
      {
        source: "/ketamine-treatment-depression-nanaimo/",
        destination: "/ketamine-treatment-resistant-depression-nanaimo/",
        permanent: true,
      },
      {
        source: "/about-psychiatrist-transcranial-magnetic-stimulation/",
        destination: "/psychiatrist-tms-nanaimo/",
        permanent: true,
      },
      {
        source: "/psychiatrist-tms-treatment-nanaimo/",
        destination: "/psychiatrist-tms-nanaimo/",
        permanent: true,
      },
      {
        source: "/services-psychiatric-consultation-tms-treatment/",
        destination: "/services-psychiatric-tms-ketamine-treatment/",
        permanent: true,
      },
      {
        source: "/neurolinks-psychiatry/",
        destination: "/neurolinks-psychiatry-nanaimo-bc/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
