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

/** Canonical public origin. Never derived from the request Host header. */
export const PRODUCTION_ORIGIN = "https://neurolinks.ca";
export const PRODUCTION_HOST = "neurolinks.ca";
export const WWW_HOST = "www.neurolinks.ca";

export const ADS_LANDING_PATH = "/neurolinks-psychiatry-nanaimo-bc/";

export const CLOSED_ROBOTS_HEADER = "noindex, nofollow, noarchive";
export const ADS_ROBOTS_HEADER = "noindex, follow";

/**
 * Explicit launch switch. VERCEL_ENV=production is not enough: the
 * `*.vercel.app` production alias can serve the production deployment
 * before neurolinks.ca DNS points here.
 *
 * Set ALLOW_SEARCH_INDEXING=true only after neurolinks.ca (apex) is this app.
 * Never set it on Preview or Development.
 */
export function isSearchIndexable() {
  return process.env.ALLOW_SEARCH_INDEXING === "true";
}

export function hostnameFromHostHeader(host: string | null | undefined): string {
  return (host ?? "").split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? "";
}

/** Apex and www only — not vercel.app, localhost, or preview URLs. */
export function isProductionHostname(host: string | null | undefined): boolean {
  const hostname = hostnameFromHostHeader(host);
  return hostname === PRODUCTION_HOST || hostname === WWW_HOST;
}

export function isPublicProductionIndexing(host?: string | null): boolean {
  return isSearchIndexable() && isProductionHostname(host);
}

export function withTrailingSlash(path: string): string {
  if (!path || path === "/") return "/";
  const pathname = path.startsWith("/") ? path : `/${path}`;
  if (pathname.includes(".")) return pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function isAdsLandingPath(pathname: string): boolean {
  const normalized = withTrailingSlash(pathname.split("?")[0] ?? pathname);
  return normalized === ADS_LANDING_PATH;
}

export function isStudioPath(pathname: string): boolean {
  const normalized = withTrailingSlash(pathname.split("?")[0] ?? pathname);
  return normalized === "/studio/" || normalized.startsWith("/studio/");
}

/** Absolute URL on the designated production origin. */
export function productionUrl(path: string): string {
  const pathname = withTrailingSlash(path);
  return `${PRODUCTION_ORIGIN}${pathname === "/" ? "/" : pathname}`;
}

/**
 * Request origin for CORS and local previews only. Do not use this for
 * canonicals, Open Graph URLs, JSON-LD, or the sitemap.
 */
export function siteOrigin() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

/** @deprecated Use productionUrl() for SEO. Kept for non-SEO absolute links. */
export function absoluteUrl(path: string) {
  return productionUrl(path);
}

export function googleSiteVerification(): string | undefined {
  const value = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  return value || undefined;
}

/**
 * HTTP X-Robots-Tag for this request.
 * Returns null when the app should not send a robots header (indexable
 * production pages use HTML robots only).
 */
export function robotsTagForRequest(host: string | null | undefined, pathname: string): string | null {
  if (!isPublicProductionIndexing(host)) return CLOSED_ROBOTS_HEADER;
  if (isStudioPath(pathname)) return CLOSED_ROBOTS_HEADER;
  if (isAdsLandingPath(pathname)) return ADS_ROBOTS_HEADER;
  return null;
}
