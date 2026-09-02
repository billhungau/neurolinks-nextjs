import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { lookupRedirect } from "@/lib/redirects";
import {
  hostnameFromHostHeader,
  PRODUCTION_ORIGIN,
  robotsTagForRequest,
  withTrailingSlash,
  WWW_HOST,
} from "@/lib/site";

function applyRobots(request: NextRequest, response: NextResponse) {
  const tag = robotsTagForRequest(request.headers.get("host"), request.nextUrl.pathname);
  if (tag) response.headers.set("X-Robots-Tag", tag);
  return response;
}

function preserveSearch(url: URL, search: string) {
  url.search = search;
  return url;
}

/**
 * Page-only trailing slashes, host-aware robots, www → apex, and one-hop
 * legacy redirects. Query strings (UTM and ad click identifiers) are kept.
 *
 * Next's built-in trailingSlash redirect also matches `/_next/image` (no file
 * extension), which 308s the optimizer. skipTrailingSlashRedirect + this proxy
 * keep slashes on public routes only.
 *
 * Do not redirect vercel.app or preview hosts to production.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = hostnameFromHostHeader(request.headers.get("host"));

  if (host === WWW_HOST) {
    const destination = new URL(`${PRODUCTION_ORIGIN}${withTrailingSlash(pathname)}`);
    preserveSearch(destination, search);
    return NextResponse.redirect(destination, 301);
  }

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return applyRobots(request, NextResponse.next());
  }

  const redirectTo = lookupRedirect(pathname) ?? lookupRedirect(withTrailingSlash(pathname));
  if (redirectTo) {
    const destination = new URL(redirectTo, request.nextUrl);
    preserveSearch(destination, search);
    return applyRobots(request, NextResponse.redirect(destination, 301));
  }

  if (pathname !== "/" && !pathname.endsWith("/")) {
    const destination = new URL(`${pathname}/${search}`, request.nextUrl);
    return applyRobots(request, NextResponse.redirect(destination, 308));
  }

  return applyRobots(request, NextResponse.next());
}

export const config = {
  matcher: [
    // Include extensioned files so www → apex also covers PDFs and media.
    "/((?!_next/static|_next/image|_next/data).*)",
  ],
};
