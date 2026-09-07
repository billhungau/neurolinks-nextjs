import { NextResponse, type NextRequest } from "next/server";
import { parseAssistantRequest } from "@/ai/schemas";
import { runArticleAI, type ArticleSourceFile } from "@/ai/provider";
import { getPayloadClient, isCmsConfigured } from "@/lib/payload/client";
import { siteOrigin } from "@/lib/site";

export const runtime = "nodejs";
export const maxDuration = 240;

const MAX_FILES = 10;
const MAX_TOTAL_SOURCE_BYTES = 40 * 1024 * 1024;

type TemporarySourceDocument = {
  id: string | number;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
};

type TemporarySourcePayload = {
  find: (args: Record<string, unknown>) => Promise<{ docs: TemporarySourceDocument[] }>;
};

async function loadSessionFiles(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  sessionId: string,
): Promise<ArticleSourceFile[]> {
  // Payload's generated collection union is committed separately from the config.
  // Keep this narrow adapter at the boundary so preview builds do not depend on
  // regenerating types against a database just to read the temporary collection.
  const sourcePayload = payload as unknown as TemporarySourcePayload;
  const found = await sourcePayload.find({
    collection: "ai-source-documents",
    depth: 0,
    limit: MAX_FILES,
    overrideAccess: true,
    sort: "createdAt",
    where: { sessionId: { equals: sessionId } },
  });

  let totalBytes = 0;
  const files: ArticleSourceFile[] = [];
  for (const doc of found.docs) {
    const url = typeof doc.url === "string" ? doc.url : "";
    const filename = typeof doc.filename === "string" ? doc.filename : "source-document";
    const mimeType = typeof doc.mimeType === "string" ? doc.mimeType : "application/octet-stream";
    if (!url) continue;

    const sourceUrl = url.startsWith("http://") || url.startsWith("https://") ? url : new URL(url, siteOrigin()).toString();
    const response = await fetch(sourceUrl, { cache: "no-store" });
    if (!response.ok) {
      console.error("[ai-article-assistant] could not read temporary source", response.status, filename);
      throw new Error("AI_SOURCE_READ_ERROR");
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    totalBytes += bytes.length;
    if (totalBytes > MAX_TOTAL_SOURCE_BYTES) throw new Error("AI_SOURCES_TOO_LARGE");
    files.push({ filename, mimeType, base64: bytes.toString("base64") });
  }
  return files;
}

export async function POST(request: NextRequest) {
  if (!isCmsConfigured()) return NextResponse.json({ error: "CMS is not configured." }, { status: 503 });

  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) return NextResponse.json({ error: "Sign in to Payload to use the AI Article Assistant." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const sourceSession = typeof body.sourceSession === "string" ? body.sourceSession.trim().slice(0, 100) : "";
  let files: ArticleSourceFile[] = [];
  try {
    if (sourceSession) {
      files = await loadSessionFiles(payload, sourceSession);
      body.sourceFileNames = files.map((file) => file.filename);
    }
  } catch (error) {
    const code = error instanceof Error ? error.message : "AI_SOURCE_READ_ERROR";
    if (code === "AI_SOURCES_TOO_LARGE") return NextResponse.json({ error: "The attached source files are too large to process together. Remove one or more files and try again." }, { status: 413 });
    return NextResponse.json({ error: "One or more temporary source files could not be read. Remove the affected file and upload it again." }, { status: 502 });
  }

  const parsed = parseAssistantRequest(body);
  if (!parsed) return NextResponse.json({ error: "Please provide the required article information." }, { status: 400 });

  try {
    const result = await runArticleAI(parsed, files);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const code = error instanceof Error ? error.message : "AI_PROVIDER_ERROR";
    if (code === "AI_NOT_CONFIGURED") return NextResponse.json({ error: "AI Article Assistant is not configured. Add OPENAI_API_KEY on Vercel." }, { status: 503 });
    if (code === "AI_TIMEOUT") return NextResponse.json({ error: "AI generation timed out. Your article was not changed." }, { status: 504 });
    if (code === "AI_INVALID_OUTPUT") return NextResponse.json({ error: "The AI returned an invalid article response. Your article was not changed; please try again." }, { status: 502 });
    console.error("[ai-article-assistant] generation failed", error);
    return NextResponse.json({ error: "AI generation could not be completed. Your existing article has not been changed." }, { status: 502 });
  }
}
