import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { INSIGHTS_PATH, insightsArticlePath } from "@/lib/insights";

/** Leaves preview and returns to the published version of the same article. */
export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();

  const slug = request.nextUrl.searchParams.get("slug");
  const destination = slug ? insightsArticlePath(slug) : INSIGHTS_PATH;
  return NextResponse.redirect(new URL(destination, request.nextUrl.origin));
}
