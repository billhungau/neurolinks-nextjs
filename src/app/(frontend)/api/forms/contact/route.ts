import { handleContactPost } from "@/lib/submit-contact";

export const runtime = "nodejs";

export function POST(request: Request) {
  return handleContactPost(request);
}
