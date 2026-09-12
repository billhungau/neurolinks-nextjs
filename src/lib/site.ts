export const SITE = {
  name: "NeuroLinks Clinic",
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

/**
 * Payload CMS mount points. The REST surface is deliberately not `/api` so it
 * cannot shadow the existing `/api/forms/*` handlers.
 */
export const CMS_ADMIN_PATH = "/admin/";
export const CMS_API_PATH = "/payload-api";

export const CLOSED_ROBOTS_HEADER = "noindex, nofollow, noarchive";
export const ADS_ROBOTS_HEADER = "noindex, follow";

/**
 * Where this deployment actually answers requests.
 *
 * Staging, production and localhost all differ, so this is read from the
 * environment. It is the single source of truth for absolute URLs that have to
 * reach *this* app: Payload's `serverURL`, the CMS session-cookie allowlist and
 * preview links.
 *
 * It is deliberately not the canonical SEO origin. Canonicals, Open Graph
 * URLs, JSON-LD and the sitemap always use PRODUCTION_ORIGIN, so a staging
 * deployment never advertises itself as the public site.
 */
export function siteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (explicit) return explicit;
  const deployment = process.env.VERCEL_URL?.trim().replace(/\/+$/, "");
  if (deployment) return `https://${deployment}`;
  return `http://localhost:${process.env.PORT || "3000"}`;
}

/** True only when this deployment is configured to serve neurolinks.ca itself. */
export function isProductionDeployment(): boolean {
  try {
    return isProductionHostname(new URL(siteOrigin()).hostname);
  } catch {
    return false;
  }
}

/**
 * Explicit launch switch, with a second gate so a staging deployment cannot be
 * indexed by accident.
 *
 * ALLOW_SEARCH_INDEXING on its own is not enough. VERCEL_ENV=production is
 * already true for the `*.vercel.app` alias long before neurolinks.ca DNS
 * points here, and the flag itself can be copied into the wrong project.
 * Indexing therefore also requires NEXT_PUBLIC_SITE_URL to name the production
 * domain, which a staging deployment never does.
 *
 * At cutover, set both NEXT_PUBLIC_SITE_URL=https://neurolinks.ca and
 * ALLOW_SEARCH_INDEXING=true, on Production only.
 */
export function isSearchIndexable() {
  return process.env.ALLOW_SEARCH_INDEXING === "true" && isProductionDeployment();
}

/**
 * Origins allowed to present a CMS session cookie.
 *
 * Payload ignores the cookie when a request carries an `Origin` outside this
 * list, so it has to contain every origin the admin is genuinely browsed from:
 * the configured site URL, this particular Vercel deployment (branch previews
 * get their own hostname), the production domains for after cutover, and the
 * local dev origins. Leaving it empty would switch the check off altogether.
 */
export function cmsTrustedOrigins(): string[] {
  const origins = new Set<string>([siteOrigin(), PRODUCTION_ORIGIN, `https://${WWW_HOST}`]);

  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) {
    const trimmed = host?.trim().replace(/\/+$/, "");
    if (trimmed) origins.add(`https://${trimmed}`);
  }

  if (!process.env.VERCEL) {
    for (const port of new Set(["3000", process.env.PORT || "3000"])) {
      origins.add(`http://localhost:${port}`);
      origins.add(`http://127.0.0.1:${port}`);
    }
  }

  return [...origins];
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

/** Payload admin UI and its REST surface. Never indexable, on any host. */
export function isCmsPath(pathname: string): boolean {
  const normalized = withTrailingSlash(pathname.split("?")[0] ?? pathname);
  return (
    normalized === CMS_ADMIN_PATH ||
    normalized.startsWith(CMS_ADMIN_PATH) ||
    normalized.startsWith(`${CMS_API_PATH}/`)
  );
}

/** Absolute URL on the designated production origin. */
export function productionUrl(path: string): string {
  const pathname = withTrailingSlash(path);
  return `${PRODUCTION_ORIGIN}${pathname === "/" ? "/" : pathname}`;
}

/**
 * Strips this deployment's own origin off an absolute URL.
 *
 * Payload stamps `serverURL` onto locally stored upload URLs, which would make
 * the same media row render a different absolute host per environment and would
 * force every deployment hostname into `images.remotePatterns`. Same-origin
 * media is served back as a path; Vercel Blob and other external URLs are left
 * untouched.
 */
export function relativizeToSite(url: string): string {
  if (!url.startsWith("http")) return url;
  try {
    const parsed = new URL(url);
    if (parsed.origin !== new URL(siteOrigin()).origin) return url;
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
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
  if (isCmsPath(pathname)) return CLOSED_ROBOTS_HEADER;
  if (isAdsLandingPath(pathname)) return ADS_ROBOTS_HEADER;
  return null;
}
