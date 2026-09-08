import { NextResponse, type NextRequest } from "next/server";
import { getPayloadClient, isCmsConfigured } from "@/lib/payload/client";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isCmsConfigured()) return NextResponse.json({ error: "CMS is not configured." }, { status: 503 });
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) return NextResponse.json({ error: "Sign in to Payload to manage AI source documents." }, { status: 401 });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Source document id is required." }, { status: 400 });

  try {
    const doc = await payload.delete({
      collection: "ai-source-documents",
      id,
      overrideAccess: true,
    });
    return NextResponse.json({ doc: { id: doc.id } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete source document.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
