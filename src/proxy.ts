import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Page-only trailing slashes. Next's built-in trailingSlash redirect also
 * matches `/_next/image` (no file extension), which 308s the optimizer.
 * skipTrailingSlashRedirect + this proxy keep slashes on public routes only.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (pathname !== "/" && !pathname.endsWith("/")) {
    return NextResponse.redirect(
      new URL(`${pathname}/${request.nextUrl.search}`, request.nextUrl),
      308,
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
