import { NextResponse, type NextRequest } from "next/server";
import { parseAssistantRequest } from "@/ai/schemas";
import { runArticleAI } from "@/ai/provider";
import { getPayloadClient, isCmsConfigured } from "@/lib/payload/client";

export const runtime = "nodejs";
// Long-form structured generation can exceed one minute. Vercel supports
// per-route maxDuration for App Router functions; keep this below the provider
// abort window plus response overhead.
export const maxDuration = 240;

export async function POST(request: NextRequest) {
  if (!isCmsConfigured()) return NextResponse.json({ error: "CMS is not configured." }, { status: 503 });
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 50_000) return NextResponse.json({ error: "Article content is too large for this assistant." }, { status: 413 });

  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) return NextResponse.json({ error: "Sign in to Payload to use the AI Article Assistant." }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = parseAssistantRequest(body);
  if (!parsed) return NextResponse.json({ error: "Please provide the required article information." }, { status: 400 });

  try {
    const result = await runArticleAI(parsed);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const code = error instanceof Error ? error.message : "AI_PROVIDER_ERROR";
    if (code === "AI_NOT_CONFIGURED") return NextResponse.json({ error: "AI Article Assistant is not configured. Add OPENAI_API_KEY on Vercel." }, { status: 503 });
    if (code === "AI_TIMEOUT") return NextResponse.json({ error: "AI generation timed out. Your article was not changed." }, { status: 504 });
    console.error("[ai-article-assistant] generation failed", error);
    return NextResponse.json({ error: "AI generation could not be completed. Your existing article has not been changed." }, { status: 502 });
  }
}
