import { handleReferralPost } from "@/lib/submit-referral";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleReferralPost(request);
}
