import { checkBotId } from "botid/server";
import { handleContactPost } from "@/lib/submit-contact";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const verification = await checkBotId();

  if (verification.isBot) {
    return Response.json(
      { success: false, message: "Unable to submit form." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  return handleContactPost(request);
}
