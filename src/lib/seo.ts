import type { Metadata } from "next";
import { absoluteUrl, isSearchIndexable, SITE } from "./site";

type SeoInput = {
  title: string;
  description?: string;
  path: string;
  robots?: Metadata["robots"];
};

const closedRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export function pageMetadata({
  title,
  description,
  path,
  robots,
}: SeoInput): Metadata {
  const url = absoluteUrl(path);
  const desc = description || SITE.tagline;
  return {
    title: { absolute: title },
    description: desc,
    alternates: { canonical: url },
    robots: robots ?? (isSearchIndexable() ? { index: true, follow: true } : closedRobots),
    openGraph: {
      title,
      description: desc,
      url,
      siteName: SITE.name,
      locale: "en_CA",
      type: "website",
    },
  };
}
