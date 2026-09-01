export const SITE = {
  name: "Neurolinks Clinic | TMS & Ketamine treatments",
  shortName: "NeuroLinks",
  tagline: "TMS & Ketamine Treatments in BC, Canada",
  phone: "250-739-5530",
  phoneHref: "tel:2507395530",
  // Voice and fax use the same clinic number in every migrated source.
  fax: "250-739-5530",
  faxHref: "tel:2507395530",
  email: "contact@neurolinks.ca",
  addressLine: "202-6010 Brickyard Road (Brickyard Clinic), Nanaimo, BC V9V 1S5",
  mapsUrl: "https://maps.app.goo.gl/3JkQg4FfxhYx9Aaf6",
  /** Same Google Place listing used for maps. */
  googleListingUrl: "https://maps.app.goo.gl/3JkQg4FfxhYx9Aaf6",
  /** Verified Google profile used for curated homepage review excerpts. */
  googleReviewsUrl: "https://share.google/zhQv4Wd5lcK4LFLeJ",
  facebook: "https://facebook.com/neurolinks.tms",
  instagram: "https://www.instagram.com/neurolinks.tms/",
  logo: "/media/images/New-Logo.png",
  logoWhite: "/media/images/New-Logo-white.png",
} as const;

/** Search indexing is off unless explicitly enabled (never on Vercel preview). */
export function isSearchIndexable() {
  return process.env.ALLOW_SEARCH_INDEXING === "true";
}

export function siteOrigin() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export function absoluteUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${siteOrigin()}${p.endsWith("/") || p === "/" ? p : `${p}/`}`;
}
