import { checkBotId } from "botid/server";
import { handleReferralPost } from "@/lib/submit-referral";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const verification = await checkBotId();

  if (verification.isBot) {
    return Response.json(
      { ok: false, error: "Unable to submit referral." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  return handleReferralPost(request);
}
