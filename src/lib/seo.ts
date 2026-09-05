import type { Metadata } from "next";
import { isSearchIndexable, PRODUCTION_ORIGIN, productionUrl, SITE } from "./site";

export type SeoImage = {
  path: string;
  width: number;
  height: number;
  alt: string;
};

type SeoInput = {
  title: string;
  description?: string;
  path: string;
  image?: SeoImage;
  /** Applied only when public production indexing is enabled. */
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

const openRobots: Metadata["robots"] = {
  index: true,
  follow: true,
};

export const DEFAULT_OG_IMAGE: SeoImage = {
  path: "/media/og/default.jpg",
  width: 1200,
  height: 630,
  alt: "TMS treatment room at NeuroLinks in Nanaimo, BC",
};

export const PAGE_OG_IMAGES = {
  home: {
    path: "/media/og/home.jpg",
    width: 1200,
    height: 630,
    alt: "TMS coil and ketamine vial at NeuroLinks in Nanaimo",
  },
  tms: {
    path: "/media/og/tms.jpg",
    width: 1200,
    height: 630,
    alt: "TMS treatment chair and MagVenture console at NeuroLinks",
  },
  ketamine: {
    path: "/media/og/ketamine.jpg",
    width: 1200,
    height: 630,
    alt: "Ketamine treatment room at NeuroLinks in Nanaimo",
  },
  services: {
    path: "/media/og/services.jpg",
    width: 1200,
    height: 630,
    alt: "NeuroLinks clinic at Brickyard Road, Nanaimo",
  },
  about: {
    path: "/media/og/about.jpg",
    width: 1200,
    height: 630,
    alt: "NeuroLinks clinic interior in Nanaimo, BC",
  },
  contact: {
    path: "/media/og/contact.jpg",
    width: 1200,
    height: 630,
    alt: "NeuroLinks reception at the Brickyard Clinic in Nanaimo",
  },
  referral: {
    path: "/media/og/referral.jpg",
    width: 1200,
    height: 630,
    alt: "NeuroLinks physician referral desk in Nanaimo",
  },
  landing: {
    path: "/media/og/landing.jpg",
    width: 1200,
    height: 630,
    alt: "Clinician preparing TMS equipment at NeuroLinks in Nanaimo",
  },
} as const satisfies Record<string, SeoImage>;

function ogImage(image: SeoImage) {
  return {
    url: image.path.startsWith("http") ? image.path : productionUrl(image.path),
    width: image.width,
    height: image.height,
    alt: image.alt,
    type: image.path.includes(".png") ? ("image/png" as const) : ("image/jpeg" as const),
  };
}

export function pageRobots(override?: Metadata["robots"]): Metadata["robots"] {
  if (!isSearchIndexable()) return closedRobots;
  return override ?? openRobots;
}

export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  robots,
}: SeoInput): Metadata {
  const url = productionUrl(path);
  const desc = description || SITE.tagline;
  const shareImage = ogImage(image);
  return {
    metadataBase: new URL(PRODUCTION_ORIGIN),
    title: { absolute: title },
    description: desc,
    alternates: { canonical: url },
    robots: pageRobots(robots),
    openGraph: {
      title,
      description: desc,
      url,
      siteName: SITE.name,
      locale: "en_CA",
      type: "website",
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [shareImage.url],
    },
  };
}

export const adsLandingRobots: Metadata["robots"] = {
  index: false,
  follow: true,
};
