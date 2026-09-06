import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { insightsArticlePath } from "@/lib/insights";
import { getPayloadClient, isCmsConfigured } from "@/lib/payload/client";
import { isValidPreviewToken } from "@/payload/preview";

/**
 * Turns on Next.js draft mode for a signed-in CMS editor.
 *
 * Two independent gates: the link carries an HMAC of the slug, and the
 * request must present a valid Payload session. An anonymous visitor cannot
 * enable draft mode even with the exact link, so unpublished articles stay
 * private.
 */
export async function GET(request: NextRequest) {
  if (!isCmsConfigured()) {
    return NextResponse.json({ ok: false, error: "CMS is not configured" }, { status: 503 });
  }

  const slug = request.nextUrl.searchParams.get("slug");
  const token = request.nextUrl.searchParams.get("token");
  if (!slug || !isValidPreviewToken(slug, token)) {
    return NextResponse.json({ ok: false, error: "Invalid preview link" }, { status: 401 });
  }

  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.nextUrl.origin));
  }

  const found = await payload.find({
    collection: "insights",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: false,
    user,
  });
  const article = found.docs[0] as { slug?: string } | undefined;
  if (!article?.slug) {
    return NextResponse.json({ ok: false, error: "Article not found" }, { status: 404 });
  }

  const draft = await draftMode();
  draft.enable();

  // Redirect using the slug from the database, never the query string.
  return NextResponse.redirect(
    new URL(insightsArticlePath(article.slug), request.nextUrl.origin),
  );
}
