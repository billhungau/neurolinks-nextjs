import { draftMode } from "next/headers";
import type { NextRequest } from "next/server";
import { INSIGHTS_PATH, insightsArticlePath } from "@/lib/insights";
import { sameHostRedirect } from "@/lib/same-host-redirect";

/** Leaves preview and returns to the published version of the same article. */
export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();

  const slug = request.nextUrl.searchParams.get("slug");
  return sameHostRedirect(slug ? insightsArticlePath(slug) : INSIGHTS_PATH);
}
